'use server'

import { createClient, createAdminClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { emailFilter } from '@/lib/utils/email-filter'

// ─────────────────────────────────────────────
// AUTH
// ─────────────────────────────────────────────

export async function signOutAction() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/login')
}

// ─────────────────────────────────────────────
// MEMBER PROFILE
// ─────────────────────────────────────────────

export async function getMemberProfile() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const adminClient = createAdminClient()
  const { data, error } = await adminClient
    .from('members')
    .select('id, name, email, regular_email, role, status, domain_ids, photo_url, student_id, register_no, phone, card_serial')
    .or(emailFilter(user.email))
    .single()

  if (error) {
    if (error.code !== 'PGRST116') console.error('Error fetching member:', error)
    return null
  }
  return data
}

// ─────────────────────────────────────────────
// SESSIONS
// ─────────────────────────────────────────────

/** Fix: compare date column (date string) to today's date string, not full ISO datetime.
 *  Old: .gte('date', new Date().toISOString()) → drops today's sessions after 05:30 IST (UTC midnight)
 *  New: .gte('date', '2026-10-02') → never drops same-day sessions */
export async function getUpcomingSessions() {
  const adminClient = createAdminClient()
  const todayDate = new Date().toISOString().slice(0, 10) // 'YYYY-MM-DD'
  const { data, error } = await adminClient
    .from('sessions')
    .select('*')
    .eq('status', 'open')
    .gte('date', todayDate)
    .order('date', { ascending: true })

  if (error) {
    console.error('Error fetching sessions:', error)
    return []
  }
  return data
}

export async function getAllSessions() {
  const adminClient = createAdminClient()
  const { data, error } = await adminClient
    .from('sessions')
    .select('*')
    .order('date', { ascending: false })
  if (error) return []
  return data
}

export async function createSession(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user?.email) throw new Error('Unauthorized')

  const title = formData.get('title') as string
  const type = formData.get('type') as string
  const date = formData.get('date') as string
  const start_time = formData.get('start_time') as string
  const end_time = formData.get('end_time') as string | null
  const scope = formData.get('scope') as string
  const late_threshold = formData.get('late_threshold_minutes') as string | null
  const target_domain_ids = formData.getAll('target_domain_ids') as string[]

  const adminClient = createAdminClient()
  const { data: member, error: memberErr } = await adminClient
    .from('members')
    .select('id, role')
    .or(emailFilter(user.email))
    .single()

  if (memberErr || !member) throw new Error('Member not found for user ' + user.email)

  const { data, error } = await adminClient
    .from('sessions')
    .insert({
      title, type, date,
      start_time: new Date(`${date}T${start_time}:00`).toISOString(),
      end_time: end_time ? new Date(`${date}T${end_time}:00`).toISOString() : null,
      scope,
      target_domain_ids: target_domain_ids.length > 0 ? target_domain_ids : [],
      late_threshold_minutes: late_threshold ? parseInt(late_threshold, 10) : null,
      created_by: member.id,
      status: 'open'
    })
    .select()

  if (error) { console.error('Session creation error:', error); throw error }

  revalidatePath('/admin/sessions')
  revalidatePath('/dashboard')
  revalidatePath('/sessions')
  return data[0]
}

/** Returns a session + its scoped eligible member roster + all existing attendance records.
 *  Used by the Take Attendance page to hydrate on load. */
export async function getSessionWithRoster(sessionId: string) {
  const adminClient = createAdminClient()

  // 1. Fetch session
  const { data: session, error: sessionErr } = await adminClient
    .from('sessions')
    .select('*')
    .eq('id', sessionId)
    .single()

  if (sessionErr || !session) return null

  // 2. Fetch eligible members scoped by session
  let membersQuery = adminClient
    .from('members')
    .select('id, name, student_id, register_no, photo_url, domain_ids, card_serial')
    .eq('status', 'active')
    .order('name', { ascending: true })

  if (session.scope === 'domain_specific' && session.target_domain_ids?.length > 0) {
    membersQuery = membersQuery.overlaps('domain_ids', session.target_domain_ids)
  }

  const { data: members = [] } = await membersQuery

  // 3. Fetch existing attendance records for this session
  const { data: attendance = [] } = await adminClient
    .from('attendance')
    .select('id, member_id, status, method, timestamp')
    .eq('session_id', sessionId)

  return { session, members, attendance }
}

// ─────────────────────────────────────────────
// ATTENDANCE
// ─────────────────────────────────────────────

/** Fix: checks session is still open before writing. Returns a typed reason on failure. */
export async function markAttendance(
  sessionId: string,
  memberId: string,
  status: string,
  method: 'nfc' | 'manual'
): Promise<{ success: boolean; reason?: string }> {
  const adminClient = createAdminClient()

  // Guard: session must be open
  const { data: session } = await adminClient
    .from('sessions')
    .select('status, scope, target_domain_ids')
    .eq('id', sessionId)
    .single()

  if (!session || session.status !== 'open') {
    return { success: false, reason: 'session_closed' }
  }

  // Guard: member must be eligible for the session
  if (session.scope === 'domain_specific') {
    const { data: targetMember } = await adminClient
      .from('members')
      .select('domain_ids')
      .eq('id', memberId)
      .single()
    
    if (!targetMember) return { success: false, reason: 'unregistered' }
    
    const isEligible = (targetMember.domain_ids || []).some((d: string) => 
      (session.target_domain_ids || []).includes(d)
    )
    if (!isEligible) return { success: false, reason: 'unregistered' } // Treat as not in roster
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  let adminId: string | null = null
  if (user?.email) {
    const { data: admin } = await adminClient
      .from('members')
      .select('id')
      .or(emailFilter(user.email))
      .single()
    adminId = admin?.id ?? null
  }

  // Don't use upsert to avoid overwriting timestamp
  const { data: existing } = await adminClient
    .from('attendance')
    .select('id')
    .eq('session_id', sessionId)
    .eq('member_id', memberId)
    .maybeSingle()

  if (existing) {
    const { error } = await adminClient
      .from('attendance')
      .update({ status, method, marked_by: adminId })
      .eq('id', existing.id)
    if (error) {
      console.error('Error updating attendance:', error)
      return { success: false, reason: 'db_error' }
    }
  } else {
    const { error } = await adminClient
      .from('attendance')
      .insert({
        session_id: sessionId,
        member_id: memberId,
        status,
        method,
        marked_by: adminId,
        timestamp: new Date().toISOString()
      })
    if (error) {
      console.error('Error inserting attendance:', error)
      return { success: false, reason: 'db_error' }
    }
  }

  revalidatePath(`/admin/sessions/${sessionId}/attendance`)
  return { success: true }
}

/** Member self-check-in: verifies the scanned card belongs to expectedMemberId before marking.
 *  Prevents a member from tapping another person's card on the self-check-in screen. */
export async function selfCheckIn(
  sessionId: string,
  cardSerial: string
): Promise<
  | { outcome: 'marked' }
  | { outcome: 'already_marked' }
  | { outcome: 'session_closed' }
  | { outcome: 'not_your_card' }
  | { outcome: 'unregistered' }
> {
  const adminClient = createAdminClient()
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user?.email) return { outcome: 'unregistered' }

  const { data: loggedInMember } = await adminClient
    .from('members')
    .select('id')
    .or(emailFilter(user.email))
    .single()
  
  if (!loggedInMember) return { outcome: 'unregistered' }
  const expectedMemberId = loggedInMember.id

  // 1. Session open?
  const { data: session } = await adminClient
    .from('sessions')
    .select('status')
    .eq('id', sessionId)
    .single()
  if (!session || session.status !== 'open') return { outcome: 'session_closed' }

  // 2. Card registered?
  const { data: cardMember } = await adminClient
    .from('members')
    .select('id')
    .eq('card_serial', cardSerial)
    .maybeSingle()
  if (!cardMember) return { outcome: 'unregistered' }

  // 3. Card must belong to the logged-in member
  if (cardMember.id !== expectedMemberId) return { outcome: 'not_your_card' }

  // 4. Already marked?
  const { data: existing } = await adminClient
    .from('attendance')
    .select('id')
    .eq('session_id', sessionId)
    .eq('member_id', expectedMemberId)
    .maybeSingle()
  if (existing) return { outcome: 'already_marked' }

  // 5. Mark present
  const result = await markAttendance(sessionId, expectedMemberId, 'present', 'nfc')
  return result.success ? { outcome: 'marked' } : { outcome: 'session_closed' }
}

/** Fix: returns a discriminated union with 5 outcomes instead of binary success/error. */
export async function handleNfcScan(sessionId: string, cardSerial: string): Promise<
  | { outcome: 'marked'; memberName: string; memberId: string }
  | { outcome: 'already_marked'; memberName: string; memberId: string }
  | { outcome: 'session_closed' }
  | { outcome: 'unregistered' }
> {
  const adminClient = createAdminClient()

  // 1. Session open?
  const { data: session } = await adminClient
    .from('sessions')
    .select('status')
    .eq('id', sessionId)
    .single()

  if (!session || session.status !== 'open') return { outcome: 'session_closed' }

  // 2. Card registered?
  const { data: member } = await adminClient
    .from('members')
    .select('id, name')
    .eq('card_serial', cardSerial)
    .single()

  if (!member) return { outcome: 'unregistered' }

  // 3. Already marked?
  const { data: existing } = await adminClient
    .from('attendance')
    .select('id')
    .eq('session_id', sessionId)
    .eq('member_id', member.id)
    .maybeSingle()

  if (existing) return { outcome: 'already_marked', memberName: member.name, memberId: member.id }

  // 4. Mark present
  const result = await markAttendance(sessionId, member.id, 'present', 'nfc')
  if (result.success) return { outcome: 'marked', memberName: member.name, memberId: member.id }

  // session_closed is the only other failure markAttendance can return now
  return { outcome: 'session_closed' }
}

// ─────────────────────────────────────────────
// MEMBER MANAGEMENT
// ─────────────────────────────────────────────

export async function getAllMembers() {
  const adminClient = createAdminClient()
  const { data, error } = await adminClient
    .from('members')
    .select('id, name, student_id, register_no, role, status, domain_ids, photo_url, card_serial, email, regular_email')
    .order('name', { ascending: true })
  if (error) return []
  return data
}

export async function createMember(formData: FormData) {
  const adminClient = createAdminClient()
  const name = formData.get('name') as string
  const student_id = formData.get('student_id') as string
  const register_no = formData.get('register_no') as string
  const email = formData.get('email') as string
  const regular_email = formData.get('regular_email') as string
  const role = formData.get('role') as string
  const domain_ids = formData.getAll('domain_ids') as string[]

  const { data, error } = await adminClient
    .from('members')
    .insert({
      name,
      student_id,
      register_no,
      // Null when blank — avoids UNIQUE constraint collision on empty SRMIST email
      email: email || null,
      regular_email: regular_email || null,
      role,
      domain_ids: domain_ids.length > 0 ? domain_ids : []
    })
    .select()

  if (error) throw error
  revalidatePath('/admin/members')
  return data[0]
}

export async function getMemberById(id: string) {
  const adminClient = createAdminClient()
  const { data, error } = await adminClient
    .from('members')
    .select('*')
    .eq('id', id)
    .single()
  if (error) return null
  return data
}

/** Fix: allowlist prevents arbitrary column writes (mass-assignment). */
const MEMBER_UPDATE_ALLOWLIST = [
  'name', 'student_id', 'register_no', 'phone',
  'email', 'regular_email', 'domain_ids', 'role', 'status'
] as const

export async function updateMember(id: string, updates: Record<string, any>) {
  const adminClient = createAdminClient()
  const safe: Record<string, any> = {}
  for (const key of MEMBER_UPDATE_ALLOWLIST) {
    if (key in updates) safe[key] = updates[key]
  }
  if (Object.keys(safe).length === 0) return
  const { error } = await adminClient.from('members').update(safe).eq('id', id)
  if (error) throw error
  revalidatePath('/admin/members')
  revalidatePath(`/admin/members/${id}`)
}

/** Fix: detects serial already linked to another member before writing. */
export async function linkNfcCard(memberId: string, cardSerial: string) {
  const adminClient = createAdminClient()

  // Check if card is already linked to a different member
  const { data: existing } = await adminClient
    .from('members')
    .select('id, name')
    .eq('card_serial', cardSerial)
    .maybeSingle()

  if (existing && existing.id !== memberId) {
    return { success: false, reason: 'already_linked', owner: existing.name }
  }

  const { error } = await adminClient
    .from('members')
    .update({ card_serial: cardSerial })
    .eq('id', memberId)

  if (error) {
    console.error('Error linking card:', error)
    return { success: false, reason: 'db_error' }
  }
  revalidatePath('/admin/members')
  revalidatePath(`/admin/members/${memberId}`)
  return { success: true }
}

// ─────────────────────────────────────────────
// SESSION CLOSE / REOPEN
// ─────────────────────────────────────────────

/** Fix: auto-marks absent for all eligible members who have no attendance record yet. */
export async function closeSession(sessionId: string) {
  const adminClient = createAdminClient()

  // 1. Fetch session to know scope
  const { data: session, error: sessionErr } = await adminClient
    .from('sessions')
    .select('*')
    .eq('id', sessionId)
    .single()

  if (sessionErr || !session) throw new Error('Session not found')

  // 2. Fetch eligible members
  let membersQuery = adminClient
    .from('members')
    .select('id')
    .eq('status', 'active')

  if (session.scope === 'domain_specific' && session.target_domain_ids?.length > 0) {
    membersQuery = membersQuery.overlaps('domain_ids', session.target_domain_ids)
  }

  const { data: eligible = [] } = await membersQuery

  // 3. Fetch already-marked member IDs for this session
  const { data: markedRaw } = await adminClient
    .from('attendance')
    .select('member_id')
    .eq('session_id', sessionId)
  const marked = markedRaw ?? []

  const markedSet = new Set(marked.map((r: any) => r.member_id))

  // 4. Bulk-insert absent for unmarked eligible members
  const eligibleList = eligible ?? []
  const absentRows = eligibleList
    .filter((m: any) => !markedSet.has(m.id))
    .map((m: any) => ({
      session_id: sessionId,
      member_id: m.id,
      status: 'absent',
      method: 'manual',
      timestamp: new Date().toISOString()
    }))

  if (absentRows.length > 0) {
    const { error: insertErr } = await adminClient
      .from('attendance')
      .upsert(absentRows, { onConflict: 'session_id,member_id', ignoreDuplicates: true })
    
    if (insertErr) {
      console.error('Failed to insert absences:', insertErr)
      throw new Error('Failed to auto-mark absences due to a database error.')
    }
  }
  // (eligible is now eligibleList above)

  // 5. Mark session closed
  const { error } = await adminClient
    .from('sessions')
    .update({ status: 'closed' })
    .eq('id', sessionId)

  if (error) throw error

  revalidatePath('/admin/sessions')
  revalidatePath(`/admin/sessions/${sessionId}/attendance`)
}

// ─────────────────────────────────────────────
// MEMBER ATTENDANCE HISTORY (admin view)
// ─────────────────────────────────────────────

export async function getMemberAttendance(memberId: string) {
  const adminClient = createAdminClient()
  const { data, error } = await adminClient
    .from('attendance')
    .select('*, sessions(id, title, date, type)')
    .eq('member_id', memberId)
    .order('created_at', { ascending: false })
  if (error) return []
  return data
}

// ─────────────────────────────────────────────
// MEMBER SESSIONS (member-facing)
// ─────────────────────────────────────────────

/** Returns session detail + the logged-in member's attendance record for that session. */
export async function getMemberSessionDetail(sessionId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const adminClient = createAdminClient()

  const { data: member } = await adminClient
    .from('members')
    .select('id, domain_ids')
    .or(emailFilter(user.email))
    .single()

  if (!member) return null

  const { data: session } = await adminClient
    .from('sessions')
    .select('*')
    .eq('id', sessionId)
    .single()

  if (!session) return null

  const { data: attendanceRecord } = await adminClient
    .from('attendance')
    .select('status, method, timestamp')
    .eq('session_id', sessionId)
    .eq('member_id', member.id)
    .maybeSingle()

  return { session, attendanceRecord: attendanceRecord ?? null, memberId: member.id }
}

/** Returns eligible sessions for the logged-in member with their attendance marks + stats. */
export async function getMemberSessionsWithAttendance() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const adminClient = createAdminClient()

  const { data: member } = await adminClient
    .from('members')
    .select('id, domain_ids')
    .or(emailFilter(user.email))
    .single()

  if (!member) return null

  // All sessions, newest first
  const { data: allSessionsRaw } = await adminClient
    .from('sessions')
    .select('*')
    .order('date', { ascending: false })
  const allSessions = allSessionsRaw ?? []

  // Filter to eligible sessions only
  const eligible = allSessions.filter((s: any) => {
    if (s.scope === 'club_wide') return true
    if (!s.target_domain_ids?.length) return false
    return (member.domain_ids ?? []).some((d: string) => s.target_domain_ids.includes(d))
  })

  if (eligible.length === 0) {
    return { stats: { eligible: 0, attended: 0, missed: 0, rate: 0 }, sessions: [] }
  }

  // Fetch this member's attendance records for eligible sessions
  const eligibleIds = eligible.map((s: any) => s.id)
  const { data: recordsRaw } = await adminClient
    .from('attendance')
    .select('session_id, status, method, timestamp')
    .eq('member_id', member.id)
    .in('session_id', eligibleIds)
  const records = recordsRaw ?? []

  const recordMap = new Map(records.map((r: any) => [r.session_id, r]))

  const sessionsWithMark = eligible.map((s: any) => ({
    ...s,
    attendanceRecord: recordMap.get(s.id) ?? null
  }))

  // Only count present/late from closed sessions to avoid rate > 100%
  const closedIds = new Set(eligible.filter((s: any) => s.status === 'closed').map((s: any) => s.id))
  const attended = records.filter((r: any) => (r.status === 'present' || r.status === 'late') && closedIds.has(r.session_id)).length
  const missed = records.filter((r: any) => r.status === 'absent' && closedIds.has(r.session_id)).length
  const totalClosed = closedIds.size
  const rate = totalClosed > 0 ? Math.round((attended / totalClosed) * 100) : 0

  return {
    stats: { eligible: eligible.length, attended, missed, rate },
    sessions: sessionsWithMark
  }
}

// ─────────────────────────────────────────────
// DOMAINS
// ─────────────────────────────────────────────

export async function getAllDomains() {
  const adminClient = createAdminClient()
  const { data, error } = await adminClient
    .from('domains')
    .select('*, domain_lead:domain_lead_id(name)')
    .order('name', { ascending: true })
  if (error) return []
  return data
}

export async function createDomain(formData: FormData) {
  const adminClient = createAdminClient()
  const name = formData.get('name') as string
  const description = formData.get('description') as string
  const domain_lead_id = formData.get('domain_lead_id') as string | null
  const { error } = await adminClient
    .from('domains')
    .insert({ name, description, domain_lead_id: domain_lead_id || null })
  if (error) throw error
  revalidatePath('/admin/domains')
}

export async function updateDomain(id: string, updates: Record<string, any>) {
  const adminClient = createAdminClient()
  const { error } = await adminClient.from('domains').update(updates).eq('id', id)
  if (error) throw error
  revalidatePath('/admin/domains')
}

export async function deleteDomain(id: string) {
  const adminClient = createAdminClient()
  const { error } = await adminClient.from('domains').delete().eq('id', id)
  if (error) throw error
  revalidatePath('/admin/domains')
}

// ─────────────────────────────────────────────
// REPORTS
// ─────────────────────────────────────────────

export async function getReportsData() {
  const adminClient = createAdminClient()
  const { count: memberCount } = await adminClient.from('members').select('*', { count: 'exact', head: true }).eq('status', 'active')
  
  const { data: closedSessions } = await adminClient.from('sessions').select('id').eq('status', 'closed')
  const closedIds = new Set((closedSessions || []).map(s => s.id))
  
  const { data: attendance } = await adminClient.from('attendance').select('status, session_id, member_id')
  
  let present = 0
  let total = 0
  const memberAbsences: Record<string, number> = {}
  
  attendance?.forEach((a: any) => {
    if (closedIds.has(a.session_id)) {
      total++
      if (a.status === 'present' || a.status === 'late') {
        present++
      } else if (a.status === 'absent') {
        memberAbsences[a.member_id] = (memberAbsences[a.member_id] || 0) + 1
      }
    }
  })
  
  const avgAttendance = total > 0 ? Math.round((present / total) * 100) : 0
  
  const atRiskIds = Object.keys(memberAbsences).filter(id => memberAbsences[id] >= 3)
  
  let atRiskMembers: any[] = []
  if (atRiskIds.length > 0) {
    const { data } = await adminClient.from('members').select('id, name, student_id').in('id', atRiskIds)
    atRiskMembers = (data || []).map(m => ({
      ...m,
      absences: memberAbsences[m.id]
    })).sort((a, b) => b.absences - a.absences)
  }

  return { memberCount: memberCount || 0, avgAttendance, atRiskMembers }
}

// ─────────────────────────────────────────────
// BULK IMPORT
// ─────────────────────────────────────────────

export async function bulkImportMembers(rows: any[]) {
  const adminClient = createAdminClient()
  const { data, error } = await adminClient.from('members').insert(rows).select()
  if (error) throw error
  revalidatePath('/admin/members')
  return { inserted: data?.length || 0 }
}

// ─────────────────────────────────────────────
// PHOTO UPLOAD
// ─────────────────────────────────────────────

export async function updateMemberPhoto(memberId: string, photoUrl: string) {
  const adminClient = createAdminClient()
  const { error } = await adminClient.from('members').update({ photo_url: photoUrl }).eq('id', memberId)
  if (error) throw error
  revalidatePath('/admin/members')
  revalidatePath(`/admin/members/${memberId}`)
  revalidatePath('/profile')
}

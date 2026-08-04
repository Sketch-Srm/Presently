'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function signOutAction() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/login')
}

// -- MEMBER ACTIONS --
export async function getMemberProfile() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  // Find member by email to link Google Auth with our Member roster
  const { data, error } = await supabase
    .from('members')
    .select('*')
    .or(`email.ilike.${user.email},regular_email.ilike.${user.email}`)
    .single()
    
  if (error) {
    if (error.code !== 'PGRST116') {
      console.error('Error fetching member:', error)
    }
    return null
  }
  return data
}

// -- SESSION ACTIONS --
export async function getUpcomingSessions() {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('sessions')
    .select('*')
    .eq('status', 'open')
    .gte('date', new Date().toISOString())
    .order('date', { ascending: true })
    
  if (error) {
    console.error('Error fetching sessions:', error)
    return []
  }
  return data
}

export async function getAllSessions() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('sessions')
    .select('*')
    .order('date', { ascending: false })
  if (error) return []
  return data
}

export async function createSession(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) throw new Error('Unauthorized')

  const title = formData.get('title') as string
  const type = formData.get('type') as string
  const date = formData.get('date') as string
  const start_time = formData.get('start_time') as string
  const scope = formData.get('scope') as string

  // We need the member ID for 'created_by'
  const { data: member, error: memberErr } = await supabase
    .from('members')
    .select('id')
    .or(`email.ilike.${user.email},regular_email.ilike.${user.email}`)
    .single()

  if (memberErr || !member) {
    console.error('Member lookup failed for session creator:', memberErr, user.email);
    throw new Error('Member not found for user ' + user.email);
  }

  const { data, error } = await supabase
    .from('sessions')
    .insert({
      title,
      type,
      date,
      start_time: new Date(`${date}T${start_time}:00`).toISOString(),
      scope,
      created_by: member.id
    })
    .select()

  if (error) throw error
  revalidatePath('/admin/sessions')
  revalidatePath('/dashboard')
  return data[0]
}

// -- ATTENDANCE ACTIONS --
export async function markAttendance(sessionId: string, memberId: string, status: string, method: 'nfc' | 'manual') {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  const { data: admin } = await supabase
    .from('members')
    .select('id')
    .or(`email.eq.${user?.email},regular_email.eq.${user?.email}`)
    .single()

  const { error } = await supabase
    .from('attendance')
    .upsert({
      session_id: sessionId,
      member_id: memberId,
      status,
      method,
      marked_by: admin?.id,
      timestamp: new Date().toISOString()
    }, {
      onConflict: 'session_id, member_id'
    })

  if (error) {
    console.error('Error marking attendance:', error)
    return { success: false, error }
  }

  revalidatePath(`/admin/sessions/${sessionId}/attendance`)
  return { success: true }
}

export async function handleNfcScan(sessionId: string, cardSerial: string) {
  const supabase = await createClient()
  
  // 1. Look up member by card serial
  const { data: member, error: memberError } = await supabase
    .from('members')
    .select('id, name')
    .eq('card_serial', cardSerial)
    .single()
    
  if (memberError || !member) {
    return { success: false, error: 'Unregistered Card' }
  }

  // 2. Mark attendance
  const result = await markAttendance(sessionId, member.id, 'present', 'nfc')
  
  if (result.success) {
    return { success: true, memberName: member.name, memberId: member.id }
  }
  
  return { success: false, error: 'Failed to record attendance' }
}

// -- MEMBER MANAGEMENT ACTIONS --
export async function getAllMembers() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('members')
    .select('*')
    .order('name', { ascending: true })
  if (error) return []
  return data
}

export async function createMember(formData: FormData) {
  const supabase = await createClient()
  const name = formData.get('name') as string
  const student_id = formData.get('student_id') as string
  const register_no = formData.get('register_no') as string
  const email = formData.get('email') as string
  const regular_email = formData.get('regular_email') as string
  const role = formData.get('role') as string

  const { data, error } = await supabase
    .from('members')
    .insert({ name, student_id, register_no, email, regular_email: regular_email || null, role })
    .select()

  if (error) throw error
  revalidatePath('/admin/members')
  return data[0]
}

export async function linkNfcCard(memberId: string, cardSerial: string) {
  const supabase = await createClient()
  const { error } = await supabase
    .from('members')
    .update({ card_serial: cardSerial })
    .eq('id', memberId)
    
  if (error) {
    console.error('Error linking card:', error)
    return { success: false, error }
  }
  revalidatePath('/admin/members')
  return { success: true }
}

// -- DOMAIN ACTIONS --
export async function getAllDomains() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('domains')
    .select('*, domain_lead_id(name)')
    .order('name', { ascending: true })
  if (error) return []
  return data
}

// -- REPORTS ACTIONS --
export async function getReportsData() {
  const supabase = await createClient()
  const { count: memberCount } = await supabase.from('members').select('*', { count: 'exact', head: true }).eq('status', 'active')
  const { data: attendance } = await supabase.from('attendance').select('status')
  let present = 0; let total = attendance?.length || 0;
  attendance?.forEach(a => { if (a.status === 'present' || a.status === 'late') present++; })
  const avgAttendance = total > 0 ? Math.round((present / total) * 100) : 0
  return { memberCount: memberCount || 0, avgAttendance, atRiskMembers: [] }
}

// -- MEMBER DETAIL/EDIT ACTIONS --
export async function getMemberById(id: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('members')
    .select('*')
    .eq('id', id)
    .single()
  if (error) return null
  return data
}

export async function updateMember(id: string, updates: Record<string, any>) {
  const supabase = await createClient()
  const { error } = await supabase
    .from('members')
    .update(updates)
    .eq('id', id)
  if (error) throw error
  revalidatePath('/admin/members')
  revalidatePath(`/admin/members/${id}`)
}

// -- SESSION CLOSE ACTION --
export async function closeSession(sessionId: string) {
  const supabase = await createClient()
  const { error } = await supabase
    .from('sessions')
    .update({ status: 'closed' })
    .eq('id', sessionId)
  if (error) throw error
  revalidatePath('/admin/sessions')
}

// -- MEMBER ATTENDANCE HISTORY --
export async function getMemberAttendance(memberId: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('attendance')
    .select('*, sessions(id, title, date, type)')
    .eq('member_id', memberId)
    .order('created_at', { ascending: false })
  if (error) return []
  return data
}

// -- DOMAIN MANAGEMENT ACTIONS --
export async function createDomain(formData: FormData) {
  const supabase = await createClient()
  const name = formData.get('name') as string
  const description = formData.get('description') as string
  const domain_lead_id = formData.get('domain_lead_id') as string | null

  const { error } = await supabase
    .from('domains')
    .insert({ name, description, domain_lead_id: domain_lead_id || null })
  if (error) throw error
  revalidatePath('/admin/domains')
}

export async function updateDomain(id: string, updates: Record<string, any>) {
  const supabase = await createClient()
  const { error } = await supabase
    .from('domains')
    .update(updates)
    .eq('id', id)
  if (error) throw error
  revalidatePath('/admin/domains')
}

export async function deleteDomain(id: string) {
  const supabase = await createClient()
  const { error } = await supabase
    .from('domains')
    .delete()
    .eq('id', id)
  if (error) throw error
  revalidatePath('/admin/domains')
}

// -- BULK IMPORT --
export async function bulkImportMembers(rows: any[]) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('members')
    .insert(rows)
    .select()
  if (error) throw error
  revalidatePath('/admin/members')
  return { inserted: data?.length || 0 }
}

// -- PHOTO UPLOAD --
export async function updateMemberPhoto(memberId: string, photoUrl: string) {
  const supabase = await createClient()
  const { error } = await supabase
    .from('members')
    .update({ photo_url: photoUrl })
    .eq('id', memberId)
  if (error) throw error
  revalidatePath('/admin/members')
  revalidatePath(`/admin/members/${memberId}`)
  revalidatePath('/profile')
}

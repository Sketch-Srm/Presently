/**
 * Escapes LIKE-wildcard characters (% and _) in an email before interpolating
 * it into a PostgREST .or() / .ilike() filter string.
 *
 * Why: Student emails like first_last@srmist.edu.in contain _ which is a
 * single-character wildcard in PostgreSQL ILIKE.  Without escaping, the query
 * matches unintended rows → .single() throws PGRST116/PGRST101 → auth fails.
 */
export function emailFilter(email: string | undefined | null): string {
  if (!email) return 'email.eq.nonexistent,regular_email.eq.nonexistent'
  const esc = email.replace(/%/g, '\\%').replace(/_/g, '\\_')
  return `email.ilike.${esc},regular_email.ilike.${esc}`
}

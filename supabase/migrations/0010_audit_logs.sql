CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    actor_email TEXT,
    action TEXT NOT NULL,
    details JSONB
);

ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable read access for super_admin and club_admin" ON audit_logs
    FOR SELECT TO authenticated
    USING (
      EXISTS (
        SELECT 1 FROM members
        WHERE (members.email = auth.jwt()->>'email' OR members.regular_email = auth.jwt()->>'email')
        AND members.role IN ('super_admin', 'club_admin')
      )
    );

CREATE POLICY "Enable insert access for authenticated" ON audit_logs
    FOR INSERT TO authenticated
    WITH CHECK (true);

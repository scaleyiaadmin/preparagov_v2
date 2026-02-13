-- Fix RLS Policies for ETP and Related Tables

-- 1. Enable RLS (Ensure it's on)
ALTER TABLE etp ENABLE ROW LEVEL SECURITY;
ALTER TABLE etp_dfd ENABLE ROW LEVEL SECURITY;

-- 2. Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Enable all access for authenticated users" ON etp;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON etp;
DROP POLICY IF EXISTS "Enable select for authenticated users" ON etp;
DROP POLICY IF EXISTS "Enable update for authenticated users" ON etp;
DROP POLICY IF EXISTS "Enable delete for authenticated users" ON etp;

DROP POLICY IF EXISTS "Enable all access for authenticated users" ON etp_dfd;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON etp_dfd;
DROP POLICY IF EXISTS "Enable select for authenticated users" ON etp_dfd;
DROP POLICY IF EXISTS "Enable update for authenticated users" ON etp_dfd;
DROP POLICY IF EXISTS "Enable delete for authenticated users" ON etp_dfd;

-- 3. Create explicit policies for ETP
-- SELECT
CREATE POLICY "Enable select for authenticated users" ON etp
FOR SELECT USING (auth.role() = 'authenticated');

-- INSERT
CREATE POLICY "Enable insert for authenticated users" ON etp
FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- UPDATE
CREATE POLICY "Enable update for authenticated users" ON etp
FOR UPDATE USING (auth.role() = 'authenticated');

-- DELETE
CREATE POLICY "Enable delete for authenticated users" ON etp
FOR DELETE USING (auth.role() = 'authenticated');

-- 4. Create explicit policies for ETP_DFD
CREATE POLICY "Enable select for authenticated users" ON etp_dfd
FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Enable insert for authenticated users" ON etp_dfd
FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Enable update for authenticated users" ON etp_dfd
FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Enable delete for authenticated users" ON etp_dfd
FOR DELETE USING (auth.role() = 'authenticated');

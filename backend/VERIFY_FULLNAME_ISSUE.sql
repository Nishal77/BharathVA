-- ==========================================================
-- VERIFY FULLNAME ISSUE - Database Analysis
-- ==========================================================

-- Check current table structure
SELECT 'Current users table structure:' as analysis;
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'users' 
AND column_name IN ('full_name', 'fullName', 'username', 'email')
ORDER BY column_name;

-- Check if there are any users in the table
SELECT 'Current users in database:' as analysis;
SELECT 
    id,
    username,
    email,
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'full_name') 
        THEN 'full_name column exists'
        ELSE 'full_name column does not exist'
    END as full_name_status,
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'fullName') 
        THEN 'fullName column exists'
        ELSE 'fullName column does not exist'
    END as fullName_status
FROM users 
LIMIT 5;

-- If full_name column exists, show the data
SELECT 'Data in full_name column (if exists):' as analysis;
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'full_name') THEN
        PERFORM 1;
    ELSE
        RAISE NOTICE 'full_name column does not exist';
    END IF;
END $$;

-- If fullName column exists, show the data  
SELECT 'Data in fullName column (if exists):' as analysis;
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'fullName') THEN
        PERFORM 1;
    ELSE
        RAISE NOTICE 'fullName column does not exist';
    END IF;
END $$;

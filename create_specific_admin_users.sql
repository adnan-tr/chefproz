-- Create the three admin users with specified credentials
-- Run this after running create_admin_credentials_table.sql

-- First, ensure the role constraint allows 'supermanager'
ALTER TABLE admin_users DROP CONSTRAINT IF EXISTS admin_users_role_check;
ALTER TABLE admin_users ADD CONSTRAINT admin_users_role_check CHECK (role IN ('supermanager', 'editor', 'viewer'));

-- Create Adnan (Super Manager)
SELECT create_admin_user_with_password(
  'adnan@hublinq.com',
  'Adnan',
  'supermanager',
  'Adnan2025?',
  'active'
);

-- Create Dani (Editor)
SELECT create_admin_user_with_password(
  'dani@hublinq.com',
  'Dani',
  'editor',
  'Dani2025!',
  'active'
);

-- Create Israfil (Viewer)
SELECT create_admin_user_with_password(
  'israfil@hublinq.com',
  'Israfil',
  'viewer',
  'Israfil2025&',
  'active'
);

-- Verify the users were created
SELECT 
  au.email,
  au.name,
  au.role,
  au.status,
  ac.created_at as credentials_created
FROM admin_users au
JOIN admin_credentials ac ON au.id = ac.admin_user_id
WHERE au.email IN ('adnan@hublinq.com', 'dani@hublinq.com', 'israfil@hublinq.com')
ORDER BY au.email;
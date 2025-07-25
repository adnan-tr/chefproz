-- Create admin_credentials table for secure password storage
CREATE TABLE IF NOT EXISTS admin_credentials (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  admin_user_id UUID REFERENCES admin_users(id) ON DELETE CASCADE,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  salt TEXT NOT NULL,
  last_login TIMESTAMP WITH TIME ZONE,
  failed_login_attempts INTEGER DEFAULT 0,
  locked_until TIMESTAMP WITH TIME ZONE,
  password_reset_token TEXT,
  password_reset_expires TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster email lookups
CREATE INDEX IF NOT EXISTS idx_admin_credentials_email ON admin_credentials(email);
CREATE INDEX IF NOT EXISTS idx_admin_credentials_admin_user_id ON admin_credentials(admin_user_id);

-- Enable RLS
ALTER TABLE admin_credentials ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Admin credentials are viewable by authenticated users" ON admin_credentials
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Admin credentials are insertable by authenticated users" ON admin_credentials
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Admin credentials are updatable by authenticated users" ON admin_credentials
  FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Admin credentials are deletable by authenticated users" ON admin_credentials
  FOR DELETE USING (auth.role() = 'authenticated');

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_admin_credentials_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_admin_credentials_updated_at
  BEFORE UPDATE ON admin_credentials
  FOR EACH ROW
  EXECUTE FUNCTION update_admin_credentials_updated_at();

-- Create function to hash passwords (using pgcrypto extension)
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Function to create admin user with password
CREATE OR REPLACE FUNCTION create_admin_user_with_password(
  p_email VARCHAR(255),
  p_name VARCHAR(255),
  p_role VARCHAR(50),
  p_password TEXT,
  p_status VARCHAR(20) DEFAULT 'active'
)
RETURNS JSON AS $$
DECLARE
  v_admin_user_id UUID;
  v_salt TEXT;
  v_password_hash TEXT;
  result JSON;
BEGIN
  -- Generate salt and hash password
  v_salt := gen_salt('bf', 12);
  v_password_hash := crypt(p_password, v_salt);
  
  -- Insert admin user
  INSERT INTO admin_users (email, name, role, status)
  VALUES (p_email, p_name, p_role, p_status)
  RETURNING id INTO v_admin_user_id;
  
  -- Insert credentials
  INSERT INTO admin_credentials (admin_user_id, email, password_hash, salt)
  VALUES (v_admin_user_id, p_email, v_password_hash, v_salt);
  
  -- Return success result
  SELECT json_build_object(
    'success', true,
    'user_id', v_admin_user_id,
    'message', 'Admin user created successfully'
  ) INTO result;
  
  RETURN result;
  
EXCEPTION WHEN OTHERS THEN
  -- Return error result
  SELECT json_build_object(
    'success', false,
    'error', SQLERRM,
    'message', 'Failed to create admin user'
  ) INTO result;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to reset admin password
CREATE OR REPLACE FUNCTION reset_admin_password(
  p_email VARCHAR(255),
  p_new_password TEXT
)
RETURNS JSON AS $$
DECLARE
  v_admin_user_id UUID;
  v_salt TEXT;
  v_password_hash TEXT;
  result JSON;
BEGIN
  -- Check if user exists
  SELECT au.id INTO v_admin_user_id
  FROM admin_users au
  WHERE au.email = p_email AND au.status = 'active';
  
  IF NOT FOUND THEN
    SELECT json_build_object(
      'success', false,
      'error', 'user_not_found',
      'message', 'User not found or inactive'
    ) INTO result;
    RETURN result;
  END IF;
  
  -- Generate new salt and hash password
  v_salt := gen_salt('bf', 12);
  v_password_hash := crypt(p_new_password, v_salt);
  
  -- Update credentials
  UPDATE admin_credentials 
  SET 
    password_hash = v_password_hash,
    salt = v_salt,
    failed_login_attempts = 0,
    locked_until = NULL,
    password_reset_token = NULL,
    password_reset_expires = NULL
  WHERE admin_user_id = v_admin_user_id;
  
  -- Return success result
  SELECT json_build_object(
    'success', true,
    'message', 'Password reset successfully'
  ) INTO result;
  
  RETURN result;
  
EXCEPTION WHEN OTHERS THEN
  SELECT json_build_object(
    'success', false,
    'error', 'system_error',
    'message', 'An error occurred during password reset'
  ) INTO result;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to verify admin login
CREATE OR REPLACE FUNCTION verify_admin_login(
  p_email VARCHAR(255),
  p_password TEXT
)
RETURNS JSON AS $$
DECLARE
  v_admin_user admin_users%ROWTYPE;
  v_credentials admin_credentials%ROWTYPE;
  v_password_valid BOOLEAN := FALSE;
  result JSON;
BEGIN
  -- Get user and credentials
  SELECT au.*, ac.*
  INTO v_admin_user, v_credentials
  FROM admin_users au
  JOIN admin_credentials ac ON au.id = ac.admin_user_id
  WHERE au.email = p_email AND au.status = 'active';
  
  -- Check if user exists
  IF NOT FOUND THEN
    SELECT json_build_object(
      'success', false,
      'error', 'invalid_credentials',
      'message', 'Invalid email or password'
    ) INTO result;
    RETURN result;
  END IF;
  
  -- Check if account is locked
  IF v_credentials.locked_until IS NOT NULL AND v_credentials.locked_until > NOW() THEN
    SELECT json_build_object(
      'success', false,
      'error', 'account_locked',
      'message', 'Account is temporarily locked due to failed login attempts'
    ) INTO result;
    RETURN result;
  END IF;
  
  -- Verify password
  v_password_valid := (v_credentials.password_hash = crypt(p_password, v_credentials.salt));
  
  IF v_password_valid THEN
    -- Reset failed attempts and update last login
    UPDATE admin_credentials 
    SET 
      failed_login_attempts = 0,
      locked_until = NULL,
      last_login = NOW()
    WHERE admin_user_id = v_admin_user.id;
    
    -- Return success with user data
    SELECT json_build_object(
      'success', true,
      'user', json_build_object(
        'id', v_admin_user.id,
        'email', v_admin_user.email,
        'name', v_admin_user.name,
        'role', v_admin_user.role,
        'status', v_admin_user.status
      ),
      'message', 'Login successful'
    ) INTO result;
    
  ELSE
    -- Increment failed attempts
    UPDATE admin_credentials 
    SET 
      failed_login_attempts = failed_login_attempts + 1,
      locked_until = CASE 
        WHEN failed_login_attempts + 1 >= 5 THEN NOW() + INTERVAL '30 minutes'
        ELSE NULL
      END
    WHERE admin_user_id = v_admin_user.id;
    
    SELECT json_build_object(
      'success', false,
      'error', 'invalid_credentials',
      'message', 'Invalid email or password'
    ) INTO result;
  END IF;
  
  RETURN result;
  
EXCEPTION WHEN OTHERS THEN
  SELECT json_build_object(
    'success', false,
    'error', 'system_error',
    'message', 'An error occurred during login'
  ) INTO result;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
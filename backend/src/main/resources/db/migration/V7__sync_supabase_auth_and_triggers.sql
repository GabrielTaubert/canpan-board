-- This table is linked to Supabase auth.users via the id
-- Update table structure to include time zones and default values for Supabase compatibility
ALTER TABLE users
    ALTER COLUMN created_at SET DATA TYPE TIMESTAMP WITH TIME ZONE,
    ALTER COLUMN created_at SET DEFAULT NOW(),
    ALTER COLUMN updated_at SET DATA TYPE TIMESTAMP WITH TIME ZONE,
    ALTER COLUMN updated_at SET DEFAULT NOW();

-- Create index on email for faster lookups if it doesn't exist
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- Create function to handle new user creation from auth.users
CREATE OR REPLACE FUNCTION handle_new_user()
    RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO users (id, email, created_at, updated_at)
    VALUES (NEW.id, NEW.email, NOW(), NOW())
    ON CONFLICT (id) DO UPDATE SET
                                   email = EXCLUDED.email,
                                   updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to automatically create user record when a new auth user is registered
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION handle_new_user();
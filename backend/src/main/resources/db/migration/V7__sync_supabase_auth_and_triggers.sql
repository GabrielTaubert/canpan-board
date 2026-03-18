-- 1. Update table structure (compatible with Postgres)
ALTER TABLE users
    ALTER COLUMN created_at SET DATA TYPE TIMESTAMP WITH TIME ZONE,
    ALTER COLUMN created_at SET DEFAULT NOW(),
    ALTER COLUMN updated_at SET DATA TYPE TIMESTAMP WITH TIME ZONE,
    ALTER COLUMN updated_at SET DEFAULT NOW();

-- 2. Create index
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- 3. Only create Trigger and Function if 'auth' schema exists (Supabase environment)
DO $$
    BEGIN
        IF EXISTS (SELECT 1 FROM information_schema.schemata WHERE schema_name = 'auth') THEN

            CREATE OR REPLACE FUNCTION handle_new_user()
                RETURNS TRIGGER AS $func$
            BEGIN
                INSERT INTO public.users (id, email, created_at, updated_at)
                VALUES (NEW.id, NEW.email, NOW(), NOW())
                ON CONFLICT (id) DO UPDATE SET
                                               email = EXCLUDED.email,
                                               updated_at = NOW();
                RETURN NEW;
            END;
            $func$ LANGUAGE plpgsql SECURITY DEFINER;

            DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
            CREATE TRIGGER on_auth_user_created
                AFTER INSERT ON auth.users
                FOR EACH ROW EXECUTE FUNCTION handle_new_user();

        END IF;
    END $$;
-- ============================================
-- Nucleus — reset demo users back to the 3 core accounts
-- ============================================
-- Deletes extra @test.com demo users and keeps only:
--   admin@test.com
--   manager@test.com
--   employee@test.com
--
-- Run in Supabase SQL Editor if the bulk seed created too many users.

DO $$
DECLARE
  core_admin_id uuid;
  core_manager_id uuid;
  core_employee_id uuid;
BEGIN
  SELECT id INTO core_admin_id FROM auth.users WHERE email = 'admin@test.com';
  SELECT id INTO core_manager_id FROM auth.users WHERE email = 'manager@test.com';
  SELECT id INTO core_employee_id FROM auth.users WHERE email = 'employee@test.com';

  DELETE FROM auth.users
  WHERE email LIKE '%@test.com'
    AND email NOT IN ('admin@test.com', 'manager@test.com', 'employee@test.com');

  UPDATE public.users
  SET name = 'Admin User',
      role = 'admin',
      department = 'HR',
      manager_id = NULL
  WHERE id = core_admin_id;

  UPDATE public.users
  SET name = 'Test Manager',
      role = 'manager',
      department = 'Engineering',
      manager_id = NULL
  WHERE id = core_manager_id;

  UPDATE public.users
  SET name = 'Test Employee',
      role = 'employee',
      department = 'Engineering',
      manager_id = core_manager_id
  WHERE id = core_employee_id;

  RAISE NOTICE 'Reset complete. Kept admin@test.com, manager@test.com, employee@test.com.';
END $$;

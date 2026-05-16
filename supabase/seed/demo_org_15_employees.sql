-- ============================================
-- Nucleus — demo org users
-- ============================================
-- Creates/updates:
--   admin@test.com / password123
--   manager1@test.com, manager2@test.com, manager3@test.com / password123
--   emp1@test.com ... emp15@test.com / password123
--
-- Safe to rerun: updates matching emails instead of creating duplicates.

DO $$
DECLARE
  admin_id uuid;
  manager_ids uuid[] := ARRAY[]::uuid[];
  employee_id uuid;
  current_manager_id uuid;
  user_password text := 'password123';
  app_meta jsonb := '{"provider":"email","providers":["email"]}'::jsonb;
BEGIN
  create extension if not exists pgcrypto;

  -- Admin
  SELECT id INTO admin_id FROM auth.users WHERE email = 'admin@test.com';

  IF admin_id IS NULL THEN
    admin_id := gen_random_uuid();

    INSERT INTO auth.users (
      id,
      aud,
      role,
      email,
      encrypted_password,
      email_confirmed_at,
      raw_user_meta_data,
      raw_app_meta_data,
      created_at,
      updated_at
    )
    VALUES (
      admin_id,
      'authenticated',
      'authenticated',
      'admin@test.com',
      crypt(user_password, gen_salt('bf')),
      now(),
      '{"name":"Admin User"}'::jsonb,
      app_meta,
      now(),
      now()
    );
  ELSE
    UPDATE auth.users
    SET encrypted_password = crypt(user_password, gen_salt('bf')),
        email_confirmed_at = coalesce(email_confirmed_at, now()),
        raw_user_meta_data = '{"name":"Admin User"}'::jsonb,
        raw_app_meta_data = app_meta,
        updated_at = now()
    WHERE id = admin_id;
  END IF;

  UPDATE public.users
  SET name = 'Admin User',
      role = 'admin',
      department = 'HR',
      manager_id = NULL
  WHERE id = admin_id;

  INSERT INTO auth.identities (
    id,
    user_id,
    identity_data,
    provider,
    provider_id,
    last_sign_in_at,
    created_at,
    updated_at
  )
  SELECT
    gen_random_uuid(),
    admin_id,
    jsonb_build_object('sub', admin_id, 'email', 'admin@test.com'),
    'email',
    admin_id::text,
    now(),
    now(),
    now()
  WHERE NOT EXISTS (
    SELECT 1 FROM auth.identities WHERE user_id = admin_id AND provider = 'email'
  );

  -- Managers
  FOR i IN 1..3 LOOP
    SELECT id INTO current_manager_id FROM auth.users WHERE email = format('manager%s@test.com', i);

    IF current_manager_id IS NULL THEN
      current_manager_id := gen_random_uuid();

      INSERT INTO auth.users (
        id,
        aud,
        role,
        email,
        encrypted_password,
        email_confirmed_at,
        raw_user_meta_data,
        raw_app_meta_data,
        created_at,
        updated_at
      )
      VALUES (
        current_manager_id,
        'authenticated',
        'authenticated',
        format('manager%s@test.com', i),
        crypt(user_password, gen_salt('bf')),
        now(),
        jsonb_build_object('name', format('Manager %s', i)),
        app_meta,
        now(),
        now()
      );
    ELSE
      UPDATE auth.users
      SET encrypted_password = crypt(user_password, gen_salt('bf')),
          email_confirmed_at = coalesce(email_confirmed_at, now()),
          raw_user_meta_data = jsonb_build_object('name', format('Manager %s', i)),
          raw_app_meta_data = app_meta,
          updated_at = now()
      WHERE id = current_manager_id;
    END IF;

    UPDATE public.users
    SET name = format('Manager %s', i),
        role = 'manager',
        department = CASE i
          WHEN 1 THEN 'Engineering'
          WHEN 2 THEN 'Product'
          ELSE 'Operations'
        END,
        manager_id = NULL
    WHERE public.users.id = current_manager_id;

    INSERT INTO auth.identities (
      id,
      user_id,
      identity_data,
      provider,
      provider_id,
      last_sign_in_at,
      created_at,
      updated_at
    )
    SELECT
      gen_random_uuid(),
      current_manager_id,
      jsonb_build_object('sub', current_manager_id, 'email', format('manager%s@test.com', i)),
      'email',
      current_manager_id::text,
      now(),
      now(),
      now()
    WHERE NOT EXISTS (
      SELECT 1 FROM auth.identities WHERE user_id = current_manager_id AND provider = 'email'
    );

    manager_ids := array_append(manager_ids, current_manager_id);
  END LOOP;

  -- Employees, five under each manager.
  FOR i IN 1..15 LOOP
    SELECT id INTO employee_id FROM auth.users WHERE email = format('emp%s@test.com', i);
    current_manager_id := manager_ids[ceil(i / 5.0)::integer];

    IF employee_id IS NULL THEN
      employee_id := gen_random_uuid();

      INSERT INTO auth.users (
        id,
        aud,
        role,
        email,
        encrypted_password,
        email_confirmed_at,
        raw_user_meta_data,
        raw_app_meta_data,
        created_at,
        updated_at
      )
      VALUES (
        employee_id,
        'authenticated',
        'authenticated',
        format('emp%s@test.com', i),
        crypt(user_password, gen_salt('bf')),
        now(),
        jsonb_build_object('name', format('Employee %s', i)),
        app_meta,
        now(),
        now()
      );
    ELSE
      UPDATE auth.users
      SET encrypted_password = crypt(user_password, gen_salt('bf')),
          email_confirmed_at = coalesce(email_confirmed_at, now()),
          raw_user_meta_data = jsonb_build_object('name', format('Employee %s', i)),
          raw_app_meta_data = app_meta,
          updated_at = now()
      WHERE id = employee_id;
    END IF;

    UPDATE public.users
    SET name = format('Employee %s', i),
        role = 'employee',
        manager_id = current_manager_id,
        department = CASE
          WHEN i <= 5 THEN 'Engineering'
          WHEN i <= 10 THEN 'Product'
          ELSE 'Operations'
        END
    WHERE public.users.id = employee_id;

    INSERT INTO auth.identities (
      id,
      user_id,
      identity_data,
      provider,
      provider_id,
      last_sign_in_at,
      created_at,
      updated_at
    )
    SELECT
      gen_random_uuid(),
      employee_id,
      jsonb_build_object('sub', employee_id, 'email', format('emp%s@test.com', i)),
      'email',
      employee_id::text,
      now(),
      now(),
      now()
    WHERE NOT EXISTS (
      SELECT 1 FROM auth.identities WHERE user_id = employee_id AND provider = 'email'
    );
  END LOOP;

  RAISE NOTICE 'Demo org ready: 1 admin, 3 managers, 15 employees. Password for all: %', user_password;
END $$;

-- ============================================
-- Nucleus — optional demo seed data
-- ============================================
-- Run in Supabase SQL Editor when you want a populated demo.
-- SAFE: skips if employee@test.com already has goals.
-- Only touches the demo employee account.

DO $$
DECLARE
  emp_id uuid;
  mgr_id uuid;
  admin_id uuid;
  g1 uuid;
  g2 uuid;
  g3 uuid;
  g4 uuid;
BEGIN
  SELECT id INTO emp_id FROM public.users WHERE email = 'employee@test.com';
  SELECT id INTO mgr_id FROM public.users WHERE email = 'manager@test.com';
  SELECT id INTO admin_id FROM public.users WHERE email = 'admin@test.com';

  IF emp_id IS NULL THEN
    RAISE NOTICE 'employee@test.com not found — create demo users first.';
    RETURN;
  END IF;

  IF EXISTS (SELECT 1 FROM public.goals WHERE user_id = emp_id LIMIT 1) THEN
    RAISE NOTICE 'Demo employee already has goals — seed skipped.';
    RETURN;
  END IF;

  -- Quarter windows (insert only if missing)
  INSERT INTO public.quarter_windows (quarter_name, start_date, end_date, created_by)
  SELECT v.quarter_name, v.start_date, v.end_date, admin_id
  FROM (VALUES
    ('goal_setting', '2026-05-01'::date, '2026-05-31'::date),
    ('q1', '2026-05-01'::date, '2026-07-31'::date),
    ('q2', '2026-08-01'::date, '2026-10-31'::date),
    ('q3', '2026-11-01'::date, '2027-01-31'::date),
    ('annual', '2027-03-01'::date, '2027-04-30'::date)
  ) AS v(quarter_name, start_date, end_date)
  WHERE NOT EXISTS (
    SELECT 1 FROM public.quarter_windows qw WHERE qw.quarter_name = v.quarter_name
  );

  -- Approved goals (100% weightage)
  INSERT INTO public.goals (
    user_id, thrust_area, title, description, weightage, uom, target, target_date,
    is_locked, status
  ) VALUES
    (emp_id, 'business', 'Increase monthly revenue', 'Grow recurring revenue from core product lines.', 30, 'number', 1000000, NULL, true, 'locked'),
    (emp_id, 'customer', 'Improve NPS score', 'Raise customer satisfaction survey results.', 25, 'number', 50, NULL, true, 'locked'),
    (emp_id, 'operations', 'Reduce delivery lead time', 'Shorten average order fulfillment cycle.', 25, 'percentage', 20, NULL, true, 'locked'),
    (emp_id, 'compliance', 'Zero critical audit findings', 'No critical findings in internal compliance review.', 20, 'zero_based', 0, NULL, true, 'locked');

  SELECT id INTO g1 FROM public.goals WHERE user_id = emp_id AND title = 'Increase monthly revenue';
  SELECT id INTO g2 FROM public.goals WHERE user_id = emp_id AND title = 'Improve NPS score';
  SELECT id INTO g3 FROM public.goals WHERE user_id = emp_id AND title = 'Reduce delivery lead time';
  SELECT id INTO g4 FROM public.goals WHERE user_id = emp_id AND title = 'Zero critical audit findings';

  -- Q1 check-ins (submitted)
  INSERT INTO public.quarterly_updates (
    goal_id, quarter, achievement, achievement_date, status, score, submitted_at, manager_feedback
  ) VALUES
    (g1, 'q1', 850000, NULL, 'on_track', 0.85, now() - interval '2 days', 'Strong progress; pipeline healthy for Q2.'),
    (g2, 'q1', 47, NULL, 'on_track', 0.94, now() - interval '2 days', 'Good momentum on support SLAs.'),
    (g3, 'q1', 18, NULL, 'completed', 0.90, now() - interval '2 days', 'Exceeded target reduction.'),
    (g4, 'q1', 0, NULL, 'completed', 1.00, now() - interval '2 days', 'Clean quarter — well done.');

  RAISE NOTICE 'Demo seed complete for employee@test.com';
END $$;

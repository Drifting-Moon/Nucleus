-- ============================================
-- Nucleus — rich demo seed data
-- ============================================
-- Run in Supabase SQL Editor for a judge-ready demo.
-- SAFE: skips if employee@test.com already has goals.
-- Only touches the demo employee account (+ audit log rows).

DO $$
DECLARE
  emp_id uuid;
  mgr_id uuid;
  admin_id uuid;
  g1 uuid;
  g2 uuid;
  g3 uuid;
  g4 uuid;
  g5 uuid;
BEGIN
  SELECT id INTO emp_id FROM public.users WHERE email = 'employee@test.com';
  SELECT id INTO mgr_id FROM public.users WHERE email = 'manager@test.com';
  SELECT id INTO admin_id FROM public.users WHERE email = 'admin@test.com';

  IF emp_id IS NULL THEN
    RAISE NOTICE 'employee@test.com not found — create demo users first.';
    RETURN;
  END IF;

  IF mgr_id IS NOT NULL THEN
    UPDATE public.users SET manager_id = mgr_id WHERE id = emp_id;
  END IF;

  IF EXISTS (SELECT 1 FROM public.goals WHERE user_id = emp_id LIMIT 1) THEN
    RAISE NOTICE 'Demo employee already has goals — seed skipped.';
    RETURN;
  END IF;

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

  -- Five locked goals (100% weightage) including one shared/forced KPI
  INSERT INTO public.goals (
    user_id, thrust_area, title, description, weightage, uom, target, target_date,
    is_shared, status, score_direction
  ) VALUES
    (emp_id, 'business', 'Increase monthly revenue', 'Grow recurring revenue from core product lines.', 25, 'number', 1000000, NULL, false, 'locked', 'higher'),
    (emp_id, 'customer', 'Improve NPS score', 'Raise customer satisfaction survey results.', 20, 'number', 50, NULL, false, 'locked', 'higher'),
    (emp_id, 'operations', 'Reduce delivery lead time', 'Shorten average order fulfillment cycle.', 20, 'percentage', 20, NULL, false, 'locked', 'lower'),
    (emp_id, 'people', 'Complete leadership training', 'Finish mandated L&D program by deadline.', 15, 'timeline', NULL, '2026-12-31', false, 'locked', 'higher'),
    (emp_id, 'compliance', 'Company-wide safety KPI', 'Admin-assigned shared goal — zero recordable incidents.', 20, 'zero_based', 0, NULL, true, 'locked', 'higher');

  SELECT id INTO g1 FROM public.goals WHERE user_id = emp_id AND title = 'Increase monthly revenue';
  SELECT id INTO g2 FROM public.goals WHERE user_id = emp_id AND title = 'Improve NPS score';
  SELECT id INTO g3 FROM public.goals WHERE user_id = emp_id AND title = 'Reduce delivery lead time';
  SELECT id INTO g4 FROM public.goals WHERE user_id = emp_id AND title = 'Complete leadership training';
  SELECT id INTO g5 FROM public.goals WHERE user_id = emp_id AND title = 'Company-wide safety KPI';

  -- Q1 check-ins (all submitted, manager feedback)
  INSERT INTO public.quarterly_updates (
    goal_id, quarter, achievement, achievement_date, status, score, submitted_at, manager_feedback
  ) VALUES
    (g1, 'q1', 850000, NULL, 'on_track', 0.85, now() - interval '60 days', 'Strong pipeline — keep momentum in Q2.'),
    (g2, 'q1', 47, NULL, 'on_track', 0.94, now() - interval '60 days', 'Good progress on support SLAs.'),
    (g3, 'q1', 18, NULL, 'completed', 0.90, now() - interval '60 days', 'Exceeded target reduction.'),
    (g4, 'q1', NULL, '2026-06-15', 'completed', 1.00, now() - interval '60 days', 'Completed ahead of schedule.'),
    (g5, 'q1', 0, NULL, 'completed', 1.00, now() - interval '60 days', 'Clean quarter — well done.');

  -- Q2 check-ins (submitted — drives “Q2 submitted” in UI when window is open)
  INSERT INTO public.quarterly_updates (
    goal_id, quarter, achievement, achievement_date, status, score, submitted_at, manager_feedback
  ) VALUES
    (g1, 'q2', 920000, NULL, 'on_track', 0.92, now() - interval '2 days', 'Excellent Q2 revenue trajectory.'),
    (g2, 'q2', 48, NULL, 'on_track', 0.96, now() - interval '2 days', 'NPS trending up.'),
    (g3, 'q2', 17, NULL, 'on_track', 0.85, now() - interval '2 days', 'Still ahead of plan.'),
    (g4, 'q2', NULL, '2026-09-01', 'on_track', 1.00, now() - interval '2 days', 'On track for year-end completion.'),
    (g5, 'q2', 0, NULL, 'completed', 1.00, now() - interval '2 days', 'Maintained zero incidents.');

  IF admin_id IS NOT NULL AND g5 IS NOT NULL THEN
    INSERT INTO public.audit_logs (changed_by, goal_id, field_changed, old_value, new_value)
    VALUES
      (admin_id, g5, 'shared_goal_assigned', NULL, 'Company-wide safety KPI'),
      (admin_id, g1, 'target', '950000', '1000000');
  END IF;

  RAISE NOTICE 'Rich demo seed complete for employee@test.com';
END $$;

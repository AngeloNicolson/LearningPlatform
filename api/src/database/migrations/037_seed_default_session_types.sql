/**
 * Migration: Seed default session types for all tutors
 * Description: Adds standard 30min, 60min, and 90min session options for all existing tutors
 */

-- Add default session types for all tutors that don't have any
INSERT INTO session_types (tutor_id, name, duration_minutes, price, description, is_active, display_order)
SELECT
  t.id as tutor_id,
  '30-Minute Session' as name,
  30 as duration_minutes,
  25.00 as price,
  'Quick focused session - perfect for homework help or specific questions' as description,
  true as is_active,
  1 as display_order
FROM tutors t
WHERE NOT EXISTS (
  SELECT 1 FROM session_types st
  WHERE st.tutor_id = t.id AND st.duration_minutes = 30
);

INSERT INTO session_types (tutor_id, name, duration_minutes, price, description, is_active, display_order)
SELECT
  t.id as tutor_id,
  '60-Minute Session' as name,
  60 as duration_minutes,
  45.00 as price,
  'Standard session - ideal for comprehensive tutoring and concept mastery' as description,
  true as is_active,
  2 as display_order
FROM tutors t
WHERE NOT EXISTS (
  SELECT 1 FROM session_types st
  WHERE st.tutor_id = t.id AND st.duration_minutes = 60
);

INSERT INTO session_types (tutor_id, name, duration_minutes, price, description, is_active, display_order)
SELECT
  t.id as tutor_id,
  '90-Minute Session' as name,
  90 as duration_minutes,
  65.00 as price,
  'Extended session - best for exam prep, project work, or in-depth learning' as description,
  true as is_active,
  3 as display_order
FROM tutors t
WHERE NOT EXISTS (
  SELECT 1 FROM session_types st
  WHERE st.tutor_id = t.id AND st.duration_minutes = 90
);

-- Display results
SELECT
  t.display_name,
  COUNT(st.id) as session_types_count
FROM tutors t
LEFT JOIN session_types st ON t.id = st.tutor_id
GROUP BY t.id, t.display_name
ORDER BY t.id;

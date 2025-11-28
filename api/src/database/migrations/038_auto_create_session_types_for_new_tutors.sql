/**
 * Migration: Auto-create default session types for new tutors
 * Description: Creates a trigger that automatically adds standard session types
 * when a new tutor is created
 */

-- Function to create default session types for a new tutor
CREATE OR REPLACE FUNCTION create_default_session_types()
RETURNS TRIGGER AS $$
BEGIN
  -- Only create session types if this is a new, approved tutor
  IF (NEW.approval_status = 'approved' AND NEW.is_active = true) THEN
    -- Insert 30-minute session
    INSERT INTO session_types (tutor_id, name, duration_minutes, price, description, is_active, display_order)
    VALUES (
      NEW.id,
      '30-Minute Session',
      30,
      25.00,
      'Quick focused session - perfect for homework help or specific questions',
      true,
      1
    )
    ON CONFLICT (tutor_id, name) DO NOTHING;

    -- Insert 60-minute session
    INSERT INTO session_types (tutor_id, name, duration_minutes, price, description, is_active, display_order)
    VALUES (
      NEW.id,
      '60-Minute Session',
      60,
      45.00,
      'Standard session - ideal for comprehensive tutoring and concept mastery',
      true,
      2
    )
    ON CONFLICT (tutor_id, name) DO NOTHING;

    -- Insert 90-minute session
    INSERT INTO session_types (tutor_id, name, duration_minutes, price, description, is_active, display_order)
    VALUES (
      NEW.id,
      '90-Minute Session',
      90,
      65.00,
      'Extended session - best for exam prep, project work, or in-depth learning',
      true,
      3
    )
    ON CONFLICT (tutor_id, name) DO NOTHING;

    RAISE NOTICE 'Created default session types for tutor %', NEW.display_name;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop trigger if it already exists
DROP TRIGGER IF EXISTS trigger_create_default_session_types ON tutors;

-- Create trigger on tutors table
CREATE TRIGGER trigger_create_default_session_types
  AFTER INSERT OR UPDATE OF approval_status, is_active
  ON tutors
  FOR EACH ROW
  EXECUTE FUNCTION create_default_session_types();

-- Display summary
SELECT 'Trigger created successfully! New tutors will automatically get 3 default session types.' as status;

-- Migration: Add Bible Studies topics and subject
-- Creates grade level and topics for Biblical education including Old Testament, New Testament,
-- Biblical History, Parables, and related studies

-- First, drop the existing constraint and recreate it to include 'bible'
ALTER TABLE grade_levels DROP CONSTRAINT IF EXISTS grade_levels_subject_check;
ALTER TABLE grade_levels ADD CONSTRAINT grade_levels_subject_check
  CHECK (subject IN ('math', 'science', 'history', 'bible'));

-- Create a grade_level for Bible Studies
INSERT INTO grade_levels (id, name, subject, grade_range, description, display_order)
VALUES (
  'bible-general',
  'Biblical Studies',
  'bible',
  'All Ages',
  'Ancient texts, historical context, and cultural impact',
  5
)
ON CONFLICT (id) DO NOTHING;

-- Insert Bible Studies topics under the new grade level
INSERT INTO topics (id, grade_level_id, name, icon, description, display_order) VALUES
  ('bible-old-testament', 'bible-general', 'Old Testament', '📜', 'Torah, Historical Books, Wisdom Literature, Prophets', 1),
  ('bible-new-testament', 'bible-general', 'New Testament', '✝️', 'Gospels, Acts, Epistles, Revelation', 2),
  ('bible-history', 'bible-general', 'Biblical History', '🏛️', 'Ancient Israel, Biblical Archaeology, Historical Context', 3),
  ('bible-parables', 'bible-general', 'Parables & Teachings', '💡', 'Jesus'' Parables, Wisdom Sayings, Moral Lessons', 4),
  ('bible-geography', 'bible-general', 'Biblical Geography', '🗺️', 'Holy Land, Ancient Cities, Biblical Locations', 5),
  ('bible-characters', 'bible-general', 'Character Studies', '👥', 'Moses, David, Paul, Biblical Figures', 6),
  ('bible-culture', 'bible-general', 'Biblical Culture', '🏺', 'Ancient Customs, Traditions, Daily Life', 7),
  ('bible-literacy', 'bible-general', 'Biblical Literacy', '📖', 'Common References, Literary Influence, Cultural Impact', 8)
ON CONFLICT (id) DO NOTHING;

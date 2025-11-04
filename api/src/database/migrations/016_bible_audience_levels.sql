-- Migration: Restructure Bible Studies to use Audience Approach
-- Replaces single "All Ages" level with 4 audience-specific levels

-- Delete existing bible topics and grade level
DELETE FROM topics WHERE grade_level_id = 'bible-general';
DELETE FROM grade_levels WHERE id = 'bible-general';

-- Create audience-based grade levels for Bible Studies
INSERT INTO grade_levels (id, name, subject, grade_range, description, display_order) VALUES
  ('bible-general', 'Introduction', 'bible', 'Beginner', 'Overview of Biblical texts for all ages', 5),
  ('bible-youth', 'Youth Study', 'bible', 'Ages 12-18', 'Age-appropriate Biblical content and themes', 6),
  ('bible-adult', 'Adult Study', 'bible', 'Adult', 'In-depth exploration for adult learners', 7),
  ('bible-academic', 'Academic Study', 'bible', 'University+', 'Scholarly research and critical analysis', 8)
ON CONFLICT (id) DO NOTHING;

-- Insert Bible Studies topics distributed across audience levels
INSERT INTO topics (id, grade_level_id, name, icon, description, display_order) VALUES
  -- General Audience (foundational texts)
  ('bible-old-testament', 'bible-general', 'Old Testament', '📜', 'Torah, Historical Books, Wisdom Literature, Prophets', 1),
  ('bible-new-testament', 'bible-general', 'New Testament', '✝️', 'Gospels, Acts, Epistles, Revelation', 2),

  -- Youth Study (engaging stories and lessons)
  ('bible-parables', 'bible-youth', 'Parables & Teachings', '💡', 'Jesus'' Parables, Wisdom Sayings, Moral Lessons', 1),
  ('bible-characters', 'bible-youth', 'Character Studies', '👥', 'Moses, David, Paul, Biblical Figures', 2),

  -- Adult Study (deeper context and history)
  ('bible-history', 'bible-adult', 'Biblical History', '🏛️', 'Ancient Israel, Biblical Archaeology, Historical Context', 1),
  ('bible-geography', 'bible-adult', 'Biblical Geography', '🗺️', 'Holy Land, Ancient Cities, Biblical Locations', 2),

  -- Academic Study (scholarly analysis)
  ('bible-culture', 'bible-academic', 'Biblical Culture', '🏺', 'Ancient Customs, Traditions, Daily Life', 1),
  ('bible-literacy', 'bible-academic', 'Biblical Literacy', '📖', 'Common References, Literary Influence, Cultural Impact', 2)
ON CONFLICT (id) DO NOTHING;

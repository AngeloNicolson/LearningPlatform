-- Add category system to subjects for organizing into Core and Electives

-- Add category and ordering fields to subjects table
ALTER TABLE subjects
ADD COLUMN IF NOT EXISTS category VARCHAR(20) DEFAULT 'core' CHECK (category IN ('core', 'electives')),
ADD COLUMN IF NOT EXISTS category_display_order INTEGER DEFAULT 0;

-- Update existing subjects with categories
UPDATE subjects SET category = 'core', category_display_order = 1 WHERE id = 'math';
UPDATE subjects SET category = 'core', category_display_order = 2 WHERE id = 'science';
UPDATE subjects SET category = 'core', category_display_order = 3 WHERE id = 'history';
UPDATE subjects SET category = 'electives', category_display_order = 1 WHERE id = 'bible';

-- Insert new elective subjects
INSERT INTO subjects (id, name, slug, icon, description, filter_label, category, category_display_order, display_order)
VALUES
  ('biblical-history', 'Biblical History', 'biblical-history', '📜', 'Study the historical context, timeline, and events of the Bible from creation to the early church', 'Time Period', 'electives', 2, 5),
  ('science-bible', 'Science & the Bible', 'science-bible', '🔬', 'Explore the harmony between scientific discovery and biblical truth, covering creation, design, and faith-science integration', 'Topic Area', 'electives', 3, 6)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  slug = EXCLUDED.slug,
  icon = EXCLUDED.icon,
  description = EXCLUDED.description,
  filter_label = EXCLUDED.filter_label,
  category = EXCLUDED.category,
  category_display_order = EXCLUDED.category_display_order,
  display_order = EXCLUDED.display_order;

-- Create index for category filtering
CREATE INDEX IF NOT EXISTS idx_subjects_category ON subjects(category, category_display_order);

-- Comments
COMMENT ON COLUMN subjects.category IS 'Subject category: core (Math, Science, History) or electives (Biblical Studies, etc.)';
COMMENT ON COLUMN subjects.category_display_order IS 'Display order within the category (lower numbers first)';

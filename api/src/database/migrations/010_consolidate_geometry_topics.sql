-- Consolidate duplicate Geometry topics into one
-- Resources already have grade_level field, so we don't need separate geometry topics per grade

-- Create a single unified Geometry topic (not tied to a specific grade level)
INSERT INTO topics (id, name, grade_level_id, icon, display_order)
VALUES ('math-geometry', 'Geometry', 'math-middle', '📐', 2)
ON CONFLICT (id) DO NOTHING;

-- Update all resources using elementary geometry to use the unified topic
UPDATE subject_resources
SET topic_id = 'math-geometry',
    topic_name = 'Geometry',
    topic_icon = '📐'
WHERE topic_id = 'math-elem-geometry';

-- Update all resources using high school geometry to use the unified topic
UPDATE subject_resources
SET topic_id = 'math-geometry',
    topic_name = 'Geometry',
    topic_icon = '📐'
WHERE topic_id = 'math-high-geometry';

-- Update middle school geometry to use the new ID
UPDATE subject_resources
SET topic_id = 'math-geometry',
    topic_name = 'Geometry',
    topic_icon = '📐'
WHERE topic_id = 'math-middle-geometry';

-- Delete the old duplicate geometry topics
DELETE FROM topics WHERE id IN ('math-elem-geometry', 'math-middle-geometry', 'math-high-geometry');

-- Update the unified topic name to remove grade level
UPDATE topics
SET name = 'Geometry'
WHERE id = 'math-geometry';

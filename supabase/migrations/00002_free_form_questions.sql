-- ============================================
-- MIGRATION: Add Free-Form Question Support
-- ============================================

-- Add new columns to questions table
ALTER TABLE questions
  ADD COLUMN question_type VARCHAR(20) NOT NULL DEFAULT 'multiple_choice',
  ADD COLUMN correct_answer TEXT,
  ADD COLUMN acceptable_answers TEXT[],
  ADD COLUMN answer_unit TEXT,
  ADD COLUMN answer_type VARCHAR(20) DEFAULT 'text';

-- Make options and correct_option_index nullable for free-form questions
ALTER TABLE questions
  ALTER COLUMN options DROP NOT NULL,
  ALTER COLUMN correct_option_index DROP NOT NULL;

-- Add constraint for valid question types
ALTER TABLE questions ADD CONSTRAINT valid_question_type
  CHECK (question_type IN ('multiple_choice', 'free_form'));

-- Add constraint for valid answer types
ALTER TABLE questions ADD CONSTRAINT valid_answer_type
  CHECK (answer_type IN ('integer', 'decimal', 'fraction', 'text'));

-- Add constraint to ensure correct fields are populated based on question type
ALTER TABLE questions ADD CONSTRAINT question_type_fields_check CHECK (
  (question_type = 'multiple_choice' AND options IS NOT NULL AND correct_option_index IS NOT NULL)
  OR
  (question_type = 'free_form' AND correct_answer IS NOT NULL)
);

-- Add answer_text column to answers table for free-form responses
ALTER TABLE answers
  ADD COLUMN answer_text TEXT;

-- Create index on question_type for efficient filtering
CREATE INDEX idx_questions_type ON questions(question_type);

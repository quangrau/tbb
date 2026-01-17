CREATE TABLE question_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  question_id UUID NOT NULL REFERENCES questions(id),
  room_id UUID REFERENCES rooms(id) ON DELETE SET NULL,
  player_id UUID REFERENCES room_players(id) ON DELETE SET NULL,
  report_type TEXT NOT NULL,
  report_text TEXT,
  selected_option_index INT,
  answer_text TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_question_reports_question_id ON question_reports(question_id);
CREATE INDEX idx_question_reports_room_id ON question_reports(room_id);

ALTER TABLE question_reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "question_reports_insert_anon"
ON question_reports
FOR INSERT
TO anon, authenticated
WITH CHECK (TRUE);

GRANT INSERT ON TABLE question_reports TO anon, authenticated;

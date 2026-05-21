-- 0004_quiz_engine.sql

CREATE TABLE IF NOT EXISTS quizzes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  cover_image TEXT,
  category TEXT,
  difficulty_score INTEGER DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS questions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  quiz_id UUID REFERENCES quizzes(id) ON DELETE CASCADE,
  question_text TEXT NOT NULL,
  options JSONB NOT NULL,
  correct_option_index INTEGER NOT NULL,
  explanation_text TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- RLS Policies
ALTER TABLE quizzes ENABLE ROW LEVEL SECURITY;
ALTER TABLE questions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Quizzes are viewable by everyone" ON quizzes FOR SELECT USING (true);
CREATE POLICY "Questions are viewable by everyone" ON questions FOR SELECT USING (true);

-- Insert dummy data for local dev/testing
INSERT INTO quizzes (id, title, description, cover_image, category, difficulty_score) VALUES 
('q-mock-1', 'CAN YOU SPOT THE AI DEEPFAKE?', 'Test your ability to distinguish reality from algorithmically generated propaganda.', 'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?auto=format&fit=crop&w=800&q=80', 'AI', 8),
('q-mock-2', 'ARE YOU A SHEEP? THE ULTIMATE CONSPIRACY TEST', 'Find out if you''re awake or just sleepwalking through the matrix.', 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=800&q=80', 'EXPOSE', 10);

INSERT INTO questions (quiz_id, question_text, options, correct_option_index, explanation_text) VALUES 
('q-mock-1', 'Which of these details is the most common giveaway of an AI-generated image?', '["Perfectly symmetrical faces", "Messed up hands and fingers", "Hyper-realistic shadows", "The image file size"]'::jsonb, 1, 'AI models famously struggle with rendering human hands, often creating 6 fingers or melted joints.'),
('q-mock-1', 'What does the term "Hallucination" mean in the context of Large Language Models?', '["When the AI becomes self-aware", "When the AI sees visual patterns in code", "When the AI confidently makes up fake facts", "When the server overheats"]'::jsonb, 2, 'LLMs are designed to predict the next word, meaning they will confidently lie and present it as absolute truth if they lack real data.'),
('q-mock-1', 'True or False: AI-generated voices can now spoof a human voice with just 3 seconds of audio.', '["True", "False", "Only for English speakers", "Only for robots"]'::jsonb, 0, 'Microsoft''s VALL-E and other advanced models can clone a voice perfectly with just a 3-second sample.');

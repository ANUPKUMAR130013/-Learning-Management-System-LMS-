/*
# Learning Management System Database Schema

This migration creates the complete database schema for a Learning Management System with:

1. User Profiles
- Extended user data linked to Supabase auth.users
- Role-based access (student/instructor/admin)
- Profile information including avatar and bio

2. Courses
- Course catalog with title, description, thumbnail
- Instructor ownership and publishing status
- Categories and difficulty levels

3. Modules
- Course sections/units for organizing content
- Ordered within a course

4. Lessons
- Individual learning units within modules
- Support for video, text, and rich content
- Duration and order tracking

5. Enrollments
- Student-course relationships
- Progress tracking and completion status

6. Lesson Progress
- Track completed lessons per student
- Time spent and notes

7. Quizzes
- Assessments tied to lessons
- Multiple question types

8. Quiz Questions & Options
- Question content with multiple choice options
- Correct answer tracking

9. Quiz Attempts
- Student submissions for quizzes
- Score and answer tracking

Security:
- RLS enabled on all tables
- Owner-scoped access for instructors
- Enrollment-based access for students
- Admin full access via service role
*/

-- Enable the uuid extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Profiles table (extends auth.users)
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text NOT NULL,
  full_name text,
  avatar_url text,
  bio text,
  role text NOT NULL DEFAULT 'student' CHECK (role IN ('student', 'instructor', 'admin')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Courses table
CREATE TABLE IF NOT EXISTS courses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  thumbnail_url text,
  instructor_id uuid NOT NULL DEFAULT auth.uid() REFERENCES profiles(id) ON DELETE CASCADE,
  category text,
  level text DEFAULT 'beginner' CHECK (level IN ('beginner', 'intermediate', 'advanced')),
  price decimal(10,2) DEFAULT 0,
  is_published boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Modules table (course sections)
CREATE TABLE IF NOT EXISTS modules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id uuid NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  order_index int NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Lessons table
CREATE TABLE IF NOT EXISTS lessons (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  module_id uuid NOT NULL REFERENCES modules(id) ON DELETE CASCADE,
  title text NOT NULL,
  content text,
  video_url text,
  duration_minutes int DEFAULT 0,
  order_index int NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enrollments table (students in courses)
CREATE TABLE IF NOT EXISTS enrollments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid NOT NULL DEFAULT auth.uid() REFERENCES profiles(id) ON DELETE CASCADE,
  course_id uuid NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  enrolled_at timestamptz DEFAULT now(),
  completed_at timestamptz,
  progress decimal(5,2) DEFAULT 0,
  UNIQUE(student_id, course_id)
);

-- Lesson progress table
CREATE TABLE IF NOT EXISTS lesson_progress (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid NOT NULL DEFAULT auth.uid() REFERENCES profiles(id) ON DELETE CASCADE,
  lesson_id uuid NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
  is_completed boolean DEFAULT false,
  time_spent_seconds int DEFAULT 0,
  notes text,
  completed_at timestamptz,
  created_at timestamptz DEFAULT now(),
  UNIQUE(student_id, lesson_id)
);

-- Quizzes table
CREATE TABLE IF NOT EXISTS quizzes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lesson_id uuid NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  passing_score int DEFAULT 70,
  max_attempts int DEFAULT 3,
  created_at timestamptz DEFAULT now()
);

-- Quiz questions table
CREATE TABLE IF NOT EXISTS quiz_questions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  quiz_id uuid NOT NULL REFERENCES quizzes(id) ON DELETE CASCADE,
  question_text text NOT NULL,
  question_type text DEFAULT 'multiple_choice' CHECK (question_type IN ('multiple_choice', 'true_false', 'short_answer')),
  order_index int NOT NULL DEFAULT 0,
  points int DEFAULT 1,
  created_at timestamptz DEFAULT now()
);

-- Quiz options table (for multiple choice)
CREATE TABLE IF NOT EXISTS quiz_options (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  question_id uuid NOT NULL REFERENCES quiz_questions(id) ON DELETE CASCADE,
  option_text text NOT NULL,
  is_correct boolean DEFAULT false,
  order_index int NOT NULL DEFAULT 0
);

-- Quiz attempts table (student submissions)
CREATE TABLE IF NOT EXISTS quiz_attempts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  quiz_id uuid NOT NULL REFERENCES quizzes(id) ON DELETE CASCADE,
  student_id uuid NOT NULL DEFAULT auth.uid() REFERENCES profiles(id) ON DELETE CASCADE,
  score decimal(5,2),
  passed boolean DEFAULT false,
  attempt_number int NOT NULL DEFAULT 1,
  answers jsonb DEFAULT '{}',
  submitted_at timestamptz DEFAULT now()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_courses_instructor ON courses(instructor_id);
CREATE INDEX IF NOT EXISTS idx_courses_published ON courses(is_published);
CREATE INDEX IF NOT EXISTS idx_modules_course ON modules(course_id);
CREATE INDEX IF NOT EXISTS idx_lessons_module ON lessons(module_id);
CREATE INDEX IF NOT EXISTS idx_enrollments_student ON enrollments(student_id);
CREATE INDEX IF NOT EXISTS idx_enrollments_course ON enrollments(course_id);
CREATE INDEX IF NOT EXISTS idx_lesson_progress_student ON lesson_progress(student_id);
CREATE INDEX IF NOT EXISTS idx_quiz_questions_quiz ON quiz_questions(quiz_id);
CREATE INDEX IF NOT EXISTS idx_quiz_options_question ON quiz_options(question_id);
CREATE INDEX IF NOT EXISTS idx_quiz_attempts_student ON quiz_attempts(student_id);

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE lesson_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE quizzes ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_attempts ENABLE ROW LEVEL SECURITY;

-- Profiles policies
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
CREATE POLICY "Users can view own profile" ON profiles FOR SELECT
  TO authenticated USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE
  TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
CREATE POLICY "Users can insert own profile" ON profiles FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Profiles are viewable by authenticated users" ON profiles;
CREATE POLICY "Profiles are viewable by authenticated users" ON profiles FOR SELECT
  TO authenticated USING (true);

-- Courses policies
DROP POLICY IF EXISTS "Published courses are viewable by all" ON courses;
CREATE POLICY "Published courses are viewable by all" ON courses FOR SELECT
  TO authenticated USING (is_published = true OR auth.uid() = instructor_id);

DROP POLICY IF EXISTS "Instructors can create courses" ON courses;
CREATE POLICY "Instructors can create courses" ON courses FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = instructor_id);

DROP POLICY IF EXISTS "Instructors can update own courses" ON courses;
CREATE POLICY "Instructors can update own courses" ON courses FOR UPDATE
  TO authenticated USING (auth.uid() = instructor_id) WITH CHECK (auth.uid() = instructor_id);

DROP POLICY IF EXISTS "Instructors can delete own courses" ON courses;
CREATE POLICY "Instructors can delete own courses" ON courses FOR DELETE
  TO authenticated USING (auth.uid() = instructor_id);

-- Modules policies (accessible if enrolled or owner)
DROP POLICY IF EXISTS "Modules viewable by enrolled or instructor" ON modules;
CREATE POLICY "Modules viewable by enrolled or instructor" ON modules FOR SELECT
  TO authenticated USING (
    EXISTS (SELECT 1 FROM courses WHERE courses.id = modules.course_id AND (courses.instructor_id = auth.uid() OR EXISTS (SELECT 1 FROM enrollments WHERE enrollments.course_id = courses.id AND enrollments.student_id = auth.uid())))
  );

DROP POLICY IF EXISTS "Instructors can manage modules" ON modules;
CREATE POLICY "Instructors can manage modules" ON modules FOR ALL
  TO authenticated USING (
    EXISTS (SELECT 1 FROM courses WHERE courses.id = modules.course_id AND courses.instructor_id = auth.uid())
  ) WITH CHECK (
    EXISTS (SELECT 1 FROM courses WHERE courses.id = modules.course_id AND courses.instructor_id = auth.uid())
  );

-- Lessons policies (accessible if enrolled or owner)
DROP POLICY IF EXISTS "Lessons viewable by enrolled or instructor" ON lessons;
CREATE POLICY "Lessons viewable by enrolled or instructor" ON lessons FOR SELECT
  TO authenticated USING (
    EXISTS (SELECT 1 FROM modules JOIN courses ON courses.id = modules.course_id WHERE modules.id = lessons.module_id AND (courses.instructor_id = auth.uid() OR EXISTS (SELECT 1 FROM enrollments WHERE enrollments.course_id = courses.id AND enrollments.student_id = auth.uid())))
  );

DROP POLICY IF EXISTS "Instructors can manage lessons" ON lessons;
CREATE POLICY "Instructors can manage lessons" ON lessons FOR ALL
  TO authenticated USING (
    EXISTS (SELECT 1 FROM modules JOIN courses ON courses.id = modules.course_id WHERE modules.id = lessons.module_id AND courses.instructor_id = auth.uid())
  ) WITH CHECK (
    EXISTS (SELECT 1 FROM modules JOIN courses ON courses.id = modules.course_id WHERE modules.id = lessons.module_id AND courses.instructor_id = auth.uid())
  );

-- Enrollments policies
DROP POLICY IF EXISTS "Students can view own enrollments" ON enrollments;
CREATE POLICY "Students can view own enrollments" ON enrollments FOR SELECT
  TO authenticated USING (auth.uid() = student_id);

DROP POLICY IF EXISTS "Students can enroll in courses" ON enrollments;
CREATE POLICY "Students can enroll in courses" ON enrollments FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = student_id);

DROP POLICY IF EXISTS "Students can update own enrollments" ON enrollments;
CREATE POLICY "Students can update own enrollments" ON enrollments FOR UPDATE
  TO authenticated USING (auth.uid() = student_id) WITH CHECK (auth.uid() = student_id);

-- Lesson progress policies
DROP POLICY IF EXISTS "Students can view own progress" ON lesson_progress;
CREATE POLICY "Students can view own progress" ON lesson_progress FOR SELECT
  TO authenticated USING (auth.uid() = student_id);

DROP POLICY IF EXISTS "Students can insert own progress" ON lesson_progress;
CREATE POLICY "Students can insert own progress" ON lesson_progress FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = student_id);

DROP POLICY IF EXISTS "Students can update own progress" ON lesson_progress;
CREATE POLICY "Students can update own progress" ON lesson_progress FOR UPDATE
  TO authenticated USING (auth.uid() = student_id) WITH CHECK (auth.uid() = student_id);

-- Quiz policies
DROP POLICY IF EXISTS "Quizzes viewable by enrolled or instructor" ON quizzes;
CREATE POLICY "Quizzes viewable by enrolled or instructor" ON quizzes FOR SELECT
  TO authenticated USING (
    EXISTS (SELECT 1 FROM lessons JOIN modules ON modules.id = lessons.module_id JOIN courses ON courses.id = modules.course_id WHERE lessons.id = quizzes.lesson_id AND (courses.instructor_id = auth.uid() OR EXISTS (SELECT 1 FROM enrollments WHERE enrollments.course_id = courses.id AND enrollments.student_id = auth.uid())))
  );

DROP POLICY IF EXISTS "Instructors can manage quizzes" ON quizzes;
CREATE POLICY "Instructors can manage quizzes" ON quizzes FOR ALL
  TO authenticated USING (
    EXISTS (SELECT 1 FROM lessons JOIN modules ON modules.id = lessons.module_id JOIN courses ON courses.id = modules.course_id WHERE lessons.id = quizzes.lesson_id AND courses.instructor_id = auth.uid())
  ) WITH CHECK (
    EXISTS (SELECT 1 FROM lessons JOIN modules ON modules.id = lessons.module_id JOIN courses ON courses.id = modules.course_id WHERE lessons.id = quizzes.lesson_id AND courses.instructor_id = auth.uid())
  );

-- Quiz questions policies (same as quizzes)
DROP POLICY IF EXISTS "Questions viewable by enrolled or instructor" ON quiz_questions;
CREATE POLICY "Questions viewable by enrolled or instructor" ON quiz_questions FOR SELECT
  TO authenticated USING (
    EXISTS (SELECT 1 FROM quizzes JOIN lessons ON lessons.id = quizzes.lesson_id JOIN modules ON modules.id = lessons.module_id JOIN courses ON courses.id = modules.course_id WHERE quizzes.id = quiz_questions.quiz_id AND (courses.instructor_id = auth.uid() OR EXISTS (SELECT 1 FROM enrollments WHERE enrollments.course_id = courses.id AND enrollments.student_id = auth.uid())))
  );

DROP POLICY IF EXISTS "Instructors can manage questions" ON quiz_questions;
CREATE POLICY "Instructors can manage questions" ON quiz_questions FOR ALL
  TO authenticated USING (
    EXISTS (SELECT 1 FROM quizzes JOIN lessons ON lessons.id = quizzes.lesson_id JOIN modules ON modules.id = lessons.module_id JOIN courses ON courses.id = modules.course_id WHERE quizzes.id = quiz_questions.quiz_id AND courses.instructor_id = auth.uid())
  ) WITH CHECK (
    EXISTS (SELECT 1 FROM quizzes JOIN lessons ON lessons.id = quizzes.lesson_id JOIN modules ON modules.id = lessons.module_id JOIN courses ON courses.id = modules.course_id WHERE quizzes.id = quiz_questions.quiz_id AND courses.instructor_id = auth.uid())
  );

-- Quiz options policies (same as questions)
DROP POLICY IF EXISTS "Options viewable by enrolled or instructor" ON quiz_options;
CREATE POLICY "Options viewable by enrolled or instructor" ON quiz_options FOR SELECT
  TO authenticated USING (
    EXISTS (SELECT 1 FROM quiz_questions JOIN quizzes ON quizzes.id = quiz_questions.quiz_id JOIN lessons ON lessons.id = quizzes.lesson_id JOIN modules ON modules.id = lessons.module_id JOIN courses ON courses.id = modules.course_id WHERE quiz_questions.id = quiz_options.question_id AND (courses.instructor_id = auth.uid() OR EXISTS (SELECT 1 FROM enrollments WHERE enrollments.course_id = courses.id AND enrollments.student_id = auth.uid())))
  );

DROP POLICY IF EXISTS "Instructors can manage options" ON quiz_options;
CREATE POLICY "Instructors can manage options" ON quiz_options FOR ALL
  TO authenticated USING (
    EXISTS (SELECT 1 FROM quiz_questions JOIN quizzes ON quizzes.id = quiz_questions.quiz_id JOIN lessons ON lessons.id = quizzes.lesson_id JOIN modules ON modules.id = lessons.module_id JOIN courses ON courses.id = modules.course_id WHERE quiz_questions.id = quiz_options.question_id AND courses.instructor_id = auth.uid())
  ) WITH CHECK (
    EXISTS (SELECT 1 FROM quiz_questions JOIN quizzes ON quizzes.id = quiz_questions.quiz_id JOIN lessons ON lessons.id = quizzes.lesson_id JOIN modules ON modules.id = lessons.module_id JOIN courses ON courses.id = modules.course_id WHERE quiz_questions.id = quiz_options.question_id AND courses.instructor_id = auth.uid())
  );

-- Quiz attempts policies
DROP POLICY IF EXISTS "Students can view own attempts" ON quiz_attempts;
CREATE POLICY "Students can view own attempts" ON quiz_attempts FOR SELECT
  TO authenticated USING (auth.uid() = student_id);

DROP POLICY IF EXISTS "Students can submit attempts" ON quiz_attempts;
CREATE POLICY "Students can submit attempts" ON quiz_attempts FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = student_id);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for updated_at
DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_courses_updated_at ON courses;
CREATE TRIGGER update_courses_updated_at BEFORE UPDATE ON courses FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_modules_updated_at ON modules;
CREATE TRIGGER update_modules_updated_at BEFORE UPDATE ON modules FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_lessons_updated_at ON lessons;
CREATE TRIGGER update_lessons_updated_at BEFORE UPDATE ON lessons FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to handle new user signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (NEW.id, NEW.email, COALESCE(NEW.raw_user_meta_data->>'full_name', 'Student'), 'student');
  RETURN NEW;
END;
$$ language 'plpgsql' security definer;

-- Trigger to create profile on user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION handle_new_user();
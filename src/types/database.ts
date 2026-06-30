export type UserRole = 'student' | 'instructor' | 'admin';

export interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  bio: string | null;
  role: UserRole;
  created_at: string;
  updated_at: string;
}

export interface Course {
  id: string;
  title: string;
  description: string | null;
  thumbnail_url: string | null;
  instructor_id: string;
  category: string | null;
  level: 'beginner' | 'intermediate' | 'advanced';
  price: number;
  is_published: boolean;
  created_at: string;
  updated_at: string;
  instructor?: Profile;
  enrollment_count?: number;
}

export interface Module {
  id: string;
  course_id: string;
  title: string;
  description: string | null;
  order_index: number;
  created_at: string;
  updated_at: string;
}

export interface Lesson {
  id: string;
  module_id: string;
  title: string;
  content: string | null;
  video_url: string | null;
  duration_minutes: number;
  order_index: number;
  created_at: string;
  updated_at: string;
  module?: Module;
}

export interface Enrollment {
  id: string;
  student_id: string;
  course_id: string;
  enrolled_at: string;
  completed_at: string | null;
  progress: number;
  course?: Course;
}

export interface LessonProgress {
  id: string;
  student_id: string;
  lesson_id: string;
  is_completed: boolean;
  time_spent_seconds: number;
  notes: string | null;
  completed_at: string | null;
  created_at: string;
}

export interface Quiz {
  id: string;
  lesson_id: string;
  title: string;
  description: string | null;
  passing_score: number;
  max_attempts: number;
  created_at: string;
}

export interface QuizQuestion {
  id: string;
  quiz_id: string;
  question_text: string;
  question_type: 'multiple_choice' | 'true_false' | 'short_answer';
  order_index: number;
  points: number;
  created_at: string;
  options?: QuizOption[];
}

export interface QuizOption {
  id: string;
  question_id: string;
  option_text: string;
  is_correct: boolean;
  order_index: number;
}

export interface QuizAttempt {
  id: string;
  quiz_id: string;
  student_id: string;
  score: number | null;
  passed: boolean;
  attempt_number: number;
  answers: Record<string, string>;
  submitted_at: string;
}

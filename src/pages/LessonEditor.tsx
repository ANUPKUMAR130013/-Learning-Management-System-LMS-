import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { Lesson, Module, Quiz, QuizQuestion, QuizOption } from '../types/database';
import {
  Save,
  ArrowLeft,
  Loader2,
  FileText,
  Play,
  Award,
  Plus,
  Trash2,
  CheckCircle,
} from 'lucide-react';

export function LessonEditor() {
  const { lessonId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [module, setModule] = useState<Module | null>(null);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [durationMinutes, setDurationMinutes] = useState(0);
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [questions, setQuestions] = useState<(QuizQuestion & { options: QuizOption[] })[]>([]);
  const [editingQuestion, setEditingQuestion] = useState<string | null>(null);

  useEffect(() => {
    if (lessonId) {
      fetchLesson();
    }
  }, [lessonId]);

  async function fetchLesson() {
    setLoading(true);

    const { data: lessonData } = await supabase
      .from('lessons')
      .select('*, module:modules(*)')
      .eq('id', lessonId)
      .maybeSingle();

    if (!lessonData) {
      setLoading(false);
      return;
    }

    const { data: courseData } = await supabase
      .from('courses')
      .select('instructor_id')
      .eq('id', lessonData.module.course_id)
      .maybeSingle();

    if (!courseData || courseData.instructor_id !== user!.id) {
      navigate('/instructor');
      setLoading(false);
      return;
    }

    setLesson(lessonData);
    setModule(lessonData.module);
    setTitle(lessonData.title);
    setContent(lessonData.content || '');
    setVideoUrl(lessonData.video_url || '');
    setDurationMinutes(lessonData.duration_minutes || 0);

    const { data: quizData } = await supabase
      .from('quizzes')
      .select('*')
      .eq('lesson_id', lessonId)
      .maybeSingle();

    if (quizData) {
      setQuiz(quizData);

      const { data: questionsData } = await supabase
        .from('quiz_questions')
        .select('*')
        .eq('quiz_id', quizData.id)
        .order('order_index');

      if (questionsData) {
        const questionsWithOptions = await Promise.all(
          questionsData.map(async (q) => {
            const { data: options } = await supabase
              .from('quiz_options')
              .select('*')
              .eq('question_id', q.id)
              .order('order_index');
            return { ...q, options: options || [] };
          })
        );
        setQuestions(questionsWithOptions);
      }
    }

    setLoading(false);
  }

  async function handleSaveLesson() {
    if (!lesson || saving) return;

    setSaving(true);

    const { error } = await supabase
      .from('lessons')
      .update({
        title,
        content,
        video_url: videoUrl || null,
        duration_minutes: durationMinutes,
      })
      .eq('id', lesson.id);

    if (!error) {
      setLesson({ ...lesson, title, content, video_url: videoUrl || null, duration_minutes: durationMinutes });
    }

    setSaving(false);
  }

  async function handleCreateQuiz() {
    if (quiz) return;

    const title = prompt('Quiz title:');
    if (!title) return;

    const { data, error } = await supabase
      .from('quizzes')
      .insert({
        lesson_id: lessonId!,
        title,
        passing_score: 70,
        max_attempts: 3,
      })
      .select()
      .single();

    if (!error && data) {
      setQuiz(data);
    }
  }

  async function handleAddQuestion() {
    if (!quiz) return;

    const questionText = prompt('Question text:');
    if (!questionText) return;

    const { data, error } = await supabase
      .from('quiz_questions')
      .insert({
        quiz_id: quiz.id,
        question_text: questionText,
        question_type: 'multiple_choice',
        order_index: questions.length,
        points: 1,
      })
      .select()
      .single();

    if (!error && data) {
      const newQuestion = { ...data, options: [] };
      setQuestions([...questions, newQuestion]);

      for (let i = 0; i < 4; i++) {
        const optionText = prompt(`Option ${i + 1}${i === 0 ? ' (correct answer)' : ''}:`);
        if (!optionText) continue;

        await supabase.from('quiz_options').insert({
          question_id: data.id,
          option_text: optionText,
          is_correct: i === 0,
          order_index: i,
        });
      }

      const { data: optionsData } = await supabase
        .from('quiz_options')
        .select('*')
        .eq('question_id', data.id)
        .order('order_index');

      setQuestions((prev) =>
        prev.map((q) =>
          q.id === data.id ? { ...q, options: optionsData || [] } : q
        )
      );
    }
  }

  async function handleDeleteQuestion(questionId: string) {
    if (!confirm('Delete this question?')) return;

    await supabase.from('quiz_questions').delete().eq('id', questionId);
    setQuestions((prev) => prev.filter((q) => q.id !== questionId));
  }

  async function handleDeleteQuiz() {
    if (!quiz || !confirm('Delete this quiz and all its questions?')) return;

    await supabase.from('quizzes').delete().eq('id', quiz.id);
    setQuiz(null);
    setQuestions([]);
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-emerald-400 animate-spin" />
      </div>
    );
  }

  if (!lesson) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-center">
          <FileText className="w-16 h-16 text-slate-600 mx-auto mb-4" />
          <h2 className="text-xl font-medium text-white mb-2">Lesson not found</h2>
          <Link to="/instructor" className="text-emerald-400 hover:text-emerald-300">
            Back to dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <Link
            to={`/instructor/courses/${module?.course_id}`}
            className="inline-flex items-center gap-2 text-slate-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to course
          </Link>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
          <div className="p-6 border-b border-slate-800">
            <h1 className="text-xl font-semibold text-white">Edit Lesson</h1>
            <p className="text-sm text-slate-400 mt-1">{module?.title}</p>
          </div>

          <div className="p-6 space-y-6">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Lesson Title *
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Video URL (YouTube, Vimeo, etc.)
              </label>
              <div className="relative">
                <Play className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                <input
                  type="text"
                  value={videoUrl}
                  onChange={(e) => setVideoUrl(e.target.value)}
                  className="w-full pl-11 pr-4 py-2.5 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500"
                  placeholder="https://..."
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Duration (minutes)
              </label>
              <input
                type="number"
                value={durationMinutes}
                onChange={(e) => setDurationMinutes(parseInt(e.target.value) || 0)}
                className="w-32 px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500"
                min={0}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Content
              </label>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={10}
                className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 resize-none font-mono text-sm"
                placeholder="Write your lesson content here... (HTML supported)"
              />
            </div>

            <div className="flex justify-end pt-4 border-t border-slate-800">
              <button
                onClick={handleSaveLesson}
                disabled={saving || !title.trim()}
                className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-emerald-500 to-cyan-500 text-white font-medium rounded-lg hover:from-emerald-600 hover:to-cyan-600 disabled:opacity-50 transition-all"
              >
                {saving ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                Save Lesson
              </button>
            </div>
          </div>
        </div>

        <div className="mt-6 bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
          <div className="p-6 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-emerald-500/10 rounded-lg flex items-center justify-center">
                <Award className="w-5 h-5 text-emerald-400" />
              </div>
              <div>
                <h2 className="font-semibold text-white">Quiz</h2>
                <p className="text-sm text-slate-400">
                  {quiz ? `${questions.length} questions` : 'Add a quiz to test students'}
                </p>
              </div>
            </div>
            {quiz && (
              <button
                onClick={handleDeleteQuiz}
                className="px-3 py-1.5 text-sm text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors"
              >
                Delete Quiz
              </button>
            )}
          </div>

          <div className="p-6">
            {!quiz ? (
              <button
                onClick={handleCreateQuiz}
                className="w-full py-8 border-2 border-dashed border-slate-700 rounded-xl text-slate-400 hover:border-emerald-500/50 hover:text-emerald-400 transition-colors flex items-center justify-center gap-2"
              >
                <Plus className="w-5 h-5" />
                Create Quiz
              </button>
            ) : (
              <div className="space-y-4">
                {questions.map((question, index) => (
                  <div
                    key={question.id}
                    className="bg-slate-800/50 border border-slate-700 rounded-xl p-4"
                  >
                    <div className="flex items-start justify-between gap-4 mb-3">
                      <div className="flex-1">
                        <span className="text-xs text-slate-500">Question {index + 1}</span>
                        <p className="text-white mt-1">{question.question_text}</p>
                      </div>
                      <button
                        onClick={() => handleDeleteQuestion(question.id)}
                        className="text-slate-400 hover:text-rose-400 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      {question.options.map((option) => (
                        <div
                          key={option.id}
                          className={`p-2 rounded-lg text-sm ${
                            option.is_correct
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                              : 'bg-slate-700/50 text-slate-400'
                          }`}
                        >
                          {option.is_correct && (
                            <CheckCircle className="w-3 h-3 inline mr-1" />
                          )}
                          {option.option_text}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}

                <button
                  onClick={handleAddQuestion}
                  className="w-full py-3 text-sm text-slate-400 hover:text-white border border-slate-700 rounded-lg hover:bg-slate-800 transition-colors flex items-center justify-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Add Question
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

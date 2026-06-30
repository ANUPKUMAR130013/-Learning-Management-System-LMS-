import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { Module, Lesson, LessonProgress, Quiz } from '../types/database';
import {
  BookOpen,
  ChevronLeft,
  ChevronRight,
  CheckCircle,
  Loader2,
  Play,
  FileText,
  Award,
} from 'lucide-react';

export function LessonViewer() {
  const { courseId, lessonId } = useParams();
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [module, setModule] = useState<Module | null>(null);
  const [allModules, setAllModules] = useState<(Module & { lessons: Lesson[] })[]>([]);
  const [progress, setProgress] = useState<LessonProgress | null>(null);
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [markingComplete, setMarkingComplete] = useState(false);
  const [notes, setNotes] = useState('');
  const [savingNotes, setSavingNotes] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (lessonId && user) {
      fetchLessonData();
    }
  }, [lessonId, user]);

  async function fetchLessonData() {
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

    setLesson(lessonData);
    setModule(lessonData.module);

    const { data: modulesData } = await supabase
      .from('modules')
      .select('*')
      .eq('course_id', courseId)
      .order('order_index');

    if (modulesData) {
      const modulesWithLessons = await Promise.all(
        modulesData.map(async (m) => {
          const { data: lessons } = await supabase
            .from('lessons')
            .select('*')
            .eq('module_id', m.id)
            .order('order_index');
          return { ...m, lessons: lessons || [] };
        })
      );
      setAllModules(modulesWithLessons);
    }

    const { data: progressData } = await supabase
      .from('lesson_progress')
      .select('*')
      .eq('student_id', user!.id)
      .eq('lesson_id', lessonId)
      .maybeSingle();

    if (progressData) {
      setProgress(progressData);
      setNotes(progressData.notes || '');
    }

    const { data: quizData } = await supabase
      .from('quizzes')
      .select('*')
      .eq('lesson_id', lessonId)
      .maybeSingle();

    if (quizData) {
      setQuiz(quizData);
    }

    setLoading(false);
  }

  async function markLessonComplete() {
    if (!lesson || markingComplete) return;

    setMarkingComplete(true);

    const now = new Date().toISOString();

    if (progress) {
      const { error } = await supabase
        .from('lesson_progress')
        .update({
          is_completed: true,
          completed_at: now,
        })
        .eq('id', progress.id);

      if (!error) {
        setProgress({ ...progress, is_completed: true, completed_at: now });
      }
    } else {
      const { data, error } = await supabase
        .from('lesson_progress')
        .insert({
          student_id: user!.id,
          lesson_id: lessonId!,
          is_completed: true,
          completed_at: now,
        })
        .select()
        .single();

      if (!error && data) {
        setProgress(data);
      }
    }

    await updateCourseProgress();
    setMarkingComplete(false);
  }

  async function updateCourseProgress() {
    const allLessons = allModules.flatMap((m) => m.lessons);
    const { data: completedData } = await supabase
      .from('lesson_progress')
      .select('lesson_id')
      .eq('student_id', user!.id)
      .eq('is_completed', true)
      .in('lesson_id', allLessons.map((l) => l.id));

    const completedCount = completedData?.length || 0;
    const totalLessons = allLessons.length;
    const progressPercent =
      totalLessons > 0 ? (completedCount / totalLessons) * 100 : 0;

    await supabase
      .from('enrollments')
      .update({ progress: progressPercent })
      .eq('student_id', user!.id)
      .eq('course_id', courseId);
  }

  async function saveNotes() {
    if (!progress || savingNotes) return;

    setSavingNotes(true);
    const { error } = await supabase
      .from('lesson_progress')
      .update({ notes })
      .eq('id', progress.id);

    if (!error) {
      setProgress({ ...progress, notes });
    }
    setSavingNotes(false);
  }

  function getNextLesson() {
    for (const m of allModules) {
      const currentIndex = m.lessons.findIndex((l) => l.id === lessonId);
      if (currentIndex !== -1) {
        if (currentIndex < m.lessons.length - 1) {
          return m.lessons[currentIndex + 1];
        } else {
          const moduleIndex = allModules.findIndex((mod) => mod.id === m.id);
          if (moduleIndex < allModules.length - 1) {
            const nextModule = allModules[moduleIndex + 1];
            if (nextModule.lessons.length > 0) {
              return nextModule.lessons[0];
            }
          }
        }
        break;
      }
    }
    return null;
  }

  function getPrevLesson() {
    for (const m of allModules) {
      const currentIndex = m.lessons.findIndex((l) => l.id === lessonId);
      if (currentIndex !== -1) {
        if (currentIndex > 0) {
          return m.lessons[currentIndex - 1];
        } else {
          const moduleIndex = allModules.findIndex((mod) => mod.id === m.id);
          if (moduleIndex > 0) {
            const prevModule = allModules[moduleIndex - 1];
            if (prevModule.lessons.length > 0) {
              return prevModule.lessons[prevModule.lessons.length - 1];
            }
          }
        }
        break;
      }
    }
    return null;
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
          <BookOpen className="w-16 h-16 text-slate-600 mx-auto mb-4" />
          <h2 className="text-xl font-medium text-white mb-2">Lesson not found</h2>
          <Link to={`/courses/${courseId}`} className="text-emerald-400 hover:text-emerald-300">
            Back to course
          </Link>
        </div>
      </div>
    );
  }

  const nextLesson = getNextLesson();
  const prevLesson = getPrevLesson();

  return (
    <div className="min-h-screen bg-slate-950 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <Link
            to={`/courses/${courseId}`}
            className="inline-flex items-center gap-2 text-slate-400 hover:text-white transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            Back to course
          </Link>
        </div>

        <div className="grid lg:grid-cols-4 gap-6">
          <div className="lg:col-span-3">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
              {lesson.video_url ? (
                <div className="aspect-video bg-slate-800">
                  <iframe
                    src={lesson.video_url}
                    className="w-full h-full"
                    allowFullScreen
                    title={lesson.title}
                  />
                </div>
              ) : (
                <div className="aspect-video bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center">
                  <div className="text-center">
                    <Play className="w-16 h-16 text-slate-600 mx-auto mb-4" />
                    <p className="text-slate-500">No video available for this lesson</p>
                  </div>
                </div>
              )}

              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <p className="text-sm text-slate-400 mb-1">{module?.title}</p>
                    <h1 className="text-2xl font-bold text-white">{lesson.title}</h1>
                  </div>
                  {progress?.is_completed && (
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-500/10 rounded-full">
                      <CheckCircle className="w-4 h-4 text-emerald-400" />
                      <span className="text-sm text-emerald-400 font-medium">Completed</span>
                    </div>
                  )}
                </div>

                {lesson.content && (
                  <div
                    ref={contentRef}
                    className="prose prose-invert prose-slate max-w-none mb-6"
                    dangerouslySetInnerHTML={{ __html: lesson.content }}
                  />
                )}

                {!lesson.content && !lesson.video_url && (
                  <div className="text-center py-12">
                    <FileText className="w-12 h-12 text-slate-600 mx-auto mb-4" />
                    <p className="text-slate-400">No content available for this lesson.</p>
                  </div>
                )}

                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-slate-800">
                  <div className="flex items-center gap-3">
                    {prevLesson && (
                      <Link
                        to={`/courses/${courseId}/lessons/${prevLesson.id}`}
                        className="flex items-center gap-2 px-4 py-2 bg-slate-800 text-slate-300 rounded-lg hover:bg-slate-700 hover:text-white transition-colors"
                      >
                        <ChevronLeft className="w-4 h-4" />
                        Previous
                      </Link>
                    )}

                    {nextLesson && (
                      <Link
                        to={`/courses/${courseId}/lessons/${nextLesson.id}`}
                        className="flex items-center gap-2 px-4 py-2 bg-slate-800 text-slate-300 rounded-lg hover:bg-slate-700 hover:text-white transition-colors"
                      >
                        Next
                        <ChevronRight className="w-4 h-4" />
                      </Link>
                    )}
                  </div>

                  {!progress?.is_completed ? (
                    <button
                      onClick={markLessonComplete}
                      disabled={markingComplete}
                      className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-emerald-500 to-cyan-500 text-white font-medium rounded-lg hover:from-emerald-600 hover:to-cyan-600 disabled:opacity-50 transition-all"
                    >
                      {markingComplete ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <CheckCircle className="w-4 h-4" />
                      )}
                      Mark as Complete
                    </button>
                  ) : (
                    nextLesson && (
                      <Link
                        to={`/courses/${courseId}/lessons/${nextLesson.id}`}
                        className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-emerald-500 to-cyan-500 text-white font-medium rounded-lg hover:from-emerald-600 hover:to-cyan-600 transition-all"
                      >
                        Continue to Next
                        <ChevronRight className="w-4 h-4" />
                      </Link>
                    )
                  )}
                </div>
              </div>
            </div>

            {quiz && (
              <div className="mt-6 bg-slate-900 border border-slate-800 rounded-2xl p-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-emerald-500/10 rounded-xl flex items-center justify-center">
                    <Award className="w-6 h-6 text-emerald-400" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-white">{quiz.title}</h3>
                    <p className="text-sm text-slate-400">
                      Test your knowledge from this lesson
                    </p>
                  </div>
                  <Link
                    to={`/courses/${courseId}/lessons/${lessonId}/quiz`}
                    className="px-4 py-2 bg-emerald-500/10 text-emerald-400 font-medium rounded-lg hover:bg-emerald-500/20 transition-colors"
                  >
                    Take Quiz
                  </Link>
                </div>
              </div>
            )}
          </div>

          <div className="lg:col-span-1">
            <div className="sticky top-24">
              <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
                <div className="p-4 border-b border-slate-800">
                  <h3 className="font-semibold text-white">Course Content</h3>
                </div>
                <div className="max-h-[calc(100vh-300px)] overflow-y-auto">
                  {allModules.map((m) => (
                    <div key={m.id}>
                      <div className="px-4 py-3 bg-slate-800/50 border-b border-slate-800">
                        <p className="text-sm font-medium text-slate-300">{m.title}</p>
                      </div>
                      <div className="divide-y divide-slate-800">
                        {m.lessons.map((l) => {
                          const isActive = l.id === lessonId;
                          const isCompleted = l.id === lessonId
                            ? progress?.is_completed
                            : false;

                          return (
                            <Link
                              key={l.id}
                              to={`/courses/${courseId}/lessons/${l.id}`}
                              className={`flex items-center gap-3 p-4 hover:bg-slate-800/50 transition-colors ${
                                isActive ? 'bg-slate-800/50 border-l-2 border-l-emerald-500' : ''
                              }`}
                            >
                              <div className="w-6 h-6 bg-slate-800 rounded flex items-center justify-center shrink-0">
                                {isCompleted ? (
                                  <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                                ) : (
                                  <Play className="w-3 h-3 text-slate-400" />
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className={`text-sm truncate ${isActive ? 'text-white font-medium' : 'text-slate-400'}`}>
                                  {l.title}
                                </p>
                              </div>
                            </Link>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

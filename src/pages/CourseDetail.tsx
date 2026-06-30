import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { Course, Module, Lesson, Enrollment, Profile } from '../types/database';
import {
  BookOpen,
  Users,
  Clock,
  ChevronDown,
  ChevronRight,
  Play,
  CheckCircle,
  Loader2,
  ArrowLeft,
} from 'lucide-react';

export function CourseDetail() {
  const { courseId } = useParams();
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const [course, setCourse] = useState<Course & { instructor: Profile } | null>(null);
  const [modules, setModules] = useState<(Module & { lessons: Lesson[] })[]>([]);
  const [enrollment, setEnrollment] = useState<Enrollment | null>(null);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(false);
  const [expandedModules, setExpandedModules] = useState<string[]>([]);
  const [completedLessons, setCompletedLessons] = useState<string[]>([]);

  useEffect(() => {
    if (courseId) {
      fetchCourseData();
    }
  }, [courseId, user]);

  async function fetchCourseData() {
    setLoading(true);

    const { data: courseData } = await supabase
      .from('courses')
      .select(`
        *,
        instructor:profiles!courses_instructor_id_fkey(*)
      `)
      .eq('id', courseId)
      .maybeSingle();

    if (!courseData) {
      setLoading(false);
      return;
    }

    setCourse(courseData);

    if (user) {
      const { data: enrollmentData } = await supabase
        .from('enrollments')
        .select('*')
        .eq('student_id', user.id)
        .eq('course_id', courseId)
        .maybeSingle();

      if (enrollmentData) {
        setEnrollment(enrollmentData);

        const { data: progressData } = await supabase
          .from('lesson_progress')
          .select('lesson_id')
          .eq('student_id', user.id)
          .eq('is_completed', true);

        if (progressData) {
          setCompletedLessons(progressData.map((p) => p.lesson_id));
        }
      }
    }

    const { data: modulesData } = await supabase
      .from('modules')
      .select('*')
      .eq('course_id', courseId)
      .order('order_index');

    if (modulesData) {
      const modulesWithLessons = await Promise.all(
        modulesData.map(async (module) => {
          const { data: lessons } = await supabase
            .from('lessons')
            .select('*')
            .eq('module_id', module.id)
            .order('order_index');
          return { ...module, lessons: lessons || [] };
        })
      );
      setModules(modulesWithLessons);

      if (modulesWithLessons.length > 0) {
        setExpandedModules([modulesWithLessons[0].id]);
      }
    }

    setLoading(false);
  }

  async function handleEnroll() {
    if (!user) {
      navigate('/signin');
      return;
    }

    setEnrolling(true);

    const { data, error } = await supabase
      .from('enrollments')
      .insert({
        student_id: user.id,
        course_id: courseId!,
      })
      .select()
      .single();

    if (!error && data) {
      setEnrollment(data);
    }
    setEnrolling(false);
  }

  function toggleModule(moduleId: string) {
    setExpandedModules((prev) =>
      prev.includes(moduleId)
        ? prev.filter((id) => id !== moduleId)
        : [...prev, moduleId]
    );
  }

  const totalLessons = modules.reduce(
    (acc, module) => acc + module.lessons.length,
    0
  );
  const totalDuration = modules.reduce(
    (acc, module) =>
      acc +
      module.lessons.reduce(
        (lacc, lesson) => lacc + (lesson.duration_minutes || 0),
        0
      ),
    0
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-emerald-400 animate-spin" />
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-center">
          <BookOpen className="w-16 h-16 text-slate-600 mx-auto mb-4" />
          <h2 className="text-xl font-medium text-white mb-2">Course not found</h2>
          <Link to="/courses" className="text-emerald-400 hover:text-emerald-300">
            Browse courses
          </Link>
        </div>
      </div>
    );
  }

  const isOwner = user?.id === course.instructor_id;

  return (
    <div className="min-h-screen bg-slate-950">
      <div className="relative">
        <div className="absolute inset-0 h-80 bg-gradient-to-b from-emerald-500/10 to-transparent" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-16">
          <Link
            to="/courses"
            className="inline-flex items-center gap-2 text-slate-400 hover:text-white mb-6 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to courses
          </Link>

          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <div className="aspect-video bg-slate-800 rounded-2xl overflow-hidden mb-8">
                {course.thumbnail_url ? (
                  <img
                    src={course.thumbnail_url}
                    alt={course.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <BookOpen className="w-24 h-24 text-slate-600" />
                  </div>
                )}
              </div>

              <h1 className="text-3xl sm:text-4xl font-bold text-white mb-4">
                {course.title}
              </h1>

              <p className="text-slate-400 mb-6 leading-relaxed">
                {course.description}
              </p>

              <div className="flex flex-wrap items-center gap-6 text-sm text-slate-400 mb-8">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  <span>Instructor: {course.instructor?.full_name || 'Unknown'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <BookOpen className="w-4 h-4" />
                  <span>{totalLessons} lessons</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  <span>{totalDuration} minutes total</span>
                </div>
              </div>

              <div>
                <h2 className="text-xl font-semibold text-white mb-4">
                  Course Content
                </h2>
                <p className="text-slate-400 text-sm mb-6">
                  {modules.length} modules | {totalLessons} lessons | {totalDuration} minutes total
                </p>

                <div className="space-y-3">
                  {modules.map((module, moduleIndex) => {
                    const isExpanded = expandedModules.includes(module.id);
                    const completedCount = module.lessons.filter((l) =>
                      completedLessons.includes(l.id)
                    ).length;
                    const moduleProgress =
                      module.lessons.length > 0
                        ? Math.round(
                            (completedCount / module.lessons.length) * 100
                          )
                        : 0;

                    return (
                      <div
                        key={module.id}
                        className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden"
                      >
                        <button
                          onClick={() => toggleModule(module.id)}
                          className="w-full flex items-center justify-between p-4 hover:bg-slate-800/50 transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-slate-800 rounded-lg flex items-center justify-center">
                              {isExpanded ? (
                                <ChevronDown className="w-4 h-4 text-slate-400" />
                              ) : (
                                <ChevronRight className="w-4 h-4 text-slate-400" />
                              )}
                            </div>
                            <div className="text-left">
                              <h3 className="font-medium text-white">
                                {module.title}
                              </h3>
                              <p className="text-xs text-slate-400">
                                {module.lessons.length} lessons |{' '}
                                {moduleProgress}% complete
                              </p>
                            </div>
                          </div>
                        </button>

                        {isExpanded && module.lessons.length > 0 && (
                          <div className="border-t border-slate-800 divide-y divide-slate-800">
                            {module.lessons.map((lesson) => {
                              const isCompleted = completedLessons.includes(
                                lesson.id
                              );
                              const canAccess = enrollment || isOwner;

                              return (
                                <Link
                                  key={lesson.id}
                                  to={
                                    canAccess
                                      ? `/courses/${courseId}/lessons/${lesson.id}`
                                      : '#'
                                  }
                                  className={`flex items-center gap-3 p-4 hover:bg-slate-800/50 transition-colors ${
                                    !canAccess ? 'opacity-60 cursor-not-allowed' : ''
                                  }`}
                                  onClick={(e) => {
                                    if (!canAccess) e.preventDefault();
                                  }}
                                >
                                  <div className="w-8 h-8 bg-slate-800 rounded-lg flex items-center justify-center shrink-0">
                                    {isCompleted ? (
                                      <CheckCircle className="w-4 h-4 text-emerald-400" />
                                    ) : (
                                      <Play className="w-4 h-4 text-slate-400" />
                                    )}
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <p className="text-sm text-white truncate">
                                      {lesson.title}
                                    </p>
                                    <p className="text-xs text-slate-500">
                                      {lesson.duration_minutes} min
                                    </p>
                                  </div>
                                </Link>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="lg:col-span-1">
              <div className="sticky top-24 bg-slate-900 border border-slate-800 rounded-2xl p-6">
                {enrollment ? (
                  <>
                    <div className="mb-6">
                      <div className="flex justify-between text-sm mb-2">
                        <span className="text-slate-400">Your Progress</span>
                        <span className="text-white font-medium">
                          {Math.round(enrollment.progress)}%
                        </span>
                      </div>
                      <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-full"
                          style={{ width: `${enrollment.progress}%` }}
                        />
                      </div>
                    </div>

                    <Link
                      to={`/courses/${courseId}/lessons/${modules[0]?.lessons[0]?.id}`}
                      className="block w-full py-3 bg-gradient-to-r from-emerald-500 to-cyan-500 text-white font-medium rounded-xl text-center hover:from-emerald-600 hover:to-cyan-600 transition-all"
                    >
                      Continue Learning
                    </Link>
                  </>
                ) : isOwner ? (
                  <Link
                    to={`/instructor/courses/${courseId}`}
                    className="block w-full py-3 bg-gradient-to-r from-emerald-500 to-cyan-500 text-white font-medium rounded-xl text-center hover:from-emerald-600 hover:to-cyan-600 transition-all"
                  >
                    Manage Course
                  </Link>
                ) : (
                  <>
                    <div className="text-center mb-6">
                      <p className="text-4xl font-bold text-white mb-1">
                        {course.price > 0 ? `$${course.price}` : 'Free'}
                      </p>
                      <p className="text-slate-400 text-sm">One-time payment</p>
                    </div>

                    <button
                      onClick={handleEnroll}
                      disabled={enrolling}
                      className="w-full py-3 bg-gradient-to-r from-emerald-500 to-cyan-500 text-white font-medium rounded-xl hover:from-emerald-600 hover:to-cyan-600 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
                    >
                      {enrolling ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                      ) : (
                        <>
                          Enroll Now
                        </>
                      )}
                    </button>
                  </>
                )}

                <div className="mt-6 pt-6 border-t border-slate-800">
                  <h3 className="text-sm font-medium text-white mb-4">
                    This course includes:
                  </h3>
                  <ul className="space-y-3 text-sm text-slate-400">
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-emerald-400" />
                      {totalLessons} lessons
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-emerald-400" />
                      {totalDuration} minutes of content
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-emerald-400" />
                      Full lifetime access
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-emerald-400" />
                      Certificate of completion
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

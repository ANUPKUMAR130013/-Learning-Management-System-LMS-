import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { Course, Enrollment } from '../types/database';
import {
  BookOpen,
  Clock,
  TrendingUp,
  Award,
  Play,
  ChevronRight,
  Loader2,
} from 'lucide-react';

export function Dashboard() {
  const { user, profile } = useAuth();
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    enrolledCourses: 0,
    completedLessons: 0,
    hoursLearned: 0,
    certificates: 0,
  });

  useEffect(() => {
    if (user) {
      fetchDashboardData();
    }
  }, [user]);

  async function fetchDashboardData() {
    setLoading(true);

    const { data: enrollmentData } = await supabase
      .from('enrollments')
      .select(`
        *,
        course:courses(*)
      `)
      .eq('student_id', user!.id)
      .order('enrolled_at', { ascending: false });

    if (enrollmentData) {
      setEnrollments(enrollmentData);

      const completedLessons = await supabase
        .from('lesson_progress')
        .select('id', { count: 'exact' })
        .eq('student_id', user!.id)
        .eq('is_completed', true);

      const totalSeconds = await supabase
        .from('lesson_progress')
        .select('time_spent_seconds')
        .eq('student_id', user!.id);

      const hoursLearned = totalSeconds.data?.reduce(
        (acc, curr) => acc + (curr.time_spent_seconds || 0),
        0
      ) || 0;

      const certificates = enrollmentData.filter(e => e.completed_at).length;

      setStats({
        enrolledCourses: enrollmentData.length,
        completedLessons: completedLessons.count || 0,
        hoursLearned: Math.round(hoursLearned / 3600),
        certificates,
      });
    }

    setLoading(false);
  }

  const statCards = [
    {
      icon: BookOpen,
      label: 'Enrolled Courses',
      value: stats.enrolledCourses,
      color: 'text-emerald-400',
      bg: 'bg-emerald-500/10',
    },
    {
      icon: TrendingUp,
      label: 'Completed Lessons',
      value: stats.completedLessons,
      color: 'text-cyan-400',
      bg: 'bg-cyan-500/10',
    },
    {
      icon: Clock,
      label: 'Hours Learned',
      value: stats.hoursLearned,
      color: 'text-amber-400',
      bg: 'bg-amber-500/10',
    },
    {
      icon: Award,
      label: 'Certificates',
      value: stats.certificates,
      color: 'text-rose-400',
      bg: 'bg-rose-500/10',
    },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-emerald-400 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">
            Welcome back, {profile?.full_name?.split(' ')[0] || 'Student'}!
          </h1>
          <p className="text-slate-400">Continue your learning journey.</p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {statCards.map((stat, index) => (
            <div
              key={index}
              className="bg-slate-900 border border-slate-800 rounded-xl p-6"
            >
              <div className={`w-12 h-12 ${stat.bg} rounded-xl flex items-center justify-center mb-4`}>
                <stat.icon className={`w-6 h-6 ${stat.color}`} />
              </div>
              <p className="text-2xl font-bold text-white mb-1">{stat.value}</p>
              <p className="text-sm text-slate-400">{stat.label}</p>
            </div>
          ))}
        </div>

        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-white">My Courses</h2>
            <Link
              to="/courses"
              className="text-sm text-emerald-400 hover:text-emerald-300 flex items-center gap-1"
            >
              Browse all
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          {enrollments.length === 0 ? (
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-12 text-center">
              <BookOpen className="w-12 h-12 text-slate-600 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-white mb-2">No courses yet</h3>
              <p className="text-slate-400 mb-6">
                Start your learning journey by enrolling in a course.
              </p>
              <Link
                to="/courses"
                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-500 to-cyan-500 text-white font-medium rounded-xl hover:from-emerald-600 hover:to-cyan-600 transition-all"
              >
                Browse Courses
              </Link>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {enrollments.slice(0, 6).map((enrollment) => (
                <div
                  key={enrollment.id}
                  className="group bg-slate-900 border border-slate-800 rounded-xl overflow-hidden hover:border-slate-700 transition-all"
                >
                  <div className="aspect-video bg-slate-800 relative overflow-hidden">
                    {enrollment.course?.thumbnail_url ? (
                      <img
                        src={enrollment.course.thumbnail_url}
                        alt={enrollment.course.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-800 to-slate-900">
                        <BookOpen className="w-12 h-12 text-slate-600" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent" />
                  </div>
                  <div className="p-5">
                    <h3 className="font-semibold text-white mb-2 line-clamp-1">
                      {enrollment.course?.title}
                    </h3>
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-sm text-slate-400 capitalize">
                        {enrollment.course?.level}
                      </span>
                      <span className="text-sm text-slate-400">
                        {Math.round(enrollment.progress)}% complete
                      </span>
                    </div>
                    <div className="h-2 bg-slate-800 rounded-full overflow-hidden mb-4">
                      <div
                        className="h-full bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-full transition-all duration-500"
                        style={{ width: `${enrollment.progress}%` }}
                      />
                    </div>
                    <Link
                      to={`/courses/${enrollment.course_id}`}
                      className="flex items-center justify-center gap-2 w-full py-2 bg-emerald-500/10 text-emerald-400 rounded-lg hover:bg-emerald-500/20 transition-colors font-medium"
                    >
                      <Play className="w-4 h-4" />
                      Continue Learning
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

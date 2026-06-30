import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { Course } from '../types/database';
import {
  BookOpen,
  Plus,
  Users,
  TrendingUp,
  Edit3,
  Trash2,
  Eye,
  EyeOff,
  Loader2,
} from 'lucide-react';

export function InstructorDashboard() {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalCourses: 0,
    totalStudents: 0,
    publishedCourses: 0,
  });

  useEffect(() => {
    if (user) {
      if (profile?.role !== 'instructor') {
        navigate('/dashboard');
        return;
      }
      fetchCourses();
    }
  }, [user, profile]);

  async function fetchCourses() {
    setLoading(true);

    const { data: coursesData } = await supabase
      .from('courses')
      .select('*')
      .eq('instructor_id', user!.id)
      .order('created_at', { ascending: false });

    if (coursesData) {
      setCourses(coursesData);

      let totalStudents = 0;
      for (const course of coursesData) {
        const { count } = await supabase
          .from('enrollments')
          .select('id', { count: 'exact' })
          .eq('course_id', course.id);
        totalStudents += count || 0;
      }

      setStats({
        totalCourses: coursesData.length,
        totalStudents,
        publishedCourses: coursesData.filter((c) => c.is_published).length,
      });
    }

    setLoading(false);
  }

  async function togglePublish(course: Course) {
    const newStatus = !course.is_published;
    const { error } = await supabase
      .from('courses')
      .update({ is_published: newStatus })
      .eq('id', course.id);

    if (!error) {
      setCourses((prev) =>
        prev.map((c) =>
          c.id === course.id ? { ...c, is_published: newStatus } : c
        )
      );
      setStats((prev) => ({
        ...prev,
        publishedCourses: newStatus ? prev.publishedCourses + 1 : prev.publishedCourses - 1,
      }));
    }
  }

  async function deleteCourse(courseId: string) {
    if (!confirm('Are you sure you want to delete this course? This action cannot be undone.')) {
      return;
    }

    const { error } = await supabase
      .from('courses')
      .delete()
      .eq('id', courseId);

    if (!error) {
      setCourses((prev) => prev.filter((c) => c.id !== courseId));
      setStats((prev) => ({
        ...prev,
        totalCourses: prev.totalCourses - 1,
      }));
    }
  }

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
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Instructor Dashboard</h1>
            <p className="text-slate-400">Manage your courses and track student progress.</p>
          </div>
          <Link
            to="/instructor/courses/new"
            className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-emerald-500 to-cyan-500 text-white font-medium rounded-xl hover:from-emerald-600 hover:to-cyan-600 transition-all"
          >
            <Plus className="w-5 h-5" />
            Create Course
          </Link>
        </div>

        <div className="grid md:grid-cols-3 gap-4 mb-8">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-emerald-500/10 rounded-lg flex items-center justify-center">
                <BookOpen className="w-5 h-5 text-emerald-400" />
              </div>
              <span className="text-slate-400 text-sm">Total Courses</span>
            </div>
            <p className="text-3xl font-bold text-white">{stats.totalCourses}</p>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-cyan-500/10 rounded-lg flex items-center justify-center">
                <Users className="w-5 h-5 text-cyan-400" />
              </div>
              <span className="text-slate-400 text-sm">Total Students</span>
            </div>
            <p className="text-3xl font-bold text-white">{stats.totalStudents}</p>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-amber-500/10 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-amber-400" />
              </div>
              <span className="text-slate-400 text-sm">Published</span>
            </div>
            <p className="text-3xl font-bold text-white">{stats.publishedCourses}</p>
          </div>
        </div>

        <div className="mb-6">
          <h2 className="text-xl font-semibold text-white mb-4">Your Courses</h2>
        </div>

        {courses.length === 0 ? (
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-12 text-center">
            <BookOpen className="w-16 h-16 text-slate-600 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-white mb-2">No courses yet</h3>
            <p className="text-slate-400 mb-6">
              Create your first course to start teaching.
            </p>
            <Link
              to="/instructor/courses/new"
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-500 to-cyan-500 text-white font-medium rounded-xl hover:from-emerald-600 hover:to-cyan-600 transition-all"
            >
              <Plus className="w-5 h-5" />
              Create Your First Course
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {courses.map((course) => (
              <div
                key={course.id}
                className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden"
              >
                <div className="flex flex-col lg:flex-row gap-4 p-4">
                  <div className="w-full lg:w-48 aspect-video lg:aspect-video rounded-lg overflow-hidden bg-slate-800 shrink-0">
                    {course.thumbnail_url ? (
                      <img
                        src={course.thumbnail_url}
                        alt={course.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <BookOpen className="w-10 h-10 text-slate-600" />
                      </div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span
                            className={`px-2 py-0.5 text-xs font-medium rounded ${
                              course.is_published
                                ? 'bg-emerald-500/20 text-emerald-400'
                                : 'bg-slate-700 text-slate-400'
                            }`}
                          >
                            {course.is_published ? 'Published' : 'Draft'}
                          </span>
                          <span className="text-xs text-slate-500 capitalize">
                            {course.level}
                          </span>
                        </div>
                        <h3 className="font-semibold text-white text-lg truncate">
                          {course.title}
                        </h3>
                        <p className="text-sm text-slate-400 line-clamp-2 mt-1">
                          {course.description || 'No description'}
                        </p>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <Link
                          to={`/instructor/courses/${course.id}`}
                          className="p-2 bg-slate-800 text-slate-400 rounded-lg hover:bg-slate-700 hover:text-white transition-colors"
                          title="Edit"
                        >
                          <Edit3 className="w-4 h-4" />
                        </Link>
                        <button
                          onClick={() => togglePublish(course)}
                          className={`p-2 rounded-lg transition-colors ${
                            course.is_published
                              ? 'bg-slate-800 text-slate-400 hover:bg-amber-500/10 hover:text-amber-400'
                              : 'bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20'
                          }`}
                          title={course.is_published ? 'Unpublish' : 'Publish'}
                        >
                          {course.is_published ? (
                            <EyeOff className="w-4 h-4" />
                          ) : (
                            <Eye className="w-4 h-4" />
                          )}
                        </button>
                        <button
                          onClick={() => deleteCourse(course.id)}
                          className="p-2 bg-slate-800 text-slate-400 rounded-lg hover:bg-rose-500/10 hover:text-rose-400 transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 mt-4 text-xs text-slate-500">
                      <span>{course.category || 'No category'}</span>
                      <span>Created {new Date(course.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

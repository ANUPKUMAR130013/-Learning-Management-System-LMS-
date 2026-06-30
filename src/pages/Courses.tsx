import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { Course, Profile } from '../types/database';
import {
  BookOpen,
  Search,
  Filter,
  Loader2,
  Users,
  Clock,
  Star,
} from 'lucide-react';

export function Courses() {
  const { user } = useAuth();
  const [courses, setCourses] = useState<(Course & { instructor: Profile; enrollment_count?: number })[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [levelFilter, setLevelFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [categories, setCategories] = useState<string[]>([]);

  useEffect(() => {
    fetchCourses();
  }, []);

  async function fetchCourses() {
    setLoading(true);

    const { data, error } = await supabase
      .from('courses')
      .select(`
        *,
        instructor:profiles!courses_instructor_id_fkey(*)
      `)
      .eq('is_published', true)
      .order('created_at', { ascending: false });

    if (!error && data) {
      const coursesWithCount = await Promise.all(
        data.map(async (course) => {
          const { count } = await supabase
            .from('enrollments')
            .select('id', { count: 'exact' })
            .eq('course_id', course.id);

          return {
            ...course,
            enrollment_count: count || 0,
          };
        })
      );

      setCourses(coursesWithCount);

      const uniqueCategories = [
        ...new Set(
          coursesWithCount
            .map((c) => c.category)
            .filter(Boolean) as string[]
        ),
      ];
      setCategories(uniqueCategories);
    }

    setLoading(false);
  }

  const filteredCourses = courses.filter((course) => {
    const matchesSearch =
      course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesLevel = levelFilter === 'all' || course.level === levelFilter;
    const matchesCategory =
      categoryFilter === 'all' || course.category === categoryFilter;
    return matchesSearch && matchesLevel && matchesCategory;
  });

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
          <h1 className="text-3xl font-bold text-white mb-2">Explore Courses</h1>
          <p className="text-slate-400">
            Discover courses to expand your knowledge and skills.
          </p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 mb-8">
          <div className="grid md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
              <input
                type="text"
                placeholder="Search courses..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500"
              />
            </div>

            <div className="relative">
              <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
              <select
                value={levelFilter}
                onChange={(e) => setLevelFilter(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 appearance-none cursor-pointer"
              >
                <option value="all">All Levels</option>
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </select>
            </div>

            <div className="relative">
              <BookOpen className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 appearance-none cursor-pointer"
              >
                <option value="all">All Categories</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {filteredCourses.length === 0 ? (
          <div className="text-center py-16">
            <BookOpen className="w-16 h-16 text-slate-600 mx-auto mb-4" />
            <h3 className="text-xl font-medium text-white mb-2">No courses found</h3>
            <p className="text-slate-400">
              Try adjusting your search or filter criteria.
            </p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCourses.map((course) => (
              <Link
                key={course.id}
                to={`/courses/${course.id}`}
                className="group bg-slate-900 border border-slate-800 rounded-xl overflow-hidden hover:border-emerald-500/50 transition-all hover:shadow-lg hover:shadow-emerald-500/10"
              >
                <div className="aspect-video relative overflow-hidden">
                  {course.thumbnail_url ? (
                    <img
                      src={course.thumbnail_url}
                      alt={course.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-800 to-slate-900">
                      <BookOpen className="w-16 h-16 text-slate-600" />
                    </div>
                  )}
                  <div className="absolute top-3 left-3">
                    <span className="px-2 py-1 bg-slate-900/90 backdrop-blur-sm text-xs font-medium text-slate-300 rounded-md capitalize">
                      {course.level}
                    </span>
                  </div>
                  <div className="absolute top-3 right-3">
                    <span className="px-2 py-1 bg-emerald-500/90 backdrop-blur-sm text-xs font-bold text-white rounded-md">
                      {course.price > 0 ? `$${course.price}` : 'Free'}
                    </span>
                  </div>
                </div>
                <div className="p-5">
                  {course.category && (
                    <p className="text-xs font-medium text-emerald-400 mb-2">
                      {course.category}
                    </p>
                  )}
                  <h3 className="font-semibold text-white mb-2 line-clamp-2 group-hover:text-emerald-400 transition-colors">
                    {course.title}
                  </h3>
                  <p className="text-sm text-slate-400 mb-4 line-clamp-2">
                    {course.description || 'No description available'}
                  </p>
                  <div className="flex items-center justify-between text-sm text-slate-400">
                    <div className="flex items-center gap-1">
                      <Users className="w-4 h-4" />
                      <span>{course.enrollment_count}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="capitalize">{course.instructor?.full_name || 'Instructor'}</span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { Course, Module, Lesson } from '../types/database';
import {
  BookOpen,
  Plus,
  Save,
  ArrowLeft,
  ChevronRight,
  Loader2,
  Trash2,
  Edit3,
  GripVertical,
  Settings,
} from 'lucide-react';

type TabType = 'details' | 'content' | 'settings';

export function CourseEditor() {
  const { courseId } = useParams();
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<TabType>('details');
  const [loading, setLoading] = useState(!!courseId);
  const [saving, setSaving] = useState(false);
  const [course, setCourse] = useState<Partial<Course>>({
    title: '',
    description: '',
    category: '',
    level: 'beginner',
    price: 0,
    thumbnail_url: '',
    is_published: false,
  });
  const [modules, setModules] = useState<(Module & { lessons: Lesson[] })[]>([]);
  const [editingModule, setEditingModule] = useState<string | null>(null);
  const [newModuleTitle, setNewModuleTitle] = useState('');
  const [editingLesson, setEditingLesson] = useState<string | null>(null);
  const [expandedModule, setExpandedModule] = useState<string | null>(null);

  useEffect(() => {
    if (courseId && courseId !== 'new') {
      fetchCourse();
    } else {
      setLoading(false);
    }
  }, [courseId]);

  async function fetchCourse() {
    setLoading(true);

    const { data: courseData } = await supabase
      .from('courses')
      .select('*')
      .eq('id', courseId)
      .maybeSingle();

    if (!courseData || courseData.instructor_id !== user!.id) {
      navigate('/instructor');
      return;
    }

    setCourse(courseData);

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
      setModules(modulesWithLessons);
    }

    setLoading(false);
  }

  async function handleSaveCourse() {
    if (!course.title?.trim()) {
      return;
    }

    setSaving(true);

    if (courseId === 'new') {
      const { data, error } = await supabase
        .from('courses')
        .insert({
          ...course,
          instructor_id: user!.id,
          is_published: false,
        } as Course)
        .select()
        .single();

      if (!error && data) {
        navigate(`/instructor/courses/${data.id}`);
      }
    } else {
      const { error } = await supabase
        .from('courses')
        .update(course)
        .eq('id', courseId);

      if (!error) {
        setCourse((prev) => ({ ...prev, ...course }));
      }
    }

    setSaving(false);
  }

  async function handleAddModule() {
    if (!newModuleTitle.trim() || courseId === 'new') return;

    const { data, error } = await supabase
      .from('modules')
      .insert({
        course_id: courseId!,
        title: newModuleTitle,
        order_index: modules.length,
      })
      .select()
      .single();

    if (!error && data) {
      setModules([...modules, { ...data, lessons: [] }]);
      setNewModuleTitle('');
    }
  }

  async function handleEditModule(module: Module) {
    const newTitle = prompt('Module title:', module.title);
    if (!newTitle) return;

    const { error } = await supabase
      .from('modules')
      .update({ title: newTitle })
      .eq('id', module.id);

    if (!error) {
      setModules((prev) =>
        prev.map((m) =>
          m.id === module.id ? { ...m, title: newTitle } : m
        )
      );
    }
  }

  async function handleDeleteModule(module: Module) {
    if (!confirm('Delete this module and all its lessons?')) return;

    const { error } = await supabase
      .from('modules')
      .delete()
      .eq('id', module.id);

    if (!error) {
      setModules((prev) => prev.filter((m) => m.id !== module.id));
    }
  }

  async function handleAddLesson(moduleId: string) {
    const title = prompt('Lesson title:');
    if (!title || courseId === 'new') return;

    const module = modules.find((m) => m.id === moduleId);
    const order = module?.lessons.length || 0;

    const { data, error } = await supabase
      .from('lessons')
      .insert({
        module_id: moduleId,
        title,
        order_index: order,
        content: '',
      })
      .select()
      .single();

    if (!error && data) {
      setModules((prev) =>
        prev.map((m) =>
          m.id === moduleId ? { ...m, lessons: [...m.lessons, data] } : m
        )
      );
    }
  }

  async function handleDeleteLesson(moduleId: string, lesson: Lesson) {
    if (!confirm('Delete this lesson?')) return;

    const { error } = await supabase
      .from('lessons')
      .delete()
      .eq('id', lesson.id);

    if (!error) {
      setModules((prev) =>
        prev.map((m) =>
          m.id === moduleId
            ? { ...m, lessons: m.lessons.filter((l) => l.id !== lesson.id) }
            : m
        )
      );
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-emerald-400 animate-spin" />
      </div>
    );
  }

  const isNew = courseId === 'new';

  return (
    <div className="min-h-screen bg-slate-950 py-8">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <Link
            to="/instructor"
            className="inline-flex items-center gap-2 text-slate-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to dashboard
          </Link>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
          <div className="border-b border-slate-800">
            <div className="flex">
              {(['details', 'content', 'settings'] as TabType[]).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                    activeTab === tab
                      ? 'border-emerald-500 text-emerald-400'
                      : 'border-transparent text-slate-400 hover:text-white'
                  }`}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
              ))}
            </div>
          </div>

          <div className="p-6">
            {activeTab === 'details' && (
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Course Title *
                  </label>
                  <input
                    type="text"
                    value={course.title || ''}
                    onChange={(e) => setCourse({ ...course, title: e.target.value })}
                    className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500"
                    placeholder="e.g., Introduction to Web Development"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Description
                  </label>
                  <textarea
                    value={course.description || ''}
                    onChange={(e) => setCourse({ ...course, description: e.target.value })}
                    rows={4}
                    className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 resize-none"
                    placeholder="Describe what students will learn..."
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Category
                    </label>
                    <input
                      type="text"
                      value={course.category || ''}
                      onChange={(e) => setCourse({ ...course, category: e.target.value })}
                      className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500"
                      placeholder="e.g., Programming"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Level
                    </label>
                    <select
                      value={course.level || 'beginner'}
                      onChange={(e) =>
                        setCourse({ ...course, level: e.target.value as Course['level'] })
                      }
                      className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500"
                    >
                      <option value="beginner">Beginner</option>
                      <option value="intermediate">Intermediate</option>
                      <option value="advanced">Advanced</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Thumbnail URL
                  </label>
                  <input
                    type="text"
                    value={course.thumbnail_url || ''}
                    onChange={(e) => setCourse({ ...course, thumbnail_url: e.target.value })}
                    className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500"
                    placeholder="https://example.com/image.jpg"
                  />
                </div>

                <div className="flex justify-end pt-4">
                  <button
                    onClick={handleSaveCourse}
                    disabled={saving || !course.title?.trim()}
                    className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-emerald-500 to-cyan-500 text-white font-medium rounded-lg hover:from-emerald-600 hover:to-cyan-600 disabled:opacity-50 transition-all"
                  >
                    {saving ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Save className="w-4 h-4" />
                    )}
                    Save
                  </button>
                </div>
              </div>
            )}

            {activeTab === 'content' && (
              <div>
                {isNew ? (
                  <div className="text-center py-12">
                    <BookOpen className="w-12 h-12 text-slate-600 mx-auto mb-4" />
                    <p className="text-slate-400">
                      Save the course details first to add modules and lessons.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 mb-6">
                      <input
                        type="text"
                        value={newModuleTitle}
                        onChange={(e) => setNewModuleTitle(e.target.value)}
                        className="flex-1 px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500"
                        placeholder="New module title..."
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleAddModule();
                        }}
                      />
                      <button
                        onClick={handleAddModule}
                        disabled={!newModuleTitle.trim()}
                        className="flex items-center gap-2 px-4 py-2 bg-emerald-500/10 text-emerald-400 font-medium rounded-lg hover:bg-emerald-500/20 disabled:opacity-50 transition-colors"
                      >
                        <Plus className="w-4 h-4" />
                        Add Module
                      </button>
                    </div>

                    {modules.length === 0 ? (
                      <div className="text-center py-8 bg-slate-800/50 rounded-xl">
                        <p className="text-slate-500">No modules yet. Add your first module above.</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {modules.map((module, moduleIndex) => (
                          <div
                            key={module.id}
                            className="bg-slate-800/50 border border-slate-700 rounded-xl overflow-hidden"
                          >
                            <div className="flex items-center justify-between p-4 bg-slate-800">
                              <div className="flex items-center gap-3">
                                <span className="text-slate-500 text-sm w-6">
                                  {moduleIndex + 1}.
                                </span>
                                <h4 className="font-medium text-white">{module.title}</h4>
                                <span className="text-xs text-slate-500">
                                  ({module.lessons.length} lessons)
                                </span>
                              </div>
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() =>
                                    setExpandedModule(
                                      expandedModule === module.id ? null : module.id
                                    )
                                  }
                                  className="px-3 py-1 text-sm bg-slate-700 text-slate-300 rounded hover:bg-slate-600 transition-colors"
                                >
                                  {expandedModule === module.id ? 'Collapse' : 'Expand'}
                                </button>
                                <button
                                  onClick={() => handleEditModule(module)}
                                  className="p-1.5 text-slate-400 hover:text-white transition-colors"
                                >
                                  <Edit3 className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => handleDeleteModule(module)}
                                  className="p-1.5 text-slate-400 hover:text-rose-400 transition-colors"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </div>

                            {expandedModule === module.id && (
                              <div className="border-t border-slate-700">
                                {module.lessons.length > 0 && (
                                  <div className="divide-y divide-slate-700">
                                    {module.lessons.map((lesson, lessonIndex) => (
                                      <div
                                        key={lesson.id}
                                        className="flex items-center justify-between py-3 px-4 hover:bg-slate-800/50"
                                      >
                                        <div className="flex items-center gap-3">
                                          <span className="text-slate-500 text-sm w-8">
                                            {lessonIndex + 1}.
                                          </span>
                                          <span className="text-slate-300">{lesson.title}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                          <Link
                                            to={`/instructor/lessons/${lesson.id}`}
                                            className="px-3 py-1 text-sm bg-slate-700 text-slate-300 rounded hover:bg-slate-600 transition-colors"
                                          >
                                            Edit
                                          </Link>
                                          <button
                                            onClick={() =>
                                              handleDeleteLesson(module.id, lesson)
                                            }
                                            className="p-1.5 text-slate-400 hover:text-rose-400 transition-colors"
                                          >
                                            <Trash2 className="w-4 h-4" />
                                          </button>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                )}

                                <button
                                  onClick={() => handleAddLesson(module.id)}
                                  className="w-full py-3 text-sm text-slate-400 hover:text-white hover:bg-slate-800 transition-colors flex items-center justify-center gap-2"
                                >
                                  <Plus className="w-4 h-4" />
                                  Add Lesson
                                </button>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'settings' && (
              <div className="space-y-6">
                <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium text-white mb-1">Publish Course</h3>
                      <p className="text-sm text-slate-400">
                        Make this course visible to students.
                      </p>
                    </div>
                    <button
                      onClick={async () => {
                        const newStatus = !course.is_published;
                        await supabase
                          .from('courses')
                          .update({ is_published: newStatus })
                          .eq('id', courseId);
                        setCourse({ ...course, is_published: newStatus });
                      }}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        course.is_published ? 'bg-emerald-500' : 'bg-slate-700'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          course.is_published ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Price ($)
                  </label>
                  <input
                    type="number"
                    value={course.price || 0}
                    onChange={(e) =>
                      setCourse({ ...course, price: parseFloat(e.target.value) || 0 })
                    }
                    className="w-32 px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500"
                    min={0}
                    step={0.01}
                  />
                  <p className="text-xs text-slate-500 mt-1">Set to 0 for free course</p>
                </div>

                <div className="flex justify-end pt-4">
                  <button
                    onClick={handleSaveCourse}
                    disabled={saving}
                    className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-emerald-500 to-cyan-500 text-white font-medium rounded-lg hover:from-emerald-600 hover:to-cyan-600 disabled:opacity-50 transition-all"
                  >
                    {saving ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Save className="w-4 h-4" />
                    )}
                    Save Settings
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

import { Link } from 'react-router-dom';
import {
  BookOpen,
  Users,
  Trophy,
  Zap,
  ArrowRight,
  Play,
  BarChart3,
  Clock,
  Star,
  CheckCircle,
} from 'lucide-react';

const features = [
  {
    icon: BookOpen,
    title: 'Rich Course Content',
    description: 'Video lessons, interactive quizzes, and comprehensive materials',
  },
  {
    icon: Users,
    title: 'Expert Instructors',
    description: 'Learn from industry professionals with real-world experience',
  },
  {
    icon: Trophy,
    title: 'Certificates',
    description: 'Earn certificates upon successful course completion',
  },
  {
    icon: BarChart3,
    title: 'Progress Tracking',
    description: 'Monitor your learning journey with detailed analytics',
  },
];

const stats = [
  { value: '10,000+', label: 'Students' },
  { value: '500+', label: 'Courses' },
  { value: '150+', label: 'Instructors' },
  { value: '95%', label: 'Satisfaction' },
];

export function Home() {
  return (
    <div className="bg-slate-950">
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-emerald-500/10 via-transparent to-transparent" />
        <div className="absolute top-20 left-1/4 w-96 h-96 bg-emerald-500/20 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-cyan-500/20 rounded-full blur-3xl" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-20">
          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 rounded-full px-4 py-2 mb-8">
              <Zap className="w-4 h-4 text-emerald-400" />
              <span className="text-sm text-emerald-400 font-medium">Transform your career with expert-led courses</span>
            </div>

            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight">
              Learn Without{' '}
              <span className="bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
                Limits
              </span>
            </h1>

            <p className="text-xl text-slate-400 mb-10 max-w-2xl mx-auto leading-relaxed">
              Access thousands of courses from world-class instructors. Master new skills at your own pace with our comprehensive learning platform.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                to="/courses"
                className="group px-8 py-4 bg-gradient-to-r from-emerald-500 to-cyan-500 text-white font-semibold rounded-xl hover:from-emerald-600 hover:to-cyan-600 transition-all shadow-lg shadow-emerald-500/30 flex items-center gap-2"
              >
                Explore Courses
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                to="/signup"
                className="px-8 py-4 bg-slate-800 text-white font-semibold rounded-xl hover:bg-slate-700 transition-all border border-slate-700 flex items-center gap-2"
              >
                <Play className="w-5 h-5" />
                Get Started Free
              </Link>
            </div>
          </div>

          <div className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <p className="text-3xl sm:text-4xl font-bold text-white mb-1">{stat.value}</p>
                <p className="text-slate-400 text-sm">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 bg-slate-900/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              Everything you need to succeed
            </h2>
            <p className="text-slate-400 max-w-2xl mx-auto">
              Our platform provides all the tools and resources you need for effective learning
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <div
                key={index}
                className="group p-6 bg-slate-900 border border-slate-800 rounded-2xl hover:border-emerald-500/50 transition-all hover:shadow-lg hover:shadow-emerald-500/10"
              >
                <div className="w-12 h-12 bg-emerald-500/10 rounded-xl flex items-center justify-center mb-4 group-hover:bg-emerald-500/20 transition-colors">
                  <feature.icon className="w-6 h-6 text-emerald-400" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">{feature.title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6">
                Learn at your own pace
              </h2>
              <p className="text-slate-400 mb-8 leading-relaxed">
                Our flexible learning platform allows you to study whenever and wherever you want.
                With lifetime access to courses and mobile-friendly content, learning has never been more accessible.
              </p>

              <div className="space-y-4">
                {[
                  'Lifetime access to purchased courses',
                  'Mobile-optimized learning experience',
                  'Downloadable resources and materials',
                  'Community support and discussions',
                ].map((item, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <div className="w-5 h-5 rounded-full bg-emerald-500/20 flex items-center justify-center">
                      <CheckCircle className="w-3 h-3 text-emerald-400" />
                    </div>
                    <span className="text-slate-300">{item}</span>
                  </div>
                ))}
              </div>

              <Link
                to="/courses"
                className="inline-flex items-center gap-2 mt-8 text-emerald-400 hover:text-emerald-300 font-medium"
              >
                Browse all courses
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/20 to-cyan-500/20 rounded-3xl blur-2xl" />
              <div className="relative bg-slate-900 border border-slate-800 rounded-2xl p-8">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-emerald-500 rounded-lg flex items-center justify-center">
                      <BarChart3 className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="text-white font-medium">Your Progress</p>
                      <p className="text-sm text-slate-400">This week</p>
                    </div>
                  </div>
                  <span className="px-3 py-1 bg-emerald-500/20 text-emerald-400 text-sm rounded-full">
                    +12%
                  </span>
                </div>

                <div className="space-y-4">
                  {[
                    { label: 'Lessons Completed', value: 24, max: 30, color: 'emerald' },
                    { label: 'Hours Learned', value: 18, max: 20, color: 'cyan' },
                    { label: 'Quizzes Passed', value: 8, max: 10, color: 'amber' },
                  ].map((stat, index) => (
                    <div key={index}>
                      <div className="flex justify-between text-sm mb-2">
                        <span className="text-slate-400">{stat.label}</span>
                        <span className="text-white font-medium">{stat.value}/{stat.max}</span>
                      </div>
                      <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                        <div
                          className={`h-full bg-gradient-to-r ${
                            stat.color === 'emerald'
                              ? 'from-emerald-500 to-emerald-400'
                              : stat.color === 'cyan'
                              ? 'from-cyan-500 to-cyan-400'
                              : 'from-amber-500 to-amber-400'
                          } rounded-full`}
                          style={{ width: `${(stat.value / stat.max) * 100}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 bg-gradient-to-b from-slate-900/50 to-slate-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6">
              Ready to start learning?
            </h2>
            <p className="text-slate-400 mb-8 text-lg">
              Join thousands of students already learning on LearnHub. Start your journey today.
            </p>
            <Link
              to="/signup"
              className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-emerald-500 to-cyan-500 text-white font-semibold rounded-xl hover:from-emerald-600 hover:to-cyan-600 transition-all shadow-lg shadow-emerald-500/30"
            >
              Get Started for Free
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>

      <footer className="border-t border-slate-800 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-emerald-400 to-cyan-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">L</span>
              </div>
              <span className="font-semibold text-white">LearnHub</span>
            </div>
            <p className="text-slate-500 text-sm">
              &copy; {new Date().getFullYear()} LearnHub. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

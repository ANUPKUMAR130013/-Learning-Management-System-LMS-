import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { Layout } from './components/Layout';
import { Home } from './pages/Home';
import { SignIn, SignUp } from './pages/Auth';
import { Dashboard } from './pages/Dashboard';
import { Courses } from './pages/Courses';
import { CourseDetail } from './pages/CourseDetail';
import { LessonViewer } from './pages/LessonViewer';
import { QuizPage } from './pages/QuizPage';
import { InstructorDashboard } from './pages/InstructorDashboard';
import { CourseEditor } from './pages/CourseEditor';
import { LessonEditor } from './pages/LessonEditor';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/signin" replace />;
  }

  return <>{children}</>;
}

function InstructorRoute({ children }: { children: React.ReactNode }) {
  const { user, profile, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/signin" replace />;
  }

  if (profile?.role !== 'instructor') {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/signin" element={<SignIn />} />
      <Route path="/signup" element={<SignUp />} />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />
      <Route path="/courses" element={<Courses />} />
      <Route path="/courses/:courseId" element={<CourseDetail />} />
      <Route
        path="/courses/:courseId/lessons/:lessonId"
        element={
          <ProtectedRoute>
            <LessonViewer />
          </ProtectedRoute>
        }
      />
      <Route
        path="/courses/:courseId/lessons/:lessonId/quiz"
        element={
          <ProtectedRoute>
            <QuizPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/instructor"
        element={
          <InstructorRoute>
            <InstructorDashboard />
          </InstructorRoute>
        }
      />
      <Route
        path="/instructor/courses/new"
        element={
          <InstructorRoute>
            <CourseEditor />
          </InstructorRoute>
        }
      />
      <Route
        path="/instructor/courses/:courseId"
        element={
          <InstructorRoute>
            <CourseEditor />
          </InstructorRoute>
        }
      />
      <Route
        path="/instructor/lessons/:lessonId"
        element={
          <InstructorRoute>
            <LessonEditor />
          </InstructorRoute>
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <Layout>
          <AppRoutes />
        </Layout>
      </AuthProvider>
    </Router>
  );
}

export default App;

// src/app.jsx

import { Routes, Route, Outlet, Link, useNavigate } from 'react-router-dom';
import { AuthPage } from './pages/auth/AuthPage';
import { useAuthStore } from './store/authStore';
import { Button } from './components/ui/button';
import { LogOut } from 'lucide-react';
import { TeacherDashboardPage } from './pages/teacher/TeacherDashboardPage';
import { StudentDashboardPage } from './pages/student/StudentDashboardPage';

const MainLayout = () => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/auth');
  };

  const getDashboardLink = () => {
    if (user?.role === 'teacher') return '/teacher/dashboard';
    if (user?.role === 'student') return '/student/dashboard';
    return '/';
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white shadow-md sticky top-0 z-10">
        <nav className="container mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center py-4">
          <Link to="/" className="text-2xl font-bold text-gray-800">
            Shikshak
          </Link>
          <div className="flex items-center space-x-4">
            {isAuthenticated ? (
               <>
                <Button variant="outline" asChild>
                  <Link to={getDashboardLink()}>Dashboard</Link>
                </Button>
                <Button variant="ghost" onClick={handleLogout}>
                  <LogOut className="mr-2 h-4 w-4" /> Logout
                </Button>
               </>
            ) : (
              <Button asChild>
                <Link to="/auth">Login / Register</Link>
              </Button>
            )}
          </div>
        </nav>
      </header>
      <main className="container mx-auto p-4 sm:p-6 lg:p-8">
        <Outlet />
      </main>
    </div>
  );
};


function App() {
  return (
    <Routes>
      <Route path="/" element={<MainLayout />}>
        <Route index element={<div><h1>Welcome to Shikshak!</h1><p>Your AI-powered learning companion.</p></div>} />
        
        {/* Add the dashboard routes */}
        <Route path="/teacher/dashboard" element={<TeacherDashboardPage />} />
        <Route path="/student/dashboard" element={<StudentDashboardPage />} />

      </Route>
      
      <Route path="/auth" element={<AuthPage />} />
    </Routes>
  );
}

export default App;

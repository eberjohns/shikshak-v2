import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import useAuthStore from '../../store/authStore';

export default function Navbar() {
  const { user, isAuthenticated, logout } = useAuthStore();
  const navigate = useNavigate();

  const onLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link to="/" className="text-xl font-bold text-slate-800">Shikshak</Link>
        </div>

        <nav className="flex items-center gap-4">
          {!isAuthenticated ? (
            <>
              <Link to="/login" className="text-sky-600 hover:underline">Login</Link>
              <Link to="/register" className="text-sky-600 hover:underline">Register</Link>
            </>
          ) : (
            <>
              <span className="text-slate-700">{user?.name || user?.email}</span>
              {user?.role && (
                <Link
                  to={user.role === 'teacher' ? '/teacher/dashboard' : '/student/dashboard'}
                  className="text-slate-600 hover:underline"
                >
                  Dashboard
                </Link>
              )}
              <button onClick={onLogout} className="text-red-600 hover:underline">Logout</button>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}

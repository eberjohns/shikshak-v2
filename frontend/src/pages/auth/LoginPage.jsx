import React, { useState } from 'react';
import useAuthStore from '../../store/authStore';
import { useToast } from '../../components/ui/Toast';
import { useNavigate } from 'react-router-dom';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login, isLoading } = useAuthStore();
  const navigate = useNavigate();

  const toast = useToast();

  const onSubmit = async (e) => {
    e.preventDefault();
    const res = await login(email, password);
    if (res.success) {
      // Redirect based on role stored in user
      const user = JSON.parse(localStorage.getItem('user') || 'null');
      if (user?.role === 'teacher') navigate('/teacher/dashboard');
      else navigate('/student/dashboard');
    } else {
      toast.push('Login failed: ' + JSON.stringify(res.error), 'error');
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white p-6 rounded shadow">
      <h2 className="text-2xl font-semibold mb-4">Login</h2>
      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-700">Email</label>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="mt-1 block w-full rounded border px-3 py-2" />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700">Password</label>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required className="mt-1 block w-full rounded border px-3 py-2" />
        </div>
        <div>
          <button disabled={isLoading} type="submit" className="w-full bg-sky-600 text-white py-2 rounded">
            {isLoading ? 'Logging in...' : 'Login'}
          </button>
        </div>
      </form>
    </div>
  );
}

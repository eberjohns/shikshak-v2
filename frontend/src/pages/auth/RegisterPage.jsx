import React, { useState } from 'react';
import useAuthStore from '../../store/authStore';
import { useToast } from '../../components/ui/Toast';
import { useNavigate } from 'react-router-dom';

export default function RegisterPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('student');
  const { register, isLoading } = useAuthStore();
  const navigate = useNavigate();

  const toast = useToast();

  const onSubmit = async (e) => {
    e.preventDefault();
    const payload = { name, email, password, role };
    const res = await register(payload);
    if (res.success) {
      // If token returned, user likely logged in, redirect by role
      const user = JSON.parse(localStorage.getItem('user') || 'null');
      if (user?.role === 'teacher') navigate('/teacher/dashboard');
      else navigate('/student/dashboard');
    } else {
      toast.push('Registration failed: ' + JSON.stringify(res.error), 'error');
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white p-6 rounded shadow">
      <h2 className="text-2xl font-semibold mb-4">Register</h2>
      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-700">Name</label>
          <input value={name} onChange={(e) => setName(e.target.value)} required className="mt-1 block w-full rounded border px-3 py-2" />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700">Email</label>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="mt-1 block w-full rounded border px-3 py-2" />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700">Password</label>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required className="mt-1 block w-full rounded border px-3 py-2" />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700">Role</label>
          <select value={role} onChange={(e) => setRole(e.target.value)} className="mt-1 block w-full rounded border px-3 py-2">
            <option value="student">Student</option>
            <option value="teacher">Teacher</option>
          </select>
        </div>
        <div>
          <button disabled={isLoading} type="submit" className="w-full bg-sky-600 text-white py-2 rounded">
            {isLoading ? 'Registering...' : 'Register'}
          </button>
        </div>
      </form>
    </div>
  );
}

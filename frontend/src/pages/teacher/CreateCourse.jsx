import React, { useState } from 'react';
import apiClient from '../../lib/apiClient';
import { useToast } from '../../components/ui/Toast';
import { useNavigate } from 'react-router-dom';

export default function CreateCourse() {
  const [name, setName] = useState('');
  const [file, setFile] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const toast = useToast();

  const onSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    if (!name || name.trim().length < 3) {
      setError('Please enter a course name (min 3 characters)');
      return;
    }
    const form = new FormData();
    form.append('name', name);
    if (file) form.append('syllabus', file);
    try {
      setSubmitting(true);
      const res = await apiClient.post('/api/teacher/courses', form, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      const created = res.data;
      // Navigate to teacher dashboard or course detail if id present
      if (created?.id) navigate(`/teacher/courses/${created.id}`);
      else navigate('/teacher/dashboard');
    } catch (err) {
      console.error('Create course failed', err);
      toast.push('Create course failed', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto bg-white p-6 rounded shadow">
      <h1 className="text-2xl font-bold mb-4">Create Course</h1>
      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium">Course Name</label>
          <input value={name} onChange={(e) => setName(e.target.value)} required className="mt-1 block w-full rounded border px-3 py-2" />
        </div>

        <div>
          <label className="block text-sm font-medium">Syllabus PDF</label>
          <input type="file" accept="application/pdf" onChange={(e) => setFile(e.target.files[0])} className="mt-1" />
        </div>

        {error && <div className="text-sm text-red-600">{error}</div>}
        <div>
          <button type="submit" disabled={submitting} className={`px-4 py-2 rounded ${submitting ? 'bg-slate-400 cursor-wait' : 'bg-sky-600 hover:bg-sky-700 text-white'}`}>
            {submitting ? (<span className="flex items-center gap-2"><Spinner /> Creating...</span>) : 'Create Course'}
          </button>
        </div>
      </form>
    </div>
  );
}

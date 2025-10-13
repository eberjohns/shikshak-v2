import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useParams } from 'react-router-dom';
import apiClient from '../../lib/apiClient';
import { useToast } from '../../components/ui/Toast';
import Spinner from '../../components/ui/Spinner';

export default function TeacherCourseDetail() {
  const { courseId } = useParams();
  const [course, setCourse] = useState(null);
  const [generating, setGenerating] = useState({});
  const courseRef = useRef(course);
  const pollTimers = useRef({});

  const fetchCourse = useCallback(async () => {
    try {
      const res = await apiClient.get(`/api/teacher/courses/${courseId}`);
      setCourse(res.data || null);
      courseRef.current = res.data || null;
    } catch (err) {
      console.error('Failed to fetch course', err);
    }
  }, [courseId]);

  useEffect(() => { fetchCourse(); }, [fetchCourse]);

  const toast = useToast();

  const onGenerate = async (topicId) => {
    try {
      setGenerating((s) => ({ ...s, [topicId]: true }));
      await apiClient.post(`/api/teacher/topics/${topicId}/generate-exam`);
      // start polling for exam creation
      toast.push('Exam generation started — polling for results...', 'info');
      const timeoutAt = Date.now() + 60_000; // 60s timeout
      const pollInterval = 2000;

      const poll = async () => {
        try {
          await fetchCourse();
          // if course has exams where exam.topic_id === topicId, stop polling
          const currentCourse = courseRef.current;
          const found = (currentCourse?.exams || []).some((ex) => ex.topic_id === topicId);
          if (found) {
            setGenerating((s) => ({ ...s, [topicId]: false }));
            toast.push('Generated exam is now available', 'success');
            return;
          }
        } catch {
          // ignore poll errors
        }
        if (Date.now() < timeoutAt) {
          const tid = setTimeout(poll, pollInterval);
          pollTimers.current[topicId] = tid;
        } else {
          setGenerating((s) => ({ ...s, [topicId]: false }));
          toast.push('Timed out waiting for generated exam.', 'error');
        }
      };

      const startTid = setTimeout(poll, pollInterval);
      pollTimers.current[topicId] = startTid;
    } catch (err) {
      console.error('Generate exam failed', err);
      toast.push('Generate exam failed', 'error');
      setGenerating((s) => ({ ...s, [topicId]: false }));
    }
  };

  const cancelGenerate = (topicId) => {
    // clear any pending timers
    if (pollTimers.current[topicId]) {
      clearTimeout(pollTimers.current[topicId]);
      delete pollTimers.current[topicId];
    }
    setGenerating((s) => ({ ...s, [topicId]: false }));
    toast.push('Generation cancelled', 'info');
  };

  if (!course) return <div>Loading course...</div>;

  return (
    <div>
      <h1 className="text-2xl font-bold">{course.title}</h1>
      <section className="mt-4">
        <h2 className="font-semibold">Topics</h2>
        {course.topics?.length ? (
          <ul className="mt-2 space-y-2">
            {course.topics.map((t) => (
              <li key={t.id} className="bg-white p-3 rounded shadow flex items-center justify-between">
                <div>
                  <div className="font-medium">{t.title}</div>
                  <div className="text-sm text-slate-600">{t.description}</div>
                </div>
                <div className="flex items-center gap-3">
                  {generating[t.id] ? (
                    <>
                      <button
                        onClick={() => cancelGenerate(t.id)}
                        className="px-3 py-1 rounded bg-red-500 hover:bg-red-600 text-white"
                      >
                        Cancel
                      </button>
                      <div className="text-sm text-slate-600">Polling for generated exam...</div>
                    </>
                  ) : (
                    <button
                      onClick={() => onGenerate(t.id)}
                      className={`px-3 py-1 rounded bg-sky-600 hover:bg-sky-700 text-white`}
                    >
                      Generate Exam
                    </button>
                  )}
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <div className="mt-2">No topics found.</div>
        )}
      </section>
    </div>
  );
}

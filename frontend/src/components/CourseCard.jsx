import React from 'react';
import { Link } from 'react-router-dom';
import Spinner from './ui/Spinner';

export default function CourseCard({ course, onEnroll, showEnroll = true, isEnrolling = false }) {
  return (
    <div className="bg-white rounded shadow p-4 flex items-center justify-between">
      <div>
        <h3 className="text-lg font-semibold">
          <Link to={`/student/courses/${course.id}`} className="hover:underline">{course.title}</Link>
        </h3>
        <p className="text-sm text-slate-600">Instructor: {course.teacher_name || course.teacher?.name}</p>
      </div>
      {showEnroll && (
        <div>
          <button
            disabled={isEnrolling}
            onClick={() => onEnroll(course.id)}
            className={`px-4 py-2 rounded ${isEnrolling ? 'bg-slate-400 cursor-wait' : 'bg-sky-600 hover:bg-sky-700 text-white'}`}
            aria-busy={isEnrolling}
          >
            {isEnrolling ? (
              <span className="flex items-center gap-2"><Spinner /> Enrolling...</span>
            ) : (
              'Enroll'
            )}
          </button>
        </div>
      )}
    </div>
  );
}

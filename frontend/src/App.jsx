import { Routes, Route } from 'react-router-dom';
import MainLayout from './components/layout/MainLayout';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import ProtectedRoute from './components/layout/ProtectedRoute';
import StudentDashboard from './pages/student/StudentDashboard';
import TeacherDashboard from './pages/teacher/TeacherDashboard';
import CreateCourse from './pages/teacher/CreateCourse';
import TeacherCourseDetail from './pages/teacher/TeacherCourseDetail';
import TeacherExamDetail from './pages/teacher/TeacherExamDetail';
import BrowseCourses from './pages/student/BrowseCourses';
import CourseDetail from './pages/student/CourseDetail';
import TakeExam from './pages/student/TakeExam';
import MySubmissions from './pages/student/MySubmissions';
import SubmissionResult from './pages/student/SubmissionResult';

function App() {
  return (
    <Routes>
      <Route path="/" element={<MainLayout />}>
        <Route index element={<div>Welcome to Shikshak!</div>} />
        <Route path="login" element={<LoginPage />} />
        <Route path="register" element={<RegisterPage />} />

        <Route path="student/dashboard" element={
          <ProtectedRoute role="student">
            <StudentDashboard />
          </ProtectedRoute>
        } />

        <Route path="browse" element={
          <ProtectedRoute role="student">
            <BrowseCourses />
          </ProtectedRoute>
        } />

        <Route path="student/courses/:courseId" element={
          <ProtectedRoute role="student">
            <CourseDetail />
          </ProtectedRoute>
        } />

        <Route path="student/exams/:examId" element={
          <ProtectedRoute role="student">
            <TakeExam />
          </ProtectedRoute>
        } />

        <Route path="student/submissions" element={
          <ProtectedRoute role="student">
            <MySubmissions />
          </ProtectedRoute>
        } />

        <Route path="student/submissions/:submissionId" element={
          <ProtectedRoute role="student">
            <SubmissionResult />
          </ProtectedRoute>
        } />

        <Route path="teacher/dashboard" element={
          <ProtectedRoute role="teacher">
            <TeacherDashboard />
          </ProtectedRoute>
        } />

        <Route path="teacher/courses/new" element={
          <ProtectedRoute role="teacher">
            <CreateCourse />
          </ProtectedRoute>
        } />

        <Route path="teacher/courses/:courseId" element={
          <ProtectedRoute role="teacher">
            <TeacherCourseDetail />
          </ProtectedRoute>
        } />

        <Route path="teacher/exams/:examId" element={
          <ProtectedRoute role="teacher">
            <TeacherExamDetail />
          </ProtectedRoute>
        } />
      </Route>
    </Routes>
  )
}

export default App
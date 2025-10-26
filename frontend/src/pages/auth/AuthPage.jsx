// src/pages/auth/AuthPage.jsx

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const LoginForm = () => {
  const navigate = useNavigate();
  const login = useAuthStore((state) => state.login);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    const result = await login(email, password);
    if (result.success) {
      // SMART REDIRECTION
      if (result.role === 'teacher') {
        navigate('/teacher/dashboard');
      } else if (result.role === 'student') {
        navigate('/student/dashboard');
      } else {
        navigate('/'); // Fallback
      }
    } else {
      setError(result.message);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <CardContent className="space-y-4 pt-4">
        {error && <p className="text-red-500 text-sm">{error}</p>}
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        </div>
        <Button type="submit" className="w-full">Log In</Button>
      </CardContent>
    </form>
  );
};

const RegisterForm = () => {
  const register = useAuthStore((state) => state.register);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('student');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    const result = await register({ full_name: fullName, email, password, role });
    if (result.success) {
      setSuccess('Registration successful! Please log in.');
      // Clear form
      setFullName('');
      setEmail('');
      setPassword('');
    } else {
      setError(result.message);
    }
  };
  
  return (
     <form onSubmit={handleSubmit}>
      <CardContent className="space-y-4 pt-4">
        {error && <p className="text-red-500 text-sm">{error}</p>}
        {success && <p className="text-green-500 text-sm">{success}</p>}
        <div className="space-y-2">
          <Label htmlFor="fullName">Full Name</Label>
          <Input id="fullName" value={fullName} onChange={(e) => setFullName(e.target.value)} required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="reg-email">Email</Label>
          <Input id="reg-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="reg-password">Password</Label>
          <Input id="reg-password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        </div>
        <div className="space-y-2">
          <Label>Register as</Label>
          <div className="flex items-center space-x-4 pt-2">
            <label className="flex items-center space-x-2 cursor-pointer">
              <input type="radio" name="role" value="student" className="h-4 w-4" checked={role === 'student'} onChange={() => setRole('student')} />
              <span>Student</span>
            </label>
            <label className="flex items-center space-x-2 cursor-pointer">
              <input type="radio" name="role" value="teacher" className="h-4 w-4" checked={role === 'teacher'} onChange={() => setRole('teacher')} />
              <span>Teacher</span>
            </label>
          </div>
        </div>
        <Button type="submit" className="w-full">Create Account</Button>
      </CardContent>
    </form>
  );
};


export function AuthPage() {
  // AuthPage uses light class to stay in light theme even when dark mode is enabled
  return (
    <div className="light flex items-center justify-center min-h-screen bg-slate-100">
      <Tabs defaultValue="login" className="w-[400px]">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="login">Login</TabsTrigger>
          <TabsTrigger value="register">Register</TabsTrigger>
        </TabsList>
        <TabsContent value="login">
          <Card>
            <CardHeader>
              <CardTitle>Login</CardTitle>
              <CardDescription>Welcome back! Please enter your details.</CardDescription>
            </CardHeader>
            <LoginForm />
          </Card>
        </TabsContent>
        <TabsContent value="register">
          <Card>
            <CardHeader>
              <CardTitle>Register</CardTitle>
              <CardDescription>Create an account to get started.</CardDescription>
            </CardHeader>
            <RegisterForm />
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

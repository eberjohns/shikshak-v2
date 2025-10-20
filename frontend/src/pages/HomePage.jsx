import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Zap, Bot, BarChart2 } from 'lucide-react';

const FeatureCard = ({ icon, title, description }) => (
  <Card className="text-center hover:shadow-lg transition-shadow duration-300 bg-card">
    <CardHeader>
      <div className="mx-auto bg-popover rounded-full p-3 w-fit mb-4">
        {icon}
      </div>
      <CardTitle>{title}</CardTitle>
      <CardDescription>{description}</CardDescription>
    </CardHeader>
  </Card>
);

export function HomePage() {
  return (
    <div className="text-center">
      {/* Hero Section */}
      <section className="py-20 md:py-32">
        <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-foreground animate-fade-in-down">
          Welcome to <span className="text-indigo-600">Shikshak</span>
        </h1>
        <p className="mt-4 max-w-2xl mx-auto text-lg md:text-xl text-muted-foreground animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
          Your AI-powered learning companion. Streamline course creation, automate grading, and gain powerful insights into student understanding.
        </p>
        <div className="mt-8 animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
          <Button asChild size="lg">
            <Link to="/auth">Get Started</Link>
          </Button>
        </div>
      </section>

      {/* Features Section */}
    <section className="py-16 bg-background">
        <h2 className="text-3xl font-bold tracking-tight mb-12">How Shikshak Empowers You</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          <FeatureCard
            icon={<Zap className="w-8 h-8 text-indigo-600" />}
            title="AI-Powered Schedules"
            description="Upload a syllabus and let our AI instantly generate a complete, week-by-week course schedule for you."
          />
          <FeatureCard
            icon={<Bot className="w-8 h-8 text-indigo-600" />}
            title="Automated Grading"
            description="Generate subjective exams and let our AI provide detailed, constructive feedback and error analysis for every student."
          />
          <FeatureCard
            icon={<BarChart2 className="w-8 h-8 text-indigo-600" />}
            title="Insightful Analytics"
            description="Visualize class performance, identify commonly misunderstood topics, and understand error patterns at a glance."
          />
        </div>
      </section>
    </div>
  );
}

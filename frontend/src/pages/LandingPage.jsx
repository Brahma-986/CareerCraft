import { Link, Navigate } from 'react-router-dom';
import { ArrowRight, CheckCircle2, FileSearch, MessageSquare, Sparkles, Target } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui';

const features = [
  { icon: FileSearch, title: 'Resume analysis', text: 'Extract text from your PDF and compare it with a job description.' },
  { icon: Target, title: 'Skill gaps', text: 'See matching skills and the requirements that are still missing.' },
  { icon: Sparkles, title: 'Improvement notes', text: 'Get rewrite guidance that stays grounded in what your resume already says.' },
  { icon: MessageSquare, title: 'Interview coach', text: 'Practice technical, HR, and project questions with suggested answers.' },
];

export default function LandingPage() {
  const { user, loading } = useAuth();
  if (!loading && user) return <Navigate to="/app/dashboard" replace />;

  return (
    <div className="min-h-screen bg-white">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-4 py-5">
        <span className="text-lg font-bold text-heading">CareerCraft</span>
        <nav className="flex items-center gap-2">
          <Link to="/login" className="rounded-xl px-3 py-2 text-sm font-medium text-muted hover:bg-slate-50">Log in</Link>
          <Link to="/register" className="rounded-xl bg-primary px-3 py-2 text-sm font-semibold text-white hover:bg-indigo-700">Get started</Link>
        </nav>
      </header>

      <section className="mx-auto grid max-w-6xl items-center gap-10 px-4 py-16 md:grid-cols-2">
        <div>
          <p className="text-sm font-semibold text-primary">AI resume and interview assistant</p>
          <h1 className="mt-3 text-4xl font-bold tracking-tight text-heading md:text-5xl">Build Your Career with AI.</h1>
          <p className="mt-4 max-w-xl text-base leading-7 text-muted">
            CareerCraft helps job seekers understand how a resume lines up with a role, find missing skills, and prepare for interviews with questions tied to their own experience.
          </p>
          <div className="mt-6">
            <Link to="/register"><Button>Get started <ArrowRight className="h-4 w-4" /></Button></Link>
          </div>
        </div>
        <div className="rounded-3xl border border-slate-200 bg-surface p-6 shadow-sm">
          <div className="rounded-2xl bg-white p-5 shadow-sm">
            <p className="text-sm text-muted">Estimated match</p>
            <p className="mt-2 text-4xl font-bold text-heading">76</p>
            <p className="mt-1 text-xs text-muted">Sample preview. Your dashboard stays empty until you run a real analysis.</p>
            <div className="mt-4 space-y-2">
              {['JavaScript overlap', 'Kubernetes not shown', 'Interview set ready'].map((item) => (
                <div key={item} className="flex items-center gap-2 text-sm text-heading">
                  <CheckCircle2 className="h-4 w-4 text-primary" /> {item}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="bg-surface py-16">
        <div className="mx-auto grid max-w-6xl gap-4 px-4 md:grid-cols-4">
          {features.map((feature) => (
            <article key={feature.title} className="rounded-2xl bg-white p-5 shadow-sm">
              <feature.icon className="h-5 w-5 text-secondary" />
              <h2 className="mt-3 font-semibold text-heading">{feature.title}</h2>
              <p className="mt-2 text-sm leading-6 text-muted">{feature.text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16">
        <h2 className="text-2xl font-bold text-heading">How it works</h2>
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          {['Create an account and upload a text-based PDF resume.', 'Paste the job description you are targeting.', 'Review the estimated match, skill gaps, rewrites, and interview questions.'].map((step, index) => (
            <article key={step} className="rounded-2xl border border-slate-200 p-5">
              <p className="text-sm font-semibold text-primary">0{index + 1}</p>
              <p className="mt-2 text-sm leading-6 text-muted">{step}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="bg-surface py-16">
        <div className="mx-auto max-w-6xl px-4">
          <h2 className="text-2xl font-bold text-heading">Why candidates use it</h2>
          <ul className="mt-6 grid gap-3 md:grid-cols-2">
            {['Private accounts with saved analysis history.', 'Scores are estimates, not claims of ATS certification.', 'Suggestions avoid inventing jobs, metrics, or skills.', 'A chat assistant that can use your latest analysis as context.'].map((item) => (
              <li key={item} className="rounded-2xl bg-white px-4 py-3 text-sm text-heading shadow-sm">{item}</li>
            ))}
          </ul>
        </div>
      </section>

      <footer className="border-t border-slate-200 px-4 py-8 text-center text-sm text-muted">
        CareerCraft · Resume analysis and interview preparation
      </footer>
    </div>
  );
}

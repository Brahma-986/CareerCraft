import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { FileSearch, MessageSquare, Sparkles, Upload } from 'lucide-react';
import api, { getErrorMessage } from '../services/api';
import { Card, EmptyState } from '../components/ui';
import { formatDate } from '../utils/format';
import { useAuth } from '../context/AuthContext';

export default function DashboardPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get('/dashboard/stats')
      .then((response) => setStats(response.data.data))
      .catch((err) => setError(getErrorMessage(err)));
  }, []);

  if (error) return <Card><p className="text-sm text-danger">{error}</p></Card>;
  if (!stats) return <Card><p className="text-sm text-muted">Loading your dashboard...</p></Card>;

  const empty = stats.totalAnalyses === 0;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-heading">Welcome, {user?.name?.split(' ')[0]}</h2>
        <p className="mt-1 text-sm text-muted">Your resume analyses, match estimates, and interview sets live here.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Stat label="Resumes analyzed" value={stats.resumesAnalyzed} />
        <Stat label="Average match score" value={stats.averageMatchScore === null ? '—' : `${stats.averageMatchScore}%`} />
        <Stat label="Interview questions" value={stats.interviewsGenerated} />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <h3 className="font-semibold text-heading">Resume analysis activity</h3>
          <p className="mb-4 text-sm text-muted">Analyses created over the last 7 days.</p>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.activity}>
                <XAxis dataKey="label" tick={{ fill: '#64748B', fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis allowDecimals={false} tick={{ fill: '#64748B', fontSize: 12 }} axisLine={false} tickLine={false} />
                <Tooltip />
                <Bar dataKey="count" fill="#4F46E5" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
        <Card>
          <h3 className="font-semibold text-heading">Quick actions</h3>
          <div className="mt-4 space-y-2">
            <Action to="/app/upload" icon={Upload} label="Upload a resume" />
            <Action to="/app/job-description" icon={FileSearch} label="Analyze a saved resume" />
            <Action to="/app/chat" icon={MessageSquare} label="Ask the career assistant" />
          </div>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <h3 className="font-semibold text-heading">Recent analysis history</h3>
          {empty ? (
            <EmptyState title="No analyses yet" description="Upload a PDF resume and a job description to see real match results here." />
          ) : (
            <ul className="mt-4 divide-y divide-slate-100">
              {stats.recent.map((item) => (
                <li key={item.id} className="flex items-center justify-between py-3">
                  <div>
                    <p className="text-sm font-medium text-heading">{item.resumeFileName}</p>
                    <p className="text-xs text-muted">{formatDate(item.createdAt)} · {item.jobExcerpt}</p>
                  </div>
                  <Link className="text-sm font-semibold text-primary" to={`/app/analysis/${item.id}`}>{item.matchScore}%</Link>
                </li>
              ))}
            </ul>
          )}
        </Card>
        <Card>
          <h3 className="flex items-center gap-2 font-semibold text-heading"><Sparkles className="h-4 w-4 text-secondary" /> AI recommendations</h3>
          {!stats.recommendations ? (
            <EmptyState title="Recommendations appear after an analysis" description="CareerCraft will not show sample advice as if it were your result." />
          ) : (
            <div className="mt-4 space-y-3">
              {stats.recommendations.suggestions.map((item) => (
                <p key={item} className="rounded-xl bg-surface px-3 py-2 text-sm text-heading">{item}</p>
              ))}
              <Link className="inline-block text-sm font-semibold text-primary" to={`/app/analysis/${stats.recommendations.analysisId}/improvements`}>
                Open improvement report
              </Link>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}

function Stat({ label, value }) {
  return (
    <Card>
      <p className="text-sm text-muted">{label}</p>
      <p className="mt-2 text-3xl font-bold text-heading">{value}</p>
    </Card>
  );
}

function Action({ to, icon: Icon, label }) {
  return (
    <Link to={to} className="flex items-center gap-3 rounded-xl border border-slate-200 px-3 py-3 text-sm font-medium text-heading transition hover:border-indigo-200 hover:bg-indigo-50">
      <Icon className="h-4 w-4 text-primary" /> {label}
    </Link>
  );
}

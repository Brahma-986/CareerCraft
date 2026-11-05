import { Link, useParams } from 'react-router-dom';
import { Copy, Download, MessageSquare } from 'lucide-react';
import AnalysisNav from '../components/AnalysisNav';
import { Badge, Button, Card, ScoreRing, Spinner } from '../components/ui';
import { useAnalysis } from '../hooks/useAnalysis';
import { useToast } from '../context/ToastContext';
import { formatDate } from '../utils/format';

export default function AnalysisPage() {
  const { id } = useParams();
  const toast = useToast();
  const { analysis, error, loading } = useAnalysis(id);

  if (loading) return <Card><Spinner /></Card>;
  if (error) return <Card><p className="text-sm text-danger">{error}</p></Card>;

  function downloadReport() {
    const report = [
      `======================================================`,
      `CAREERCRAFT - RESUME COMPATIBILITY REPORT`,
      `======================================================`,
      `Resume File: ${analysis.resumeFileName || 'resume.pdf'}`,
      `Analyzed On: ${formatDate(analysis.createdAt || new Date())}`,
      `Estimated Match Score: ${analysis.matchScore} / 100`,
      ``,
      `--- SUMMARY ---`,
      analysis.summary || 'N/A',
      ``,
      `--- MATCHING SKILLS (${analysis.matchingSkills?.length || 0}) ---`,
      (analysis.matchingSkills || []).map((s) => `• ${s}`).join('\n') || 'None identified.',
      ``,
      `--- MISSING SKILLS / GAPS (${analysis.missingSkills?.length || 0}) ---`,
      (analysis.missingSkills || []).map((m) => `• [${m.priority.toUpperCase()}] ${m.skill}: ${m.reason}`).join('\n') || 'None identified.',
      ``,
      `--- STRENGTHS ---`,
      (analysis.strengths || []).map((s) => `• ${s}`).join('\n') || 'None listed.',
      ``,
      `--- WEAKNESSES / IMPROVEMENT AREAS ---`,
      (analysis.weaknesses || []).map((w) => `• ${w}`).join('\n') || 'None listed.',
      ``,
      `--- EXPERIENCE ANALYSIS ---`,
      analysis.experienceAnalysis || 'N/A',
      ``,
      `--- EDUCATION ANALYSIS ---`,
      analysis.educationAnalysis || 'N/A',
      ``,
      `--- RECOMMENDED SKILLS TO LEARN ---`,
      (analysis.recommendedSkills || []).map((s) => `• ${s}`).join('\n') || 'None listed.',
      ``,
      `--- RESUME REWRITE GUIDANCE ---`,
      `Professional Summary:`,
      analysis.resumeImprovements?.professionalSummary || 'N/A',
      ``,
      `Improved Bullets:`,
      (analysis.resumeImprovements?.bulletPoints || []).map((b) => `• ${b}`).join('\n') || 'None.',
      ``,
      `Keywords to include:`,
      (analysis.resumeImprovements?.keywords || []).join(', ') || 'None.',
      ``,
      `General Suggestions:`,
      (analysis.improvementSuggestions || []).map((i) => `• ${i}`).join('\n') || 'None.',
      ``,
      `======================================================`,
      `NOTE: Match scores and improvements are AI-generated estimates to assist your job search. This is not an official ATS score.`,
      `======================================================`,
    ].join('\n');

    const blob = new Blob([report], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `careercraft-report-${analysis.resumeFileName || 'analysis'}.txt`;
    link.click();
    URL.revokeObjectURL(url);
    toast.success('Report downloaded.');
  }

  function copySummary() {
    navigator.clipboard.writeText(analysis.summary || '');
    toast.success('Summary copied.');
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-heading">{analysis.resumeFileName}</h2>
          <p className="text-sm text-muted">Estimated compatibility with the job description you submitted.</p>
        </div>
        <AnalysisNav />
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex gap-2">
          <Button variant="outline" onClick={downloadReport}>
            <Download className="h-4 w-4" /> Download report
          </Button>
          <Link to={`/app/chat?analysisId=${analysis._id}`}>
            <Button variant="outline">
              <MessageSquare className="h-4 w-4 text-primary" /> Ask AI about this report
            </Button>
          </Link>
        </div>
      </div>

      <Card><ScoreRing score={analysis.matchScore} /></Card>

      <Card>
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-heading">Summary</h3>
          {analysis.summary ? (
            <button
              onClick={copySummary}
              className="inline-flex items-center gap-1 text-xs text-muted hover:text-heading"
            >
              <Copy className="h-3.5 w-3.5" /> Copy
            </button>
          ) : null}
        </div>
        <p className="mt-2 text-sm leading-6 text-muted">{analysis.summary || 'No summary was returned.'}</p>
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
        <SkillList title="Matching skills" items={analysis.matchingSkills} tone="green" empty="No overlapping skills were identified." />
        <SkillList title="Missing skills" items={analysis.missingSkills.map((item) => item.skill)} tone="amber" empty="No obvious missing skills were identified." />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <TextList title="Strengths" items={analysis.strengths} />
        <TextList title="Weaknesses" items={analysis.weaknesses} />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <h3 className="font-semibold text-heading">Experience</h3>
          <p className="mt-2 text-sm leading-6 text-muted">{analysis.experienceAnalysis || 'Not available.'}</p>
        </Card>
        <Card>
          <h3 className="font-semibold text-heading">Education</h3>
          <p className="mt-2 text-sm leading-6 text-muted">{analysis.educationAnalysis || 'Not available.'}</p>
        </Card>
      </div>

      <Card>
        <h3 className="font-semibold text-heading">Recommended skills to learn</h3>
        <div className="mt-3 flex flex-wrap gap-2">
          {analysis.recommendedSkills.length === 0 ? <p className="text-sm text-muted">None returned.</p> : analysis.recommendedSkills.map((skill) => <Badge key={skill} tone="indigo">{skill}</Badge>)}
        </div>
        <Link className="mt-4 inline-block text-sm font-semibold text-primary" to="skills">Open the full skill-gap view</Link>
      </Card>
    </div>
  );
}

function SkillList({ title, items, tone, empty }) {
  return (
    <Card>
      <h3 className="font-semibold text-heading">{title}</h3>
      <div className="mt-3 flex flex-wrap gap-2">
        {items.length === 0 ? <p className="text-sm text-muted">{empty}</p> : items.map((item) => <Badge key={item} tone={tone}>{item}</Badge>)}
      </div>
    </Card>
  );
}

function TextList({ title, items }) {
  return (
    <Card>
      <h3 className="font-semibold text-heading">{title}</h3>
      {items.length === 0 ? <p className="mt-2 text-sm text-muted">None returned.</p> : (
        <ul className="mt-3 space-y-2">
          {items.map((item) => <li key={item} className="rounded-xl bg-surface px-3 py-2 text-sm text-heading">{item}</li>)}
        </ul>
      )}
    </Card>
  );
}

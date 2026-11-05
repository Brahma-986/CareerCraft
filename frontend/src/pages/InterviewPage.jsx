import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { Bot, Check, Copy, Download, RefreshCw, Send } from 'lucide-react';
import api, { getErrorMessage } from '../services/api';
import AnalysisNav from '../components/AnalysisNav';
import { Badge, Button, Card, Spinner, TextArea } from '../components/ui';
import { useToast } from '../context/ToastContext';
import { forgetAnalysis, rememberAnalysis, useAnalysis } from '../hooks/useAnalysis';

const tabs = [
  { id: 'technical', label: 'Technical' },
  { id: 'hr', label: 'HR' },
  { id: 'project', label: 'Project' },
];

export default function InterviewPage() {
  const { id } = useParams();
  const toast = useToast();
  const { analysis, setAnalysis, error, loading } = useAnalysis(id);
  const [tab, setTab] = useState('technical');
  const [busy, setBusy] = useState(false);
  const [customQuestion, setCustomQuestion] = useState('');
  const [answering, setAnswering] = useState(false);
  const [customAnswer, setCustomAnswer] = useState(null);
  const [copiedId, setCopiedId] = useState(null);

  if (loading) return <Card><Spinner /></Card>;
  if (error) return <Card><p className="text-sm text-danger">{error}</p></Card>;

  const questions = (analysis.interviewQuestions || []).filter((item) => item.category === tab);

  async function generateMore() {
    setBusy(true);
    try {
      const response = await api.post('/interview/generate', { analysisId: analysis._id });
      forgetAnalysis(analysis._id);
      rememberAnalysis(response.data.data.analysis);
      setAnalysis(response.data.data.analysis);
      toast.success('More questions added.');
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setBusy(false);
    }
  }

  function download() {
    const lines = (analysis.interviewQuestions || []).map((item, index) => (
      `${index + 1}. [${item.category.toUpperCase()} / ${item.difficulty.toUpperCase()}] ${item.question}\nRelated skill: ${item.relatedSkill || 'General'}\nSuggested answer:\n${item.suggestedAnswer}\n`
    ));
    const blob = new Blob([lines.join('\n')], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `careercraft-interview-${analysis.resumeFileName || 'questions'}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  }

  async function copyText(text, identifier) {
    await navigator.clipboard.writeText(text);
    setCopiedId(identifier);
    toast.success('Answer copied to clipboard.');
    setTimeout(() => setCopiedId(null), 2500);
  }

  async function askSuggestedAnswer(e) {
    if (e) e.preventDefault();
    const clean = customQuestion.trim();
    if (clean.length < 8) {
      toast.error('Question must be at least 8 characters.');
      return;
    }
    if (clean.length > 500) {
      toast.error('Question must be 500 characters or fewer.');
      return;
    }
    setAnswering(true);
    try {
      const response = await api.post('/interview/answer', {
        analysisId: analysis._id,
        question: clean,
      });
      setCustomAnswer({
        question: clean,
        answer: response.data.data.answer,
      });
      toast.success('Suggested answer generated.');
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setAnswering(false);
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <AnalysisNav />
        <div className="flex gap-2">
          <Button variant="outline" onClick={download}><Download className="h-4 w-4" /> Download</Button>
          <Button loading={busy} onClick={generateMore}><RefreshCw className="h-4 w-4" /> Generate more questions</Button>
        </div>
      </div>

      {/* Practice custom question */}
      <Card>
        <div className="flex items-center gap-2">
          <Bot className="h-5 w-5 text-secondary" />
          <h2 className="font-semibold text-heading">Practice a specific question</h2>
        </div>
        <p className="mt-1 text-sm text-muted">
          Type any question you expect in an interview. CareerCraft will suggest an answer tailored to your resume and this target role without inventing facts.
        </p>
        <form onSubmit={askSuggestedAnswer} className="mt-3 space-y-2">
          <div className="flex gap-2">
            <input
              type="text"
              value={customQuestion}
              onChange={(e) => setCustomQuestion(e.target.value)}
              placeholder="e.g. Tell me about a time you handled a difficult production bug."
              maxLength={500}
              className="flex-1 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-heading outline-none focus:border-primary focus:ring-2 focus:ring-indigo-100"
            />
            <Button type="submit" loading={answering} disabled={customQuestion.trim().length < 8}>
              <Send className="h-4 w-4" /> Get answer
            </Button>
          </div>
          <span className="block text-xs text-muted">
            {customQuestion.length}/500 characters {customQuestion.length < 8 ? '(minimum 8)' : ''}
          </span>
        </form>

        {customAnswer ? (
          <div className="mt-4 rounded-xl border border-indigo-100 bg-indigo-50/40 p-4">
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-primary">Custom Question Response</span>
              <button
                onClick={() => copyText(customAnswer.answer, 'custom')}
                className="inline-flex items-center gap-1.5 text-xs font-medium text-primary hover:text-indigo-800"
              >
                {copiedId === 'custom' ? <Check className="h-3.5 w-3.5 text-success" /> : <Copy className="h-3.5 w-3.5" />}
                {copiedId === 'custom' ? 'Copied' : 'Copy answer'}
              </button>
            </div>
            <p className="mt-2 text-sm font-semibold text-heading">Q: {customAnswer.question}</p>
            <p className="mt-2 text-sm leading-6 text-slate-700 whitespace-pre-line">{customAnswer.answer}</p>
          </div>
        ) : null}
      </Card>

      {/* Tabs */}
      <div className="flex gap-2">
        {tabs.map((item) => (
          <button
            key={item.id}
            onClick={() => setTab(item.id)}
            className={`rounded-full px-3 py-1.5 text-sm font-medium transition ${
              tab === item.id ? 'bg-secondary text-white' : 'bg-white text-muted hover:bg-slate-100'
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      {/* Question list */}
      {questions.length === 0 ? (
        <Card><p className="text-sm text-muted">No {tab} questions yet. Generate a new set.</p></Card>
      ) : questions.map((item, idx) => {
        const itemKey = `${item.category}-${idx}`;
        const isCopied = copiedId === itemKey;
        return (
          <Card key={itemKey}>
            <div className="flex flex-wrap items-center gap-2">
              <Badge tone="indigo">{item.difficulty}</Badge>
              {item.relatedSkill ? <Badge>{item.relatedSkill}</Badge> : null}
            </div>
            <h2 className="mt-3 font-semibold text-heading">{item.question}</h2>
            <p className="mt-2 text-sm leading-6 text-muted">{item.suggestedAnswer}</p>
            <div className="mt-3 flex items-center gap-2">
              <Button variant="outline" onClick={() => copyText(item.suggestedAnswer, itemKey)}>
                {isCopied ? <Check className="h-4 w-4 text-success" /> : <Copy className="h-4 w-4" />}
                {isCopied ? 'Copied' : 'Copy answer'}
              </Button>
            </div>
          </Card>
        );
      })}
    </div>
  );
}

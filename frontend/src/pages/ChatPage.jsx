import { useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Bot, FileText, Send, Trash2, X } from 'lucide-react';
import api, { getErrorMessage } from '../services/api';
import { Button, Card } from '../components/ui';
import { useToast } from '../context/ToastContext';

const prompts = [
  'How can I improve my resume?',
  'What skills should I learn?',
  'What questions can be asked in my interview?',
  'How should I prepare for a particular job?',
  'How can I explain my projects?',
];

export default function ChatPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const toast = useToast();
  const [analyses, setAnalyses] = useState([]);
  const [analysisId, setAnalysisId] = useState(searchParams.get('analysisId') || '');
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    api.get('/analysis/history')
      .then((response) => {
        const list = response.data.data.analyses || [];
        setAnalyses(list);
        const queryId = searchParams.get('analysisId');
        if (queryId && list.some((a) => a._id === queryId)) {
          setAnalysisId(queryId);
        }
      })
      .catch(() => setAnalyses([]));
  }, [searchParams]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const activeAnalysis = analyses.find((item) => item._id === analysisId);

  function handleSelectAnalysis(id) {
    setAnalysisId(id);
    if (id) {
      setSearchParams({ analysisId: id });
    } else {
      setSearchParams({});
    }
  }

  function clearContext() {
    setAnalysisId('');
    setSearchParams({});
  }

  function clearChat() {
    setMessages([]);
    toast.info('Chat conversation cleared.');
  }

  async function send(text) {
    const message = (text ?? input).trim();
    if (!message || loading) return;
    const history = messages.map((item) => ({ role: item.role, content: item.content }));
    setMessages((current) => [...current, { role: 'user', content: message }]);
    setInput('');
    setLoading(true);
    try {
      const response = await api.post('/chat', {
        message,
        history,
        analysisId: analysisId || undefined,
      });
      setMessages((current) => [...current, { role: 'assistant', content: response.data.data.reply }]);
    } catch (error) {
      toast.error(getErrorMessage(error));
      setMessages((current) => [...current, { role: 'assistant', content: getErrorMessage(error) }]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="grid gap-4 lg:grid-cols-[17rem_1fr]">
      <Card>
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-heading">Analysis context</h2>
          {analysisId ? (
            <button
              onClick={clearContext}
              className="text-xs text-muted hover:text-danger"
              title="Switch to general guidance"
            >
              Clear
            </button>
          ) : null}
        </div>
        <p className="mt-1 text-xs text-muted">
          Attach a saved report for personalized answers based on your resume and target job.
        </p>
        <select
          className="mt-3 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-heading outline-none focus:border-primary"
          value={analysisId}
          onChange={(event) => handleSelectAnalysis(event.target.value)}
        >
          <option value="">General career guidance</option>
          {analyses.map((item) => (
            <option key={item._id} value={item._id}>
              {item.resumeFileName} ({item.matchScore}%)
            </option>
          ))}
        </select>

        {activeAnalysis ? (
          <div className="mt-3 rounded-xl border border-indigo-100 bg-indigo-50/50 p-2.5 text-xs">
            <div className="flex items-center gap-1.5 font-semibold text-primary">
              <FileText className="h-3.5 w-3.5" />
              <span className="truncate">{activeAnalysis.resumeFileName}</span>
            </div>
            <p className="mt-1 text-slate-600">Match score: {activeAnalysis.matchScore}%</p>
          </div>
        ) : null}

        <div className="mt-5">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted">Quick prompts</p>
          <div className="mt-2 space-y-1.5">
            {prompts.map((prompt) => (
              <button
                key={prompt}
                className="block w-full rounded-xl bg-surface px-3 py-2 text-left text-xs text-heading transition hover:bg-indigo-50 hover:text-primary"
                onClick={() => send(prompt)}
              >
                {prompt}
              </button>
            ))}
          </div>
        </div>

        {messages.length > 0 ? (
          <div className="mt-6 pt-4 border-t border-slate-100">
            <button
              onClick={clearChat}
              className="flex w-full items-center justify-center gap-1.5 rounded-xl border border-slate-200 px-3 py-2 text-xs font-medium text-muted hover:bg-slate-50 hover:text-danger"
            >
              <Trash2 className="h-3.5 w-3.5" /> Clear conversation
            </button>
          </div>
        ) : null}
      </Card>

      <Card className="flex min-h-[34rem] flex-col">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <Bot className="h-5 w-5 text-primary" />
            <div>
              <h2 className="text-sm font-semibold text-heading">Career Assistant</h2>
              <p className="text-xs text-muted">
                {activeAnalysis
                  ? `Focusing on ${activeAnalysis.resumeFileName}`
                  : 'General career & resume advice'}
              </p>
            </div>
          </div>
          {messages.length > 0 ? (
            <span className="text-xs text-muted">{messages.length} messages</span>
          ) : null}
        </div>

        <div className="flex-1 space-y-3 overflow-y-auto pt-3">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Bot className="h-10 w-10 text-primary/40 mb-3" />
              <h3 className="text-sm font-semibold text-heading">How can I help your job search?</h3>
              <p className="mt-1 max-w-sm text-xs text-muted">
                Ask about resume phrasing, interview strategies, addressing skill gaps, or explaining projects.
                Conversations exist only in the current browser session.
              </p>
            </div>
          ) : null}

          {messages.map((message, index) => (
            <div
              key={`${message.role}-${index}`}
              className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-6 whitespace-pre-line ${
                message.role === 'user'
                  ? 'ml-auto bg-primary text-white'
                  : 'bg-surface text-heading border border-slate-100'
              }`}
            >
              {message.content}
            </div>
          ))}

          {loading ? (
            <div className="flex items-center gap-2 text-sm text-muted">
              <Bot className="h-4 w-4 animate-pulse text-primary" />
              <span>CareerCraft is thinking...</span>
            </div>
          ) : null}
          <div ref={bottomRef} />
        </div>

        <form className="mt-4 flex gap-2" onSubmit={(event) => { event.preventDefault(); send(); }}>
          <input
            className="flex-1 rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-indigo-100"
            value={input}
            maxLength={4000}
            onChange={(event) => setInput(event.target.value)}
            placeholder={
              activeAnalysis
                ? `Ask about ${activeAnalysis.resumeFileName}...`
                : 'Ask a career or interview question...'
            }
          />
          <Button type="submit" loading={loading} disabled={!input.trim()} aria-label="Send">
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </Card>
    </div>
  );
}

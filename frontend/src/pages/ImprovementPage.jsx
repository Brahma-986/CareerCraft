import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { Check, Copy } from 'lucide-react';
import AnalysisNav from '../components/AnalysisNav';
import { Badge, Button, Card, Spinner } from '../components/ui';
import { useAnalysis } from '../hooks/useAnalysis';
import { useToast } from '../context/ToastContext';

export default function ImprovementPage() {
  const { id } = useParams();
  const toast = useToast();
  const { analysis, error, loading } = useAnalysis(id);
  const [copiedKey, setCopiedKey] = useState(null);

  if (loading) return <Card><Spinner /></Card>;
  if (error) return <Card><p className="text-sm text-danger">{error}</p></Card>;
  const improvements = analysis.resumeImprovements || {};

  function copy(text, key, label = 'Copied') {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    toast.success(`${label} copied to clipboard.`);
    setTimeout(() => setCopiedKey(null), 2500);
  }

  return (
    <div className="space-y-4">
      <AnalysisNav />

      {/* Professional Summary */}
      <Card>
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-heading">Professional summary</h2>
          {improvements.professionalSummary ? (
            <button
              onClick={() => copy(improvements.professionalSummary, 'summary', 'Professional summary')}
              className="inline-flex items-center gap-1.5 text-xs font-medium text-primary hover:text-indigo-800"
            >
              {copiedKey === 'summary' ? <Check className="h-3.5 w-3.5 text-success" /> : <Copy className="h-3.5 w-3.5" />}
              {copiedKey === 'summary' ? 'Copied' : 'Copy summary'}
            </button>
          ) : null}
        </div>
        <p className="mt-2 text-sm leading-6 text-muted">{improvements.professionalSummary || 'No rewritten summary was returned.'}</p>
      </Card>

      {/* Improved Bullet Points */}
      <Card>
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-heading">Improved bullet points</h2>
          {(improvements.bulletPoints || []).length > 0 ? (
            <button
              onClick={() => copy((improvements.bulletPoints || []).map((b) => `• ${b}`).join('\n'), 'all-bullets', 'All bullets')}
              className="inline-flex items-center gap-1.5 text-xs font-medium text-primary hover:text-indigo-800"
            >
              {copiedKey === 'all-bullets' ? <Check className="h-3.5 w-3.5 text-success" /> : <Copy className="h-3.5 w-3.5" />}
              {copiedKey === 'all-bullets' ? 'Copied all' : 'Copy all bullets'}
            </button>
          ) : null}
        </div>
        {!(improvements.bulletPoints?.length) ? (
          <p className="mt-2 text-sm text-muted">Nothing returned for this section.</p>
        ) : (
          <ul className="mt-3 space-y-2">
            {improvements.bulletPoints.map((item, index) => {
              const bKey = `bullet-${index}`;
              return (
                <li key={bKey} className="group flex items-start justify-between gap-3 rounded-xl bg-surface px-3 py-2.5 text-sm text-heading">
                  <span className="flex-1 leading-6">{item}</span>
                  <button
                    onClick={() => copy(item, bKey, 'Bullet point')}
                    className="shrink-0 text-muted opacity-80 hover:text-primary group-hover:opacity-100"
                    title="Copy bullet"
                  >
                    {copiedKey === bKey ? <Check className="h-3.5 w-3.5 text-success" /> : <Copy className="h-3.5 w-3.5" />}
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </Card>

      {/* Stronger Action Verbs */}
      <Card>
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-heading">Stronger action verbs</h2>
          {(improvements.actionVerbs || []).length > 0 ? (
            <button
              onClick={() => copy((improvements.actionVerbs || []).join(', '), 'all-verbs', 'All verbs')}
              className="inline-flex items-center gap-1.5 text-xs font-medium text-primary hover:text-indigo-800"
            >
              {copiedKey === 'all-verbs' ? <Check className="h-3.5 w-3.5 text-success" /> : <Copy className="h-3.5 w-3.5" />}
              {copiedKey === 'all-verbs' ? 'Copied all' : 'Copy all'}
            </button>
          ) : null}
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          {(improvements.actionVerbs || []).map((verb) => (
            <button
              key={verb}
              onClick={() => copy(verb, `verb-${verb}`, `Verb "${verb}"`)}
              className="cursor-pointer transition hover:scale-105"
              title="Click to copy"
            >
              <Badge tone="violet">{verb}</Badge>
            </button>
          ))}
        </div>
      </Card>

      {/* Keyword Recommendations */}
      <Card>
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-heading">Keyword recommendations</h2>
          {(improvements.keywords || []).length > 0 ? (
            <button
              onClick={() => copy((improvements.keywords || []).join(', '), 'all-keywords', 'All keywords')}
              className="inline-flex items-center gap-1.5 text-xs font-medium text-primary hover:text-indigo-800"
            >
              {copiedKey === 'all-keywords' ? <Check className="h-3.5 w-3.5 text-success" /> : <Copy className="h-3.5 w-3.5" />}
              {copiedKey === 'all-keywords' ? 'Copied all' : 'Copy all'}
            </button>
          ) : null}
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          {(improvements.keywords || []).map((word) => (
            <button
              key={word}
              onClick={() => copy(word, `kw-${word}`, `Keyword "${word}"`)}
              className="cursor-pointer transition hover:scale-105"
              title="Click to copy"
            >
              <Badge tone="indigo">{word}</Badge>
            </button>
          ))}
        </div>
      </Card>

      <ListCard title="Formatting recommendations" items={improvements.formatting} />
      <ListCard title="Quantifying achievements" items={improvements.quantificationTips} />
      <ListCard title="General suggestions" items={analysis.improvementSuggestions} />
    </div>
  );
}

function ListCard({ title, items = [] }) {
  return (
    <Card>
      <h2 className="font-semibold text-heading">{title}</h2>
      {items.length === 0 ? <p className="mt-2 text-sm text-muted">Nothing returned for this section.</p> : (
        <ul className="mt-3 space-y-2">
          {items.map((item, index) => <li key={index} className="rounded-xl bg-surface px-3 py-2 text-sm text-heading">{item}</li>)}
        </ul>
      )}
    </Card>
  );
}

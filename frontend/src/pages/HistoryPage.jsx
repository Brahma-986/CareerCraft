import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api, { getErrorMessage } from '../services/api';
import { Badge, Card, ConfirmDialog, EmptyState } from '../components/ui';
import { useToast } from '../context/ToastContext';
import { formatDate } from '../utils/format';
import { forgetAnalysis } from '../hooks/useAnalysis';

export default function HistoryPage() {
  const toast = useToast();
  const [analyses, setAnalyses] = useState([]);
  const [error, setError] = useState('');
  const [pending, setPending] = useState(null);
  const [loading, setLoading] = useState(false);

  function load() {
    api.get('/analysis/history')
      .then((response) => setAnalyses(response.data.data.analyses))
      .catch((err) => setError(getErrorMessage(err)));
  }

  useEffect(() => { load(); }, []);

  async function remove() {
    setLoading(true);
    try {
      await api.delete(`/analysis/${pending._id}`);
      forgetAnalysis(pending._id);
      toast.success('Analysis deleted.');
      setPending(null);
      load();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  if (error) return <Card><p className="text-sm text-danger">{error}</p></Card>;

  return (
    <div className="space-y-3">
      {analyses.length === 0 ? (
        <Card><EmptyState title="No saved reports" description="Completed analyses will stay here after you log out and come back." /></Card>
      ) : analyses.map((item) => (
        <Card key={item._id} className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-semibold text-heading">{item.resumeFileName}</h2>
              <Badge tone={item.matchScore >= 75 ? 'green' : item.matchScore >= 50 ? 'amber' : 'red'}>{item.matchScore}% match</Badge>
            </div>
            <p className="mt-1 text-sm text-muted">{formatDate(item.createdAt)} · {item.jobDescription.slice(0, 160)}</p>
          </div>
          <div className="flex gap-2">
            <Link className="rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-white" to={`/app/analysis/${item._id}`}>Open report</Link>
            <button className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-danger" onClick={() => setPending(item)}>Delete</button>
          </div>
        </Card>
      ))}
      {pending ? (
        <ConfirmDialog
          title="Delete this analysis?"
          message="The report will be removed from your history. This does not delete your account."
          loading={loading}
          onClose={() => setPending(null)}
          onConfirm={remove}
        />
      ) : null}
    </div>
  );
}

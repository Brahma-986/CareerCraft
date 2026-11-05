import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api, { getErrorMessage } from '../services/api';
import { Button, Card, EmptyState, TextArea } from '../components/ui';
import { useToast } from '../context/ToastContext';
import { formatDate } from '../utils/format';
import { rememberAnalysis } from '../hooks/useAnalysis';

export default function JobDescriptionPage() {
  const navigate = useNavigate();
  const toast = useToast();
  const [resumes, setResumes] = useState([]);
  const [resumeId, setResumeId] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get('/resume')
      .then((response) => {
        const list = response.data.data.resumes;
        setResumes(list);
        if (list[0]) setResumeId(list[0]._id);
      })
      .catch((err) => setError(getErrorMessage(err)));
  }, []);

  async function removeResume() {
    if (!resumeId) return;
    setLoading(true);
    try {
      await api.delete(`/resume/${resumeId}`);
      const next = resumes.filter((resume) => resume._id !== resumeId);
      setResumes(next);
      setResumeId(next[0]?._id || '');
      toast.success('Resume deleted.');
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  async function analyze() {
    if (!resumeId) {
      setError('Upload a resume before running an analysis.');
      return;
    }
    if (jobDescription.trim().length < 40) {
      setError('Job description must be at least 40 characters.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const response = await api.post('/analysis/analyze', { resumeId, jobDescription });
      rememberAnalysis(response.data.data.analysis);
      toast.success(response.data.message);
      navigate(`/app/analysis/${response.data.data.analysis._id}`);
    } catch (err) {
      setError(getErrorMessage(err));
      toast.error(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card>
      <h2 className="text-lg font-semibold text-heading">Choose a resume and target role</h2>
      <p className="mt-1 text-sm text-muted">This uses a resume you already uploaded. The PDF itself is not kept after text extraction.</p>
      {resumes.length === 0 ? (
        <EmptyState title="No saved resumes" description="Upload a PDF first, then return here to compare it with another job description." action={<Button onClick={() => navigate('/app/upload')}>Upload resume</Button>} />
      ) : (
        <div className="mt-5 space-y-4">
          <label className="block text-sm font-medium text-heading">
            Resume
            <select className="mt-1.5 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm" value={resumeId} onChange={(event) => setResumeId(event.target.value)}>
              {resumes.map((resume) => (
                <option key={resume._id} value={resume._id}>{resume.originalFileName} · {formatDate(resume.uploadedAt)}</option>
              ))}
            </select>
          </label>
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-sm font-medium text-heading">Job description</label>
              <span className="text-xs text-muted">
                {jobDescription.length} chars {jobDescription.length < 40 ? '(min 40)' : ''}
              </span>
            </div>
            <TextArea value={jobDescription} onChange={(event) => setJobDescription(event.target.value)} placeholder="Paste the full job description." />
          </div>
          {error ? <p className="text-sm text-danger">{error}</p> : null}
          <div className="flex flex-wrap gap-2">
            <Button loading={loading} onClick={analyze} disabled={jobDescription.trim().length < 40}>Analyze resume</Button>
            <Button variant="outline" onClick={removeResume}>Delete selected resume</Button>
          </div>
        </div>
      )}
    </Card>
  );
}

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, UploadCloud, X } from 'lucide-react';
import api, { getErrorMessage } from '../services/api';
import { Button, Card, TextArea } from '../components/ui';
import { useToast } from '../context/ToastContext';
import { formatBytes, MAX_FILE_BYTES } from '../utils/format';
import { rememberAnalysis } from '../hooks/useAnalysis';

export default function UploadPage() {
  const navigate = useNavigate();
  const toast = useToast();
  const [file, setFile] = useState(null);
  const [jobDescription, setJobDescription] = useState('');
  const [progress, setProgress] = useState(0);
  const [loading, setLoading] = useState(false);
  const [statusText, setStatusText] = useState('');
  const [error, setError] = useState('');
  const [isDragging, setIsDragging] = useState(false);

  function chooseFile(nextFile) {
    setError('');
    if (!nextFile) return;
    const isPdf = nextFile.type === 'application/pdf' || nextFile.name.toLowerCase().endsWith('.pdf');
    if (!isPdf) {
      setError('Only PDF files can be uploaded.');
      return;
    }
    if (nextFile.size > MAX_FILE_BYTES) {
      setError(`File must be ${MAX_FILE_BYTES / 1024 / 1024}MB or smaller.`);
      return;
    }
    setFile(nextFile);
  }

  async function analyze() {
    if (!file) {
      setError('Choose a PDF resume.');
      return;
    }
    if (jobDescription.trim().length < 40) {
      setError('Job description must be at least 40 characters.');
      return;
    }
    setLoading(true);
    setStatusText('Uploading resume and extracting text...');
    setError('');
    try {
      const form = new FormData();
      form.append('resume', file);
      const uploaded = await api.post('/resume/upload', form, {
        onUploadProgress: (event) => {
          if (event.total) setProgress(Math.round((event.loaded / event.total) * 100));
        },
      });
      setStatusText('Analyzing compatibility with Google Gemini...');
      const analysis = await api.post('/analysis/analyze', {
        resumeId: uploaded.data.data.resume.id,
        jobDescription,
      });
      rememberAnalysis(analysis.data.data.analysis);
      toast.success(analysis.data.message);
      navigate(`/app/analysis/${analysis.data.data.analysis._id}`);
    } catch (err) {
      toast.error(getErrorMessage(err));
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
      setStatusText('');
    }
  }

  return (
    <div className="grid gap-4 lg:grid-cols-5">
      <Card className="lg:col-span-3">
        <h2 className="text-lg font-semibold text-heading">Upload your resume</h2>
        <p className="mt-1 text-sm text-muted">Use a text-based PDF. Scanned image resumes cannot be read.</p>
        <label
          className={`mt-4 flex cursor-pointer flex-col items-center rounded-2xl border border-dashed px-4 py-10 text-center transition ${
            isDragging
              ? 'border-primary bg-indigo-50/70 scale-[1.01]'
              : 'border-slate-300 bg-surface hover:border-slate-400'
          }`}
          onDragOver={(event) => {
            event.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={(event) => {
            event.preventDefault();
            setIsDragging(false);
            chooseFile(event.dataTransfer.files?.[0]);
          }}
        >
          <UploadCloud className="h-8 w-8 text-primary" />
          <span className="mt-3 text-sm font-medium text-heading">Drag and drop a PDF, or browse</span>
          <span className="mt-1 text-xs text-muted">Maximum {MAX_FILE_BYTES / 1024 / 1024}MB</span>
          <input
            type="file"
            accept="application/pdf,.pdf"
            className="hidden"
            onChange={(event) => chooseFile(event.target.files?.[0])}
          />
        </label>

        {file ? (
          <div className="mt-4 flex items-center justify-between rounded-xl border border-slate-200 px-3 py-3">
            <div className="flex items-center gap-3">
              <FileText className="h-5 w-5 text-primary" />
              <div>
                <p className="text-sm font-medium text-heading">{file.name}</p>
                <p className="text-xs text-muted">{formatBytes(file.size)}</p>
              </div>
            </div>
            <button
              onClick={() => { setFile(null); setProgress(0); }}
              aria-label="Remove file"
              className="text-muted hover:text-danger"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ) : null}

        {loading ? (
          <div className="mt-4">
            <div className="h-2 overflow-hidden rounded-full bg-slate-100">
              <div className="h-full bg-primary transition-all duration-300" style={{ width: `${progress}%` }} />
            </div>
            <p className="mt-1.5 text-xs text-muted">
              {statusText || `Uploading ${progress}%...`}
            </p>
          </div>
        ) : null}

        {error ? <p className="mt-3 text-sm text-danger">{error}</p> : null}
      </Card>

      <Card className="lg:col-span-2">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-heading">Job description</h2>
          <span className="text-xs text-muted">
            {jobDescription.length} chars {jobDescription.length < 40 ? '(min 40)' : ''}
          </span>
        </div>
        <TextArea
          className="mt-4"
          value={jobDescription}
          onChange={(event) => setJobDescription(event.target.value)}
          placeholder="Paste the role, responsibilities, and required skills."
        />
        <Button
          className="mt-4 w-full"
          loading={loading}
          onClick={analyze}
          disabled={!file || jobDescription.trim().length < 40}
        >
          Analyze resume
        </Button>
      </Card>
    </div>
  );
}

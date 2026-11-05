import { useParams } from 'react-router-dom';
import AnalysisNav from '../components/AnalysisNav';
import { Badge, Card, Spinner } from '../components/ui';
import { useAnalysis } from '../hooks/useAnalysis';

const groups = [
  { key: 'high', title: 'High priority', tone: 'red' },
  { key: 'medium', title: 'Medium priority', tone: 'amber' },
  { key: 'low', title: 'Low priority', tone: 'slate' },
];

export default function SkillGapPage() {
  const { id } = useParams();
  const { analysis, error, loading } = useAnalysis(id);
  if (loading) return <Card><Spinner /></Card>;
  if (error) return <Card><p className="text-sm text-danger">{error}</p></Card>;

  return (
    <div className="space-y-4">
      <AnalysisNav />
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <h2 className="font-semibold text-heading">Skills already present</h2>
          <div className="mt-3 flex flex-wrap gap-2">
            {analysis.matchingSkills.length === 0 ? <p className="text-sm text-muted">No matching skills were identified.</p> : analysis.matchingSkills.map((skill) => <Badge key={skill} tone="green">{skill}</Badge>)}
          </div>
        </Card>
        <Card>
          <h2 className="font-semibold text-heading">Learning priorities</h2>
          <div className="mt-3 flex flex-wrap gap-2">
            {analysis.recommendedSkills.map((skill) => <Badge key={skill} tone="indigo">{skill}</Badge>)}
            {analysis.recommendedSkills.length === 0 ? <p className="text-sm text-muted">No extra skills were recommended.</p> : null}
          </div>
        </Card>
      </div>
      {groups.map((group) => {
        const items = analysis.missingSkills.filter((item) => item.priority === group.key);
        return (
          <Card key={group.key}>
            <h2 className="font-semibold text-heading">{group.title}</h2>
            {items.length === 0 ? <p className="mt-2 text-sm text-muted">Nothing in this priority.</p> : (
              <ul className="mt-3 space-y-3">
                {items.map((item) => (
                  <li key={item.skill} className="rounded-xl border border-slate-100 px-3 py-3">
                    <Badge tone={group.tone}>{item.skill}</Badge>
                    <p className="mt-2 text-sm text-muted">{item.reason || 'Required by the job and not demonstrated on the resume.'}</p>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        );
      })}
    </div>
  );
}

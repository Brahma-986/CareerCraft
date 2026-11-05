import { NavLink, useParams } from 'react-router-dom';

export default function AnalysisNav() {
  const { id } = useParams();
  const base = `/app/analysis/${id}`;
  const links = [
    { to: base, label: 'Overview', end: true },
    { to: `${base}/skills`, label: 'Skill gap' },
    { to: `${base}/improvements`, label: 'Improvements' },
    { to: `${base}/interview`, label: 'Interview' },
    { to: `/app/chat?analysisId=${id}`, label: 'Ask AI' },
  ];

  return (
    <div className="flex flex-wrap gap-2">
      {links.map((link) => (
        <NavLink
          key={link.label}
          to={link.to}
          end={link.end}
          className={({ isActive }) => `rounded-full px-3 py-1.5 text-sm font-medium transition ${
            isActive ? 'bg-primary text-white' : 'bg-white text-muted hover:bg-slate-100'
          }`}
        >
          {link.label}
        </NavLink>
      ))}
    </div>
  );
}

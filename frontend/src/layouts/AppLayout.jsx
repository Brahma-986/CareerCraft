import { useEffect, useState } from 'react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
  Bell,
  Briefcase,
  History,
  LayoutDashboard,
  LogOut,
  Menu,
  MessageSquare,
  Upload,
  UserRound,
  X,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { formatDate } from '../utils/format';

const navigation = [
  { to: '/app/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/app/upload', label: 'Upload resume', icon: Upload },
  { to: '/app/job-description', label: 'Job description', icon: Briefcase },
  { to: '/app/history', label: 'History', icon: History },
  { to: '/app/chat', label: 'AI assistant', icon: MessageSquare },
  { to: '/app/profile', label: 'Profile', icon: UserRound },
];

const titles = {
  '/app/dashboard': 'Dashboard',
  '/app/upload': 'Upload resume',
  '/app/job-description': 'Job description',
  '/app/history': 'Analysis history',
  '/app/chat': 'AI career assistant',
  '/app/profile': 'Profile',
};

export default function AppLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const [noticesOpen, setNoticesOpen] = useState(false);
  const [recent, setRecent] = useState([]);

  useEffect(() => {
    api.get('/analysis/history')
      .then((response) => setRecent(response.data.data.analyses.slice(0, 4)))
      .catch(() => setRecent([]));
  }, [location.pathname]);

  const title = titles[location.pathname] || (location.pathname.includes('/analysis/') ? 'Resume analysis' : 'CareerCraft');

  function signOut() {
    logout();
    navigate('/login');
  }

  return (
    <div className="min-h-screen bg-surface">
      <aside className={`fixed inset-y-0 left-0 z-30 w-64 border-r border-slate-200 bg-white transition-transform lg:translate-x-0 ${open ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex h-16 items-center justify-between px-5">
          <button onClick={() => navigate('/')} className="text-lg font-bold text-heading">CareerCraft</button>
          <button className="lg:hidden" onClick={() => setOpen(false)} aria-label="Close menu"><X className="h-5 w-5" /></button>
        </div>
        <nav className="space-y-1 px-3">
          {navigation.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={() => setOpen(false)}
              className={({ isActive }) => `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
                isActive ? 'bg-indigo-50 text-primary' : 'text-muted hover:bg-slate-50 hover:text-heading'
              }`}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </NavLink>
          ))}
        </nav>
      </aside>
      {open ? <button className="fixed inset-0 z-20 bg-slate-900/30 lg:hidden" onClick={() => setOpen(false)} aria-label="Close menu overlay" /> : null}

      <div className="lg:pl-64">
        <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b border-slate-200 bg-white/90 px-4 backdrop-blur md:px-6">
          <div className="flex items-center gap-3">
            <button className="rounded-lg p-2 hover:bg-slate-100 lg:hidden" onClick={() => setOpen(true)} aria-label="Open menu">
              <Menu className="h-5 w-5" />
            </button>
            <h1 className="text-base font-semibold text-heading">{title}</h1>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative">
              <button className="rounded-lg p-2 text-muted hover:bg-slate-100" onClick={() => setNoticesOpen((value) => !value)} aria-label="Notifications">
                <Bell className="h-5 w-5" />
              </button>
              {noticesOpen ? (
                <div className="absolute right-0 mt-2 w-72 rounded-2xl border border-slate-200 bg-white p-3 shadow-lg">
                  <p className="px-2 text-xs font-semibold uppercase tracking-wide text-muted">Recent analyses</p>
                  {recent.length === 0 ? (
                    <p className="px-2 py-4 text-sm text-muted">No analyses yet.</p>
                  ) : recent.map((item) => (
                    <button
                      key={item._id}
                      className="block w-full rounded-xl px-2 py-2 text-left hover:bg-slate-50"
                      onClick={() => {
                        setNoticesOpen(false);
                        navigate(`/app/analysis/${item._id}`);
                      }}
                    >
                      <span className="block text-sm font-medium text-heading">{item.resumeFileName}</span>
                      <span className="text-xs text-muted">{item.matchScore}% match · {formatDate(item.createdAt)}</span>
                    </button>
                  ))}
                </div>
              ) : null}
            </div>
            <div className="hidden text-right sm:block">
              <p className="text-sm font-semibold text-heading">{user?.name}</p>
              <p className="text-xs text-muted">{user?.email}</p>
            </div>
            <button className="rounded-lg p-2 text-muted hover:bg-slate-100" onClick={signOut} aria-label="Log out">
              <LogOut className="h-5 w-5" />
            </button>
          </div>
        </header>
        <main className="mx-auto max-w-6xl p-4 md:p-6">
          <div className="rise">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}

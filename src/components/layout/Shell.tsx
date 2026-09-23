import { useState, useEffect } from 'react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  Building2,
  ChevronDown,
  ChevronsLeft,
  Menu,
  Search,
  Bell,
  Sun,
  Moon,
  Plus,
  ArrowUpRight,
  WifiOff,
} from 'lucide-react';
import { useAuth, can } from '../../stores/auth';
import { usePreferences } from '../../stores/preferences';
import {
  navItems,
  resources,
  resourcePath,
  actionsFor,
  actionTitle,
} from '../../features/resources/catalog';
import { api, queryString } from '../../lib/api';
import { confirmDiscard } from '../../hooks/use-unsaved';
import { queryClient } from '../../lib/query';
import { type Page, type Row, type Operation, asRows } from '../../lib/types';
import { Button, Modal } from '../ui';
import { CommandPalette } from './CommandPalette';
import { OperationDialog } from '../OperationDialog';
export default function Shell() {
  const user = useAuth((s) => s.user)!;
  const preferences = usePreferences();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobile, setMobile] = useState(false);
  const [search, setSearch] = useState(false);
  const [projectPicker, setProjectPicker] = useState(false);
  const [projectSearch, setProjectSearch] = useState('');
  const [online, setOnline] = useState(navigator.onLine);
  const [quick, setQuick] = useState(false);
  const [action, setAction] = useState<{ operation: Operation; title: string } | null>(null);
  const projects = useQuery({
    queryKey: ['projects-picker', projectSearch],
    enabled: can('projects.read'),
    queryFn: ({ signal }) =>
      api<Page>('/projects' + queryString({ limit: 100, search: projectSearch }), { signal }),
  });
  const access = useQuery({
    queryKey: ['session-access'],
    queryFn: ({ signal }) => api<import('../../lib/types').User>('/auth/me', { signal }),
    refetchInterval: 300000,
  });
  useEffect(() => {
    if (access.data) useAuth.getState().setUser(access.data);
  }, [access.data]);
  const notifications = useQuery({
    queryKey: ['notifications'],
    queryFn: ({ signal }) => api<Page>('/notifications?limit=25', { signal }),
    refetchInterval: 60000,
  });
  const unread = asRows(notifications.data).filter((r) => !r.readAt).length;
  useEffect(() => {
    if (preferences.projectId && !user.projects.some((p) => p.projectId === preferences.projectId))
      preferences.setProject('', '');
    else if (!preferences.projectId && projects.data?.items[0]) {
      const p = projects.data.items[0];
      preferences.setProject(
        String(p.id),
        String(p.name),
        String(p.currency ?? 'PKR'),
        String(p.timezone ?? 'Asia/Karachi'),
      );
    }
  }, [projects.data, user.projects, preferences]);
  useEffect(() => {
    const key = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setSearch((s) => !s);
      }
    };
    const connected = () => setOnline(navigator.onLine);
    window.addEventListener('keydown', key);
    window.addEventListener('online', connected);
    window.addEventListener('offline', connected);
    return () => {
      window.removeEventListener('keydown', key);
      window.removeEventListener('online', connected);
      window.removeEventListener('offline', connected);
    };
  }, []);
  const slug = location.pathname.split('/')[1] ?? 'dashboard';
  const current = [...navItems, ...resources].find((n) => n.slug === slug);
  const groups = [
    ...new Set(
      navItems.filter((n) => can(n.permission) && n.group !== 'Personal').map((n) => n.group),
    ),
  ];
  function selectProject(p: Row) {
    if (p.id !== preferences.projectId && !confirmDiscard()) return;
    preferences.setProject(
      String(p.id),
      String(p.name),
      String(p.currency ?? 'PKR'),
      String(p.timezone ?? 'Asia/Karachi'),
    );
    void queryClient.cancelQueries();
    setProjectPicker(false);
    setMobile(false);
  }
  return (
    <div className={'app-shell ' + (preferences.collapsed ? 'sidebar-collapsed' : '')}>
      <a className="skip-link" href="#main-content">
        Skip to content
      </a>
      {mobile && (
        <button
          className="sidebar-scrim"
          aria-label="Close navigation"
          onClick={() => setMobile(false)}
        />
      )}
      <aside className={'sidebar ' + (mobile ? 'mobile-open' : '')}>
        <NavLink to="/dashboard" className="brand">
          <span className="brand-mark">
            <Building2 size={22} />
          </span>
          <span className="brand-word">
            estate<span className="blue">.</span>
          </span>
          <span className="workspace-badge">WORKSPACE</span>
        </NavLink>
        <button
          className="project-switcher"
          onClick={() => setProjectPicker(true)}
          title="Switch project"
        >
          <span className="project-icon">
            <Building2 size={17} />
          </span>
          <span className="project-caption">
            <small>CURRENT PROJECT</small>
            <strong>{preferences.projectName || 'Choose a project'}</strong>
          </span>
          <ChevronDown size={15} />
        </button>
        <nav className="sidebar-nav" aria-label="Main navigation">
          {groups.map((group) => (
            <div className="nav-group" key={group}>
              <div className="nav-label">{group}</div>
              {navItems
                .filter((n) => n.group === group && can(n.permission))
                .map((n) => (
                  <NavLink
                    key={n.slug}
                    to={'/' + n.slug}
                    onClick={() => setMobile(false)}
                    title={n.label}
                    className={({ isActive }) => 'nav-item ' + (isActive ? 'active' : '')}
                  >
                    <n.icon size={18} />
                    <span>{n.label}</span>
                    {n.slug === 'approvals' && <span className="nav-small-dot" />}
                  </NavLink>
                ))}
            </div>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <div className="workspace-note">
            <span className="live-dot" />
            <span>Connected to your portfolio</span>
            <ArrowUpRight size={14} />
          </div>
          <button
            className="user-switcher"
            onClick={() => {
              navigate('/profile');
              setMobile(false);
            }}
          >
            <span className="avatar">{user.name.slice(0, 1).toUpperCase()}</span>
            <span>
              <strong>{user.name}</strong>
              <small>My account & sessions</small>
            </span>
            <ChevronDown size={14} />
          </button>
        </div>
      </aside>
      <div className="app-main">
        <header className="topbar">
          <div className="topbar-context">
            <Button
              variant="ghost"
              size="icon"
              className="mobile-menu"
              aria-label="Open navigation"
              onClick={() => setMobile(true)}
            >
              <Menu size={20} />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="desktop-collapse"
              aria-label="Toggle sidebar"
              onClick={preferences.toggleSidebar}
            >
              <ChevronsLeft size={18} />
            </Button>
            <span className="breadcrumb">
              Workspace <span>/</span> <strong>{current?.label ?? 'New booking'}</strong>
            </span>
          </div>
          <div className="topbar-actions">
            <button className="global-search" onClick={() => setSearch(true)}>
              <Search size={16} />
              <span>Search anything…</span>
              <kbd>⌘ K</kbd>
            </button>
            <Button
              variant="ghost"
              size="icon"
              aria-label="Toggle color theme"
              onClick={() => preferences.setTheme(preferences.theme === 'dark' ? 'light' : 'dark')}
            >
              {preferences.theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="notification-button"
              aria-label={`Notifications, ${unread} unread`}
              onClick={() => navigate('/notifications')}
            >
              <Bell size={18} />
              {unread > 0 && <span />}
            </Button>
            <Button size="small" onClick={() => setQuick(true)}>
              <Plus size={16} />
              <span className="create-label">Create</span>
            </Button>
          </div>
        </header>
        {!online && (
          <div className="offline-banner" role="status">
            <WifiOff size={17} />
            You're offline. Reconnect before making changes.
          </div>
        )}
        <main id="main-content" className="workspace">
          <Outlet key={preferences.projectId} />
        </main>
        <footer className="workspace-footer">
          <span>
            Estate Workspace <span> / </span> v1.0
          </span>
          <span>
            <span className={online ? 'live-dot' : 'offline-dot'} />
            {online ? 'Online workspace' : 'Offline'}
          </span>
        </footer>
      </div>
      <CommandPalette open={search} onClose={() => setSearch(false)} />
      <Modal
        open={projectPicker}
        onOpenChange={setProjectPicker}
        title="Your projects"
        description="Choose the workspace you want to work in."
      >
        <div className="modal-body">
          <div className="input-icon">
            <Search size={17} />
            <input
              aria-label="Search projects"
              placeholder="Search assigned projects…"
              value={projectSearch}
              onChange={(e) => setProjectSearch(e.target.value)}
            />
          </div>
          <div className="project-options">
            {projects.data?.items.map((p) => (
              <button
                key={p.id}
                onClick={() => selectProject(p)}
                className={p.id === preferences.projectId ? 'selected' : ''}
              >
                <Building2 size={20} />
                <span>
                  <strong>{String(p.name)}</strong>
                  <small>
                    {String(p.code)} · {String(p.currency)}
                  </small>
                </span>
                <ArrowUpRight size={16} />
              </button>
            ))}
          </div>
          {!projects.data?.items.length && <p className="muted">No matching assigned projects.</p>}
          <Button
            variant="secondary"
            onClick={() => {
              navigate('/projects');
              setProjectPicker(false);
            }}
          >
            Manage projects
          </Button>
        </div>
      </Modal>
      <Modal
        open={quick}
        onOpenChange={setQuick}
        title="Start something new"
        description="Actions available to you in this workspace."
      >
        <div className="quick-grid">
          {resources
            .filter(
              (r) =>
                ['projects', 'customers', 'inventory', 'crm', 'collections'].includes(r.slug) &&
                (r.global || preferences.projectId),
            )
            .flatMap((r) =>
              actionsFor(r)
                .filter((op) => op.path === resourcePath(r))
                .map((op) => (
                  <button
                    key={op.id}
                    onClick={() => {
                      setQuick(false);
                      setAction({ operation: op, title: actionTitle(op, r) });
                    }}
                  >
                    <r.icon size={22} />
                    <strong>{actionTitle(op, r)}</strong>
                  </button>
                )),
            )}
          {can('bookings.create') && preferences.projectId && (
            <button
              onClick={() => {
                setQuick(false);
                navigate('/bookings/new');
              }}
            >
              <Plus size={22} />
              <strong>New booking</strong>
            </button>
          )}
        </div>
      </Modal>
      {action && <OperationDialog {...action} onClose={() => setAction(null)} />}
    </div>
  );
}

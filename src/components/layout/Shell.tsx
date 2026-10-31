import { t, useLocale } from '../../lib/i18n';
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
  Users,
  UserPlus,
  FileSpreadsheet,
  QrCode,
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
import { LanguageSelector } from '../LanguageSelector';
import { BrandLogo } from '../BrandLogo';
import { SearchSelect } from '../SearchSelect';
const propertySlugs = ['property-lifecycle', 'vendors', 'property-purchases', 'inventory'];
export default function Shell() {
  useLocale();
  const user = useAuth((s) => s.user)!;
  const preferences = usePreferences();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobile, setMobile] = useState(false);
  const [search, setSearch] = useState(false);
  const [projectSearch, setProjectSearch] = useState('');
  const [online, setOnline] = useState(navigator.onLine);
  const [quick, setQuick] = useState(false);
  const [action, setAction] = useState<{ operation: Operation; title: string } | null>(null);

  const isMembersActive =
    location.pathname.startsWith('/customers') || location.pathname.startsWith('/members');
  const [membersOpen, setMembersOpen] = useState(isMembersActive);
  const isPropertiesActive = propertySlugs.some(
    (slug) => location.pathname === '/' + slug || location.pathname.startsWith('/' + slug + '/'),
  );
  const [propertiesOpen, setPropertiesOpen] = useState(isPropertiesActive);
  const propertyNavigation = propertySlugs.flatMap((slug) => {
    const item = navItems.find((item) => item.slug === slug);
    return item && can(item.permission) ? [item] : [];
  });
  const sidebarItems = navItems.filter((item) =>
    item.slug === 'inventory'
      ? propertyNavigation.length > 0
      : !propertySlugs.includes(item.slug) && can(item.permission),
  );

  useEffect(() => {
    if (isPropertiesActive) setPropertiesOpen(true);
  }, [isPropertiesActive, location.pathname]);

  useEffect(() => {
    if (isMembersActive) {
      setMembersOpen(true);
    }
  }, [isMembersActive]);
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
  const currentProjectId = usePreferences((s) => s.projectId);
  const setProject = usePreferences((s) => s.setProject);
  useEffect(() => {
    const userProjectIds = new Set((user?.projects ?? []).map((p) => p.projectId));
    if (currentProjectId && userProjectIds.size > 0 && !userProjectIds.has(currentProjectId)) {
      setProject('', '');
    } else if (!currentProjectId && projects.data?.items) {
      const allowed = projects.data.items.find((p) => userProjectIds.has(String(p.id)));
      if (allowed) {
        setProject(
          String(allowed.id),
          String(allowed.name),
          String(allowed.currency ?? 'PKR'),
          String(allowed.timezone ?? 'Asia/Karachi'),
        );
      }
    }
  }, [projects.data, user?.projects, currentProjectId, setProject]);
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
  const customerPages: Record<string, string> = {
    register: 'Customer registration',
    ledgers: 'Customer ledgers',
    qr: 'Customer QR codes',
  };
  const currentLabel =
    (isMembersActive && customerPages[location.pathname.split('/')[2] ?? '']) ||
    (location.pathname === '/bookings/new' ? 'New booking' : current?.label) ||
    'Workspace';
  const groups = [
    ...new Set(sidebarItems.filter((n) => n.group !== 'Personal').map((n) => n.group)),
  ];
  async function selectProject(p: Row) {
    if (p.id !== preferences.projectId && !(await confirmDiscard())) return;
    preferences.setProject(
      String(p.id),
      String(p.name),
      String(p.currency ?? 'PKR'),
      String(p.timezone ?? 'Asia/Karachi'),
    );
    void queryClient.cancelQueries();
    setMobile(false);
  }
  return (
    <div className={'app-shell ' + (preferences.collapsed ? 'sidebar-collapsed' : '')}>
      <a className="skip-link" href="#main-content">
        {t('Skip to content')}
      </a>
      {mobile && (
        <button
          className="sidebar-scrim"
          aria-label={t('Close navigation')}
          onClick={() => setMobile(false)}
        />
      )}
      <aside className={'sidebar ' + (mobile ? 'mobile-open' : '')}>
        <NavLink to="/dashboard" className="brand" aria-label="Etihad Real Estate">
          <BrandLogo background="dark" className="sidebar-logo-full" decorative />
          <BrandLogo
            variant="symbol"
            background="dark"
            className="sidebar-logo-compact"
            decorative
          />
        </NavLink>
        <SearchSelect
          className="project-select"
          triggerClassName="project-switcher"
          ariaLabel={t('Switch project')}
          value={preferences.projectId}
          options={(projects.data?.items ?? []).map((p) => ({
            value: p.id!,
            label: `${p.name} · ${p.code}`,
          }))}
          search={projectSearch}
          onSearch={setProjectSearch}
          searchLabel={t('Search projects')}
          selectedLabel={preferences.projectName}
          disabled={!can('projects.read')}
          loading={projects.isFetching}
          error={projects.isError}
          onRetry={() => void projects.refetch()}
          clearable={false}
          onChange={(value) => {
            const p = projects.data?.items.find((p) => p.id === value);
            if (p) void selectProject(p);
          }}
          triggerContent={
            <>
              <span className="project-icon">
                <Building2 size={17} />
              </span>
              <span className="project-caption">
                <small>{t('CURRENT PROJECT')}</small>
                <strong>{preferences.projectName || t('Choose a project')}</strong>
              </span>
            </>
          }
        />
        <nav className="sidebar-nav" aria-label={t('Main navigation')}>
          {groups.map((group) => (
            <div className="nav-group" key={t(group)}>
              <div className="nav-label">{t(group)}</div>
              {sidebarItems
                .filter((n) => n.group === group)
                .map((n) => {
                  if (n.slug === 'inventory') {
                    return (
                      <div className={`nav-dropdown ${propertiesOpen ? 'open' : ''}`} key={n.slug}>
                        <button
                          type="button"
                          className={`nav-item nav-dropdown-trigger ${isPropertiesActive ? 'active-parent' : ''} ${propertiesOpen ? 'open' : ''}`}
                          onClick={() => {
                            if (preferences.collapsed) {
                              preferences.toggleSidebar();
                              setPropertiesOpen(true);
                            } else {
                              setPropertiesOpen((open) => !open);
                            }
                          }}
                          title={t('Properties')}
                          aria-expanded={propertiesOpen && !preferences.collapsed}
                          aria-controls="properties-submenu"
                        >
                          <Building2 size={18} />
                          <span>{t('Properties')}</span>
                          <ChevronDown size={14} className="nav-chevron" />
                        </button>
                        {propertiesOpen && !preferences.collapsed && (
                          <div className="nav-sub-menu" id="properties-submenu">
                            {propertyNavigation.map((item) => (
                              <NavLink
                                key={item.slug}
                                to={'/' + item.slug}
                                onClick={() => setMobile(false)}
                                className={({ isActive }) =>
                                  'nav-sub-item ' + (isActive ? 'active' : '')
                                }
                              >
                                <item.icon size={14} />
                                <span>
                                  {t(item.slug === 'inventory' ? 'All properties' : item.label)}
                                </span>
                              </NavLink>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  }
                  if (n.slug === 'customers') {
                    return (
                      <div className={`nav-dropdown ${membersOpen ? 'open' : ''}`} key={n.slug}>
                        <button
                          type="button"
                          className={`nav-item nav-dropdown-trigger ${isMembersActive ? 'active-parent' : ''} ${membersOpen ? 'open' : ''}`}
                          onClick={() => {
                            if (preferences.collapsed) {
                              preferences.toggleSidebar();
                              setMembersOpen(true);
                            } else {
                              setMembersOpen((prev) => !prev);
                            }
                          }}
                          title={t(n.label)}
                          aria-expanded={membersOpen}
                        >
                          <n.icon size={18} />
                          <span>{t(n.label)}</span>
                          <ChevronDown size={14} className="nav-chevron" />
                        </button>
                        {membersOpen && !preferences.collapsed && (
                          <div className="nav-sub-menu">
                            <NavLink
                              to="/members/register"
                              onClick={() => setMobile(false)}
                              className={({ isActive }) =>
                                'nav-sub-item ' + (isActive ? 'active' : '')
                              }
                            >
                              <UserPlus size={14} />
                              <span>{t('Customer registration')}</span>
                            </NavLink>
                            <NavLink
                              to="/customers"
                              end
                              onClick={() => setMobile(false)}
                              className={({ isActive }) =>
                                'nav-sub-item ' +
                                (isActive ||
                                (location.pathname === '/customers' &&
                                  !location.pathname.includes('/register') &&
                                  !location.pathname.includes('/ledgers') &&
                                  !location.pathname.includes('/qr'))
                                  ? 'active'
                                  : '')
                              }
                            >
                              <Users size={14} />
                              <span>{t('All customers')}</span>
                            </NavLink>
                            <NavLink
                              to="/members/ledgers"
                              onClick={() => setMobile(false)}
                              className={({ isActive }) =>
                                'nav-sub-item ' + (isActive ? 'active' : '')
                              }
                            >
                              <FileSpreadsheet size={14} />
                              <span>{t('Customer ledgers')}</span>
                            </NavLink>
                            <NavLink
                              to="/members/qr"
                              onClick={() => setMobile(false)}
                              className={({ isActive }) =>
                                'nav-sub-item ' + (isActive ? 'active' : '')
                              }
                            >
                              <QrCode size={14} />
                              <span>{t('Customer QR codes')}</span>
                            </NavLink>
                          </div>
                        )}
                      </div>
                    );
                  }

                  return (
                    <NavLink
                      key={n.slug}
                      to={'/' + n.slug}
                      onClick={() => setMobile(false)}
                      title={t(n.label)}
                      className={({ isActive }) => 'nav-item ' + (isActive ? 'active' : '')}
                    >
                      <n.icon size={18} />
                      <span>{t(n.label)}</span>
                    </NavLink>
                  );
                })}
            </div>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <div className="workspace-note">
            <span className="live-dot" />
            <span>{t('Connected to your portfolio')}</span>
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
              <small>{t('My account & sessions')}</small>
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
              aria-label={t('Open navigation')}
              onClick={() => setMobile(true)}
            >
              <Menu size={20} />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="desktop-collapse"
              aria-label={t('Toggle sidebar')}
              onClick={preferences.toggleSidebar}
            >
              <ChevronsLeft size={18} />
            </Button>
            <span className="breadcrumb">
              {t('Workspace')} <span>/</span> <strong>{t(currentLabel)}</strong>
            </span>
          </div>
          <div className="topbar-actions">
            {can('settings.manage') && <LanguageSelector />}
            <button className="global-search" onClick={() => setSearch(true)}>
              <Search size={16} />
              <span>{t('Search anything…')}</span>
              <kbd>⌘ K</kbd>
            </button>
            <Button
              variant="ghost"
              size="icon"
              aria-label={t('Toggle color theme')}
              onClick={() => preferences.setTheme(preferences.theme === 'dark' ? 'light' : 'dark')}
            >
              {preferences.theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="notification-button"
              aria-label={t('Notifications, {0} unread', { '0': unread })}
              onClick={() => navigate('/notifications')}
            >
              <Bell size={18} />
              {unread > 0 && <span />}
            </Button>
            <Button size="small" onClick={() => setQuick(true)}>
              <Plus size={16} />
              <span className="create-label">{t('Create')}</span>
            </Button>
          </div>
        </header>
        {!online && (
          <div className="offline-banner" role="status">
            <WifiOff size={17} />
            {t("You're offline. Reconnect before making changes.")}
          </div>
        )}
        <main id="main-content" className="workspace">
          <Outlet key={preferences.projectId} />
        </main>
        <footer className="workspace-footer">
          <span>
            etihadrealestate <span> / </span> v1.0
          </span>
          <span>
            <span className={online ? 'live-dot' : 'offline-dot'} />
            {online ? t('Online workspace') : t('Offline')}
          </span>
        </footer>
      </div>
      <CommandPalette open={search} onClose={() => setSearch(false)} />
      <Modal
        open={quick}
        onOpenChange={setQuick}
        title={t('Start something new')}
        description={t('Actions available to you in this workspace.')}
      >
        <div className="quick-grid">
          {resources
            .filter(
              (r) =>
                ['projects', 'customers', 'inventory', 'collections'].includes(r.slug) &&
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
                    <strong>{t(actionTitle(op, r))}</strong>
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
              <strong>{t('New booking')}</strong>
            </button>
          )}
        </div>
      </Modal>
      {action && <OperationDialog {...action} onClose={() => setAction(null)} />}
    </div>
  );
}

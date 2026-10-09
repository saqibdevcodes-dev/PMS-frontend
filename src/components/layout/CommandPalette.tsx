import { t, useLocale } from '../../lib/i18n';
import { useState, useEffect } from 'react';
import { Command } from 'cmdk';
import { useQueries } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { Search, ArrowUpRight } from 'lucide-react';
import { resources, navItems, resourcePath } from '../../features/resources/catalog';
import { usePreferences } from '../../stores/preferences';
import { can } from '../../stores/auth';
import { api, queryString } from '../../lib/api';
import { resolvePath } from '../../lib/contract';
import { asRows } from '../../lib/types';
import { labelOf } from '../../lib/format';
import { Modal } from '../ui';
export function CommandPalette({ open, onClose }: { open: boolean; onClose: () => void }) {
  useLocale();
  const [search, setSearch] = useState('');
  const [debounced, setDebounced] = useState('');
  const projectId = usePreferences((s) => s.projectId);
  const navigate = useNavigate();
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(search), 250);
    return () => clearTimeout(timer);
  }, [search]);
  const targets = resources.filter(
    (r) => ['customers', 'inventory', 'bookings'].includes(r.slug) && can(r.permission),
  );
  const queries = useQueries({
    queries: targets.map((r) => ({
      queryKey: ['global-search', projectId, r.slug, debounced],
      enabled: open && !!projectId && debounced.length >= 2,
      queryFn: ({ signal }: { signal: AbortSignal }) =>
        api(resolvePath(resourcePath(r)) + queryString({ search: debounced, limit: 5 }), {
          signal,
        }),
    })),
  });
  function go(path: string) {
    navigate(path);
    onClose();
  }
  return (
    <Modal
      open={open}
      onOpenChange={(v) => !v && onClose()}
      title={t('Find your next move')}
      description={t("Search your current project's records or jump to a module.")}
    >
      <Command className="command" shouldFilter={false}>
        <div className="command-search">
          <Search size={20} />
          <Command.Input
            autoFocus
            value={search}
            onValueChange={setSearch}
            placeholder={t('Search customers, properties, bookings…')}
          />
        </div>
        <Command.List>
          <Command.Empty>{t('No matching records or pages.')}</Command.Empty>
          <Command.Group heading="Go to">
            {navItems
              .filter(
                (n) => can(n.permission) && n.label.toLowerCase().includes(search.toLowerCase()),
              )
              .map((n) => (
                <Command.Item key={n.slug} value={n.slug} onSelect={() => go('/' + n.slug)}>
                  <n.icon size={17} />
                  <span>{t(n.label)}</span>
                  <ArrowUpRight size={14} />
                </Command.Item>
              ))}
          </Command.Group>
          {targets.map((r, index) => (
            <Command.Group key={r.slug} heading={t(r.label)}>
              {asRows(queries[index]?.data).map((record) => (
                <Command.Item
                  key={record.id}
                  value={String(record.id)}
                  onSelect={() => go(`/${r.slug}?record=${record.id}`)}
                >
                  <r.icon size={17} />
                  <span>{labelOf(record)}</span>
                  <small>{String(record.reference ?? record.status ?? '')}</small>
                </Command.Item>
              ))}
            </Command.Group>
          ))}
        </Command.List>
        <div className="command-footer">
          <span>{t('↑ ↓ to navigate')}</span>
          <span>{t('↵ to open')}</span>
          <span>{t('esc to close')}</span>
        </div>
      </Command>
    </Modal>
  );
}

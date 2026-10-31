import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api, queryString } from '../lib/api';
import type { Page, Row } from '../lib/types';
import { usePreferences } from '../stores/preferences';
import { can } from '../stores/auth';

export function useCustomerDirectory(selectedId: string, search = '') {
  const projectId = usePreferences((s) => s.projectId);
  const [page, setPage] = useState(1);
  const [debounced, setDebounced] = useState(search);
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebounced(search);
      setPage(1);
    }, 250);
    return () => clearTimeout(timer);
  }, [search]);
  useEffect(() => setPage(1), [projectId]);
  const query = useQuery({
    queryKey: ['customer-directory', projectId, page, debounced],
    enabled: Boolean(projectId && can('customers.read')),
    queryFn: ({ signal }) =>
      api<Page>(
        `/projects/${projectId}/customers${queryString({ page, limit: 25, search: debounced })}`,
        { signal },
      ),
  });
  const selected = useQuery({
    queryKey: ['selected-customer', projectId, selectedId],
    enabled: Boolean(projectId && selectedId && can('customers.read')),
    queryFn: ({ signal }) => api<Row>(`/projects/${projectId}/customers/${selectedId}`, { signal }),
  });
  return { query, selected, page, setPage };
}

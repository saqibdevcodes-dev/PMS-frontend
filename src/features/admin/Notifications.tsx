import { useQuery, useMutation } from '@tanstack/react-query';
import { useState } from 'react';
import { Bell, CheckCheck } from 'lucide-react';
import { toast } from 'sonner';
import { api } from '../../lib/api';
import { queryClient } from '../../lib/query';
import { asRows, type Page } from '../../lib/types';
import { date } from '../../lib/format';
import { PageHeading, Button, EmptyState, ErrorState, Skeleton, Badge } from '../../components/ui';
export default function Notifications() {
  const [page, setPage] = useState(1);
  const query = useQuery({
    queryKey: ['notifications', page],
    queryFn: ({ signal }) => api<Page>('/notifications?page=' + page + '&limit=25', { signal }),
    refetchInterval: 60000,
  });
  const mark = useMutation({
    mutationFn: (id: string) => api('/notifications/' + id + '/read', { method: 'POST', body: {} }),
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: ['notifications'] }),
    onError: (e) => toast.error(e.message),
  });
  return (
    <>
      <PageHeading
        eyebrow="Stay in the loop"
        title="Notifications"
        description="Updates from your team and your project workflows."
      />
      <section className="panel notifications-list">
        {query.isLoading ? (
          <Skeleton />
        ) : query.isError ? (
          <ErrorState error={query.error} />
        ) : asRows(query.data).length ? (
          asRows(query.data).map((n) => (
            <article key={n.id} className={n.readAt ? '' : 'unread'}>
              <span className="notification-icon">
                <Bell size={20} />
              </span>
              <div>
                <header>
                  <h3>{String(n.title)}</h3>
                  <Badge value={n.channel} />
                </header>
                <p>{String(n.body)}</p>
                <small>{date(n.createdAt)}</small>
              </div>
              {!n.readAt && (
                <Button
                  variant="ghost"
                  size="small"
                  busy={mark.isPending && mark.variables === n.id}
                  onClick={() => mark.mutate(String(n.id))}
                >
                  <CheckCheck size={16} />
                  Mark read
                </Button>
              )}
            </article>
          ))
        ) : (
          <EmptyState
            title="You're all caught up"
            description="Your notifications will appear here as your team works."
          />
        )}
      </section>
      {query.data && query.data.pagination.totalPages > 1 && (
        <div className="grid-pagination">
          <Button variant="secondary" disabled={page === 1} onClick={() => setPage(page - 1)}>
            Previous
          </Button>
          <span>Page {page}</span>
          <Button
            variant="secondary"
            disabled={page >= query.data.pagination.totalPages}
            onClick={() => setPage(page + 1)}
          >
            Next
          </Button>
        </div>
      )}
    </>
  );
}

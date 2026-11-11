import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useMutation, useQuery } from '@tanstack/react-query';
import { Eye, Lock, Plus, RefreshCw, Save, Search, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { api, ApiError } from '../../lib/api';
import { allPages } from '../../lib/pages';
import { exactMoney, moneyPayload } from '../../lib/exact-money';
import { t, useLocale } from '../../lib/i18n';
import { row, type Row } from '../../lib/types';
import { usePreferences } from '../../stores/preferences';
import { can } from '../../stores/auth';
import { queryClient } from '../../lib/query';
import { useUnsavedChanges, confirmDiscard } from '../../hooks/use-unsaved';
import { Money } from '../../components/Money';
import { MoneyInput } from '../../components/MoneyInput';
import { DataTable } from '../../components/DataTable';
import { Select } from '../../components/Select';
import { Badge, Button, EmptyState, ErrorState, Modal, PageHeading } from '../../components/ui';
import { ProjectRequired, Unauthorized } from '../resources/ResourcePage';
import './property-expenses.css';

type ExpenseItem = {
  id: string;
  name: string;
  category: string;
  amount: string;
};

function expenseItems(record: Row): ExpenseItem[] {
  if (!Array.isArray(record.expenseItems)) return [];
  return record.expenseItems.map((value, index) => {
    const item = row(value);
    return {
      id: String(item.id ?? `expense-${index}`),
      name: String(item.name ?? ''),
      category: String(item.category ?? 'Renovation & Building'),
      amount: String(item.amount ?? '0'),
    };
  });
}

function itemTotal(record: Row) {
  return expenseItems(record).reduce(
    (total, item) => total.plus(exactMoney(item.amount)),
    exactMoney(0),
  );
}

export default function PropertyExpensesPage() {
  useLocale();
  const projectId = usePreferences((state) => state.projectId);
  const currency = usePreferences((state) => state.currency) || 'PKR';
  const [search, setSearch] = useState('');
  const [view, setView] = useState<'ALL' | 'DRAFT' | 'FINAL'>('ALL');
  const [selected, setSelected] = useState<Row | null>(null);
  const purchases = useQuery({
    queryKey: ['property-expense-drafts', projectId],
    enabled: Boolean(projectId && can('finance.read')),
    queryFn: ({ signal }) => allPages<Row>(`/projects/${projectId}/property-purchases`, signal),
  });
  const records = useMemo(() => {
    const term = search.trim().toLowerCase();
    return (purchases.data ?? [])
      .filter((record) => record.status !== 'VOIDED')
      .filter((record) => {
        if (view === 'DRAFT' && record.status !== 'DRAFT') return false;
        if (view === 'FINAL' && record.status !== 'POSTED') return false;
        if (!term) return true;
        const unit = row(record.unit);
        const vendor = row(record.vendor);
        return [record.title, record.reference, unit.number, vendor.name].some((value) =>
          String(value ?? '')
            .toLowerCase()
            .includes(term),
        );
      })
      .sort((left, right) => (left.status === right.status ? 0 : left.status === 'DRAFT' ? -1 : 1));
  }, [purchases.data, search, view]);
  if (!can('finance.read')) return <Unauthorized />;
  if (!projectId) return <ProjectRequired />;
  return (
    <>
      <PageHeading
        eyebrow="Property Lifecycle"
        title="Property expenses"
        description="Select a sale property, add itemized costs, and keep them in draft until the investment is finalized."
        actions={
          <>
            <Button
              variant="secondary"
              size="icon"
              aria-label={t('Refresh records')}
              onClick={() => void purchases.refetch()}
            >
              <RefreshCw size={16} className={purchases.isFetching ? 'spin' : undefined} />
            </Button>
            <Button asChild variant="secondary">
              <Link to="/property-lifecycle">{t('Open Property Lifecycle')}</Link>
            </Button>
          </>
        }
      />
      <div className="document-notice">
        <Lock size={18} />
        <span>{t('Only draft properties can receive new expenses.')}</span>
      </div>
      <section className="panel">
        <div className="table-toolbar">
          <div className="toolbar-filters">
            <div className="input-icon">
              <Search size={16} />
              <input
                aria-label={t('Search sale properties')}
                placeholder={t('Search property, reference or seller...')}
                value={search}
                onChange={(event) => setSearch(event.target.value)}
              />
            </div>
            <Select
              aria-label={t('Filter by status')}
              value={view}
              onChange={(value) => setView(value as 'ALL' | 'DRAFT' | 'FINAL')}
              options={[
                { value: 'ALL', label: t('All statuses') },
                { value: 'DRAFT', label: t('Editable expense drafts') },
                { value: 'FINAL', label: t('Finalized properties') },
              ]}
            />
          </div>
        </div>
        {purchases.isError ? (
          <ErrorState error={purchases.error} retry={() => void purchases.refetch()} />
        ) : (
          <DataTable
            data={records}
            columns={['property', 'seller', 'saleStatus', 'expenseItems', 'expenseTotal', 'status']}
            columnLabels={{
              property: 'Property',
              seller: 'Seller',
              saleStatus: 'Sale status',
              expenseItems: 'Expense items',
              expenseTotal: 'Draft expenses',
              status: 'Status',
              actions: 'Actions',
            }}
            busy={purchases.isLoading}
            total={records.length}
            controls={false}
            onRow={setSelected}
            empty={
              <EmptyState
                title={t('No sale properties in this view')}
                description={t('Create a property purchase draft in Property Lifecycle first.')}
              />
            }
            renderCell={(column, record) => {
              const unit = row(record.unit);
              const vendor = row(record.vendor);
              if (column === 'property') {
                return (
                  <div className="property-expense-identity">
                    <strong>{String(record.title ?? unit.number ?? t('Property'))}</strong>
                    <small>{String(unit.number ?? record.reference ?? '')}</small>
                  </div>
                );
              }
              if (column === 'seller') return <span>{String(vendor.name ?? '—')}</span>;
              if (column === 'saleStatus') return <Badge value={unit.status ?? 'UNLISTED'} />;
              if (column === 'expenseItems') return <span>{expenseItems(record).length}</span>;
              if (column === 'expenseTotal') {
                return <Money value={itemTotal(record)} currency={currency} />;
              }
              return undefined;
            }}
            actions={(record) => {
              const editable = record.status === 'DRAFT' && can('finance.post');
              const count = expenseItems(record).length;
              return (
                <Button
                  size="small"
                  variant={editable ? 'primary' : 'secondary'}
                  onClick={() => setSelected(record)}
                >
                  {editable ? <Plus size={14} /> : <Eye size={14} />}
                  {t(
                    editable
                      ? count
                        ? 'Edit expense draft'
                        : 'Add expenses'
                      : 'View finalized expenses',
                  )}
                </Button>
              );
            }}
          />
        )}
      </section>
      {selected && (
        <ExpenseDraftDialog
          key={String(selected.id)}
          record={selected}
          currency={currency}
          onClose={() => setSelected(null)}
          onSaved={(record) => {
            setSelected(null);
            void queryClient.invalidateQueries({ queryKey: ['property-expense-drafts'] });
            void queryClient.invalidateQueries({ queryKey: ['deal-profitability'] });
            void queryClient.invalidateQueries({ queryKey: ['resource'] });
            if (record.id) toast.success(t('Property expense draft saved'));
          }}
        />
      )}
    </>
  );
}

function ExpenseDraftDialog({
  record,
  currency,
  onClose,
  onSaved,
}: {
  record: Row;
  currency: string;
  onClose: () => void;
  onSaved: (record: Row) => void;
}) {
  const projectId = usePreferences((state) => state.projectId);
  const editable = record.status === 'DRAFT' && can('finance.post');
  const initialItems = useMemo(() => expenseItems(record), [record]);
  const [items, setItems] = useState(initialItems);
  const [notes, setNotes] = useState(String(record.notes ?? ''));
  const initialDraft = useMemo(
    () => JSON.stringify({ items: initialItems, notes: String(record.notes ?? '') }),
    [initialItems, record.notes],
  );
  const dirty = JSON.stringify({ items, notes }) !== initialDraft;
  useUnsavedChanges(editable && dirty);
  const total = items.reduce((sum, item) => sum.plus(exactMoney(item.amount)), exactMoney(0));
  const save = useMutation({
    mutationFn: async () => {
      const expenseItems = items.map((item) => {
        if (!item.name.trim() || !item.category.trim() || !exactMoney(item.amount).gt(0))
          throw new Error(
            t('Every expense needs a description, category and amount greater than zero.'),
          );
        return {
          id: item.id,
          name: item.name.trim(),
          category: item.category.trim(),
          amount: moneyPayload(item.amount),
        };
      });
      return api<Row>(`/projects/${projectId}/property-purchases/${record.id}/expenses`, {
        method: 'PATCH',
        body: { expenseItems, notes: notes.trim() },
      });
    },
    onSuccess: onSaved,
    onError: (error) =>
      toast.error(
        error instanceof ApiError
          ? error.message
          : error instanceof Error
            ? error.message
            : t('Failed to save expense draft'),
      ),
  });
  const unit = row(record.unit);
  return (
    <Modal
      open
      wide
      title={editable ? t('Property expense draft') : t('Finalized property expenses')}
      description={String(record.title ?? unit.number ?? '')}
      onOpenChange={(open) => !open && onClose()}
      beforeClose={async () => !save.isPending && (!dirty || (await confirmDiscard()))}
    >
      <div className="modal-body property-expense-dialog">
        {!editable && (
          <div className="document-notice">
            <Lock size={18} />
            <span>
              {t(
                'This property is finalized. Its expense cost basis is locked and cannot be changed.',
              )}
            </span>
          </div>
        )}
        <div className="property-expense-dialog-heading">
          <div>
            <span>{t('Property')}</span>
            <strong>{String(unit.number ?? record.title ?? '—')}</strong>
          </div>
          <div>
            <span>{t('Expense draft total')}</span>
            <strong>
              <Money value={total} currency={currency} />
            </strong>
          </div>
        </div>
        <div className="property-expense-lines">
          {items.length === 0 && (
            <p className="muted">{t('No itemized expenses have been added.')}</p>
          )}
          {items.map((item, index) => (
            <div className="property-expense-line" key={item.id}>
              <span className="property-expense-line-number">{index + 1}</span>
              <label>
                <span>{t('Expense description')}</span>
                <input
                  value={item.name}
                  disabled={!editable}
                  onChange={(event) =>
                    setItems((current) =>
                      current.map((value) =>
                        value.id === item.id ? { ...value, name: event.target.value } : value,
                      ),
                    )
                  }
                />
              </label>
              <label>
                <span>{t('Category')}</span>
                <input
                  value={item.category}
                  disabled={!editable}
                  onChange={(event) =>
                    setItems((current) =>
                      current.map((value) =>
                        value.id === item.id ? { ...value, category: event.target.value } : value,
                      ),
                    )
                  }
                />
              </label>
              <label>
                <span>{t('Amount')}</span>
                <MoneyInput
                  value={item.amount}
                  min="0.01"
                  disabled={!editable}
                  onValueChange={(amount) =>
                    setItems((current) =>
                      current.map((value) => (value.id === item.id ? { ...value, amount } : value)),
                    )
                  }
                />
              </label>
              {editable && (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  aria-label={t('Remove expense {0}', { '0': index + 1 })}
                  onClick={() =>
                    setItems((current) => current.filter((value) => value.id !== item.id))
                  }
                >
                  <Trash2 size={16} />
                </Button>
              )}
            </div>
          ))}
        </div>
        {editable && (
          <Button
            type="button"
            variant="secondary"
            onClick={() =>
              setItems((current) => [
                ...current,
                {
                  id: crypto.randomUUID(),
                  name: '',
                  category: 'Renovation & Building',
                  amount: '',
                },
              ])
            }
          >
            <Plus size={16} />
            {t('Add expense line')}
          </Button>
        )}
        <label className="form-field form-full">
          <span>{t('Draft notes')}</span>
          <textarea
            value={notes}
            disabled={!editable}
            maxLength={2000}
            onChange={(event) => setNotes(event.target.value)}
          />
        </label>
        <div className="form-footer">
          <Button type="button" variant="secondary" onClick={onClose}>
            {t('Close')}
          </Button>
          {editable && (
            <Button
              type="button"
              busy={save.isPending}
              disabled={!dirty || save.isPending}
              onClick={() => save.mutate()}
            >
              <Save size={16} />
              {t('Save expense draft')}
            </Button>
          )}
        </div>
      </div>
    </Modal>
  );
}

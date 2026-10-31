import { can } from '../../stores/auth';
import { ProjectRequired, Unauthorized } from '../resources/ResourcePage';
import { MoneyInput } from '../../components/MoneyInput';
import { Money } from '../../components/Money';
import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import {
  Building2,
  TrendingUp,
  Receipt,
  Plus,
  ArrowRight,
  Search,
  CheckCircle2,
  Clock,
  Eye,
  FileSpreadsheet,
  RefreshCw,
  Sparkles,
  ArrowUpRight,
  Tag,
  UserCheck,
  Lock,
} from 'lucide-react';
import { toast } from 'sonner';
import { api, ApiError } from '../../lib/api';
import { usePreferences } from '../../stores/preferences';
import { t, useLocale } from '../../lib/i18n';
import { date, moneyWithWords } from '../../lib/format';
import {
  Button,
  Modal,
  PageHeading,
  Skeleton,
  EmptyState,
  ErrorState,
  Badge,
} from '../../components/ui';
import { PropertyPurchaseWizard } from '../resources/PropertyPurchaseWizard';
import { JournalVoucher } from '../resources/JournalVoucher';
import '../dashboard/deal-profitability.css';
import './property-lifecycle.css';

interface DealExpenseItem {
  id: string;
  name: string;
  category: string;
  amount: string;
}

interface LifecycleDeal {
  id: string;
  reference: string;
  fileReference: string;
  title: string;
  location: string;
  purchaseDate: string;
  status: string; // 'DRAFT' | 'POSTED' | 'VOIDED'
  voucherId?: string;
  seller: {
    id: string;
    name: string;
    phone: string;
  };
  buyPrice: string;
  expenses: {
    taxes: string;
    legalFees: string;
    brokerage: string;
    otherCosts: string;
    items: DealExpenseItem[];
    total: string;
  };
  totalCost: string;
  unit: {
    id: string;
    number: string;
    type: string;
    phase?: string;
    block?: string;
    size?: string;
    status: 'AVAILABLE' | 'RESERVED' | 'BOOKED' | 'SOLD' | 'BLOCKED';
    listedPrice: string; // Asking price
  } | null;
  buyer: {
    id: string;
    name: string;
    phone: string;
    bookingId: string;
    bookingReference: string;
    bookingStatus: string;
  } | null;
  salePrice: string | null; // Actual sold price
  collected: string;
  netProfit: string | null;
  profitMarginPercent: string | null;
  dealStatus: 'SOLD' | 'BOOKED' | 'AVAILABLE' | 'DRAFT' | 'UNLISTED';
}

interface DealsResponse {
  currency: string;
  summary: {
    totalAcquisitions: number;
    soldCount: number;
    availableCount: number;
    totalBuyPrice: string;
    totalExpenses: string;
    totalInvestedCost: string;
    totalSalesRevenue: string;
    totalRealizedProfit: string;
    averageMarginPercent: string;
  };
  deals: LifecycleDeal[];
}

export default function PropertyLifecycleHub() {
  useLocale();
  const projectId = usePreferences((s) => s.projectId);
  const preferredCurrency = usePreferences((s) => s.currency) || 'PKR';
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // Active Tab: ALL, DRAFT (Steps 1-3), LISTED (Step 4), BOOKED (Step 5), SOLD (Step 6)
  const [activeTab, setActiveTab] = useState<
    'ALL' | 'DRAFT' | 'UNLISTED' | 'LISTED' | 'BOOKED' | 'SOLD'
  >('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Modals & Action States
  const [showAddPurchaseModal, setShowAddPurchaseModal] = useState(false);
  const [editingPurchase, setEditingPurchase] = useState<LifecycleDeal | null>(null);
  const [listingDeal, setListingDeal] = useState<LifecycleDeal | null>(null);
  const [askingPriceInput, setAskingPriceInput] = useState('');
  const [inspectDeal, setInspectDeal] = useState<LifecycleDeal | null>(null);
  const [voucherIdToPrint, setVoucherIdToPrint] = useState<string | null>(null);

  // Fetch full unified lifecycle dataset
  const { data, isLoading, isError, error, refetch, isFetching } = useQuery<DealsResponse>({
    queryKey: ['deal-profitability', projectId],
    enabled: !!projectId && can('reports.read'),
    queryFn: ({ signal }) =>
      api<DealsResponse>(`/projects/${projectId}/deal-profitability`, { signal }),
  });

  const currency = data?.currency || preferredCurrency;
  const deals = useMemo(() => data?.deals ?? [], [data?.deals]);
  const summary = data?.summary ?? {
    totalAcquisitions: 0,
    soldCount: 0,
    availableCount: 0,
    totalBuyPrice: '0.00',
    totalExpenses: '0.00',
    totalInvestedCost: '0.00',
    totalSalesRevenue: '0.00',
    totalRealizedProfit: '0.00',
    averageMarginPercent: '0.0',
  };

  // Stage counters
  const counts = useMemo(() => {
    let draftCount = 0;
    let listedCount = 0;
    let unlistedCount = 0;
    let bookedCount = 0;
    let soldCount = 0;

    for (const d of deals) {
      if (d.dealStatus === 'DRAFT') draftCount++;
      else if (d.dealStatus === 'AVAILABLE') listedCount++;
      else if (d.dealStatus === 'UNLISTED') unlistedCount++;
      else if (d.dealStatus === 'BOOKED') bookedCount++;
      else if (d.dealStatus === 'SOLD') soldCount++;
    }

    return { draftCount, unlistedCount, listedCount, bookedCount, soldCount, total: deals.length };
  }, [deals]);

  // Tab & Search filter
  const filteredDeals = useMemo(() => {
    return deals.filter((d) => {
      // Tab filter
      if (activeTab === 'UNLISTED' && d.dealStatus !== 'UNLISTED') return false;
      if (activeTab === 'DRAFT' && d.dealStatus !== 'DRAFT') return false;
      if (activeTab === 'LISTED' && d.dealStatus !== 'AVAILABLE') return false;
      if (activeTab === 'BOOKED' && d.dealStatus !== 'BOOKED') return false;
      if (activeTab === 'SOLD' && d.dealStatus !== 'SOLD') return false;

      // Search filter
      if (!searchQuery.trim()) return true;
      const q = searchQuery.trim().toLowerCase();
      return (
        d.title?.toLowerCase().includes(q) ||
        d.reference?.toLowerCase().includes(q) ||
        d.location?.toLowerCase().includes(q) ||
        d.unit?.number?.toLowerCase().includes(q) ||
        d.seller?.name?.toLowerCase().includes(q) ||
        d.buyer?.name?.toLowerCase().includes(q)
      );
    });
  }, [deals, activeTab, searchQuery]);

  // Mutation: List Property for Sale (Step 4)
  const listForSaleMutation = useMutation({
    mutationFn: async ({ id, askingPrice }: { id: string; askingPrice: string }) => {
      return api(`/projects/${projectId}/property-purchases/${id}/list-for-sale`, {
        method: 'POST',
        body: { askingPrice },
      });
    },
    onSuccess: () => {
      toast.success('Property successfully listed for sale in available inventory!');
      setListingDeal(null);
      setAskingPriceInput('');
      queryClient.invalidateQueries({ queryKey: ['deal-profitability'] });
      queryClient.invalidateQueries({ queryKey: ['inventory'] });
      queryClient.invalidateQueries({ queryKey: ['units'] });
      queryClient.invalidateQueries({ queryKey: ['relation'] });
      queryClient.invalidateQueries({ queryKey: ['resource'] });
    },
    onError: (err: unknown) => {
      const msg = err instanceof ApiError ? err.message : 'Failed to list property for sale';
      toast.error(msg);
    },
  });

  // Mutation: Post / Finalize Investment (Step 3)
  const finalizeInvestmentMutation = useMutation({
    mutationFn: async (deal: LifecycleDeal) => {
      // Fetch full purchase record for expected total & updated at
      const purchase = await api<{ id: string; total: string; updatedAt: string }>(
        `/projects/${projectId}/property-purchases/${deal.id}`,
      );
      if (purchase.total !== deal.totalCost)
        throw new Error(
          'Purchase costs changed. Refresh the lifecycle and review the current amount before finalizing.',
        );
      return api(`/projects/${projectId}/property-purchases/${deal.id}/post`, {
        method: 'POST',
        body: {
          expectedTotal: deal.totalCost,
          expectedUpdatedAt: purchase.updatedAt,
        },
      });
    },
    onSuccess: () => {
      toast.success('Property investment & all expenses finalized! Cost basis is now locked.');
      queryClient.invalidateQueries({ queryKey: ['deal-profitability', projectId] });
      queryClient.invalidateQueries({ queryKey: ['property-purchases', projectId] });
    },
    onError: (err: unknown) => {
      const msg = err instanceof ApiError ? err.message : 'Failed to finalize property investment';
      toast.error(msg);
    },
  });

  if (!can('reports.read')) return <Unauthorized />;
  if (!projectId) return <ProjectRequired />;
  return (
    <div className="lifecycle-page">
      <PageHeading
        eyebrow={t('Property portfolio')}
        title={t('Property lifecycle')}
        description={t(
          'Track each property from purchase to sale, with costs and the next action in one place.',
        )}
        actions={
          <>
            <Button variant="ghost" onClick={() => void refetch()} disabled={isFetching}>
              <RefreshCw size={15} className={isFetching ? 'spin' : ''} />
              {t('Refresh')}
            </Button>
            <Button
              disabled={!can('reports.export')}
              variant="secondary"
              onClick={() => navigate('/reports?kind=deal-profitability')}
            >
              <FileSpreadsheet size={15} />
              {t('Export report')}
            </Button>
            <Button
              disabled={!can('finance.post') || !can('finance.read')}
              onClick={() => setShowAddPurchaseModal(true)}
            >
              <Plus size={16} />
              {t('Add property & purchase')}
            </Button>
          </>
        }
      />
      <section className="lifecycle-guide" aria-label={t('Purchase to sale workflow')}>
        <div className="lifecycle-guide-heading">
          <h2>{t('From purchase to sale')}</h2>
          <p>{t('Choose a stage to see its properties and what to do next.')}</p>
        </div>
        <div className="lifecycle-pipeline-track">
          {(
            [
              {
                key: 'DRAFT',
                title: 'Purchase & costs',
                description: 'Record the seller, add expenses, then finalize the investment.',
                count: counts.draftCount,
              },
              {
                key: 'UNLISTED',
                title: 'Ready to list',
                description:
                  'Investment finalized. Set an asking price to make the property available.',
                count: counts.unlistedCount,
              },
              {
                key: 'LISTED',
                title: 'Available for sale',
                description: 'Set an asking price and create a customer booking.',
                count: counts.listedCount,
              },
              {
                key: 'BOOKED',
                title: 'Customer booking',
                description: 'Review the booking and follow up on the customer contract.',
                count: counts.bookedCount,
              },
              {
                key: 'SOLD',
                title: 'Sold & closed',
                description: 'Review the sale value, collections and final profit.',
                count: counts.soldCount,
              },
            ] as const
          ).map((stage, index) => (
            <button
              key={stage.key}
              type="button"
              className={`pipeline-step-node ${activeTab === stage.key ? 'active-stage' : ''}`}
              aria-pressed={activeTab === stage.key}
              onClick={() => setActiveTab(stage.key)}
            >
              <span className="pipeline-step-badge">
                <span className="step-num">{index + 1}</span>
                <span>{stage.count}</span>
              </span>
              <span className="pipeline-step-title">{t(stage.title)}</span>
              <span className="pipeline-step-desc">{t(stage.description)}</span>
            </button>
          ))}
        </div>
      </section>

      {/* 4 Summary KPI Cards */}
      <div className="lifecycle-kpi-grid">
        <div className="lifecycle-kpi-card">
          <div className="kpi-label">
            <span>{t('Total investment')}</span>
            <Building2 size={16} color="var(--primary)" />
          </div>
          <div className="kpi-val">
            <Money value={summary.totalInvestedCost} currency={currency} />
          </div>
          <div className="kpi-sub">
            <span>
              Purchase price:{' '}
              <strong>
                <Money value={summary.totalBuyPrice} currency={currency} />
              </strong>
            </span>
          </div>
        </div>

        <div className="lifecycle-kpi-card">
          <div className="kpi-label">
            <span>{t('Direct expenses')}</span>
            <Receipt size={16} color="var(--warning)" />
          </div>
          <div className="kpi-val" style={{ color: 'var(--warning)' }}>
            +<Money value={summary.totalExpenses} currency={currency} />
          </div>
          <div className="kpi-sub">
            <span>Included in total investment</span>
          </div>
        </div>

        <div className="lifecycle-kpi-card">
          <div className="kpi-label">
            <span>{t('Contracted sales')}</span>
            <TrendingUp size={16} color="var(--primary)" />
          </div>
          <div className="kpi-val" style={{ color: 'var(--primary)' }}>
            <Money value={summary.totalSalesRevenue} currency={currency} />
          </div>
          <div className="kpi-sub">
            <span>
              {summary.soldCount} of {summary.totalAcquisitions} properties under contract
            </span>
          </div>
        </div>

        <div className="lifecycle-kpi-card">
          <div className="kpi-label">
            <span>{t('Net profit / loss')}</span>
            <Sparkles size={16} color="var(--success)" />
          </div>
          <div
            className="kpi-val"
            style={{
              color: Number(summary.totalRealizedProfit) < 0 ? 'var(--danger)' : 'var(--success)',
            }}
          >
            <Money value={summary.totalRealizedProfit} currency={currency} />
          </div>
          <div className="kpi-sub">
            <span
              className="deal-margin-badge"
              style={
                Number(summary.averageMarginPercent) < 0
                  ? {
                      color: 'var(--badge-red-text)',
                      background: 'var(--badge-red-bg)',
                      borderColor: 'var(--badge-red-border)',
                    }
                  : undefined
              }
            >
              {summary.averageMarginPercent}% ROI
            </span>
            <span style={{ fontSize: '11px' }}>({summary.availableCount} in portfolio)</span>
          </div>
        </div>
      </div>

      {/* Main Table Panel with Stage Tabs */}
      <div className="lifecycle-panel">
        <div className="lifecycle-tabs-bar">
          <div className="lifecycle-tabs-group">
            <button
              type="button"
              className={`lifecycle-tab-btn ${activeTab === 'ALL' ? 'active' : ''}`}
              aria-pressed={activeTab === 'ALL'}
              onClick={() => setActiveTab('ALL')}
            >
              <span>All Properties</span>
              <span className="lifecycle-tab-badge">{counts.total}</span>
            </button>

            <button
              type="button"
              className={`lifecycle-tab-btn ${activeTab === 'DRAFT' ? 'active' : ''}`}
              aria-pressed={activeTab === 'DRAFT'}
              onClick={() => setActiveTab('DRAFT')}
            >
              <Clock size={13} />
              <span>{t('Purchase & costs')}</span>
              <span className="lifecycle-tab-badge">{counts.draftCount}</span>
            </button>

            <button
              type="button"
              className={`lifecycle-tab-btn ${activeTab === 'UNLISTED' ? 'active' : ''}`}
              aria-pressed={activeTab === 'UNLISTED'}
              onClick={() => setActiveTab('UNLISTED')}
            >
              <span>{t('Ready to list')}</span>
              <span className="lifecycle-tab-badge">{counts.unlistedCount}</span>
            </button>

            <button
              type="button"
              className={`lifecycle-tab-btn ${activeTab === 'LISTED' ? 'active' : ''}`}
              aria-pressed={activeTab === 'LISTED'}
              onClick={() => setActiveTab('LISTED')}
            >
              <Tag size={13} />
              <span>{t('Available for sale')}</span>
              <span className="lifecycle-tab-badge">{counts.listedCount}</span>
            </button>

            <button
              type="button"
              className={`lifecycle-tab-btn ${activeTab === 'BOOKED' ? 'active' : ''}`}
              aria-pressed={activeTab === 'BOOKED'}
              onClick={() => setActiveTab('BOOKED')}
            >
              <UserCheck size={13} />
              <span>{t('Booked')}</span>
              <span className="lifecycle-tab-badge">{counts.bookedCount}</span>
            </button>

            <button
              type="button"
              className={`lifecycle-tab-btn ${activeTab === 'SOLD' ? 'active' : ''}`}
              aria-pressed={activeTab === 'SOLD'}
              onClick={() => setActiveTab('SOLD')}
            >
              <CheckCircle2 size={13} />
              <span>{t('Sold & closed')}</span>
              <span className="lifecycle-tab-badge">{counts.soldCount}</span>
            </button>
          </div>
        </div>
        <div className="lifecycle-table-toolbar">
          <div>
            <h2>{t('Property overview')}</h2>
            <p>
              {filteredDeals.length} / {deals.length} {t('properties')} &middot; {currency}
            </p>
          </div>
          <div className="lifecycle-search">
            <Search size={14} color="var(--muted)" />
            <input
              type="search"
              aria-label={t('Search properties')}
              placeholder={t('Search property, seller or buyer...')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* Data Table */}
        {isLoading ? (
          <div style={{ padding: '24px' }}>
            <Skeleton rows={6} />
          </div>
        ) : isError ? (
          <div style={{ padding: '24px' }}>
            <ErrorState error={error} retry={() => void refetch()} />
          </div>
        ) : filteredDeals.length === 0 ? (
          <div style={{ padding: '40px 20px' }}>
            <EmptyState
              compact
              title="No properties in this lifecycle stage"
              description={
                searchQuery || activeTab !== 'ALL'
                  ? t('Try another search or choose All properties.')
                  : t('Add your first property purchase to start tracking its costs and sale.')
              }
              action={
                searchQuery || activeTab !== 'ALL' ? (
                  <Button
                    variant="secondary"
                    onClick={() => {
                      setSearchQuery('');
                      setActiveTab('ALL');
                    }}
                  >
                    {t('Clear filters')}
                  </Button>
                ) : (
                  <Button
                    disabled={!can('finance.post') || !can('finance.read')}
                    onClick={() => setShowAddPurchaseModal(true)}
                  >
                    {t('Add property & purchase')}
                  </Button>
                )
              }
            />
          </div>
        ) : (
          <>
            <div
              className="lifecycle-table-wrap"
              role="region"
              aria-label={t('Property overview')}
              tabIndex={0}
            >
              <table className="lifecycle-table">
                <caption className="sr-only">
                  {t('Property costs, sale values and next actions')}
                </caption>
                <colgroup>
                  <col className="lc-property-col" />
                  <col className="lc-stage-col" />
                  <col className="lc-people-col" />
                  <col className="lc-cost-col" />
                  <col className="lc-sale-col" />
                  <col className="lc-profit-col" />
                  <col className="lc-actions-col" />
                </colgroup>
                <thead>
                  <tr>
                    <th scope="col">{t('Property / unit')}</th>
                    <th scope="col">{t('Stage')}</th>
                    <th scope="col">{t('Seller & buyer')}</th>
                    <th scope="col" className="lc-number">
                      {t('Investment cost')}
                    </th>
                    <th scope="col" className="lc-number">
                      {t('Sale value')}
                    </th>
                    <th scope="col" className="lc-number">
                      {t('Profit / loss')}
                    </th>
                    <th scope="col">{t('Next action')}</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredDeals.map((deal) => {
                    const isDraft = deal.dealStatus === 'DRAFT';
                    const isAvailable = deal.dealStatus === 'AVAILABLE';
                    const isUnlisted = deal.dealStatus === 'UNLISTED';
                    const isSold = deal.dealStatus === 'SOLD';
                    const hasProfit = deal.netProfit != null && Number(deal.netProfit) >= 0;
                    const stageClass = isDraft
                      ? 'step-draft'
                      : isAvailable
                        ? 'step-listed'
                        : isSold
                          ? 'step-sold'
                          : 'step-booked';
                    const stageLabel = isUnlisted
                      ? 'Ready to list'
                      : isDraft
                        ? 'Purchase & costs'
                        : isAvailable
                          ? 'Available for sale'
                          : isSold
                            ? 'Sold & closed'
                            : 'Booked';
                    const price = deal.salePrice ?? deal.unit?.listedPrice;
                    return (
                      <tr key={deal.id}>
                        <th scope="row" className="lc-property-cell">
                          <button
                            type="button"
                            className="lc-property-link"
                            onClick={() => setInspectDeal(deal)}
                          >
                            {deal.title}
                          </button>
                          {deal.unit && (
                            <span className="lc-unit">
                              <Building2 size={12} />
                              {deal.unit.number}
                            </span>
                          )}
                          <span className="lc-secondary">{deal.location || '—'}</span>
                          <code className="lc-secondary">{deal.reference}</code>
                        </th>
                        <td>
                          <div className="lc-cell-stack">
                            <span className={`deal-stage-pill ${stageClass}`}>{t(stageLabel)}</span>
                            <span className="lc-secondary">
                              {isDraft ? t('Costs not finalized') : t('Investment finalized')}
                            </span>
                          </div>
                        </td>
                        <td>
                          <div className="lc-cell-stack lc-parties">
                            <div>
                              <span className="lc-label">{t('Seller')}</span>
                              <strong>{deal.seller?.name || '—'}</strong>
                            </div>
                            <div>
                              <span className="lc-label">{t('Buyer')}</span>
                              <span className={deal.buyer ? '' : 'muted'}>
                                {deal.buyer?.name || t('No buyer yet')}
                              </span>
                            </div>
                          </div>
                        </td>
                        <td className="lc-number">
                          <div className="lc-cell-stack">
                            <strong className="lc-amount">
                              <Money value={deal.totalCost} currency={currency} />
                            </strong>
                            <span className="lc-secondary">
                              {t('Purchase')}: <Money value={deal.buyPrice} currency={currency} />
                            </span>
                            <button
                              type="button"
                              className="lc-expense-link"
                              onClick={() => setInspectDeal(deal)}
                            >
                              {t('Expenses')}:{' '}
                              <Money value={deal.expenses.total} currency={currency} />
                            </button>
                          </div>
                        </td>
                        <td className="lc-number">
                          <div className="lc-cell-stack">
                            <strong className="lc-amount">
                              {price != null ? <Money value={price} currency={currency} /> : '—'}
                            </strong>
                            <span className="lc-secondary">
                              {deal.salePrice != null
                                ? t('Contract value')
                                : price != null
                                  ? t('Asking price')
                                  : t('Not priced yet')}
                            </span>
                            {deal.buyer && (
                              <span className="lc-secondary">
                                {t('Collected')}:{' '}
                                <Money value={deal.collected} currency={currency} />
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="lc-number">
                          <div className="lc-cell-stack">
                            {deal.netProfit != null ? (
                              <>
                                <strong
                                  className={`lc-amount ${hasProfit ? 'profit-text-green' : 'profit-text-red'}`}
                                >
                                  <Money value={deal.netProfit} currency={currency} />
                                </strong>
                                {deal.profitMarginPercent != null && (
                                  <span className="lc-secondary">
                                    {deal.profitMarginPercent.replace(/%$/, '')}% ROI
                                  </span>
                                )}
                              </>
                            ) : (
                              <span className="lc-secondary">{t('Pending sale')}</span>
                            )}
                          </div>
                        </td>
                        <td>
                          <div className="lc-row-actions">
                            {isDraft && can('finance.post') && (
                              <>
                                <Button
                                  size="small"
                                  busy={
                                    finalizeInvestmentMutation.isPending &&
                                    finalizeInvestmentMutation.variables?.id === deal.id
                                  }
                                  disabled={finalizeInvestmentMutation.isPending}
                                  onClick={() => finalizeInvestmentMutation.mutate(deal)}
                                >
                                  <Lock size={13} />
                                  {t('Finalize investment')}
                                </Button>
                                <Button
                                  size="small"
                                  variant="secondary"
                                  onClick={() => setEditingPurchase(deal)}
                                >
                                  <Receipt size={13} />
                                  {t('Edit purchase & costs')}
                                </Button>
                              </>
                            )}
                            {(isAvailable || isUnlisted) && (
                              <>
                                {deal.unit?.id &&
                                  deal.unit.status === 'AVAILABLE' &&
                                  can('bookings.create') && (
                                    <Button
                                      size="small"
                                      onClick={() =>
                                        navigate(`/bookings/new?unitId=${deal.unit!.id}`)
                                      }
                                    >
                                      <UserCheck size={13} />
                                      {t('Book property')}
                                    </Button>
                                  )}
                                <Button
                                  size="small"
                                  variant={deal.unit?.id ? 'secondary' : 'primary'}
                                  disabled={!can('inventory.create')}
                                  onClick={() => {
                                    setListingDeal(deal);
                                    setAskingPriceInput(deal.unit?.listedPrice || '');
                                  }}
                                >
                                  <Tag size={13} />
                                  {t('Set asking price')}
                                </Button>
                              </>
                            )}
                            {deal.buyer?.bookingId && (
                              <Button
                                size="small"
                                variant="secondary"
                                onClick={() =>
                                  navigate(`/bookings?record=${deal.buyer!.bookingId}`)
                                }
                              >
                                <ArrowUpRight size={13} />
                                {t('View booking')}
                              </Button>
                            )}
                            <Button
                              size="small"
                              variant="ghost"
                              onClick={() => setInspectDeal(deal)}
                            >
                              <Eye size={13} />
                              {t('View breakdown')}
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <div className="lifecycle-table-note">
              <span>{t('Investment cost = purchase price + direct expenses.')}</span>
              <span>{t('Scroll horizontally to see all columns.')}</span>
            </div>
          </>
        )}
      </div>

      {/* Step 4: Move Property to Selling (Asking Price Dialog) */}
      {listingDeal && (
        <Modal
          className="lifecycle-dialog"
          open
          onOpenChange={(v) => !v && setListingDeal(null)}
          title={`${t('Set asking price')} — ${listingDeal.title}`}
          description={`Unit ${listingDeal.unit?.number || ''} — Set the expected selling price (asking price) to make this property active in selling inventory.`}
        >
          <div className="modal-body dialog-flow-body">
            <div className="calc-box-highlight">
              <div>
                <div
                  style={{ fontSize: '11px', color: 'var(--muted)', textTransform: 'uppercase' }}
                >
                  Total Finalized Cost Basis
                </div>
                <div style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text)' }}>
                  <Money value={listingDeal.totalCost} currency={currency} />
                </div>
                <small style={{ color: 'var(--muted)' }}>
                  Buy Price: <Money value={listingDeal.buyPrice} currency={currency} /> + Expenses:{' '}
                  <Money value={listingDeal.expenses.total} currency={currency} />
                </small>
              </div>
              <Badge value="Investment Finalized" />
            </div>

            <div className="form-field">
              <label htmlFor="lifecycle-asking-price">
                Expected Selling Price / Asking Price ({currency}) *
              </label>
              <MoneyInput
                id="lifecycle-asking-price"
                step="0.01"
                placeholder="e.g. 15000000"
                value={askingPriceInput}
                onValueChange={setAskingPriceInput}
              />
              <small style={{ color: 'var(--muted)', marginTop: '4px' }}>
                This is only your listed asking price. The actual sold price will be confirmed upon
                closing the deal.
              </small>
            </div>

            {Number(askingPriceInput) > 0 && (
              <div
                className={`calc-box-highlight ${Number(askingPriceInput) >= Number(listingDeal.totalCost) ? 'profit-good' : ''}`}
              >
                <div>
                  <div
                    style={{ fontSize: '11px', color: 'var(--muted)', textTransform: 'uppercase' }}
                  >
                    Projected Profit Margin
                  </div>
                  <div
                    style={{
                      fontSize: '15px',
                      fontWeight: 750,
                      color:
                        Number(askingPriceInput) >= Number(listingDeal.totalCost)
                          ? 'var(--success)'
                          : 'var(--danger)',
                    }}
                  >
                    {Number(askingPriceInput) >= Number(listingDeal.totalCost) ? '+' : ''}
                    <Money
                      value={String(Number(askingPriceInput) - Number(listingDeal.totalCost))}
                      currency={currency}
                    />{' '}
                    (
                    {(
                      ((Number(askingPriceInput) - Number(listingDeal.totalCost)) /
                        (Number(listingDeal.totalCost) || 1)) *
                      100
                    ).toFixed(1)}
                    % ROI)
                  </div>
                </div>
              </div>
            )}

            <div className="dialog-actions">
              <Button variant="secondary" onClick={() => setListingDeal(null)}>
                Cancel
              </Button>
              <Button
                variant="primary"
                disabled={
                  !askingPriceInput ||
                  Number(askingPriceInput) <= 0 ||
                  listForSaleMutation.isPending
                }
                onClick={() =>
                  listForSaleMutation.mutate({
                    id: listingDeal.id,
                    askingPrice: askingPriceInput,
                  })
                }
              >
                <Tag size={14} />
                <span>List Property for Sale</span>
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Step 1 & 2: Add Property & Purchase Wizard */}
      {showAddPurchaseModal && (
        <PropertyPurchaseWizard
          onClose={() => setShowAddPurchaseModal(false)}
          onSuccess={() => {
            setShowAddPurchaseModal(false);
            refetch();
          }}
        />
      )}

      {/* Step 3: Edit Expenses & Purchase Draft */}
      {editingPurchase && (
        <PropertyPurchaseWizard
          record={{ id: editingPurchase.id }}
          onClose={() => setEditingPurchase(null)}
          onSuccess={() => {
            setEditingPurchase(null);
            refetch();
          }}
        />
      )}

      {/* Step 6 / Inspector Modal: P&L Waterfall & Full Property History */}
      {inspectDeal && (
        <Modal
          className="lifecycle-dialog"
          open
          onOpenChange={(v) => !v && setInspectDeal(null)}
          title={`Property Financial Lifecycle: ${inspectDeal.title}`}
          description={`Ref ${inspectDeal.reference} — Full audit from seller acquisition to resale profit`}
          wide
        >
          <div className="modal-body deal-modal-body">
            {/* Visual Lifecycle Strip */}
            <div className="deal-lifecycle-strip">
              <div className="deal-stage-card">
                <span className="deal-stage-badge buy">1. Seller Acquisition</span>
                <strong>
                  <Money value={inspectDeal.buyPrice} currency={currency} />
                </strong>
                <span>Seller: {inspectDeal.seller?.name || 'Vendor'}</span>
                <span>Date: {date(inspectDeal.purchaseDate)}</span>
              </div>

              <ArrowRight size={18} color="var(--muted)" />

              <div className="deal-stage-card">
                <span className="deal-stage-badge renovate">2. Incurred Expenses</span>
                <strong style={{ color: 'var(--warning)' }}>
                  +<Money value={inspectDeal.expenses.total} currency={currency} />
                </strong>
                <span>
                  Total Invested: <Money value={inspectDeal.totalCost} currency={currency} />
                </span>
                <span>Taxes, legal, renovation & commission</span>
              </div>

              <ArrowRight size={18} color="var(--muted)" />

              <div className="deal-stage-card">
                <span className="deal-stage-badge sell">3. Resale to Buyer</span>
                <strong
                  style={{ color: inspectDeal.salePrice ? 'var(--success)' : 'var(--muted)' }}
                >
                  {inspectDeal.salePrice ? (
                    <Money value={inspectDeal.salePrice} currency={currency} />
                  ) : (
                    'In Portfolio'
                  )}
                </strong>
                <span>
                  {inspectDeal.buyer ? `Buyer: ${inspectDeal.buyer.name}` : 'Ready for sale'}
                </span>
              </div>
            </div>

            {/* Expenses Breakdown */}
            <div className="deal-waterfall-box">
              <div
                style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}
              >
                <h4 style={{ margin: 0, fontSize: '13px', fontWeight: 700 }}>
                  Itemized Direct Expenses & Renovation
                </h4>
                <span>
                  Total:{' '}
                  <strong>
                    <Money value={inspectDeal.expenses.total} currency={currency} />
                  </strong>
                </span>
              </div>

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 150px), 1fr))',
                  gap: '10px',
                  marginBottom: '14px',
                }}
              >
                <div
                  style={{
                    padding: '8px 12px',
                    background: 'var(--subtle)',
                    borderRadius: '8px',
                    border: '1px solid var(--border)',
                  }}
                >
                  <div
                    style={{ fontSize: '10px', color: 'var(--muted)', textTransform: 'uppercase' }}
                  >
                    Taxes
                  </div>
                  <div style={{ fontWeight: 650 }}>
                    <Money value={inspectDeal.expenses.taxes} currency={currency} />
                  </div>
                </div>

                <div
                  style={{
                    padding: '8px 12px',
                    background: 'var(--subtle)',
                    borderRadius: '8px',
                    border: '1px solid var(--border)',
                  }}
                >
                  <div
                    style={{ fontSize: '10px', color: 'var(--muted)', textTransform: 'uppercase' }}
                  >
                    Legal Fees
                  </div>
                  <div style={{ fontWeight: 650 }}>
                    <Money value={inspectDeal.expenses.legalFees} currency={currency} />
                  </div>
                </div>

                <div
                  style={{
                    padding: '8px 12px',
                    background: 'var(--subtle)',
                    borderRadius: '8px',
                    border: '1px solid var(--border)',
                  }}
                >
                  <div
                    style={{ fontSize: '10px', color: 'var(--muted)', textTransform: 'uppercase' }}
                  >
                    Brokerage
                  </div>
                  <div style={{ fontWeight: 650 }}>
                    <Money value={inspectDeal.expenses.brokerage} currency={currency} />
                  </div>
                </div>

                <div
                  style={{
                    padding: '8px 12px',
                    background: 'var(--subtle)',
                    borderRadius: '8px',
                    border: '1px solid var(--border)',
                  }}
                >
                  <div
                    style={{ fontSize: '10px', color: 'var(--muted)', textTransform: 'uppercase' }}
                  >
                    Renovation / Civil
                  </div>
                  <div style={{ fontWeight: 650 }}>
                    <Money value={inspectDeal.expenses.otherCosts} currency={currency} />
                  </div>
                </div>
              </div>

              {inspectDeal.expenses.items && inspectDeal.expenses.items.length > 0 && (
                <table className="expense-items-table">
                  <thead>
                    <tr>
                      <th>Expense Item</th>
                      <th>Category</th>
                      <th style={{ textAlign: 'right' }}>Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {inspectDeal.expenses.items.map((item, idx) => (
                      <tr key={item.id || idx}>
                        <td style={{ fontWeight: 600 }}>{item.name}</td>
                        <td>{item.category}</td>
                        <td style={{ textAlign: 'right', fontWeight: 650 }}>
                          <Money value={item.amount} currency={currency} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            {/* P&L Statement */}
            <div className="deal-pnl-summary-box">
              <h4 style={{ margin: '0 0 10px', fontSize: '13px', fontWeight: 700 }}>
                Comprehensive Profit & Loss Waterfall
              </h4>

              <div className="deal-pnl-row">
                <span>1. Property Acquisition Buy Price</span>
                <strong>
                  <Money value={inspectDeal.buyPrice} currency={currency} />
                </strong>
              </div>

              <div className="deal-pnl-row">
                <span>2. Total Direct Expenses (Taxes, Legal, Renovation)</span>
                <strong style={{ color: 'var(--warning)' }}>
                  +<Money value={inspectDeal.expenses.total} currency={currency} />
                </strong>
              </div>

              <div className="deal-pnl-row total-invested">
                <span>Total Invested Capital (Locked Cost Basis)</span>
                <strong>
                  <Money value={inspectDeal.totalCost} currency={currency} />
                </strong>
              </div>

              <div className="deal-pnl-row">
                <span>3. Expected Asking Price (Listed)</span>
                <strong style={{ color: 'var(--primary)' }}>
                  {inspectDeal.unit?.listedPrice ? (
                    <Money value={inspectDeal.unit.listedPrice} currency={currency} />
                  ) : (
                    '—'
                  )}
                </strong>
              </div>

              <div className="deal-pnl-row">
                <span>4. Actual Sold Price (Buyer Contract)</span>
                <strong style={{ color: 'var(--primary)' }}>
                  {inspectDeal.salePrice ? (
                    <Money value={inspectDeal.salePrice} currency={currency} />
                  ) : (
                    'Pending Resale'
                  )}
                </strong>
              </div>

              <div className="deal-pnl-row net-profit">
                <span>Realized Net Profit / (Loss)</span>
                <strong
                  className={
                    Number(inspectDeal.netProfit ?? 0) >= 0
                      ? 'profit-text-green'
                      : 'profit-text-red'
                  }
                >
                  {inspectDeal.netProfit
                    ? `${Number(inspectDeal.netProfit) >= 0 ? '+' : ''}${moneyWithWords(inspectDeal.netProfit, currency)}`
                    : inspectDeal.salePrice
                      ? 'Pending collection'
                      : 'Pending Resale'}
                </strong>
              </div>

              <div className="deal-pnl-row" style={{ borderBottom: 'none' }}>
                <span>Return on Investment (ROI Margin %)</span>
                <strong className="deal-margin-badge">
                  {inspectDeal.profitMarginPercent
                    ? `${inspectDeal.profitMarginPercent.replace(/%$/, '')}%`
                    : inspectDeal.salePrice
                      ? 'Pending collection'
                      : 'Pending Resale'}
                </strong>
              </div>
            </div>

            {/* Action Bar */}
            <div className="dialog-actions">
              {inspectDeal.buyer?.bookingId && (
                <Button
                  variant="secondary"
                  size="small"
                  onClick={() => {
                    navigate(`/bookings?record=${inspectDeal.buyer!.bookingId}`);
                    setInspectDeal(null);
                  }}
                >
                  <ArrowUpRight size={13} />
                  <span>View Buyer Booking</span>
                </Button>
              )}

              <Button
                variant="primary"
                size="small"
                onClick={() => {
                  navigate(`/property-purchases?record=${inspectDeal.id}`);
                  setInspectDeal(null);
                }}
              >
                <Eye size={13} />
                <span>View Full Purchase Record</span>
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Accounting Voucher Preview Modal */}
      {voucherIdToPrint && (
        <JournalVoucher id={voucherIdToPrint} onClose={() => setVoucherIdToPrint(null)} />
      )}
    </div>
  );
}

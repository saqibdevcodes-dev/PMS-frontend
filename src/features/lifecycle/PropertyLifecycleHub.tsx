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
  Coins,
  Sparkles,
  ArrowUpRight,
  Tag,
  UserCheck,
  Lock,
} from 'lucide-react';
import { toast } from 'sonner';
import { api, ApiError } from '../../lib/api';
import { usePreferences } from '../../stores/preferences';
import { t } from '../../lib/i18n';
import { money, date } from '../../lib/format';
import { Button, Modal, Skeleton, EmptyState, ErrorState, Badge } from '../../components/ui';
import { PropertyPurchaseWizard } from '../resources/PropertyPurchaseWizard';
import { JournalVoucher } from '../resources/JournalVoucher';
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
  dealStatus: 'SOLD' | 'BOOKED' | 'AVAILABLE' | 'DRAFT';
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
  const projectId = usePreferences((s) => s.projectId);
  const preferredCurrency = usePreferences((s) => s.currency) || 'PKR';
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // Active Tab: ALL, DRAFT (Steps 1-3), LISTED (Step 4), BOOKED (Step 5), SOLD (Step 6)
  const [activeTab, setActiveTab] = useState<'ALL' | 'DRAFT' | 'LISTED' | 'BOOKED' | 'SOLD'>('ALL');
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
    enabled: !!projectId,
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
    let bookedCount = 0;
    let soldCount = 0;

    for (const d of deals) {
      if (d.dealStatus === 'DRAFT') draftCount++;
      else if (d.dealStatus === 'AVAILABLE') listedCount++;
      else if (d.dealStatus === 'BOOKED') bookedCount++;
      else if (d.dealStatus === 'SOLD') soldCount++;
    }

    return { draftCount, listedCount, bookedCount, soldCount, total: deals.length };
  }, [deals]);

  // Tab & Search filter
  const filteredDeals = useMemo(() => {
    return deals.filter((d) => {
      // Tab filter
      if (activeTab === 'DRAFT' && d.dealStatus !== 'DRAFT') return false;
      if (activeTab === 'LISTED' && d.dealStatus !== 'AVAILABLE') return false;
      if (activeTab === 'BOOKED' && d.dealStatus !== 'BOOKED') return false;
      if (activeTab === 'SOLD' && d.dealStatus !== 'SOLD') return false;

      // Search filter
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
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
      return api(`/projects/${projectId}/property-purchases/${deal.id}/post`, {
        method: 'POST',
        body: {
          expectedTotal: purchase.total,
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

  return (
    <div className="lifecycle-page">
      {/* Header & Primary Actions */}
      <div className="lifecycle-header">
        <div className="lifecycle-header-title-box">
          <div className="lifecycle-header-icon">
            <Coins size={26} />
          </div>
          <div>
            <h1>{t('Property Lifecycle & Financial Workflow Hub')}</h1>
            <p>
              {t(
                'Unified acquisition-to-resale management: Registration → Seller Purchase → Expense Management → Listed for Sale → Customer Booking → Sold P&L.',
              )}
            </p>
          </div>
        </div>

        <div className="lifecycle-header-actions">
          <Button
            variant="ghost"
            size="small"
            onClick={() => refetch()}
            disabled={isFetching}
            title="Refresh deal metrics"
          >
            <RefreshCw size={14} className={isFetching ? 'animate-spin' : ''} />
            <span>Refresh</span>
          </Button>

          <Button
            variant="secondary"
            size="small"
            onClick={() => navigate('/reports?kind=deal-profitability')}
          >
            <FileSpreadsheet size={14} />
            <span>Export Full P&L</span>
          </Button>

          <Button
            variant="primary"
            size="normal"
            onClick={() => setShowAddPurchaseModal(true)}
          >
            <Plus size={16} />
            <span>+ Add Property & Purchase</span>
          </Button>
        </div>
      </div>

      {/* Complete Visual 6-Step Pipeline Track */}
      <div className="lifecycle-pipeline-track">
        {/* Step 1 */}
        <div className={`pipeline-step-node ${activeTab === 'DRAFT' ? 'active-stage' : ''}`}>
          <div className="pipeline-step-badge">
            <span>Stage 1</span>
            <span className="step-num">1</span>
          </div>
          <div className="pipeline-step-title">Add Property</div>
          <div className="pipeline-step-desc">Register unit number, size, type & location details.</div>
        </div>

        {/* Step 2 */}
        <div className={`pipeline-step-node ${activeTab === 'DRAFT' ? 'active-stage' : ''}`}>
          <div className="pipeline-step-badge">
            <span>Stage 2</span>
            <span className="step-num">2</span>
          </div>
          <div className="pipeline-step-title">Purchase Details</div>
          <div className="pipeline-step-desc">Acquire via seller/individual or dealer with commission.</div>
        </div>

        {/* Step 3 */}
        <div className={`pipeline-step-node ${activeTab === 'DRAFT' ? 'active-stage' : ''}`}>
          <div className="pipeline-step-badge">
            <span>Stage 3</span>
            <span className="step-num">3</span>
          </div>
          <div className="pipeline-step-title">Expenses & Finalize</div>
          <div className="pipeline-step-desc">Itemize renovation/civil/taxes & lock total investment.</div>
        </div>

        {/* Step 4 */}
        <div className={`pipeline-step-node ${activeTab === 'LISTED' ? 'active-stage' : ''}`}>
          <div className="pipeline-step-badge">
            <span>Stage 4</span>
            <span className="step-num">4</span>
          </div>
          <div className="pipeline-step-title">Move to Selling</div>
          <div className="pipeline-step-desc">Set asking price & list in available inventory.</div>
        </div>

        {/* Step 5 */}
        <div className={`pipeline-step-node ${activeTab === 'BOOKED' ? 'active-stage' : ''}`}>
          <div className="pipeline-step-badge">
            <span>Stage 5</span>
            <span className="step-num">5</span>
          </div>
          <div className="pipeline-step-title">Customer Booking</div>
          <div className="pipeline-step-desc">Book customer & collect down payment / installments.</div>
        </div>

        {/* Step 6 */}
        <div className={`pipeline-step-node ${activeTab === 'SOLD' ? 'active-stage' : ''}`}>
          <div className="pipeline-step-badge">
            <span>Stage 6</span>
            <span className="step-num">6</span>
          </div>
          <div className="pipeline-step-title">Final Sale & P&L</div>
          <div className="pipeline-step-desc">Record actual sold price & realize final net profit & ROI.</div>
        </div>
      </div>

      {/* 4 Summary KPI Cards */}
      <div className="lifecycle-kpi-grid">
        <div className="lifecycle-kpi-card">
          <div className="kpi-label">
            <span>Total Capital Invested</span>
            <Building2 size={16} color="var(--primary)" />
          </div>
          <div className="kpi-val">{money(summary.totalInvestedCost, currency)}</div>
          <div className="kpi-sub">
            <span>Base Buy Price: <strong>{money(summary.totalBuyPrice, currency)}</strong></span>
          </div>
        </div>

        <div className="lifecycle-kpi-card">
          <div className="kpi-label">
            <span>Renovation & Direct Expenses</span>
            <Receipt size={16} color="#d97706" />
          </div>
          <div className="kpi-val" style={{ color: '#d97706' }}>
            +{money(summary.totalExpenses, currency)}
          </div>
          <div className="kpi-sub">
            <span>Taxes, legal, brokerage & contractor works</span>
          </div>
        </div>

        <div className="lifecycle-kpi-card">
          <div className="kpi-label">
            <span>Realized Resale Revenue</span>
            <TrendingUp size={16} color="#2563eb" />
          </div>
          <div className="kpi-val" style={{ color: '#2563eb' }}>
            {money(summary.totalSalesRevenue, currency)}
          </div>
          <div className="kpi-sub">
            <span>{summary.soldCount} of {summary.totalAcquisitions} properties contracted</span>
          </div>
        </div>

        <div className="lifecycle-kpi-card">
          <div className="kpi-label">
            <span>Total Realized Profit & ROI</span>
            <Sparkles size={16} color="#059669" />
          </div>
          <div className="kpi-val" style={{ color: '#059669' }}>
            +{money(summary.totalRealizedProfit, currency)}
          </div>
          <div className="kpi-sub">
            <span className="deal-margin-badge">
              +{summary.averageMarginPercent}% Avg Margin
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
              onClick={() => setActiveTab('ALL')}
            >
              <span>All Properties</span>
              <span className="lifecycle-tab-badge">{counts.total}</span>
            </button>

            <button
              type="button"
              className={`lifecycle-tab-btn ${activeTab === 'DRAFT' ? 'active' : ''}`}
              onClick={() => setActiveTab('DRAFT')}
            >
              <Clock size={13} />
              <span>1-3. Purchase & Expenses In-Progress</span>
              <span className="lifecycle-tab-badge">{counts.draftCount}</span>
            </button>

            <button
              type="button"
              className={`lifecycle-tab-btn ${activeTab === 'LISTED' ? 'active' : ''}`}
              onClick={() => setActiveTab('LISTED')}
            >
              <Tag size={13} />
              <span>4. Listed for Sale (Available)</span>
              <span className="lifecycle-tab-badge">{counts.listedCount}</span>
            </button>

            <button
              type="button"
              className={`lifecycle-tab-btn ${activeTab === 'BOOKED' ? 'active' : ''}`}
              onClick={() => setActiveTab('BOOKED')}
            >
              <UserCheck size={13} />
              <span>5. Booked Properties</span>
              <span className="lifecycle-tab-badge">{counts.bookedCount}</span>
            </button>

            <button
              type="button"
              className={`lifecycle-tab-btn ${activeTab === 'SOLD' ? 'active' : ''}`}
              onClick={() => setActiveTab('SOLD')}
            >
              <CheckCircle2 size={13} />
              <span>6. Sold & Closed Deals</span>
              <span className="lifecycle-tab-badge">{counts.soldCount}</span>
            </button>
          </div>

          <div className="lifecycle-search">
            <Search size={14} color="var(--muted)" />
            <input
              type="text"
              placeholder="Search title, unit #, seller, buyer..."
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
            <ErrorState error={error} />
          </div>
        ) : filteredDeals.length === 0 ? (
          <div style={{ padding: '40px 20px' }}>
            <EmptyState
              compact
              title="No properties in this lifecycle stage"
              description="Click '+ Add Property & Purchase' to register your first property acquisition and start the complete purchase-to-sale lifecycle."
            />
          </div>
        ) : (
          <div className="lifecycle-table-wrap">
            <table className="lifecycle-table">
              <thead>
                <tr>
                  <th>Property / Unit</th>
                  <th>Current Lifecycle Stage</th>
                  <th>Seller (Buy Origin)</th>
                  <th>Buy Price</th>
                  <th>Direct Expenses</th>
                  <th>Total Cost Basis</th>
                  <th>Asking / Sold Price</th>
                  <th>Buyer (Customer)</th>
                  <th>Net Profit & Margin</th>
                  <th style={{ textAlign: 'right' }}>Workflow Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredDeals.map((deal) => {
                  const totalExpNum = Number(deal.expenses?.total ?? 0);
                  const isSold = deal.dealStatus === 'SOLD';
                  const isBooked = deal.dealStatus === 'BOOKED';
                  const isAvailable = deal.dealStatus === 'AVAILABLE';
                  const isDraft = deal.dealStatus === 'DRAFT';
                  const hasProfit = deal.netProfit && Number(deal.netProfit) >= 0;

                  return (
                    <tr key={deal.id}>
                      {/* Property / Unit */}
                      <td>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                          <span style={{ fontWeight: 650, color: 'var(--text)' }}>
                            {deal.title}
                          </span>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            {deal.unit ? (
                              <span className="deal-unit-tag">
                                <Building2 size={11} /> Unit {deal.unit.number}
                              </span>
                            ) : null}
                            {deal.location ? (
                              <span style={{ fontSize: '11px', color: 'var(--muted)' }}>
                                {deal.location}
                              </span>
                            ) : null}
                          </div>
                        </div>
                      </td>

                      {/* Current Stage Badge */}
                      <td>
                        {isDraft ? (
                          <span className="deal-stage-pill step-draft">
                            <Clock size={11} /> Draft Expenses In-Progress
                          </span>
                        ) : isAvailable ? (
                          <span className="deal-stage-pill step-listed">
                            <Tag size={11} /> Listed for Sale
                          </span>
                        ) : isBooked ? (
                          <span className="deal-stage-pill step-booked">
                            <UserCheck size={11} /> Booked
                          </span>
                        ) : (
                          <span className="deal-stage-pill step-sold">
                            <CheckCircle2 size={11} /> Sold & Closed
                          </span>
                        )}
                      </td>

                      {/* Seller */}
                      <td>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                          <span style={{ fontWeight: 600, color: 'var(--text)' }}>
                            {deal.seller?.name || 'Direct Seller'}
                          </span>
                          {deal.seller?.phone ? (
                            <span style={{ fontSize: '11px', color: 'var(--muted)' }}>
                              {deal.seller.phone}
                            </span>
                          ) : null}
                        </div>
                      </td>

                      {/* Buy Price */}
                      <td>
                        <div style={{ fontWeight: 650, color: 'var(--text)' }}>
                          {money(deal.buyPrice, currency)}
                        </div>
                        <span style={{ fontSize: '10.5px', color: 'var(--muted)' }}>
                          {date(deal.purchaseDate)}
                        </span>
                      </td>

                      {/* Expenses */}
                      <td>
                        {totalExpNum > 0 ? (
                          <button
                            type="button"
                            className="deal-expenses-pill"
                            onClick={() => setInspectDeal(deal)}
                            title="View itemized expenses breakdown"
                          >
                            <Receipt size={12} />
                            +{money(deal.expenses.total, currency)}
                          </button>
                        ) : (
                          <span style={{ fontSize: '11px', color: 'var(--muted)' }}>Rs. 0</span>
                        )}
                      </td>

                      {/* Total Invested Cost */}
                      <td>
                        <div style={{ fontWeight: 700, color: 'var(--text)' }}>
                          {money(deal.totalCost, currency)}
                        </div>
                        <span style={{ fontSize: '10px', color: 'var(--muted)' }}>
                          Buy + Expenses
                        </span>
                      </td>

                      {/* Asking vs Actual Sold Price */}
                      <td>
                        {isSold ? (
                          <div>
                            <div style={{ fontWeight: 700, color: '#059669' }}>
                              {money(deal.salePrice, currency)}
                            </div>
                            <span style={{ fontSize: '10px', color: 'var(--muted)' }}>
                              Actual Sold Price
                            </span>
                          </div>
                        ) : isBooked ? (
                          <div>
                            <div style={{ fontWeight: 700, color: '#1d4ed8' }}>
                              {money(deal.salePrice, currency)}
                            </div>
                            <span style={{ fontSize: '10px', color: 'var(--muted)' }}>
                              Booked Contract Value
                            </span>
                          </div>
                        ) : deal.unit?.listedPrice && Number(deal.unit.listedPrice) > 0 ? (
                          <div>
                            <div style={{ fontWeight: 700, color: '#2563eb' }}>
                              {money(deal.unit.listedPrice, currency)}
                            </div>
                            <span style={{ fontSize: '10px', color: 'var(--muted)' }}>
                              Expected Asking Price
                            </span>
                          </div>
                        ) : (
                          <span style={{ fontSize: '11px', color: 'var(--muted)', fontStyle: 'italic' }}>
                            Not listed yet
                          </span>
                        )}
                      </td>

                      {/* Buyer */}
                      <td>
                        {deal.buyer ? (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                            <span style={{ fontWeight: 600, color: '#1e40af' }}>
                              {deal.buyer.name}
                            </span>
                            <span style={{ fontSize: '10.5px', color: 'var(--muted)' }}>
                              Ref: {deal.buyer.bookingReference}
                            </span>
                          </div>
                        ) : (
                          <span className="deal-unsold-tag">
                            <Clock size={11} /> Unsold
                          </span>
                        )}
                      </td>

                      {/* Net Profit & Margin */}
                      <td>
                        {deal.netProfit ? (
                          <div>
                            <div className={hasProfit ? 'profit-text-green' : 'profit-text-red'}>
                              {hasProfit ? '+' : ''}{money(deal.netProfit, currency)}
                            </div>
                            {deal.profitMarginPercent ? (
                              <span
                                className="deal-margin-badge"
                                style={{
                                  background: hasProfit ? '#ecfdf5' : '#fef2f2',
                                  color: hasProfit ? '#047857' : '#b91c1c',
                                  borderColor: hasProfit ? '#a7f3d0' : '#fecaca',
                                }}
                              >
                                {hasProfit ? '+' : ''}{deal.profitMarginPercent} ROI
                              </span>
                            ) : null}
                          </div>
                        ) : (
                          <span style={{ fontSize: '11px', color: 'var(--muted)', fontStyle: 'italic' }}>
                            Pending sale
                          </span>
                        )}
                      </td>

                      {/* Workflow Actions */}
                      <td style={{ textAlign: 'right' }}>
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                          {/* Step 3 Action: Edit Expenses & Finalize Investment */}
                          {isDraft && (
                            <>
                              <Button
                                variant="secondary"
                                size="small"
                                onClick={() => setEditingPurchase(deal)}
                                title="Edit expenses & purchase draft"
                              >
                                <Receipt size={13} />
                                <span>Edit Expenses</span>
                              </Button>

                              <Button
                                variant="primary"
                                size="small"
                                onClick={() => finalizeInvestmentMutation.mutate(deal)}
                                disabled={finalizeInvestmentMutation.isPending}
                                title="Finalize Investment & lock cost basis"
                              >
                                <Lock size={13} />
                                <span>Finalize Investment</span>
                              </Button>
                            </>
                          )}

                          {/* Step 4 Action: Move to Selling (Set Asking Price) */}
                          {isAvailable && (
                            <Button
                              variant="secondary"
                              size="small"
                              onClick={() => {
                                setListingDeal(deal);
                                setAskingPriceInput(deal.unit?.listedPrice || '');
                              }}
                              title="Update Expected Selling Price"
                            >
                              <Tag size={13} />
                              <span>Set Asking Price</span>
                            </Button>
                          )}

                          {/* Step 5 Action: Book Property */}
                          {isAvailable && (
                            <Button
                              variant="primary"
                              size="small"
                              onClick={() => navigate(`/bookings/new?unitId=${deal.unit?.id || ''}`)}
                              title="Create Customer Booking"
                            >
                              <UserCheck size={13} />
                              <span>Book Property</span>
                            </Button>
                          )}

                          {/* Details / P&L Waterfall */}
                          <Button
                            variant="ghost"
                            size="small"
                            onClick={() => setInspectDeal(deal)}
                            title="Inspect Deal P&L & Waterfall"
                          >
                            <Eye size={13} />
                            <span>P&L</span>
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Step 4: Move Property to Selling (Asking Price Dialog) */}
      {listingDeal && (
        <Modal
          open
          onOpenChange={(v) => !v && setListingDeal(null)}
          title={`Step 4: Move Property to Selling — ${listingDeal.title}`}
          description={`Unit ${listingDeal.unit?.number || ''} — Set the expected selling price (asking price) to make this property active in selling inventory.`}
        >
          <div className="dialog-flow-body">
            <div className="calc-box-highlight">
              <div>
                <div style={{ fontSize: '11px', color: 'var(--muted)', textTransform: 'uppercase' }}>
                  Total Finalized Cost Basis
                </div>
                <div style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text)' }}>
                  {money(listingDeal.totalCost, currency)}
                </div>
                <small style={{ color: 'var(--muted)' }}>
                  Buy Price: {money(listingDeal.buyPrice, currency)} + Expenses: {money(listingDeal.expenses.total, currency)}
                </small>
              </div>
              <Badge value="Investment Finalized" />
            </div>

            <div className="form-field">
              <label>Expected Selling Price / Asking Price ({currency}) *</label>
              <input
                type="number"
                step="0.01"
                placeholder="e.g. 15000000"
                value={askingPriceInput}
                onChange={(e) => setAskingPriceInput(e.target.value)}
              />
              <small style={{ color: 'var(--muted)', marginTop: '4px' }}>
                This is only your listed asking price. The actual sold price will be confirmed upon closing the deal.
              </small>
            </div>

            {Number(askingPriceInput) > 0 && (
              <div
                className={`calc-box-highlight ${Number(askingPriceInput) >= Number(listingDeal.totalCost) ? 'profit-good' : ''}`}
              >
                <div>
                  <div style={{ fontSize: '11px', color: 'var(--muted)', textTransform: 'uppercase' }}>
                    Projected Profit Margin
                  </div>
                  <div
                    style={{
                      fontSize: '15px',
                      fontWeight: 750,
                      color: Number(askingPriceInput) >= Number(listingDeal.totalCost) ? '#059669' : '#dc2626',
                    }}
                  >
                    {Number(askingPriceInput) >= Number(listingDeal.totalCost) ? '+' : ''}
                    {money(String(Number(askingPriceInput) - Number(listingDeal.totalCost)), currency)}
                    {' '}(
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

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <Button variant="secondary" onClick={() => setListingDeal(null)}>
                Cancel
              </Button>
              <Button
                variant="primary"
                disabled={!askingPriceInput || Number(askingPriceInput) <= 0 || listForSaleMutation.isPending}
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
          record={{
            id: editingPurchase.id,
            title: editingPurchase.title,
            location: editingPurchase.location,
            purchaseDate: editingPurchase.purchaseDate,
            unitId: editingPurchase.unit?.id,
            vendorId: editingPurchase.seller?.id,
            price: editingPurchase.buyPrice,
            brokerage: editingPurchase.expenses.brokerage,
            taxes: editingPurchase.expenses.taxes,
            legalFees: editingPurchase.expenses.legalFees,
            otherCosts: editingPurchase.expenses.otherCosts,
            expenseItems: editingPurchase.expenses.items,
            fileReference: editingPurchase.fileReference,
          }}
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
          open
          onOpenChange={(v) => !v && setInspectDeal(null)}
          title={`Property Financial Lifecycle: ${inspectDeal.title}`}
          description={`Ref ${inspectDeal.reference} — Full audit from seller acquisition to resale profit`}
          wide
        >
          <div className="deal-modal-body">
            {/* Visual Lifecycle Strip */}
            <div className="deal-lifecycle-strip">
              <div className="deal-stage-card">
                <span className="deal-stage-badge buy">1. Seller Acquisition</span>
                <strong>{money(inspectDeal.buyPrice, currency)}</strong>
                <span>Seller: {inspectDeal.seller?.name || 'Vendor'}</span>
                <span>Date: {date(inspectDeal.purchaseDate)}</span>
              </div>

              <ArrowRight size={18} color="var(--muted)" />

              <div className="deal-stage-card">
                <span className="deal-stage-badge renovate">2. Incurred Expenses</span>
                <strong style={{ color: '#b45309' }}>+{money(inspectDeal.expenses.total, currency)}</strong>
                <span>Total Invested: {money(inspectDeal.totalCost, currency)}</span>
                <span>Taxes, legal, renovation & commission</span>
              </div>

              <ArrowRight size={18} color="var(--muted)" />

              <div className="deal-stage-card">
                <span className="deal-stage-badge sell">3. Resale to Buyer</span>
                <strong style={{ color: inspectDeal.salePrice ? '#15803d' : 'var(--muted)' }}>
                  {inspectDeal.salePrice ? money(inspectDeal.salePrice, currency) : 'In Portfolio'}
                </strong>
                <span>
                  {inspectDeal.buyer ? `Buyer: ${inspectDeal.buyer.name}` : 'Ready for sale'}
                </span>
              </div>
            </div>

            {/* Expenses Breakdown */}
            <div className="deal-waterfall-box">
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                <h4 style={{ margin: 0, fontSize: '13px', fontWeight: 700 }}>
                  Itemized Direct Expenses & Renovation
                </h4>
                <span>Total: <strong>{money(inspectDeal.expenses.total, currency)}</strong></span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px', marginBottom: '14px' }}>
                <div style={{ padding: '8px 12px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                  <div style={{ fontSize: '10px', color: 'var(--muted)', textTransform: 'uppercase' }}>Taxes</div>
                  <div style={{ fontWeight: 650 }}>{money(inspectDeal.expenses.taxes, currency)}</div>
                </div>

                <div style={{ padding: '8px 12px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                  <div style={{ fontSize: '10px', color: 'var(--muted)', textTransform: 'uppercase' }}>Legal Fees</div>
                  <div style={{ fontWeight: 650 }}>{money(inspectDeal.expenses.legalFees, currency)}</div>
                </div>

                <div style={{ padding: '8px 12px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                  <div style={{ fontSize: '10px', color: 'var(--muted)', textTransform: 'uppercase' }}>Brokerage</div>
                  <div style={{ fontWeight: 650 }}>{money(inspectDeal.expenses.brokerage, currency)}</div>
                </div>

                <div style={{ padding: '8px 12px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                  <div style={{ fontSize: '10px', color: 'var(--muted)', textTransform: 'uppercase' }}>Renovation / Civil</div>
                  <div style={{ fontWeight: 650 }}>{money(inspectDeal.expenses.otherCosts, currency)}</div>
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
                          {money(item.amount, currency)}
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
                <strong>{money(inspectDeal.buyPrice, currency)}</strong>
              </div>

              <div className="deal-pnl-row">
                <span>2. Total Direct Expenses (Taxes, Legal, Renovation)</span>
                <strong style={{ color: '#b45309' }}>+{money(inspectDeal.expenses.total, currency)}</strong>
              </div>

              <div className="deal-pnl-row total-invested">
                <span>Total Invested Capital (Locked Cost Basis)</span>
                <strong>{money(inspectDeal.totalCost, currency)}</strong>
              </div>

              <div className="deal-pnl-row">
                <span>3. Expected Asking Price (Listed)</span>
                <strong style={{ color: '#2563eb' }}>
                  {inspectDeal.unit?.listedPrice ? money(inspectDeal.unit.listedPrice, currency) : '—'}
                </strong>
              </div>

              <div className="deal-pnl-row">
                <span>4. Actual Sold Price (Buyer Contract)</span>
                <strong style={{ color: '#1e40af' }}>
                  {inspectDeal.salePrice ? money(inspectDeal.salePrice, currency) : 'Pending Resale'}
                </strong>
              </div>

              <div className="deal-pnl-row net-profit">
                <span>Realized Net Profit / (Loss)</span>
                <strong className={Number(inspectDeal.netProfit ?? 0) >= 0 ? 'profit-text-green' : 'profit-text-red'}>
                  {inspectDeal.netProfit
                    ? `${Number(inspectDeal.netProfit) >= 0 ? '+' : ''}${money(inspectDeal.netProfit, currency)}`
                    : 'Pending Resale'}
                </strong>
              </div>

              <div className="deal-pnl-row" style={{ borderBottom: 'none' }}>
                <span>Return on Investment (ROI Margin %)</span>
                <strong className="deal-margin-badge">
                  {inspectDeal.profitMarginPercent ? `+${inspectDeal.profitMarginPercent}` : 'Pending Resale'}
                </strong>
              </div>
            </div>

            {/* Action Bar */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
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
        <JournalVoucher
          id={voucherIdToPrint}
          onClose={() => setVoucherIdToPrint(null)}
        />
      )}
    </div>
  );
}

import { Money } from '../../components/Money';
import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import {
  Building2,
  TrendingUp,
  Receipt,
  ArrowRight,
  Search,
  CheckCircle2,
  Clock,
  Layers,
  Eye,
  FileSpreadsheet,
  RefreshCw,
  Coins,
  Sparkles,
  ArrowUpRight,
} from 'lucide-react';
import { api } from '../../lib/api';
import { usePreferences } from '../../stores/preferences';
import { date, moneyWithWords } from '../../lib/format';
import { Button, Modal, Skeleton, EmptyState, ErrorState } from '../../components/ui';
import './deal-profitability.css';

interface DealExpenseItem {
  id: string;
  category: string;
  description: string;
  amount: string;
}

interface DealItem {
  id: string;
  reference: string;
  fileReference?: string;
  title: string;
  location?: string;
  purchaseDate: string;
  status: string;
  voucherId?: string;
  voucherRef?: string;
  seller: {
    id?: string;
    name: string;
    phone?: string;
  };
  buyPrice: string;
  expenses: {
    taxes: string;
    legalFees: string;
    brokerage: string;
    otherCosts: string;
    total: string;
    items?: DealExpenseItem[];
  };
  totalCost: string;
  unit?: {
    id: string;
    number: string;
    type?: string;
    status: string;
    listPrice?: string;
  };
  buyer?: {
    id?: string;
    name: string;
    phone?: string;
    bookingId?: string;
    bookingRef?: string;
  };
  salePrice?: string | null;
  collected: string;
  netProfit?: string | null;
  profitMarginPercent?: string | null;
  dealStatus: 'SOLD' | 'BOOKED' | 'AVAILABLE' | 'UNLISTED' | 'DRAFT';
}

interface DealProfitabilityResponse {
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
  deals: DealItem[];
}

export function PropertyDealProfitability() {
  const projectId = usePreferences((s) => s.projectId);
  const preferredCurrency = usePreferences((s) => s.currency) || 'PKR';
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<'ALL' | 'SOLD' | 'AVAILABLE' | 'UNLISTED' | 'DRAFT'>(
    'ALL',
  );
  const [searchTerm, setSearchTerm] = useState('');
  const [inspectDeal, setInspectDeal] = useState<DealItem | null>(null);

  const { data, isLoading, isError, error, refetch, isFetching } =
    useQuery<DealProfitabilityResponse>({
      queryKey: ['deal-profitability', projectId],
      enabled: !!projectId,
      queryFn: ({ signal }) =>
        api<DealProfitabilityResponse>(`/projects/${projectId}/deal-profitability`, { signal }),
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

  const filteredDeals = useMemo(() => {
    return deals.filter((d) => {
      // Tab filter
      if (activeTab === 'SOLD' && d.dealStatus !== 'SOLD' && d.dealStatus !== 'BOOKED')
        return false;
      if (activeTab === 'AVAILABLE' && d.dealStatus !== 'AVAILABLE') return false;
      if (activeTab === 'DRAFT' && d.dealStatus !== 'DRAFT') return false;

      // Text search
      if (!searchTerm.trim()) return true;
      const q = searchTerm.toLowerCase();
      return (
        d.title?.toLowerCase().includes(q) ||
        d.reference?.toLowerCase().includes(q) ||
        d.location?.toLowerCase().includes(q) ||
        d.unit?.number?.toLowerCase().includes(q) ||
        d.seller?.name?.toLowerCase().includes(q) ||
        d.buyer?.name?.toLowerCase().includes(q)
      );
    });
  }, [deals, activeTab, searchTerm]);

  return (
    <div className="deal-profitability-panel">
      {/* Panel Top Header */}
      <div className="deal-profitability-header">
        <div className="deal-header-title-box">
          <div className="deal-header-icon">
            <Coins size={22} />
          </div>
          <div>
            <h2>Property Purchase, Expense & Resale P&L Engine</h2>
            <p>
              Lifecycle financial tracking: Buy rate from seller + Renovation/Direct expenses vs.
              Buyer resale price, net profit & ROI margin.
            </p>
          </div>
        </div>

        <div className="deal-header-actions">
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
            <span>Full P&L Report</span>
          </Button>

          <Button variant="primary" size="small" onClick={() => navigate('/property-purchases')}>
            <Building2 size={14} />
            <span>Manage Purchases</span>
          </Button>
        </div>
      </div>

      {/* 4 Top KPI Summary Cards */}
      <div className="deal-kpi-grid">
        <div className="deal-kpi-card">
          <div className="deal-kpi-label">
            <span>Total Capital Invested</span>
            <Building2 size={15} color="var(--primary)" />
          </div>
          <div className="deal-kpi-val">
            <Money value={summary.totalInvestedCost} currency={currency} />
          </div>
          <div className="deal-kpi-sub">
            <span>
              Buy Price:{' '}
              <strong>
                <Money value={summary.totalBuyPrice} currency={currency} />
              </strong>
            </span>
          </div>
        </div>

        <div className="deal-kpi-card">
          <div className="deal-kpi-label">
            <span>Renovation & Direct Costs</span>
            <Receipt size={15} color="var(--warning)" />
          </div>
          <div className="deal-kpi-val" style={{ color: 'var(--warning)' }}>
            +<Money value={summary.totalExpenses} currency={currency} />
          </div>
          <div className="deal-kpi-sub">
            <span>Taxes, legal, brokerage & site work</span>
          </div>
        </div>

        <div className="deal-kpi-card">
          <div className="deal-kpi-label">
            <span>Realized Resale Revenue</span>
            <TrendingUp size={15} color="var(--primary)" />
          </div>
          <div className="deal-kpi-val" style={{ color: 'var(--primary)' }}>
            <Money value={summary.totalSalesRevenue} currency={currency} />
          </div>
          <div className="deal-kpi-sub">
            <span>
              {summary.soldCount} of {summary.totalAcquisitions} properties sold/booked
            </span>
          </div>
        </div>

        <div className="deal-kpi-card">
          <div className="deal-kpi-label">
            <span>Total Net Profit & ROI</span>
            <Sparkles size={15} color="var(--success)" />
          </div>
          <div className="deal-kpi-val profit-accent">
            +<Money value={summary.totalRealizedProfit} currency={currency} />
          </div>
          <div className="deal-kpi-sub">
            <span className="deal-margin-badge">+{summary.averageMarginPercent}% Avg Margin</span>
            <span style={{ fontSize: '10px' }}>({summary.availableCount} in portfolio)</span>
          </div>
        </div>
      </div>

      {/* Table Controls (Filter Tabs & Search) */}
      <div className="deal-table-controls">
        <div className="deal-filter-tabs">
          <button
            type="button"
            className={`deal-tab-btn ${activeTab === 'ALL' ? 'active' : ''}`}
            onClick={() => setActiveTab('ALL')}
          >
            All Properties ({deals.length})
          </button>
          <button
            type="button"
            className={`deal-tab-btn ${activeTab === 'SOLD' ? 'active' : ''}`}
            onClick={() => setActiveTab('SOLD')}
          >
            Sold / Booked ({summary.soldCount})
          </button>
          <button
            type="button"
            className={`deal-tab-btn ${activeTab === 'AVAILABLE' ? 'active' : ''}`}
            onClick={() => setActiveTab('AVAILABLE')}
          >
            In Portfolio ({summary.availableCount})
          </button>
          <button
            type="button"
            className={`deal-tab-btn ${activeTab === 'DRAFT' ? 'active' : ''}`}
            onClick={() => setActiveTab('DRAFT')}
          >
            Pending / Draft
          </button>
        </div>

        <div className="deal-search-box">
          <Search size={14} color="var(--muted)" />
          <input
            type="text"
            placeholder="Search title, unit #, seller, buyer..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Main Deals Table */}
      {isLoading ? (
        <div style={{ padding: '24px' }}>
          <Skeleton rows={5} />
        </div>
      ) : isError ? (
        <div style={{ padding: '24px' }}>
          <ErrorState error={error} />
        </div>
      ) : filteredDeals.length === 0 ? (
        <div style={{ padding: '36px 20px' }}>
          <EmptyState
            compact
            title="No property deals found"
            description="Acquire properties from sellers under Property Purchases to start tracking P&L, renovation expenses and resale profit margins."
          />
        </div>
      ) : (
        <div className="deal-table-scroll">
          <table className="deal-table">
            <thead>
              <tr>
                <th>Property / Unit</th>
                <th>Seller (Buy Origin)</th>
                <th>Buy Price</th>
                <th>Incurred Expenses</th>
                <th>Total Cost</th>
                <th>Buyer (Resale)</th>
                <th>Sale Price</th>
                <th>Net Profit & Margin</th>
                <th>State</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredDeals.map((deal) => {
                const totalExpNum = Number(deal.expenses?.total ?? 0);
                const hasProfit = deal.netProfit && Number(deal.netProfit) >= 0;

                return (
                  <tr key={deal.id}>
                    {/* Property / Unit */}
                    <td>
                      <div className="deal-property-stack">
                        <span className="deal-property-title">{deal.title}</span>
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

                    {/* Seller */}
                    <td>
                      <div className="deal-party-stack">
                        <span className="deal-party-name">
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
                        <Money value={deal.buyPrice} currency={currency} />
                      </div>
                      <span style={{ fontSize: '10.5px', color: 'var(--muted)' }}>
                        {date(deal.purchaseDate)}
                      </span>
                    </td>

                    {/* Incurred Expenses */}
                    <td>
                      {totalExpNum > 0 ? (
                        <button
                          type="button"
                          className="deal-expenses-pill"
                          onClick={() => setInspectDeal(deal)}
                          title="Click to view detailed itemized expenses breakdown"
                        >
                          <Receipt size={12} />
                          +<Money value={deal.expenses.total} currency={currency} />
                        </button>
                      ) : (
                        <span style={{ fontSize: '11px', color: 'var(--muted)' }}>
                          None (Rs. 0)
                        </span>
                      )}
                    </td>

                    {/* Total Invested Cost */}
                    <td>
                      <div style={{ fontWeight: 700, color: 'var(--text)' }}>
                        <Money value={deal.totalCost} currency={currency} />
                      </div>
                      <span style={{ fontSize: '10px', color: 'var(--muted)' }}>
                        Buy + Expenses
                      </span>
                    </td>

                    {/* Buyer (Resale) */}
                    <td>
                      {deal.buyer ? (
                        <div className="deal-party-stack">
                          <span className="deal-party-name" style={{ color: 'var(--primary)' }}>
                            {deal.buyer.name}
                          </span>
                          {deal.buyer.bookingRef ? (
                            <span style={{ fontSize: '10.5px', color: 'var(--muted)' }}>
                              Ref: {deal.buyer.bookingRef}
                            </span>
                          ) : null}
                        </div>
                      ) : (
                        <span className="deal-unsold-tag">
                          <Clock size={11} /> Unsold / In Portfolio
                        </span>
                      )}
                    </td>

                    {/* Sale Price */}
                    <td>
                      {deal.salePrice ? (
                        <div>
                          <div style={{ fontWeight: 700, color: 'var(--primary)' }}>
                            <Money value={deal.salePrice} currency={currency} />
                          </div>
                          <span style={{ fontSize: '10px', color: 'var(--muted)' }}>
                            Col: <Money value={deal.collected} currency={currency} />
                          </span>
                        </div>
                      ) : (
                        <span style={{ fontSize: '11px', color: 'var(--muted)' }}>
                          {deal.unit?.listPrice
                            ? `List: ${moneyWithWords(deal.unit.listPrice, currency)}`
                            : '—'}
                        </span>
                      )}
                    </td>

                    {/* Net Profit & Margin */}
                    <td>
                      {deal.netProfit ? (
                        <div>
                          <div className={hasProfit ? 'profit-text-green' : 'profit-text-red'}>
                            {hasProfit ? '+' : ''}
                            <Money value={deal.netProfit} currency={currency} />
                          </div>
                          {deal.profitMarginPercent ? (
                            <span
                              className="deal-margin-badge"
                              style={{
                                background: hasProfit ? '#ecfdf5' : 'var(--badge-red-bg)',
                                color: hasProfit ? '#047857' : 'var(--danger)',
                                borderColor: hasProfit ? '#a7f3d0' : '#fecaca',
                              }}
                            >
                              {hasProfit ? '+' : ''}
                              {deal.profitMarginPercent}% ROI
                            </span>
                          ) : null}
                        </div>
                      ) : (
                        <span
                          style={{ fontSize: '11px', color: 'var(--muted)', fontStyle: 'italic' }}
                        >
                          Pending sale
                        </span>
                      )}
                    </td>

                    {/* Deal State Badge */}
                    <td>
                      {deal.dealStatus === 'SOLD' ? (
                        <span className="deal-state-badge sold">
                          <CheckCircle2 size={11} /> Sold
                        </span>
                      ) : deal.dealStatus === 'BOOKED' ? (
                        <span className="deal-state-badge booked">
                          <CheckCircle2 size={11} /> Booked
                        </span>
                      ) : deal.dealStatus === 'AVAILABLE' ? (
                        <span className="deal-state-badge available">
                          <Layers size={11} /> Available
                        </span>
                      ) : deal.dealStatus === 'UNLISTED' ? (
                        <span className="deal-state-badge draft">Ready to list</span>
                      ) : (
                        <span className="deal-state-badge draft">
                          <Clock size={11} /> Draft
                        </span>
                      )}
                    </td>

                    {/* Actions */}
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: '6px' }}>
                        <Button
                          variant="secondary"
                          size="small"
                          onClick={() => setInspectDeal(deal)}
                          title="Inspect P&L & Waterfall"
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

      {/* Deal P&L & Expense Breakdown Modal */}
      {inspectDeal && (
        <Modal
          open
          onOpenChange={(v) => !v && setInspectDeal(null)}
          title={`Property P&L & Expense Waterfall: ${inspectDeal.title}`}
          description={`Purchase ref ${inspectDeal.reference} — Lifecycle breakdown from seller acquisition to resale`}
          wide
        >
          <div className="deal-modal-body">
            {/* 3-Stage Lifecycle Strip */}
            <div className="deal-lifecycle-strip">
              {/* Step 1: Seller Acquisition */}
              <div className="deal-stage-card">
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span
                    className="deal-stage-badge"
                    style={{ background: 'var(--badge-blue-bg)', color: 'var(--primary)' }}
                  >
                    1. Acquired From Seller
                  </span>
                </div>
                <div style={{ fontWeight: 700, fontSize: '15px', color: 'var(--text)' }}>
                  <Money value={inspectDeal.buyPrice} currency={currency} />
                </div>
                <div style={{ fontSize: '11.5px', color: 'var(--muted)' }}>
                  Seller: <strong>{inspectDeal.seller?.name || 'Vendor'}</strong>
                  {inspectDeal.seller?.phone ? ` (${inspectDeal.seller.phone})` : ''}
                </div>
                <div style={{ fontSize: '10.5px', color: 'var(--muted)' }}>
                  Date: {date(inspectDeal.purchaseDate)}
                </div>
              </div>

              <ArrowRight size={18} color="var(--muted)" />

              {/* Step 2: Renovation & Expenses */}
              <div className="deal-stage-card">
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span
                    className="deal-stage-badge"
                    style={{ background: 'var(--badge-amber-bg)', color: 'var(--warning)' }}
                  >
                    2. Incurred Direct Expenses
                  </span>
                </div>
                <div style={{ fontWeight: 700, fontSize: '15px', color: 'var(--warning)' }}>
                  +<Money value={inspectDeal.expenses.total} currency={currency} />
                </div>
                <div style={{ fontSize: '11.5px', color: 'var(--muted)' }}>
                  Total Invested:{' '}
                  <strong>
                    <Money value={inspectDeal.totalCost} currency={currency} />
                  </strong>
                </div>
                <div style={{ fontSize: '10.5px', color: 'var(--muted)' }}>
                  Taxes, legal, renovation & commission
                </div>
              </div>

              <ArrowRight size={18} color="var(--muted)" />

              {/* Step 3: Resale to Buyer */}
              <div className="deal-stage-card">
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span
                    className="deal-stage-badge"
                    style={{
                      background: inspectDeal.buyer ? 'var(--badge-green-bg)' : 'var(--subtle)',
                      color: inspectDeal.buyer ? 'var(--success)' : 'var(--muted)',
                    }}
                  >
                    3. Resold to Buyer
                  </span>
                </div>
                <div
                  style={{
                    fontWeight: 700,
                    fontSize: '15px',
                    color: inspectDeal.salePrice ? 'var(--success)' : 'var(--muted)',
                  }}
                >
                  {inspectDeal.salePrice ? (
                    <Money value={inspectDeal.salePrice} currency={currency} />
                  ) : (
                    'In Portfolio (Unsold)'
                  )}
                </div>
                <div style={{ fontSize: '11.5px', color: 'var(--muted)' }}>
                  {inspectDeal.buyer ? (
                    <>
                      Buyer: <strong>{inspectDeal.buyer.name}</strong>
                      {inspectDeal.buyer.phone ? ` (${inspectDeal.buyer.phone})` : ''}
                    </>
                  ) : (
                    <span>
                      {inspectDeal.dealStatus === 'AVAILABLE'
                        ? 'Available for booking at list price'
                        : 'Awaiting listing or resale'}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Expenses Detail Box */}
            <div className="deal-waterfall-box">
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: '10px',
                }}
              >
                <h4 style={{ margin: 0, fontSize: '13px', fontWeight: 700, color: 'var(--text)' }}>
                  Direct Expenses & Renovation Cost Breakdown
                </h4>
                <span style={{ fontSize: '11px', color: 'var(--muted)' }}>
                  Total: <Money value={inspectDeal.expenses.total} currency={currency} />
                </span>
              </div>

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(4, 1fr)',
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
                    style={{
                      fontSize: '10.5px',
                      color: 'var(--muted)',
                      textTransform: 'uppercase',
                    }}
                  >
                    Government Taxes
                  </div>
                  <div style={{ fontWeight: 650, fontSize: '13px' }}>
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
                    style={{
                      fontSize: '10.5px',
                      color: 'var(--muted)',
                      textTransform: 'uppercase',
                    }}
                  >
                    Legal & Documentation
                  </div>
                  <div style={{ fontWeight: 650, fontSize: '13px' }}>
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
                    style={{
                      fontSize: '10.5px',
                      color: 'var(--muted)',
                      textTransform: 'uppercase',
                    }}
                  >
                    Brokerage / Commission
                  </div>
                  <div style={{ fontWeight: 650, fontSize: '13px' }}>
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
                    style={{
                      fontSize: '10.5px',
                      color: 'var(--muted)',
                      textTransform: 'uppercase',
                    }}
                  >
                    Renovation & Civil Costs
                  </div>
                  <div style={{ fontWeight: 650, fontSize: '13px' }}>
                    <Money value={inspectDeal.expenses.otherCosts} currency={currency} />
                  </div>
                </div>
              </div>

              {/* Itemized expenses if present */}
              {inspectDeal.expenses.items && inspectDeal.expenses.items.length > 0 && (
                <div style={{ marginTop: '10px' }}>
                  <div
                    style={{
                      fontSize: '11.5px',
                      fontWeight: 600,
                      color: 'var(--text)',
                      marginBottom: '6px',
                    }}
                  >
                    Itemized Contractor / Material Invoices:
                  </div>
                  <table style={{ width: '100%', fontSize: '11.5px', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr
                        style={{
                          background: 'var(--subtle)',
                          textAlign: 'left',
                          color: 'var(--muted)',
                        }}
                      >
                        <th style={{ padding: '6px 10px' }}>Category</th>
                        <th style={{ padding: '6px 10px' }}>Description / Vendor</th>
                        <th style={{ padding: '6px 10px', textAlign: 'right' }}>Amount</th>
                      </tr>
                    </thead>
                    <tbody>
                      {inspectDeal.expenses.items.map((item) => (
                        <tr key={item.id} style={{ borderBottom: '1px solid var(--border)' }}>
                          <td style={{ padding: '6px 10px', fontWeight: 600 }}>{item.category}</td>
                          <td style={{ padding: '6px 10px' }}>{item.description || '—'}</td>
                          <td style={{ padding: '6px 10px', textAlign: 'right', fontWeight: 650 }}>
                            <Money value={item.amount} currency={currency} />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* P&L Statement Waterfall */}
            <div className="deal-pnl-summary-box">
              <h4
                style={{
                  margin: '0 0 12px',
                  fontSize: '13px',
                  fontWeight: 700,
                  color: 'var(--text)',
                }}
              >
                Comprehensive Profit & Loss Waterfall
              </h4>

              <div className="deal-pnl-row">
                <span>1. Property Acquisition Buy Price (Seller)</span>
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
                <span>Total Invested Capital (Cost Basis)</span>
                <strong>
                  <Money value={inspectDeal.totalCost} currency={currency} />
                </strong>
              </div>

              <div className="deal-pnl-row" style={{ marginTop: '8px' }}>
                <span>3. Buyer Resale Sale Price</span>
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

              <div className="deal-pnl-row" style={{ borderBottom: 'none', paddingTop: '6px' }}>
                <span>Return on Investment (ROI Margin %)</span>
                <strong className="deal-margin-badge">
                  {inspectDeal.profitMarginPercent
                    ? `+${inspectDeal.profitMarginPercent}%`
                    : inspectDeal.salePrice
                      ? 'Pending collection'
                      : 'Pending Resale'}
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
                <span>View Full Acquisition Record</span>
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

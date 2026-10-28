import React, { useState, useMemo } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import {
  Building2,
  UserCheck,
  Hammer,
  Plus,
  Trash2,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Coins,
  FileText,
  Search,
  UserPlus,
  Check,
  MapPin,
  FileSpreadsheet,
  X,
  Briefcase,
  ShieldAlert,
} from 'lucide-react';
import { toast } from 'sonner';
import { api, ApiError } from '../../lib/api';
import { usePreferences } from '../../stores/preferences';
import { t, useLocale } from '../../lib/i18n';
import { money } from '../../lib/format';
import { Button, Modal } from '../../components/ui';
import type { Page, Row, Operation } from '../../lib/types';
import './property-wizard.css';

export type ExpenseItem = {
  id: string;
  name: string;
  category: string;
  amount: string;
};

const EXPENSE_PRESETS = [
  'Civil & Structural Work',
  'Renovation & Finishing',
  'Paint & Polish',
  'Electrical & Plumbing',
  'Demolition & Clearance',
  'Woodwork & Tiling',
];

export function PropertyPurchaseWizard({
  operation,
  record,
  onClose,
  onSuccess,
}: {
  operation?: Operation;
  record?: Row;
  onClose: () => void;
  onSuccess?: () => void;
}) {
  useLocale();
  const projectId = usePreferences((s) => s.projectId);
  const currency = usePreferences((s) => s.currency) || 'PKR';
  const isEdit = Boolean(record?.id);

  // Wizard Step: 1 = Property, 2 = Price & Parties, 3 = Expenses & Finalize
  const [step, setStep] = useState<1 | 2 | 3>(1);

  // Form State - Step 1
  const initialUnitId = record ? String(record.unitId ?? (record.unit as Row)?.id ?? '') : '';
  const [propertyMode, setPropertyMode] = useState<'inventory' | 'custom'>(() =>
    record ? (initialUnitId ? 'inventory' : 'custom') : 'inventory',
  );
  const [selectedUnitId, setSelectedUnitId] = useState<string>(initialUnitId);
  const [title, setTitle] = useState(() => (record?.title ? String(record.title) : ''));
  const [location, setLocation] = useState(() => (record?.location ? String(record.location) : ''));
  const [fileReference, setFileReference] = useState(() =>
    record?.fileReference ? String(record.fileReference) : '',
  );
  const [purchaseDate, setPurchaseDate] = useState(() =>
    record?.purchaseDate ? String(record.purchaseDate).slice(0, 10) : new Date().toISOString().slice(0, 10),
  );

  // Form State - Step 2
  const [vendorId, setVendorId] = useState(() =>
    record ? String(record.vendorId ?? (record.vendor as Row)?.id ?? '') : '',
  );
  const [price, setPrice] = useState(() => (record?.price != null ? String(record.price) : ''));
  const initialDealerId = record ? String(record.dealerId ?? (record.dealer as Row)?.id ?? '') : '';
  const initialBrokerage = record?.brokerage != null ? String(record.brokerage) : '0';
  const [hasDealer, setHasDealer] = useState(() =>
    Boolean(initialDealerId || Number(initialBrokerage) > 0),
  );
  const [dealerId, setDealerId] = useState(initialDealerId);
  const [brokerage, setBrokerage] = useState(initialBrokerage);
  const [taxes, setTaxes] = useState(() => (record?.taxes != null ? String(record.taxes) : '0'));
  const [legalFees, setLegalFees] = useState(() =>
    record?.legalFees != null ? String(record.legalFees) : '0',
  );

  // Inline Quick-Add States (No awkward second modal!)
  const [showQuickAddSeller, setShowQuickAddSeller] = useState(false);
  const [newSellerName, setNewSellerName] = useState('');
  const [newSellerPhone, setNewSellerPhone] = useState('');

  const [showQuickAddDealer, setShowQuickAddDealer] = useState(false);
  const [newDealerName, setNewDealerName] = useState('');
  const [newDealerPhone, setNewDealerPhone] = useState('');

  // Form State - Step 3 (Expenses)
  const initialExpenses: ExpenseItem[] = useMemo(() => {
    if (record && Array.isArray(record.expenseItems) && record.expenseItems.length > 0) {
      return (record.expenseItems as Array<Partial<ExpenseItem>>).map((item, idx) => ({
        id: item.id || `exp-${Date.now()}-${idx}`,
        name: String(item.name || ''),
        category: String(item.category || 'Renovation & Building'),
        amount: String(item.amount || '0'),
      }));
    }
    return [];
  }, [record]);

  const [hasRenovation, setHasRenovation] = useState(() => initialExpenses.length > 0);
  const [expenseItems, setExpenseItems] = useState<ExpenseItem[]>(initialExpenses);
  const [notes, setNotes] = useState(() => (record?.notes ? String(record.notes) : ''));

  // Calculate base other costs (excluding renovation expenses)
  const baseOtherCosts = useMemo(() => {
    if (!record) return '0';
    const totalOther = Number(record.otherCosts) || 0;
    const initialExpSum = initialExpenses.reduce((acc, i) => acc + (Number(i.amount) || 0), 0);
    return String(Math.max(0, totalOther - initialExpSum));
  }, [record, initialExpenses]);

  // Fetch Units for this project
  const unitsQuery = useQuery({
    queryKey: ['units-for-purchase', projectId],
    enabled: Boolean(projectId),
    retry: false,
    queryFn: ({ signal }) =>
      api<Page<Row>>(`/projects/${projectId}/units?limit=100`, { signal }),
  });

  // Fetch existing property purchases to prevent selecting already acquired properties
  const purchasesQuery = useQuery({
    queryKey: ['property-purchases-for-units', projectId],
    enabled: Boolean(projectId),
    retry: false,
    queryFn: ({ signal }) =>
      api<Page<Row>>(`/projects/${projectId}/property-purchases?limit=250`, { signal }),
  });

  // Map of units that already have an active/draft purchase
  const purchasedUnitsMap = useMemo(() => {
    const map = new Map<string, { id: string; reference: string }>();
    for (const p of purchasesQuery.data?.items ?? []) {
      const uId = p.unitId || (p.unit as Row)?.id;
      // Do not mark as already purchased if it was voided, or if it is the current record being edited
      if (uId && p.status !== 'VOIDED' && (!record || String(p.id) !== String(record.id))) {
        map.set(String(uId), {
          id: String(p.id),
          reference: String(p.reference || ''),
        });
      }
    }
    return map;
  }, [purchasesQuery.data, record]);

  // Fetch Vendors
  const vendorsQuery = useQuery({
    queryKey: ['vendors-for-purchase', projectId],
    enabled: Boolean(projectId),
    retry: false,
    queryFn: ({ signal }) =>
      api<Page<Row>>(`/projects/${projectId}/vendors?limit=100`, { signal }),
  });

  // Fetch Dealers
  const dealersQuery = useQuery({
    queryKey: ['dealers-for-purchase', projectId],
    enabled: Boolean(projectId),
    retry: false,
    queryFn: ({ signal }) =>
      api<Page<Row>>(`/projects/${projectId}/dealers?limit=100`, { signal }),
  });

  const availableUnits = useMemo(() => unitsQuery.data?.items ?? [], [unitsQuery.data]);
  const sellerVendors = useMemo(
    () => (vendorsQuery.data?.items ?? []).filter((v) => ['SELLER', 'MULTI_ROLE'].includes(String(v.category))),
    [vendorsQuery.data],
  );
  const dealersList = useMemo(() => dealersQuery.data?.items ?? [], [dealersQuery.data]);

  // When a unit is chosen from inventory, auto-fill property title and location
  function handleSelectUnit(unitId: string) {
    if (purchasedUnitsMap.has(unitId)) {
      toast.error(t('This property has already been acquired in another purchase and cannot be selected again.'));
      return;
    }
    setSelectedUnitId(unitId);
    const u = availableUnits.find((item) => String(item.id) === unitId);
    if (u) {
      const unitNum = String(u.number ?? '');
      const unitType = String(u.type ?? '');
      const block = u.block ? `Block ${u.block}` : '';
      const phase = u.phase ? `Phase ${u.phase}` : '';
      const autoTitle = `${unitType ? unitType + ' ' : ''}${unitNum}`.trim();
      const autoLocation = [block, phase].filter(Boolean).join(', ') || 'Project Site';

      setTitle(autoTitle);
      setLocation(autoLocation);
      if (!fileReference) {
        setFileReference(`REF-${unitNum.replace(/[^a-zA-Z0-9]/g, '')}`);
      }
    }
  }

  // Quick Add Seller Mutation
  const createSellerMutation = useMutation({
    mutationFn: async () => {
      return api<Row>(`/projects/${projectId}/vendors`, {
        method: 'POST',
        body: {
          name: newSellerName.trim(),
          phone: newSellerPhone.trim(),
          category: 'SELLER',
        },
      });
    },
    onSuccess: (created) => {
      toast.success(t('Seller registered successfully'));
      vendorsQuery.refetch();
      if (created?.id) setVendorId(String(created.id));
      setNewSellerName('');
      setNewSellerPhone('');
      setShowQuickAddSeller(false);
    },
    onError: (err: unknown) => {
      const msg = err instanceof ApiError ? err.message : t('Failed to create seller');
      toast.error(msg);
    },
  });

  // Quick Add Dealer Mutation
  const createDealerMutation = useMutation({
    mutationFn: async () => {
      return api<Row>(`/projects/${projectId}/dealers`, {
        method: 'POST',
        body: {
          name: newDealerName.trim(),
          phone: newDealerPhone.trim(),
          commissionPercent: '0',
        },
      });
    },
    onSuccess: (created) => {
      toast.success(t('Dealer registered successfully'));
      dealersQuery.refetch();
      if (created?.id) setDealerId(String(created.id));
      setNewDealerName('');
      setNewDealerPhone('');
      setShowQuickAddDealer(false);
    },
    onError: (err: unknown) => {
      const msg = err instanceof ApiError ? err.message : t('Failed to create dealer');
      toast.error(msg);
    },
  });

  // Expense item handlers
  function addExpenseItem(presetName?: string) {
    const newItem: ExpenseItem = {
      id: crypto.randomUUID(),
      name: presetName ?? '',
      category: 'Renovation & Building',
      amount: '',
    };
    setExpenseItems((prev) => [...prev, newItem]);
  }

  function updateExpenseItem(id: string, field: 'name' | 'amount', value: string) {
    setExpenseItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, [field]: value } : item)),
    );
  }

  function removeExpenseItem(id: string) {
    setExpenseItems((prev) => prev.filter((item) => item.id !== id));
  }

  // Cost Calculations
  const numPrice = Number(price) || 0;
  const numBrokerage = hasDealer ? Number(brokerage) || 0 : 0;
  const numTaxes = Number(taxes) || 0;
  const numLegal = Number(legalFees) || 0;
  const numBaseOther = Number(baseOtherCosts) || 0;
  const numRenovationSum = hasRenovation
    ? expenseItems.reduce((acc, item) => acc + (Number(item.amount) || 0), 0)
    : 0;

  const totalAcquisitionCost =
    numPrice + numBrokerage + numTaxes + numLegal + numBaseOther + numRenovationSum;

  // Validation
  const isStep1Valid = Boolean(
    (propertyMode === 'custom' || (selectedUnitId && !purchasedUnitsMap.has(selectedUnitId))) &&
      title.trim().length >= 2 &&
      location.trim().length >= 2 &&
      fileReference.trim().length >= 2 &&
      purchaseDate,
  );

  const isStep2Valid = Boolean(
    vendorId &&
      numPrice > 0 &&
      (!hasDealer || (dealerId && numBrokerage >= 0)) &&
      numTaxes >= 0 &&
      numLegal >= 0,
  );

  // Submit Draft Acquisition
  const submitMutation = useMutation({
    mutationFn: async () => {
      const payload = {
        unitId: propertyMode === 'inventory' && selectedUnitId ? selectedUnitId : null,
        dealerId: hasDealer && dealerId ? dealerId : null,
        vendorId,
        title: title.trim(),
        location: location.trim(),
        purchaseDate,
        price: String(numPrice),
        brokerage: String(numBrokerage),
        taxes: String(numTaxes),
        legalFees: String(numLegal),
        otherCosts: String(numBaseOther),
        expenseItems: hasRenovation
          ? expenseItems
              .filter((i) => i.name.trim() && Number(i.amount) > 0)
              .map((i) => ({
                id: i.id,
                name: i.name.trim(),
                category: i.category,
                amount: String(Number(i.amount) || 0),
              }))
          : [],
        fileReference: fileReference.trim(),
        notes: notes.trim(),
      };

      if (isEdit && record?.id) {
        return api(`/projects/${projectId}/property-purchases/${record.id}`, {
          method: 'PATCH',
          body: payload,
        });
      }

      return api(`/projects/${projectId}/property-purchases`, {
        method: 'POST',
        body: payload,
      });
    },
    onSuccess: () => {
      toast.success(
        isEdit
          ? t('Property acquisition draft updated successfully')
          : t('Property acquisition draft saved successfully'),
      );
      onSuccess?.();
      onClose();
    },
    onError: (err: unknown) => {
      const msg = err instanceof ApiError ? err.message : t('Failed to save property purchase');
      toast.error(msg);
    },
  });

  return (
    <Modal
      open
      onOpenChange={(open) => !open && onClose()}
      title={isEdit ? t('Edit Property Purchase Draft') : t('New Property Purchase')}
      description={
        isEdit
          ? t('Review and update property details, prices, dealer fees & renovation expenses')
          : t('Step-by-step acquisition workflow: property selection, price, dealer fee & building expenses')
      }
      wide
    >
      <div className="pw-wizard">
        {/* Modern Stepper Navigation */}
        <div className="pw-stepper">
          {/* Step 1 */}
          <button
            type="button"
            className="pw-step-item"
            onClick={() => setStep(1)}
          >
            <div
              className={`pw-step-badge ${
                step === 1 ? 'active' : step > 1 ? 'completed' : 'pending'
              }`}
            >
              {step > 1 ? <Check size={16} /> : 1}
            </div>
            <div>
              <div className="pw-step-text-title">{t('1. Property')}</div>
              <div className="pw-step-text-sub">{t('Unit / Land parcel')}</div>
            </div>
          </button>

          <div className={`pw-step-connector ${step > 1 ? 'active' : ''}`} />

          {/* Step 2 */}
          <button
            type="button"
            className="pw-step-item"
            disabled={!isStep1Valid}
            onClick={() => isStep1Valid && setStep(2)}
          >
            <div
              className={`pw-step-badge ${
                step === 2 ? 'active' : step > 2 ? 'completed' : 'pending'
              }`}
            >
              {step > 2 ? <Check size={16} /> : 2}
            </div>
            <div>
              <div className="pw-step-text-title">{t('2. Price & Parties')}</div>
              <div className="pw-step-text-sub">{t('Seller, price & dealer')}</div>
            </div>
          </button>

          <div className={`pw-step-connector ${step > 2 ? 'active' : ''}`} />

          {/* Step 3 */}
          <button
            type="button"
            className="pw-step-item"
            disabled={!isStep1Valid || !isStep2Valid}
            onClick={() => isStep1Valid && isStep2Valid && setStep(3)}
          >
            <div
              className={`pw-step-badge ${
                step === 3 ? 'active' : 'pending'
              }`}
            >
              3
            </div>
            <div>
              <div className="pw-step-text-title">{t('3. Expenses & Finish')}</div>
              <div className="pw-step-text-sub">{t('Renovation & building')}</div>
            </div>
          </button>
        </div>

        {/* ====================================================================
            STEP 1: PROPERTY SELECTION
            ==================================================================== */}
        {step === 1 && (
          <div className="pw-step-body">
            {/* Visual Choice Cards */}
            <div className="pw-choice-grid">
              <div
                className={`pw-choice-card ${propertyMode === 'inventory' ? 'selected' : ''}`}
                onClick={() => setPropertyMode('inventory')}
              >
                <div className="pw-choice-header">
                  <div className="pw-choice-icon">
                    <Building2 size={20} />
                  </div>
                  {propertyMode === 'inventory' && (
                    <span style={{ color: 'var(--primary, #355e85)' }}>
                      <CheckCircle2 size={18} />
                    </span>
                  )}
                </div>
                <div className="pw-choice-title">{t('Select from Project Inventory')}</div>
                <div className="pw-choice-desc">
                  {t('Link directly to an existing unit, plot, apartment or commercial space registered in this project.')}
                </div>
              </div>

              <div
                className={`pw-choice-card ${propertyMode === 'custom' ? 'selected' : ''}`}
                onClick={() => setPropertyMode('custom')}
              >
                <div className="pw-choice-header">
                  <div className="pw-choice-icon">
                    <MapPin size={20} />
                  </div>
                  {propertyMode === 'custom' && (
                    <span style={{ color: 'var(--primary, #355e85)' }}>
                      <CheckCircle2 size={18} />
                    </span>
                  )}
                </div>
                <div className="pw-choice-title">{t('Custom / Unlisted Land Parcel')}</div>
                <div className="pw-choice-desc">
                  {t('Acquire external raw land, bulk acreage or unlisted parcel for future plotting.')}
                </div>
              </div>
            </div>

            {/* Inventory Unit Selector */}
            {propertyMode === 'inventory' && (
              <div className="pw-form-group">
                <label className="pw-label">
                  <span>{t('Choose Property from Inventory')}</span>
                  <span className="pw-req">*</span>
                </label>
                <select
                  className="pw-select"
                  value={selectedUnitId}
                  onChange={(e) => handleSelectUnit(e.target.value)}
                >
                  <option value="">{t('-- Choose Property / Unit --')}</option>
                  {availableUnits.map((u) => {
                    const uId = String(u.id);
                    const purchased = purchasedUnitsMap.get(uId);
                    const isPurchased = Boolean(purchased);
                    const num = String(u.number ?? '');
                    const typ = String(u.type ?? '');
                    const sz = u.size ? `(${String(u.size)} ${String(u.measurementUnit ?? '')})` : '';
                    const blk = u.block ? `[Block ${String(u.block)}]` : '';
                    const st = String(u.status ?? '');
                    return (
                      <option key={uId} value={uId} disabled={isPurchased}>
                        {isPurchased
                          ? `${num} — ${typ} [ALREADY PURCHASED: ${purchased?.reference || 'Acquired'}]`
                          : `${num} — ${typ} ${sz} ${blk} (${st})`.trim()}
                      </option>
                    );
                  })}
                </select>
                {availableUnits.length === 0 && (
                  <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 4 }}>
                    {t('No units found in project. Switch to "Custom / Unlisted Land Parcel" above if not yet added.')}
                  </div>
                )}
              </div>
            )}

            {/* Title & Location Inputs */}
            <div className="pw-grid-2">
              <div className="pw-form-group">
                <label className="pw-label">
                  <span>{t('Property Title / Description')}</span>
                  <span className="pw-req">*</span>
                </label>
                <input
                  className="pw-input"
                  placeholder={t('e.g. Plot 42, Block B or 10-Kanal Commercial Land')}
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>

              <div className="pw-form-group">
                <label className="pw-label">
                  <span>{t('Location / Site Details')}</span>
                  <span className="pw-req">*</span>
                </label>
                <input
                  className="pw-input"
                  placeholder={t('e.g. Main Boulevard, Sector C or GT Road Khasra 412')}
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                />
              </div>
            </div>

            {/* Agreement Ref & Acquisition Date */}
            <div className="pw-grid-2">
              <div className="pw-form-group">
                <label className="pw-label">
                  <span>{t('Agreement / File Reference')}</span>
                  <span className="pw-req">*</span>
                </label>
                <input
                  className="pw-input"
                  placeholder={t('e.g. AGR-2026-LND-01 or FILE-889')}
                  value={fileReference}
                  onChange={(e) => setFileReference(e.target.value)}
                />
                <span style={{ fontSize: 11.5, color: 'var(--muted)', marginTop: 2 }}>
                  {t('Must be unique per seller and project')}
                </span>
              </div>

              <div className="pw-form-group">
                <label className="pw-label">
                  <span>{t('Acquisition Date')}</span>
                  <span className="pw-req">*</span>
                </label>
                <input
                  type="date"
                  className="pw-input"
                  value={purchaseDate}
                  onChange={(e) => setPurchaseDate(e.target.value)}
                />
              </div>
            </div>
          </div>
        )}

        {/* ====================================================================
            STEP 2: PRICE, SELLER & DEALER
            ==================================================================== */}
        {step === 2 && (
          <div className="pw-step-body">
            {/* Seller Selection with Smooth In-line Quick Add */}
            <div className="pw-form-group">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <label className="pw-label">
                  <span>{t('Seller / Landowner')}</span>
                  <span className="pw-req">*</span>
                </label>
                {!showQuickAddSeller && (
                  <button
                    type="button"
                    onClick={() => setShowQuickAddSeller(true)}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: 'var(--primary, #355e85)',
                      fontSize: 12,
                      fontWeight: 600,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 4,
                    }}
                  >
                    <UserPlus size={13} />
                    {t('+ Add New Seller')}
                  </button>
                )}
              </div>

              {/* In-line Quick Add Seller Form */}
              {showQuickAddSeller ? (
                <div className="pw-inline-card">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div className="pw-inline-title">
                      <UserPlus size={14} />
                      {t('Register New Seller Contact')}
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowQuickAddSeller(false)}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--muted)' }}
                    >
                      <X size={15} />
                    </button>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                    <input
                      className="pw-input"
                      placeholder={t('Seller full name')}
                      value={newSellerName}
                      onChange={(e) => setNewSellerName(e.target.value)}
                    />
                    <input
                      className="pw-input"
                      placeholder={t('Phone number (e.g. +92 300 1234567)')}
                      value={newSellerPhone}
                      onChange={(e) => setNewSellerPhone(e.target.value)}
                    />
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 4 }}>
                    <Button size="small" variant="ghost" onClick={() => setShowQuickAddSeller(false)}>
                      {t('Cancel')}
                    </Button>
                    <Button
                      size="small"
                      variant="primary"
                      disabled={createSellerMutation.isPending || !newSellerName.trim() || !newSellerPhone.trim()}
                      onClick={() => createSellerMutation.mutate()}
                    >
                      {createSellerMutation.isPending ? t('Saving...') : t('Save & Select Seller')}
                    </Button>
                  </div>
                </div>
              ) : (
                <select
                  className="pw-select"
                  value={vendorId}
                  onChange={(e) => setVendorId(e.target.value)}
                >
                  <option value="">{t('-- Choose Seller / Landowner --')}</option>
                  {sellerVendors.map((s) => (
                    <option key={String(s.id)} value={String(s.id)}>
                      {`${String(s.name ?? '')} (${String(s.phone ?? 'No phone')}) [${String(s.category ?? '')}]`}
                    </option>
                  ))}
                </select>
              )}
            </div>

            {/* Purchase Price Hero Input */}
            <div className="pw-form-group">
              <label className="pw-label">
                <span>{t('Agreed Purchase Price')}</span>
                <span className="pw-req">*</span>
              </label>
              <div className="pw-hero-input-wrap">
                <div className="pw-currency-prefix">{currency}</div>
                <input
                  type="number"
                  min="1"
                  step="any"
                  className="pw-hero-input"
                  placeholder="0.00"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                />
              </div>
              <span style={{ fontSize: 12, color: 'var(--muted)' }}>
                {t('Agreed price owed to seller, recorded as a liability in SYS-SELLER-PAYABLES')}
              </span>
            </div>

            {/* Middleman / Dealer Section (iOS-style switch) */}
            <div style={{ border: '1px solid var(--border)', borderRadius: 12, overflow: 'hidden' }}>
              <div
                className="pw-switch-wrap"
                onClick={() => {
                  const next = !hasDealer;
                  setHasDealer(next);
                  if (!next) {
                    setDealerId('');
                    setBrokerage('0');
                    setShowQuickAddDealer(false);
                  }
                }}
              >
                <div>
                  <div style={{ fontWeight: 700, fontSize: 13, color: 'var(--text)' }}>
                    {t('Is there a dealer or broker in between?')}
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 2 }}>
                    {t('Record middleman dealer details and commission fee given against this property')}
                  </div>
                </div>
                <div className={`pw-switch ${hasDealer ? 'on' : ''}`}>
                  <div className="pw-switch-thumb" />
                </div>
              </div>

              {hasDealer && (
                <div style={{ padding: '16px 18px', background: 'var(--subtle, #f8fafc)', borderTop: '1px solid var(--border)' }}>
                  {showQuickAddDealer ? (
                    <div className="pw-inline-card" style={{ marginBottom: 12 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div className="pw-inline-title">
                          <UserPlus size={14} />
                          {t('Register New Dealer')}
                        </div>
                        <button
                          type="button"
                          onClick={() => setShowQuickAddDealer(false)}
                          style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--muted)' }}
                        >
                          <X size={15} />
                        </button>
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                        <input
                          className="pw-input"
                          placeholder={t('Dealer name / agency')}
                          value={newDealerName}
                          onChange={(e) => setNewDealerName(e.target.value)}
                        />
                        <input
                          className="pw-input"
                          placeholder={t('Dealer phone number')}
                          value={newDealerPhone}
                          onChange={(e) => setNewDealerPhone(e.target.value)}
                        />
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 4 }}>
                        <Button size="small" variant="ghost" onClick={() => setShowQuickAddDealer(false)}>
                          {t('Cancel')}
                        </Button>
                        <Button
                          size="small"
                          variant="primary"
                          disabled={createDealerMutation.isPending || !newDealerName.trim() || !newDealerPhone.trim()}
                          onClick={() => createDealerMutation.mutate()}
                        >
                          {createDealerMutation.isPending ? t('Saving...') : t('Save & Select Dealer')}
                        </Button>
                      </div>
                    </div>
                  ) : null}

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                    <div className="pw-form-group">
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <label className="pw-label">
                          <span>{t('Select Dealer')}</span>
                          <span className="pw-req">*</span>
                        </label>
                        {!showQuickAddDealer && (
                          <button
                            type="button"
                            onClick={() => setShowQuickAddDealer(true)}
                            style={{
                              background: 'none',
                              border: 'none',
                              color: 'var(--primary, #355e85)',
                              fontSize: 11,
                              fontWeight: 600,
                              cursor: 'pointer',
                            }}
                          >
                            + {t('Add New')}
                          </button>
                        )}
                      </div>
                      <select
                        className="pw-select"
                        value={dealerId}
                        onChange={(e) => setDealerId(e.target.value)}
                      >
                        <option value="">{t('-- Choose Dealer --')}</option>
                        {dealersList.map((d) => (
                          <option key={String(d.id)} value={String(d.id)}>
                            {`${String(d.name ?? '')} (${String(d.phone ?? '')})`}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="pw-form-group">
                      <label className="pw-label">
                        <span>{t('Dealer Fee / Brokerage')} ({currency})</span>
                      </label>
                      <input
                        type="number"
                        min="0"
                        step="any"
                        className="pw-input"
                        placeholder="0.00"
                        value={brokerage}
                        onChange={(e) => setBrokerage(e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Direct Taxes & Legal Fees */}
            <div className="pw-grid-2">
              <div className="pw-form-group">
                <label className="pw-label">
                  <span>{t('Non-recoverable Taxes / Stamp Duty')} ({currency})</span>
                </label>
                <input
                  type="number"
                  min="0"
                  step="any"
                  className="pw-input"
                  placeholder="0.00"
                  value={taxes}
                  onChange={(e) => setTaxes(e.target.value)}
                />
              </div>

              <div className="pw-form-group">
                <label className="pw-label">
                  <span>{t('Legal & Documentation Fees')} ({currency})</span>
                </label>
                <input
                  type="number"
                  min="0"
                  step="any"
                  className="pw-input"
                  placeholder="0.00"
                  value={legalFees}
                  onChange={(e) => setLegalFees(e.target.value)}
                />
              </div>
            </div>
          </div>
        )}

        {/* ====================================================================
            STEP 3: EXPENSES & FINALIZE
            ==================================================================== */}
        {step === 3 && (
          <div className="pw-step-body">
            {/* The Choice Banner */}
            <div className="pw-choice-grid">
              <div
                className={`pw-choice-card ${!hasRenovation ? 'selected' : ''}`}
                onClick={() => setHasRenovation(false)}
              >
                <div className="pw-choice-header">
                  <div className="pw-choice-icon">
                    <CheckCircle2 size={20} />
                  </div>
                  {!hasRenovation && (
                    <span style={{ color: 'var(--success, #10b981)' }}>
                      <CheckCircle2 size={18} />
                    </span>
                  )}
                </div>
                <div className="pw-choice-title">{t('Make This Done (No Extra Expenses)')}</div>
                <div className="pw-choice-desc">
                  {t('Acquisition finalized as-is without adding extra renovation, construction or building costs.')}
                </div>
              </div>

              <div
                className={`pw-choice-card ${hasRenovation ? 'selected' : ''}`}
                onClick={() => {
                  setHasRenovation(true);
                  if (expenseItems.length === 0) addExpenseItem('Civil & Structural Work');
                }}
              >
                <div className="pw-choice-header">
                  <div className="pw-choice-icon">
                    <Hammer size={20} />
                  </div>
                  {hasRenovation && (
                    <span style={{ color: 'var(--primary, #355e85)' }}>
                      <CheckCircle2 size={18} />
                    </span>
                  )}
                </div>
                <div className="pw-choice-title">{t('Add Renovation & Building Expenses')}</div>
                <div className="pw-choice-desc">
                  {t('Add variable line items for civil work, building construction, paint, plumbing & materials.')}
                </div>
              </div>
            </div>

            {/* Dynamic Renovation Line Items */}
            {hasRenovation && (
              <div
                style={{
                  border: '1.5px solid var(--border)',
                  borderRadius: 12,
                  padding: 18,
                  background: 'var(--subtle, #f8fafc)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 14,
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ fontWeight: 700, fontSize: 13, color: 'var(--text)' }}>
                    {t('Renovation & Building Line Items')} ({expenseItems.length})
                  </div>
                  <Button
                    size="small"
                    variant="secondary"
                    onClick={() => addExpenseItem()}
                  >
                    <Plus size={13} style={{ marginRight: 4 }} />
                    {t('Add Expense Item')}
                  </Button>
                </div>

                {/* Quick Presets Chips */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  <span style={{ fontSize: 11, color: 'var(--muted)', alignSelf: 'center', marginRight: 4 }}>
                    {t('Quick Presets')}:
                  </span>
                  {EXPENSE_PRESETS.map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      className="pw-preset-chip"
                      onClick={() => addExpenseItem(preset)}
                    >
                      + {preset}
                    </button>
                  ))}
                </div>

                {/* Rows List */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 4 }}>
                  {expenseItems.map((item, idx) => (
                    <div key={item.id} className="pw-expense-row">
                      <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--muted)', width: 22 }}>
                        {idx + 1}.
                      </span>
                      <input
                        className="pw-input"
                        placeholder={t('Expense description / category (e.g. Paint, Plumbing, Structure)')}
                        value={item.name}
                        onChange={(e) => updateExpenseItem(item.id, 'name', e.target.value)}
                        style={{ flex: 2, padding: '7px 10px' }}
                      />
                      <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 6 }}>
                        <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--muted)' }}>{currency}</span>
                        <input
                          type="number"
                          min="0"
                          step="any"
                          className="pw-input"
                          placeholder="0.00"
                          value={item.amount}
                          onChange={(e) => updateExpenseItem(item.id, 'amount', e.target.value)}
                          style={{ width: '100%', padding: '7px 10px', fontWeight: 700 }}
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => removeExpenseItem(item.id)}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: 'var(--danger, #ef4444)',
                          cursor: 'pointer',
                          padding: 6,
                          borderRadius: 6,
                        }}
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  ))}
                </div>

                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    paddingTop: 10,
                    borderTop: '1px solid var(--border)',
                    fontSize: 13,
                  }}
                >
                  <span style={{ fontWeight: 600, color: 'var(--muted)' }}>
                    {t('Renovation & Building Subtotal')}:
                  </span>
                  <span style={{ fontWeight: 800, fontSize: 15, color: 'var(--primary, #355e85)' }}>
                    {money(numRenovationSum)}
                  </span>
                </div>
              </div>
            )}

            {/* Notes */}
            <div className="pw-form-group">
              <label className="pw-label">
                <span>{t('Acquisition Notes / Terms')}</span>
              </label>
              <textarea
                className="pw-input"
                rows={2}
                placeholder={t('Optional notes regarding seller agreement, possession, or development plan...')}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>

            {/* Grand Total Hero Banner */}
            <div className="pw-grand-total">
              <div>
                <div className="pw-grand-label">{t('Total Capitalized Property Cost')}</div>
                <div className="pw-grand-sub">
                  {t('Base Price + Dealer Fee + Taxes & Legal + Renovation Expenses')}
                </div>
              </div>
              <div className="pw-grand-amount">
                {money(totalAcquisitionCost)}
              </div>
            </div>
          </div>
        )}

        {/* Wizard Footer Controls */}
        <div className="pw-footer">
          <div>
            {step > 1 ? (
              <Button variant="secondary" onClick={() => setStep((s) => (s - 1) as 1 | 2)}>
                <ArrowLeft size={15} style={{ marginRight: 6 }} />
                {t('Back')}
              </Button>
            ) : (
              <Button variant="ghost" onClick={onClose}>
                {t('Cancel')}
              </Button>
            )}
          </div>

          <div>
            {step < 3 ? (
              <Button
                variant="primary"
                disabled={step === 1 ? !isStep1Valid : !isStep2Valid}
                onClick={() => setStep((s) => (s + 1) as 2 | 3)}
              >
                {t('Continue to Next Step')}
                <ArrowRight size={14} style={{ marginLeft: 6 }} />
              </Button>
            ) : (
              <Button
                variant="primary"
                disabled={submitMutation.isPending || !isStep1Valid || !isStep2Valid}
                onClick={() => submitMutation.mutate()}
              >
                <CheckCircle2 size={16} style={{ marginRight: 6 }} />
                {submitMutation.isPending
                  ? isEdit
                    ? t('Updating...')
                    : t('Saving...')
                  : isEdit
                    ? t('Update Draft Acquisition')
                    : t('Save Draft Acquisition')}
              </Button>
            )}
          </div>
        </div>
      </div>
    </Modal>
  );
}

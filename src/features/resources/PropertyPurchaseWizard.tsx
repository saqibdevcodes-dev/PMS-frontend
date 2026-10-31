import { allPages } from '../../lib/pages';
import { exactMoney, moneyPayload } from '../../lib/exact-money';
import { useUnsavedChanges, confirmDiscard } from '../../hooks/use-unsaved';
import { MoneyInput } from '../../components/MoneyInput';
import { Money } from '../../components/Money';
import { useState, useMemo } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import {
  Building2,
  Hammer,
  Plus,
  Trash2,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  UserPlus,
  Check,
  MapPin,
  X,
} from 'lucide-react';
import { toast } from 'sonner';
import { can } from '../../stores/auth';
import { api, ApiError } from '../../lib/api';
import { usePreferences } from '../../stores/preferences';
import { t, useLocale } from '../../lib/i18n';

import { Button, Modal, ErrorState, Skeleton } from '../../components/ui';
import type { Row, Operation } from '../../lib/types';
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

type PurchaseProps = {
  operation?: Operation;
  record?: Row;
  onClose: () => void;
  onSuccess?: () => void;
};
export function PropertyPurchaseWizard(props: PurchaseProps) {
  const projectId = usePreferences((state) => state.projectId);
  const full = useQuery({
    queryKey: ['purchase-edit-record', projectId, props.record?.id],
    enabled: Boolean(props.record?.id && projectId),
    queryFn: ({ signal }) =>
      api<Row>(`/projects/${projectId}/property-purchases/${props.record!.id}`, { signal }),
  });
  if (props.record?.id && !full.data)
    return (
      <Modal
        open
        onOpenChange={(open) => !open && props.onClose()}
        title="Edit Property Purchase Draft"
      >
        <div className="modal-body">
          {full.isError ? (
            <ErrorState error={full.error} retry={() => void full.refetch()} />
          ) : (
            <Skeleton />
          )}
        </div>
      </Modal>
    );
  return (
    <PurchaseEditor
      key={`${projectId}:${props.record?.id ?? 'new'}`}
      {...props}
      record={full.data ?? props.record}
    />
  );
}

function PurchaseEditor({
  operation: _operation,
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
    record
      ? initialUnitId
        ? 'inventory'
        : 'custom'
      : can('inventory.read')
        ? 'inventory'
        : 'custom',
  );
  const [selectedUnitId, setSelectedUnitId] = useState<string>(initialUnitId);
  const [title, setTitle] = useState(() => (record?.title ? String(record.title) : ''));
  const [location, setLocation] = useState(() => (record?.location ? String(record.location) : ''));
  const [fileReference, setFileReference] = useState(() =>
    record?.fileReference ? String(record.fileReference) : '',
  );
  const [purchaseDate, setPurchaseDate] = useState(() =>
    record?.purchaseDate
      ? String(record.purchaseDate).slice(0, 10)
      : new Date().toISOString().slice(0, 10),
  );

  // Form State - Step 2
  const [vendorId, setVendorId] = useState(() =>
    record ? String(record.vendorId ?? (record.vendor as Row)?.id ?? '') : '',
  );
  const [price, setPrice] = useState(() => (record?.price != null ? String(record.price) : ''));
  const initialDealerId = record ? String(record.dealerId ?? (record.dealer as Row)?.id ?? '') : '';
  const initialBrokerage = record?.brokerage != null ? String(record.brokerage) : '0';
  const [brokerage, setBrokerage] = useState(initialBrokerage);
  const [taxes, setTaxes] = useState(() => (record?.taxes != null ? String(record.taxes) : '0'));
  const [legalFees, setLegalFees] = useState(() =>
    record?.legalFees != null ? String(record.legalFees) : '0',
  );

  // Inline Quick-Add States (No awkward second modal!)
  const [showQuickAddSeller, setShowQuickAddSeller] = useState(false);
  const [newSellerName, setNewSellerName] = useState('');
  const [newSellerPhone, setNewSellerPhone] = useState('');

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
    const totalOther = exactMoney(record.otherCosts);
    const initialExpSum = initialExpenses.reduce(
      (acc, i) => acc.plus(exactMoney(i.amount)),
      exactMoney(0),
    );
    return totalOther.minus(initialExpSum).toFixed(2);
  }, [record, initialExpenses]);

  // Fetch Units for this project
  const unitsQuery = useQuery({
    queryKey: ['units-for-purchase', projectId],
    enabled: Boolean(projectId && can('inventory.read')),
    retry: false,
    queryFn: ({ signal }) => allPages<Row>(`/projects/${projectId}/units`, signal),
  });

  // Fetch existing property purchases to prevent selecting already acquired properties
  const purchasesQuery = useQuery({
    queryKey: ['property-purchases-for-units', projectId],
    enabled: Boolean(projectId),
    retry: false,
    queryFn: ({ signal }) => allPages<Row>(`/projects/${projectId}/property-purchases`, signal),
  });

  // Map of units that already have an active/draft purchase
  const purchasedUnitsMap = useMemo(() => {
    const map = new Map<string, { id: string; reference: string }>();
    for (const p of purchasesQuery.data ?? []) {
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
    queryFn: ({ signal }) => allPages<Row>(`/projects/${projectId}/vendors?role=SELLER`, signal),
  });

  const availableUnits = useMemo(() => unitsQuery.data ?? [], [unitsQuery.data]);
  const sellerVendors = useMemo(() => vendorsQuery.data ?? [], [vendorsQuery.data]);

  // When a unit is chosen from inventory, auto-fill property title and location
  function handleSelectUnit(unitId: string) {
    if (purchasedUnitsMap.has(unitId)) {
      toast.error(
        t(
          'This property has already been acquired in another purchase and cannot be selected again.',
        ),
      );
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

  const numPrice = exactMoney(price);
  const numBrokerage = exactMoney(brokerage);
  const numTaxes = exactMoney(taxes);
  const numLegal = exactMoney(legalFees);
  const numBaseOther = exactMoney(baseOtherCosts);
  const numRenovationSum = hasRenovation
    ? expenseItems.reduce((acc, item) => acc.plus(exactMoney(item.amount)), exactMoney(0))
    : exactMoney(0);
  const totalAcquisitionCost = numPrice
    .plus(numBrokerage)
    .plus(numTaxes)
    .plus(numLegal)
    .plus(numBaseOther)
    .plus(numRenovationSum);
  const currentDraft = JSON.stringify({
    propertyMode,
    selectedUnitId,
    title,
    location,
    fileReference,
    purchaseDate,
    vendorId,
    price,
    brokerage,
    taxes,
    legalFees,
    notes,
    expenseItems,
    hasRenovation,
    newSellerName,
    newSellerPhone,
  });
  const [initialDraft] = useState(currentDraft);
  const dirty = currentDraft !== initialDraft;
  useUnsavedChanges(dirty);

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
    numPrice.isFinite() &&
    numPrice.gt(0) &&
    numBrokerage.gte(0) &&
    numTaxes.gte(0) &&
    numLegal.gte(0),
  );

  // Submit Draft Acquisition
  const submitMutation = useMutation({
    mutationFn: async () => {
      const payload = {
        unitId: propertyMode === 'inventory' && selectedUnitId ? selectedUnitId : null,
        dealerId: initialDealerId || null,
        vendorId,
        title: title.trim(),
        location: location.trim(),
        purchaseDate,
        price: moneyPayload(numPrice),
        brokerage: moneyPayload(numBrokerage),
        taxes: moneyPayload(numTaxes),
        legalFees: moneyPayload(numLegal),
        otherCosts: moneyPayload(numBaseOther),
        expenseItems: hasRenovation
          ? expenseItems
              .filter((i) => i.name.trim() && exactMoney(i.amount).gt(0))
              .map((i) => ({
                id: i.id,
                name: i.name.trim(),
                category: i.category,
                amount: moneyPayload(i.amount),
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
      beforeClose={async () => !submitMutation.isPending && (!dirty || (await confirmDiscard()))}
      title={isEdit ? t('Edit Property Purchase Draft') : t('New Property Purchase')}
      description={
        isEdit
          ? t('Review and update property details, prices, dealer fees & renovation expenses')
          : t(
              'Step-by-step acquisition workflow: property selection, price, dealer fee & building expenses',
            )
      }
      wide
    >
      <div className="pw-wizard">
        {/* Modern Stepper Navigation */}
        <div className="pw-stepper">
          {/* Step 1 */}
          <button type="button" className="pw-step-item" onClick={() => setStep(1)}>
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
              <div className="pw-step-text-sub">{t('Seller, price & costs')}</div>
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
            <div className={`pw-step-badge ${step === 3 ? 'active' : 'pending'}`}>3</div>
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
                onClick={() => can('inventory.read') && setPropertyMode('inventory')}
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
                  {t(
                    'Link directly to an existing unit, plot, apartment or commercial space registered in this project.',
                  )}
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
                  {t(
                    'Acquire external raw land, bulk acreage or unlisted parcel for future plotting.',
                  )}
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
                    const sz = u.size
                      ? `(${String(u.size)} ${String(u.measurementUnit ?? '')})`
                      : '';
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
                    {t(
                      'No units found in project. Switch to "Custom / Unlisted Land Parcel" above if not yet added.',
                    )}
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
                  aria-label={t('Property Title / Description')}
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
                  aria-label={t('Location / Site Details')}
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
                  aria-label={t('Agreement / File Reference')}
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
                  aria-label={t('Acquisition Date')}
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
              <div
                style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
              >
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
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}
                  >
                    <div className="pw-inline-title">
                      <UserPlus size={14} />
                      {t('Register New Seller Contact')}
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowQuickAddSeller(false)}
                      style={{
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        color: 'var(--muted)',
                      }}
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
                  <div
                    style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 4 }}
                  >
                    <Button
                      size="small"
                      variant="ghost"
                      onClick={() => setShowQuickAddSeller(false)}
                    >
                      {t('Cancel')}
                    </Button>
                    <Button
                      size="small"
                      variant="primary"
                      disabled={
                        createSellerMutation.isPending ||
                        !newSellerName.trim() ||
                        !newSellerPhone.trim()
                      }
                      onClick={() => createSellerMutation.mutate()}
                    >
                      {createSellerMutation.isPending ? t('Saving...') : t('Save & Select Seller')}
                    </Button>
                  </div>
                </div>
              ) : (
                <select
                  className="pw-select"
                  aria-label={t('Seller / Landowner')}
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
              <label className="pw-label" htmlFor="purchase-price">
                <span>{t('Agreed Purchase Price')}</span>
                <span className="pw-req">*</span>
              </label>
              <div className="pw-hero-input-wrap">
                <div className="pw-currency-prefix">{currency}</div>
                <MoneyInput
                  min="1"
                  step="any"
                  className="pw-hero-input"
                  placeholder="0.00"
                  id="purchase-price"
                  value={price}
                  onValueChange={setPrice}
                />
              </div>
              <span style={{ fontSize: 12, color: 'var(--muted)' }}>
                {t('Agreed price owed to seller, recorded as a liability in SYS-SELLER-PAYABLES')}
              </span>
            </div>

            <div className="pw-form-group">
              <label className="pw-label" htmlFor="purchase-brokerage">
                {t('Acquisition brokerage')} ({currency})
              </label>
              <MoneyInput
                id="purchase-brokerage"
                className="pw-input"
                value={brokerage}
                onValueChange={setBrokerage}
              />
              <small>
                {t(
                  'Include any direct brokerage cost in the acquisition. Record payee details in the agreement notes.',
                )}
              </small>
            </div>

            {/* Direct Taxes & Legal Fees */}
            <div className="pw-grid-2">
              <div className="pw-form-group">
                <label className="pw-label" htmlFor="purchase-taxes">
                  <span>
                    {t('Non-recoverable Taxes / Stamp Duty')} ({currency})
                  </span>
                </label>
                <MoneyInput
                  min="0"
                  step="any"
                  className="pw-input"
                  placeholder="0.00"
                  id="purchase-taxes"
                  value={taxes}
                  onValueChange={setTaxes}
                />
              </div>

              <div className="pw-form-group">
                <label className="pw-label" htmlFor="purchase-legalFees">
                  <span>
                    {t('Legal & Documentation Fees')} ({currency})
                  </span>
                </label>
                <MoneyInput
                  min="0"
                  step="any"
                  className="pw-input"
                  placeholder="0.00"
                  id="purchase-legalFees"
                  value={legalFees}
                  onValueChange={setLegalFees}
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
                  {t(
                    'Acquisition finalized as-is without adding extra renovation, construction or building costs.',
                  )}
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
                  {t(
                    'Add variable line items for civil work, building construction, paint, plumbing & materials.',
                  )}
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
                <div
                  style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                >
                  <div style={{ fontWeight: 700, fontSize: 13, color: 'var(--text)' }}>
                    {t('Renovation & Building Line Items')} ({expenseItems.length})
                  </div>
                  <Button size="small" variant="secondary" onClick={() => addExpenseItem()}>
                    <Plus size={13} style={{ marginRight: 4 }} />
                    {t('Add Expense Item')}
                  </Button>
                </div>

                {/* Quick Presets Chips */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  <span
                    style={{
                      fontSize: 11,
                      color: 'var(--muted)',
                      alignSelf: 'center',
                      marginRight: 4,
                    }}
                  >
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
                      <span
                        style={{ fontSize: 12, fontWeight: 700, color: 'var(--muted)', width: 22 }}
                      >
                        {idx + 1}.
                      </span>
                      <input
                        className="pw-input"
                        placeholder={t(
                          'Expense description / category (e.g. Paint, Plumbing, Structure)',
                        )}
                        value={item.name}
                        onChange={(e) => updateExpenseItem(item.id, 'name', e.target.value)}
                        style={{ flex: 2, padding: '7px 10px' }}
                      />
                      <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 6 }}>
                        <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--muted)' }}>
                          {currency}
                        </span>
                        <MoneyInput
                          min="0"
                          step="any"
                          className="pw-input"
                          placeholder="0.00"
                          aria-label={t('Amount')}
                          value={item.amount}
                          style={{ width: '100%', padding: '7px 10px', fontWeight: 700 }}
                          onValueChange={(value) => updateExpenseItem(item.id, 'amount', value)}
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
                    <Money value={numRenovationSum.toFixed(2)} />
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
                placeholder={t(
                  'Optional notes regarding seller agreement, possession, or development plan...',
                )}
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
                <Money value={totalAcquisitionCost.toFixed(2)} />
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
              <Button
                variant="ghost"
                onClick={() => void confirmDiscard().then((discard) => discard && onClose())}
              >
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

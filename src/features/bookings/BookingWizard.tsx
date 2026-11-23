import { Money } from '../../components/Money';
import { t, useLocale } from '../../lib/i18n';
import { MoneyInput } from '../../components/MoneyInput';
import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useMutation, useQuery } from '@tanstack/react-query';
import Decimal from 'decimal.js';
import {
  CheckCircle2,
  Building2,
  UserRound,
  ArrowRight,
  ShieldCheck,
  Plus,
  Trash2,
} from 'lucide-react';
import { RecordImage } from '../../components/ImageUpload';
import { api } from '../../lib/api';
import { queryClient } from '../../lib/query';
import { usePreferences } from '../../stores/preferences';
import { can } from '../../stores/auth';
import { row, type Row } from '../../lib/types';
import { labelOf, calendarDay, moneyWithWords } from '../../lib/format';
import { RelationSelect } from '../../components/RelationSelect';
import { Button, PageHeading, ErrorState } from '../../components/ui';
import { OperationDialog } from '../../components/OperationDialog';
import { operation, projectRoot } from '../../lib/contract';
import { ProjectRequired, Unauthorized } from '../resources/ResourcePage';
import { useUnsavedChanges } from '../../hooks/use-unsaved';
import { PaymentFields, initialTerms, previewPlan, type Terms } from './PaymentFields';
import { SellingExpenses, type SellingExpenseItem } from '../../components/SellingExpenses';

const SELLING_EXPENSE_PRESETS = [
  'Advertising & marketing',
  'Legal & sale documentation',
  'Property inspection',
  'Transfer processing',
  'Client travel',
];

export default function BookingWizard() {
  useLocale();
  const projectId = usePreferences((s) => s.projectId);
  const [params] = useSearchParams();
  const requestedUnitId = params.get('unitId') ?? '';
  const requestedUnit = useQuery({
    queryKey: ['booking-requested-unit', projectId, requestedUnitId],
    enabled: Boolean(projectId && requestedUnitId && can('inventory.read')),
    queryFn: ({ signal }) =>
      api<Row>(`/projects/${projectId}/units/${requestedUnitId}`, { signal }),
  });
  const [step, setStep] = useState(0);
  const [customer, setCustomer] = useState<Row>({});
  const [unit, setUnit] = useState<Row>({});
  const [sellingPrice, setSellingPrice] = useState('');
  const [applyDiscount, setApplyDiscount] = useState(false);
  const [discount, setDiscount] = useState('');
  const [brokerName, setBrokerName] = useState('');
  const [brokerageFee, setBrokerageFee] = useState('');
  const [sellingExpenseItems, setSellingExpenseItems] = useState<SellingExpenseItem[]>([]);
  const [terms, setTerms] = useState<Terms>(initialTerms);
  const [created, setCreated] = useState<Row>();
  const [error, setError] = useState<unknown>();
  const [showCustomer, setShowCustomer] = useState(false);
  const project = useQuery({
    queryKey: ['booking-project', projectId],
    enabled: !!projectId,
    queryFn: () => api<Row>(`/projects/${projectId}`),
  });
  useEffect(() => {
    setStep(0);
    setCustomer({});
    setUnit({});
    setSellingPrice('');
    setDiscount('');
    setApplyDiscount(false);
    setBrokerName('');
    setBrokerageFee('');
    setSellingExpenseItems([]);
    setTerms(initialTerms());
    setCreated(undefined);
    setError(undefined);
  }, [projectId, requestedUnitId]);
  useEffect(() => {
    if (requestedUnit.data?.id === requestedUnitId && requestedUnit.data.status === 'AVAILABLE') {
      setUnit(requestedUnit.data);
      setSellingPrice(String(requestedUnit.data.price));
    }
  }, [requestedUnit.data, requestedUnitId]);
  useUnsavedChanges(Boolean((customer.id || unit.id) && !created));
  const price = new Decimal(sellingPrice || 0);
  const effectiveDiscount = new Decimal(applyDiscount ? discount || 0 : 0);
  const brokerFee = new Decimal(brokerageFee || 0);
  const sellingExpensesTotal = sellingExpenseItems.reduce(
    (sum, item) => sum.plus(/^\d+(\.\d{1,2})?$/.test(item.amount) ? item.amount : 0),
    new Decimal(0),
  );
  const validSellingExpenses = sellingExpenseItems.every(
    (item) =>
      item.name.trim() &&
      /^(0|[1-9]\d{0,15})(\.\d{1,2})?$/.test(item.amount) &&
      new Decimal(item.amount).gt(0),
  );
  function addSellingExpense(name = '') {
    setSellingExpenseItems((items) =>
      items.length >= 100 ? items : [...items, { id: crypto.randomUUID(), name, amount: '' }],
    );
  }
  function updateSellingExpense(id: string, change: Partial<SellingExpenseItem>) {
    setSellingExpenseItems((items) =>
      items.map((item) => (item.id === id ? { ...item, ...change } : item)),
    );
  }
  const total = price.plus(String(unit.charges ?? 0)).minus(effectiveDiscount);
  const minimum = total
    .mul(String(project.data?.downPaymentPercent ?? 20))
    .div(100)
    .toDecimalPlaces(2, Decimal.ROUND_UP);
  const save = useMutation({
    mutationFn: () =>
      api<Row>(`/projects/${projectId}/bookings`, {
        method: 'POST',
        body: {
          customerId: customer.id,
          unitId: unit.id,
          sellingPrice: price.toFixed(2),
          discount: effectiveDiscount.toFixed(2),
          brokerName: brokerName.trim() || undefined,
          brokerageFee: brokerFee.toFixed(2),
          sellingExpenseItems: sellingExpenseItems.map((item) => ({
            id: item.id,
            name: item.name.trim(),
            amount: new Decimal(item.amount).toFixed(2),
          })),
          confirm: can('bookings.approve'),
          paymentType: terms.paymentType,
          ...(terms.paymentType === 'INSTALLMENTS' ? terms : {}),
        },
      }),
    onSuccess: (r) => {
      setCreated(row(r.booking));
      void queryClient.invalidateQueries();
    },
    onError: setError,
  });
  if (!can('bookings.create')) return <Unauthorized />;
  if (!projectId) return <ProjectRequired />;
  function next() {
    setError(undefined);
    if (step === 0 && (!customer.id || !unit.id || unit.status !== 'AVAILABLE'))
      return setError(new Error('Choose a customer and an available property.'));
    if (
      step === 1 &&
      (!price.gt(0) || effectiveDiscount.lt(0) || effectiveDiscount.gt(price) || !total.gt(0))
    )
      return setError(
        new Error('Enter a positive price and a discount that does not exceed the selling price.'),
      );
    if (step === 1 && brokerFee.gt(0) && !brokerName.trim())
      return setError(new Error('Enter the broker name when a brokerage fee is set.'));
    if (step === 1 && !validSellingExpenses)
      return setError(new Error('Enter a name and positive amount for every selling expense.'));
    if (step === 2 && terms.paymentType === 'INSTALLMENTS') {
      const down = new Decimal(terms.downPayment || 0);
      const rows = previewPlan(total, terms);
      if (
        down.lt(minimum) ||
        down.gte(total) ||
        !rows.length ||
        rows.some((r) => new Decimal(r.amount).lt('0.01')) ||
        terms.firstInstallmentDate < calendarDay(new Date())
      )
        return setError(
          new Error(
            `Down payment must be at least ${moneyWithWords(minimum)} and less than the total. Choose valid installment amounts and a current or future first due date.`,
          ),
        );
    }
    setStep(step + 1);
  }
  if (created)
    return (
      <section className="panel booking-complete">
        <CheckCircle2 size={44} />
        <h1>Booking Created Successfully</h1>
        <dl className="detail-grid">
          <div>
            <dt>{t('Customer')}</dt>
            <dd>{labelOf(customer)}</dd>
          </div>
          <div>
            <dt>{t('Property')}</dt>
            <dd>{labelOf(unit)}</dd>
          </div>
          <div>
            <dt>{t('Booking Number')}</dt>
            <dd>{String(created.reference)}</dd>
          </div>
          <div>
            <dt>{t('Payment Type')}</dt>
            <dd>{terms.paymentType === 'FULL_PAYMENT' ? 'Full Payment' : 'Installment Plan'}</dd>
          </div>
          {brokerName.trim() && (
            <div>
              <dt>{t('Broker')}</dt>
              <dd>{brokerName.trim()}</dd>
            </div>
          )}
          {brokerFee.gt(0) && (
            <div>
              <dt>{t('Brokerage fee')}</dt>
              <dd>
                <Money value={brokerFee} />
              </dd>
            </div>
          )}
          {sellingExpensesTotal.gt(0) && (
            <div>
              <dt>{t('Selling expenses')}</dt>
              <dd>
                <Money value={sellingExpensesTotal} />
              </dd>
            </div>
          )}
        </dl>
        <p>
          {created.status === 'CONFIRMED'
            ? 'The property is booked. You can now record the customer’s payment.'
            : 'The booking is saved. An employee with booking confirmation permission can confirm it directly.'}
        </p>
        <div className="form-footer">
          <Button asChild variant="secondary">
            <Link to="/bookings">Close</Link>
          </Button>
          <Button asChild>
            <Link to={'/bookings?record=' + created.id}>{t('View Booking')}</Link>
          </Button>
        </div>
      </section>
    );
  return (
    <>
      <PageHeading
        title="Create booking"
        description="Choose the customer, property and payment plan, then review the booking."
      />
      {requestedUnit.isError && (
        <ErrorState error={requestedUnit.error} retry={() => void requestedUnit.refetch()} />
      )}
      {requestedUnit.data && requestedUnit.data.status !== 'AVAILABLE' && (
        <ErrorState
          error={
            new Error('The selected property is no longer available. Choose another property.')
          }
        />
      )}
      <section className="booking-workspace">
        <ol className="setup-steps">
          {['Customer & property', 'Price & discount', 'Payment type', 'Review & confirm'].map(
            (label, i) => (
              <li key={label}>
                <button
                  disabled={i > step || save.isPending}
                  aria-current={i === step ? 'step' : undefined}
                  onClick={() => {
                    setStep(i);
                    setError(undefined);
                  }}
                >
                  <span>{i < step ? <CheckCircle2 size={16} /> : i + 1}</span>
                  {t(label)}
                </button>
              </li>
            ),
          )}
        </ol>
        <div className="booking-layout">
          <div className="panel booking-editor">
            <header className="workspace-card-heading">
              <div>
                <span className="workspace-eyebrow">
                  {t('Step')} {step + 1} / 4
                </span>
                <h2>
                  {t(
                    [
                      'Choose your customer and property',
                      'Set the booking amount',
                      'Plan the payments',
                      'Ready to book',
                    ][step],
                  )}
                </h2>
                <p>
                  {t(
                    [
                      'Connect the right customer with an available property.',
                      'Check the price and fees. Apply a discount if needed.',
                      'Choose full payment or build an installment schedule.',
                      'Check everything below. You can go back to make changes.',
                    ][step],
                  )}
                </p>
              </div>
              <span className="workspace-icon">
                <Building2 size={22} />
              </span>
            </header>
            <div
              key={step}
              className="form-grid booking-step-content"
              onChange={() => setError(undefined)}
            >
              {step === 0 && (
                <>
                  <div className="form-field">
                    <label htmlFor="booking-customer">{t('Customer')}</label>
                    <RelationSelect
                      id="booking-customer"
                      name="customerId"
                      value={String(customer.id ?? '')}
                      onChange={(id) => setCustomer({ id })}
                      onRecord={setCustomer}
                    />
                    {can('customers.create') && (
                      <Button variant="ghost" onClick={() => setShowCustomer(true)}>
                        {t('Add customer')}
                      </Button>
                    )}
                  </div>
                  <div className="form-field">
                    <label htmlFor="booking-property">{t('Property')}</label>
                    <RelationSelect
                      id="booking-property"
                      name="unitId"
                      statusFilter="AVAILABLE"
                      value={String(unit.id ?? '')}
                      onChange={(id) => {
                        if (id !== unit.id) {
                          setUnit({ id });
                          setSellingPrice('');
                        }
                      }}
                      onRecord={(r) => {
                        setUnit(r);
                        setSellingPrice((current) => current || String(r.price));
                      }}
                    />
                    <small>Only available properties can be booked.</small>
                  </div>
                </>
              )}
              {step === 1 && (
                <>
                  <label className="form-field">
                    Property selling price
                    <MoneyInput
                      min="0.01"
                      step="0.01"
                      disabled={!can('inventory.change_price')}
                      value={sellingPrice}
                      onValueChange={setSellingPrice}
                    />
                  </label>
                  <div className="form-field">
                    <span>{t('Additional property fees')}</span>
                    <strong>
                      <Money value={unit.charges} />
                    </strong>
                  </div>
                  {can('discounts.approve') && (
                    <label className="check-field form-full">
                      <input
                        type="checkbox"
                        checked={applyDiscount}
                        onChange={(e) => {
                          setApplyDiscount(e.target.checked);
                          if (!e.target.checked) setDiscount('');
                        }}
                      />
                      Apply Discount
                    </label>
                  )}
                  {applyDiscount && (
                    <label className="form-field">
                      {t('Discount amount')}
                      <MoneyInput
                        min="0"
                        max={sellingPrice}
                        step="0.01"
                        value={discount}
                        onValueChange={setDiscount}
                      />
                    </label>
                  )}
                  <label className="form-field">
                    {t('Broker name (optional)')}
                    <input
                      type="text"
                      maxLength={200}
                      value={brokerName}
                      onChange={(event) => setBrokerName(event.target.value)}
                      placeholder={t('Name of the broker who found the buyer')}
                    />
                  </label>
                  <label className="form-field">
                    {t('Brokerage fee')}
                    <MoneyInput
                      min="0"
                      step="0.01"
                      value={brokerageFee}
                      onValueChange={setBrokerageFee}
                    />
                  </label>
                  <small className="form-full">
                    {t(
                      'Brokerage is a selling cost paid by the business. It does not change the amount payable by the customer.',
                    )}
                  </small>
                  <section
                    className="booking-selling-expenses form-full"
                    aria-label={t('Selling expenses')}
                  >
                    <div className="booking-selling-expenses-header">
                      <div>
                        <strong>{t('Selling expenses')}</strong>
                        <small>
                          {t('Record costs paid by the business while selling this property.')}
                        </small>
                      </div>
                      <Button
                        variant="secondary"
                        size="small"
                        disabled={sellingExpenseItems.length >= 100}
                        onClick={() => addSellingExpense()}
                      >
                        <Plus size={14} /> {t('Add custom expense')}
                      </Button>
                    </div>
                    <div className="booking-expense-presets">
                      <small>{t('Quick Presets')}</small>
                      {SELLING_EXPENSE_PRESETS.map((preset) => (
                        <button
                          key={preset}
                          type="button"
                          disabled={sellingExpenseItems.length >= 100}
                          onClick={() => addSellingExpense(preset)}
                        >
                          + {t(preset)}
                        </button>
                      ))}
                    </div>
                    {sellingExpenseItems.map((item, index) => (
                      <div className="booking-expense-row" key={item.id}>
                        <label>
                          <span>
                            {t('Expense name')} {index + 1}
                          </span>
                          <input
                            value={item.name}
                            maxLength={200}
                            onChange={(event) =>
                              updateSellingExpense(item.id!, { name: event.target.value })
                            }
                          />
                        </label>
                        <label>
                          <span>{t('Amount')}</span>
                          <MoneyInput
                            value={item.amount}
                            min="0.01"
                            step="0.01"
                            onValueChange={(amount) => updateSellingExpense(item.id!, { amount })}
                          />
                        </label>
                        <button
                          type="button"
                          className="booking-expense-remove"
                          aria-label={t('Remove expense')}
                          onClick={() =>
                            setSellingExpenseItems((items) =>
                              items.filter((row) => row.id !== item.id),
                            )
                          }
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    ))}
                    <div className="booking-expense-total">
                      <span>{t('Selling expense subtotal')}</span>
                      <strong>
                        <Money value={sellingExpensesTotal} />
                      </strong>
                    </div>
                    <small>
                      {t(
                        'Selling expenses reduce profit and do not change the customer payment amount.',
                      )}
                    </small>
                  </section>
                  <p className="form-full">
                    Total payable:{' '}
                    <strong>
                      <Money value={total} />
                    </strong>
                  </p>
                </>
              )}
              {step === 2 && (
                <PaymentFields
                  value={terms}
                  onChange={(value) => {
                    setTerms(value);
                    setError(undefined);
                  }}
                  total={total}
                  minimum={minimum.toFixed(2)}
                />
              )}
              {step === 3 && (
                <div className="form-full">
                  <h2>Review booking</h2>
                  <dl className="detail-grid">
                    {Object.entries({
                      Customer: labelOf(customer),
                      Property: labelOf(unit),
                      'Selling price': moneyWithWords(price),
                      Fees: moneyWithWords(unit.charges),
                      Discount: moneyWithWords(effectiveDiscount),
                      ...(brokerName.trim() ? { Broker: brokerName.trim() } : {}),
                      ...(brokerFee.gt(0) ? { 'Brokerage fee': moneyWithWords(brokerFee) } : {}),
                      ...(sellingExpensesTotal.gt(0)
                        ? { 'Selling expenses': moneyWithWords(sellingExpensesTotal) }
                        : {}),
                      'Total payable': moneyWithWords(total),
                      'Payment type':
                        terms.paymentType === 'FULL_PAYMENT' ? 'Full Payment' : 'Installment Plan',
                      ...(terms.paymentType === 'INSTALLMENTS'
                        ? {
                            'Down payment': moneyWithWords(terms.downPayment),
                            Installments: String(terms.installmentCount),
                            'First installment': terms.firstInstallmentDate,
                          }
                        : {}),
                    }).map(([k, v]) => (
                      <div key={k}>
                        <dt>{k}</dt>
                        <dd>{v}</dd>
                      </div>
                    ))}
                  </dl>
                  {sellingExpenseItems.length > 0 && (
                    <SellingExpenses
                      items={sellingExpenseItems}
                      total={sellingExpensesTotal.toFixed(2)}
                    />
                  )}
                </div>
              )}
            </div>
            {(error || project.error) && <ErrorState error={error || project.error} />}
            <div className="form-footer">
              <Button
                variant="secondary"
                disabled={!step || save.isPending}
                onClick={() => {
                  setStep(step - 1);
                  setError(undefined);
                }}
              >
                {t('Back')}
              </Button>
              {step < 3 ? (
                <Button onClick={next} disabled={project.isPending}>
                  {t('Continue')}
                  <ArrowRight size={15} />
                </Button>
              ) : (
                <Button busy={save.isPending} onClick={() => save.mutate()}>
                  {can('bookings.approve') ? 'Confirm Booking' : 'Save Booking'}
                </Button>
              )}
            </div>
          </div>
          <aside className="panel booking-recap" aria-label={t('Booking summary')}>
            <div className="workspace-eyebrow">{t('Booking summary')}</div>
            <h2>{String(project.data?.name ?? t('Your booking'))}</h2>
            <div className="booking-recap-identity">
              <span className="summary-avatar">
                <RecordImage
                  id={customer.photoId ? String(customer.photoId) : undefined}
                  fallback={<UserRound size={21} />}
                />
              </span>
              <div>
                <small>{t('Customer')}</small>
                <strong>{customer.id ? labelOf(customer) : t('Choose a customer')}</strong>
              </div>
            </div>
            <div className="booking-recap-identity">
              <span className="summary-avatar">
                <RecordImage
                  id={unit.photoId ? String(unit.photoId) : undefined}
                  fallback={<Building2 size={21} />}
                />
              </span>
              <div>
                <small>{t('Property')}</small>
                <strong>{unit.id ? labelOf(unit) : t('Choose a property')}</strong>
              </div>
            </div>
            <dl className="booking-costs">
              <div>
                <dt>{t('Selling price')}</dt>
                <dd>{unit.id ? <Money value={price} /> : '—'}</dd>
              </div>
              <div>
                <dt>{t('Additional property fees')}</dt>
                <dd>{unit.id ? <Money value={unit.charges} /> : '—'}</dd>
              </div>
              {applyDiscount && (
                <div>
                  <dt>{t('Discount')}</dt>
                  <dd>
                    −<Money value={effectiveDiscount} />
                  </dd>
                </div>
              )}
              {brokerName.trim() && (
                <div>
                  <dt>{t('Broker')}</dt>
                  <dd>{brokerName.trim()}</dd>
                </div>
              )}
              {brokerFee.gt(0) && (
                <div>
                  <dt>{t('Brokerage fee')}</dt>
                  <dd>
                    <Money value={brokerFee} />
                  </dd>
                </div>
              )}
              {sellingExpensesTotal.gt(0) && (
                <div>
                  <dt>{t('Selling expenses')}</dt>
                  <dd>
                    <Money value={sellingExpensesTotal} />
                  </dd>
                </div>
              )}
              <div className="booking-grand-total">
                <dt>{t('Total payable')}</dt>
                <dd>{unit.id ? <Money value={total} /> : '—'}</dd>
              </div>
            </dl>
            {step >= 2 && (
              <p className="summary-payment-type">
                {terms.paymentType === 'FULL_PAYMENT' ? t('Full Payment') : t('Installment Plan')}
              </p>
            )}
            <p className="booking-save-note">
              <ShieldCheck size={17} />
              {t('Your booking is saved only after the final confirmation.')}
            </p>
          </aside>
        </div>
      </section>
      {showCustomer && (
        <OperationDialog
          operation={operation('post', projectRoot + '/customers')}
          title="Add customer"
          onClose={() => setShowCustomer(false)}
          onSuccess={(v) => {
            setCustomer(row(v));
            setShowCustomer(false);
          }}
        />
      )}
    </>
  );
}

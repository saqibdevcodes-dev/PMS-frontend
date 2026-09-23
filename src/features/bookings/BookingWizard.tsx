import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import Decimal from 'decimal.js';
import { ArrowLeft, ArrowRight, Check, ShieldCheck, Clock3, Building2 } from 'lucide-react';
import { toast } from 'sonner';
import { useUnsavedChanges } from '../../hooks/use-unsaved';
import { api, ApiError } from '../../lib/api';
import { queryClient } from '../../lib/query';
import { usePreferences } from '../../stores/preferences';
import { can } from '../../stores/auth';
import { row, asRows, type Row } from '../../lib/types';
import { money, labelOf } from '../../lib/format';
import { RelationSelect } from '../../components/RelationSelect';
import { Button, PageHeading, ErrorState, Badge } from '../../components/ui';
import { ProjectRequired, Unauthorized } from '../resources/ResourcePage';
export default function BookingWizard() {
  const projectId = usePreferences((s) => s.projectId);
  const projectName = usePreferences((s) => s.projectName);
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [customer, setCustomer] = useState<Row>({});
  const [unit, setUnit] = useState<Row>({});
  const [plan, setPlan] = useState<Row>({});
  const [reservation, setReservation] = useState<Row>();
  const [discount, setDiscount] = useState('0');
  const [discountApproval, setDiscountApproval] = useState('');
  const [dealer, setDealer] = useState('');
  const [owners, setOwners] = useState<{ customerId: string; share: string }[]>([]);
  const [error, setError] = useState<unknown>();
  const [agreed, setAgreed] = useState(false);
  const [created, setCreated] = useState<Row>();
  useEffect(() => {
    setStep(0);
    setCustomer({});
    setUnit({});
    setReservation(undefined);
    setPlan({});
    setOwners([]);
    setDealer('');
    setDiscount('0');
    setDiscountApproval('');
    setError(undefined);
    setCreated(undefined);
    setAgreed(false);
  }, [projectId]);
  useUnsavedChanges(Boolean((customer.id || unit.id || reservation) && !created));
  const reserve = useMutation({
    mutationFn: () =>
      api<Row>(`/projects/${projectId}/reservations`, {
        method: 'POST',
        body: { unitId: unit.id, customerId: customer.id },
      }),
    onSuccess: (r) => {
      setReservation(r);
      setError(undefined);
      void queryClient.invalidateQueries();
    },
    onError: setError,
  });
  const create = useMutation({
    mutationFn: () =>
      api<Row>(`/projects/${projectId}/bookings`, {
        method: 'POST',
        body: {
          reservationId: reservation?.id,
          planVersionId: plan.id,
          discount,
          ...(new Decimal(discount).gt(0) ? { discountApprovalId: discountApproval } : {}),
          ...(dealer ? { dealerId: dealer } : {}),
          ...(owners.length ? { owners } : {}),
        },
      }),
    onSuccess: (r) => {
      setCreated(r);
      void queryClient.invalidateQueries();
      toast.success('Booking submitted for approval');
    },
    onError: setError,
  });
  if (!can('bookings.create') || !can('reservations.create')) return <Unauthorized />;
  if (!projectId) return <ProjectRequired />;
  let total = new Decimal(String(unit.price ?? 0)).plus(String(unit.charges ?? 0));
  try {
    total = total.minus(discount);
  } catch {
    /* Validation is shown before continuing. */
  }
  const schedule = asRows(plan.schedule);
  let assigned = new Decimal(0);
  const preview: Row[] = schedule.map((part, i) => {
    const amount =
      i === schedule.length - 1
        ? total.minus(assigned)
        : total.mul(String(part.percent)).div(100).toDecimalPlaces(2);
    assigned = assigned.plus(amount);
    return { ...part, amount: amount.toFixed(2) };
  });
  const steps = ['Customer & property', 'Reservation', 'Payment plan', 'Review & submit'];
  const uncertain = error instanceof ApiError && error.status === 0;
  return (
    <>
      <PageHeading
        eyebrow="Sales & customers / Bookings"
        title={created ? 'A new chapter, started.' : 'Create a booking'}
        description={
          created
            ? 'Your booking is recorded and awaiting its required approvals.'
            : 'A guided path from the right property to a new agreement.'
        }
        actions={
          <Button asChild variant="secondary">
            <Link to="/bookings">
              <ArrowLeft size={16} />
              All bookings
            </Link>
          </Button>
        }
      />
      {created ? (
        <section className="panel success-panel">
          <ShieldCheck size={46} />
          <h2>{String(row(created.booking).reference ?? 'Booking created')}</h2>
          <Badge value={row(created.booking).status} />
          <p>Approval and cleared down payment are required before confirmation.</p>
          <div className="detail-grid">
            <div>
              <span>Booking ID</span>
              <code>{String(row(created.booking).id)}</code>
            </div>
            <div>
              <span>Approval ID</span>
              <code>{String(row(created.approval).id)}</code>
            </div>
          </div>
          <Button onClick={() => navigate('/bookings?record=' + row(created.booking).id)}>
            View booking
            <ArrowRight size={16} />
          </Button>
        </section>
      ) : (
        <div className="wizard-layout">
          <section className="panel wizard-main">
            <ol className="wizard-steps">
              {steps.map((label, i) => (
                <li key={label} className={step === i ? 'current' : step > i ? 'completed' : ''}>
                  <span>{step > i ? <Check size={16} /> : i + 1}</span>
                  <strong>{label}</strong>
                </li>
              ))}
            </ol>
            <div className="wizard-body">
              <span className="eyebrow">STEP {step + 1} OF 4</span>
              <h2>{steps[step]}</h2>
              {step === 0 ? (
                <>
                  <p className="muted">
                    Choose an existing customer and an available property. Availability is rechecked
                    when you reserve.
                  </p>
                  <div className="form-grid">
                    <div className="form-field">
                      <label htmlFor="wizard-customer">Customer *</label>
                      <RelationSelect
                        id="wizard-customer"
                        name="customerId"
                        disabled={Boolean(reservation)}
                        value={String(customer.id ?? '')}
                        onChange={(id) => {
                          setCustomer({ id });
                          setReservation(undefined);
                        }}
                        onRecord={setCustomer}
                      />
                    </div>
                    <div className="form-field">
                      <label htmlFor="wizard-unit">Property *</label>
                      <RelationSelect
                        id="wizard-unit"
                        name="unitId"
                        disabled={Boolean(reservation)}
                        value={String(unit.id ?? '')}
                        onChange={(id) => {
                          setUnit({ id });
                          setReservation(undefined);
                        }}
                        onRecord={setUnit}
                      />
                    </div>
                  </div>
                  {Boolean(unit.status) && unit.status !== 'AVAILABLE' && (
                    <ErrorState
                      error={new Error('This property is not available. Choose another unit.')}
                    />
                  )}
                </>
              ) : step === 1 ? (
                <>
                  <p className="muted">
                    Hold this property for your customer while you prepare the booking.
                  </p>
                  <div className="reservation-card">
                    <Clock3 size={26} />
                    <div>
                      <h3>{reservation ? 'Property reserved' : 'Ready to reserve'}</h3>
                      <p>
                        {reservation
                          ? `Expires ${new Date(String(reservation.expiresAt)).toLocaleString()}`
                          : 'The project’s reservation period starts when the server confirms the hold.'}
                      </p>
                      {reservation && <Badge value={reservation.status} />}
                    </div>
                  </div>
                  {!reservation && (
                    <Button
                      busy={reserve.isPending}
                      disabled={uncertain}
                      onClick={() => reserve.mutate()}
                    >
                      Reserve this property
                    </Button>
                  )}
                </>
              ) : step === 2 ? (
                <>
                  <p className="muted">
                    Choose a versioned payment schedule. Discount approval must match this property
                    and amount.
                  </p>
                  <div className="form-grid">
                    <div className="form-field form-full">
                      <label htmlFor="wizard-plan">Payment plan version *</label>
                      <RelationSelect
                        id="wizard-plan"
                        name="planVersionId"
                        value={String(plan.id ?? '')}
                        onChange={(id) => setPlan({ id })}
                        onRecord={setPlan}
                      />
                    </div>
                    <div className="form-field">
                      <label htmlFor="wizard-discount">Discount amount</label>
                      <input
                        id="wizard-discount"
                        inputMode="decimal"
                        value={discount}
                        onChange={(e) => setDiscount(e.target.value)}
                      />
                    </div>
                    {discount !== '0' && (
                      <div className="form-field">
                        <label htmlFor="wizard-discount-approval">Approved discount</label>
                        <RelationSelect
                          id="wizard-discount-approval"
                          name="discountApprovalId"
                          entityId={unit.id}
                          value={discountApproval}
                          onChange={setDiscountApproval}
                        />
                      </div>
                    )}
                    <div className="form-field">
                      <label htmlFor="wizard-dealer">Dealer (optional)</label>
                      <RelationSelect
                        id="wizard-dealer"
                        name="dealerId"
                        value={dealer}
                        onChange={setDealer}
                      />
                    </div>
                  </div>
                  <div className="plan-preview">
                    {preview.map((p, i) => (
                      <div key={i}>
                        <span>
                          {String(p.label)}
                          <small>
                            {String(p.percent)}% · {Number(p.days ?? 0)} days /{' '}
                            {Number(p.months ?? 0)} months
                          </small>
                        </span>
                        <strong>{money(p.amount)}</strong>
                      </div>
                    ))}
                  </div>
                  <fieldset className="form-section">
                    <legend>Ownership</legend>
                    <p className="muted">
                      The selected customer owns 100% unless you specify joint owners. Shares must
                      total 100% and include the primary customer.
                    </p>
                    {owners.map((owner, index) => (
                      <div className="ownership-row" key={index}>
                        <div className="form-field">
                          <label htmlFor={'owner-' + index}>Owner {index + 1}</label>
                          <RelationSelect
                            id={'owner-' + index}
                            name="customerId"
                            value={owner.customerId}
                            onChange={(customerId) =>
                              setOwners((current) =>
                                current.map((v, i) => (i === index ? { ...v, customerId } : v)),
                              )
                            }
                          />
                        </div>
                        <div className="form-field">
                          <label htmlFor={'share-' + index}>Share %</label>
                          <input
                            id={'share-' + index}
                            inputMode="decimal"
                            value={owner.share}
                            onChange={(e) =>
                              setOwners((current) =>
                                current.map((v, i) =>
                                  i === index ? { ...v, share: e.target.value } : v,
                                ),
                              )
                            }
                          />
                        </div>
                        <Button
                          variant="ghost"
                          size="small"
                          onClick={() =>
                            setOwners((current) => current.filter((_, i) => i !== index))
                          }
                        >
                          Remove owner {index + 1}
                        </Button>
                      </div>
                    ))}
                    <Button
                      variant="secondary"
                      disabled={owners.length >= 20}
                      onClick={() =>
                        setOwners((current) =>
                          current.length
                            ? [...current, { customerId: '', share: '' }]
                            : [
                                { customerId: customer.id!, share: '50' },
                                { customerId: '', share: '50' },
                              ],
                        )
                      }
                    >
                      Add joint owners
                    </Button>
                  </fieldset>
                </>
              ) : (
                <>
                  <div className="review-notice">
                    <ShieldCheck size={23} />
                    <div>
                      <strong>Ready for your final review</strong>
                      <p>
                        This creates a draft booking and approval request. It does not confirm a
                        sale.
                      </p>
                    </div>
                  </div>
                  <dl className="detail-grid">
                    <div>
                      <dt>Customer</dt>
                      <dd>{labelOf(customer)}</dd>
                    </div>
                    <div>
                      <dt>Unit</dt>
                      <dd>{labelOf(unit)}</dd>
                    </div>
                    <div>
                      <dt>Payment plan</dt>
                      <dd>{labelOf(plan)}</dd>
                    </div>
                    <div>
                      <dt>Booking value</dt>
                      <dd>{money(total.toFixed(2))}</dd>
                    </div>
                  </dl>
                  {owners.length > 0 && (
                    <p className="muted">
                      {owners.length} owners · {owners.map((o) => o.share + '%').join(' / ')}
                    </p>
                  )}
                  <label className="confirmation-check">
                    <input
                      type="checkbox"
                      checked={agreed}
                      onChange={(e) => setAgreed(e.target.checked)}
                    />
                    I have reviewed the customer, property, price, and payment plan.
                  </label>
                </>
              )}
              {Boolean(error) && <ErrorState error={error} />}
            </div>
            <footer className="wizard-footer">
              <Button
                variant="secondary"
                disabled={step === 0 || create.isPending || reserve.isPending || uncertain}
                onClick={() => {
                  setError(undefined);
                  setStep(step - 1);
                }}
              >
                Back
              </Button>
              {step < 3 ? (
                <Button
                  disabled={
                    (step === 0 && (!customer.id || !unit.id || unit.status !== 'AVAILABLE')) ||
                    (step === 1 && !reservation) ||
                    (step === 2 && !plan.id)
                  }
                  onClick={() => {
                    setError(undefined);
                    if (step === 2) {
                      try {
                        if (
                          owners.length &&
                          (!owners.some((o) => o.customerId === customer.id) ||
                            new Set(owners.map((o) => o.customerId)).size !== owners.length ||
                            owners.some(
                              (o) =>
                                !o.customerId ||
                                !/^\d+(\.\d{1,2})?$/.test(o.share) ||
                                new Decimal(o.share).lte(0),
                            ) ||
                            !owners.reduce((sum, o) => sum.plus(o.share), new Decimal(0)).eq(100))
                        )
                          throw new Error(
                            'Select unique joint owners, include the primary customer, and make shares total 100%.',
                          );
                        if (
                          !/^\d+(\.\d{1,2})?$/.test(discount) ||
                          total.lte(0) ||
                          (new Decimal(discount).gt(0) && !discountApproval)
                        )
                          throw new Error(
                            'Enter a valid discount and select its approval, or use zero.',
                          );
                      } catch (e) {
                        setError(e);
                        return;
                      }
                    }
                    setStep(step + 1);
                  }}
                >
                  Continue
                  <ArrowRight size={16} />
                </Button>
              ) : (
                <Button
                  disabled={!agreed || uncertain}
                  busy={create.isPending}
                  onClick={() => create.mutate()}
                >
                  Submit booking for approval
                  <ArrowRight size={16} />
                </Button>
              )}
            </footer>
          </section>
          <aside className="panel booking-summary">
            <div className="booking-summary-top">
              <Building2 size={25} />
              <span>BOOKING SUMMARY</span>
            </div>
            <h3>{projectName}</h3>
            <div className="summary-property">
              {unit.id ? labelOf(unit) : 'Your selected property'}
              <small>
                {unit.type
                  ? String(unit.type).replaceAll('_', ' ')
                  : 'Choose a unit to get started'}
              </small>
            </div>
            <dl>
              <div>
                <dt>Base price</dt>
                <dd>{money(unit.price)}</dd>
              </div>
              <div>
                <dt>Additional charges</dt>
                <dd>{money(unit.charges)}</dd>
              </div>
              <div>
                <dt>Discount</dt>
                <dd>{money(discount)}</dd>
              </div>
              <div className="summary-total">
                <dt>Booking value</dt>
                <dd>{money(total.toFixed(2))}</dd>
              </div>
            </dl>
            <p>
              <ShieldCheck size={15} />
              Final amounts and schedule are validated by the server.
            </p>
            {reservation && <small>Reservation {String(reservation.id).slice(0, 8)}</small>}
          </aside>
        </div>
      )}
    </>
  );
}

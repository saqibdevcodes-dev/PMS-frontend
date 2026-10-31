import { MoneyInput } from '../../components/MoneyInput';
import { Money } from '../../components/Money';
import { exactMoney, moneyPayload } from '../../lib/exact-money';
import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { CheckCircle2, RotateCcw } from 'lucide-react';
import { toast } from 'sonner';
import { t, useLocale } from '../../lib/i18n';
import { api } from '../../lib/api';

import { errorMessage } from '../../lib/error-messages';
import { usePreferences } from '../../stores/preferences';
import { Modal, Button, Badge, ErrorState } from '../../components/ui';

interface UnassignPropertyModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  unitId?: string;
  unitNumber?: string;
  bookingId?: string;
  bookingReference?: string;
  customerName?: string;
  initialCollected?: number | string;
}

interface UnassignPreview {
  unitId: string;
  unitNumber: string;
  unitStatus: string;
  booking: {
    id: string;
    reference: string;
    total: string;
    customer: { id: string; name: string; phone?: string; reference?: string };
    collected: string;
  } | null;
}

export function UnassignPropertyModal({
  open,
  onClose,
  onSuccess,
  unitId,
  unitNumber,
  bookingId,
  bookingReference,
  customerName,
  initialCollected,
}: UnassignPropertyModalProps) {
  useLocale();
  const queryClient = useQueryClient();
  const projectId = usePreferences((s) => s.projectId);
  const currency = usePreferences((s) => s.currency);

  const [refundMode, setRefundMode] = useState<'FULL' | 'CUSTOM'>('FULL');
  const [customRefundAmount, setCustomRefundAmount] = useState<string>('');
  const [reason, setReason] = useState('Customer requested booking retraction and refund');

  // Preview query if unitId is provided
  const previewQuery = useQuery({
    queryKey: ['unassign-preview', projectId, unitId],
    enabled: open && !!projectId && !!unitId,
    queryFn: ({ signal }) =>
      api<UnassignPreview>(`/projects/${projectId}/units/${unitId}/unassign-preview`, { signal }),
  });

  const preview = previewQuery.data;
  const bookingQuery = useQuery({
    queryKey: ['unassign-booking', projectId, bookingId],
    enabled: open && Boolean(projectId && bookingId && !unitId),
    queryFn: ({ signal }) =>
      api<{
        reference: string;
        unit?: { number: string };
        customer?: { name: string };
        position: { collected: string };
      }>(`/projects/${projectId}/bookings/${bookingId}`, { signal }),
  });
  const canonicalBooking = bookingQuery.data;
  const activeBooking = preview?.booking;
  const effectiveCollected = String(
    activeBooking?.collected ?? canonicalBooking?.position.collected ?? initialCollected ?? '0',
  );
  const effectiveBookingRef =
    activeBooking?.reference ?? canonicalBooking?.reference ?? bookingReference ?? '—';
  const effectiveCustomerName =
    activeBooking?.customer?.name ?? canonicalBooking?.customer?.name ?? customerName ?? 'Customer';
  const effectiveUnitNumber =
    preview?.unitNumber ?? canonicalBooking?.unit?.number ?? unitNumber ?? 'Property';

  useEffect(() => {
    if (refundMode === 'FULL') {
      setCustomRefundAmount(effectiveCollected);
    }
  }, [refundMode, effectiveCollected]);

  const numRefund =
    refundMode === 'FULL'
      ? effectiveCollected
      : exactMoney(customRefundAmount).clamp(0, effectiveCollected).toFixed(2);
  const numDeduction = exactMoney(effectiveCollected).minus(numRefund).toFixed(2);

  const unassignMutation = useMutation({
    mutationFn: async () => {
      const endpoint = unitId
        ? `/projects/${projectId}/units/${unitId}/unassign`
        : `/projects/${projectId}/bookings/${bookingId}/unassign`;

      return api(endpoint, {
        method: 'POST',
        body: {
          refundMode,
          customRefundAmount:
            refundMode === 'CUSTOM' ? moneyPayload(customRefundAmount) : undefined,
          customDeduction: refundMode === 'CUSTOM' ? moneyPayload(numDeduction) : undefined,
          reason: reason.trim(),
        },
      });
    },
    onSuccess: () => {
      toast.success(
        t('Booking retracted and property {unit} is now AVAILABLE', { unit: effectiveUnitNumber }),
      );
      void queryClient.invalidateQueries({ queryKey: ['units'] });
      void queryClient.invalidateQueries({ queryKey: ['bookings'] });
      void queryClient.invalidateQueries({ queryKey: ['detail'] });
      void queryClient.invalidateQueries({ queryKey: ['overview'] });
      onSuccess();
      onClose();
    },
    onError: (err) => {
      toast.error(errorMessage(err));
    },
  });

  return (
    <Modal
      open={open}
      onOpenChange={(v) => !v && onClose()}
      beforeClose={() => !unassignMutation.isPending}
      title={t('Unassign Property & Retract Booking')}
      description={t(
        'Retract booking, process customer return bracket, and reset property status to Available',
      )}
      wide
    >
      <div className="modal-body dialog-stack">
        {previewQuery.isError && (
          <ErrorState error={previewQuery.error} retry={() => void previewQuery.refetch()} />
        )}
        {bookingQuery.isError && (
          <ErrorState error={bookingQuery.error} retry={() => void bookingQuery.refetch()} />
        )}
        {/* Booking summary banner */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: 12,
            padding: '14px 16px',
            borderRadius: 8,
            background: 'var(--subtle)',
            border: '1px solid var(--border)',
          }}
        >
          <div>
            <span style={{ fontSize: 12, color: 'var(--muted)', display: 'block' }}>
              {t('Property Unit')}
            </span>
            <strong style={{ fontSize: 15, color: 'var(--text)' }}>{effectiveUnitNumber}</strong>
          </div>
          <div>
            <span style={{ fontSize: 12, color: 'var(--muted)', display: 'block' }}>
              {t('Customer')}
            </span>
            <strong style={{ fontSize: 15, color: 'var(--text)' }}>{effectiveCustomerName}</strong>
          </div>
          <div>
            <span style={{ fontSize: 12, color: 'var(--muted)', display: 'block' }}>
              {t('Booking Reference')}
            </span>
            <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)' }}>
              {effectiveBookingRef}
            </span>
          </div>
          <div>
            <span style={{ fontSize: 12, color: 'var(--muted)', display: 'block' }}>
              {t('Total Cleared Collections')}
            </span>
            <strong style={{ fontSize: 16, color: 'var(--primary)' }}>
              <Money value={effectiveCollected} currency={currency} />
            </strong>
          </div>
        </div>

        {/* Refund Mode Selection */}
        <div>
          <label
            style={{
              fontSize: 13,
              fontWeight: 700,
              color: 'var(--text)',
              marginBottom: 8,
              display: 'block',
            }}
          >
            {t('Choose Retraction & Refund Method')}
          </label>
          <div className="dialog-option-grid">
            <button
              type="button"
              onClick={() => setRefundMode('FULL')}
              aria-pressed={refundMode === 'FULL'}
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: 4,
                padding: '12px 14px',
                borderRadius: 8,
                border:
                  refundMode === 'FULL' ? '2px solid var(--primary)' : '1px solid var(--border)',
                background:
                  refundMode === 'FULL'
                    ? 'color-mix(in srgb, var(--primary) 10%, transparent)'
                    : 'var(--surface)',
                cursor: 'pointer',
                textAlign: 'start',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <CheckCircle2
                  size={18}
                  style={{ color: refundMode === 'FULL' ? 'var(--primary)' : 'var(--muted)' }}
                />
                <strong style={{ fontSize: 14, color: 'var(--text)' }}>
                  {t('Full Amount Retract (100% Refund)')}
                </strong>
              </div>
              <span style={{ fontSize: 12, color: 'var(--muted)', paddingInlineStart: 26 }}>
                {t('Return 100% of all cleared customer payments with 0 deduction')}
              </span>
            </button>

            <button
              type="button"
              aria-pressed={refundMode === 'CUSTOM'}
              onClick={() => {
                setRefundMode('CUSTOM');
                if (!customRefundAmount && exactMoney(effectiveCollected).gt(0)) {
                  setCustomRefundAmount(String(effectiveCollected));
                }
              }}
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: 4,
                padding: '12px 14px',
                borderRadius: 8,
                border:
                  refundMode === 'CUSTOM' ? '2px solid var(--primary)' : '1px solid var(--border)',
                background:
                  refundMode === 'CUSTOM'
                    ? 'color-mix(in srgb, var(--primary) 10%, transparent)'
                    : 'var(--surface)',
                cursor: 'pointer',
                textAlign: 'start',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <CheckCircle2
                  size={18}
                  style={{ color: refundMode === 'CUSTOM' ? 'var(--primary)' : 'var(--muted)' }}
                />
                <strong style={{ fontSize: 14, color: 'var(--text)' }}>
                  {t('Custom Return Price Bracket')}
                </strong>
              </div>
              <span style={{ fontSize: 12, color: 'var(--muted)', paddingInlineStart: 26 }}>
                {t('Specify custom returning amount or penalty deduction')}
              </span>
            </button>
          </div>
        </div>

        {/* Custom Price Bracket Inputs */}
        {refundMode === 'CUSTOM' && (
          <div
            style={{
              padding: '14px 16px',
              borderRadius: 8,
              border: '1px solid var(--border)',
              background: 'var(--surface)',
              display: 'flex',
              flexDirection: 'column',
              gap: 12,
            }}
          >
            <div className="dialog-inline-options">
              <label
                htmlFor="custom-return-input"
                style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)' }}
              >
                {t('Customer Return Amount')}
              </label>
              {/* Quick bracket percentages */}
              <div className="dialog-inline-options">
                {[1, 0.9, 0.75, 0.5, 0].map((ratio) => (
                  <button
                    key={ratio}
                    type="button"
                    onClick={() =>
                      setCustomRefundAmount(
                        exactMoney(effectiveCollected).mul(String(ratio)).toFixed(2),
                      )
                    }
                    style={{
                      padding: '3px 8px',
                      fontSize: 11,
                      fontWeight: 600,
                      borderRadius: 4,
                      border: '1px solid var(--border)',
                      background: 'var(--subtle)',
                      color: 'var(--text)',
                      cursor: 'pointer',
                    }}
                  >
                    {ratio === 1 ? '100%' : ratio === 0 ? t('0% (No refund)') : `${ratio * 100}%`}
                  </button>
                ))}
              </div>
            </div>

            <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
              <MoneyInput
                id="custom-return-input"
                min={0}
                max={effectiveCollected}
                value={customRefundAmount}
                placeholder="0"
                style={{
                  flex: 1,
                  padding: '8px 12px',
                  borderRadius: 6,
                  border: '1px solid var(--border)',
                  background: 'var(--surface)',
                  color: 'var(--text)',
                  fontSize: 14,
                }}
                onValueChange={setCustomRefundAmount}
              />
              <span style={{ fontSize: 13, color: 'var(--muted)', fontWeight: 600 }}>
                {currency}
              </span>
            </div>
          </div>
        )}

        {/* Financial Breakdown Preview */}
        <div
          style={{
            padding: '12px 16px',
            borderRadius: 8,
            background: 'color-mix(in srgb, var(--primary) 8%, transparent)',
            border: '1px solid color-mix(in srgb, var(--primary) 25%, transparent)',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
            gap: 12,
            alignItems: 'center',
          }}
        >
          <div>
            <span
              style={{
                fontSize: 11,
                color: 'var(--muted)',
                display: 'block',
                textTransform: 'uppercase',
              }}
            >
              {t('Return to customer')}
            </span>
            <strong style={{ fontSize: 16, color: 'var(--success, #16a34a)' }}>
              <Money value={numRefund} currency={currency} />
            </strong>
          </div>
          <div>
            <span
              style={{
                fontSize: 11,
                color: 'var(--muted)',
                display: 'block',
                textTransform: 'uppercase',
              }}
            >
              {t('Retained deduction / fee')}
            </span>
            <strong
              style={{
                fontSize: 16,
                color: exactMoney(numDeduction).gt(0) ? 'var(--danger, #dc2626)' : 'var(--muted)',
              }}
            >
              <Money value={numDeduction} currency={currency} />
            </strong>
          </div>
          <div>
            <span
              style={{
                fontSize: 11,
                color: 'var(--muted)',
                display: 'block',
                textTransform: 'uppercase',
              }}
            >
              {t('Resulting property status')}
            </span>
            <Badge value="AVAILABLE" />
          </div>
        </div>

        {/* Reason / Notes */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <label
            htmlFor="unassign-reason-input"
            style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)' }}
          >
            {t('Retraction Reason & Administrative Notes')}
          </label>
          <textarea
            id="unassign-reason-input"
            rows={2}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder={t('Reason for booking retraction...')}
            style={{
              padding: '8px 12px',
              borderRadius: 6,
              border: '1px solid var(--border)',
              background: 'var(--surface)',
              color: 'var(--text)',
              fontSize: 13,
              fontFamily: 'inherit',
              resize: 'vertical',
            }}
          />
        </div>

        {/* Modal actions */}
        <div className="dialog-actions">
          <Button
            type="button"
            variant="secondary"
            onClick={onClose}
            disabled={unassignMutation.isPending}
          >
            {t('Cancel')}
          </Button>
          <Button
            type="button"
            variant="primary"
            busy={unassignMutation.isPending}
            disabled={
              unitId
                ? previewQuery.isFetching || previewQuery.isError
                : Boolean(bookingId) && (bookingQuery.isFetching || bookingQuery.isError)
            }
            onClick={() => unassignMutation.mutate()}
            style={{ gap: 6 }}
          >
            <RotateCcw size={15} />
            {t('Confirm Unassign & Retract')}
          </Button>
        </div>
      </div>
    </Modal>
  );
}

import { useQuery } from '@tanstack/react-query';
import { api } from '../../lib/api';
import { asRows, row, type Row } from '../../lib/types';
import { usePreferences } from '../../stores/preferences';
import { Money } from '../../components/Money';
import { DataTable } from '../../components/DataTable';
import { ErrorState, EmptyState, Skeleton } from '../../components/ui';
import { humanize } from '../../lib/format';

function FinancialCards({ values }: { values: Row }) {
  return (
    <div className="position-cards">
      {Object.entries(values).map(([key, value]) => (
        <div key={key}>
          <span>{humanize(key)}</span>
          <strong>{value == null ? '—' : <Money value={String(value)} />}</strong>
        </div>
      ))}
    </div>
  );
}

export function PropertyFinancialSummary({ unitId }: { unitId: string }) {
  const projectId = usePreferences((state) => state.projectId);
  const query = useQuery({
    queryKey: ['property-financial-summary', projectId, unitId],
    enabled: Boolean(projectId && unitId),
    queryFn: ({ signal }) =>
      api<Row>(`/projects/${projectId}/units/${unitId}/financial-summary`, { signal }),
  });
  if (query.isLoading) return <Skeleton />;
  if (query.isError) return <ErrorState error={query.error} retry={() => void query.refetch()} />;
  const data = row(query.data);
  const purchase = row(data.purchase);
  const expenses = row(data.expenses);
  const sale = row(data.sale);
  const profitability = row(data.profitability);
  if (
    !Object.keys(purchase).length &&
    !Object.keys(sale).length &&
    !asRows(expenses.records).length
  )
    return (
      <EmptyState
        title="No financial activity"
        description="Post a purchase, expense or sale to build this property’s financial history."
      />
    );
  return (
    <div className="detail-section">
      {Object.keys(purchase).length > 0 && (
        <>
          <h4>Purchase and supplier position</h4>
          <FinancialCards
            values={{
              purchasePrice: purchase.purchasePrice,
              acquisitionCost: purchase.acquisitionCost,
              paidToSupplier: purchase.paidToSupplier,
              supplierOutstanding: purchase.supplierOutstanding,
            }}
          />
          <DataTable
            data={asRows(purchase.payments)}
            columns={['reference', 'paidAt', 'amount', 'method', 'status']}
            controls={false}
          />
        </>
      )}
      <h4>Property costs and expenses</h4>
      <FinancialCards
        values={{
          operatingExpenses: expenses.operating ?? '0.00',
          capitalizedCosts: expenses.capitalized ?? '0.00',
        }}
      />
      <DataTable
        data={asRows(expenses.records)}
        columns={['reference', 'incurredAt', 'category', 'treatment', 'description', 'amount']}
        controls={false}
      />
      {Object.keys(sale).length > 0 && (
        <>
          <h4>Sale and customer position</h4>
          <FinancialCards
            values={{
              saleAmount: sale.saleAmount,
              received: sale.received,
              outstandingReceivable: sale.outstanding,
            }}
          />
          <DataTable
            data={asRows(sale.payments)}
            columns={['paidAt', 'amount', 'method', 'transactionReference']}
            controls={false}
          />
        </>
      )}
      <h4>Profitability</h4>
      <FinancialCards values={profitability} />
    </div>
  );
}

export function SupplierStatement({ vendorId }: { vendorId: string }) {
  const projectId = usePreferences((state) => state.projectId);
  const query = useQuery({
    queryKey: ['supplier-statement', projectId, vendorId],
    enabled: Boolean(projectId && vendorId),
    queryFn: ({ signal }) =>
      api<Row>(`/projects/${projectId}/vendors/${vendorId}/statement`, { signal }),
  });
  if (query.isLoading) return <Skeleton />;
  if (query.isError) return <ErrorState error={query.error} retry={() => void query.refetch()} />;
  const data = row(query.data);
  const summary = row(data.summary);
  return (
    <div className="detail-section">
      <FinancialCards values={summary} />
      <h4>Purchase balances</h4>
      <DataTable
        data={asRows(data.purchases)}
        columns={[
          'reference',
          'purchaseDate',
          'title',
          'propertyNumber',
          'purchaseAmount',
          'paid',
          'outstanding',
        ]}
        controls={false}
      />
      <h4>Payment history</h4>
      <DataTable
        data={asRows(data.payments)}
        columns={['reference', 'paidAt', 'amount', 'method', 'purchase', 'status']}
        controls={false}
      />
    </div>
  );
}

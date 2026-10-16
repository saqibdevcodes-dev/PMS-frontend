import { t, useLocale } from '../../lib/i18n';
import { useEffect, useRef, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import {
  ArrowLeft,
  ArrowRight,
  Building2,
  CalendarDays,
  CheckCircle2,
  Circle,
  Clock3,
  Coins,
  FileText,
  Hash,
  Images,
  LayoutGrid,
  LockKeyhole,
  MapPin,
  Pencil,
  Percent,
  Plus,
  Settings2,
  ShieldCheck,
  Sparkles,
  Wallet,
} from 'lucide-react';
import { api } from '../../lib/api';
import { operation, projectRoot } from '../../lib/contract';
import { row, asRows, type Row, type Operation } from '../../lib/types';
import { usePreferences } from '../../stores/preferences';
import { can } from '../../stores/auth';
import { Modal, ModalClose, Button, ErrorState } from '../../components/ui';
import { DataTable, DisplayValue } from '../../components/DataTable';
import { OperationDialog } from '../../components/OperationDialog';
import './project-detail.css';

export function ProjectDetail({ record, onClose }: { record: Row; onClose: () => void }) {
  useLocale();
  const [step, setStep] = useState(0);
  const [page, setPage] = useState(1);
  const [action, setAction] = useState<{ operation: Operation; title: string; record?: Row }>();
  const content = useRef<HTMLDivElement>(null);
  const project = useQuery({
    queryKey: ['project-detail', record.id],
    queryFn: () => api<Row>(`/projects/${record.id}`),
  });
  const units = useQuery({
    queryKey: ['project-units', record.id, page],
    enabled: can('inventory.read'),
    queryFn: () => api(`/projects/${record.id}/units?limit=25&page=${page}`),
  });
  const detail = project.data ?? record;
  useEffect(() => {
    if (project.data)
      usePreferences
        .getState()
        .setProject(
          String(project.data.id),
          String(project.data.name),
          String(project.data.currency),
          String(project.data.timezone),
        );
  }, [project.data]);
  useEffect(() => {
    content.current?.scrollTo({ top: 0 });
  }, [step]);
  const count = Number(row(detail._count).units ?? 0);
  const available = Number(detail.availableProperties ?? 0);
  const ready = Boolean(detail.location && available > 0);
  const features = Array.isArray(detail.features) ? detail.features : [];
  const photos = Array.isArray(detail.photoIds)
    ? detail.photoIds
    : detail.photoId
      ? [detail.photoId]
      : [];
  const featurePhotos = asRows(detail.featureImages);
  const stages = [
    {
      name: t('Overview'),
      description: t('Details & amenities'),
      icon: LayoutGrid,
      intro: t('A clear picture of your project, all in one place.'),
    },
    {
      name: t('Project settings'),
      description: t('Payments & clearance'),
      icon: Settings2,
      intro: t('Manage the payment rules that apply to this project.'),
    },
    {
      name: t('Properties'),
      description: t('Inventory & availability'),
      icon: Building2,
      intro: t('Add properties with their area, photos and selling price.'),
    },
    {
      name: t('Pricing & plans'),
      description: t('Prices & payment options'),
      icon: Wallet,
      intro: t('Review property prices and choose payment terms when creating a booking.'),
    },
    {
      name: t('Ready for booking'),
      description: t('Review & start selling'),
      icon: ShieldCheck,
      intro: t('Check the essentials before creating your next booking.'),
    },
  ];
  const current = stages[step]!;
  const nextBlocked = (step === 0 && !detail.location) || (step >= 2 && !count);
  function edit(path: string, title: string, method = 'post', r?: Row) {
    setAction({ operation: operation(method, path), title, record: r });
  }
  const editOverview = () => edit(projectRoot, t('Edit project'), 'patch', detail);
  const editSettings = () =>
    edit(projectRoot + '/settings', t('Edit project settings'), 'patch', detail);
  const addProperty = () => edit(projectRoot + '/units', t('Add property'));
  return (
    <>
      <Modal
        open
        wide
        className="project-workspace-modal"
        title={String(detail.name ?? t('Project details'))}
        description="Manage this project from setup to booking."
        onOpenChange={(v) => !v && onClose()}
      >
        <div className="project-workspace">
          <aside className="project-workspace-sidebar">
            <span className="project-workspace-eyebrow">{t('Project setup')}</span>
            <nav aria-label={t('Project setup')}>
              <ol className="project-workspace-steps">
                {stages.map(({ name, description, icon: Icon }, i) => (
                  <li key={name}>
                    <button
                      type="button"
                      aria-current={step === i ? 'step' : undefined}
                      aria-label={`${i + 1}. ${name}`}
                      aria-controls="project-step-content"
                      title={name}
                      onClick={() => setStep(i)}
                    >
                      <span className="project-step-icon">
                        <Icon size={18} aria-hidden />
                        <span>{i + 1}</span>
                      </span>
                      <span className="project-step-copy">
                        <strong>{name}</strong>
                        <small>{description}</small>
                      </span>
                    </button>
                  </li>
                ))}
              </ol>
            </nav>
            <div className="project-workspace-snapshot">
              <span className="project-workspace-eyebrow">{t('At a glance')}</span>
              <dl>
                <div>
                  <dt>{t('Properties')}</dt>
                  <dd>{count}</dd>
                </div>
                <div>
                  <dt>{t('Available')}</dt>
                  <dd>{available}</dd>
                </div>
              </dl>
              <span className="project-readiness" data-ready={ready}>
                {ready ? <CheckCircle2 size={14} /> : <Circle size={14} />}
                {ready ? t('Ready for bookings') : t('Setup needs attention')}
              </span>
            </div>
          </aside>
          <div className="project-workspace-main">
            <div className="project-workspace-scroll" ref={content}>
              {project.error && (
                <ErrorState error={project.error} retry={() => void project.refetch()} />
              )}
              <section
                id="project-step-content"
                aria-labelledby={`project-step-title-${step}`}
                className="project-step-panel"
                key={step}
              >
                <header className="project-step-heading">
                  <div>
                    <span className="project-workspace-eyebrow">
                      {t('Step')} {step + 1} {t('of')} {stages.length}
                    </span>
                    <h2 id={`project-step-title-${step}`}>{current.name}</h2>
                    <p>{current.intro}</p>
                  </div>
                  {step === 0 && can('projects.update') && (
                    <Button variant="secondary" size="small" onClick={editOverview}>
                      <Pencil size={14} />
                      {t('Edit overview & features')}
                    </Button>
                  )}
                  {step === 1 && can('projects.update') && (
                    <Button variant="secondary" size="small" onClick={editSettings}>
                      <Pencil size={14} />
                      {t('Edit settings')}
                    </Button>
                  )}
                  {step === 2 && can('inventory.create') && (
                    <Button size="small" onClick={addProperty}>
                      <Plus size={15} />
                      {t('Add property')}
                    </Button>
                  )}
                </header>
                {step === 0 && (
                  <div className="project-overview-content">
                    <div className="project-info-card">
                      <dl className="project-facts">
                        <div>
                          <Hash size={18} />
                          <div>
                            <dt>{t('Project code')}</dt>
                            <dd>
                              <span className="project-code-pill">
                                {String(detail.code ?? '—')}
                              </span>
                            </dd>
                          </div>
                        </div>
                        <div>
                          <MapPin size={18} />
                          <div>
                            <dt>{t('Location')}</dt>
                            <dd className={!detail.location ? 'project-missing-value' : undefined}>
                              {String(detail.location || t('Not added yet'))}
                            </dd>
                          </div>
                        </div>
                        <div>
                          <Coins size={18} />
                          <div>
                            <dt>{t('Currency')}</dt>
                            <dd>{String(detail.currency ?? '—')}</dd>
                          </div>
                        </div>
                        <div>
                          <Clock3 size={18} />
                          <div>
                            <dt>{t('Timezone')}</dt>
                            <dd>{String(detail.timezone ?? '—')}</dd>
                          </div>
                        </div>
                      </dl>
                    </div>
                    <div className="project-overview-columns">
                      <section className="project-info-card">
                        <h3>
                          <FileText size={17} />
                          {t('About this project')}
                        </h3>
                        <p
                          className={
                            !detail.description ? 'project-empty-copy' : 'project-description'
                          }
                        >
                          {String(
                            detail.description || t('Add a short description of your project.'),
                          )}
                        </p>
                      </section>
                      <section className="project-info-card">
                        <h3>
                          <Sparkles size={17} />
                          {t('Features & amenities')}
                        </h3>
                        {features.length ? (
                          <div className="project-amenities">
                            {features.map((f) => (
                              <span key={String(f)}>
                                <CheckCircle2 size={13} />
                                {t(String(f))}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <p className="project-empty-copy">
                            {t(
                              'No amenities added yet. Add the facilities that make this project stand out.',
                            )}
                          </p>
                        )}
                      </section>
                    </div>
                    {(photos.length > 0 || featurePhotos.length > 0) && (
                      <section className="project-info-card project-photo-card">
                        <h3>
                          <Images size={17} />
                          {t('Project photos')}
                        </h3>
                        {photos.length > 0 && <DisplayValue name="photoIds" value={photos} />}
                        {featurePhotos.length > 0 && (
                          <div className="project-feature-photos">
                            {featurePhotos.map((f) => (
                              <figure key={String(f.feature)}>
                                <DisplayValue name="imageId" value={f.imageId} />
                                <figcaption>{t(String(f.feature))}</figcaption>
                              </figure>
                            ))}
                          </div>
                        )}
                      </section>
                    )}
                  </div>
                )}
                {step === 1 && (
                  <div className="project-settings-content">
                    <div className="project-rule-cards">
                      <section className="project-info-card project-rule-card">
                        <span className="project-rule-icon">
                          <Percent size={22} />
                        </span>
                        <h3>{t('Minimum down payment')}</h3>
                        <strong className="project-rule-value">
                          {detail.downPaymentPercent == null
                            ? '—'
                            : `${String(detail.downPaymentPercent)}%`}
                        </strong>
                        <p>{t('Applies to installment bookings only.')}</p>
                      </section>
                      <section className="project-info-card project-rule-card">
                        <span className="project-rule-icon">
                          <ShieldCheck size={22} />
                        </span>
                        <h3>{t('Clearance certificate validity')}</h3>
                        <strong className="project-rule-value">
                          {String(detail.ndcValidityDays ?? '—')} <small>{t('days')}</small>
                        </strong>
                        <p>{t('The period a clearance certificate remains valid.')}</p>
                      </section>
                    </div>
                    <div className="project-info-note">
                      <Wallet size={19} />
                      <p>{t('Full payment bookings do not require a down payment.')}</p>
                    </div>
                  </div>
                )}
                {(step === 2 || step === 3) && (
                  <div className="project-inventory-content">
                    {step === 3 && (
                      <div className="project-payment-options">
                        <section className="project-info-card">
                          <Wallet size={21} />
                          <h3>{t('Full Payment')}</h3>
                          <p>{t('Pay the full booking amount.')}</p>
                        </section>
                        <section className="project-info-card">
                          <CalendarDays size={21} />
                          <h3>{t('Installment Plan')}</h3>
                          <p>{t('Set a down payment and scheduled installments.')}</p>
                        </section>
                      </div>
                    )}
                    {!can('inventory.read') ? (
                      <div className="project-info-note">
                        <LockKeyhole size={19} />
                        <p>{t('You do not have permission to view properties.')}</p>
                      </div>
                    ) : units.error ? (
                      <ErrorState error={units.error} retry={() => void units.refetch()} />
                    ) : (
                      <div className="project-property-table">
                        <DataTable
                          data={asRows(units.data)}
                          columns={['number', 'type', 'size', 'price', 'charges', 'status']}
                          controls={false}
                          page={page}
                          limit={25}
                          busy={units.isLoading}
                          total={Number(row(row(units.data).pagination).total ?? 0)}
                          onPage={setPage}
                          currency={String(detail.currency ?? 'PKR')}
                          actions={
                            step === 3 && can('inventory.change_price')
                              ? (r) => (
                                  <Button
                                    size="small"
                                    variant="secondary"
                                    disabled={!['AVAILABLE', 'BLOCKED'].includes(String(r.status))}
                                    onClick={() =>
                                      edit(
                                        projectRoot + '/units/{id}/price',
                                        t('Change property price'),
                                        'post',
                                        r,
                                      )
                                    }
                                  >
                                    <Pencil size={13} />
                                    {t('Change price')}
                                  </Button>
                                )
                              : undefined
                          }
                        />
                      </div>
                    )}
                  </div>
                )}
                {step === 4 && (
                  <div className="project-ready-content">
                    <div className="project-ready-banner" data-ready={ready}>
                      <span>{ready ? <ShieldCheck size={30} /> : <Building2 size={30} />}</span>
                      <div>
                        <h3>
                          {ready ? t('Your project is ready') : t('A few details are missing')}
                        </h3>
                        <p>
                          {ready
                            ? t('Choose a customer and an available property to create a booking.')
                            : t('Complete these details to make your project ready for bookings.')}
                        </p>
                      </div>
                    </div>
                    <ul className="project-readiness-list">
                      <li data-complete={Boolean(detail.location)}>
                        {detail.location ? <CheckCircle2 size={20} /> : <Circle size={20} />}
                        <div>
                          <strong>{t('Project location')}</strong>
                          <p>
                            {String(detail.location || t('Add the project location in Overview.'))}
                          </p>
                        </div>
                        {!detail.location && (
                          <Button variant="secondary" size="small" onClick={() => setStep(0)}>
                            {t('Overview')}
                            <ArrowRight size={14} />
                          </Button>
                        )}
                      </li>
                      <li data-complete={available > 0}>
                        {available > 0 ? <CheckCircle2 size={20} /> : <Circle size={20} />}
                        <div>
                          <strong>{t('Available properties')}</strong>
                          <p>
                            {available > 0
                              ? `${available} ${t('available')}`
                              : t('Add at least one available property with a selling price.')}
                          </p>
                        </div>
                        {!available && (
                          <Button variant="secondary" size="small" onClick={() => setStep(2)}>
                            {t('Properties')}
                            <ArrowRight size={14} />
                          </Button>
                        )}
                      </li>
                    </ul>
                    {ready && can('bookings.create') && (
                      <Button asChild className="project-create-booking">
                        <Link to="/bookings/new" onClick={onClose}>
                          {t('Create booking')}
                          <ArrowRight size={16} />
                        </Link>
                      </Button>
                    )}
                  </div>
                )}
              </section>
            </div>
            <footer className="project-workspace-footer">
              <Button variant="secondary" disabled={step === 0} onClick={() => setStep(step - 1)}>
                <ArrowLeft size={15} />
                {t('Back')}
              </Button>
              <span>
                {step < 4 &&
                  (nextBlocked
                    ? step === 0
                      ? t('Add a location in Overview to continue.')
                      : t('Add a property to continue.')
                    : `${t('Next')}: ${stages[step + 1]!.name}`)}
              </span>
              {step < 4 ? (
                <Button disabled={nextBlocked} onClick={() => setStep(step + 1)}>
                  {t('Continue')}
                  <ArrowRight size={15} />
                </Button>
              ) : (
                <ModalClose asChild>
                  <Button variant="secondary">{t('Close')}</Button>
                </ModalClose>
              )}
            </footer>
          </div>
        </div>
      </Modal>
      {action && <OperationDialog {...action} onClose={() => setAction(undefined)} />}
    </>
  );
}

import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { api } from '../../lib/api';
import { queryClient } from '../../lib/query';
import { t } from '../../lib/i18n';
import { ImageUpload } from '../../components/ImageUpload';
import { ProjectLogo } from '../../components/ProjectLogo';
import { Button, ErrorState } from '../../components/ui';
import { useUnsavedChanges } from '../../hooks/use-unsaved';
import { toast } from 'sonner';

export function ProjectBranding({
  projectId,
  name,
  initialLogo,
}: {
  projectId: string;
  name: string;
  initialLogo: string | null;
}) {
  const [logo, setLogo] = useState(initialLogo ?? '');
  const [saved, setSaved] = useState(initialLogo ?? '');
  const [busy, setBusy] = useState(false);
  const [uploadKey, setUploadKey] = useState(0);
  const dirty = logo !== saved;
  useUnsavedChanges(dirty);
  const save = useMutation({
    mutationFn: () =>
      api(`/projects/${projectId}`, { method: 'PATCH', body: { logoId: logo || null } }),
    onSuccess: () => {
      setSaved(logo);
      toast.success(t('Project logo saved'));
      void queryClient.invalidateQueries();
    },
  });
  return (
    <section className="panel project-branding-card">
      <div>
        <h2>{t('Project branding')}</h2>
        <p>
          {t('Use this logo on project receipts, vouchers, statements and generated documents.')}
        </p>
      </div>
      <div className="project-branding-grid">
        <ImageUpload
          key={uploadKey}
          purpose="PROJECT_LOGO"
          value={logo}
          onChange={setLogo}
          label={t('Project logo')}
          disabled={save.isPending}
          onBusy={setBusy}
          minHeight={160}
        />
        <div className="project-branding-preview">
          <small>{t('Document preview')}</small>
          <ProjectLogo logoId={logo || null} name={name} />
          <strong>{name}</strong>
          <span>{t('The Etihad logo is used when no project logo is selected.')}</span>
        </div>
      </div>
      {save.error && <ErrorState error={save.error} />}
      <footer>
        <Button
          variant="secondary"
          disabled={!dirty || busy || save.isPending}
          onClick={() => {
            setLogo(saved);
            setUploadKey((key) => key + 1);
          }}
        >
          {t('Cancel')}
        </Button>
        <Button disabled={!dirty || busy} busy={save.isPending} onClick={() => save.mutate()}>
          {t('Save project logo')}
        </Button>
      </footer>
    </section>
  );
}

import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import { api } from '../lib/api';
import { t } from '../lib/i18n';
import { errorMessage } from '../lib/error-messages';
import { Button, Modal } from './ui';

export function DocumentEditModal({
  projectId,
  document,
  onClose,
  onSuccess,
}: {
  projectId: string;
  document: { id: string; name: string };
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [name, setName] = useState(document.name);
  const [file, setFile] = useState<File | null>(null);
  const save = useMutation({
    mutationFn: () => {
      if (file) {
        const body = new FormData();
        body.append('name', name.trim());
        body.append('file', file);
        return api(`/projects/${projectId}/documents/${document.id}/file`, {
          method: 'POST',
          body,
        });
      }
      return api(`/projects/${projectId}/documents/${document.id}`, {
        method: 'PATCH',
        body: { name: name.trim() },
      });
    },
    onSuccess: () => {
      toast.success(t('Document updated'));
      onSuccess();
      onClose();
    },
    onError: (error: Error) => toast.error(errorMessage(error)),
  });
  return (
    <Modal open title={t('Edit document')} onOpenChange={(open) => !open && onClose()}>
      <form
        className="modal-body"
        onSubmit={(event) => {
          event.preventDefault();
          save.mutate();
        }}
      >
        <label className="form-field">
          {t('Document name *')}
          <input
            required
            maxLength={180}
            value={name}
            onChange={(event) => setName(event.target.value)}
          />
        </label>
        <label className="form-field">
          {t('Replace file')}
          <input
            type="file"
            accept=".pdf,.docx,.doc,.png,.jpg,.jpeg,.webp"
            onChange={(event) => {
              const selected = event.target.files?.[0] ?? null;
              if (selected && selected.size > 10 * 1024 * 1024) {
                toast.error(t('Maximum document size is 10 MiB.'));
                event.target.value = '';
                return;
              }
              setFile(selected);
            }}
          />
          {file && <small>{file.name}</small>}
        </label>
        <div className="form-footer">
          <Button type="button" variant="secondary" onClick={onClose}>
            {t('Cancel')}
          </Button>
          <Button
            type="submit"
            busy={save.isPending}
            disabled={!name.trim() || (!file && name.trim() === document.name)}
          >
            {t('Save changes')}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

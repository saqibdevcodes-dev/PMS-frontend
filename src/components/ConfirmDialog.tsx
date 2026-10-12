import { t, useLocale } from '../lib/i18n';
import { create } from 'zustand';
import { Modal, Button } from './ui';
type Prompt = { title: string; description: string; confirm?: string; cancel?: string };
const confirmation = create<{ prompt: Prompt | null; resolve?: (value: boolean) => void }>(() => ({
  prompt: null,
}));
let pending: Promise<boolean> | undefined;
export function confirmAction(prompt: Prompt): Promise<boolean> {
  if (pending) return pending;
  pending = new Promise<boolean>((resolve) => confirmation.setState({ prompt, resolve })).finally(
    () => {
      pending = undefined;
    },
  );
  return pending;
}
export function ConfirmDialog() {
  useLocale();
  const { prompt, resolve } = confirmation();
  function finish(value: boolean) {
    confirmation.setState({ prompt: null, resolve: undefined });
    resolve?.(value);
  }
  return (
    <Modal
      open={!!prompt}
      onOpenChange={(open) => !open && finish(false)}
      title={prompt?.title ?? ''}
      description={prompt?.description}
      className="confirm-dialog"
    >
      <div className="confirm-actions">
        <Button variant="secondary" onClick={() => finish(false)}>
          {t(prompt?.cancel ?? 'Keep editing')}
        </Button>
        <Button variant="danger" onClick={() => finish(true)}>
          {t(prompt?.confirm ?? 'Discard changes')}
        </Button>
      </div>
    </Modal>
  );
}

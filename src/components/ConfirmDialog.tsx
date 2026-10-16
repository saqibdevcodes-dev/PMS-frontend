import { t, useLocale } from '../lib/i18n';
import { create } from 'zustand';
import { Modal, Button } from './ui';
type Prompt = { title: string; description: string; confirm?: string; cancel?: string };
const confirmation = create<{
  open: boolean;
  prompt: Prompt | null;
  resolve?: (value: boolean) => void;
}>(() => ({
  open: false,
  prompt: null,
}));
let pending: Promise<boolean> | undefined;
export function confirmAction(prompt: Prompt): Promise<boolean> {
  if (pending) return pending;
  pending = new Promise<boolean>((resolve) =>
    confirmation.setState({ open: true, prompt, resolve }),
  ).finally(() => {
    pending = undefined;
  });
  return pending;
}
export function ConfirmDialog() {
  useLocale();
  const { open, prompt, resolve } = confirmation();
  function finish(value: boolean) {
    // Retain the text while Radix animates the closed prompt out.
    confirmation.setState({ open: false, resolve: undefined });
    resolve?.(value);
  }
  return (
    <Modal
      open={open}
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

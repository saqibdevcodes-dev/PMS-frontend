import { afterEach, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter } from 'react-router-dom';
import { OperationDialog } from '../../src/components/OperationDialog';
import { operation } from '../../src/lib/contract';
import { usePreferences } from '../../src/stores/preferences';
import { useAuth } from '../../src/stores/auth';
import type { User } from '../../src/lib/types';

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
  useAuth.getState().clear();
});

it('keeps mixed-unit guidance visible through project review and allows saving', async () => {
  const projectId = 'aaaaaaaa-aaaa-4aaa-aaaa-aaaaaaaaaaaa';
  // Editing a project must use its capacity even when another workspace is selected.
  usePreferences.getState().setProject('bbbbbbbb-bbbb-4bbb-bbbb-bbbbbbbbbbbb', 'Other project');
  useAuth.getState().setUser({ permissions: ['projects.read', 'projects.update'] } as User);
  const record = {
    id: projectId,
    name: 'Pir Jahaniyan',
    location: 'Jahaniyan/Multan',
    plannedPlotCount: 20,
    plannedPlotArea: '200',
    plotAreaUnit: 'marla',
  };
  const fetcher = vi.fn(
    async (url: string, init?: RequestInit) =>
      new Response(
        JSON.stringify({
          success: true,
          data:
            init?.method === 'PATCH'
              ? record
              : {
                  ...record,
                  configured: true,
                  usedPlotCount: 2,
                  usedPlotArea: null,
                  remainingPlotCount: 18,
                  remainingPlotArea: null,
                  unmatchedPlotCount: 2,
                },
        }),
      ),
  );
  vi.stubGlobal('fetch', fetcher);
  render(
    <QueryClientProvider
      client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}
    >
      <MemoryRouter>
        <OperationDialog
          operation={operation('patch', '/projects/{projectId}')}
          title="Edit project"
          record={record}
          onClose={() => {}}
        />
      </MemoryRouter>
    </QueryClientProvider>,
  );
  expect(await screen.findByText(/2 existing plots use another area unit/)).toBeDefined();
  fireEvent.click(screen.getByRole('button', { name: 'Review changes' }));
  const confirm = await screen.findByRole('button', { name: 'Confirm & submit' });
  expect(await screen.findByText(/You can save project changes/)).toBeDefined();
  fireEvent.click(confirm);
  expect(await screen.findByText('Saved to your project')).toBeDefined();
  await waitFor(() => {
    expect(fetcher).toHaveBeenCalledWith(
      expect.stringContaining(`/projects/${projectId}/plot-capacity`),
      expect.any(Object),
    );
    const saved = fetcher.mock.calls.find(([, init]) => init?.method === 'PATCH');
    expect(saved?.[0]).toContain(`/projects/${projectId}`);
    expect(JSON.parse(String(saved?.[1]?.body))).toMatchObject({
      plotAreaUnit: 'marla',
      plannedPlotArea: '200',
    });
  });
});

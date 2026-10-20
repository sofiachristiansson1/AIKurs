// @vitest-environment jsdom
import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { uppsalaSearchResponse } from '../../api/fixtures/geocoding';
import { stubFetchJson } from '../../api/testHelpers';
import { LocationSearch } from './LocationSearch';

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

function renderSearch() {
  const onSelect = vi.fn();
  render(<LocationSearch selected={undefined} onSelect={onSelect} />);
  return { onSelect, user: userEvent.setup() };
}

describe('LocationSearch', () => {
  it('lets the user choose between places with the same name', async () => {
    stubFetchJson(uppsalaSearchResponse);
    const { onSelect, user } = renderSearch();
    await user.type(screen.getByLabelText('Sök ort i Sverige'), 'Uppsala{Enter}');
    await user.click(await screen.findByRole('button', { name: 'Uppsala, Örebro län' }));
    expect(onSelect).toHaveBeenCalledWith(expect.objectContaining({ region: 'Örebro län' }));
    expect(screen.queryByRole('button', { name: 'Uppsala, Uppsala län' })).toBeNull();
  });

  it('explains in Swedish when no place matches', async () => {
    stubFetchJson({ generationtime_ms: 0.1 });
    const { user } = renderSearch();
    await user.type(screen.getByLabelText('Sök ort i Sverige'), 'Xqzzy');
    await user.click(screen.getByRole('button', { name: 'Sök' }));
    expect((await screen.findByRole('alert')).textContent).toBe(
      'Hittade ingen ort som heter "Xqzzy" i Sverige.',
    );
  });

  it('asks for at least two letters without calling the service', async () => {
    const fetchMock = stubFetchJson(uppsalaSearchResponse);
    const { user } = renderSearch();
    await user.click(screen.getByRole('button', { name: 'Sök' }));
    expect((await screen.findByRole('alert')).textContent).toBe('Skriv minst två bokstäver.');
    expect(fetchMock).not.toHaveBeenCalled();
  });
});

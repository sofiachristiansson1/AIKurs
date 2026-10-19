// @vitest-environment jsdom
import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { DEFAULT_HORSE_DRAFT, type HorseDraft } from '../hooks/useHorseProfile';
import { HorseForm } from './HorseForm';

afterEach(cleanup);

/** Keeps the draft in state like the app does, and reports every change. */
function renderForm(initial: HorseDraft = DEFAULT_HORSE_DRAFT) {
  const onChange = vi.fn<(draft: HorseDraft) => void>();
  function Harness() {
    const [draft, setDraft] = useState(initial);
    return (
      <HorseForm
        draft={draft}
        onChange={(next) => {
          setDraft(next);
          onChange(next);
        }}
      />
    );
  }
  render(<Harness />);
  return { onChange, user: userEvent.setup() };
}

function lastDraft(onChange: ReturnType<typeof renderForm>['onChange']): HorseDraft | undefined {
  return onChange.mock.lastCall?.[0];
}

describe('HorseForm', () => {
  it('starts as unclipped, warmblood and outdoors with no age', () => {
    renderForm();
    expect(screen.getByRole<HTMLInputElement>('radio', { name: 'Nej' }).checked).toBe(true);
    expect(screen.getByRole<HTMLSelectElement>('combobox', { name: 'Hästtyp' }).value).toBe(
      'warmblood',
    );
    expect(screen.getByRole<HTMLInputElement>('radio', { name: 'Ute' }).checked).toBe(true);
    expect(screen.getByLabelText<HTMLInputElement>('Ålder (år)').value).toBe('');
  });

  it('reports every field the user changes', async () => {
    const { onChange, user } = renderForm();
    await user.click(screen.getByRole('radio', { name: 'Ja' }));
    await user.selectOptions(screen.getByRole('combobox', { name: 'Hästtyp' }), 'Fullblod/arab');
    await user.click(screen.getByRole('radio', { name: 'I stall' }));
    await user.type(screen.getByLabelText('Ålder (år)'), '21');
    expect(lastDraft(onChange)).toEqual({
      clipped: true,
      breedType: 'thoroughbredOrArab',
      housing: 'stable',
      ageYears: 21,
    });
  });

  it.each(['41', '-1', '3.5'])('explains that %s is not a valid age', async (age) => {
    const { user } = renderForm();
    await user.type(screen.getByLabelText('Ålder (år)'), age);
    expect(screen.getByText('Ange åldern i hela år, mellan 0 och 40.')).toBeDefined();
    expect(screen.getByLabelText('Ålder (år)').getAttribute('aria-invalid')).toBe('true');
  });

  it('shows a stored age', () => {
    renderForm({ ...DEFAULT_HORSE_DRAFT, ageYears: 7 });
    expect(screen.getByLabelText<HTMLInputElement>('Ålder (år)').value).toBe('7');
  });
});

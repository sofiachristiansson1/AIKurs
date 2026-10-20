import { useCallback, useState } from 'react';
import { createHorseProfileStore } from '../../api/horseProfileStore';
import type { ApiError } from '../../api/result';
import { isValidAge } from '../../domain/horseAge';
import type { BreedType, HorseProfile, Housing } from '../../domain/types';
import { useStore } from './useStore';

/** What the form holds; the age may still be missing or invalid. */
export interface HorseDraft {
  readonly clipped: boolean;
  readonly breedType: BreedType;
  readonly housing: Housing;
  readonly ageYears: number | undefined;
}

export const DEFAULT_HORSE_DRAFT: HorseDraft = {
  clipped: false,
  breedType: 'warmblood',
  housing: 'outdoor',
  ageYears: undefined,
};

export function toHorseProfile(draft: HorseDraft): HorseProfile | undefined {
  const { ageYears } = draft;
  return isValidAge(ageYears) ? { ...draft, ageYears } : undefined;
}

export interface HorseProfileState {
  readonly draft: HorseDraft;
  /** Defined once the draft is complete and valid. */
  readonly profile: HorseProfile | undefined;
  readonly storageError: ApiError | undefined;
  readonly updateDraft: (draft: HorseDraft) => void;
}

/** Holds the horse form and saves every complete profile. */
export function useHorseProfile(): HorseProfileState {
  const { store, initialValue, initialError } = useStore(createHorseProfileStore);
  const [draft, setDraft] = useState<HorseDraft>(initialValue ?? DEFAULT_HORSE_DRAFT);
  const [storageError, setStorageError] = useState(initialError);

  const updateDraft = useCallback(
    (next: HorseDraft) => {
      setDraft(next);
      const profile = toHorseProfile(next);
      if (profile !== undefined && store !== undefined) {
        const saved = store.save(profile);
        setStorageError(saved.ok ? undefined : saved.error);
      }
    },
    [store],
  );

  return { draft, profile: toHorseProfile(draft), storageError, updateDraft };
}

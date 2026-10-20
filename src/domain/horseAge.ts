/** Ages the app accepts, in whole years. This limits input only and is not a blanket rule. */
export const AGE_INPUT_RANGE = { min: 0, max: 40 } as const;

/** The one age check, shared by the form and by profiles read back from storage. */
export function isValidAge(ageYears: number | undefined): ageYears is number {
  return (
    ageYears !== undefined &&
    Number.isInteger(ageYears) &&
    ageYears >= AGE_INPUT_RANGE.min &&
    ageYears <= AGE_INPUT_RANGE.max
  );
}

export interface TastingNoteData {
  body: number;
  peaty: number;
  sweet: number;
  fruity: number;
  spicy: number;
}

export interface TastingNoteFormState extends TastingNoteData {
  memo: string;
}

export const TASTING_AXES = [
  { key: 'body', label: '바디', labelEng: 'Body' },
  { key: 'peaty', label: '피티', labelEng: 'Peaty' },
  { key: 'sweet', label: '스위트', labelEng: 'Sweet' },
  { key: 'fruity', label: '프루티', labelEng: 'Fruity' },
  { key: 'spicy', label: '스파이시', labelEng: 'Spicy' },
] as const;

export type TastingAxisKey = (typeof TASTING_AXES)[number]['key'];

export const DEFAULT_TASTING_NOTE: TastingNoteFormState = {
  body: 5,
  peaty: 5,
  sweet: 5,
  fruity: 5,
  spicy: 5,
  memo: '',
};

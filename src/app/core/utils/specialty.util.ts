export type DentalSpecialty =
  | 'GENERAL' | 'ENDODONTICS' | 'ORTHODONTICS' | 'IMPLANTOLOGY' | 'PERIODONTICS'
  | 'PEDIATRIC' | 'AESTHETICS' | 'SURGERY' | 'PROSTHODONTICS';

/** pt-BR labels for the dental specialties (UI copy). */
export const SPECIALTY_LABELS: Record<DentalSpecialty, string> = {
  GENERAL:       'Clínica geral',
  ENDODONTICS:   'Endodontia',
  ORTHODONTICS:  'Ortodontia',
  IMPLANTOLOGY:  'Implantodontia',
  PERIODONTICS:  'Periodontia',
  PEDIATRIC:     'Odontopediatria',
  AESTHETICS:    'Estética',
  SURGERY:       'Cirurgia',
  PROSTHODONTICS:'Prótese',
};

export const SPECIALTY_OPTIONS = (Object.keys(SPECIALTY_LABELS) as DentalSpecialty[])
  .map(value => ({ value, label: SPECIALTY_LABELS[value] }));

export function specialtyLabel(s: DentalSpecialty): string {
  return SPECIALTY_LABELS[s] ?? s;
}

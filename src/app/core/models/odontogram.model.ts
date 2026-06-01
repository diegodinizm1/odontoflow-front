export interface ToothState {
  condition: string;
  surfaces: string[];
}

export type Odontogram = Record<string, ToothState>;

export interface ClinicalRecord {
  id: string;
  odontogramData: Odontogram;
  clinicalNotes: string | null;
  appointmentId: string | null;
  createdByName: string;
  createdAt: string;
}

export interface CreateClinicalRecordRequest {
  odontogramData: Odontogram;
  clinicalNotes?: string | null;
  appointmentId?: string | null;
}

export interface ConditionDef {
  code: string;
  label: string;
  color: string;
  whole: boolean; // affects the whole tooth (vs individual surfaces)
  marker?: string; // single-letter badge for whole-tooth conditions
}

export const CONDITIONS: ConditionDef[] = [
  { code: 'HEALTHY',    label: 'Hígido',     color: '#FFFFFF', whole: true },
  { code: 'CARIES',     label: 'Cárie',      color: '#DC2626', whole: false },
  { code: 'RESTORED',   label: 'Restaurado', color: '#2563EB', whole: false },
  { code: 'SEALANT',    label: 'Selante',    color: '#16A34A', whole: false },
  { code: 'CROWN',      label: 'Coroa',      color: '#D97706', whole: true, marker: 'C' },
  { code: 'ROOT_CANAL', label: 'Canal',      color: '#7C3AED', whole: true, marker: 'T' },
  { code: 'IMPLANT',    label: 'Implante',   color: '#0F766E', whole: true, marker: 'I' },
  { code: 'EXTRACTED',  label: 'Extraído',   color: '#9CA3AF', whole: true },
];

export const CONDITION_BY_CODE: Record<string, ConditionDef> =
  Object.fromEntries(CONDITIONS.map(c => [c.code, c]));

// FDI permanent dentition, displayed left→right per arch
export const UPPER_RIGHT = ['18', '17', '16', '15', '14', '13', '12', '11'];
export const UPPER_LEFT  = ['21', '22', '23', '24', '25', '26', '27', '28'];
export const LOWER_RIGHT = ['48', '47', '46', '45', '44', '43', '42', '41'];
export const LOWER_LEFT  = ['31', '32', '33', '34', '35', '36', '37', '38'];

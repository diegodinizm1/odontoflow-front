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

/* ---- Tooth statuses (drawn-teeth odontogram) ---- */
export interface ToothStatusDef {
  code: string;
  label: string;
  fill: string;
  stroke: string;
}

export const TOOTH_STATUSES: ToothStatusDef[] = [
  { code: 'healthy',  label: 'Saudável',   fill: '#ffffff', stroke: '#c5d0d3' },
  { code: 'caries',   label: 'Cárie',      fill: '#fecdd3', stroke: '#f43f5e' },
  { code: 'restored', label: 'Restaurado', fill: '#bae6fd', stroke: '#0ea5e9' },
  { code: 'missing',  label: 'Ausente',    fill: '#f1f5f9', stroke: '#cbd5e1' },
  { code: 'implant',  label: 'Implante',   fill: '#d3f3ee', stroke: '#0d8b7e' },
];

export const STATUS_BY_CODE: Record<string, ToothStatusDef> =
  Object.fromEntries(TOOTH_STATUSES.map(s => [s.code, s]));

// click-to-cycle order
export const STATUS_CYCLE = ['healthy', 'caries', 'restored', 'missing', 'implant'];

/** Backend condition <-> status mapping (condition is stored uppercase). */
export function statusFromState(state: ToothState | undefined): string {
  if (!state) return 'healthy';
  const c = state.condition.toLowerCase();
  return STATUS_BY_CODE[c] ? c : 'healthy';
}

// FDI permanent dentition, displayed left→right per arch
export const UPPER_RIGHT = ['18', '17', '16', '15', '14', '13', '12', '11'];
export const UPPER_LEFT  = ['21', '22', '23', '24', '25', '26', '27', '28'];
export const LOWER_RIGHT = ['48', '47', '46', '45', '44', '43', '42', '41'];
export const LOWER_LEFT  = ['31', '32', '33', '34', '35', '36', '37', '38'];

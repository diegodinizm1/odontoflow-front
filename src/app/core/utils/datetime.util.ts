/** Local datetime helpers — backend uses LocalDateTime (no timezone). */

const pad = (n: number) => String(n).padStart(2, '0');

/** Date + 'HH:mm' -> 'YYYY-MM-DDTHH:mm:ss' (local, no Z). */
export function toLocalIso(date: Date, time: string): string {
  return `${dateOnlyIso(date)}T${time}:00`;
}

/** Date -> 'YYYY-MM-DD'. */
export function dateOnlyIso(date: Date): string {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

/** Start of day local iso. */
export function startOfDayIso(date: Date): string {
  return `${dateOnlyIso(date)}T00:00:00`;
}

/** Monday of the week containing `date`. */
export function startOfWeek(date: Date): Date {
  const d = new Date(date);
  const day = (d.getDay() + 6) % 7; // 0 = Monday
  d.setDate(d.getDate() - day);
  d.setHours(0, 0, 0, 0);
  return d;
}

export function addDays(date: Date, days: number): Date {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

export function sameDay(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear()
    && a.getMonth() === b.getMonth()
    && a.getDate() === b.getDate();
}

/** Decimal hour of a local datetime string, e.g. '...T09:30:00' -> 9.5 */
export function decimalHour(iso: string): number {
  const t = iso.split('T')[1] ?? '00:00:00';
  const [h, m] = t.split(':').map(Number);
  return h + m / 60;
}

/** 'HH:mm' from a local datetime string. */
export function timeOf(iso: string): string {
  return (iso.split('T')[1] ?? '00:00').slice(0, 5);
}

/** Add minutes to a 'HH:mm' string, clamped to 23:59. */
export function addMinutesToTime(time: string, minutes: number): string {
  const [h, m] = time.split(':').map(Number);
  const total = Math.min(h * 60 + m + minutes, 23 * 60 + 59);
  return `${pad(Math.floor(total / 60))}:${pad(total % 60)}`;
}

/** Parse a local datetime string 'YYYY-MM-DDTHH:mm:ss' into a Date. */
export function parseLocal(iso: string): Date {
  const [d, t] = iso.split('T');
  const [y, mo, da] = d.split('-').map(Number);
  const [h, mi, s] = (t ?? '00:00:00').split(':').map(Number);
  return new Date(y, mo - 1, da, h, mi, s || 0);
}

/** Format a Date as local 'YYYY-MM-DDTHH:mm:ss' (no timezone). */
export function formatLocal(date: Date): string {
  return `${dateOnlyIso(date)}T${pad(date.getHours())}:${pad(date.getMinutes())}:00`;
}

/** Whole-day index between two dates (ignoring time). */
export function dayIndex(from: Date, to: Date): number {
  const a = new Date(from.getFullYear(), from.getMonth(), from.getDate()).getTime();
  const b = new Date(to.getFullYear(), to.getMonth(), to.getDate()).getTime();
  return Math.round((b - a) / 86400000);
}

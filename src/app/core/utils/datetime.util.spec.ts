import {
  toLocalIso, dateOnlyIso, decimalHour, timeOf,
  addMinutesToTime, startOfWeek, addDays, sameDay, dayIndex,
} from './datetime.util';

describe('datetime.util', () => {
  it('formats local ISO from a date + HH:mm', () => {
    expect(toLocalIso(new Date(2026, 5, 2), '09:30')).toBe('2026-06-02T09:30:00');
  });

  it('formats date-only ISO', () => {
    expect(dateOnlyIso(new Date(2026, 0, 5))).toBe('2026-01-05');
  });

  it('computes the decimal hour', () => {
    expect(decimalHour('2026-06-02T09:30:00')).toBe(9.5);
    expect(decimalHour('2026-06-02T08:00:00')).toBe(8);
  });

  it('extracts HH:mm from a local datetime', () => {
    expect(timeOf('2026-06-02T14:05:00')).toBe('14:05');
  });

  it('adds minutes to a time and clamps at 23:59', () => {
    expect(addMinutesToTime('09:00', 90)).toBe('10:30');
    expect(addMinutesToTime('23:30', 60)).toBe('23:59');
  });

  it('returns the Monday for startOfWeek', () => {
    const wednesday = new Date(2026, 5, 3); // Wed 2026-06-03
    expect(startOfWeek(wednesday).getDay()).toBe(1);
  });

  it('adds days immutably', () => {
    const base = new Date(2026, 5, 1);
    expect(dateOnlyIso(addDays(base, 5))).toBe('2026-06-06');
    expect(dateOnlyIso(base)).toBe('2026-06-01'); // original untouched
  });

  it('compares same day ignoring time', () => {
    expect(sameDay(new Date(2026, 5, 1, 9), new Date(2026, 5, 1, 18))).toBe(true);
    expect(sameDay(new Date(2026, 5, 1), new Date(2026, 5, 2))).toBe(false);
  });

  it('counts whole days between dates', () => {
    expect(dayIndex(new Date(2026, 5, 1), new Date(2026, 5, 4))).toBe(3);
  });
});

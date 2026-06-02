/** Brazilian input masks (CPF, CNPJ, phone). Pure string formatters. */

export type MaskType = 'cpf' | 'cnpj' | 'cpfCnpj' | 'phone';

const onlyDigits = (value: string): string => value.replace(/\D/g, '');

/** 000.000.000-00 */
export function maskCpf(value: string): string {
  return onlyDigits(value)
    .slice(0, 11)
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
}

/** 00.000.000/0000-00 */
export function maskCnpj(value: string): string {
  return onlyDigits(value)
    .slice(0, 14)
    .replace(/(\d{2})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1/$2')
    .replace(/(\d{4})(\d{1,2})$/, '$1-$2');
}

/** CPF when up to 11 digits, otherwise CNPJ. */
export function maskCpfCnpj(value: string): string {
  return onlyDigits(value).length <= 11 ? maskCpf(value) : maskCnpj(value);
}

/** (00) 0000-0000 (landline) or (00) 00000-0000 (mobile). */
export function maskPhone(value: string): string {
  const digits = onlyDigits(value).slice(0, 11);
  if (digits.length <= 10) {
    return digits
      .replace(/(\d{2})(\d)/, '($1) $2')
      .replace(/(\d{4})(\d{1,4})$/, '$1-$2');
  }
  return digits
    .replace(/(\d{2})(\d)/, '($1) $2')
    .replace(/(\d{5})(\d{1,4})$/, '$1-$2');
}

export function applyMask(type: MaskType, value: string): string {
  switch (type) {
    case 'cpf': return maskCpf(value);
    case 'cnpj': return maskCnpj(value);
    case 'phone': return maskPhone(value);
    case 'cpfCnpj': return maskCpfCnpj(value);
  }
}

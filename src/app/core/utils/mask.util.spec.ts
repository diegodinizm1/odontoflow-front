import { maskCpf, maskCnpj, maskCpfCnpj, maskPhone, applyMask } from './mask.util';

describe('mask.util', () => {
  it('masks CPF', () => {
    expect(maskCpf('12345678900')).toBe('123.456.789-00');
    expect(maskCpf('123')).toBe('123');
    expect(maskCpf('1234567890012345')).toBe('123.456.789-00'); // clamps to 11 digits
  });

  it('masks CNPJ', () => {
    expect(maskCnpj('11222333000181')).toBe('11.222.333/0001-81');
  });

  it('auto-detects CPF vs CNPJ by length', () => {
    expect(maskCpfCnpj('12345678900')).toBe('123.456.789-00');
    expect(maskCpfCnpj('11222333000181')).toBe('11.222.333/0001-81');
  });

  it('masks mobile and landline phone numbers', () => {
    expect(maskPhone('11999998888')).toBe('(11) 99999-8888');
    expect(maskPhone('1133334444')).toBe('(11) 3333-4444');
    expect(maskPhone('119')).toBe('(11) 9');
  });

  it('strips non-digits before masking', () => {
    expect(maskCpf('abc123.456-789/00')).toBe('123.456.789-00');
  });

  it('applyMask dispatches by type', () => {
    expect(applyMask('cpf', '12345678900')).toBe('123.456.789-00');
    expect(applyMask('phone', '11999998888')).toBe('(11) 99999-8888');
  });
});

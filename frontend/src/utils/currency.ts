export const currency = (value: number) => new Intl.NumberFormat('th-TH', {
  style: 'currency', currency: 'THB', minimumFractionDigits: 0, maximumFractionDigits: 2,
}).format(value);

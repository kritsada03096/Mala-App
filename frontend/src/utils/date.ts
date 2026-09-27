export const dateTime = (value: string) => new Intl.DateTimeFormat('th-TH', {
  day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit',
}).format(new Date(value));
export const isToday = (value: string) => new Date(value).toDateString() === new Date().toDateString();

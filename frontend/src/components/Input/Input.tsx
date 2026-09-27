import { useId, type InputHTMLAttributes } from 'react';
export function Input({ label, ...props }: InputHTMLAttributes<HTMLInputElement> & { label: string }) {
  const id = useId();
  return <label className="field" htmlFor={id}><span>{label}</span><input id={id} {...props} /></label>;
}

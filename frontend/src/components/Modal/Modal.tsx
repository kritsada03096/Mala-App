import { useEffect, useRef, useId, type ReactNode } from 'react';
import { X } from 'lucide-react';
export function Modal({ title, children, onClose }: { title: string; children: ReactNode; onClose: () => void }) {
  const ref = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  useEffect(() => { const dialog = ref.current!; dialog.showModal(); return () => dialog.close(); }, []);
  return <dialog ref={ref} className="modal" aria-labelledby={titleId} onCancel={onClose}>
    <div className="modal-heading"><h2 id={titleId}>{title}</h2><button className="icon-button" onClick={onClose} aria-label="ปิด"><X size={20} /></button></div>{children}
  </dialog>;
}

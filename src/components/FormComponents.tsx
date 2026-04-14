import { useState } from "react";
import { CheckCircle, XCircle, MinusCircle, Printer } from "lucide-react";

// ─── نوع بند التشييك ─────────────────────────────────────────
export type CheckValue = "yes" | "no" | "na" | null;

export interface CheckItem {
  id: string;
  label: string;
  required?: boolean;
}

// ─── صف تشييك واحد ───────────────────────────────────────────
export function CheckRow({
  item,
  value,
  onChange,
  notes,
  onNotesChange,
}: {
  item: CheckItem;
  value: CheckValue;
  onChange: (v: CheckValue) => void;
  notes?: string;
  onNotesChange?: (n: string) => void;
}) {
  return (
    <div className="check-row gap-2">
      <div className="flex-1 min-w-0">
        <span className="text-sm text-gray-700">
          {item.required && <span className="text-red-500 ml-1">*</span>}
          {item.label}
        </span>
        {onNotesChange && (
          <input
            type="text"
            placeholder="ملاحظة..."
            value={notes || ""}
            onChange={(e) => onNotesChange(e.target.value)}
            className="mt-1 w-full text-xs px-2 py-1 rounded border border-gray-200 focus:outline-none focus:border-red-400"
          />
        )}
      </div>
      <div className="flex gap-1 flex-shrink-0">
        <button
          type="button"
          onClick={() => onChange(value === "yes" ? null : "yes")}
          className={`check-btn ${value === "yes" ? "yes" : "idle"}`}
          title="يوجد / مطابق"
        >
          ✓
        </button>
        <button
          type="button"
          onClick={() => onChange(value === "no" ? null : "no")}
          className={`check-btn ${value === "no" ? "no" : "idle"}`}
          title="لا يوجد / غير مطابق"
        >
          ✗
        </button>
        <button
          type="button"
          onClick={() => onChange(value === "na" ? null : "na")}
          className={`check-btn ${value === "na" ? "na" : "idle"}`}
          title="لا ينطبق"
        >
          —
        </button>
      </div>
    </div>
  );
}

// ─── حساب الدرجة من مجموعة بنود ─────────────────────────────
export function calcScore(values: Record<string, CheckValue>): number {
  const entries = Object.values(values).filter((v) => v !== null && v !== "na");
  if (entries.length === 0) return 0;
  const yes = entries.filter((v) => v === "yes").length;
  return Math.round((yes / entries.length) * 100);
}

// ─── شارة الدرجة ─────────────────────────────────────────────
export function ScoreBadge({ score }: { score: number }) {
  const cls =
    score >= 90 ? "excellent" :
    score >= 75 ? "good" :
    score >= 60 ? "average" : "poor";
  const label =
    score >= 90 ? "ممتاز" :
    score >= 75 ? "جيد" :
    score >= 60 ? "مقبول" : "ضعيف";
  return (
    <span className={`score-badge ${cls}`}>
      {score}% — {label}
    </span>
  );
}

// ─── رأس قسم النموذج ─────────────────────────────────────────
export function SectionHeader({
  title,
  color = "#922B21",
  score,
}: {
  title: string;
  color?: string;
  score?: number;
}) {
  return (
    <div
      className="form-section-header justify-between"
      style={{ background: color }}
    >
      <span>{title}</span>
      {score !== undefined && <ScoreBadge score={score} />}
    </div>
  );
}

// ─── حقل إدخال نصي ───────────────────────────────────────────
export function FormField({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="form-label">
        {required && <span className="text-red-500 ml-1">*</span>}
        {label}
      </label>
      {children}
    </div>
  );
}

// ─── زر الطباعة ──────────────────────────────────────────────
export function PrintButton() {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className="btn-secondary flex items-center gap-2 no-print"
    >
      <Printer size={16} />
      طباعة / PDF
    </button>
  );
}

// ─── رسالة النجاح بعد الحفظ ──────────────────────────────────
export function SuccessMessage({
  visitId,
  onNew,
}: {
  visitId: string;
  onNew: () => void;
}) {
  return (
    <div className="animate-fade-in-up text-center py-12">
      <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
        <CheckCircle size={40} className="text-green-600" />
      </div>
      <h2 className="text-2xl font-black text-gray-800 mb-2">تم الحفظ بنجاح!</h2>
      <p className="text-gray-500 mb-1">رقم الزيارة: <span className="font-bold text-gray-700">{visitId}</span></p>
      <p className="text-gray-500 mb-6 text-sm">تم إرسال البيانات إلى Google Sheets تلقائياً</p>
      <div className="flex gap-3 justify-center">
        <button onClick={() => window.print()} className="btn-secondary flex items-center gap-2">
          <Printer size={16} /> طباعة التقرير
        </button>
        <button onClick={onNew} className="btn-primary">
          + نموذج جديد
        </button>
      </div>
    </div>
  );
}

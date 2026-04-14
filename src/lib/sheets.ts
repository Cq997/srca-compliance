/**
 * ============================================================
 * Google Sheets API — قلب المنصة المستقلة
 * جميع عمليات الحفظ والقراءة تمر عبر هذا الملف
 * ============================================================
 * أضف رابط Apps Script Webhook في ملف src/lib/config.ts
 */

import { SHEETS_WEBHOOK_URL } from "./config";

// ─── أنواع البيانات ──────────────────────────────────────────
export type SheetType =
  | "comprehensive_visit"
  | "emergency_dept"
  | "badge_protection"
  | "uniform_check"
  | "spot_check"
  | "correspondence"
  | "get_visits"
  | "get_correspondences"
  | "get_stats"
  | "update_correspondence";

// ─── إرسال البيانات إلى Google Sheets (حفظ) ─────────────────
export async function sendToSheets(type: SheetType, data: Record<string, unknown>): Promise<boolean> {
  if (!SHEETS_WEBHOOK_URL) {
    console.warn("SHEETS_WEBHOOK_URL غير محدد في config.ts");
    return false;
  }
  try {
    const res = await fetch(SHEETS_WEBHOOK_URL, {
      method: "POST",
      headers: { "Content-Type": "text/plain" },
      body: JSON.stringify({ type, ...data }),
    });
    const json = await res.json();
    return json.success === true;
  } catch (err) {
    console.error("خطأ في الإرسال إلى Google Sheets:", err);
    return false;
  }
}

// ─── قراءة البيانات من Google Sheets ─────────────────────────
export async function readFromSheets(action: string, params?: Record<string, string>): Promise<unknown> {
  if (!SHEETS_WEBHOOK_URL) return null;
  try {
    const url = new URL(SHEETS_WEBHOOK_URL);
    url.searchParams.set("action", action);
    if (params) {
      Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
    }
    const res = await fetch(url.toString());
    return await res.json();
  } catch (err) {
    console.error("خطأ في القراءة من Google Sheets:", err);
    return null;
  }
}

// ─── alias لـ readFromSheets لتوافق الصفحات ───────────────────
export const getFromSheets = readFromSheets;

// ─── توليد رقم زيارة فريد ────────────────────────────────────
export function generateVisitId(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  const rand = Math.floor(Math.random() * 9000) + 1000;
  return `VIS-${y}${m}${d}-${rand}`;
}

// ─── توليد رقم مخاطبة فريد ───────────────────────────────────
export function generateCorrespondenceRef(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const rand = Math.floor(Math.random() * 9000) + 1000;
  return `CORR-${y}${m}-${rand}`;
}

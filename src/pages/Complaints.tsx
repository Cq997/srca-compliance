import { useState, useEffect } from "react";
import { SECTORS, getCentersBySector, INSPECTORS } from "../lib/config";

// ─── أنواع البيانات ───────────────────────────────────────────
interface Complaint {
  id: string;
  date: string;
  type: "شكوى" | "مخالفة";
  source: string;
  refNumber: string;
  sectorName: string;
  centerName: string;
  subject: string;
  description: string;
  inspectorName: string;
  result: string;
  notes: string;
  createdAt: string;
}

const COMPLAINT_SOURCES = ["منصة", "نظام مداد", "أخرى"];
const COMPLAINT_RESULTS = [
  "اشتباه وجود مخالفة",
  "عدم وجود مخالفة",
  "عدم ثبوت المخالفة",
  "تحت الإجراء",
];
const SUBJECTS = [
  "مخالفة استخدام الشارة",
  "إهمال في تقديم الخدمة",
  "سوء سلوك",
  "تأخر في الاستجابة",
  "نقص في المعدات",
  "مخالفة الزي الرسمي",
  "مخالفة مالية",
  "مخالفة إدارية",
  "أخرى",
];

const STORAGE_KEY = "srca_complaints";

function loadComplaints(): Complaint[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveComplaints(data: Complaint[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

// ─── الصفحة الرئيسية ─────────────────────────────────────────
export default function Complaints() {
  const [view, setView] = useState<"list" | "form">("list");
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [filterType, setFilterType] = useState("");
  const [filterSector, setFilterSector] = useState("");
  const [filterResult, setFilterResult] = useState("");
  const [search, setSearch] = useState("");

  useEffect(() => {
    setComplaints(loadComplaints());
  }, []);

  const filtered = complaints.filter((c) => {
    if (filterType && c.type !== filterType) return false;
    if (filterSector && c.sectorName !== filterSector) return false;
    if (filterResult && c.result !== filterResult) return false;
    if (search && !c.subject.includes(search) && !c.refNumber.includes(search) && !c.centerName.includes(search)) return false;
    return true;
  });

  function handleSave(complaint: Complaint) {
    const updated = [complaint, ...complaints];
    setComplaints(updated);
    saveComplaints(updated);
    setView("list");
  }

  function handleDelete(id: string) {
    if (!confirm("هل تريد حذف هذا السجل؟")) return;
    const updated = complaints.filter((c) => c.id !== id);
    setComplaints(updated);
    saveComplaints(updated);
  }

  function exportExcel() {
    const headers = ["التاريخ", "النوع", "المصدر", "الرقم المرجعي", "القطاع", "المركز", "الموضوع", "الوصف", "المفتش", "النتيجة", "ملاحظات"];
    const rows = filtered.map((c) => [c.date, c.type, c.source, c.refNumber, c.sectorName, c.centerName, c.subject, c.description, c.inspectorName, c.result, c.notes]);
    const csv = [headers, ...rows].map((r) => r.map((v) => `"${v}"`).join(",")).join("\n");
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `شكاوى_مخالفات_${new Date().toLocaleDateString("ar-SA")}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  if (view === "form") {
    return <ComplaintForm onSave={handleSave} onCancel={() => setView("list")} />;
  }

  // ─── إحصائيات سريعة ─────────────────────────────────────────
  const totalComplaints = complaints.filter((c) => c.type === "شكوى").length;
  const totalViolations = complaints.filter((c) => c.type === "مخالفة").length;
  const underAction = complaints.filter((c) => c.result === "تحت الإجراء").length;
  const suspected = complaints.filter((c) => c.result === "اشتباه وجود مخالفة").length;

  return (
    <div className="p-6 space-y-6" dir="rtl">
      {/* ─── رأس الصفحة ─── */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">الشكاوى والمخالفات</h1>
          <p className="text-gray-500 text-sm mt-1">رصد وتتبع الشكاوى والمخالفات في منطقة الرياض</p>
        </div>
        <div className="flex gap-3">
          <button onClick={exportExcel} className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm font-medium">
            ⬇ تصدير CSV
          </button>
          <button onClick={() => setView("form")} className="flex items-center gap-2 px-4 py-2 bg-red-700 text-white rounded-lg hover:bg-red-800 text-sm font-medium">
            + إضافة سجل
          </button>
        </div>
      </div>

      {/* ─── بطاقات الإحصائيات ─── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "إجمالي الشكاوى", value: totalComplaints, color: "bg-blue-50 border-blue-200 text-blue-700" },
          { label: "إجمالي المخالفات", value: totalViolations, color: "bg-red-50 border-red-200 text-red-700" },
          { label: "تحت الإجراء", value: underAction, color: "bg-yellow-50 border-yellow-200 text-yellow-700" },
          { label: "اشتباه مخالفة", value: suspected, color: "bg-orange-50 border-orange-200 text-orange-700" },
        ].map((stat) => (
          <div key={stat.label} className={`border rounded-xl p-4 ${stat.color}`}>
            <div className="text-3xl font-bold">{stat.value}</div>
            <div className="text-sm mt-1 font-medium">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* ─── فلاتر البحث ─── */}
      <div className="bg-white rounded-xl border p-4 grid grid-cols-1 md:grid-cols-4 gap-3">
        <input
          type="text"
          placeholder="بحث بالموضوع أو الرقم أو المركز..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-300"
        />
        <select value={filterType} onChange={(e) => setFilterType(e.target.value)} className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-300">
          <option value="">كل الأنواع</option>
          <option>شكوى</option>
          <option>مخالفة</option>
        </select>
        <select value={filterSector} onChange={(e) => setFilterSector(e.target.value)} className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-300">
          <option value="">كل القطاعات</option>
          {SECTORS.map((s) => <option key={s.id}>{s.name}</option>)}
        </select>
        <select value={filterResult} onChange={(e) => setFilterResult(e.target.value)} className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-300">
          <option value="">كل النتائج</option>
          {COMPLAINT_RESULTS.map((r) => <option key={r}>{r}</option>)}
        </select>
      </div>

      {/* ─── الجدول ─── */}
      <div className="bg-white rounded-xl border overflow-hidden">
        {filtered.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <div className="text-4xl mb-3">📋</div>
            <p>لا توجد سجلات مطابقة</p>
            <button onClick={() => setView("form")} className="mt-4 px-4 py-2 bg-red-700 text-white rounded-lg text-sm">إضافة أول سجل</button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b">
                <tr>
                  {["التاريخ", "النوع", "الرقم المرجعي", "القطاع", "المركز", "الموضوع", "المفتش", "النتيجة", "إجراء"].map((h) => (
                    <th key={h} className="px-4 py-3 text-right font-semibold text-gray-600">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((c, i) => (
                  <tr key={c.id} className={i % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                    <td className="px-4 py-3 text-gray-600">{c.date}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${c.type === "شكوى" ? "bg-blue-100 text-blue-700" : "bg-red-100 text-red-700"}`}>{c.type}</span>
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-gray-500">{c.refNumber}</td>
                    <td className="px-4 py-3 text-gray-700">{c.sectorName}</td>
                    <td className="px-4 py-3 text-gray-700">{c.centerName}</td>
                    <td className="px-4 py-3 text-gray-800 font-medium">{c.subject}</td>
                    <td className="px-4 py-3 text-gray-600">{c.inspectorName}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        c.result === "تحت الإجراء" ? "bg-yellow-100 text-yellow-700" :
                        c.result === "اشتباه وجود مخالفة" ? "bg-orange-100 text-orange-700" :
                        c.result === "عدم وجود مخالفة" ? "bg-green-100 text-green-700" :
                        "bg-gray-100 text-gray-600"
                      }`}>{c.result}</span>
                    </td>
                    <td className="px-4 py-3">
                      <button onClick={() => handleDelete(c.id)} className="text-red-500 hover:text-red-700 text-xs">حذف</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── نموذج الإدخال ────────────────────────────────────────────
function ComplaintForm({ onSave, onCancel }: { onSave: (c: Complaint) => void; onCancel: () => void }) {
  const today = new Date().toISOString().split("T")[0];
  const [form, setForm] = useState({
    date: today,
    type: "شكوى" as "شكوى" | "مخالفة",
    source: "",
    refNumber: `REF-${Date.now()}`,
    sectorId: "",
    sectorName: "",
    centerName: "",
    subject: "",
    description: "",
    inspectorName: "",
    result: "",
    notes: "",
  });

  const centers = form.sectorName ? getCentersBySector(form.sectorName) : [];

  function set(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function handleSectorChange(sectorName: string) {
    const sector = SECTORS.find((s) => s.name === sectorName);
    setForm((prev) => ({ ...prev, sectorName, sectorId: sector?.id ?? "", centerName: "" }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.sectorName || !form.centerName || !form.subject || !form.result) {
      alert("يرجى ملء جميع الحقول المطلوبة");
      return;
    }
    const complaint: Complaint = {
      id: crypto.randomUUID(),
      date: form.date,
      type: form.type,
      source: form.source,
      refNumber: form.refNumber,
      sectorName: form.sectorName,
      centerName: form.centerName,
      subject: form.subject,
      description: form.description,
      inspectorName: form.inspectorName,
      result: form.result,
      notes: form.notes,
      createdAt: new Date().toISOString(),
    };
    onSave(complaint);
  }

  return (
    <div className="p-6" dir="rtl">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center gap-4 mb-6">
          <button onClick={onCancel} className="text-gray-500 hover:text-gray-700">← رجوع</button>
          <h1 className="text-xl font-bold text-gray-900">إضافة شكوى / مخالفة جديدة</h1>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-xl border p-6 space-y-6">
          {/* ─── معلومات أساسية ─── */}
          <div>
            <h2 className="text-base font-semibold text-gray-800 border-b pb-2 mb-4">المعلومات الأساسية</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">التاريخ *</label>
                <input type="date" value={form.date} onChange={(e) => set("date", e.target.value)} className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-300" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">النوع *</label>
                <select value={form.type} onChange={(e) => set("type", e.target.value as "شكوى" | "مخالفة")} className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-300">
                  <option>شكوى</option>
                  <option>مخالفة</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">المصدر</label>
                <select value={form.source} onChange={(e) => set("source", e.target.value)} className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-300">
                  <option value="">اختر المصدر</option>
                  {COMPLAINT_SOURCES.map((s) => <option key={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">الرقم المرجعي</label>
                <input type="text" value={form.refNumber} onChange={(e) => set("refNumber", e.target.value)} className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-300" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">القطاع *</label>
                <select value={form.sectorName} onChange={(e) => handleSectorChange(e.target.value)} className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-300" required>
                  <option value="">اختر القطاع</option>
                  {SECTORS.map((s) => <option key={s.id}>{s.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">المركز *</label>
                <select value={form.centerName} onChange={(e) => set("centerName", e.target.value)} className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-300" required disabled={!form.sectorName}>
                  <option value="">اختر المركز</option>
                  {centers.map((c) => <option key={c}>{c}</option>)}
                </select>
              </div>
            </div>
          </div>

          {/* ─── تفاصيل الشكوى ─── */}
          <div>
            <h2 className="text-base font-semibold text-gray-800 border-b pb-2 mb-4">تفاصيل الشكوى / المخالفة</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">الموضوع *</label>
                <select value={form.subject} onChange={(e) => set("subject", e.target.value)} className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-300" required>
                  <option value="">اختر الموضوع</option>
                  {SUBJECTS.map((s) => <option key={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">المفتش المختص</label>
                <select value={form.inspectorName} onChange={(e) => set("inspectorName", e.target.value)} className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-300">
                  <option value="">اختر المفتش</option>
                  {INSPECTORS.map((i) => <option key={i}>{i}</option>)}
                </select>
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">الوصف التفصيلي</label>
                <textarea value={form.description} onChange={(e) => set("description", e.target.value)} rows={3} className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-300" placeholder="اكتب وصفاً تفصيلياً للشكوى أو المخالفة..." />
              </div>
            </div>
          </div>

          {/* ─── النتيجة ─── */}
          <div>
            <h2 className="text-base font-semibold text-gray-800 border-b pb-2 mb-4">النتيجة والإجراء</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">نتيجة الفحص *</label>
                <select value={form.result} onChange={(e) => set("result", e.target.value)} className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-300" required>
                  <option value="">اختر النتيجة</option>
                  {COMPLAINT_RESULTS.map((r) => <option key={r}>{r}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">ملاحظات</label>
                <input type="text" value={form.notes} onChange={(e) => set("notes", e.target.value)} className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-300" placeholder="أي ملاحظات إضافية..." />
              </div>
            </div>
          </div>

          {/* ─── أزرار الحفظ ─── */}
          <div className="flex gap-3 justify-end pt-2">
            <button type="button" onClick={onCancel} className="px-6 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50">إلغاء</button>
            <button type="submit" className="px-6 py-2 bg-red-700 text-white rounded-lg text-sm font-medium hover:bg-red-800">حفظ السجل</button>
          </div>
        </form>
      </div>
    </div>
  );
}

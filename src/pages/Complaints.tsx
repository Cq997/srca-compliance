import { useState, useEffect, useMemo } from "react";
import { toast } from "sonner";
import { SECTORS, INSPECTORS, getCentersBySector } from "../lib/config";
import { sendToSheets, getFromSheets } from "../lib/sheets";

// ─── أنواع البيانات ──────────────────────────────────────────
interface Complaint {
  id: string;
  type: "شكوى" | "مخالفة";
  source: string;
  refNumber: string;
  subject: string;
  sectorName: string;
  centerName: string;
  inspectorName: string;   // القائم بالفحص
  violatorName: string;    // اسم المعني/المخالف
  detectionDate: string;
  result: string;
  madaadNumber: string;    // رقم مداد (يظهر عند وجود مخالفة)
  resultDate: string;      // تاريخ النتيجة النهائية
  description: string;
  notes: string;
  createdAt: string;
}

const RESULT_OPTIONS = [
  "اشتباه وجود مخالفة",
  "عدم وجود مخالفة",
  "عدم ثبوت المخالفة",
  "تحت الإجراء",
];

const SOURCE_OPTIONS = [
  "بلاغ مواطن",
  "رصد ميداني",
  "إحالة داخلية",
  "وسائل التواصل الاجتماعي",
  "جهة حكومية",
  "أخرى",
];

const SUBJECT_OPTIONS = [
  "إهمال في تقديم الخدمة",
  "سوء التعامل",
  "مخالفة بروتوكول الإسعاف",
  "تأخر الاستجابة",
  "مخالفة مالية",
  "مخالفة إدارية",
  "مخالفة فنية",
  "أخرى",
];

// ─── مكوّن النموذج ───────────────────────────────────────────
function ComplaintForm({
  onSave,
  onCancel,
  saving,
}: {
  onSave: (data: Omit<Complaint, "id" | "createdAt">) => void;
  onCancel: () => void;
  saving: boolean;
}) {
  const [type, setType] = useState<"شكوى" | "مخالفة">("شكوى");
  const [source, setSource] = useState("");
  const [refNumber, setRefNumber] = useState("");
  const [subject, setSubject] = useState("");
  const [sectorName, setSectorName] = useState("");
  const [centerName, setCenterName] = useState("");
  const [inspectorName, setInspectorName] = useState("");
  const [violatorName, setViolatorName] = useState("");
  const [detectionDate, setDetectionDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [result, setResult] = useState("");
  const [madaadNumber, setMadaadNumber] = useState("");
  const [resultDate, setResultDate] = useState("");
  const [description, setDescription] = useState("");
  const [notes, setNotes] = useState("");

  const centers = useMemo(() => getCentersBySector(sectorName), [sectorName]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!sectorName || !inspectorName || !subject || !detectionDate) {
      toast.error("يرجى تعبئة جميع الحقول المطلوبة");
      return;
    }
    onSave({
      type,
      source,
      refNumber,
      subject,
      sectorName,
      centerName,
      inspectorName,
      violatorName,
      detectionDate,
      result,
      madaadNumber: result === "اشتباه وجود مخالفة" ? madaadNumber : "",
      resultDate,
      description,
      notes,
    });
  };

  const inputCls =
    "w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 bg-white";
  const labelCls = "block text-sm font-medium text-gray-700 mb-1";
  const requiredMark = <span className="text-red-500 mr-1">*</span>;

  return (
    <form onSubmit={handleSubmit} className="space-y-6" dir="rtl">
      {/* النوع */}
      <div className="grid grid-cols-2 gap-3">
        {(["شكوى", "مخالفة"] as const).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setType(t)}
            className={`py-3 rounded-lg font-bold text-sm border-2 transition-all ${
              type === t
                ? t === "شكوى"
                  ? "bg-blue-600 text-white border-blue-600"
                  : "bg-red-600 text-white border-red-600"
                : "bg-white text-gray-600 border-gray-300 hover:border-gray-400"
            }`}
          >
            {t === "شكوى" ? "📋 شكوى" : "⚠️ مخالفة"}
          </button>
        ))}
      </div>

      {/* رقم المعاملة والمصدر */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={labelCls}>رقم المعاملة</label>
          <input
            className={inputCls}
            value={refNumber}
            onChange={(e) => setRefNumber(e.target.value)}
            placeholder="مثال: 1234567"
          />
        </div>
        <div>
          <label className={labelCls}>المصدر {requiredMark}</label>
          <select
            className={inputCls}
            value={source}
            onChange={(e) => setSource(e.target.value)}
            required
          >
            <option value="">-- اختر --</option>
            {SOURCE_OPTIONS.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>
      </div>

      {/* الموضوع */}
      <div>
        <label className={labelCls}>الموضوع {requiredMark}</label>
        <select
          className={inputCls}
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          required
        >
          <option value="">-- اختر الموضوع --</option>
          {SUBJECT_OPTIONS.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      </div>

      {/* القطاع والمركز */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={labelCls}>القطاع {requiredMark}</label>
          <select
            className={inputCls}
            value={sectorName}
            onChange={(e) => { setSectorName(e.target.value); setCenterName(""); }}
            required
          >
            <option value="">-- اختر القطاع --</option>
            <optgroup label="قطاعات داخلية">
              {SECTORS.filter((s) => s.type === "داخلي").map((s) => (
                <option key={s.id} value={s.name}>{s.name}</option>
              ))}
            </optgroup>
            <optgroup label="قطاعات خارجية">
              {SECTORS.filter((s) => s.type === "خارجي").map((s) => (
                <option key={s.id} value={s.name}>{s.name}</option>
              ))}
            </optgroup>
          </select>
        </div>
        <div>
          <label className={labelCls}>المركز</label>
          <select
            className={inputCls}
            value={centerName}
            onChange={(e) => setCenterName(e.target.value)}
            disabled={!sectorName}
          >
            <option value="">-- اختر المركز --</option>
            {centers.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
      </div>

      {/* القائم بالفحص واسم المعني/المخالف */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={labelCls}>القائم بالفحص {requiredMark}</label>
          <select
            className={inputCls}
            value={inspectorName}
            onChange={(e) => setInspectorName(e.target.value)}
            required
          >
            <option value="">-- اختر القائم بالفحص --</option>
            {INSPECTORS.map((i) => (
              <option key={i} value={i}>{i}</option>
            ))}
          </select>
        </div>
        <div>
          <label className={labelCls}>اسم المعني / المخالف</label>
          <input
            className={inputCls}
            value={violatorName}
            onChange={(e) => setViolatorName(e.target.value)}
            placeholder="اسم الشخص المعني"
          />
        </div>
      </div>

      {/* تاريخ الرصد والنتيجة */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={labelCls}>تاريخ الرصد {requiredMark}</label>
          <input
            type="date"
            className={inputCls}
            value={detectionDate}
            onChange={(e) => setDetectionDate(e.target.value)}
            required
          />
        </div>
        <div>
          <label className={labelCls}>النتيجة</label>
          <select
            className={inputCls}
            value={result}
            onChange={(e) => setResult(e.target.value)}
          >
            <option value="">-- اختر النتيجة --</option>
            {RESULT_OPTIONS.map((r) => (
              <option key={r} value={r}>{r}</option>
            ))}
          </select>
        </div>
      </div>

      {/* رقم مداد — يظهر فقط عند اشتباه وجود مخالفة */}
      {result === "اشتباه وجود مخالفة" && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <label className={labelCls + " text-red-700"}>
            ⚠️ رقم مداد {requiredMark}
          </label>
          <input
            className={inputCls + " border-red-300 focus:ring-red-600"}
            value={madaadNumber}
            onChange={(e) => setMadaadNumber(e.target.value)}
            placeholder="أدخل رقم مداد للمخالفة"
            required
          />
          <p className="text-xs text-red-600 mt-1">
            يجب إدخال رقم مداد عند وجود اشتباه بمخالفة
          </p>
        </div>
      )}

      {/* تاريخ النتيجة النهائية */}
      <div>
        <label className={labelCls}>تاريخ النتيجة النهائية</label>
        <input
          type="date"
          className={inputCls}
          value={resultDate}
          onChange={(e) => setResultDate(e.target.value)}
        />
        {resultDate && detectionDate && resultDate >= detectionDate && (
          <p className="text-xs text-gray-500 mt-1">
            مدة الفحص:{" "}
            <span className="font-bold text-blue-700">
              {Math.round(
                (new Date(resultDate).getTime() -
                  new Date(detectionDate).getTime()) /
                  (1000 * 60 * 60 * 24)
              )}{" "}
              يوم
            </span>
          </p>
        )}
      </div>

      {/* الوصف والملاحظات */}
      <div>
        <label className={labelCls}>الوصف</label>
        <textarea
          className={inputCls}
          rows={3}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="وصف تفصيلي للشكوى أو المخالفة..."
        />
      </div>
      <div>
        <label className={labelCls}>ملاحظات</label>
        <textarea
          className={inputCls}
          rows={2}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="أي ملاحظات إضافية..."
        />
      </div>

      {/* أزرار */}
      <div className="flex gap-3 pt-2">
        <button
          type="submit"
          disabled={saving}
          className="flex-1 bg-red-700 text-white py-3 rounded-lg font-bold hover:bg-red-800 disabled:opacity-60 transition-colors"
        >
          {saving ? "⏳ جارٍ الحفظ..." : "💾 حفظ السجل"}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 bg-gray-100 text-gray-700 py-3 rounded-lg font-bold hover:bg-gray-200 transition-colors"
        >
          إلغاء
        </button>
      </div>
    </form>
  );
}

// ─── الصفحة الرئيسية ─────────────────────────────────────────
export default function Complaints() {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);

  // فلاتر
  const [filterType, setFilterType] = useState<"" | "شكوى" | "مخالفة">("");
  const [filterSector, setFilterSector] = useState("");
  const [filterInspector, setFilterInspector] = useState("");
  const [filterResult, setFilterResult] = useState("");
  const [filterDateFrom, setFilterDateFrom] = useState("");
  const [filterDateTo, setFilterDateTo] = useState("");
  const [filterResultDateFrom, setFilterResultDateFrom] = useState("");
  const [filterResultDateTo, setFilterResultDateTo] = useState("");
  const [search, setSearch] = useState("");

  // تحميل البيانات من Google Sheets
  useEffect(() => {
    loadComplaints();
  }, []);

  async function loadComplaints() {
    setLoading(true);
    try {
      const data = await getFromSheets("get_complaints");
      if (data?.complaints) {
        setComplaints(data.complaints as Complaint[]);
      }
    } catch {
      // في حال عدم إعداد Google Sheets، نبدأ بقائمة فارغة
      setComplaints([]);
    } finally {
      setLoading(false);
    }
  }

  async function handleSave(formData: Omit<Complaint, "id" | "createdAt">) {
    setSaving(true);
    const newComplaint: Complaint = {
      ...formData,
      id: `CMP-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };

    try {
      await sendToSheets({
        action: "complaint",
        ...newComplaint,
      });
      setComplaints((prev) => [newComplaint, ...prev]);
      setShowForm(false);
      toast.success("✅ تم حفظ السجل في Google Sheets بنجاح");
    } catch {
      toast.error("❌ فشل الحفظ. تحقق من إعداد Google Sheets");
    } finally {
      setSaving(false);
    }
  }

  // تصفية البيانات
  const filtered = useMemo(() => {
    return complaints.filter((c) => {
      if (filterType && c.type !== filterType) return false;
      if (filterSector && c.sectorName !== filterSector) return false;
      if (filterInspector && c.inspectorName !== filterInspector) return false;
      if (filterResult && c.result !== filterResult) return false;
      if (filterDateFrom && c.detectionDate < filterDateFrom) return false;
      if (filterDateTo && c.detectionDate > filterDateTo) return false;
      if (filterResultDateFrom && c.resultDate && c.resultDate < filterResultDateFrom) return false;
      if (filterResultDateTo && c.resultDate && c.resultDate > filterResultDateTo) return false;
      if (search) {
        const q = search.toLowerCase();
        return (
          c.subject?.toLowerCase().includes(q) ||
          c.violatorName?.toLowerCase().includes(q) ||
          c.refNumber?.toLowerCase().includes(q) ||
          c.madaadNumber?.toLowerCase().includes(q) ||
          c.centerName?.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [
    complaints, filterType, filterSector, filterInspector, filterResult,
    filterDateFrom, filterDateTo, filterResultDateFrom, filterResultDateTo, search,
  ]);

  // حساب مدة الفحص لكل قائم بالفحص
  const inspectorStats = useMemo(() => {
    const stats: Record<string, { count: number; totalDays: number; completed: number }> = {};
    complaints.forEach((c) => {
      if (!c.inspectorName) return;
      if (!stats[c.inspectorName]) stats[c.inspectorName] = { count: 0, totalDays: 0, completed: 0 };
      stats[c.inspectorName].count++;
      if (c.resultDate && c.detectionDate && c.resultDate >= c.detectionDate) {
        const days = Math.round(
          (new Date(c.resultDate).getTime() - new Date(c.detectionDate).getTime()) / (1000 * 60 * 60 * 24)
        );
        stats[c.inspectorName].totalDays += days;
        stats[c.inspectorName].completed++;
      }
    });
    return stats;
  }, [complaints]);

  // تصدير Excel
  function exportExcel() {
    const headers = [
      "الرقم", "النوع", "المصدر", "رقم المعاملة", "الموضوع",
      "القطاع", "المركز", "القائم بالفحص", "اسم المعني/المخالف",
      "تاريخ الرصد", "النتيجة", "رقم مداد", "تاريخ النتيجة النهائية",
      "مدة الفحص (أيام)", "الوصف", "الملاحظات", "تاريخ الإدخال",
    ];
    const rows = filtered.map((c) => {
      const days =
        c.resultDate && c.detectionDate && c.resultDate >= c.detectionDate
          ? Math.round(
              (new Date(c.resultDate).getTime() - new Date(c.detectionDate).getTime()) /
                (1000 * 60 * 60 * 24)
            )
          : "";
      return [
        c.id, c.type, c.source, c.refNumber, c.subject,
        c.sectorName, c.centerName, c.inspectorName, c.violatorName,
        c.detectionDate, c.result, c.madaadNumber, c.resultDate,
        days, c.description, c.notes,
        new Date(c.createdAt).toLocaleDateString("ar-SA"),
      ];
    });

    const BOM = "\uFEFF";
    const csv =
      BOM +
      [headers, ...rows]
        .map((r) => r.map((v) => `"${String(v ?? "").replace(/"/g, '""')}"`).join(","))
        .join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `سجل_الشكاوى_والمخالفات_${new Date().toLocaleDateString("ar-SA").replace(/\//g, "-")}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("تم تصدير الملف بنجاح");
  }

  const inputCls = "border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 bg-white";

  // ─── إحصائيات سريعة ──────────────────────────────────────
  const stats = useMemo(() => ({
    total: complaints.length,
    complaints: complaints.filter((c) => c.type === "شكوى").length,
    violations: complaints.filter((c) => c.type === "مخالفة").length,
    underAction: complaints.filter((c) => c.result === "تحت الإجراء").length,
    suspected: complaints.filter((c) => c.result === "اشتباه وجود مخالفة").length,
    noViolation: complaints.filter((c) => c.result === "عدم وجود مخالفة").length,
    notProven: complaints.filter((c) => c.result === "عدم ثبوت المخالفة").length,
  }), [complaints]);

  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">
      {/* رأس الصفحة */}
      <div className="bg-gradient-to-l from-red-900 to-red-700 text-white px-6 py-5">
        <div className="max-w-7xl mx-auto flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-2xl font-bold">⚖️ سجل الشكاوى والمخالفات</h1>
            <p className="text-red-200 text-sm mt-1">
              هيئة الهلال الأحمر السعودي — منطقة الرياض
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={exportExcel}
              className="bg-white text-red-800 px-4 py-2 rounded-lg font-bold text-sm hover:bg-red-50 transition-colors"
            >
              📥 تصدير Excel
            </button>
            <button
              onClick={() => setShowForm(true)}
              className="bg-red-600 text-white px-4 py-2 rounded-lg font-bold text-sm hover:bg-red-500 transition-colors border border-red-400"
            >
              ➕ إضافة سجل
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
        {/* بطاقات الإحصائيات */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
          {[
            { label: "الإجمالي", value: stats.total, color: "bg-gray-700" },
            { label: "شكاوى", value: stats.complaints, color: "bg-blue-600" },
            { label: "مخالفات", value: stats.violations, color: "bg-red-600" },
            { label: "تحت الإجراء", value: stats.underAction, color: "bg-yellow-600" },
            { label: "اشتباه مخالفة", value: stats.suspected, color: "bg-orange-600" },
            { label: "لا مخالفة", value: stats.noViolation, color: "bg-green-600" },
            { label: "لم تثبت", value: stats.notProven, color: "bg-purple-600" },
          ].map((s) => (
            <div key={s.label} className={`${s.color} text-white rounded-xl p-3 text-center`}>
              <div className="text-2xl font-bold">{s.value}</div>
              <div className="text-xs mt-1 opacity-90">{s.label}</div>
            </div>
          ))}
        </div>

        {/* نموذج الإضافة */}
        {showForm && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <div className="bg-gradient-to-l from-red-900 to-red-700 text-white px-6 py-4 rounded-t-2xl">
                <h2 className="text-xl font-bold">➕ إضافة سجل جديد</h2>
              </div>
              <div className="p-6">
                <ComplaintForm
                  onSave={handleSave}
                  onCancel={() => setShowForm(false)}
                  saving={saving}
                />
              </div>
            </div>
          </div>
        )}

        {/* الفلاتر */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <h3 className="font-bold text-gray-700 mb-3 text-sm">🔍 فلترة وبحث</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <input
              className={inputCls + " col-span-2 md:col-span-1"}
              placeholder="بحث بالموضوع أو الاسم أو الرقم..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <select className={inputCls} value={filterType} onChange={(e) => setFilterType(e.target.value as "" | "شكوى" | "مخالفة")}>
              <option value="">كل الأنواع</option>
              <option value="شكوى">شكوى</option>
              <option value="مخالفة">مخالفة</option>
            </select>
            <select className={inputCls} value={filterSector} onChange={(e) => setFilterSector(e.target.value)}>
              <option value="">كل القطاعات</option>
              {SECTORS.map((s) => <option key={s.id} value={s.name}>{s.name}</option>)}
            </select>
            <select className={inputCls} value={filterInspector} onChange={(e) => setFilterInspector(e.target.value)}>
              <option value="">كل القائمين بالفحص</option>
              {INSPECTORS.map((i) => <option key={i} value={i}>{i}</option>)}
            </select>
            <select className={inputCls} value={filterResult} onChange={(e) => setFilterResult(e.target.value)}>
              <option value="">كل النتائج</option>
              {RESULT_OPTIONS.map((r) => <option key={r} value={r}>{r}</option>)}
            </select>
          </div>
          {/* فلترة تاريخ الرصد */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-3">
            <div>
              <label className="text-xs text-gray-500 block mb-1">تاريخ الرصد من</label>
              <input type="date" className={inputCls} value={filterDateFrom} onChange={(e) => setFilterDateFrom(e.target.value)} />
            </div>
            <div>
              <label className="text-xs text-gray-500 block mb-1">تاريخ الرصد إلى</label>
              <input type="date" className={inputCls} value={filterDateTo} onChange={(e) => setFilterDateTo(e.target.value)} />
            </div>
            <div>
              <label className="text-xs text-gray-500 block mb-1">تاريخ النتيجة من</label>
              <input type="date" className={inputCls} value={filterResultDateFrom} onChange={(e) => setFilterResultDateFrom(e.target.value)} />
            </div>
            <div>
              <label className="text-xs text-gray-500 block mb-1">تاريخ النتيجة إلى</label>
              <input type="date" className={inputCls} value={filterResultDateTo} onChange={(e) => setFilterResultDateTo(e.target.value)} />
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            عرض <span className="font-bold text-red-700">{filtered.length}</span> من أصل {complaints.length} سجل
          </p>
        </div>

        {/* جدول السجلات */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          {loading ? (
            <div className="text-center py-16 text-gray-500">
              <div className="text-4xl mb-3">⏳</div>
              <p>جارٍ تحميل البيانات من Google Sheets...</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-16 text-gray-400">
              <div className="text-5xl mb-3">📋</div>
              <p className="font-medium">لا توجد سجلات</p>
              <p className="text-sm mt-1">اضغط "إضافة سجل" لإدخال أول سجل</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-red-800 text-white">
                    <th className="px-3 py-3 text-right font-medium">الرقم</th>
                    <th className="px-3 py-3 text-right font-medium">النوع</th>
                    <th className="px-3 py-3 text-right font-medium">الموضوع</th>
                    <th className="px-3 py-3 text-right font-medium">القطاع</th>
                    <th className="px-3 py-3 text-right font-medium">القائم بالفحص</th>
                    <th className="px-3 py-3 text-right font-medium">المعني/المخالف</th>
                    <th className="px-3 py-3 text-right font-medium">تاريخ الرصد</th>
                    <th className="px-3 py-3 text-right font-medium">النتيجة</th>
                    <th className="px-3 py-3 text-right font-medium">رقم مداد</th>
                    <th className="px-3 py-3 text-right font-medium">مدة الفحص</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((c, idx) => {
                    const days =
                      c.resultDate && c.detectionDate && c.resultDate >= c.detectionDate
                        ? Math.round(
                            (new Date(c.resultDate).getTime() - new Date(c.detectionDate).getTime()) /
                              (1000 * 60 * 60 * 24)
                          )
                        : null;
                    return (
                      <tr
                        key={c.id}
                        className={`border-b border-gray-100 hover:bg-red-50 transition-colors ${
                          idx % 2 === 0 ? "bg-white" : "bg-gray-50"
                        }`}
                      >
                        <td className="px-3 py-3 text-gray-500 text-xs">{c.id}</td>
                        <td className="px-3 py-3">
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-bold ${
                              c.type === "مخالفة"
                                ? "bg-red-100 text-red-700"
                                : "bg-blue-100 text-blue-700"
                            }`}
                          >
                            {c.type}
                          </span>
                        </td>
                        <td className="px-3 py-3 font-medium text-gray-800 max-w-[150px] truncate">{c.subject}</td>
                        <td className="px-3 py-3 text-gray-600 text-xs">{c.sectorName}</td>
                        <td className="px-3 py-3 text-gray-700">{c.inspectorName}</td>
                        <td className="px-3 py-3 text-gray-600">{c.violatorName || "—"}</td>
                        <td className="px-3 py-3 text-gray-600 text-xs">{c.detectionDate}</td>
                        <td className="px-3 py-3">
                          {c.result ? (
                            <span
                              className={`px-2 py-1 rounded-full text-xs font-medium ${
                                c.result === "اشتباه وجود مخالفة"
                                  ? "bg-orange-100 text-orange-700"
                                  : c.result === "تحت الإجراء"
                                  ? "bg-yellow-100 text-yellow-700"
                                  : c.result === "عدم وجود مخالفة"
                                  ? "bg-green-100 text-green-700"
                                  : "bg-purple-100 text-purple-700"
                              }`}
                            >
                              {c.result}
                            </span>
                          ) : (
                            <span className="text-gray-400 text-xs">—</span>
                          )}
                        </td>
                        <td className="px-3 py-3 text-xs font-mono text-red-700">
                          {c.madaadNumber || "—"}
                        </td>
                        <td className="px-3 py-3 text-xs text-center">
                          {days !== null ? (
                            <span
                              className={`px-2 py-1 rounded-full font-bold ${
                                days <= 7
                                  ? "bg-green-100 text-green-700"
                                  : days <= 30
                                  ? "bg-yellow-100 text-yellow-700"
                                  : "bg-red-100 text-red-700"
                              }`}
                            >
                              {days} يوم
                            </span>
                          ) : (
                            <span className="text-gray-400">—</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* إحصائيات مدة الفحص لكل قائم بالفحص */}
        {Object.keys(inspectorStats).length > 0 && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
            <h3 className="font-bold text-gray-800 mb-4 text-base">
              📊 متوسط مدة الفحص لكل قائم بالفحص
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="px-4 py-2 text-right font-medium text-gray-700">القائم بالفحص</th>
                    <th className="px-4 py-2 text-center font-medium text-gray-700">إجمالي السجلات</th>
                    <th className="px-4 py-2 text-center font-medium text-gray-700">المكتملة</th>
                    <th className="px-4 py-2 text-center font-medium text-gray-700">متوسط المدة (أيام)</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(inspectorStats)
                    .sort((a, b) => b[1].count - a[1].count)
                    .map(([name, s], i) => (
                      <tr key={name} className={i % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                        <td className="px-4 py-2 font-medium text-gray-800">{name}</td>
                        <td className="px-4 py-2 text-center text-gray-600">{s.count}</td>
                        <td className="px-4 py-2 text-center text-green-700 font-medium">{s.completed}</td>
                        <td className="px-4 py-2 text-center">
                          {s.completed > 0 ? (
                            <span
                              className={`px-3 py-1 rounded-full font-bold text-xs ${
                                Math.round(s.totalDays / s.completed) <= 7
                                  ? "bg-green-100 text-green-700"
                                  : Math.round(s.totalDays / s.completed) <= 30
                                  ? "bg-yellow-100 text-yellow-700"
                                  : "bg-red-100 text-red-700"
                              }`}
                            >
                              {Math.round(s.totalDays / s.completed)} يوم
                            </span>
                          ) : (
                            <span className="text-gray-400">—</span>
                          )}
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

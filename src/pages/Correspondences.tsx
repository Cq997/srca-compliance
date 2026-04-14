import { useState } from "react";
import { FileText, Save, Plus, X } from "lucide-react";
import { SECTORS, INSPECTORS } from "@/lib/config";
import { sendToSheets, generateVisitId } from "@/lib/sheets";
import { FormField, PrintButton, SectionHeader } from "@/components/FormComponents";
import { toast } from "sonner";

const DEPARTMENTS = ["إدارة المراكز الإسعافية","إدارة التموين الطبي","إدارة الموارد البشرية","إدارة الصيانة","إدارة الجودة","إدارة العمليات","إدارة المالية","أخرى"];
const PRIORITIES = ["عاجل","عالي","متوسط","منخفض"];
const STATUSES = ["مفتوحة","قيد المعالجة","معالجة","مغلقة"];

export default function Correspondences() {
  const [saved, setSaved] = useState(false);
  const [savedId, setSavedId] = useState("");
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    sectorId: "", centerName: "", inspectorName: "", visitDate: new Date().toISOString().split("T")[0],
    toDepartment: "", subject: "", priority: "متوسط", status: "مفتوحة",
    violationsText: "", requiredActions: "", deadline: "", notes: "",
  });
  const [violations, setViolations] = useState<string[]>([""]);

  const sectorName = SECTORS.find(s => s.id === form.sectorId)?.name || "";

  const handleSave = async () => {
    if (!form.sectorId || !form.toDepartment || !form.subject || !form.inspectorName) {
      toast.error("يرجى تعبئة الحقول المطلوبة"); return;
    }
    setSaving(true);
    const corrId = "MKH-" + Date.now().toString().slice(-6);
    const ok = await sendToSheets("correspondence", {
      corrId, sectorName, centerName: form.centerName, inspectorName: form.inspectorName,
      visitDate: form.visitDate, toDepartment: form.toDepartment, subject: form.subject,
      priority: form.priority, status: form.status,
      violations: violations.filter(v => v.trim()),
      requiredActions: form.requiredActions, deadline: form.deadline, notes: form.notes,
    });
    setSaving(false);
    if (ok) { setSavedId(corrId); setSaved(true); toast.success("تم إرسال المخاطبة بنجاح"); }
    else toast.error("خطأ في الإرسال");
  };

  if (saved) return (
    <div className="card p-8 max-w-2xl mx-auto text-center animate-fade-in-up">
      <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
        <FileText size={40} className="text-green-600" />
      </div>
      <h2 className="text-2xl font-black text-gray-800 mb-2">تم إرسال المخاطبة!</h2>
      <p className="text-gray-500 mb-1">رقم المخاطبة: <span className="font-bold text-gray-700">{savedId}</span></p>
      <p className="text-gray-500 mb-6 text-sm">تم الحفظ في Google Sheets تلقائياً</p>
      <div className="flex gap-3 justify-center">
        <button onClick={() => window.print()} className="btn-secondary flex items-center gap-2"><FileText size={16} />طباعة</button>
        <button onClick={() => setSaved(false)} className="btn-primary">+ مخاطبة جديدة</button>
      </div>
    </div>
  );

  return (
    <div className="animate-fade-in-up">
      <div className="page-header mb-6">
        <div className="flex items-start justify-between">
          <div><h1 className="text-2xl font-black mb-1">نموذج المخاطبات الرسمية</h1><p className="text-white/80 text-sm">مراسلة الإدارات ذات العلاقة بشأن الملاحظات والمخالفات</p></div>
          <PrintButton />
        </div>
      </div>

      <div className="form-section mb-4">
        <SectionHeader title="بيانات المخاطبة" color="#1A5276" />
        <div className="form-section-body grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <FormField label="القطاع" required><select className="form-input" value={form.sectorId} onChange={e => setForm({...form, sectorId: e.target.value})}><option value="">-- اختر --</option>{SECTORS.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}</select></FormField>
          <FormField label="المركز"><input className="form-input" value={form.centerName} onChange={e => setForm({...form, centerName: e.target.value})} /></FormField>
          <FormField label="المفتش" required><select className="form-input" value={form.inspectorName} onChange={e => setForm({...form, inspectorName: e.target.value})}><option value="">-- اختر --</option>{INSPECTORS.map(i => <option key={i}>{i}</option>)}</select></FormField>
          <FormField label="إلى الإدارة" required><select className="form-input" value={form.toDepartment} onChange={e => setForm({...form, toDepartment: e.target.value})}><option value="">-- اختر --</option>{DEPARTMENTS.map(d => <option key={d}>{d}</option>)}</select></FormField>
          <FormField label="الأولوية"><select className="form-input" value={form.priority} onChange={e => setForm({...form, priority: e.target.value})}>{PRIORITIES.map(p => <option key={p}>{p}</option>)}</select></FormField>
          <FormField label="الحالة"><select className="form-input" value={form.status} onChange={e => setForm({...form, status: e.target.value})}>{STATUSES.map(s => <option key={s}>{s}</option>)}</select></FormField>
          <div className="md:col-span-2 lg:col-span-3"><FormField label="الموضوع" required><input className="form-input" value={form.subject} onChange={e => setForm({...form, subject: e.target.value})} placeholder="موضوع المخاطبة..." /></FormField></div>
          <FormField label="تاريخ المخاطبة"><input type="date" className="form-input" value={form.visitDate} onChange={e => setForm({...form, visitDate: e.target.value})} /></FormField>
          <FormField label="الموعد النهائي للمعالجة"><input type="date" className="form-input" value={form.deadline} onChange={e => setForm({...form, deadline: e.target.value})} /></FormField>
        </div>
      </div>

      <div className="form-section mb-4">
        <SectionHeader title="المخالفات والملاحظات المرصودة" color="#922B21" />
        <div className="form-section-body space-y-2">
          {violations.map((v, i) => (
            <div key={i} className="flex gap-2">
              <span className="w-6 h-9 flex items-center justify-center text-sm font-bold text-gray-400">{i + 1}</span>
              <input className="form-input flex-1" value={v} onChange={e => { const arr = [...violations]; arr[i] = e.target.value; setViolations(arr); }} placeholder={`المخالفة ${i + 1}...`} />
              {violations.length > 1 && <button type="button" onClick={() => setViolations(violations.filter((_, j) => j !== i))} className="text-red-400 hover:text-red-600"><X size={18} /></button>}
            </div>
          ))}
          <button type="button" onClick={() => setViolations([...violations, ""])} className="flex items-center gap-2 text-sm font-semibold mt-2" style={{ color: "#922B21" }}>
            <Plus size={16} /> إضافة مخالفة
          </button>
        </div>
      </div>

      <div className="form-section mb-4">
        <SectionHeader title="الإجراءات المطلوبة" color="#117A65" />
        <div className="form-section-body">
          <textarea className="form-input" rows={4} value={form.requiredActions} onChange={e => setForm({...form, requiredActions: e.target.value})} placeholder="اذكر الإجراءات التصحيحية المطلوبة بالتفصيل..." />
        </div>
      </div>

      <button onClick={handleSave} disabled={saving} className="btn-primary w-full py-4 flex items-center justify-center gap-3">
        {saving ? <><div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />جاري الإرسال...</> : <><Save size={20} />إرسال المخاطبة إلى Google Sheets</>}
      </button>
    </div>
  );
}

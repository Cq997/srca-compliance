import { useState } from "react";
import { AlertTriangle, Save } from "lucide-react";
import { SECTORS, INSPECTORS } from "@/lib/config";
import { sendToSheets, generateVisitId } from "@/lib/sheets";
import { CheckRow, SectionHeader, FormField, PrintButton, SuccessMessage, calcScore, type CheckValue } from "@/components/FormComponents";
import { toast } from "sonner";

const ITEMS = [
  { id: "e1",  label: "التحقق من إغلاق أبواب سيارة الإسعاف بالمفتاح", required: true },
  { id: "e2",  label: "التحقق من تأمين الأدراج والخزائن الداخلية", required: true },
  { id: "e3",  label: "التحقق من إيقاف تشغيل الأجهزة الكهربائية" },
  { id: "e4",  label: "التحقق من رفع الهوائيات وإغلاق النوافذ" },
  { id: "e5",  label: "وجود الطاقم الطبي بالقرب من السيارة" },
  { id: "e6",  label: "عدم ترك أشياء ثمينة ظاهرة داخل السيارة" },
  { id: "e7",  label: "التحقق من إغلاق باب المؤخرة بشكل محكم" },
  { id: "e8",  label: "وجود لافتة تعريفية للهيئة على السيارة" },
  { id: "e9",  label: "الالتزام بمكان وقوف محدد ومخصص" },
  { id: "e10", label: "التحقق من سلامة الأجهزة الطبية من السرقة", required: true },
];

export default function EmergencyDeptForm() {
  const [saved, setSaved] = useState(false);
  const [savedId, setSavedId] = useState("");
  const [saving, setSaving] = useState(false);
  const [info, setInfo] = useState({ sectorId: "", centerName: "", hospitalName: "", emergencyDeptName: "", inspectorName: "", visitDate: new Date().toISOString().split("T")[0], notes: "" });
  const [checks, setChecks] = useState<Record<string, CheckValue>>(Object.fromEntries(ITEMS.map(i => [i.id, null])));

  const score = calcScore(checks);
  const sectorName = SECTORS.find(s => s.id === info.sectorId)?.name || "";

  const handleSave = async () => {
    if (!info.sectorId || !info.hospitalName || !info.inspectorName) { toast.error("يرجى تعبئة الحقول المطلوبة"); return; }
    setSaving(true);
    const visitId = generateVisitId();
    const ok = await sendToSheets("emergency_dept", { visitId, sectorName, centerName: info.centerName, hospitalName: info.hospitalName, emergencyDeptName: info.emergencyDeptName, visitDate: info.visitDate, inspectorName: info.inspectorName, totalScore: score, notes: info.notes, checkItems: checks });
    setSaving(false);
    if (ok) { setSavedId(visitId); setSaved(true); toast.success("تم الحفظ بنجاح"); }
    else toast.error("خطأ في الإرسال");
  };

  const reset = () => { setSaved(false); setSavedId(""); setInfo({ sectorId: "", centerName: "", hospitalName: "", emergencyDeptName: "", inspectorName: "", visitDate: new Date().toISOString().split("T")[0], notes: "" }); setChecks(Object.fromEntries(ITEMS.map(i => [i.id, null]))); };

  if (saved) return <div className="card p-8 max-w-2xl mx-auto"><SuccessMessage visitId={savedId} onNew={reset} /></div>;

  return (
    <div className="animate-fade-in-up">
      <div className="page-header mb-6">
        <div className="flex items-start justify-between">
          <div><h1 className="text-2xl font-black mb-1">نموذج زيارة أقسام الطوارئ</h1><p className="text-white/80 text-sm">التحقق من التزام الطواقم بإغلاق وتأمين سيارات الإسعاف</p></div>
          <PrintButton />
        </div>
      </div>
      <div className="form-section mb-4">
        <SectionHeader title="البيانات الأساسية" color="#1A5276" />
        <div className="form-section-body grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <FormField label="القطاع" required><select className="form-input" value={info.sectorId} onChange={e => setInfo({...info, sectorId: e.target.value})}><option value="">-- اختر --</option>{SECTORS.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}</select></FormField>
          <FormField label="اسم المستشفى" required><input className="form-input" value={info.hospitalName} onChange={e => setInfo({...info, hospitalName: e.target.value})} placeholder="اسم المستشفى" /></FormField>
          <FormField label="قسم الطوارئ"><input className="form-input" value={info.emergencyDeptName} onChange={e => setInfo({...info, emergencyDeptName: e.target.value})} /></FormField>
          <FormField label="المفتش" required><select className="form-input" value={info.inspectorName} onChange={e => setInfo({...info, inspectorName: e.target.value})}><option value="">-- اختر --</option>{INSPECTORS.map(i => <option key={i}>{i}</option>)}</select></FormField>
          <FormField label="التاريخ" required><input type="date" className="form-input" value={info.visitDate} onChange={e => setInfo({...info, visitDate: e.target.value})} /></FormField>
          <FormField label="ملاحظات"><input className="form-input" value={info.notes} onChange={e => setInfo({...info, notes: e.target.value})} /></FormField>
        </div>
      </div>
      <div className="form-section mb-4">
        <SectionHeader title="بنود التشييك" color="#8E44AD" score={score} />
        <div className="form-section-body">{ITEMS.map(item => <CheckRow key={item.id} item={item} value={checks[item.id]} onChange={v => setChecks({...checks, [item.id]: v})} />)}</div>
      </div>
      <button onClick={handleSave} disabled={saving} className="btn-primary w-full py-4 flex items-center justify-center gap-3">
        {saving ? <><div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />جاري الحفظ...</> : <><Save size={20} />حفظ وإرسال إلى Google Sheets</>}
      </button>
    </div>
  );
}

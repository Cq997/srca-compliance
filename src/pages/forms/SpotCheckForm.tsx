import { useState } from "react";
import { Eye, Save } from "lucide-react";
import { SECTORS, INSPECTORS } from "@/lib/config";
import { sendToSheets, generateVisitId } from "@/lib/sheets";
import { CheckRow, SectionHeader, FormField, PrintButton, SuccessMessage, calcScore, type CheckValue } from "@/components/FormComponents";
import { toast } from "sonner";

const ITEMS = [
  { id: "sc1",  label: "جاهزية الطاقم الطبي الكاملة", required: true },
  { id: "sc2",  label: "جاهزية سيارة الإسعاف للانطلاق الفوري", required: true },
  { id: "sc3",  label: "اكتمال المعدات الطبية الأساسية", required: true },
  { id: "sc4",  label: "مستوى الوقود لا يقل عن 3/4", required: true },
  { id: "sc5",  label: "شحن أسطوانة الأكسجين كافٍ", required: true },
  { id: "sc6",  label: "جهاز الاتصال اللاسلكي يعمل" },
  { id: "sc7",  label: "الزي الرسمي وبطاقة العمل" },
  { id: "sc8",  label: "نظافة السيارة والمركز" },
  { id: "sc9",  label: "سجل الزيارات محدّث" },
  { id: "sc10", label: "الالتزام بمكان الوقوف المحدد" },
  { id: "sc11", label: "عدم وجود نواقص طبية حرجة", required: true },
  { id: "sc12", label: "جهاز إزالة الرجفان جاهز ومشحون", required: true },
];

const READINESS_LEVELS = ["جاهز تماماً","جاهز مع ملاحظات","غير جاهز"];

export default function SpotCheckForm() {
  const [saved, setSaved] = useState(false);
  const [savedId, setSavedId] = useState("");
  const [saving, setSaving] = useState(false);
  const [info, setInfo] = useState({ sectorId: "", centerName: "", inspectorName: "", visitDate: new Date().toISOString().split("T")[0], overallReadiness: "جاهز تماماً", criticalIssues: "", recommendations: "", notes: "" });
  const [checks, setChecks] = useState<Record<string, CheckValue>>(Object.fromEntries(ITEMS.map(i => [i.id, null])));
  const score = calcScore(checks);
  const sectorName = SECTORS.find(s => s.id === info.sectorId)?.name || "";

  const handleSave = async () => {
    if (!info.sectorId || !info.centerName || !info.inspectorName) { toast.error("يرجى تعبئة الحقول المطلوبة"); return; }
    setSaving(true);
    const visitId = generateVisitId();
    const ok = await sendToSheets("spot_check", { visitId, sectorName, centerName: info.centerName, visitDate: info.visitDate, inspectorName: info.inspectorName, overallReadiness: info.overallReadiness, totalScore: score, criticalIssues: info.criticalIssues, recommendations: info.recommendations, notes: info.notes, checkItems: checks });
    setSaving(false);
    if (ok) { setSavedId(visitId); setSaved(true); toast.success("تم الحفظ بنجاح"); }
    else toast.error("خطأ في الإرسال");
  };

  if (saved) return <div className="card p-8 max-w-2xl mx-auto"><SuccessMessage visitId={savedId} onNew={() => setSaved(false)} /></div>;

  return (
    <div className="animate-fade-in-up">
      <div className="page-header mb-6">
        <div className="flex items-start justify-between">
          <div><h1 className="text-2xl font-black mb-1">نموذج الوقوف على مركز إسعافي</h1><p className="text-white/80 text-sm">التحقق الشامل من جاهزية المركز من جميع النواحي</p></div>
          <PrintButton />
        </div>
      </div>
      <div className="form-section mb-4">
        <SectionHeader title="البيانات الأساسية" color="#1A5276" />
        <div className="form-section-body grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <FormField label="القطاع" required><select className="form-input" value={info.sectorId} onChange={e => setInfo({...info, sectorId: e.target.value})}><option value="">-- اختر --</option>{SECTORS.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}</select></FormField>
          <FormField label="اسم المركز" required><input className="form-input" value={info.centerName} onChange={e => setInfo({...info, centerName: e.target.value})} /></FormField>
          <FormField label="المفتش" required><select className="form-input" value={info.inspectorName} onChange={e => setInfo({...info, inspectorName: e.target.value})}><option value="">-- اختر --</option>{INSPECTORS.map(i => <option key={i}>{i}</option>)}</select></FormField>
          <FormField label="التاريخ"><input type="date" className="form-input" value={info.visitDate} onChange={e => setInfo({...info, visitDate: e.target.value})} /></FormField>
          <FormField label="مستوى الجاهزية العام"><select className="form-input" value={info.overallReadiness} onChange={e => setInfo({...info, overallReadiness: e.target.value})}>{READINESS_LEVELS.map(r => <option key={r}>{r}</option>)}</select></FormField>
          <FormField label="مشكلات حرجة"><input className="form-input" value={info.criticalIssues} onChange={e => setInfo({...info, criticalIssues: e.target.value})} /></FormField>
          <div className="md:col-span-3"><FormField label="التوصيات"><textarea className="form-input" rows={2} value={info.recommendations} onChange={e => setInfo({...info, recommendations: e.target.value})} /></FormField></div>
        </div>
      </div>
      <div className="form-section mb-4">
        <SectionHeader title="بنود التشييك" color="#1E8449" score={score} />
        <div className="form-section-body">{ITEMS.map(item => <CheckRow key={item.id} item={item} value={checks[item.id]} onChange={v => setChecks({...checks, [item.id]: v})} />)}</div>
      </div>
      <button onClick={handleSave} disabled={saving} className="btn-primary w-full py-4 flex items-center justify-center gap-3">
        {saving ? <><div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />جاري الحفظ...</> : <><Save size={20} />حفظ وإرسال</>}
      </button>
    </div>
  );
}

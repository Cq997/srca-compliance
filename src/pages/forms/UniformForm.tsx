import { useState } from "react";
import { UserCheck, Save } from "lucide-react";
import { SECTORS, INSPECTORS } from "@/lib/config";
import { sendToSheets, generateVisitId } from "@/lib/sheets";
import { CheckRow, SectionHeader, FormField, PrintButton, SuccessMessage, calcScore, type CheckValue } from "@/components/FormComponents";
import { toast } from "sonner";

const ITEMS = [
  { id: "u1",  label: "ارتداء الزي الرسمي الكامل للهيئة", required: true },
  { id: "u2",  label: "نظافة الزي وكيّه وخلوّه من البقع" },
  { id: "u3",  label: "ارتداء بطاقة العمل بشكل ظاهر", required: true },
  { id: "u4",  label: "صحة البيانات على بطاقة العمل" },
  { id: "u5",  label: "ارتداء الشارات والرتب الوظيفية" },
  { id: "u6",  label: "الالتزام بمواصفات الحذاء الرسمي" },
  { id: "u7",  label: "عدم ارتداء إكسسوارات غير لائقة" },
  { id: "u8",  label: "الالتزام بالمظهر العام (الشعر، اللحية)" },
  { id: "u9",  label: "عدم استخدام الجوال أثناء الخدمة" },
  { id: "u10", label: "الالتزام بالسلوك المهني اللائق" },
];

const LOCATION_TYPES = ["مركز إسعافي","غرفة عمليات","مستشفى","موقع ميداني","أخرى"];

export default function UniformForm() {
  const [saved, setSaved] = useState(false);
  const [savedId, setSavedId] = useState("");
  const [saving, setSaving] = useState(false);
  const [info, setInfo] = useState({ sectorId: "", location: "", locationType: "", inspectorName: "", visitDate: new Date().toISOString().split("T")[0], notes: "" });
  const [checks, setChecks] = useState<Record<string, CheckValue>>(Object.fromEntries(ITEMS.map(i => [i.id, null])));
  const score = calcScore(checks);
  const sectorName = SECTORS.find(s => s.id === info.sectorId)?.name || "";

  const handleSave = async () => {
    if (!info.sectorId || !info.location || !info.inspectorName) { toast.error("يرجى تعبئة الحقول المطلوبة"); return; }
    setSaving(true);
    const visitId = generateVisitId();
    const ok = await sendToSheets("uniform_check", { visitId, sectorName, location: info.location, locationType: info.locationType, visitDate: info.visitDate, inspectorName: info.inspectorName, totalScore: score, notes: info.notes, checkItems: checks });
    setSaving(false);
    if (ok) { setSavedId(visitId); setSaved(true); toast.success("تم الحفظ بنجاح"); }
    else toast.error("خطأ في الإرسال");
  };

  if (saved) return <div className="card p-8 max-w-2xl mx-auto"><SuccessMessage visitId={savedId} onNew={() => setSaved(false)} /></div>;

  return (
    <div className="animate-fade-in-up">
      <div className="page-header mb-6">
        <div className="flex items-start justify-between">
          <div><h1 className="text-2xl font-black mb-1">نموذج الالتزام بالزي الرسمي وبطاقة العمل</h1><p className="text-white/80 text-sm">التحقق من الالتزام بالزي الرسمي في غرف العمليات والمراكز الإسعافية</p></div>
          <PrintButton />
        </div>
      </div>
      <div className="form-section mb-4">
        <SectionHeader title="البيانات الأساسية" color="#1A5276" />
        <div className="form-section-body grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <FormField label="القطاع" required><select className="form-input" value={info.sectorId} onChange={e => setInfo({...info, sectorId: e.target.value})}><option value="">-- اختر --</option>{SECTORS.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}</select></FormField>
          <FormField label="الموقع" required><input className="form-input" value={info.location} onChange={e => setInfo({...info, location: e.target.value})} placeholder="اسم المركز أو الموقع" /></FormField>
          <FormField label="نوع الموقع"><select className="form-input" value={info.locationType} onChange={e => setInfo({...info, locationType: e.target.value})}><option value="">-- اختر --</option>{LOCATION_TYPES.map(t => <option key={t}>{t}</option>)}</select></FormField>
          <FormField label="المفتش" required><select className="form-input" value={info.inspectorName} onChange={e => setInfo({...info, inspectorName: e.target.value})}><option value="">-- اختر --</option>{INSPECTORS.map(i => <option key={i}>{i}</option>)}</select></FormField>
          <FormField label="التاريخ"><input type="date" className="form-input" value={info.visitDate} onChange={e => setInfo({...info, visitDate: e.target.value})} /></FormField>
          <FormField label="ملاحظات"><input className="form-input" value={info.notes} onChange={e => setInfo({...info, notes: e.target.value})} /></FormField>
        </div>
      </div>
      <div className="form-section mb-4">
        <SectionHeader title="بنود التشييك" color="#2471A3" score={score} />
        <div className="form-section-body">{ITEMS.map(item => <CheckRow key={item.id} item={item} value={checks[item.id]} onChange={v => setChecks({...checks, [item.id]: v})} />)}</div>
      </div>
      <button onClick={handleSave} disabled={saving} className="btn-primary w-full py-4 flex items-center justify-center gap-3">
        {saving ? <><div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />جاري الحفظ...</> : <><Save size={20} />حفظ وإرسال</>}
      </button>
    </div>
  );
}

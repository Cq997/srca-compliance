import { useState } from "react";
import { Shield, Save } from "lucide-react";
import { SECTORS, INSPECTORS } from "@/lib/config";
import { sendToSheets, generateVisitId } from "@/lib/sheets";
import { CheckRow, SectionHeader, FormField, PrintButton, SuccessMessage, calcScore, type CheckValue } from "@/components/FormComponents";
import { toast } from "sonner";

const ITEMS = [
  { id: "b1",  label: "استخدام شعار الهلال الأحمر على واجهة المنشأة", required: true },
  { id: "b2",  label: "استخدام الشعار على سيارات الإسعاف الخاصة", required: true },
  { id: "b3",  label: "استخدام الشعار على اللافتات الإعلانية" },
  { id: "b4",  label: "استخدام الشعار على الملابس والزي" },
  { id: "b5",  label: "استخدام الشعار على المطبوعات والوثائق" },
  { id: "b6",  label: "استخدام الشعار على المواقع الإلكترونية" },
  { id: "b7",  label: "استخدام الشعار على وسائل التواصل الاجتماعي" },
  { id: "b8",  label: "استخدام مسمى الهلال الأحمر بشكل غير رسمي" },
  { id: "b9",  label: "وجود ترخيص رسمي من الهيئة لاستخدام الشعار" },
  { id: "b10", label: "الالتزام بالمواصفات الرسمية للشعار (الألوان والأبعاد)" },
];

const FACILITY_TYPES = ["مستشفى خاص","عيادة طبية","صيدلية","مركز طبي","مستوصف","سيارة إسعاف خاصة","أخرى"];

export default function BadgeProtectionForm() {
  const [saved, setSaved] = useState(false);
  const [savedId, setSavedId] = useState("");
  const [saving, setSaving] = useState(false);
  const [info, setInfo] = useState({ sectorId: "", facilityName: "", facilityType: "", facilityAddress: "", inspectorName: "", visitDate: new Date().toISOString().split("T")[0], hasViolation: false, violationDetails: "", actionTaken: "", notes: "" });
  const [checks, setChecks] = useState<Record<string, CheckValue>>(Object.fromEntries(ITEMS.map(i => [i.id, null])));
  const score = calcScore(checks);
  const sectorName = SECTORS.find(s => s.id === info.sectorId)?.name || "";

  const handleSave = async () => {
    if (!info.sectorId || !info.facilityName || !info.inspectorName) { toast.error("يرجى تعبئة الحقول المطلوبة"); return; }
    setSaving(true);
    const visitId = generateVisitId();
    const ok = await sendToSheets("badge_protection", { visitId, sectorName, facilityName: info.facilityName, facilityType: info.facilityType, facilityAddress: info.facilityAddress, visitDate: info.visitDate, inspectorName: info.inspectorName, hasViolation: info.hasViolation, violationDetails: info.violationDetails, actionTaken: info.actionTaken, totalScore: score, notes: info.notes, checkItems: checks });
    setSaving(false);
    if (ok) { setSavedId(visitId); setSaved(true); toast.success("تم الحفظ بنجاح"); }
    else toast.error("خطأ في الإرسال");
  };

  const reset = () => { setSaved(false); setSavedId(""); };

  if (saved) return <div className="card p-8 max-w-2xl mx-auto"><SuccessMessage visitId={savedId} onNew={reset} /></div>;

  return (
    <div className="animate-fade-in-up">
      <div className="page-header mb-6">
        <div className="flex items-start justify-between">
          <div><h1 className="text-2xl font-black mb-1">نموذج حماية شارة الهيئة</h1><p className="text-white/80 text-sm">التحقق من عدم الاستخدام غير المشروع لشعار هيئة الهلال الأحمر السعودي</p></div>
          <PrintButton />
        </div>
      </div>
      <div className="form-section mb-4">
        <SectionHeader title="بيانات المنشأة" color="#922B21" />
        <div className="form-section-body grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <FormField label="القطاع" required><select className="form-input" value={info.sectorId} onChange={e => setInfo({...info, sectorId: e.target.value})}><option value="">-- اختر --</option>{SECTORS.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}</select></FormField>
          <FormField label="اسم المنشأة" required><input className="form-input" value={info.facilityName} onChange={e => setInfo({...info, facilityName: e.target.value})} /></FormField>
          <FormField label="نوع المنشأة"><select className="form-input" value={info.facilityType} onChange={e => setInfo({...info, facilityType: e.target.value})}><option value="">-- اختر --</option>{FACILITY_TYPES.map(t => <option key={t}>{t}</option>)}</select></FormField>
          <FormField label="العنوان"><input className="form-input" value={info.facilityAddress} onChange={e => setInfo({...info, facilityAddress: e.target.value})} /></FormField>
          <FormField label="المفتش" required><select className="form-input" value={info.inspectorName} onChange={e => setInfo({...info, inspectorName: e.target.value})}><option value="">-- اختر --</option>{INSPECTORS.map(i => <option key={i}>{i}</option>)}</select></FormField>
          <FormField label="التاريخ"><input type="date" className="form-input" value={info.visitDate} onChange={e => setInfo({...info, visitDate: e.target.value})} /></FormField>
          <div className="md:col-span-3">
            <label className="flex items-center gap-3 cursor-pointer">
              <input type="checkbox" checked={info.hasViolation} onChange={e => setInfo({...info, hasViolation: e.target.checked})} className="w-5 h-5 rounded" />
              <span className="font-bold text-red-600">يوجد استخدام غير مشروع للشارة</span>
            </label>
          </div>
          {info.hasViolation && <>
            <FormField label="تفاصيل المخالفة"><textarea className="form-input" rows={2} value={info.violationDetails} onChange={e => setInfo({...info, violationDetails: e.target.value})} /></FormField>
            <FormField label="الإجراء المتخذ"><textarea className="form-input" rows={2} value={info.actionTaken} onChange={e => setInfo({...info, actionTaken: e.target.value})} /></FormField>
          </>}
        </div>
      </div>
      <div className="form-section mb-4">
        <SectionHeader title="بنود الفحص" color="#C0392B" score={score} />
        <div className="form-section-body">{ITEMS.map(item => <CheckRow key={item.id} item={item} value={checks[item.id]} onChange={v => setChecks({...checks, [item.id]: v})} />)}</div>
      </div>
      <button onClick={handleSave} disabled={saving} className="btn-primary w-full py-4 flex items-center justify-center gap-3">
        {saving ? <><div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />جاري الحفظ...</> : <><Save size={20} />حفظ وإرسال</>}
      </button>
    </div>
  );
}

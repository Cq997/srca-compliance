import { useState } from "react";
import { Building2, Package, Ambulance, CheckCircle, ChevronLeft, ChevronRight, Save } from "lucide-react";
import { SECTORS, INSPECTORS } from "@/lib/config";
import { sendToSheets, generateVisitId } from "@/lib/sheets";
import {
  CheckRow, SectionHeader, FormField, PrintButton,
  SuccessMessage, ScoreBadge, calcScore,
  type CheckValue
} from "@/components/FormComponents";
import { toast } from "sonner";

// ─── بنود المركز ─────────────────────────────────────────────
const CENTER_ITEMS = [
  { id: "c1",  label: "نظافة وترتيب الفناء الخارجي" },
  { id: "c2",  label: "اللوحات الإرشادية والتعريفية للمركز" },
  { id: "c3",  label: "مدخل المركز وبوابة الدخول" },
  { id: "c4",  label: "موقف سيارات الإسعاف ومظلة الحماية" },
  { id: "c5",  label: "نظافة وترتيب المبنى من الداخل" },
  { id: "c6",  label: "غرفة العمليات ومعداتها" },
  { id: "c7",  label: "غرفة المناوبة وأثاثها" },
  { id: "c8",  label: "استراحة الموظفين ونظافتها" },
  { id: "c9",  label: "دورات المياه ونظافتها" },
  { id: "c10", label: "المطبخ ونظافته ومحتوياته" },
  { id: "c11", label: "سلامة التمديدات الكهربائية" },
  { id: "c12", label: "سلامة تمديدات السباكة" },
  { id: "c13", label: "أجهزة التكييف وصيانتها" },
  { id: "c14", label: "الإضاءة الداخلية والخارجية" },
  { id: "c15", label: "كاميرات المراقبة وتشغيلها" },
  { id: "c16", label: "طفايات الحريق وصلاحيتها", required: true },
  { id: "c17", label: "مخارج الطوارئ وعلاماتها", required: true },
  { id: "c18", label: "لوحة الطوارئ والتعليمات الأمنية" },
  { id: "c19", label: "سجلات الصيانة الدورية" },
  { id: "c20", label: "علم المملكة وعلم الهيئة" },
  { id: "c21", label: "لوحة أسماء العاملين والمناوبات" },
  { id: "c22", label: "أجهزة الاتصال اللاسلكي وشحنها" },
  { id: "c23", label: "جهاز الحاسوب وبرامج النظام" },
  { id: "c24", label: "سجل الزيارات والمراجعات" },
  { id: "c25", label: "الالتزام بالزي الرسمي وبطاقة العمل", required: true },
  { id: "c26", label: "حضور الطاقم الكامل وجاهزيتهم", required: true },
];

// ─── بنود التموين الطبي ───────────────────────────────────────
const MEDICAL_ITEMS = [
  { id: "m1",  label: "نظافة وترتيب المستودع الطبي الرئيسي" },
  { id: "m2",  label: "تصنيف وترتيب الأدوية على الرفوف" },
  { id: "m3",  label: "صلاحية الأدوية وعدم وجود منتهية الصلاحية", required: true },
  { id: "m4",  label: "جهاز إزالة الرجفان (Defibrillator) وجاهزيته", required: true },
  { id: "m5",  label: "جهاز قياس الأكسجين (Pulse Oximeter)" },
  { id: "m6",  label: "جهاز قياس ضغط الدم" },
  { id: "m7",  label: "جهاز قياس السكر" },
  { id: "m8",  label: "جهاز رسم القلب (ECG)" },
  { id: "m9",  label: "أجهزة التنفس الصناعي وملحقاتها" },
  { id: "m10", label: "لوح العمود الفقري وأحزمته", required: true },
  { id: "m11", label: "طوق عنق الرقبة (بأحجامه المختلفة)" },
  { id: "m12", label: "حقيبة الإسعاف الأساسية BLS" },
  { id: "m13", label: "حقيبة الإسعاف المتقدمة ALS" },
  { id: "m14", label: "أسطوانات الأكسجين وصلاحيتها", required: true },
  { id: "m15", label: "مقياس ضغط الأكسجين وخراطيم التوصيل" },
  { id: "m16", label: "المستهلكات الطبية (قفازات، شاش، ضمادات)" },
  { id: "m17", label: "محاليل وريدية وإبر وخراطيم" },
  { id: "m18", label: "سجل صرف المستلزمات الطبية" },
  { id: "m19", label: "بطاقة جرد المستودع محدّثة" },
  { id: "m20", label: "غرفة الأكسجين ومواصفات السلامة", required: true },
];

// ─── بنود سيارات الإسعاف ─────────────────────────────────────
const AMBULANCE_ITEMS = [
  { id: "a1",  label: "نظافة السيارة من الخارج والداخل" },
  { id: "a2",  label: "سلامة الهيكل الخارجي والطلاء" },
  { id: "a3",  label: "الأضواء والصفارات وتشغيلها", required: true },
  { id: "a4",  label: "الإطارات وضغطها وإطار الاحتياط" },
  { id: "a5",  label: "مستوى الوقود (لا يقل عن 3/4)", required: true },
  { id: "a6",  label: "زيت المحرك وسوائل السيارة" },
  { id: "a7",  label: "البطارية وشحنها" },
  { id: "a8",  label: "جهاز الاتصال اللاسلكي في السيارة" },
  { id: "a9",  label: "نظام تحديد المواقع GPS وتشغيله" },
  { id: "a10", label: "الجدول الإلكتروني وتحديثه" },
  { id: "a11", label: "محتويات الحقيبة الطبية كاملة", required: true },
  { id: "a12", label: "أسطوانة الأكسجين في السيارة وشحنها", required: true },
  { id: "a13", label: "جهاز إزالة الرجفان في السيارة", required: true },
  { id: "a14", label: "نقالة السيارة وجاهزيتها" },
  { id: "a15", label: "حزام الأمان للمريض والمرافق" },
  { id: "a16", label: "إغلاق وتأمين السيارة عند عدم الاستخدام", required: true },
  { id: "a17", label: "لوحة الترخيص وصلاحية التسجيل", required: true },
  { id: "a18", label: "بطاقة فحص السيارة الدورية" },
];

type Step = "info" | "center" | "medical" | "ambulance" | "summary";

const STEPS: { id: Step; label: string; icon: typeof Building2; color: string }[] = [
  { id: "info",      label: "البيانات الأساسية",  icon: Building2,  color: "#1A5276" },
  { id: "center",    label: "المركز الإسعافي",    icon: Building2,  color: "#117A65" },
  { id: "medical",   label: "التموين الطبي",      icon: Package,    color: "#6C3483" },
  { id: "ambulance", label: "سيارات الإسعاف",    icon: Ambulance,  color: "#935116" },
  { id: "summary",   label: "الملخص والحفظ",     icon: CheckCircle, color: "#922B21" },
];

const initChecks = (items: { id: string }[]) =>
  Object.fromEntries(items.map((i) => [i.id, null as CheckValue]));

export default function ComprehensiveVisitForm() {
  const [step, setStep] = useState<Step>("info");
  const [saved, setSaved] = useState(false);
  const [savedId, setSavedId] = useState("");
  const [saving, setSaving] = useState(false);

  // البيانات الأساسية
  const [info, setInfo] = useState({
    sectorId: "", centerName: "", centerType: "مركز إسعافي",
    ownershipType: "حكومي", rotationSystem: "24/24",
    centerStrength: "", workingUnits: "", workingAmbulances: "",
    reserveAmbulances: "", inspectorName: "",
    visitDate: new Date().toISOString().split("T")[0],
    visitStartTime: "", visitEndTime: "", notes: "",
  });

  // بنود التشييك
  const [centerChecks, setCenterChecks] = useState<Record<string, CheckValue>>(initChecks(CENTER_ITEMS));
  const [medicalChecks, setMedicalChecks] = useState<Record<string, CheckValue>>(initChecks(MEDICAL_ITEMS));
  const [ambulanceChecks, setAmbulanceChecks] = useState<Record<string, CheckValue>>(initChecks(AMBULANCE_ITEMS));

  const centerScore    = calcScore(centerChecks);
  const medicalScore   = calcScore(medicalChecks);
  const ambulanceScore = calcScore(ambulanceChecks);
  const overallScore   = Math.round((centerScore + medicalScore + ambulanceScore) / 3);

  const sectorName = SECTORS.find((s) => s.id === info.sectorId)?.name || "";

  const handleSave = async () => {
    if (!info.sectorId || !info.centerName || !info.inspectorName) {
      toast.error("يرجى تعبئة البيانات الأساسية (القطاع، المركز، المفتش)");
      setStep("info");
      return;
    }
    setSaving(true);
    const visitId = generateVisitId();
    const payload = {
      visitId, sectorName, centerName: info.centerName,
      visitDate: info.visitDate, visitStartTime: info.visitStartTime,
      visitEndTime: info.visitEndTime, inspectorName: info.inspectorName,
      centerType: info.centerType, ownershipType: info.ownershipType,
      rotationSystem: info.rotationSystem, centerStrength: info.centerStrength,
      workingUnitsCount: info.workingUnits, workingAmbulancesCount: info.workingAmbulances,
      reserveAmbulancesCount: info.reserveAmbulances,
      generalServicesScore: centerScore, externalYardScore: centerScore,
      buildingFacilitiesScore: centerScore, staffRestAreaScore: centerScore,
      utilitiesScore: centerScore, safetySecurityScore: centerScore,
      centerTotalScore: centerScore,
      warehouseScore: medicalScore, medicalDevicesScore: medicalScore,
      consumablesScore: medicalScore, medicalTotalScore: medicalScore,
      parkingExternalScore: ambulanceScore, cleanlinessScore: ambulanceScore,
      medicalReadinessScore: ambulanceScore, mechanicalReadinessScore: ambulanceScore,
      ambulanceTotalScore: ambulanceScore,
      overallScore, notes: info.notes,
      centerData: centerChecks, medicalData: medicalChecks, ambulanceData: ambulanceChecks,
    };
    const ok = await sendToSheets("comprehensive_visit", payload);
    setSaving(false);
    if (ok) {
      setSavedId(visitId);
      setSaved(true);
      toast.success("تم الحفظ وإرسال البيانات إلى Google Sheets");
    } else {
      toast.error("حدث خطأ في الإرسال — تحقق من رابط الـ Webhook في config.ts");
    }
  };

  const resetForm = () => {
    setSaved(false); setSavedId(""); setStep("info");
    setInfo({ sectorId: "", centerName: "", centerType: "مركز إسعافي",
      ownershipType: "حكومي", rotationSystem: "24/24",
      centerStrength: "", workingUnits: "", workingAmbulances: "",
      reserveAmbulances: "", inspectorName: "",
      visitDate: new Date().toISOString().split("T")[0],
      visitStartTime: "", visitEndTime: "", notes: "" });
    setCenterChecks(initChecks(CENTER_ITEMS));
    setMedicalChecks(initChecks(MEDICAL_ITEMS));
    setAmbulanceChecks(initChecks(AMBULANCE_ITEMS));
  };

  const stepIdx = STEPS.findIndex((s) => s.id === step);

  if (saved) return (
    <div className="card p-8 max-w-2xl mx-auto">
      <SuccessMessage visitId={savedId} onNew={resetForm} />
    </div>
  );

  return (
    <div className="animate-fade-in-up">
      {/* Page Header */}
      <div className="page-header print-header mb-6">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-black mb-1">نموذج الزيارة الشاملة للمركز الإسعافي</h1>
            <p className="text-white/80 text-sm">يشمل: المركز الإسعافي + التموين الطبي + سيارات الإسعاف</p>
          </div>
          <PrintButton />
        </div>
      </div>

      {/* Stepper */}
      <div className="card p-4 mb-5 no-print">
        <div className="flex gap-2 overflow-x-auto pb-1">
          {STEPS.map((s, i) => {
            const done = i < stepIdx;
            const active = s.id === step;
            return (
              <button
                key={s.id}
                onClick={() => setStep(s.id)}
                className={`step-btn ${active ? "active" : done ? "done" : "idle"}`}
                style={active ? { background: s.color } : {}}
              >
                <s.icon size={16} />
                <span>{s.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Step: Info ── */}
      {step === "info" && (
        <div className="form-section animate-fade-in-up">
          <SectionHeader title="البيانات الأساسية للزيارة" color="#1A5276" />
          <div className="form-section-body grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <FormField label="القطاع" required>
              <select className="form-input" value={info.sectorId}
                onChange={(e) => setInfo({ ...info, sectorId: e.target.value })}>
                <option value="">-- اختر القطاع --</option>
                <optgroup label="القطاعات الداخلية">
                  {SECTORS.filter(s => s.type === "داخلي").map(s =>
                    <option key={s.id} value={s.id}>{s.name}</option>)}
                </optgroup>
                <optgroup label="القطاعات الخارجية">
                  {SECTORS.filter(s => s.type === "خارجي").map(s =>
                    <option key={s.id} value={s.id}>{s.name}</option>)}
                </optgroup>
              </select>
            </FormField>
            <FormField label="اسم المركز" required>
              <input className="form-input" value={info.centerName}
                onChange={(e) => setInfo({ ...info, centerName: e.target.value })}
                placeholder="أدخل اسم المركز" />
            </FormField>
            <FormField label="نوع المركز">
              <select className="form-input" value={info.centerType}
                onChange={(e) => setInfo({ ...info, centerType: e.target.value })}>
                {["مركز إسعافي","مركز متقدم","نقطة إسعافية"].map(v =>
                  <option key={v}>{v}</option>)}
              </select>
            </FormField>
            <FormField label="نظام الملكية">
              <select className="form-input" value={info.ownershipType}
                onChange={(e) => setInfo({ ...info, ownershipType: e.target.value })}>
                {["حكومي","مؤجر","مشترك"].map(v => <option key={v}>{v}</option>)}
              </select>
            </FormField>
            <FormField label="نظام المناوبة">
              <select className="form-input" value={info.rotationSystem}
                onChange={(e) => setInfo({ ...info, rotationSystem: e.target.value })}>
                {["24/24","12/12","8 ساعات"].map(v => <option key={v}>{v}</option>)}
              </select>
            </FormField>
            <FormField label="قوة المركز (عدد الأفراد)">
              <input type="number" className="form-input" value={info.centerStrength}
                onChange={(e) => setInfo({ ...info, centerStrength: e.target.value })} />
            </FormField>
            <FormField label="عدد الوحدات العاملة">
              <input type="number" className="form-input" value={info.workingUnits}
                onChange={(e) => setInfo({ ...info, workingUnits: e.target.value })} />
            </FormField>
            <FormField label="سيارات الإسعاف العاملة">
              <input type="number" className="form-input" value={info.workingAmbulances}
                onChange={(e) => setInfo({ ...info, workingAmbulances: e.target.value })} />
            </FormField>
            <FormField label="سيارات الاحتياط">
              <input type="number" className="form-input" value={info.reserveAmbulances}
                onChange={(e) => setInfo({ ...info, reserveAmbulances: e.target.value })} />
            </FormField>
            <FormField label="المفتش" required>
              <select className="form-input" value={info.inspectorName}
                onChange={(e) => setInfo({ ...info, inspectorName: e.target.value })}>
                <option value="">-- اختر المفتش --</option>
                {INSPECTORS.map(i => <option key={i}>{i}</option>)}
              </select>
            </FormField>
            <FormField label="تاريخ الزيارة" required>
              <input type="date" className="form-input" value={info.visitDate}
                onChange={(e) => setInfo({ ...info, visitDate: e.target.value })} />
            </FormField>
            <FormField label="وقت البداية">
              <input type="time" className="form-input" value={info.visitStartTime}
                onChange={(e) => setInfo({ ...info, visitStartTime: e.target.value })} />
            </FormField>
            <FormField label="وقت النهاية">
              <input type="time" className="form-input" value={info.visitEndTime}
                onChange={(e) => setInfo({ ...info, visitEndTime: e.target.value })} />
            </FormField>
            <div className="md:col-span-2 lg:col-span-3">
              <FormField label="ملاحظات عامة">
                <textarea className="form-input" rows={3} value={info.notes}
                  onChange={(e) => setInfo({ ...info, notes: e.target.value })}
                  placeholder="أي ملاحظات إضافية..." />
              </FormField>
            </div>
          </div>
        </div>
      )}

      {/* ── Step: Center ── */}
      {step === "center" && (
        <div className="form-section animate-fade-in-up">
          <SectionHeader title="أولاً: تشييك المركز الإسعافي" color="#117A65" score={centerScore} />
          <div className="form-section-body">
            {CENTER_ITEMS.map((item) => (
              <CheckRow key={item.id} item={item}
                value={centerChecks[item.id]}
                onChange={(v) => setCenterChecks({ ...centerChecks, [item.id]: v })} />
            ))}
          </div>
        </div>
      )}

      {/* ── Step: Medical ── */}
      {step === "medical" && (
        <div className="form-section animate-fade-in-up">
          <SectionHeader title="ثانياً: تشييك التموين الطبي" color="#6C3483" score={medicalScore} />
          <div className="form-section-body">
            {MEDICAL_ITEMS.map((item) => (
              <CheckRow key={item.id} item={item}
                value={medicalChecks[item.id]}
                onChange={(v) => setMedicalChecks({ ...medicalChecks, [item.id]: v })} />
            ))}
          </div>
        </div>
      )}

      {/* ── Step: Ambulance ── */}
      {step === "ambulance" && (
        <div className="form-section animate-fade-in-up">
          <SectionHeader title="ثالثاً: تشييك سيارات الإسعاف" color="#935116" score={ambulanceScore} />
          <div className="form-section-body">
            {AMBULANCE_ITEMS.map((item) => (
              <CheckRow key={item.id} item={item}
                value={ambulanceChecks[item.id]}
                onChange={(v) => setAmbulanceChecks({ ...ambulanceChecks, [item.id]: v })} />
            ))}
          </div>
        </div>
      )}

      {/* ── Step: Summary ── */}
      {step === "summary" && (
        <div className="animate-fade-in-up space-y-4">
          <div className="card p-6">
            <h3 className="font-black text-lg mb-4 text-gray-800">ملخص نتائج الزيارة</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              {[
                { label: "المركز الإسعافي",  score: centerScore,    color: "#117A65" },
                { label: "التموين الطبي",    score: medicalScore,   color: "#6C3483" },
                { label: "سيارات الإسعاف",  score: ambulanceScore, color: "#935116" },
                { label: "الدرجة الإجمالية", score: overallScore,   color: "#922B21" },
              ].map((item) => (
                <div key={item.label} className="text-center p-4 rounded-xl border-2"
                  style={{ borderColor: item.color }}>
                  <div className="text-3xl font-black mb-1" style={{ color: item.color }}>
                    {item.score}%
                  </div>
                  <div className="text-xs text-gray-600 font-semibold">{item.label}</div>
                </div>
              ))}
            </div>
            <div className="bg-gray-50 rounded-xl p-4 text-sm space-y-1">
              <div className="flex justify-between"><span className="text-gray-500">القطاع:</span><span className="font-bold">{sectorName}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">المركز:</span><span className="font-bold">{info.centerName}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">المفتش:</span><span className="font-bold">{info.inspectorName}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">التاريخ:</span><span className="font-bold">{info.visitDate}</span></div>
            </div>
          </div>
          <button
            onClick={handleSave}
            disabled={saving}
            className="btn-primary w-full py-4 text-lg flex items-center justify-center gap-3"
          >
            {saving ? (
              <><div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> جاري الحفظ...</>
            ) : (
              <><Save size={20} /> حفظ الزيارة وإرسالها إلى Google Sheets</>
            )}
          </button>
        </div>
      )}

      {/* Navigation Buttons */}
      <div className="flex justify-between mt-5 no-print">
        <button
          onClick={() => setStep(STEPS[Math.max(0, stepIdx - 1)].id)}
          disabled={stepIdx === 0}
          className="btn-secondary flex items-center gap-2 disabled:opacity-40"
        >
          <ChevronRight size={16} /> السابق
        </button>
        {step !== "summary" && (
          <button
            onClick={() => setStep(STEPS[Math.min(STEPS.length - 1, stepIdx + 1)].id)}
            className="btn-primary flex items-center gap-2"
          >
            التالي <ChevronLeft size={16} />
          </button>
        )}
      </div>
    </div>
  );
}

import { useEffect, useState } from "react";
import { Search, Download, Printer } from "lucide-react";
import { getFromSheets } from "@/lib/sheets";
import { SECTORS } from "@/lib/config";

const VISIT_TYPES: Record<string, string> = {
  comprehensive_visit: "زيارة شاملة",
  emergency_dept: "أقسام الطوارئ",
  badge_protection: "حماية الشارة",
  uniform_check: "الزي الرسمي",
  spot_check: "وقوف على مركز",
};

export default function VisitsList() {
  const [visits, setVisits] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [sectorFilter, setSectorFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");

  useEffect(() => {
    (async () => {
      const data = await getFromSheets("all_visits");
      setVisits(data?.visits || []);
      setLoading(false);
    })();
  }, []);

  const filtered = visits.filter((v) => {
    const matchSearch = !search || v.centerName?.includes(search) || v.inspectorName?.includes(search) || v.visitId?.includes(search);
    const matchSector = !sectorFilter || v.sectorName === sectorFilter;
    const matchType = !typeFilter || v.visitType === typeFilter;
    return matchSearch && matchSector && matchType;
  });

  const exportCSV = () => {
    const headers = ["رقم الزيارة","نوع الزيارة","القطاع","المركز","المفتش","التاريخ","الدرجة"];
    const rows = filtered.map(v => [v.visitId, VISIT_TYPES[v.visitType] || v.visitType, v.sectorName, v.centerName, v.inspectorName, v.visitDate, v.overallScore]);
    const csv = [headers, ...rows].map(r => r.join(",")).join("\n");
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = "سجل_الزيارات.csv"; a.click();
  };

  return (
    <div className="animate-fade-in-up">
      <div className="page-header mb-6">
        <div className="flex items-start justify-between">
          <div><h1 className="text-2xl font-black mb-1">سجل الزيارات الميدانية</h1><p className="text-white/80 text-sm">جميع الزيارات المسجلة مع إمكانية البحث والتصفية</p></div>
          <div className="flex gap-2">
            <button onClick={() => window.print()} className="btn-secondary flex items-center gap-2 no-print"><Printer size={15} />طباعة</button>
            <button onClick={exportCSV} className="btn-success flex items-center gap-2 no-print"><Download size={15} />تصدير CSV</button>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="card p-4 mb-4 no-print">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="relative">
            <Search size={16} className="absolute right-3 top-3 text-gray-400" />
            <input className="form-input pr-9" placeholder="بحث بالمركز أو المفتش..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <select className="form-input" value={sectorFilter} onChange={e => setSectorFilter(e.target.value)}>
            <option value="">جميع القطاعات</option>
            {SECTORS.map(s => <option key={s.id} value={s.name}>{s.name}</option>)}
          </select>
          <select className="form-input" value={typeFilter} onChange={e => setTypeFilter(e.target.value)}>
            <option value="">جميع أنواع الزيارات</option>
            {Object.entries(VISIT_TYPES).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
          </select>
        </div>
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          {loading ? (
            <div className="p-8 text-center text-gray-400">جاري تحميل البيانات من Google Sheets...</div>
          ) : filtered.length === 0 ? (
            <div className="p-8 text-center text-gray-400">لا توجد زيارات مطابقة للبحث</div>
          ) : (
            <table className="data-table">
              <thead>
                <tr>
                  <th>رقم الزيارة</th>
                  <th>نوع الزيارة</th>
                  <th>القطاع</th>
                  <th>المركز</th>
                  <th>المفتش</th>
                  <th>التاريخ</th>
                  <th>الدرجة</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((v, i) => (
                  <tr key={i}>
                    <td className="font-mono text-xs">{v.visitId}</td>
                    <td><span className="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full font-semibold">{VISIT_TYPES[v.visitType] || v.visitType}</span></td>
                    <td>{v.sectorName}</td>
                    <td className="font-semibold">{v.centerName}</td>
                    <td>{v.inspectorName}</td>
                    <td>{v.visitDate}</td>
                    <td>
                      {v.overallScore != null && (
                        <span className={`score-badge ${v.overallScore >= 90 ? "excellent" : v.overallScore >= 75 ? "good" : v.overallScore >= 60 ? "average" : "poor"}`}>
                          {v.overallScore}%
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
        {!loading && <div className="p-3 border-t border-gray-100 text-sm text-gray-500 text-left no-print">إجمالي: {filtered.length} زيارة</div>}
      </div>
    </div>
  );
}

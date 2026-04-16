import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ClipboardList, AlertTriangle, Shield, UserCheck, Eye, TrendingUp, Activity, FileText } from "lucide-react";
import { getFromSheets } from "@/lib/sheets";

const FORM_CARDS = [
  { to: "/forms/comprehensive", icon: ClipboardList, label: "الزيارة الشاملة للمركز", desc: "مركز + تموين + سيارات", color: "#922B21" },
  { to: "/forms/emergency",     icon: AlertTriangle, label: "زيارة أقسام الطوارئ",   desc: "تأمين سيارات الإسعاف",  color: "#1A5276" },
  { to: "/forms/badge",         icon: Shield,        label: "حماية الشارة",           desc: "مراقبة الاستخدام غير المشروع", color: "#6C3483" },
  { to: "/forms/uniform",       icon: UserCheck,     label: "الزي الرسمي",            desc: "بطاقة العمل والمظهر",  color: "#117A65" },
  { to: "/forms/spotcheck",     icon: Eye,           label: "الوقوف على مركز",        desc: "جاهزية شاملة فورية",   color: "#935116" },
];

interface Stats { totalVisits: number; avgScore: number; excellentCount: number; poorCount: number; }

export default function Dashboard() {
  const [stats, setStats] = useState<Stats>({ totalVisits: 0, avgScore: 0, excellentCount: 0, poorCount: 0 });
  const [recentVisits, setRecentVisits] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const data = await getFromSheets("dashboard_stats") as Record<string, any> | null;
      if (data) {
        setStats(data.stats || { totalVisits: 0, avgScore: 0, excellentCount: 0, poorCount: 0 });
        setRecentVisits(data.recentVisits || []);
      }
      setLoading(false);
    })();
  }, []);

  return (
    <div className="animate-fade-in-up">
      {/* Header */}
      <div className="page-header mb-6">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-black mb-1">لوحة القائد</h1>
            <p className="text-white/80 text-sm">منظومة إدارة الالتزام — هيئة الهلال الأحمر السعودي — منطقة الرياض</p>
          </div>
          <div className="text-right text-white/70 text-sm">
            <div>{new Date().toLocaleDateString("ar-SA", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}</div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {[
          { label: "إجمالي الزيارات", value: loading ? "..." : stats.totalVisits, icon: ClipboardList, color: "#1A5276", bg: "#EBF5FB" },
          { label: "متوسط الدرجات", value: loading ? "..." : `${stats.avgScore}%`, icon: TrendingUp, color: "#117A65", bg: "#E9F7EF" },
          { label: "تقييم ممتاز", value: loading ? "..." : stats.excellentCount, icon: Activity, color: "#935116", bg: "#FEF9E7" },
          { label: "يحتاج متابعة", value: loading ? "..." : stats.poorCount, icon: AlertTriangle, color: "#922B21", bg: "#FDEDEC" },
        ].map((s) => (
          <div key={s.label} className="stat-card">
            <div className="stat-icon" style={{ background: s.bg }}>
              <s.icon size={24} style={{ color: s.color }} />
            </div>
            <div>
              <div className="text-2xl font-black" style={{ color: s.color }}>{s.value}</div>
              <div className="text-xs text-gray-500 font-semibold">{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Form Cards */}
      <div className="mb-6">
        <h2 className="text-lg font-black text-gray-800 mb-3">نماذج الزيارات الميدانية</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3">
          {FORM_CARDS.map((card) => (
            <Link
              key={card.to}
              to={card.to}
              className="card p-4 hover:shadow-md transition-all hover:-translate-y-0.5 group"
            >
              <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-3 transition-all"
                style={{ background: `${card.color}15` }}>
                <card.icon size={22} style={{ color: card.color }} />
              </div>
              <div className="font-bold text-sm text-gray-800 mb-1">{card.label}</div>
              <div className="text-xs text-gray-500">{card.desc}</div>
            </Link>
          ))}
        </div>
      </div>

      {/* Recent Visits */}
      <div className="card">
        <div className="card-header">
          <h3 className="font-black text-gray-800">آخر الزيارات المسجلة</h3>
          <Link to="/visits" className="text-sm font-semibold" style={{ color: "#922B21" }}>عرض الكل</Link>
        </div>
        <div className="overflow-x-auto">
          {loading ? (
            <div className="p-8 text-center text-gray-400">جاري التحميل...</div>
          ) : recentVisits.length === 0 ? (
            <div className="p-8 text-center text-gray-400">
              <ClipboardList size={40} className="mx-auto mb-3 opacity-30" />
              <p>لا توجد زيارات مسجلة بعد</p>
              <p className="text-sm mt-1">ابدأ بتعبئة أول نموذج زيارة</p>
            </div>
          ) : (
            <table className="data-table">
              <thead>
                <tr>
                  <th>رقم الزيارة</th>
                  <th>المركز</th>
                  <th>القطاع</th>
                  <th>التاريخ</th>
                  <th>المفتش</th>
                  <th>الدرجة</th>
                </tr>
              </thead>
              <tbody>
                {recentVisits.map((v, i) => (
                  <tr key={i}>
                    <td className="font-mono text-xs">{v.visitId}</td>
                    <td className="font-semibold">{v.centerName}</td>
                    <td>{v.sectorName}</td>
                    <td>{v.visitDate}</td>
                    <td>{v.inspectorName}</td>
                    <td>
                      <span className={`score-badge ${v.overallScore >= 90 ? "excellent" : v.overallScore >= 75 ? "good" : v.overallScore >= 60 ? "average" : "poor"}`}>
                        {v.overallScore}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}

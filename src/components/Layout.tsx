import { useState } from "react";
import { Outlet, NavLink, useLocation } from "react-router-dom";
import {
  LayoutDashboard, ClipboardList, AlertTriangle,
  Shield, UserCheck, Eye, FileText, BookOpen,
  ChevronDown, ChevronUp, Menu, X
} from "lucide-react";
import { APP_NAME, APP_SUBTITLE } from "@/lib/config";

const NAV = [
  {
    group: "الرئيسية",
    items: [
      { to: "/dashboard", icon: LayoutDashboard, label: "لوحة القائد" },
    ],
  },
  {
    group: "نماذج الزيارات",
    items: [
      { to: "/forms/comprehensive", icon: ClipboardList,  label: "الزيارة الشاملة للمركز" },
      { to: "/forms/emergency",     icon: AlertTriangle,  label: "زيارة أقسام الطوارئ" },
      { to: "/forms/badge",         icon: Shield,         label: "حماية الشارة" },
      { to: "/forms/uniform",       icon: UserCheck,      label: "الزي الرسمي وبطاقة العمل" },
      { to: "/forms/spotcheck",     icon: Eye,            label: "الوقوف على مركز" },
    ],
  },
  {
    group: "السجلات والتقارير",
    items: [
      { to: "/visits",          icon: BookOpen,   label: "سجل الزيارات" },
      { to: "/correspondences", icon: FileText,   label: "المخاطبات" },
      { to: "/complaints",      icon: AlertTriangle, label: "الشكاوى والمخالفات" },
    ],
  },
];

export default function Layout() {
  const [open, setOpen] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="sidebar-logo">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center text-xl font-black text-white">
            ه
          </div>
          <div>
            <div className="text-white font-black text-sm leading-tight">{APP_NAME}</div>
            <div className="text-yellow-300 text-xs mt-0.5 leading-tight">{APP_SUBTITLE}</div>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-3">
        {NAV.map((group) => (
          <div key={group.group}>
            <div className="nav-group-title">{group.group}</div>
            {group.items.map((item) => {
              const active = location.pathname === item.to ||
                (item.to !== "/dashboard" && location.pathname.startsWith(item.to));
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={`nav-item ${active ? "active" : ""}`}
                  onClick={() => setMobileOpen(false)}
                >
                  <item.icon size={17} />
                  <span>{item.label}</span>
                </NavLink>
              );
            })}
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-white/10">
        <div className="text-xs text-gray-500 text-center">
          منظومة إدارة الالتزام v2.0
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Desktop Sidebar */}
      <aside className="sidebar hidden md:flex flex-col no-print">
        <SidebarContent />
      </aside>

      {/* Mobile Sidebar */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden no-print">
          <div className="sidebar w-72 flex flex-col">
            <button
              onClick={() => setMobileOpen(false)}
              className="absolute top-4 left-4 text-white"
            >
              <X size={20} />
            </button>
            <SidebarContent />
          </div>
          <div
            className="flex-1 bg-black/50"
            onClick={() => setMobileOpen(false)}
          />
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        {/* Mobile Header */}
        <div className="md:hidden flex items-center gap-3 px-4 py-3 bg-white border-b border-gray-200 no-print">
          <button onClick={() => setMobileOpen(true)}>
            <Menu size={22} className="text-gray-600" />
          </button>
          <span className="font-bold text-sm text-gray-800">{APP_NAME}</span>
        </div>

        <div className="p-4 md:p-6 max-w-7xl mx-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
}

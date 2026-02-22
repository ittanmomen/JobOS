import React from "react";
import {
  LayoutDashboard,
  Briefcase,
  Network,
  CheckSquare,
  BarChart,
  Search,
  Building2,
  Settings,
  ChevronRight,
  ChevronLeft,
} from "lucide-react";
import type { Profile } from "../../types";

type ViewType =
  | "dashboard"
  | "companies"
  | "tasks"
  | "pipeline1"
  | "pipeline2"
  | "pipeline3"
  | "review"
  | "analysis"
  | "settings";

interface SidebarProps {
  view: ViewType;
  setView: (view: ViewType) => void;
  profile: Profile;
  isLive: boolean;
  authUser: any;
  isSidebarCollapsed: boolean;
  setSidebarCollapsed: (collapsed: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  view,
  setView,
  profile,
  isLive,
  authUser,
  isSidebarCollapsed,
  setSidebarCollapsed,
}) => {
  const NavItem = ({ id, label, icon: Icon, collapsed = false }: {
    id: ViewType;
    label: string;
    icon: React.FC<{ className?: string }>;
    collapsed?: boolean;
  }) => (
    <button
      onClick={() => setView(id)}
      title={collapsed ? label : undefined}
      className={`w-full flex items-center ${collapsed ? "justify-center px-2" : "px-4"} py-3 text-sm font-medium transition-all duration-200 rounded-lg mb-1 ${view === id ? "bg-blue-50 text-blue-700 shadow-sm" : "text-slate-500 hover:bg-slate-50 hover:text-slate-800"}`}
    >
      <Icon
        className={`w-4 h-4 ${collapsed ? "" : "mr-3"} ${view === id ? "text-blue-600" : "text-slate-400"}`}
      />
      {!collapsed && label}
    </button>
  );

  return (
    <div className={`${isSidebarCollapsed ? "w-20" : "w-64"} bg-white border-r border-slate-200 hidden lg:flex flex-col z-20 shadow-[4px_0_24px_-12px_rgba(0,0,0,0.1)] transition-all duration-300 ease-in-out`}>
      <div className={`${isSidebarCollapsed ? "p-3" : "p-6"} pb-2`}>
        <div className={`flex items-center ${isSidebarCollapsed ? "justify-center" : "gap-2"} text-blue-700 mb-6`}>
          <div className="bg-blue-600 p-1.5 rounded-lg">
            <BarChart className="w-5 h-5 text-white" />
          </div>
          {!isSidebarCollapsed && (
            <h1 className="text-xl font-black tracking-tight text-slate-900">
              JobOS
            </h1>
          )}
        </div>
        {!isSidebarCollapsed && (
          <div className="px-3 py-2 bg-slate-50 rounded-lg border border-slate-100 mb-2">
            <p className="text-[10px] text-slate-400 uppercase tracking-wider font-bold mb-0.5">
              Current Focus
            </p>
            <p className="text-sm font-bold text-slate-700 truncate">
              {profile.role_focus[0]}
            </p>
          </div>
        )}
      </div>

      <nav className={`flex-1 ${isSidebarCollapsed ? "px-2" : "px-4"} space-y-0.5 overflow-y-auto`}>
        <NavItem
          id="dashboard"
          label="Command Center"
          icon={LayoutDashboard}
          collapsed={isSidebarCollapsed}
        />

        {!isSidebarCollapsed && (
          <div className="px-4 pt-6 pb-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
            Pipelines
          </div>
        )}
        {isSidebarCollapsed && <div className="pt-4" />}
        <NavItem id="pipeline1" label="Discovery" icon={Search} collapsed={isSidebarCollapsed} />
        <NavItem id="pipeline2" label="Applications" icon={Briefcase} collapsed={isSidebarCollapsed} />
        <NavItem id="pipeline3" label="Networking" icon={Network} collapsed={isSidebarCollapsed} />

        {!isSidebarCollapsed && (
          <div className="px-4 pt-6 pb-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
            Database
          </div>
        )}
        {isSidebarCollapsed && <div className="pt-4" />}
        <NavItem id="companies" label="Companies" icon={Building2} collapsed={isSidebarCollapsed} />
        <NavItem id="tasks" label="Tasks" icon={CheckSquare} collapsed={isSidebarCollapsed} />

        {!isSidebarCollapsed && (
          <div className="px-4 pt-6 pb-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
            Review
          </div>
        )}
        {isSidebarCollapsed && <div className="pt-4" />}
        <NavItem id="review" label="Weekly Analytics" icon={BarChart} collapsed={isSidebarCollapsed} />

        {!isSidebarCollapsed && (
          <div className="px-4 pt-6 pb-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
            System
          </div>
        )}
        {isSidebarCollapsed && <div className="pt-4" />}
        <NavItem id="settings" label="Settings" icon={Settings} collapsed={isSidebarCollapsed} />
      </nav>

      <div className={`${isSidebarCollapsed ? "p-2" : "p-4"} border-t border-slate-100 bg-slate-50/50`}>
        {/* Toggle Button */}
        <button
          onClick={() => setSidebarCollapsed(!isSidebarCollapsed)}
          className="w-full flex items-center justify-center p-2 mb-3 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
          title={isSidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {isSidebarCollapsed ? (
            <ChevronRight className="w-5 h-5" />
          ) : (
            <ChevronLeft className="w-5 h-5" />
          )}
        </button>

        {/* Status Indicator */}
        <div
          className={`${isSidebarCollapsed ? "p-2 justify-center" : "p-3 gap-3"} rounded-lg flex items-center border ${isLive ? "bg-emerald-50 text-emerald-800 border-emerald-100" : "bg-amber-50 text-amber-800 border-amber-100"}`}
          title={isSidebarCollapsed ? (isLive ? (authUser ? "Connected" : "Live (Guest)") : "Demo Mode") : undefined}
        >
          <div
            className={`w-2 h-2 rounded-full animate-pulse flex-shrink-0 ${isLive ? "bg-emerald-500" : "bg-amber-500"}`}
          />
          {!isSidebarCollapsed && (
            <span className="text-xs font-bold">
              {isLive ? (authUser ? "Connected" : "Live (Guest)") : "Demo Mode"}
            </span>
          )}
        </div>
        {authUser && !isSidebarCollapsed && (
          <div className="mt-2 text-xs text-slate-400 text-center truncate">
            {authUser.email}
          </div>
        )}
      </div>
    </div>
  );
};

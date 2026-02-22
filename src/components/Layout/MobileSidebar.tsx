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
  X,
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

interface MobileSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  view: ViewType;
  setView: (view: ViewType) => void;
  profile: Profile;
  isLive: boolean;
  authUser: any;
}

export const MobileSidebar: React.FC<MobileSidebarProps> = ({
  isOpen,
  onClose,
  view,
  setView,
  profile,
  isLive,
  authUser,
}) => {
  if (!isOpen) return null;

  const NavItem = ({ id, label, icon: Icon }: {
    id: ViewType;
    label: string;
    icon: React.FC<{ className?: string }>;
  }) => (
    <button
      onClick={() => {
        setView(id);
        onClose(); // Auto-close mobile menu
      }}
      className={`w-full flex items-center px-4 py-3 text-sm font-medium transition-all duration-200 rounded-lg mb-1 ${view === id ? "bg-blue-50 text-blue-700 shadow-sm" : "text-slate-500 hover:bg-slate-50 hover:text-slate-800"}`}
    >
      <Icon
        className={`w-4 h-4 mr-3 ${view === id ? "text-blue-600" : "text-slate-400"}`}
      />
      {label}
    </button>
  );

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 z-40 lg:hidden"
        onClick={onClose}
      />
      {/* Drawer */}
      <div className="fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-2xl flex flex-col lg:hidden">
        <div className="p-6 pb-2">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2 text-blue-700">
              <div className="bg-blue-600 p-1.5 rounded-lg">
                <BarChart className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-xl font-black tracking-tight text-slate-900">
                JobOS
              </h1>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="px-3 py-2 bg-slate-50 rounded-lg border border-slate-100 mb-2">
            <p className="text-[10px] text-slate-400 uppercase tracking-wider font-bold mb-0.5">
              Current Focus
            </p>
            <p className="text-sm font-bold text-slate-700 truncate">
              {profile.role_focus[0]}
            </p>
          </div>
        </div>

        <nav className="flex-1 px-4 space-y-0.5 overflow-y-auto">
          <NavItem id="dashboard" label="Command Center" icon={LayoutDashboard} />

          <div className="px-4 pt-6 pb-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
            Pipelines
          </div>
          <NavItem id="pipeline1" label="Discovery" icon={Search} />
          <NavItem id="pipeline2" label="Applications" icon={Briefcase} />
          <NavItem id="pipeline3" label="Networking" icon={Network} />

          <div className="px-4 pt-6 pb-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
            Database
          </div>
          <NavItem id="companies" label="Companies" icon={Building2} />
          <NavItem id="tasks" label="Tasks" icon={CheckSquare} />

          <div className="px-4 pt-6 pb-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
            Review
          </div>
          <NavItem id="review" label="Weekly Analytics" icon={BarChart} />

          <div className="px-4 pt-6 pb-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
            System
          </div>
          <NavItem id="settings" label="Settings" icon={Settings} />
        </nav>

        <div className="p-4 border-t border-slate-100 bg-slate-50/50">
          <div
            className={`p-3 rounded-lg flex items-center gap-3 border ${isLive ? "bg-emerald-50 text-emerald-800 border-emerald-100" : "bg-amber-50 text-amber-800 border-amber-100"}`}
          >
            <div
              className={`w-2 h-2 rounded-full animate-pulse ${isLive ? "bg-emerald-500" : "bg-amber-500"}`}
            />
            <span className="text-xs font-bold">
              {isLive ? (authUser ? "Connected" : "Live (Guest)") : "Demo Mode"}
            </span>
          </div>
          {authUser && (
            <div className="mt-2 text-xs text-slate-400 text-center truncate">
              {authUser.email}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

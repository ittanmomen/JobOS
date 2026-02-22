import React, { useState } from "react";
import { AlertCircle } from "lucide-react";
import type { Profile } from "../types";
import { DEFAULT_PROFILE } from "../types";

interface OnboardingWizardProps {
  onComplete: (profile: Profile) => void;
}

export const OnboardingWizard: React.FC<OnboardingWizardProps> = ({ onComplete }) => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<Profile>(DEFAULT_PROFILE);

  const next = () => setStep((s) => s + 1);
  const update = (field: string, val: any) =>
    setFormData((p) => ({ ...p, [field]: val }));

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 font-sans">
      <div className="bg-white max-w-lg w-full rounded-2xl shadow-2xl p-8 border border-slate-100">
        <div className="mb-8">
          <div className="flex justify-between text-xs text-slate-400 uppercase tracking-widest font-bold mb-3">
            <span>Setup Wizard</span>
            <span>Step {step} of 3</span>
          </div>
          <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-blue-600 transition-all duration-500 ease-out"
              style={{ width: `${(step / 3) * 100}%` }}
            ></div>
          </div>
        </div>

        {step === 1 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="space-y-2">
              <h2 className="text-3xl font-bold text-slate-900 tracking-tight">
                Focus & Role
              </h2>
              <p className="text-slate-500 text-lg">
                What specific roles are you targeting?
              </p>
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Primary Role Title
              </label>
              <input
                type="text"
                className="w-full p-4 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-lg"
                placeholder="e.g. Embedded Systems Engineer"
                value={formData.role_focus[0] || ""}
                onChange={(e) => update("role_focus", [e.target.value])}
                autoFocus
              />
            </div>
            <button
              onClick={next}
              className="w-full py-4 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-colors shadow-lg shadow-blue-600/20"
            >
              Next Step
            </button>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="space-y-2">
              <h2 className="text-3xl font-bold text-slate-900 tracking-tight">
                The Deadline
              </h2>
              <p className="text-slate-500 text-lg">
                When do you absolutely need to start?
              </p>
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Target Date
              </label>
              <input
                type="date"
                className="w-full p-4 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-lg"
                value={formData.deadline_date}
                onChange={(e) => update("deadline_date", e.target.value)}
              />
            </div>
            <div className="p-4 bg-amber-50 text-amber-900 text-sm rounded-xl border border-amber-100 flex gap-3 items-start">
              <AlertCircle
                size={20}
                className="shrink-0 mt-0.5 text-amber-600"
              />
              <p className="font-medium">
                We will enable a countdown timer and pace your daily tasks to
                ensure you meet this date.
              </p>
            </div>
            <button
              onClick={next}
              className="w-full py-4 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-colors shadow-lg shadow-blue-600/20"
            >
              Next Step
            </button>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="space-y-2">
              <h2 className="text-3xl font-bold text-slate-900 tracking-tight">
                Weekly Targets
              </h2>
              <p className="text-slate-500 text-lg">
                Volume is key. Set your weekly goals.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 border border-slate-200 rounded-xl bg-slate-50/50">
                <label className="block text-xs text-slate-500 uppercase font-bold mb-2">
                  Applications / Wk
                </label>
                <input
                  type="number"
                  className="w-full font-bold text-3xl bg-transparent outline-none text-slate-800"
                  value={formData.weekly_targets.applications}
                  onChange={(e) =>
                    update("weekly_targets", {
                      ...formData.weekly_targets,
                      applications: parseInt(e.target.value),
                    })
                  }
                />
              </div>
              <div className="p-4 border border-slate-200 rounded-xl bg-slate-50/50">
                <label className="block text-xs text-slate-500 uppercase font-bold mb-2">
                  Outreach Msgs / Wk
                </label>
                <input
                  type="number"
                  className="w-full font-bold text-3xl bg-transparent outline-none text-slate-800"
                  value={formData.weekly_targets.outreaches}
                  onChange={(e) =>
                    update("weekly_targets", {
                      ...formData.weekly_targets,
                      outreaches: parseInt(e.target.value),
                    })
                  }
                />
              </div>
            </div>

            <button
              onClick={() => onComplete(formData)}
              className="w-full py-4 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 transition-colors shadow-lg shadow-emerald-600/20"
            >
              Launch Dashboard
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

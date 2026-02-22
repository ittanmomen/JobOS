import React from "react";
import { X } from "lucide-react";
import {
  STAGES_DISCOVERY,
  STAGES_APPLICATION,
  STAGES_NETWORKING,
} from "../../types";
import type { PipelineType } from "../../types";

interface MoveModalState {
  open: boolean;
  item: any;
  pipelineType: PipelineType;
}

interface MoveModalProps {
  moveModal: MoveModalState | null;
  setMoveModal: (modal: MoveModalState | null) => void;
  onMoveOpportunity: (id: string, stage: string) => Promise<void>;
  onMoveContact: (id: string, stage: string) => Promise<void>;
}

export const MoveModal: React.FC<MoveModalProps> = ({
  moveModal,
  setMoveModal,
  onMoveOpportunity,
  onMoveContact,
}) => {
  if (!moveModal?.open) return null;

  const stages =
    moveModal.pipelineType === "discovery"
      ? STAGES_DISCOVERY
      : moveModal.pipelineType === "application"
        ? STAGES_APPLICATION
        : STAGES_NETWORKING;

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white p-6 rounded-2xl shadow-2xl w-full max-w-sm animate-in zoom-in-95 duration-200">
        <div className="flex justify-between items-center mb-6">
          <h3 className="font-bold text-lg text-slate-800">
            Move "{moveModal.item?.title || moveModal.item?.name}"
          </h3>
          <button
            onClick={() => setMoveModal(null)}
            className="text-slate-400 hover:text-slate-600"
          >
            <X size={20} />
          </button>
        </div>

        <div className="space-y-2">
          {stages.map((stage) => {
            const isCurrentStage = moveModal.item?.status === stage;
            const formattedStage = stage.replace(/_/g, " ");
            return (
              <button
                key={stage}
                onClick={async () => {
                  if (!isCurrentStage) {
                    if (moveModal.pipelineType === "networking") {
                      await onMoveContact(moveModal.item.id, stage);
                    } else {
                      await onMoveOpportunity(moveModal.item.id, stage);
                    }
                  }
                  setMoveModal(null);
                }}
                disabled={isCurrentStage}
                className={`w-full p-3 text-left rounded-lg font-medium transition-colors ${
                  isCurrentStage
                    ? "bg-blue-50 text-blue-700 border-2 border-blue-200 cursor-default"
                    : "bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-200"
                }`}
              >
                <span className="text-sm">{formattedStage}</span>
                {isCurrentStage && (
                  <span className="ml-2 text-xs text-blue-500">(Current)</span>
                )}
              </button>
            );
          })}
        </div>

        <button
          onClick={() => setMoveModal(null)}
          className="w-full mt-6 py-3 text-slate-600 hover:bg-slate-50 rounded-lg font-semibold transition-colors border border-slate-200"
        >
          Cancel
        </button>
      </div>
    </div>
  );
};

import React from "react";
import {
  CalendarPlus,
  Trash2,
  ArrowRightLeft,
  ArrowRight,
  ExternalLink,
  Building2,
} from "lucide-react";

interface KanbanCardProps {
  item: any;
  onDragStart: (e: React.DragEvent, id: string) => void;
  onScheduleTask: (id: string, name: string, company?: string) => void;
  onEdit: (item: any) => void;
  onDelete: (id: string) => void;
  onConvert?: (item: any) => void;
  onMoveClick?: (item: any) => void;
}

export const KanbanCard: React.FC<KanbanCardProps> = ({
  item,
  onDragStart,
  onScheduleTask,
  onEdit,
  onDelete,
  onConvert,
  onMoveClick,
}) => {
  const priorityColor =
    item.priority === "high"
      ? "bg-red-100 text-red-800"
      : item.priority === "medium"
        ? "bg-amber-100 text-amber-800"
        : "bg-blue-100 text-blue-800";
  // Contacts have 'name' property, Opportunities have 'title' property
  const isContact = 'name' in item && !('pipeline' in item);

  return (
    <div
      draggable
      onDragStart={(e) => onDragStart(e, item.id)}
      onDoubleClick={(e) => {
        e.stopPropagation();
        onEdit(item);
      }}
      className="bg-white p-3 rounded-lg shadow-sm border border-slate-200 mb-2 cursor-move hover:shadow-md transition-all active:cursor-grabbing group relative hover:border-blue-400"
    >
      <div className="flex justify-between items-start mb-2">
        {!isContact ? (
          <span
            className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${priorityColor}`}
          >
            {item.priority || "Normal"}
          </span>
        ) : (
          <span className="text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider bg-purple-100 text-purple-800">
            Contact
          </span>
        )}
        <div className="flex items-center gap-2">
          {/* Mobile Move Button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onMoveClick && onMoveClick(item);
            }}
            className="md:hidden text-slate-400 hover:text-blue-600 transition-colors"
            title="Move to Stage"
          >
            <ArrowRightLeft size={14} />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onScheduleTask(
                item.id,
                item.title || item.name,
                item.company_name,
              );
            }}
            className="text-slate-400 hover:text-blue-600 transition-colors"
            title="Schedule Task"
          >
            <CalendarPlus size={14} />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete(item.id);
            }}
            className="text-slate-400 hover:text-red-600 transition-colors"
            title="Delete"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>
      <h4 className="font-semibold text-slate-800 leading-snug mb-0.5 text-sm">
        {item.title || item.name}
      </h4>
      <p className="text-xs text-slate-500 font-medium flex items-center gap-1">
        {isContact && <Building2 size={10} />}
        {item.company_name || item.role_title}
      </p>

      {/* Job URL Link - only for application opportunities */}
      {!isContact && item.url && (
        <a
          href={item.url}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => e.stopPropagation()}
          className="mt-2 text-xs text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1 truncate"
        >
          <ExternalLink size={10} />
          View Job Posting
        </a>
      )}

      {/* CONVERT BUTTON FOR QUALIFIED DISCOVERY OPPORTUNITIES */}
      {!isContact &&
        item.pipeline === "discovery" &&
        item.status === "OPPORTUNITY_QUALIFIED" && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onConvert && onConvert(item);
            }}
            className="mt-3 w-full py-2 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold rounded flex items-center justify-center gap-1 hover:bg-emerald-100 transition-colors"
          >
            Convert to App <ArrowRight size={12} />
          </button>
        )}

      {/* CONVERT BUTTON FOR NETWORKING REFERRALS */}
      {isContact && item.status === "REFERRAL_OR_LEAD" && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onConvert && onConvert(item);
          }}
          className="mt-3 w-full py-2 bg-purple-50 border border-purple-200 text-purple-700 text-xs font-bold rounded flex items-center justify-center gap-1 hover:bg-purple-100 transition-colors"
        >
          Convert to App <ArrowRight size={12} />
        </button>
      )}

      <p className="text-[10px] text-slate-400 mt-2 text-right">
        {new Date(item.updated_at).toLocaleDateString(undefined, {
          month: "short",
          day: "numeric",
        })}
      </p>
    </div>
  );
};

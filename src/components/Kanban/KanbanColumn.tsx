import React from "react";
import { KanbanCard } from "./KanbanCard";

interface KanbanColumnProps {
  stage: string;
  items: any[];
  onDrop: (e: React.DragEvent, stage: string) => void;
  onDragOver: (e: React.DragEvent) => void;
  onDragStart: (e: React.DragEvent, id: string) => void;
  onScheduleTask: (id: string, name: string, company?: string) => void;
  onEdit: (item: any) => void;
  onDelete: (id: string) => void;
  onConvert?: (item: any) => void;
  onMoveClick?: (item: any) => void;
}

export const KanbanColumn: React.FC<KanbanColumnProps> = ({
  stage,
  items,
  onDrop,
  onDragOver,
  onDragStart,
  onScheduleTask,
  onEdit,
  onDelete,
  onConvert,
  onMoveClick,
}) => {
  const formattedStage = stage.replace(/_/g, " ");

  return (
    <div
      className="flex-shrink-0 w-[85vw] md:w-72 snap-center bg-slate-50/80 rounded-xl mr-4 flex flex-col max-h-full border border-slate-100"
      onDragOver={onDragOver}
      onDrop={(e) => onDrop(e, stage)}
    >
      <div className="p-3 border-b border-slate-200/60 flex justify-between items-center sticky top-0 rounded-t-xl z-10">
        <h3 className="font-bold text-slate-600 text-[11px] uppercase tracking-wider">
          {formattedStage}
        </h3>
        <span className="bg-slate-200 text-slate-600 text-[10px] px-1.5 py-0.5 rounded-md font-bold">
          {items.length}
        </span>
      </div>
      <div className="p-2 overflow-y-auto flex-1 min-h-[150px] scrollbar-thin scrollbar-thumb-slate-200">
        {items.map((item: any) => (
          <KanbanCard
            key={item.id}
            item={item}
            onDragStart={onDragStart}
            onScheduleTask={onScheduleTask}
            onEdit={onEdit}
            onDelete={onDelete}
            onConvert={onConvert}
            onMoveClick={onMoveClick}
          />
        ))}
        {items.length === 0 && (
          <div className="h-24 border-2 border-dashed border-slate-200 rounded-lg flex items-center justify-center text-slate-400 text-xs font-medium">
            Drop Here
          </div>
        )}
      </div>
    </div>
  );
};

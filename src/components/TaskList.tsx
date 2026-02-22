import React from "react";
import { CheckSquare, Calendar, Building2 } from "lucide-react";
import type { Task, Opportunity, Contact } from "../types";

interface TaskListProps {
  tasks: Task[];
  toggleTask: (id: string, status: boolean) => void;
  onEditTask: (task: Task) => void;
  opportunities: Opportunity[];
  contacts: Contact[];
}

export const TaskList: React.FC<TaskListProps> = ({
  tasks,
  toggleTask,
  onEditTask,
  opportunities,
  contacts,
}) => {
  const sortedTasks = [...tasks].sort(
    (a, b) => new Date(a.due_date).getTime() - new Date(b.due_date).getTime(),
  );

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 flex flex-col h-full">
      <div className="p-4 border-b border-slate-100 flex justify-between items-center">
        <h3 className="font-bold text-slate-800 flex items-center gap-2">
          <CheckSquare className="w-4 h-4 text-blue-500" />
          Priority Tasks
        </h3>
        <span className="text-xs bg-red-100 text-red-700 font-bold px-2 py-1 rounded-full">
          {tasks.filter((t) => !t.is_completed).length} Due
        </span>
      </div>
      <div className="flex-1 overflow-y-auto divide-y divide-slate-50 p-2">
        {sortedTasks.length === 0 ? (
          <div className="p-8 text-center text-slate-400 text-sm">
            No pending tasks. Great job!
          </div>
        ) : (
          sortedTasks.slice(0, 7).map((task) => {
            const isOverdue =
              new Date(task.due_date) < new Date() && !task.is_completed;
            const relatedOpp = opportunities.find(
              (o) => o.id === task.related_entity_id,
            );
            const relatedContact = contacts.find(
              (c) => c.id === task.related_entity_id,
            );
            const linkedCompany =
              relatedOpp?.company_name || relatedContact?.company_name;

            return (
              <div
                key={task.id}
                className="p-3 flex items-start hover:bg-slate-50 rounded-lg transition-colors group"
              >
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleTask(task.id, task.is_completed);
                  }}
                  className={`mt-0.5 w-5 h-5 rounded border mr-3 flex flex-shrink-0 items-center justify-center transition-all ${task.is_completed ? "bg-emerald-500 border-emerald-500" : "border-slate-300 hover:border-blue-500"}`}
                >
                  {task.is_completed && (
                    <CheckSquare className="w-3.5 h-3.5 text-white" />
                  )}
                </button>
                <div
                  className="flex-1 min-w-0 cursor-pointer"
                  onClick={() => onEditTask(task)}
                >
                  <p
                    className={`text-sm font-medium truncate ${task.is_completed ? "text-slate-400 line-through" : "text-slate-700 group-hover:text-blue-600 transition-colors"}`}
                  >
                    {task.title}
                  </p>
                  <div className="flex items-center gap-3 mt-0.5">
                    <div className="flex items-center gap-1 text-slate-400 text-xs">
                      <Calendar className="w-3 h-3" />
                      <span
                        className={isOverdue ? "text-red-600 font-bold" : ""}
                      >
                        {new Date(task.due_date).toLocaleDateString(undefined, {
                          month: "short",
                          day: "numeric",
                        })}
                      </span>
                    </div>
                    {linkedCompany && (
                      <span className="text-[10px] text-slate-500 flex items-center gap-1 bg-slate-50 px-1.5 py-0.5 rounded border border-slate-100 max-w-[100px] truncate">
                        <Building2 size={8} /> {linkedCompany}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

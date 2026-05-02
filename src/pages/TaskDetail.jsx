import { useEffect, useState } from "react";
import API from "../api/api";
import { useParams, useNavigate } from "react-router-dom";
import NotificationBell from "../components/NotificationBell";
import toast from 'react-hot-toast';

export default function TaskDetail() {
  const { id, taskId } = useParams();
  const navigate = useNavigate();

  const [task, setTask] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTask = async () => {
      try {
        const res = await API.get(`/projects/${id}/tasks/${taskId}`);
        setTask(res.data);
      } catch (err) {
        console.error("Failed to fetch task", err);
      } finally {
        setLoading(false);
      }
    };
    fetchTask();
  }, [id, taskId]);

  const toggleSubtask = async (subtaskId) => {
    // Optimistic UI update
    setTask(prev => {
      const newSubtasks = prev.subtasks.map(s => s._id === subtaskId ? { ...s, isCompleted: !s.isCompleted } : s);
      const allCompleted = newSubtasks.length > 0 && newSubtasks.every(s => s.isCompleted);
      return { 
        ...prev, 
        subtasks: newSubtasks,
        status: allCompleted ? "done" : prev.status === "done" ? "in-progress" : prev.status
      };
    });

    try {
      const res = await API.patch(`/projects/${id}/tasks/${taskId}/subtasks/${subtaskId}`);
      setTask(res.data);
      const updatedSubtask = res.data.subtasks.find(s => s._id === subtaskId);
      if (updatedSubtask?.isCompleted) {
        toast.success("Subtask completed!");
      }
      if (res.data.status === 'done') {
        toast.success("All subtasks done — task completed! 🎉");
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to update subtask");
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'done': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      case 'in-progress': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'pending-approval': return 'bg-amber-100 text-amber-700 border-amber-200';
      default: return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  const getStatusDot = (status) => {
    switch (status) {
      case 'done': return 'bg-emerald-500';
      case 'in-progress': return 'bg-blue-500';
      case 'pending-approval': return 'bg-amber-500';
      default: return 'bg-slate-500';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!task) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 flex-col gap-4 animate-fade-in">
        <div className="text-red-500 bg-red-50 p-4 rounded-xl border border-red-100 font-medium">Task not found</div>
        <button onClick={() => navigate(`/project/${id}`)} className="text-indigo-600 font-medium hover:underline">Return to project</button>
      </div>
    );
  }

  const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && task.status !== "done";
  const completedSubtasks = task.subtasks.filter(s => s.isCompleted).length;
  const totalSubtasks = task.subtasks.length;
  const progress = totalSubtasks === 0 ? 0 : (completedSubtasks / totalSubtasks) * 100;

  return (
    <div className="flex min-h-screen bg-slate-50 font-sans">
      <div className="flex-1 flex flex-col h-screen overflow-hidden animate-fade-in">
        <header className="bg-white/80 backdrop-blur-md border-b border-slate-200 px-8 py-5 flex items-center justify-between sticky top-0 z-10 shadow-sm">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate(`/project/${id}`)}
              className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-slate-200 hover:text-slate-800 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
            </button>
            <div>
              <h1 className="text-xl font-bold text-slate-800 tracking-tight">Task Details</h1>
              <p className="text-xs text-slate-500 font-medium uppercase tracking-wider mt-0.5">Checklist Overview</p>
            </div>
          </div>
          <NotificationBell />
        </header>

        <div className="p-8 max-w-4xl mx-auto w-full overflow-y-auto">
          
          <div className={`bg-white border rounded-3xl p-8 shadow-xl shadow-slate-200/50 mb-8 relative overflow-hidden animate-slide-up ${isOverdue ? 'border-red-300 bg-red-50/10' : 'border-slate-200'}`}>
            {task.status === 'done' && (
                <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500 flex justify-end items-start p-3" style={{ clipPath: 'polygon(100% 0, 0 0, 100% 100%)' }}>
                  <svg className="w-6 h-6 text-white mr-2 mt-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                </div>
            )}

            <div className="mb-6 flex flex-wrap gap-2">
                <span className={`inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider px-3 py-1.5 rounded border ${getStatusColor(task.status)}`}>
                  <span className={`w-2 h-2 rounded-full ${getStatusDot(task.status)}`}></span>
                  {task.status.replace("-", " ")}
                </span>
                {isOverdue && (
                  <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider px-3 py-1.5 rounded border bg-red-100 text-red-700 border-red-200">
                    OVERDUE
                  </span>
                )}
            </div>

            <h2 className={`text-3xl font-bold text-slate-800 mb-6 ${task.status === 'done' ? 'line-through text-slate-500' : ''}`}>{task.title}</h2>

            <div className="grid sm:grid-cols-2 gap-4 mb-8">
              <div className="flex items-center gap-3 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center text-slate-500 font-bold">
                  {task.assignedTo?.name?.charAt(0).toUpperCase() || "?"}
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Assigned To</p>
                  <p className="font-bold text-slate-700">{task.assignedTo?.name || "Unassigned"}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 font-bold">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Due Date</p>
                  <p className="font-bold text-slate-700">{task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'N/A'}</p>
                </div>
              </div>
            </div>

            <div className="border-t border-slate-100 pt-8">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-slate-800">Subtasks</h3>
                <span className="text-sm font-bold text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full">{completedSubtasks} / {totalSubtasks} Completed</span>
              </div>
              
              <div className="w-full bg-slate-100 rounded-full h-2.5 mb-8">
                <div className="bg-indigo-500 h-2.5 rounded-full transition-all duration-500" style={{ width: `${progress}%` }}></div>
              </div>

              {totalSubtasks === 0 ? (
                <div className="text-center bg-slate-50 border border-dashed border-slate-200 rounded-2xl p-8 text-slate-500 font-medium">
                  No subtasks for this task.
                </div>
              ) : (
                <div className="space-y-3">
                  {task.subtasks.map((st) => (
                    <label 
                      key={st._id} 
                      className={`flex items-start gap-4 p-4 rounded-2xl border cursor-pointer transition-all hover:shadow-md ${st.isCompleted ? 'bg-slate-50 border-slate-200 opacity-60' : 'bg-white border-slate-200 hover:border-indigo-300 shadow-sm'}`}
                    >
                      <div className="mt-0.5 relative flex items-center justify-center">
                        <input
                          type="checkbox"
                          className="peer appearance-none w-6 h-6 border-2 border-slate-300 rounded-lg checked:bg-indigo-500 checked:border-indigo-500 transition-colors cursor-pointer"
                          checked={st.isCompleted}
                          onChange={() => toggleSubtask(st._id)}
                        />
                        <svg className="absolute w-4 h-4 text-white pointer-events-none opacity-0 peer-checked:opacity-100 transition-opacity" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                      </div>
                      <span className={`text-lg font-medium transition-all ${st.isCompleted ? 'text-slate-400 line-through' : 'text-slate-700'}`}>
                        {st.title}
                      </span>
                    </label>
                  ))}
                </div>
              )}
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}

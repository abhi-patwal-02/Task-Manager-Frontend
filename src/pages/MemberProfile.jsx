import { useEffect, useState } from "react";
import API from "../api/api";
import { useParams, useNavigate } from "react-router-dom";
import NotificationBell from "../components/NotificationBell";

export default function MemberProfile() {
  const { id, memberId } = useParams();
  const navigate = useNavigate();

  const [member, setMember] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState("list");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const memberRes = await API.get(`/users/${memberId}`);
        setMember(memberRes.data);

        const tasksRes = await API.get(`/projects/${id}/tasks`);
        const memberTasks = tasksRes.data.filter(
          (t) => (t.assignedTo?._id || t.assignedTo) === memberId
        );
        setTasks(memberTasks);
      } catch (err) {
        console.error("Error fetching member profile data", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, memberId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!member) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 flex-col gap-4 animate-fade-in">
        <div className="text-red-500 bg-red-50 p-4 rounded-xl border border-red-100 font-medium">Member not found</div>
        <button onClick={() => navigate(`/project/${id}`)} className="text-indigo-600 font-medium hover:underline">Return to project</button>
      </div>
    );
  }

  const pendingTasks = tasks.filter((t) => t.status !== "done");
  const completedTasks = tasks.filter((t) => t.status === "done");

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
              <h1 className="text-xl font-bold text-slate-800 tracking-tight">Team Member</h1>
              <p className="text-xs text-slate-500 font-medium uppercase tracking-wider mt-0.5">Profile Overview</p>
            </div>
          </div>
          <NotificationBell />
        </header>

        <div className="p-8 max-w-5xl mx-auto w-full overflow-y-auto">
          {/* PROFILE INFO */}
          <div className="bg-white border border-slate-200 rounded-3xl p-8 shadow-xl shadow-slate-200/50 mb-8 flex items-center gap-6 animate-slide-up">
            <div className="w-20 h-20 bg-gradient-to-br from-indigo-100 to-purple-100 text-indigo-600 rounded-2xl flex items-center justify-center text-3xl font-bold shadow-inner">
              {member.name?.charAt(0).toUpperCase()}
            </div>
            <div>
              <h2 className="text-3xl font-bold text-slate-800 tracking-tight">{member.name}</h2>
              <p className="text-slate-500 font-medium mt-1">{member.email}</p>
            </div>
          </div>

          <div className="flex justify-between items-center mb-6 animate-slide-up">
            <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Task History</h2>
            <div className="flex bg-slate-100 p-1 rounded-lg border border-slate-200">
              <button 
                className={`p-1.5 rounded-md transition-all ${viewMode === 'grid' ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-400 hover:text-slate-600'}`}
                onClick={() => setViewMode('grid')}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>
              </button>
              <button 
                className={`p-1.5 rounded-md transition-all ${viewMode === 'list' ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-400 hover:text-slate-600'}`}
                onClick={() => setViewMode('list')}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
              </button>
            </div>
          </div>

          <div className="grid lg:grid-cols-2 gap-8 animate-slide-up" style={{ animationDelay: '0.1s' }}>
            {/* PENDING TASKS */}
            <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-lg shadow-slate-200/40">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-3 h-3 rounded-full bg-amber-500"></div>
                <h3 className="text-lg font-bold text-slate-800">Pending Tasks <span className="ml-2 text-sm font-medium bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full">{pendingTasks.length}</span></h3>
              </div>
              
              {pendingTasks.length === 0 ? (
                <div className="bg-slate-50 border border-dashed border-slate-200 rounded-2xl p-8 text-center text-slate-400 font-medium">
                  No pending tasks.
                </div>
              ) : (
                <div className={viewMode === 'grid' ? "grid grid-cols-1 xl:grid-cols-2 gap-4" : "space-y-4"}>
                  {pendingTasks.map((t) => {
                    const isOverdue = t.dueDate && new Date(t.dueDate) < new Date() && t.status !== "done";
                    return (
                    <div key={t._id} className={`group border rounded-2xl p-4 hover:bg-white hover:shadow-md transition-all ${isOverdue ? 'bg-red-50/50 border-red-200' : 'bg-slate-50 border-slate-100 hover:border-amber-200'}`}>
                      <h4 className="font-bold text-slate-800 mb-2">{t.title}</h4>
                      {t.description && (
                        <p className="text-sm text-slate-500 mb-3 line-clamp-2">{t.description}</p>
                      )}
                      <div className="flex flex-wrap items-center gap-4 text-xs font-medium mb-3">
                        <span className="flex items-center gap-1.5 px-2.5 py-1 bg-amber-50 text-amber-700 rounded-md border border-amber-100 capitalize">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                          {t.status.replace("-", " ")}
                        </span>
                        {isOverdue && (
                          <span className="flex items-center gap-1.5 px-2.5 py-1 bg-red-100 text-red-700 rounded-md border border-red-200 capitalize font-bold">
                            OVERDUE
                          </span>
                        )}
                        <span className="text-slate-500 flex items-center gap-1">
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                          {t.createdAt ? new Date(t.createdAt).toLocaleDateString() : "N/A"}
                        </span>
                      </div>
                      <div className="text-xs font-medium text-slate-500 bg-white inline-block px-2 py-1 rounded border border-slate-100">
                        Due: {t.dueDate ? new Date(t.dueDate).toLocaleDateString() : 'Tomorrow'}
                      </div>
                    </div>
                  )})}
                </div>
              )}
            </div>

            {/* COMPLETED TASKS */}
            <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-lg shadow-slate-200/40">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
                <h3 className="text-lg font-bold text-slate-800">Completed Tasks <span className="ml-2 text-sm font-medium bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full">{completedTasks.length}</span></h3>
              </div>

              {completedTasks.length === 0 ? (
                <div className="bg-slate-50 border border-dashed border-slate-200 rounded-2xl p-8 text-center text-slate-400 font-medium">
                  No completed tasks yet.
                </div>
              ) : (
                <div className={viewMode === 'grid' ? "grid grid-cols-1 xl:grid-cols-2 gap-4" : "space-y-4"}>
                  {completedTasks.map((t) => (
                    <div key={t._id} className="group border border-slate-100 bg-slate-50 rounded-2xl p-4 hover:border-emerald-200 hover:bg-white hover:shadow-md transition-all opacity-80 hover:opacity-100">
                      <h4 className="font-bold text-slate-600 line-through mb-2">{t.title}</h4>
                      <div className="flex flex-col gap-2 text-xs font-medium">
                        <span className="text-slate-500 flex items-center gap-1">
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                          Created: {t.createdAt ? new Date(t.createdAt).toLocaleDateString() : "N/A"}
                        </span>
                        <span className="text-emerald-600 flex items-center gap-1 bg-emerald-50 w-max px-2 py-1 rounded border border-emerald-100">
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                          Done: {t.completedAt ? new Date(t.completedAt).toLocaleString() : "N/A"}
                        </span>
                      </div>
                    </div>
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

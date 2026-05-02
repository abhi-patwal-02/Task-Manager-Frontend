import React from 'react';

export default function ProjectAnalytics({ tasks, members }) {
  // --- Overall Analytics ---
  const totalTasks = tasks.length;
  const doneTasks = tasks.filter(t => t.status === 'done').length;
  const inProgressTasks = tasks.filter(t => t.status === 'in-progress').length;
  const pendingTasks = tasks.filter(t => t.status === 'pending-approval').length;
  const todoTasks = tasks.filter(t => t.status === 'todo').length;

  const overdueTasks = tasks.filter(t => t.dueDate && new Date(t.dueDate) < new Date() && t.status !== 'done').length;

  const completionRate = totalTasks === 0 ? 0 : Math.round((doneTasks / totalTasks) * 100);

  // --- Member Analytics ---
  const memberStats = members.map(m => {
    const memberTasks = tasks.filter(t => {
      const assignedId = t.assignedTo?._id || t.assignedTo;
      const mId = m.user?._id || m.user;
      return assignedId === mId;
    });

    const assignedCount = memberTasks.length;
    const completedCount = memberTasks.filter(t => t.status === 'done').length;
    const overdueCount = memberTasks.filter(t => t.dueDate && new Date(t.dueDate) < new Date() && t.status !== 'done').length;
    const progress = assignedCount === 0 ? 0 : Math.round((completedCount / assignedCount) * 100);

    return {
      user: m.user,
      assignedCount,
      completedCount,
      overdueCount,
      progress
    };
  });

  // Sort by highest completion rate first
  memberStats.sort((a, b) => b.progress - a.progress);

  return (
    <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-lg shadow-slate-200/40 mb-10 animate-slide-up" style={{ animationDelay: '0.1s' }}>
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-pink-50 text-pink-600 flex items-center justify-center">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
        </div>
        <div>
          <h2 className="text-xl font-bold text-slate-800">Project Analytics</h2>
          <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">High-level insights</p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 flex flex-col justify-center">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Completion</span>
          <div className="flex items-end gap-2">
            <span className="text-3xl font-black text-emerald-600">{completionRate}%</span>
          </div>
        </div>
        <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 flex flex-col justify-center">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Active Tasks</span>
          <div className="flex items-end gap-2">
            <span className="text-3xl font-black text-slate-700">{totalTasks}</span>
          </div>
        </div>
        <div className="bg-amber-50/50 rounded-2xl p-4 border border-amber-100 flex flex-col justify-center">
          <span className="text-xs font-bold text-amber-500 uppercase tracking-wider mb-1">Needs Review</span>
          <div className="flex items-end gap-2">
            <span className="text-3xl font-black text-amber-600">{pendingTasks}</span>
          </div>
        </div>
        <div className="bg-red-50/50 rounded-2xl p-4 border border-red-100 flex flex-col justify-center">
          <span className="text-xs font-bold text-red-500 uppercase tracking-wider mb-1">Overdue</span>
          <div className="flex items-end gap-2">
            <span className="text-3xl font-black text-red-600">{overdueTasks}</span>
          </div>
        </div>
      </div>

      {/* Status Breakdown Bar */}
      {totalTasks > 0 && (
        <div className="mb-10">
          <h3 className="text-sm font-bold text-slate-600 mb-3">Status Breakdown</h3>
          <div className="w-full h-3 bg-slate-100 rounded-full flex overflow-hidden">
            {doneTasks > 0 && <div style={{ width: `${(doneTasks/totalTasks)*100}%` }} className="bg-emerald-500" title="Done"></div>}
            {inProgressTasks > 0 && <div style={{ width: `${(inProgressTasks/totalTasks)*100}%` }} className="bg-blue-500" title="In Progress"></div>}
            {pendingTasks > 0 && <div style={{ width: `${(pendingTasks/totalTasks)*100}%` }} className="bg-amber-500" title="Pending"></div>}
            {todoTasks > 0 && <div style={{ width: `${(todoTasks/totalTasks)*100}%` }} className="bg-slate-300" title="Todo"></div>}
          </div>
          <div className="flex flex-wrap gap-4 mt-3 text-xs font-medium text-slate-500">
            <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span> Done ({doneTasks})</div>
            <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span> In Progress ({inProgressTasks})</div>
            <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span> Pending Review ({pendingTasks})</div>
            <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-slate-300"></span> Todo ({todoTasks})</div>
          </div>
        </div>
      )}

      {/* Team Leaderboard */}
      <div>
        <h3 className="text-sm font-bold text-slate-600 mb-4">Team Leaderboard</h3>
        {memberStats.length === 0 ? (
           <p className="text-sm text-slate-500 italic">No team members to display.</p>
        ) : (
          <div className="space-y-4">
            {memberStats.map((stat, idx) => (
              <div key={stat.user?._id || idx} className="flex flex-col sm:flex-row sm:items-center gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                <div className="flex items-center gap-3 w-48">
                  <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold text-xs shrink-0">
                    {stat.user?.name?.charAt(0).toUpperCase() || "?"}
                  </div>
                  <div className="truncate text-sm font-bold text-slate-700">
                    {stat.user?.name || stat.user?.email || "Unknown User"}
                  </div>
                </div>
                
                <div className="flex-1">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Progress</span>
                    <span className="text-xs font-bold text-indigo-600">{stat.progress}%</span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-1.5">
                    <div className="bg-indigo-500 h-1.5 rounded-full transition-all" style={{ width: `${stat.progress}%` }}></div>
                  </div>
                </div>

                <div className="flex gap-4 sm:ml-4 text-xs">
                  <div className="flex flex-col">
                    <span className="text-slate-400 font-bold uppercase tracking-wider mb-0.5">Tasks</span>
                    <span className="font-bold text-slate-700">{stat.completedCount} / {stat.assignedCount}</span>
                  </div>
                  {stat.overdueCount > 0 && (
                    <div className="flex flex-col">
                      <span className="text-red-400 font-bold uppercase tracking-wider mb-0.5">Overdue</span>
                      <span className="font-bold text-red-600">{stat.overdueCount}</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}

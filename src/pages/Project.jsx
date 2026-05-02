import { useEffect, useState } from "react";
import API from "../api/api";
import { useParams, useNavigate } from "react-router-dom";
import NotificationBell from "../components/NotificationBell";
import ProjectAnalytics from "../components/ProjectAnalytics";
import toast from 'react-hot-toast';

export default function Project() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [tasks, setTasks] = useState([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [taskAssignedTo, setTaskAssignedTo] = useState("");

  const [members, setMembers] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [results, setResults] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);

  const [viewModeTask, setViewModeTask] = useState("grid");

  // Fetch current user
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await API.get("/users/me");
        setCurrentUser(res.data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchUser();
  }, []);

  // Fetch data
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const tasksRes = await API.get(`/projects/${id}/tasks`);
        setTasks(tasksRes.data);

        const projectRes = await API.get(`/projects/${id}`);
        setMembers(projectRes.data.members);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const myMember = currentUser ? members.find((m) => (m.user?._id || m.user) === currentUser._id) : null;
  const myRole = myMember?.role || "member";

  // Search users
  useEffect(() => {
    const searchUsers = async () => {
      if (!search.trim()) {
        setResults([]);
        return;
      }
      const res = await API.get(`/users/search?query=${search}`);
      setResults(res.data);
    };
    const delay = setTimeout(searchUsers, 300);
    return () => clearTimeout(delay);
  }, [search]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  // Create Task
  const createTask = async () => {
    if (!title.trim()) return;
    try {
      const payload = { title, description, dueDate };
      if (myRole === "admin" && taskAssignedTo) {
        payload.assignedTo = taskAssignedTo;
      }
      const res = await API.post(`/projects/${id}/tasks`, payload);

      setTasks((prev) => [...prev, res.data]);
      setTitle("");
      setDescription("");
      setDueDate("");
      setTaskAssignedTo("");
      toast.success("Task created successfully!");
    } catch (error) {
      toast.error("Failed to create task");
    }
  };

  // Update Task
  const updateTask = async (taskId, status) => {
    try {
      await API.patch(`/projects/${id}/tasks/${taskId}`, { status });
      setTasks((prev) =>
        prev.map((t) => (t._id === taskId ? { ...t, status } : t))
      );
      if (status === 'done') {
        toast.success("Task completed!");
      } else {
        toast.success(`Task moved to ${status}`);
      }
    } catch (error) {
      toast.error("Failed to update task");
    }
  };

  // Add Member
  const handleAddMember = async () => {
    if (!selectedUser) {
      toast.error("Select a user first");
      return;
    }
    try {
      const res = await API.post(`/projects/${id}/members`, {
        userId: selectedUser._id,
        role: "member",
      });
      setMembers(res.data.members);
      setSearch("");
      setSelectedUser(null);
      setResults([]);
      toast.success("Member added to project!");
    } catch (error) {
      toast.error("Failed to add member");
    }
  };

  // Update Role
  const updateRole = async (userId, role) => {
    try {
      const res = await API.patch(`/projects/${id}/members`, { userId, role });
      setMembers(res.data.members);
      toast.success("Member role updated!");
    } catch (error) {
      toast.error("Failed to update role");
    }
  };

  // Remove Member
  const removeMember = async (userId) => {
    try {
      const res = await API.delete(`/projects/${id}/members`, { data: { userId } });
      setMembers(res.data.members);
      toast.success("Member removed from project");
    } catch (error) {
      toast.error("Failed to remove member");
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

  return (
    <div className="flex min-h-screen bg-slate-50 font-sans">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-slate-200 p-6 flex-col shadow-sm z-10 hidden md:flex">
        <div className="flex items-center gap-3 mb-10">
          <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold text-lg">
            T
          </div>
          <h2 className="text-xl font-bold tracking-tight text-slate-800">TaskFlow</h2>
        </div>

        <nav className="flex flex-col gap-2 flex-1">
          <span className="text-slate-400 uppercase text-xs font-semibold tracking-wider mb-2 px-3">Menu</span>
          <button
            className="text-left px-3 py-2 rounded-xl text-slate-500 hover:bg-slate-50 hover:text-slate-900 transition-colors font-medium"
            onClick={() => navigate("/dashboard")}
          >
            Dashboard
          </button>
          <button
            className="text-left px-3 py-2 rounded-xl text-slate-500 hover:bg-slate-50 hover:text-slate-900 transition-colors font-medium"
            onClick={() => navigate("/profile")}
          >
            Profile
          </button>
        </nav>

        <button
          className="text-left px-3 py-2 rounded-xl text-red-500 hover:bg-red-50 hover:text-red-700 transition-colors font-medium mt-auto flex items-center gap-2"
          onClick={() => {
            localStorage.removeItem("token");
            navigate("/");
          }}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
          Logout
        </button>
      </aside>

      <div className="flex-1 flex flex-col h-screen overflow-hidden animate-fade-in">
        <header className="bg-white/80 backdrop-blur-md border-b border-slate-200 px-8 py-5 flex justify-between items-center sticky top-0 z-10 shadow-sm">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate("/dashboard")}
              className="md:hidden w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-slate-200"
            >
              &larr;
            </button>
            <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Project Board</h1>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 bg-slate-100 px-3 py-1.5 rounded-full border border-slate-200 hidden sm:block">Role: <span className={myRole === 'admin' ? 'text-indigo-600' : 'text-slate-700'}>{myRole}</span></span>
            <NotificationBell />
          </div>
        </header>

        <div className="p-8 overflow-y-auto flex-1">
          {/* ANALYTICS SECTION */}
          {myRole === "admin" && (
            <ProjectAnalytics tasks={tasks} members={members} />
          )}

          {/* TEAM SECTION */}
          {myRole === "admin" && (
            <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-lg shadow-slate-200/40 mb-10 animate-slide-up">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
                </div>
                <h2 className="text-xl font-bold text-slate-800">Team Management</h2>
              </div>

              {/* SEARCH + ADD */}
              <div className="flex flex-col sm:flex-row gap-3 mb-6 relative">
                <div className="flex-1 relative">
                  <input
                    className="w-full border border-slate-200 rounded-xl px-4 py-3 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-indigo-200 focus:border-indigo-500 transition-all outline-none"
                    placeholder="Search user by email to add..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                  {results.length > 0 && (
                    <div className="absolute top-14 bg-white border border-slate-200 rounded-xl w-full shadow-xl shadow-slate-200/50 z-20 max-h-48 overflow-y-auto overflow-x-hidden p-2">
                      {results.map((u) => (
                        <div
                          key={u._id}
                          className="p-3 hover:bg-slate-50 cursor-pointer rounded-lg transition-colors border border-transparent hover:border-slate-100 flex items-center gap-3"
                          onClick={() => {
                            setSelectedUser(u);
                            setSearch(u.email);
                            setResults([]);
                          }}
                        >
                          <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold text-xs">{u.name?.charAt(0).toUpperCase()}</div>
                          <div>
                            <p className="text-sm font-bold text-slate-800">{u.name}</p>
                            <p className="text-xs text-slate-500">{u.email}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <button
                  className="bg-indigo-600 text-white px-6 py-3 rounded-xl font-medium hover:bg-indigo-700 transition-all duration-300 hover:shadow-md active:scale-95 whitespace-nowrap"
                  onClick={handleAddMember}
                >
                  Add Member
                </button>
              </div>

              {/* MEMBERS LIST */}
              <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
                {members.map((m) => (
                  <div
                    key={m.user?._id || m.user}
                    className="group bg-slate-50 border border-slate-200 rounded-2xl p-4 hover:border-indigo-200 hover:bg-white hover:shadow-md transition-all flex flex-col justify-between"
                  >
                    <div
                      className="cursor-pointer flex items-center gap-3 mb-4"
                      onClick={() => navigate(`/project/${id}/member/${m.user?._id || m.user}`)}
                    >
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-100 to-purple-100 text-indigo-600 flex items-center justify-center font-bold shadow-inner group-hover:scale-105 transition-transform">
                        {m.user?.name?.charAt(0).toUpperCase() || "?"}
                      </div>
                      <div>
                        <p className="font-bold text-slate-800 group-hover:text-indigo-600 transition-colors">{m.user?.name || "Unknown User"}</p>
                        <p className="text-xs text-slate-500">{m.user?.email || ""}</p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between border-t border-slate-200 pt-3">
                      <select
                        value={m.role}
                        onChange={(e) => updateRole(m.user?._id || m.user, e.target.value)}
                        className="bg-white border border-slate-200 rounded-lg px-2 py-1 text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                      >
                        <option value="admin">Admin</option>
                        <option value="member">Member</option>
                      </select>
                      <button
                        className="text-red-500 hover:text-red-700 hover:bg-red-50 px-2 py-1 rounded text-xs font-semibold transition-colors"
                        onClick={() => removeMember(m.user?._id || m.user)}
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TASK SECTION */}
          <div className="flex justify-between items-center mb-6 animate-slide-up" style={{ animationDelay: '0.1s' }}>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" /></svg>
              </div>
              <h2 className="text-2xl font-bold text-slate-800">Tasks</h2>
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm mb-8 animate-slide-up" style={{ animationDelay: '0.1s' }}>
            <div className="flex flex-col gap-4">
              <input
                className="bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-200 focus:border-purple-500 transition-all text-slate-700"
                placeholder="What needs to be done? (Title)"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
              <textarea
                className="bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-200 focus:border-purple-500 transition-all text-slate-700 min-h-[100px]"
                placeholder="Task subtasks (press Enter for new bullet)"
                value={description}
                onChange={(e) => {
                  let val = e.target.value;
                  if (val.length === 1 && val !== '•') val = '• ' + val;
                  setDescription(val);
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    setDescription(prev => prev + '\n• ');
                  }
                }}
              />
              <div className="flex flex-col md:flex-row gap-4 items-center">
                <input
                  type="date"
                  className="w-full md:w-auto bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-200 focus:border-purple-500 transition-all text-slate-700"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                />
                {myRole === "admin" && (
                  <select
                    className="w-full md:w-auto bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-200 focus:border-purple-500 transition-all text-slate-700 font-medium"
                    value={taskAssignedTo}
                    onChange={(e) => setTaskAssignedTo(e.target.value)}
                  >
                    <option value="">Unassigned</option>
                    {members.map((m) => (
                      <option key={m.user?._id || m.user} value={m.user?._id || m.user}>
                        {m.user?.name || m.user?.email || "Unknown"}
                      </option>
                    ))}
                  </select>
                )}
                <button
                  className="w-full md:w-auto md:ml-auto bg-slate-800 text-white px-8 py-3 rounded-2xl font-medium hover:bg-slate-900 transition-all duration-300 hover:shadow-md active:scale-95"
                  onClick={createTask}
                >
                  Add Task
                </button>
              </div>
            </div>
          </div>

          <div className="flex justify-end mb-6 animate-slide-up" style={{ animationDelay: '0.1s' }}>
            <div className="flex bg-slate-100 p-1 rounded-lg border border-slate-200 shadow-sm">
              <button
                className={`p-1.5 rounded-md transition-all ${viewModeTask === 'grid' ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-400 hover:text-slate-600'}`}
                onClick={() => setViewModeTask('grid')}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>
              </button>
              <button
                className={`p-1.5 rounded-md transition-all ${viewModeTask === 'list' ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-400 hover:text-slate-600'}`}
                onClick={() => setViewModeTask('list')}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
              </button>
            </div>
          </div>

          <div className={viewModeTask === 'grid' ? "grid md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6 animate-slide-up" : "flex flex-col gap-4 animate-slide-up"} style={{ animationDelay: '0.2s' }}>
            {tasks.map((t) => {
              const isOverdue = t.dueDate && new Date(t.dueDate) < new Date() && t.status !== "done";
              return (
                <div
                  key={t._id}
                  className={`group cursor-pointer bg-white border p-5 shadow-sm hover:shadow-xl transition-all duration-300 relative overflow-hidden ${isOverdue ? 'border-red-300 bg-red-50/20' : t.status === 'pending-approval' ? 'border-amber-200 bg-amber-50/30' : 'border-slate-200'} ${viewModeTask === 'grid' ? 'rounded-3xl flex flex-col min-h-[200px]' : 'rounded-2xl flex flex-col md:flex-row md:items-center gap-4 min-h-[100px]'}`}
                  onClick={() => navigate(`/project/${id}/task/${t._id}`)}
                >

                  {t.status === 'done' && (
                    <div className="absolute top-0 right-0 w-16 h-16 bg-emerald-500 flex justify-end items-start p-2" style={{ clipPath: 'polygon(100% 0, 0 0, 100% 100%)' }}>
                      <svg className="w-4 h-4 text-white mr-1 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                    </div>
                  )}

                  <div className={`flex flex-col flex-1 ${viewModeTask === 'list' && 'py-2'}`}>
                    <div className="mb-4 flex flex-wrap gap-2">
                      <span className={`inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider px-2.5 py-1 rounded border ${getStatusColor(t.status)}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${getStatusDot(t.status)}`}></span>
                        {t.status.replace("-", " ")}
                      </span>
                      {isOverdue && (
                        <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider px-2.5 py-1 rounded border bg-red-100 text-red-700 border-red-200">
                          OVERDUE
                        </span>
                      )}
                    </div>

                    <h3 className={`text-lg font-bold text-slate-800 mb-2 ${t.status === 'done' ? 'line-through text-slate-500' : ''}`}>{t.title}</h3>

                    {t.subtasks && t.subtasks.length > 0 && (
                      <div className="mb-4">
                        <div className="flex justify-between items-center mb-1.5">
                          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Subtasks</span>
                          <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">{t.subtasks.filter(s => s.isCompleted).length}/{t.subtasks.length}</span>
                        </div>
                        <div className="w-full bg-slate-100 rounded-full h-1.5">
                          <div className="bg-indigo-500 h-1.5 rounded-full transition-all" style={{ width: `${(t.subtasks.filter(s => s.isCompleted).length / t.subtasks.length) * 100}%` }}></div>
                        </div>
                      </div>
                    )}

                    <div className={`flex flex-wrap items-center gap-4 text-xs font-medium text-slate-500 ${viewModeTask === 'grid' && 'mt-auto'}`}>
                      <span className="bg-slate-50 px-2 py-1 rounded border border-slate-100">
                        Due: {t.dueDate ? new Date(t.dueDate).toLocaleDateString() : 'Tomorrow'}
                      </span>
                      {t.assignedTo ? (
                        <div className="flex items-center gap-1.5">
                          <div className="w-5 h-5 rounded-full bg-slate-200 text-slate-600 flex items-center justify-center text-[10px] font-bold">
                            {t.assignedTo.name?.charAt(0).toUpperCase() || "U"}
                          </div>
                          {t.assignedTo.name || t.assignedTo.email}
                        </div>
                      ) : (
                        <div className="flex items-center gap-1.5 opacity-60">
                          <div className="w-5 h-5 rounded-full border border-dashed border-slate-300"></div>
                          Unassigned
                        </div>
                      )}
                    </div>
                  </div>

                  <div className={`flex gap-2 ${viewModeTask === 'grid' ? 'pt-4 border-t border-slate-100 mt-4' : 'md:flex-col md:w-32 shrink-0 border-t md:border-t-0 md:border-l border-slate-100 pt-4 md:pt-0 md:pl-4 mt-4 md:mt-0'}`}>
                    {t.status === "pending-approval" && myRole === "admin" && (
                      <button
                        className="flex-1 text-xs font-bold uppercase tracking-wider bg-indigo-600 text-white py-2 rounded-xl hover:bg-indigo-700 transition-colors z-10 relative"
                        onClick={(e) => { e.stopPropagation(); updateTask(t._id, "todo"); }}
                      >
                        Approve
                      </button>
                    )}

                    {t.status !== "pending-approval" && t.status !== "done" && (
                      <>
                        <button
                          className="flex-1 text-xs font-bold uppercase tracking-wider bg-blue-50 text-blue-700 border border-blue-200 py-2 rounded-xl hover:bg-blue-100 transition-colors z-10 relative"
                          onClick={(e) => { e.stopPropagation(); updateTask(t._id, "in-progress"); }}
                        >
                          Start
                        </button>

                        <button
                          className="flex-1 text-xs font-bold uppercase tracking-wider bg-emerald-500 text-white py-2 rounded-xl hover:bg-emerald-600 transition-colors shadow-md shadow-emerald-200 z-10 relative"
                          onClick={(e) => { e.stopPropagation(); updateTask(t._id, "done"); }}
                        >
                          Done
                        </button>
                      </>
                    )}
                    {t.status === "done" && (
                      <button
                        className="flex-1 text-xs font-bold uppercase tracking-wider bg-slate-100 text-slate-600 border border-slate-200 py-2 rounded-xl hover:bg-slate-200 transition-colors z-10 relative"
                        onClick={(e) => { e.stopPropagation(); updateTask(t._id, "todo"); }}
                      >
                        Reopen
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
import { useEffect, useState } from "react";
import API from "../api/api";
import { useNavigate } from "react-router-dom";
import NotificationBell from "../components/NotificationBell";
import toast from 'react-hot-toast';

export default function Dashboard() {
  const [projects, setProjects] = useState([]);
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [viewMode, setViewMode] = useState("grid");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const res = await API.get("/projects");
        setProjects(res.data);
      } catch (err) {
        console.error("Failed to fetch projects", err);
      } finally {
        setInitialLoading(false);
      }
    };
    fetchProjects();
  }, []);

  if (initialLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    
    setLoading(true);
    try {
      const res = await API.post("/projects", { name });
      setProjects((prev) => [...prev, res.data]);
      setName("");
      toast.success("Project created successfully!");
    } catch (err) {
      console.error(err);
      toast.error("Failed to create project");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-50 font-sans">

      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-slate-200 p-6 flex flex-col shadow-sm z-10">
        <div className="flex items-center gap-3 mb-10">
          <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold text-lg">
            T
          </div>
          <h2 className="text-xl font-bold tracking-tight text-slate-800">TaskFlow</h2>
        </div>

        <nav className="flex flex-col gap-2 flex-1">
          <span className="text-slate-400 uppercase text-xs font-semibold tracking-wider mb-2 px-3">Menu</span>
          <button className="text-left px-3 py-2 rounded-xl bg-indigo-50 text-indigo-700 font-semibold transition-colors">
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

      {/* Main Content */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden animate-fade-in">

        {/* Header */}
        <header className="bg-white/80 backdrop-blur-md border-b border-slate-200 px-8 py-5 flex justify-between items-center sticky top-0 z-10">
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Projects</h1>
          <div className="flex items-center gap-4">
            <span className="hidden sm:inline-block text-sm font-medium text-slate-500 bg-slate-100 px-3 py-1.5 rounded-full">Welcome back 👋</span>
            <NotificationBell />
          </div>
        </header>

        {/* Scrollable Content */}
        <main className="p-8 overflow-y-auto flex-1">

          {/* Create Project Card */}
          <div className="bg-white p-2 rounded-2xl shadow-sm border border-slate-200 mb-8 max-w-3xl">
            <form onSubmit={handleCreate} className="flex gap-2">
              <input
                className="flex-1 px-4 py-3 bg-transparent outline-none text-slate-700 placeholder-slate-400"
                placeholder="What are you working on? Create a new project..."
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
              <button
                type="submit"
                disabled={loading}
                className="bg-indigo-600 text-white px-6 py-3 rounded-xl font-medium hover:bg-indigo-700 transition-all duration-300 hover:shadow-md active:scale-95 disabled:opacity-70 whitespace-nowrap"
              >
                {loading ? "Creating..." : "Create Project"}
              </button>
            </form>
          </div>

          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-slate-800">Your Projects</h2>
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

          {/* Projects Grid */}
          {projects.length === 0 ? (
            <div className="text-center bg-white border border-dashed border-slate-300 rounded-3xl p-16 animate-slide-up">
              <div className="w-16 h-16 bg-indigo-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
              </div>
              <h3 className="text-lg font-bold text-slate-800 mb-1">No projects yet</h3>
              <p className="text-slate-500">Create your first project to start managing tasks.</p>
            </div>
          ) : (
            <div className={viewMode === 'grid' ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 animate-slide-up" : "flex flex-col gap-4 animate-slide-up"}>
              {projects.map((p) => (
                <div
                  key={p._id}
                  onClick={() => navigate(`/project/${p._id}`)}
                  className={`group bg-white border border-slate-200 p-6 cursor-pointer hover:shadow-xl hover:-translate-y-1 transition-all duration-300 relative overflow-hidden flex ${viewMode === 'grid' ? 'flex-col rounded-2xl min-h-[160px]' : 'flex-row items-center rounded-xl min-h-[80px]'}`}
                >
                  <div className={`absolute top-0 left-0 bg-gradient-to-r from-indigo-500 to-purple-500 transition-transform duration-300 ${viewMode === 'grid' ? 'w-full h-1 transform origin-left scale-x-0 group-hover:scale-x-100' : 'w-1 h-full transform origin-bottom scale-y-0 group-hover:scale-y-100'}`}></div>
                  
                  <div className={`flex justify-between items-start ${viewMode === 'grid' ? 'mb-4' : 'mr-4'}`}>
                    <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
                      {p.name.charAt(0).toUpperCase()}
                    </div>
                  </div>
                  
                  <h2 className="text-xl font-bold text-slate-800 group-hover:text-indigo-600 transition-colors line-clamp-1">
                    {p.name}
                  </h2>
                  
                  <div className={`${viewMode === 'grid' ? 'mt-auto pt-4 border-t border-slate-50' : 'ml-auto pl-4'} flex justify-between items-center`}>
                    <p className="text-xs font-medium text-slate-400 group-hover:text-slate-500 transition-colors">
                      Open tasks &rarr;
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
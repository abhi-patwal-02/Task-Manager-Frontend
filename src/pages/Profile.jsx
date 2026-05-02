import { useEffect, useState } from "react";
import API from "../api/api";
import { useNavigate } from "react-router-dom";
import NotificationBell from "../components/NotificationBell";

export default function Profile() {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await API.get("/users/me");
        setUser(res.data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchUser();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
      </div>
    );
  }

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
          <button 
            className="text-left px-3 py-2 rounded-xl text-slate-500 hover:bg-slate-50 hover:text-slate-900 transition-colors font-medium"
            onClick={() => navigate("/dashboard")}
          >
            Dashboard
          </button>
          <button className="text-left px-3 py-2 rounded-xl bg-indigo-50 text-indigo-700 font-semibold transition-colors">
            Profile
          </button>
        </nav>

        <button 
          className="text-left px-3 py-2 rounded-xl text-red-500 hover:bg-red-50 hover:text-red-700 transition-colors font-medium mt-auto flex items-center gap-2"
          onClick={handleLogout}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
          Logout
        </button>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden animate-fade-in">
        <header className="bg-white/80 backdrop-blur-md border-b border-slate-200 px-8 py-5 flex justify-between items-center sticky top-0 z-10 shadow-sm">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate("/dashboard")}
              className="md:hidden w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-slate-200"
            >
              &larr;
            </button>
            <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Your Profile</h1>
          </div>
          <NotificationBell />
        </header>

        <main className="p-8 overflow-y-auto flex-1 flex justify-center items-start">
          <div className="w-full max-w-lg bg-white border border-slate-200 rounded-3xl p-10 shadow-xl shadow-slate-200/50 animate-slide-up mt-10">
            <div className="flex flex-col items-center mb-8 text-center">
              <div className="w-24 h-24 bg-gradient-to-br from-indigo-100 to-purple-100 text-indigo-600 rounded-full flex items-center justify-center text-4xl font-bold mb-4 shadow-inner">
                {user.name?.charAt(0).toUpperCase()}
              </div>
              <h2 className="text-3xl font-bold text-slate-800 tracking-tight">{user.name}</h2>
              <p className="text-slate-500 mt-1">{user.email}</p>
            </div>
            
            <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Account Details</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center border-b border-slate-200 pb-3">
                  <span className="text-slate-500 font-medium">User ID</span>
                  <span className="text-slate-800 font-mono text-sm bg-white px-2 py-1 rounded border border-slate-200">{user._id}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500 font-medium">Account Type</span>
                  <span className="text-indigo-700 bg-indigo-50 font-semibold text-sm px-3 py-1 rounded-full border border-indigo-100">Standard User</span>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

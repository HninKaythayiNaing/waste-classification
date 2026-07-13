import { Link, useLocation } from 'react-router-dom';
import { Recycle, Home, History, LayoutDashboard, Leaf } from 'lucide-react';
import { useAuth } from '@/lib/AuthContext';
import { base44 } from '@/api/base44Client';

const navItems = [
  { label: 'Classify Waste', path: '/', icon: Home },
  { label: 'History', path: '/history', icon: History },
  { label: 'Admin Dashboard', path: '/admin', icon: LayoutDashboard, adminOnly: true },
];

export default function Layout({ children }) {
  const location = useLocation();
  const { user } = useAuth();

  const handleLogout = async () => {
    await base44.auth.logout();
  };

  const visibleNavItems = navItems.filter(item => !item.adminOnly || user?.role === 'admin');

  return (
    <div className="min-h-screen bg-stone-50 flex">
      {/* Sidebar */}
      <aside className="hidden md:flex w-64 flex-col bg-white border-r border-stone-200 fixed inset-y-0 left-0 z-30">
        <div className="p-6 border-b border-stone-200">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center shadow-sm">
              <Recycle className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="font-heading font-bold text-stone-800 text-sm leading-tight">EcoSort</h1>
              <p className="text-[10px] text-stone-400 leading-tight">AI Waste Classifier</p>
            </div>
          </Link>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {visibleNavItems.map(item => {
            const Icon = item.icon;
            const active = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  active
                    ? 'bg-emerald-50 text-emerald-700'
                    : 'text-stone-500 hover:text-stone-800 hover:bg-stone-50'
                }`}
              >
                <Icon className="w-4.5 h-4.5" style={{ width: 18, height: 18 }} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-stone-200">
          <div className="flex items-center gap-3 px-2 py-2">
            <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center">
              <span className="text-xs font-semibold text-emerald-700">
                {user?.full_name?.charAt(0)?.toUpperCase() || user?.email?.charAt(0)?.toUpperCase() || 'U'}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-stone-700 truncate">{user?.full_name || user?.email}</p>
              <p className="text-[10px] text-stone-400 capitalize">{user?.role || 'user'}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full mt-2 text-xs text-stone-400 hover:text-stone-600 transition-colors text-left px-2 py-1.5"
          >
            Sign out
          </button>
        </div>
      </aside>

      {/* Mobile top bar */}
      <div className="md:hidden fixed top-0 inset-x-0 z-30 bg-white border-b border-stone-200 px-4 py-3 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center">
            <Recycle className="w-4.5 h-4.5 text-white" style={{ width: 18, height: 18 }} />
          </div>
          <span className="font-heading font-bold text-stone-800 text-sm">EcoSort</span>
        </Link>
        <Leaf className="w-5 h-5 text-emerald-500" />
      </div>

      {/* Mobile bottom nav */}
      <div className="md:hidden fixed bottom-0 inset-x-0 z-30 bg-white border-t border-stone-200 flex">
        {visibleNavItems.map(item => {
          const Icon = item.icon;
          const active = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex-1 flex flex-col items-center gap-1 py-2.5 ${
                active ? 'text-emerald-600' : 'text-stone-400'
              }`}
            >
              <Icon style={{ width: 20, height: 20 }} />
              <span className="text-[10px] font-medium">{item.label.split(' ')[0]}</span>
            </Link>
          );
        })}
      </div>

      {/* Main content */}
      <main className="flex-1 md:ml-64 pt-14 md:pt-0 pb-16 md:pb-0">
        <div className="min-h-screen">
          {children}
        </div>
      </main>
    </div>
  );
}
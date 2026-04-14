import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const navItems = [
  ['Dashboard', '/dashboard'],
  ['Analytics', '/analytics'],
  ['Users', '/users'],
  ['Team', '/team'],
  ['Settings', '/settings'],
  ['Notifications', '/notifications'],
  ['Activity Logs', '/activity-logs'],
  ['Profile', '/profile'],
  ['Support', '/support']
];

const AppShell = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const onLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800">
      <div className="flex">
        <aside className="hidden w-64 min-h-screen bg-slate-900 p-4 text-white md:block">
          <Link to="/" className="text-xl font-bold">SaaSCore</Link>
          <nav className="mt-6 space-y-2">
            {navItems.map(([label, to]) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) =>
                  `block rounded px-3 py-2 text-sm ${isActive ? 'bg-indigo-600' : 'hover:bg-slate-800'}`
                }
              >
                {label}
              </NavLink>
            ))}
          </nav>
        </aside>

        <main className="w-full">
          <header className="sticky top-0 flex items-center justify-between border-b bg-white px-6 py-3">
            <div>
              <h1 className="text-sm text-slate-500">Welcome back</h1>
              <p className="font-semibold">{user?.firstName} {user?.lastName} ({user?.role})</p>
            </div>
            <button onClick={onLogout} className="rounded bg-slate-900 px-4 py-2 text-sm text-white">Logout</button>
          </header>
          <div className="p-6"><Outlet /></div>
        </main>
      </div>
    </div>
  );
};

export default AppShell;

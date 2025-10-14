import { Button } from '@/components/ui/button';
import { BarChart3, Home, LogOut, Tag, TrendingUp, Wallet } from 'lucide-react';
import { NavLink, useNavigate } from 'react-router-dom';

const menuItems = [
  { name: 'Dashboard', path: '/dashboard', icon: Home },
  { name: 'Rendas', path: '/financas/rendas', icon: TrendingUp },
  { name: 'Despesas', path: '/financas/despesas', icon: Wallet },
  { name: 'Categorias', path: '/categorias', icon: Tag },
  { name: 'Estatísticas', path: '/estatisticas', icon: BarChart3 },
];

export default function Layout({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();

  function handleLogout() {
    localStorage.removeItem('token');
    navigate('/');
  }

  return (
    <div className="flex min-h-screen bg-slate-50 text-slate-900">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-slate-200 p-4 flex flex-col justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 mb-6">💰 Finanças</h1>
          <nav className="flex flex-col gap-2">
            {menuItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition
                  ${isActive ? 'bg-slate-900 text-white' : 'text-slate-700 hover:bg-slate-100'}`
                }
              >
                <item.icon size={18} />
                {item.name}
              </NavLink>
            ))}
          </nav>
        </div>
        <Button
          onClick={handleLogout}
          variant="outline"
          className="flex items-center gap-2 mt-6 text-red-600 hover:bg-red-50"
        >
          <LogOut size={18} /> Sair
        </Button>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        <header className="bg-white border-b border-slate-200 p-4 flex justify-between items-center">
          <h2 className="text-lg font-semibold">Painel Financeiro</h2>
          <span className="text-slate-500 text-sm">
            {localStorage.getItem('email') || 'Usuário'}
          </span>
        </header>
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
}

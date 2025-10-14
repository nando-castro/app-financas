import { Button } from "@/components/ui/button";
import { useTheme } from "@/hooks/useTheme";
import { BarChart3, Home, LogOut, Menu, Moon, Sun, Tag, Wallet, X } from "lucide-react";
import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";

const menuItems = [
  { name: "Dashboard", path: "/dashboard", icon: Home },
  { name: "Financas", path: "/financas", icon: Wallet },
  { name: "Categorias", path: "/categorias", icon: Tag },
  // { name: 'Rendas', path: '/financas/rendas', icon: TrendingUp },
  // { name: 'Despesas', path: '/financas/despesas', icon: Wallet },
  // { name: 'Categorias', path: '/categorias', icon: Tag },
  { name: "Estatísticas", path: "/estatisticas", icon: BarChart3 },
];

export default function Layout({ children }: { children: React.ReactNode }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();

  function handleLogout() {
    localStorage.removeItem("token");
    navigate("/");
  }

  return (
    <div className="flex min-h-screen bg-slate-50 text-slate-900">
      {/* Sidebar Desktop */}
      <aside className="hidden md:flex w-64 bg-white border-r border-slate-200 p-4 flex-col justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 mb-6">
            💰 Finanças
          </h1>
          <nav className="flex flex-col gap-2">
            {menuItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition
                  ${
                    isActive
                      ? "bg-slate-900 text-white"
                      : "text-slate-700 hover:bg-slate-100"
                  }`
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

      {/* Menu Mobile (drawer) */}
      {menuOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setMenuOpen(false)}
        ></div>
      )}

      <aside
        className={`fixed top-0 left-0 z-50 w-64 bg-white border-r border-slate-200 p-4 h-full flex flex-col justify-between transform transition-transform duration-300 md:hidden
        ${menuOpen ? "translate-x-0" : "-translate-x-full"}`}
      >
        <div>
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold text-slate-800">💰 Finanças</h1>
            <button onClick={() => setMenuOpen(false)}>
              <X size={22} />
            </button>
          </div>
          <nav className="flex flex-col gap-2">
            {menuItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={() => setMenuOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition
                  ${
                    isActive
                      ? "bg-slate-900 text-white"
                      : "text-slate-700 hover:bg-slate-100"
                  }`
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

      {/* Conteúdo */}
      <div className="flex-1 flex flex-col">
        {/* Navbar */}
        <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700 p-4 flex justify-between items-center sticky top-0 z-30">
          <div className="flex items-center gap-3">
            {/* Botão menu mobile */}
            <button className="md:hidden" onClick={() => setMenuOpen(true)}>
              <Menu size={22} className="text-slate-700 dark:text-slate-100" />
            </button>
            <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-100">
              Painel Financeiro
            </h2>
          </div>

          <div className="flex items-center gap-4">
            {/* Botão de tema */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              {theme === "light" ? (
                <Moon size={18} className="text-slate-600" />
              ) : (
                <Sun size={18} className="text-yellow-400" />
              )}
            </button>

            <span className="text-slate-500 dark:text-slate-300 text-sm truncate max-w-[150px] md:max-w-none">
              {localStorage.getItem("email") || "Usuário"}
            </span>
          </div>
        </header>

        {/* Conteúdo principal */}
        <main className="flex-1 p-4 md:p-6">{children}</main>
      </div>
    </div>
  );
}

import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster } from "sonner"; // ✅ Import correto do Sonner
import Layout from "./components/layout/Layout";
import { ProtectedRoute } from "./components/ProtectedRoute";
import "./index.css";
import CategoriasPage from "./pages/CategoriasPage";
import ConfiguracoesPage from "./pages/ConfiguracoesPage";
import Dashboard from "./pages/Dashboard";
import EstatisticasPage from "./pages/EstatisticasPage";
import FinancasPage from "./pages/FinancasPage";
import LoginPage from "./pages/Login";
import RegisterPage from "./pages/RegisterPage";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        {/* Público */}
        <Route path="/" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* Privadas */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Layout>
                <Dashboard />
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/financas"
          element={
            <ProtectedRoute>
              <Layout>
                <FinancasPage />
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/categorias"
          element={
            <ProtectedRoute>
              <Layout>
                <CategoriasPage />
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/estatisticas"
          element={
            <ProtectedRoute>
              <Layout>
                <EstatisticasPage />
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/configuracoes"
          element={
            <ProtectedRoute>
              <Layout>
                <ConfiguracoesPage />
              </Layout>
            </ProtectedRoute>
          }
        />
      </Routes>

      {/* ✅ Toaster do Sonner global */}
      <Toaster
        richColors
        position="top-right"
        theme={localStorage.getItem("theme") === "dark" ? "dark" : "light"}
        expand
        duration={3000}
      />
    </BrowserRouter>
  </React.StrictMode>
);

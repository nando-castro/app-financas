import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import Layout from "./components/layout/Layout";
import { ProtectedRoute } from "./components/ProtectedRoute";
import "./index.css";
import CategoriasPage from "./pages/CategoriasPage";
import Dashboard from "./pages/Dashboard";
import FinancasPage from "./pages/FinancasPage";
import LoginPage from "./pages/Login";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        {/* Público */}
        <Route path="/" element={<LoginPage />} />

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
        {/* <Route
          path="/financas/rendas"
          element={
            <ProtectedRoute>
              <Layout>
                <h1 className="text-2xl font-semibold">Minhas Rendas</h1>
              </Layout>
            </ProtectedRoute>
          }
        /> */}
        {/* <Route
          path="/financas/despesas"
          element={
            <ProtectedRoute>
              <Layout>
                <h1 className="text-2xl font-semibold">Minhas Despesas</h1>
              </Layout>
            </ProtectedRoute>
          }
        /> */}
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
        {/* <Route
          path="/categorias"
          element={
            <ProtectedRoute>
              <Layout>
                <h1 className="text-2xl font-semibold">Categorias</h1>
              </Layout>
            </ProtectedRoute>
          }
        /> */}
        <Route
          path="/estatisticas"
          element={
            <ProtectedRoute>
              <Layout>
                <h1 className="text-2xl font-semibold">Estatísticas</h1>
              </Layout>
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);

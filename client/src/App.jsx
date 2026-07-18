import { useEffect } from "react";
import { Routes, Route } from "react-router-dom";

import Login from "./pages/Login";
import Reportes from "./pages/Reportes";
import ParquesIndustriales from "./pages/ParquesIndustriales";
import Empresas from "./pages/Empresas";
import Proveedores from "./pages/Proveedores";
import Configuracion from "./pages/Configuracion";

import ProtectedRoute from "./routes/ProtectedRoute";
import PublicRoute from "./routes/PublicRoute";

function App() {
  // Aplica el tamaño de texto/UI guardado (ajustado desde Configuración)
  // apenas arranca la app, antes de renderizar cualquier vista.
  // Se usa "zoom" (no font-size) porque varias vistas usan tamaños en px
  // fijos en estilos en línea, y zoom escala todo el render sin importar
  // la unidad usada (px, rem, etc.), a diferencia de font-size que solo
  // afecta unidades relativas (rem/em).
  useEffect(() => {
    const saved = parseInt(localStorage.getItem("textScale"), 10);
    if (Number.isFinite(saved)) {
      document.documentElement.style.zoom = `${saved}%`;
    }
  }, []);

  return (
    <Routes>

      <Route
        path="/"
        element={
          <PublicRoute>
            <Login />
          </PublicRoute>
        }
      />

      <Route
        path="/reportes"
        element={
          <ProtectedRoute>
            <Reportes />
          </ProtectedRoute>
        }
      />

      <Route
        path="/parques"
        element={
          <ProtectedRoute>
            <ParquesIndustriales />
          </ProtectedRoute>
        }
      />

      <Route
        path="/empresas"
        element={
          <ProtectedRoute>
            <Empresas />
          </ProtectedRoute>
        }
      />

      <Route
        path="/proveedores"
        element={
          <ProtectedRoute>
            <Proveedores />
          </ProtectedRoute>
        }
      />

      <Route
        path="/configuracion"
        element={
          <ProtectedRoute>
            <Configuracion />
          </ProtectedRoute>
        }
      />

    </Routes>
  );
}

export default App;
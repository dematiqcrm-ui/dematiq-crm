import { Routes, Route } from "react-router-dom";

import Login from "./pages/Login";
import Reportes from "./pages/Reportes";
import ParquesIndustriales from "./pages/ParquesIndustriales";
import Empresas from "./pages/Empresas";
import Configuracion from "./pages/Configuracion";

import ProtectedRoute from "./routes/ProtectedRoute";
import PublicRoute from "./routes/PublicRoute";

function App() {
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
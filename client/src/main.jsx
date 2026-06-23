import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";

import App from "./App";
import { AuthProvider } from "./context/AuthProvider";
import { AccesibilidadProvider } from "./context/AccesibilidadContext";
import "./index.css";

ReactDOM.createRoot(
  document.getElementById("root")
).render(
  <BrowserRouter>
    <AuthProvider>
      <AccesibilidadProvider>
        <App />
      </AccesibilidadProvider>
    </AuthProvider>
  </BrowserRouter>
);
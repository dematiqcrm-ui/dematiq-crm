import { createContext, useContext, useState } from "react";

const AccesibilidadContext = createContext();

export function AccesibilidadProvider({ children }) {
  const [altoContraste, setAltoContraste] = useState(false);
  const toggleAltoContraste = () => setAltoContraste((v) => !v);
  return (
    <AccesibilidadContext.Provider value={{ altoContraste, toggleAltoContraste }}>
      {children}
    </AccesibilidadContext.Provider>
  );
}

export const useAccesibilidad = () => useContext(AccesibilidadContext);
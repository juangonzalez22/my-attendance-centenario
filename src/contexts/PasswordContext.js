import { createContext, useState, useContext } from "react";

const PasswordContext = createContext();

export function PasswordProvider({ children }) {
  const [authenticated, setAuthenticated] = useState(false);

  const login = () => setAuthenticated(true);
  const logout = () => setAuthenticated(false);

  return (
    <PasswordContext.Provider value={{ authenticated, login, logout }}>
      {children}
    </PasswordContext.Provider>
  );
}

export function usePassword() {
  return useContext(PasswordContext);
}

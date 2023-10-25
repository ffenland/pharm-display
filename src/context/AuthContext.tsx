import { User } from "firebase/auth";
import { createContext } from "react";

export const AuthContext = createContext({
  displayName: "none",
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  return (
    <AuthContext.Provider value={{ ...useUserData }}>
      {children}
    </AuthContext.Provider>
  );
};

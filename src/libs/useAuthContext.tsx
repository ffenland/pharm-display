import { useContext } from "react";
import { AuthStateContext } from "../context/AuthContext";

export const useAuthContext = () => {
  const authState = useContext(AuthStateContext);
  if (!authState) throw new Error("AuthProvider not found");
  return authState;
};

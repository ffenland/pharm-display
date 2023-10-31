import { createContext, useContext, useEffect, useState } from "react";
import type { UserCredential } from "firebase/auth";
import {
  logout,
  onUserStateChanged,
  googleLogin,
  AdminUser,
} from "../firebase/firebase";

interface AuthState {
  isLoading: boolean;
  user: AdminUser | null;
  isError: boolean;
}
interface AuthContextValue {
  authState: AuthState;
  login: {
    googleLogin: () => Promise<UserCredential | null>;
  };
  logout: () => Promise<void>;
}
export const AuthStateContext = createContext<AuthContextValue | undefined>(
  undefined
);

export const AuthContextProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [authState, setAuthState] = useState<AuthState>({
    isLoading: true,
    user: null,
    isError: false,
  });
  const onChange = (user: User | null) => {
    if (user) {
      setAuthState({ isLoading: false, user, isError: false });
    } else {
      setAuthState({ isLoading: false, user: null, isError: false });
    }
  };
  const setError = (error: Error) => {
    console.log(error);
    setAuthState({ isLoading: false, user: null, isError: true });
  };

  useEffect(() => {
    const unsubscribe = onUserStateChanged(onChange, setError);
    return () => unsubscribe();
  }, []);

  return (
    <AuthStateContext.Provider
      value={{
        authState,
        login: {
          googleLogin,
        },
        logout,
      }}
    >
      {children}
    </AuthStateContext.Provider>
  );
};

import { createContext, useEffect, useState } from "react";
import type { UserCredential } from "firebase/auth";
import { logout, onUserStateChanged, googleLogin } from "../firebase/firebase";
import { IUserWithToken } from "../types/types";

interface AuthState {
  isLoading: boolean;
  user: IUserWithToken | null;
  isError: boolean;
}
interface AuthContextValue {
  authState: AuthState;
  login: {
    googleLogin: () => Promise<UserCredential | undefined>;
  };
  logout: () => Promise<void>;
}

// context가 login, logout 메소드를 갖고 있어야, 상태변화를 바로 알고 authState값을 변경한다. 정말?
export const AuthStateContext = createContext<AuthContextValue>({
  authState: { isLoading: true, user: null, isError: false },
  login: { googleLogin },
  logout,
});

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
  const onChange = (user: IUserWithToken | null) => {
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

"use client";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState, useContext, createContext, useMemo } from "react";

type authDataType = {
  isLogin: boolean;
  token?: string;
  isLoading: boolean;
  login: (token: string) => void;
  logout: () => void;
};
const AuthCTX = createContext<authDataType>({
  isLogin: false,
  isLoading: true,
  login: () => {},
  logout: () => {},
});

export const useAuth = () => useContext(AuthCTX);

export const AuthProvider = ({ children }: React.PropsWithChildren) => {
  const [token, setToken] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isLogin, setIsLogin] = useState<boolean>(false);
  const router = useRouter();
  const path = usePathname();
  const login = (token: string) => {
    localStorage.setItem("token", token);
    setToken(token);
  };
  const logOut = () => {
    localStorage.clear();
    router.push("/login");
  };
  useEffect(() => {
    //console.log(path != "/register");

    if (path === "/login" || path === "/register") {
      return;
    }
    const token_ = localStorage.getItem("token");
    if (!token_) {
      setIsLoading(false);
      router.push("/login");
    } else {
      setToken(token_);
      setIsLogin(true);
    }

    return () => {};
  });
  const value = useMemo<authDataType>(
    () => ({
      isLogin,
      token,
      isLoading,
      login,
      logout: logOut,
    }),
    [token]
  );

  return <AuthCTX.Provider value={value}>{children}</AuthCTX.Provider>;
};

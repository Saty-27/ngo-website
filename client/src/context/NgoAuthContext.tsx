import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface NgoUser {
  id: number;
  name: string;
  email: string;
  role: string;
}

interface NgoInfo {
  id: number;
  name: string;
  logo: string | null;
  status: string;
}

interface NgoAuthContextType {
  ngoUser: NgoUser | null;
  ngo: NgoInfo | null;
  token: string | null;
  login: (token: string, user: NgoUser, ngo: NgoInfo) => void;
  logout: () => void;
  isAuthenticated: boolean;
}

const NgoAuthContext = createContext<NgoAuthContextType | null>(null);

export function NgoAuthProvider({ children }: { children: ReactNode }) {
  const [ngoUser, setNgoUser] = useState<NgoUser | null>(null);
  const [ngo, setNgo] = useState<NgoInfo | null>(null);
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    const storedToken = localStorage.getItem('ngo_token');
    const storedUser = localStorage.getItem('ngo_user');
    const storedNgo = localStorage.getItem('ngo_info');
    if (storedToken && storedUser && storedNgo) {
      setToken(storedToken);
      setNgoUser(JSON.parse(storedUser));
      setNgo(JSON.parse(storedNgo));
    }
  }, []);

  const login = (token: string, user: NgoUser, ngo: NgoInfo) => {
    localStorage.setItem('ngo_token', token);
    localStorage.setItem('ngo_user', JSON.stringify(user));
    localStorage.setItem('ngo_info', JSON.stringify(ngo));
    setToken(token);
    setNgoUser(user);
    setNgo(ngo);
  };

  const logout = () => {
    localStorage.removeItem('ngo_token');
    localStorage.removeItem('ngo_user');
    localStorage.removeItem('ngo_info');
    setToken(null);
    setNgoUser(null);
    setNgo(null);
  };

  return (
    <NgoAuthContext.Provider value={{
      ngoUser, ngo, token,
      login, logout,
      isAuthenticated: !!token && !!ngoUser,
    }}>
      {children}
    </NgoAuthContext.Provider>
  );
}

export function useNgoAuth() {
  const ctx = useContext(NgoAuthContext);
  if (!ctx) throw new Error('useNgoAuth must be used within NgoAuthProvider');
  return ctx;
}

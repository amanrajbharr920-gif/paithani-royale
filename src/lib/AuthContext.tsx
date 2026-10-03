import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from 'react';
import { api, type BackendUser } from './api';

interface AuthContextValue {
  user: BackendUser | null;
  token: string | null;
  /** Returns null on success, error string on failure. */
  login: (email: string, password: string) => Promise<string | null>;
  /** Registers then auto-logs in. Returns null on success, error string on failure. */
  register: (email: string, password: string, name?: string) => Promise<string | null>;
  logout: () => void;
  isAdmin: boolean;
  isLoggedIn: boolean;
  /** True when GET /_health returns { ok: true } */
  backendOnline: boolean;
  /** Re-check backend health */
  recheckHealth: () => void;
}

const AuthContext = createContext<AuthContextValue>({
  user: null,
  token: null,
  login: async () => 'AuthProvider not mounted',
  register: async () => 'AuthProvider not mounted',
  logout: () => {},
  isAdmin: false,
  isLoggedIn: false,
  backendOnline: false,
  recheckHealth: () => {},
});

const TOKEN_KEY = 'paithani_token';
const USER_KEY = 'paithani_user';

function loadStoredUser(): BackendUser | null {
  try {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? (JSON.parse(raw) as BackendUser) : null;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem(TOKEN_KEY));
  const [user, setUser] = useState<BackendUser | null>(loadStoredUser);
  const [backendOnline, setBackendOnline] = useState(false);

  const checkHealth = useCallback(() => {
    api.health().then(({ data }) => setBackendOnline(!!data?.ok));
  }, []);

  useEffect(() => {
    checkHealth();
    // Re-check every 30 seconds so the indicator stays current
    const t = setInterval(checkHealth, 30_000);
    return () => clearInterval(t);
  }, [checkHealth]);

  function persist(t: string, u: BackendUser) {
    localStorage.setItem(TOKEN_KEY, t);
    localStorage.setItem(USER_KEY, JSON.stringify(u));
    setToken(t);
    setUser(u);
  }

  const login = useCallback(async (email: string, password: string): Promise<string | null> => {
    const { data, error } = await api.auth.login(email, password);
    if (error) return error;
    persist(data!.token, data!.user);
    setBackendOnline(true);
    return null;
  }, []);

  const register = useCallback(
    async (email: string, password: string, name?: string): Promise<string | null> => {
      const { error } = await api.auth.register(email, password, name);
      if (error) return error;
      return login(email, password);
    },
    [login],
  );

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    setToken(null);
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        login,
        register,
        logout,
        isAdmin: user?.role === 'ADMIN',
        isLoggedIn: !!token,
        backendOnline,
        recheckHealth: checkHealth,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}

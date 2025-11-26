import React, { createContext, useContext, useEffect, useState } from 'react';
import { getToken, saveToken, deleteToken } from './storage';
import { auth as authApi } from './auth';

interface AuthContextType {
  session: string | null;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  session: null,
  isLoading: true,
  signIn: async () => {},
  signOut: async () => {},
});

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadStorageData() {
      try {
        const token = await getToken();
        if (token) {
          setSession(token);
        }
      } catch (e) {
        console.error('Failed to load token', e);
      } finally {
        setIsLoading(false);
      }
    }

    loadStorageData();
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      const data = await authApi.signIn(email, password);
      // Assuming the token is in data.token or data.session.token based on previous analysis
      const token = data.token || data.session?.token;
      if (token) {
        setSession(token);
        await saveToken(token);
      } else {
          throw new Error("No token received");
      }
    } catch (error) {
      throw error;
    }
  };

  const signOut = async () => {
    setSession(null);
    await deleteToken();
  };

  return (
    <AuthContext.Provider
      value={{
        session,
        isLoading,
        signIn,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

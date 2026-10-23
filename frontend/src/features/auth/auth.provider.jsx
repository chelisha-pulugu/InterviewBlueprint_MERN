import { useEffect, useState } from "react";
import { AuthContext } from "./auth.context.js";
import { getMe } from "./services/auth.api.js";

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    const restoreSession = async () => {
      try {
        const data = await getMe();
        if (active) setUser(data?.user ?? null);
      } catch (error) {
        if (active) console.error("Could not restore the login session:", error);
      } finally {
        if (active) setLoading(false);
      }
    };

    restoreSession();
    return () => {
      active = false;
    };
  }, []);

  return (
    <AuthContext.Provider value={{ user, setUser, loading, setLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

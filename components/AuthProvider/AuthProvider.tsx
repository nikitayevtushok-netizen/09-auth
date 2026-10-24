"use client";

import { useEffect } from "react";
import { checkSession, getMe } from "@/lib/api/clientApi";
import { useAuthStore } from "@/lib/store/authStore";

type Props = {
  children: React.ReactNode;
};

export default function AuthProvider({ children }: Props) {
  const setUser = useAuthStore((state) => state.setUser);
  const clearIsAuthenticated = useAuthStore(
    (state) => state.clearIsAuthenticated,
  );

  useEffect(() => {
    let isMounted = true;

    const fetchUser = async () => {
      try {
        const sessionIsValid = await checkSession();

        if (!sessionIsValid) {
          if (isMounted) {
            clearIsAuthenticated();
          }
          return;
        }

        const user = await getMe();
        if (isMounted) {
          setUser(user);
        }
      } catch (error) {
        console.error("Failed to restore the user session:", error);
        if (isMounted) {
          clearIsAuthenticated();
        }
      }
    };

    fetchUser();

    return () => {
      isMounted = false;
    };
  }, [setUser, clearIsAuthenticated]);

  return children;
}

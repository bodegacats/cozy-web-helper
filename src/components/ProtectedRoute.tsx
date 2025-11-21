import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    // Set a timeout for loading
    const loadingTimeout = setTimeout(() => {
      if (mounted && loading) {
        setError('Authentication check timed out');
        setLoading(false);
      }
    }, 10000); // 10 second timeout

    // Check current session
    supabase.auth.getSession()
      .then(({ data: { session }, error: sessionError }) => {
        if (!mounted) return;

        if (sessionError) {
          console.error('Session error:', sessionError);
          setError('Failed to check authentication');
          setUser(null);
        } else {
          setUser(session?.user ?? null);
        }
        setLoading(false);
        clearTimeout(loadingTimeout);
      })
      .catch((err) => {
        if (!mounted) return;
        console.error('Unexpected auth error:', err);
        setError('An unexpected error occurred');
        setUser(null);
        setLoading(false);
        clearTimeout(loadingTimeout);
      });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!mounted) return;
      setUser(session?.user ?? null);
      setError(null);
      setLoading(false);
    });

    return () => {
      mounted = false;
      clearTimeout(loadingTimeout);
      subscription.unsubscribe();
    };
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center flex-col gap-4">
        <div className="text-lg text-red-500">{error}</div>
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-primary text-primary-foreground rounded-md"
        >
          Retry
        </button>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/portal" replace />;
  }

  return <>{children}</>;
};

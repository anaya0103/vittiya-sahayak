import { useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { AuthForm } from "@/components/AuthForm";
import { Button } from "@/components/ui/button";

type LocationState = { from?: string };

const Login = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as LocationState | null)?.from ?? "/dashboard";

  useEffect(() => {
    if (!loading && user) {
      navigate(from, { replace: true });
    }
  }, [user, loading, navigate, from]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background font-body text-muted-foreground">
        Loading…
      </div>
    );
  }

  if (user) return null;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="border-b border-border bg-background/80 backdrop-blur-md">
        <div className="container mx-auto flex items-center justify-between py-3 px-4">
          <Link to="/" className="flex items-center gap-2">
            <span className="text-2xl">🪙</span>
            <span className="font-display text-xl font-bold text-foreground">
              Vittiya <span className="text-gradient">Sahayak</span>
            </span>
          </Link>
          <Button variant="ghost" asChild className="font-body text-sm">
            <Link to="/">← Home</Link>
          </Button>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md rounded-2xl bg-card border-2 border-border p-6 sm:p-8 shadow-lg">
          <AuthForm onAuthenticated={() => navigate(from, { replace: true })} />
        </div>
      </main>
    </div>
  );
};

export default Login;

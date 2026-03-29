import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";

type AuthFormProps = {
  /** Called after a successful sign-in, or sign-up when the session is active immediately */
  onAuthenticated?: () => void;
};

export function AuthForm({ onAuthenticated }: AuthFormProps) {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const { signIn, signUp, signInWithGoogle, error, loading: authLoading } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (isSignUp) {
        const { error: err } = await signUp(email, password, name);
        if (err) {
          toast.error(err);
          return;
        }
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          toast.success("Account created!");
          setEmail("");
          setPassword("");
          setName("");
          onAuthenticated?.();
        } else {
          toast.success("Check your email to confirm your account, then log in.");
          setPassword("");
        }
      } else {
        const { user, error: err } = await signIn(email, password);
        if (err) {
          toast.error(err);
          return;
        }
        if (!user) {
          toast.error("Could not sign in.");
          return;
        }
        toast.success("Welcome back!");
        setEmail("");
        setPassword("");
        setName("");
        onAuthenticated?.();
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleGoogle = async () => {
    setSubmitting(true);
    try {
      const { error: err } = await signInWithGoogle();
      if (err) {
        toast.error(err);
      }
    } finally {
      setSubmitting(false);
    }
  };

  const disabled = submitting || authLoading;

  return (
    <form onSubmit={handleSubmit} className="space-y-4 pt-2">
      {error && (
        <p className="text-sm text-destructive font-body text-center" role="alert">
          {error}
        </p>
      )}
      <h2 className="font-display text-2xl text-center text-foreground">
        {isSignUp ? "Create Account 🎉" : "Welcome Back 👋"}
      </h2>
      {isSignUp && (
        <div className="space-y-2">
          <Label htmlFor="name" className="font-body font-semibold">Full Name</Label>
          <Input id="name" placeholder="Your name" value={name} onChange={(e) => setName(e.target.value)} required className="rounded-xl" />
        </div>
      )}
      <div className="space-y-2">
        <Label htmlFor="email" className="font-body font-semibold">Email</Label>
        <Input id="email" type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required className="rounded-xl" />
      </div>
      <div className="space-y-2">
        <Label htmlFor="password" className="font-body font-semibold">Password</Label>
        <Input id="password" type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} className="rounded-xl" />
      </div>

      <Button type="submit" className="w-full btn-bounce text-base font-display rounded-xl" disabled={disabled}>
        {submitting ? "Please wait…" : isSignUp ? "Sign Up 🚀" : "Log In ✨"}
      </Button>

      <div className="relative py-2">
        <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-border" /></div>
        <div className="relative flex justify-center text-xs"><span className="bg-card px-2 text-muted-foreground font-body">or continue with</span></div>
      </div>

      <Button type="button" variant="outline" className="w-full btn-bounce rounded-xl font-body" disabled={disabled} onClick={handleGoogle}>
        <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" aria-hidden><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
        Google
      </Button>

      <p className="text-center text-sm font-body text-muted-foreground">
        {isSignUp ? "Already have an account?" : "Don't have an account?"}{" "}
        <button type="button" className="text-primary font-semibold hover:underline" onClick={() => setIsSignUp(!isSignUp)}>
          {isSignUp ? "Log in" : "Sign up"}
        </button>
      </p>
    </form>
  );
}

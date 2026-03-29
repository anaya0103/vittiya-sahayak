import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

const Navbar = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  const goLogin = () => {
    navigate("/login");
    setMobileOpen(false);
  };

  return (
    <nav className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
      <div className="container mx-auto flex items-center justify-between py-3 px-4">
        <a href="/" className="flex items-center gap-2">
          <span className="text-2xl">🪙</span>
          <span className="font-display text-xl font-bold text-foreground">
            Vittiya <span className="text-gradient">Sahayak</span>
          </span>
        </a>

        <div className="hidden md:flex items-center gap-6 font-body text-sm font-semibold text-muted-foreground">
          <a href="#features" className="hover:text-primary transition-colors">Features</a>
          <a href="#use-cases" className="hover:text-primary transition-colors">Use Cases</a>
          <a href="#vault" className="hover:text-primary transition-colors">Vault</a>
          <a href="#how-it-works" className="hover:text-primary transition-colors">How It Works</a>
        </div>

        <div className="hidden md:flex items-center gap-3">
          {user ? (
            <Button className="btn-bounce" onClick={() => navigate("/dashboard")}>
              Dashboard 🏠
            </Button>
          ) : (
            <>
              <Button variant="outline" className="btn-bounce" onClick={goLogin}>
                Log In
              </Button>
              <Button className="btn-bounce" onClick={goLogin}>
                Sign Up Free
              </Button>
            </>
          )}
        </div>

        {/* Mobile: always show auth — previously these were only inside the menu, so they looked "missing" */}
        <div className="flex md:hidden items-center gap-2 shrink-0">
          {user ? (
            <Button size="sm" className="btn-bounce px-3 text-xs sm:text-sm" onClick={() => navigate("/dashboard")}>
              Dashboard
            </Button>
          ) : (
            <>
              <Button variant="outline" size="sm" className="btn-bounce px-2.5 text-xs sm:text-sm" onClick={goLogin}>
                Log In
              </Button>
              <Button size="sm" className="btn-bounce px-2.5 text-xs sm:text-sm" onClick={goLogin}>
                Sign Up
              </Button>
            </>
          )}
          <button type="button" className="text-foreground p-1 -mr-1" aria-label="Open menu" onClick={() => setMobileOpen(!mobileOpen)}>
            {mobileOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="md:hidden border-t border-border bg-background px-4 pb-4 space-y-3">
          <a href="#features" className="block py-2 font-body font-semibold text-muted-foreground hover:text-primary">Features</a>
          <a href="#use-cases" className="block py-2 font-body font-semibold text-muted-foreground hover:text-primary">Use Cases</a>
          <a href="#vault" className="block py-2 font-body font-semibold text-muted-foreground hover:text-primary">Vault</a>
          <a href="#how-it-works" className="block py-2 font-body font-semibold text-muted-foreground hover:text-primary">How It Works</a>
        </div>
      )}
    </nav>
  );
};

export default Navbar;

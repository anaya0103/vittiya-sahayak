import { useAuth } from "@/contexts/AuthContext";
import { getDisplayName } from "@/lib/supabase";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import type { LucideIcon } from "lucide-react";
import { LogOut, TrendingUp, ShieldCheck, FileText, Bell, ArrowRight, CreditCard, PiggyBank, BarChart3, BookOpen } from "lucide-react";
import BankingVaultSection from "@/components/BankingVaultSection";
import ChatbotWidget, { type ChatbotFeatureMode } from "@/components/ChatbotWidget";

const quickActions: {
  icon: LucideIcon;
  emoji: string;
  label: string;
  desc: string;
  color: string;
  link?: string;
  mode?: ChatbotFeatureMode;
}[] = [
  { icon: ShieldCheck, emoji: "🛡️", label: "Scam Detector", desc: "Check if a message or call is a scam", color: "bg-destructive/10 border-destructive/30", mode: "scam" },
  { icon: FileText, emoji: "📄", label: "Document Analyzer", desc: "Upload & simplify financial docs", color: "bg-primary/10 border-primary/30", mode: "document" },
  { icon: TrendingUp, emoji: "📈", label: "Investment Advisor", desc: "Get personalized suggestions", color: "bg-success/10 border-success/30", mode: "investment" },
  { icon: BookOpen, emoji: "📒", label: "Financial Manager", desc: "Track income, expenses & taxes like a CA", color: "bg-accent/10 border-accent/30", link: "/financial-manager" },
];

const recentActivity = [
  { icon: "🔍", text: "Scam check: \"KYC update\" SMS flagged as fraud", time: "2 min ago" },
  { icon: "📄", text: "Analyzed: Home loan agreement (SBI)", time: "1 hr ago" },
  { icon: "💡", text: "Tip: Switch to FD for 7.5% returns", time: "3 hrs ago" },
  { icon: "🔔", text: "EMI reminder: ₹12,500 due on Apr 5", time: "Today" },
];

const stats = [
  { icon: PiggyBank, label: "Savings Goal", value: "₹1,20,000", sub: "68% reached", emoji: "🐷" },
  { icon: CreditCard, label: "This Month Spent", value: "₹34,500", sub: "Under budget ✅", emoji: "💳" },
  { icon: BarChart3, label: "Investments", value: "₹2,45,000", sub: "+12.3% returns", emoji: "📊" },
  { icon: Bell, label: "Alerts", value: "3 New", sub: "1 urgent", emoji: "🔔" },
];

const Dashboard = () => {
  const { user, profile, loading, signOut } = useAuth();
  const navigate = useNavigate();
  const [chatOpen, setChatOpen] = useState(false);
  const [chatFeatureMode, setChatFeatureMode] = useState<ChatbotFeatureMode>("general");

  useEffect(() => {
    if (!loading && !user) {
      navigate("/login", { replace: true, state: { from: "/dashboard" } });
    }
  }, [user, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background font-body text-muted-foreground">
        Loading…
      </div>
    );
  }

  if (!user) return null;

  const displayName = getDisplayName(user, profile);
  const firstName = displayName.split(/\s+/)[0] ?? displayName;

  return (
    <div className="min-h-screen bg-background">
      {/* Top bar */}
      <nav className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="container mx-auto flex items-center justify-between py-3 px-4">
          <a href="/" className="flex items-center gap-2">
            <span className="text-2xl">🪙</span>
            <span className="font-display text-xl font-bold text-foreground">
              Vittiya <span className="text-gradient">Sahayak</span>
            </span>
          </a>
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 bg-card border-2 border-border rounded-full px-4 py-1.5">
              <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-display font-bold text-sm">
                {firstName[0].toUpperCase()}
              </div>
              <span className="font-body font-semibold text-sm text-foreground">{firstName}</span>
            </div>
            <Button variant="outline" size="sm" className="btn-bounce rounded-full" onClick={async () => { await signOut(); navigate("/login"); }}>
              <LogOut size={16} className="mr-1" /> Logout
            </Button>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-8 space-y-10">
        {/* Greeting */}
        <div className="space-y-2">
          <h1 className="font-display text-3xl md:text-4xl font-extrabold text-foreground">
            Namaste, <span className="text-gradient">{firstName}</span>! 🙏
          </h1>
          <p className="font-body text-muted-foreground text-lg">Here's your financial overview for today.</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((s) => (
            <div key={s.label} className="card-cartoon p-4 flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <span className="text-2xl">{s.emoji}</span>
                <s.icon size={18} className="text-muted-foreground" />
              </div>
              <p className="font-display text-xl md:text-2xl font-bold text-foreground">{s.value}</p>
              <p className="font-body text-xs text-muted-foreground">{s.label}</p>
              <p className="font-body text-xs font-semibold text-primary">{s.sub}</p>
            </div>
          ))}
        </div>

        {/* Quick actions */}
        <div>
          <h2 className="font-display text-xl font-bold text-foreground mb-4">Quick Actions ⚡</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {quickActions.map((a) => (
              <button
                key={a.label}
                type="button"
                className={`card-cartoon p-5 text-left group ${a.color} border-2 cursor-pointer`}
                onClick={() => {
                  if (a.link) navigate(a.link);
                  else if (a.mode) {
                    setChatFeatureMode(a.mode);
                    setChatOpen(true);
                  }
                }}
              >
                <span className="text-3xl block mb-2">{a.emoji}</span>
                <h3 className="font-display font-bold text-foreground mb-1">{a.label}</h3>
                <p className="font-body text-xs text-muted-foreground mb-3">{a.desc}</p>
                <span className="inline-flex items-center gap-1 text-primary font-body text-xs font-bold group-hover:gap-2 transition-all">
                  Open <ArrowRight size={12} />
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Recent activity */}
        <div>
          <h2 className="font-display text-xl font-bold text-foreground mb-4">Recent Activity 📋</h2>
          <div className="card-cartoon p-1 divide-y divide-border">
            {recentActivity.map((item, i) => (
              <div key={i} className="flex items-center gap-3 px-4 py-3">
                <span className="text-xl">{item.icon}</span>
                <div className="flex-1 min-w-0">
                  <p className="font-body text-sm text-foreground truncate">{item.text}</p>
                </div>
                <span className="font-body text-xs text-muted-foreground whitespace-nowrap">{item.time}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Vault section reused */}
        <BankingVaultSection />
      </div>

      <ChatbotWidget
        open={chatOpen}
        onOpenChange={(v) => {
          setChatOpen(v);
          if (!v) setChatFeatureMode("general");
        }}
        featureMode={chatFeatureMode}
        onFeatureModeChange={setChatFeatureMode}
      />
    </div>
  );
};

export default Dashboard;

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";
import { Plus, Eye, EyeOff, Trash2, CreditCard, Building2, Smartphone, Copy, Lock } from "lucide-react";

interface Credential {
  id: string;
  type: "bank" | "upi" | "card";
  label: string;
  details: Record<string, string>;
}

const typeConfig = {
  bank: { icon: Building2, emoji: "🏦", label: "Bank Account", color: "bg-primary/10 border-primary/30" },
  upi: { icon: Smartphone, emoji: "📱", label: "UPI ID", color: "bg-success/10 border-success/30" },
  card: { icon: CreditCard, emoji: "💳", label: "Card", color: "bg-accent/10 border-accent/30" },
};

const maskValue = (val: string) => {
  if (val.length <= 4) return "••••";
  return "••••••" + val.slice(-4);
};

const CredentialCard = ({ cred, onDelete }: { cred: Credential; onDelete: () => void }) => {
  const [revealed, setRevealed] = useState(false);
  const config = typeConfig[cred.type];
  const Icon = config.icon;

  return (
    <div className={`card-cartoon p-5 ${config.color} border-2`}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-2xl">{config.emoji}</span>
          <div>
            <h4 className="font-display font-bold text-foreground text-sm">{cred.label}</h4>
            <span className="font-body text-xs text-muted-foreground">{config.label}</span>
          </div>
        </div>
        <div className="flex gap-1">
          <button onClick={() => setRevealed(!revealed)} className="p-2 rounded-lg hover:bg-foreground/5 text-muted-foreground hover:text-foreground transition-colors">
            {revealed ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
          <button onClick={onDelete} className="p-2 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors">
            <Trash2 size={16} />
          </button>
        </div>
      </div>
      <div className="space-y-1.5">
        {Object.entries(cred.details).map(([key, val]) => (
          <div key={key} className="flex items-center justify-between text-sm">
            <span className="font-body text-muted-foreground capitalize">{key.replace(/_/g, " ")}</span>
            <div className="flex items-center gap-1">
              <span className="font-body font-semibold text-foreground font-mono text-xs">
                {revealed ? val : maskValue(val)}
              </span>
              {revealed && (
                <button
                  onClick={() => { navigator.clipboard.writeText(val); toast.success("Copied!"); }}
                  className="p-1 rounded hover:bg-foreground/5 text-muted-foreground"
                >
                  <Copy size={12} />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const AddCredentialForm = ({ onAdd, onClose }: { onAdd: (c: Credential) => void; onClose: () => void }) => {
  const [type, setType] = useState<"bank" | "upi" | "card">("bank");
  const [label, setLabel] = useState("");
  const [fields, setFields] = useState<Record<string, string>>({});

  const fieldConfigs = {
    bank: ["account_number", "ifsc_code", "branch_name", "account_holder"],
    upi: ["upi_id", "linked_bank"],
    card: ["card_number", "expiry", "card_holder", "bank_name"],
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!label.trim()) return;
    onAdd({ id: Date.now().toString(), type, label, details: fields });
    toast.success("Credential saved locally! 🔒");
    onClose();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="flex gap-2">
        {(Object.keys(typeConfig) as Array<keyof typeof typeConfig>).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => { setType(t); setFields({}); }}
            className={`flex-1 py-2 px-3 rounded-xl font-display text-sm font-bold border-2 transition-all btn-bounce ${
              type === t ? "bg-primary text-primary-foreground border-primary" : "bg-card border-border text-muted-foreground hover:border-primary/50"
            }`}
          >
            {typeConfig[t].emoji} {typeConfig[t].label}
          </button>
        ))}
      </div>

      <div className="space-y-2">
        <Label className="font-body font-semibold">Label / Nickname</Label>
        <Input placeholder="e.g. SBI Savings, Paytm UPI" value={label} onChange={(e) => setLabel(e.target.value)} required className="rounded-xl" />
      </div>

      {fieldConfigs[type].map((field) => (
        <div key={field} className="space-y-2">
          <Label className="font-body font-semibold capitalize">{field.replace(/_/g, " ")}</Label>
          <Input
            placeholder={field.replace(/_/g, " ")}
            value={fields[field] || ""}
            onChange={(e) => setFields({ ...fields, [field]: e.target.value })}
            required
            className="rounded-xl"
            type={field.includes("number") ? "password" : "text"}
          />
        </div>
      ))}

      <Button type="submit" className="w-full btn-bounce font-display rounded-xl">
        Save Credential 🔐
      </Button>
    </form>
  );
};

const BankingVaultSection = () => {
  const [credentials, setCredentials] = useState<Credential[]>([
    {
      id: "demo1",
      type: "bank",
      label: "SBI Savings Account",
      details: { account_number: "12345678901234", ifsc_code: "SBIN0001234", branch_name: "MG Road Branch", account_holder: "Ramesh Kumar" },
    },
    {
      id: "demo2",
      type: "upi",
      label: "Google Pay UPI",
      details: { upi_id: "ramesh@okicici", linked_bank: "ICICI Bank" },
    },
  ]);
  const [addOpen, setAddOpen] = useState(false);

  return (
    <section id="vault" className="py-20">
      <div className="container mx-auto px-4">
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 bg-primary/10 px-4 py-1.5 rounded-full mb-4">
            <Lock size={16} className="text-primary" />
            <span className="font-display text-sm font-bold text-primary">Secure Vault</span>
          </div>
          <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground">
            Banking <span className="text-gradient">Credentials Manager</span>
          </h2>
          <p className="font-body text-muted-foreground mt-3 max-w-xl mx-auto">
            Store and manage all your bank accounts, UPI IDs & card details in one secure place. Tap to reveal, copy, or remove.
          </p>
        </div>

        <div className="max-w-3xl mx-auto">
          <div className="grid sm:grid-cols-2 gap-4 mb-6">
            {credentials.map((cred) => (
              <CredentialCard
                key={cred.id}
                cred={cred}
                onDelete={() => {
                  setCredentials(credentials.filter((c) => c.id !== cred.id));
                  toast.success("Credential removed");
                }}
              />
            ))}
          </div>

          <Dialog open={addOpen} onOpenChange={setAddOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="w-full btn-bounce font-display rounded-xl border-dashed border-2 py-6 text-muted-foreground hover:text-primary hover:border-primary">
                <Plus size={20} className="mr-2" /> Add New Credential
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-lg rounded-2xl bg-card border-2 border-border max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="font-display text-xl text-center">Add Credential 🔐</DialogTitle>
              </DialogHeader>
              <AddCredentialForm onAdd={(c) => setCredentials([...credentials, c])} onClose={() => setAddOpen(false)} />
            </DialogContent>
          </Dialog>

          <p className="text-center font-body text-xs text-muted-foreground mt-4">
            🔒 Currently stored locally. Connect backend for encrypted cloud storage.
          </p>
        </div>
      </div>
    </section>
  );
};

export default BankingVaultSection;

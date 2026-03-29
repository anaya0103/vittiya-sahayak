import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  LogOut, Plus, Trash2, IndianRupee, TrendingUp, TrendingDown, Receipt,
  PiggyBank, Calculator, ArrowLeft, Download, Filter,
} from "lucide-react";
import ChatbotWidget from "@/components/ChatbotWidget";

type TransactionType = "income" | "expense";
type Category =
  | "Salary" | "Freelance" | "Investment Returns" | "Rent Received" | "Other Income"
  | "Rent" | "Groceries" | "EMI" | "Insurance" | "Medical" | "Education"
  | "Shopping" | "Travel" | "Bills" | "Tax" | "Other Expense";

const incomeCategories: Category[] = ["Salary", "Freelance", "Investment Returns", "Rent Received", "Other Income"];
const expenseCategories: Category[] = ["Rent", "Groceries", "EMI", "Insurance", "Medical", "Education", "Shopping", "Travel", "Bills", "Tax", "Other Expense"];

const categoryEmojis: Record<string, string> = {
  Salary: "💼", Freelance: "💻", "Investment Returns": "📈", "Rent Received": "🏠", "Other Income": "💰",
  Rent: "🏡", Groceries: "🛒", EMI: "🏦", Insurance: "🛡️", Medical: "🏥", Education: "📚",
  Shopping: "🛍️", Travel: "✈️", Bills: "📱", Tax: "🧾", "Other Expense": "📋",
};

interface Transaction {
  id: number;
  type: TransactionType;
  category: Category;
  amount: number;
  note: string;
  date: string;
}

const FinancialManager = () => {
  const { user, loading, signOut } = useAuth();
  const navigate = useNavigate();

  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    const saved = localStorage.getItem("vs_transactions");
    return saved ? JSON.parse(saved) : [
      { id: 1, type: "income", category: "Salary", amount: 75000, note: "Monthly salary", date: "2026-03-01" },
      { id: 2, type: "expense", category: "Rent", amount: 15000, note: "House rent", date: "2026-03-02" },
      { id: 3, type: "expense", category: "Groceries", amount: 5500, note: "Monthly groceries", date: "2026-03-05" },
      { id: 4, type: "expense", category: "EMI", amount: 12500, note: "Home loan EMI", date: "2026-03-05" },
      { id: 5, type: "income", category: "Freelance", amount: 20000, note: "Web project", date: "2026-03-10" },
      { id: 6, type: "expense", category: "Bills", amount: 3200, note: "Electricity + WiFi", date: "2026-03-12" },
      { id: 7, type: "expense", category: "Insurance", amount: 4500, note: "Term insurance", date: "2026-03-15" },
    ];
  });

  const [dialogOpen, setDialogOpen] = useState(false);
  const [filterType, setFilterType] = useState<"all" | TransactionType>("all");
  const [newTx, setNewTx] = useState({ type: "income" as TransactionType, category: "" as string, amount: "", note: "", date: new Date().toISOString().split("T")[0] });

  useEffect(() => {
    if (!loading && !user) {
      navigate("/login", { replace: true, state: { from: "/financial-manager" } });
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    localStorage.setItem("vs_transactions", JSON.stringify(transactions));
  }, [transactions]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background font-body text-muted-foreground">
        Loading…
      </div>
    );
  }

  if (!user) return null;

  const totalIncome = transactions.filter((t) => t.type === "income").reduce((s, t) => s + t.amount, 0);
  const totalExpense = transactions.filter((t) => t.type === "expense").reduce((s, t) => s + t.amount, 0);
  const balance = totalIncome - totalExpense;
  const savingsRate = totalIncome > 0 ? ((balance / totalIncome) * 100).toFixed(1) : "0";

  const filtered = filterType === "all" ? transactions : transactions.filter((t) => t.type === filterType);
  const sorted = [...filtered].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const addTransaction = () => {
    if (!newTx.category || !newTx.amount) return;
    setTransactions((prev) => [
      ...prev,
      { id: Date.now(), type: newTx.type, category: newTx.category as Category, amount: Number(newTx.amount), note: newTx.note, date: newTx.date },
    ]);
    setNewTx({ type: "income", category: "", amount: "", note: "", date: new Date().toISOString().split("T")[0] });
    setDialogOpen(false);
  };

  const deleteTransaction = (id: number) => setTransactions((prev) => prev.filter((t) => t.id !== id));

  const fmt = (n: number) => "₹" + n.toLocaleString("en-IN");

  // Category breakdown
  const expenseByCategory = transactions
    .filter((t) => t.type === "expense")
    .reduce<Record<string, number>>((acc, t) => {
      acc[t.category] = (acc[t.category] || 0) + t.amount;
      return acc;
    }, {});

  const topExpenses = Object.entries(expenseByCategory)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5);

  return (
    <div className="min-h-screen bg-background">
      {/* Nav */}
      <nav className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="container mx-auto flex items-center justify-between py-3 px-4">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" className="rounded-full" onClick={() => navigate("/dashboard")}>
              <ArrowLeft size={18} />
            </Button>
            <a href="/" className="flex items-center gap-2">
              <span className="text-2xl">🪙</span>
              <span className="font-display text-xl font-bold text-foreground">
                Vittiya <span className="text-gradient">Sahayak</span>
              </span>
            </a>
          </div>
          <Button variant="outline" size="sm" className="btn-bounce rounded-full" onClick={async () => { await signOut(); navigate("/login"); }}>
            <LogOut size={16} className="mr-1" /> Logout
          </Button>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-8 space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="font-display text-3xl font-extrabold text-foreground">
              Financial Manager 📒
            </h1>
            <p className="font-body text-muted-foreground">Track income, expenses & savings like a CA</p>
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button className="btn-bounce rounded-xl font-display gap-2">
                <Plus size={18} /> Add Transaction
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md rounded-2xl bg-card border-2 border-border">
              <DialogHeader>
                <DialogTitle className="font-display text-xl">New Transaction 📝</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-2">
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant={newTx.type === "income" ? "default" : "outline"}
                    className="flex-1 rounded-xl"
                    onClick={() => setNewTx({ ...newTx, type: "income", category: "" })}
                  >
                    <TrendingUp size={16} className="mr-1" /> Income
                  </Button>
                  <Button
                    type="button"
                    variant={newTx.type === "expense" ? "default" : "outline"}
                    className="flex-1 rounded-xl"
                    onClick={() => setNewTx({ ...newTx, type: "expense", category: "" })}
                  >
                    <TrendingDown size={16} className="mr-1" /> Expense
                  </Button>
                </div>
                <div className="space-y-2">
                  <Label className="font-body font-semibold">Category</Label>
                  <Select value={newTx.category} onValueChange={(v) => setNewTx({ ...newTx, category: v })}>
                    <SelectTrigger className="rounded-xl"><SelectValue placeholder="Select category" /></SelectTrigger>
                    <SelectContent>
                      {(newTx.type === "income" ? incomeCategories : expenseCategories).map((c) => (
                        <SelectItem key={c} value={c}>{categoryEmojis[c]} {c}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="font-body font-semibold">Amount (₹)</Label>
                  <Input type="number" placeholder="Enter amount" value={newTx.amount} onChange={(e) => setNewTx({ ...newTx, amount: e.target.value })} className="rounded-xl" />
                </div>
                <div className="space-y-2">
                  <Label className="font-body font-semibold">Note</Label>
                  <Input placeholder="What's this for?" value={newTx.note} onChange={(e) => setNewTx({ ...newTx, note: e.target.value })} className="rounded-xl" />
                </div>
                <div className="space-y-2">
                  <Label className="font-body font-semibold">Date</Label>
                  <Input type="date" value={newTx.date} onChange={(e) => setNewTx({ ...newTx, date: e.target.value })} className="rounded-xl" />
                </div>
                <Button className="w-full rounded-xl font-display" onClick={addTransaction} disabled={!newTx.category || !newTx.amount}>
                  Add {newTx.type === "income" ? "Income 💰" : "Expense 📉"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="card-cartoon p-4 border-2 border-green-300/50 bg-green-50/30">
            <div className="flex items-center justify-between mb-2">
              <span className="text-2xl">💰</span>
              <TrendingUp size={18} className="text-green-600" />
            </div>
            <p className="font-display text-xl md:text-2xl font-bold text-foreground">{fmt(totalIncome)}</p>
            <p className="font-body text-xs text-muted-foreground">Total Income</p>
          </div>
          <div className="card-cartoon p-4 border-2 border-red-300/50 bg-red-50/30">
            <div className="flex items-center justify-between mb-2">
              <span className="text-2xl">📉</span>
              <TrendingDown size={18} className="text-red-500" />
            </div>
            <p className="font-display text-xl md:text-2xl font-bold text-foreground">{fmt(totalExpense)}</p>
            <p className="font-body text-xs text-muted-foreground">Total Expenses</p>
          </div>
          <div className="card-cartoon p-4 border-2 border-primary/30 bg-primary/5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-2xl">🏦</span>
              <IndianRupee size={18} className="text-primary" />
            </div>
            <p className={`font-display text-xl md:text-2xl font-bold ${balance >= 0 ? "text-green-700" : "text-red-600"}`}>{fmt(balance)}</p>
            <p className="font-body text-xs text-muted-foreground">Net Balance</p>
          </div>
          <div className="card-cartoon p-4 border-2 border-accent/50 bg-accent/10">
            <div className="flex items-center justify-between mb-2">
              <span className="text-2xl">🐷</span>
              <PiggyBank size={18} className="text-accent-foreground" />
            </div>
            <p className="font-display text-xl md:text-2xl font-bold text-foreground">{savingsRate}%</p>
            <p className="font-body text-xs text-muted-foreground">Savings Rate</p>
          </div>
        </div>

        {/* Category Breakdown */}
        <div className="card-cartoon p-5 border-2 border-border">
          <h2 className="font-display text-lg font-bold text-foreground mb-4 flex items-center gap-2">
            <Calculator size={18} /> Expense Breakdown 📊
          </h2>
          {topExpenses.length === 0 ? (
            <p className="font-body text-sm text-muted-foreground">No expenses yet.</p>
          ) : (
            <div className="space-y-3">
              {topExpenses.map(([cat, amt]) => {
                const pct = ((amt / totalExpense) * 100).toFixed(0);
                return (
                  <div key={cat}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-body text-sm font-semibold">{categoryEmojis[cat]} {cat}</span>
                      <span className="font-body text-sm text-muted-foreground">{fmt(amt)} ({pct}%)</span>
                    </div>
                    <div className="h-2.5 bg-muted rounded-full overflow-hidden">
                      <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Transaction List */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display text-lg font-bold text-foreground flex items-center gap-2">
              <Receipt size={18} /> Transactions 📋
            </h2>
            <div className="flex gap-2">
              <Button size="sm" variant={filterType === "all" ? "default" : "outline"} className="rounded-full text-xs" onClick={() => setFilterType("all")}>
                All
              </Button>
              <Button size="sm" variant={filterType === "income" ? "default" : "outline"} className="rounded-full text-xs" onClick={() => setFilterType("income")}>
                💰 Income
              </Button>
              <Button size="sm" variant={filterType === "expense" ? "default" : "outline"} className="rounded-full text-xs" onClick={() => setFilterType("expense")}>
                📉 Expense
              </Button>
            </div>
          </div>

          <div className="card-cartoon border-2 border-border divide-y divide-border">
            {sorted.length === 0 ? (
              <div className="p-8 text-center">
                <span className="text-4xl block mb-2">📭</span>
                <p className="font-body text-muted-foreground">No transactions yet. Add one!</p>
              </div>
            ) : (
              sorted.map((tx) => (
                <div key={tx.id} className="flex items-center gap-3 px-4 py-3 hover:bg-muted/30 transition-colors">
                  <span className="text-xl">{categoryEmojis[tx.category] || "📋"}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-body text-sm font-semibold text-foreground truncate">{tx.category}</p>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-body font-bold ${tx.type === "income" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-600"}`}>
                        {tx.type === "income" ? "Income" : "Expense"}
                      </span>
                    </div>
                    {tx.note && <p className="font-body text-xs text-muted-foreground truncate">{tx.note}</p>}
                  </div>
                  <div className="text-right shrink-0">
                    <p className={`font-display text-sm font-bold ${tx.type === "income" ? "text-green-700" : "text-red-600"}`}>
                      {tx.type === "income" ? "+" : "-"}{fmt(tx.amount)}
                    </p>
                    <p className="font-body text-[10px] text-muted-foreground">{tx.date}</p>
                  </div>
                  <button onClick={() => deleteTransaction(tx.id)} className="text-muted-foreground hover:text-destructive transition-colors p-1">
                    <Trash2 size={14} />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <ChatbotWidget />
    </div>
  );
};

export default FinancialManager;

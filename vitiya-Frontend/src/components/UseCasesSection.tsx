const useCases = [
  {
    emoji: "🏪",
    persona: "Ramesh, Shop Owner",
    location: "Meerut",
    problem: "Needs capital but lacks credit score. Finds bank forms intimidating.",
    action: "AI analyzes GST/Bank PDFs via WhatsApp voice flow in Hindi.",
    result: "Loan Approved in 2 Days ✅",
    color: "bg-primary/10 border-primary/30",
  },
  {
    emoji: "👵",
    persona: "Lakshmi, Retired Teacher",
    location: "Chennai",
    problem: "Receives a 'KYC Expired' SMS with a phishing link.",
    action: "AI detects fraud pattern & warns her in Tamil voice.",
    result: "Life Savings Protected 🛡️",
    color: "bg-success/10 border-success/30",
  },
  {
    emoji: "👩‍💼",
    persona: "Priya, Domestic Worker",
    location: "Bengaluru",
    problem: "Scattered savings, no clear financial picture.",
    action: "AI aggregates accounts & explains in Kannada.",
    result: "100% Visibility & Control 📊",
    color: "bg-accent/10 border-accent/30",
  },
  {
    emoji: "👨‍💻",
    persona: "Arjun, Young Engineer",
    location: "Pune",
    problem: "Confused by 'Mutual Funds', 'Exit Load' jargon.",
    action: "AI teaches via Hinglish analogies & sets up SIP.",
    result: "Wealth Creation Started 💰",
    color: "bg-warning/10 border-warning/30",
  },
];

const UseCasesSection = () => (
  <section id="use-cases" className="py-20">
    <div className="container mx-auto px-4">
      <div className="text-center mb-14">
        <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground">
          Real People, <span className="text-gradient">Real Impact</span>
        </h2>
        <p className="font-body text-muted-foreground mt-3 max-w-xl mx-auto">
          See how Vittiya Sahayak transforms financial lives across India.
        </p>
      </div>
      <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
        {useCases.map((u) => (
          <div key={u.persona} className={`rounded-2xl border-2 p-6 ${u.color} transition-all hover:-translate-y-1 hover:shadow-lg`}>
            <div className="flex items-center gap-3 mb-3">
              <span className="text-3xl">{u.emoji}</span>
              <div>
                <h3 className="font-display font-bold text-foreground">{u.persona}</h3>
                <span className="font-body text-xs text-muted-foreground">{u.location}</span>
              </div>
            </div>
            <p className="font-body text-sm text-muted-foreground mb-2"><strong>Problem:</strong> {u.problem}</p>
            <p className="font-body text-sm text-muted-foreground mb-2"><strong>AI Action:</strong> {u.action}</p>
            <p className="font-display font-bold text-primary text-sm">{u.result}</p>
          </div>
        ))}
      </div>
    </div>
  </section>
);

export default UseCasesSection;

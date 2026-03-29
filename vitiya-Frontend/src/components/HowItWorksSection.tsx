const steps = [
  { num: "1", emoji: "💬", title: "Speak or Type", desc: "Use WhatsApp, the app, or just call. In any of 12 Indian languages." },
  { num: "2", emoji: "🤖", title: "AI Understands", desc: "GenAI processes your intent, context, and documents in real-time." },
  { num: "3", emoji: "🎯", title: "Get Action", desc: "Receive explanations, scam alerts, loan applications, or investment guidance." },
];

const HowItWorksSection = () => (
  <section id="how-it-works" className="py-20 bg-secondary/30">
    <div className="container mx-auto px-4 text-center">
      <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-14">
        How It <span className="text-gradient">Works</span>
      </h2>
      <div className="flex flex-col md:flex-row items-center justify-center gap-8">
        {steps.map((s, i) => (
          <div key={s.num} className="flex flex-col items-center max-w-xs">
            <div className="w-20 h-20 rounded-full bg-primary flex items-center justify-center text-3xl mb-4 shadow-lg animate-wiggle" style={{ animationDelay: `${i * 0.3}s` }}>
              {s.emoji}
            </div>
            <h3 className="font-display text-xl font-bold text-foreground mb-2">Step {s.num}: {s.title}</h3>
            <p className="font-body text-sm text-muted-foreground">{s.desc}</p>
            {i < steps.length - 1 && (
              <div className="hidden md:block text-3xl text-primary font-bold mt-2">→</div>
            )}
          </div>
        ))}
      </div>
    </div>
  </section>
);

export default HowItWorksSection;

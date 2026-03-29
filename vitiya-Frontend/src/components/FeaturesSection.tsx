import scamShield from "@/assets/scam-shield.png";
import multilingual from "@/assets/multilingual.png";
import dashboard from "@/assets/dashboard-icon.png";
import { FileText, Mic, TrendingUp } from "lucide-react";

const features = [
  {
    icon: <img src={multilingual} alt="Multilingual" width={80} height={80} loading="lazy" />,
    title: "Vernacular Q&A",
    desc: "Ask anything about finance in Hindi, Tamil, Bengali & 9 more languages. Get simple, jargon-free answers.",
  },
  {
    icon: <img src={scamShield} alt="Scam Shield" width={80} height={80} loading="lazy" />,
    title: "Scam Detection Shield",
    desc: "Real-time fraud detection on messages & calls. Protects elderly and vulnerable users automatically.",
  },
  {
    icon: <FileText className="w-16 h-16 text-primary" />,
    title: "Document Simplifier",
    desc: "Snap a photo of any loan or insurance document and get a plain-language explanation instantly.",
  },
  {
    icon: <img src={dashboard} alt="Dashboard" width={80} height={80} loading="lazy" />,
    title: "Unified Dashboard",
    desc: "See all your savings, loans, insurance & investments in one beautiful view via Account Aggregator.",
  },
  {
    icon: <Mic className="w-16 h-16 text-primary" />,
    title: "Voice-First Design",
    desc: "Speak naturally in your language. Our AI understands dialects and responds with voice + text.",
  },
  {
    icon: <TrendingUp className="w-16 h-16 text-primary" />,
    title: "Smart Financial Guide",
    desc: "Personalized loan recommendations, investment nudges & SIP setups tailored to your income.",
  },
];

const FeaturesSection = () => (
  <section id="features" className="py-20 bg-secondary/30">
    <div className="container mx-auto px-4">
      <div className="text-center mb-14">
        <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground">
          Powerful Features, <span className="text-gradient">Simple Experience</span>
        </h2>
        <p className="font-body text-muted-foreground mt-3 max-w-xl mx-auto">
          Everything you need to take control of your finances — no jargon, no complexity.
        </p>
      </div>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {features.map((f) => (
          <div key={f.title} className="card-cartoon p-6 flex flex-col items-center text-center gap-4">
            <div className="flex items-center justify-center h-20">{f.icon}</div>
            <h3 className="font-display text-xl font-bold text-foreground">{f.title}</h3>
            <p className="font-body text-sm text-muted-foreground">{f.desc}</p>
          </div>
        ))}
      </div>
    </div>
  </section>
);

export default FeaturesSection;

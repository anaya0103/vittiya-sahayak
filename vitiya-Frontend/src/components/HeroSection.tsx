import heroImg from "@/assets/hero-illustration.png";
import { Button } from "@/components/ui/button";

interface HeroProps {
  onGetStarted: () => void;
}

const HeroSection = ({ onGetStarted }: HeroProps) => (
  <section className="container mx-auto px-4 py-16 md:py-24 flex flex-col-reverse md:flex-row items-center gap-10">
    <div className="flex-1 space-y-6 text-center md:text-left">
      <span className="inline-block bg-primary/10 text-primary font-display text-sm font-bold px-4 py-1 rounded-full">
        🇮🇳 Made for Bharat
      </span>
      <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-extrabold leading-tight text-foreground">
        Your <span className="text-gradient">AI Financial</span> Co-pilot
      </h1>
      <p className="font-body text-lg text-muted-foreground max-w-lg mx-auto md:mx-0">
        Vittiya Sahayak speaks your language, protects you from scams, simplifies documents & guides your financial journey — all via WhatsApp, App or Voice.
      </p>
      <div className="flex flex-wrap gap-3 justify-center md:justify-start">
        <Button size="lg" className="btn-bounce font-display text-base rounded-full px-8" onClick={onGetStarted}>
          Get Started Free 🚀
        </Button>
        <Button size="lg" variant="outline" className="btn-bounce font-display text-base rounded-full px-8" asChild>
          <a href="#features">Explore Features</a>
        </Button>
      </div>
      <div className="flex gap-6 justify-center md:justify-start pt-2 font-body text-sm text-muted-foreground">
        <span>✅ 12 Languages</span>
        <span>✅ Voice First</span>
        <span>✅ Free to Start</span>
      </div>
    </div>
    <div className="flex-1 flex justify-center">
      <img src={heroImg} alt="Happy Indian users using Vittiya Sahayak on phones" width={1024} height={768} className="animate-float max-w-sm md:max-w-md lg:max-w-lg w-full drop-shadow-xl" />
    </div>
  </section>
);

export default HeroSection;

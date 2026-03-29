import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import FeaturesSection from "@/components/FeaturesSection";
import UseCasesSection from "@/components/UseCasesSection";
import HowItWorksSection from "@/components/HowItWorksSection";
import BankingVaultSection from "@/components/BankingVaultSection";
import Footer from "@/components/Footer";

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <HeroSection onGetStarted={() => navigate("/login")} />
      <FeaturesSection />
      <UseCasesSection />
      <BankingVaultSection />
      <HowItWorksSection />
      <Footer />
    </div>
  );
};

export default Index;

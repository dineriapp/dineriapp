import CTA from "@/components/pages/home/CTA";
import Understand from "@/components/pages/home/understand";
import { Header } from "@/components/shared/header";
import TopBar from "@/components/shared/top-bar";
import FooterMain from "../components/shared/footer-main";
import Faqs from "@/components/pages/home/faqs";
import Plans from "@/components/pages/home/plans";
import TrustedBy from "@/components/pages/home/trusted-by";
import Hero from "@/components/pages/home/hero";
import EverythingYouNeed from "@/components/pages/home/everything-you-need";
import HowItWorks from "@/components/pages/home/how-it-works";

export default function Home() {
  return (
    <>
      <TopBar />
      <Header />
      <main>
        <Hero />
        <TrustedBy />
        <EverythingYouNeed />
        <HowItWorks />
        <Plans />
        <Faqs />
        <Understand />
        <CTA />
      </main>
      <FooterMain />
    </>
  );
}

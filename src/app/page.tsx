import CTA from "@/components/pages/home/CTA";
import Understand from "@/components/pages/home/understand";
import { Header } from "@/components/shared/header";
import TopBar from "@/components/shared/top-bar";
import FooterMain from "../components/shared/footer-main";
import Faqs from "@/components/pages/home/faqs";

export default function Home() {
  return (
    <>
      <TopBar />
      <Header />
      <main>
        <Faqs />
        <Understand />
        <CTA />
      </main>
      <FooterMain />
    </>
  );
}

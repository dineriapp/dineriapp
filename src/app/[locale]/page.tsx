import { redirect } from '@/i18n/navigation';
import { auth } from '@/lib/auth/auth';
import { headers } from 'next/headers';

const page = async ({ params }: { params: Promise<{ locale: string }> }) => {
  const { locale } = await params
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    return redirect({ href: "/login", locale: locale });
  } else {
    return redirect({ href: "/dashboard", locale: locale });

  }
}

export default page


// import CTA from "@/components/pages/home/CTA";
// import EverythingYouNeed from "@/components/pages/home/everything-you-need";
// import Faqs from "@/components/pages/home/faqs";
// import Hero from "@/components/pages/home/hero";
// import HowItWorks from "@/components/pages/home/how-it-works";
// import Plans from "@/components/pages/home/plans";
// import TrustedBy from "@/components/pages/home/trusted-by";
// import Understand from "@/components/pages/home/understand";
// import FooterMain from "@/components/shared/footer-main";
// import { Header } from "@/components/shared/header";
// import TopBar from "@/components/shared/top-bar";

// export default async function Home() {

//   return (
//     <>
//       <TopBar />
//       <Header />
//       <main>
//         <Hero />
//         <TrustedBy />
//         <EverythingYouNeed />
//         <HowItWorks />
//         <Plans />
//         <Faqs />
//         <Understand />
//         <CTA />
//       </main>
//       <FooterMain />
//     </>
//   );
// }

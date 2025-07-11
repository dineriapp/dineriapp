import Link from "next/link"
import { Button } from "@/components/ui/button"
import {
  Utensils,
  ArrowRight,
  Check,
  Calendar,
  BarChart,
  Palette,
  Globe,
  Share2,
  MessageCircle,
  Clock,
  MenuIcon,
  Mail,
  ChevronRight,
  Star,
} from "lucide-react"

import { TestimonialCard } from "@/components/pages/home/testimonial-card"
import { FeatureCard } from "@/components/pages/home/feature-card"
import { ContactCard } from "@/components/pages/home/contact-card"
import { MobilePreview } from "@/components/pages/home/mobile-preview"
import { StatsCounter } from "@/components/pages/home/stats-counter"
import { FAQAccordion } from "@/components/pages/home/faq-accordion"
import { NewsletterForm } from "@/components/pages/home/newsletter-form"
import { Header } from "@/components/shared/header"
import { Footer } from "@/components/shared/footer"
import Image from "next/image"
import PricingSection from "@/components/pages/home/pricing"

const features = [
  {
    icon: Globe,
    title: "Beautiful Profile Page",
    description:
      "Create a stunning mobile-optimized page that showcases your restaurant's unique personality and brand.",
  },
  {
    icon: MenuIcon,
    title: "Digital Menu",
    description:
      "Display your menu items with prices, descriptions, and dietary information that customers can easily browse.",
  },
  {
    icon: Calendar,
    title: "Event Management",
    description:
      "Promote special events, tastings, and live music nights to keep your customers engaged and coming back.",
  },
  {
    icon: BarChart,
    title: "Analytics & Insights",
    description: "Track views and engagement to understand your audience and optimize your online presence.",
  },
  {
    icon: Share2,
    title: "Social Integration",
    description: "Connect all your social media profiles in one place to boost your online presence across platforms.",
  },
  {
    icon: Palette,
    title: "Custom Branding",
    description:
      "Match your restaurant's colors, fonts, and style to create a cohesive brand experience for your customers.",
  },
]



const testimonials = [
  {
    name: "Marco Rossi",
    role: "Owner, Trattoria Milano",
    image: "https://media.licdn.com/dms/image/v2/D4E03AQHj7dWSR5ovJA/profile-displayphoto-shrink_200_200/profile-displayphoto-shrink_200_200/0/1729369054465?e=2147483647&v=beta&t=yJ_cs3qCQOyfL5id1H9P0oAAlbUJFHPLjoWzLU6SUl8",
    content:
      "dineri.app transformed our online presence. Our customers love how easy it is to find our menu and make reservations. Highly recommended!",
    rating: 5,
  },
  {
    name: "Sophie Laurent",
    role: "Manager, Café Parisienne",
    image: "https://media.licdn.com/dms/image/v2/D4E03AQHj7dWSR5ovJA/profile-displayphoto-shrink_200_200/profile-displayphoto-shrink_200_200/0/1729369054465?e=2147483647&v=beta&t=yJ_cs3qCQOyfL5id1H9P0oAAlbUJFHPLjoWzLU6SUl8",
    content:
      "Since using dineri.app, we've seen a 30% increase in online reservations. The platform is intuitive and our profile looks stunning.",
    rating: 5,
  },
  {
    name: "David Chen",
    role: "Owner, Spice Garden",
    image: "https://media.licdn.com/dms/image/v2/D4E03AQHj7dWSR5ovJA/profile-displayphoto-shrink_200_200/profile-displayphoto-shrink_200_200/0/1729369054465?e=2147483647&v=beta&t=yJ_cs3qCQOyfL5id1H9P0oAAlbUJFHPLjoWzLU6SUl8",
    content:
      "The analytics feature has been invaluable for understanding our customers. Setting up our profile was quick and the support team is excellent.",
    rating: 4,
  },
]

const stats = [
  { value: "10k+", label: "Restaurants" },
  { value: "2M+", label: "Monthly Views" },
  { value: "98%", label: "Satisfaction" },
  { value: "24/7", label: "Support" },
]

const faqs = [
  {
    question: "How long does it take to set up my restaurant profile?",
    answer:
      "Most restaurants can set up their complete profile in under 30 minutes. Our intuitive interface makes it easy to add your information, menu items, and customize your page.",
  },
  {
    question: "Can I connect my existing reservation system?",
    answer:
      "Yes! dineri.app integrates with popular reservation systems like OpenTable, Resy, and more. You can easily connect your existing system during setup.",
  },
  {
    question: "How do I update my menu?",
    answer:
      "Updating your menu is simple. Log in to your dashboard, navigate to the Menu section, and you can add, edit, or remove items in real-time. Changes appear instantly on your profile.",
  },
  {
    question: "Is there a limit to how many photos I can upload?",
    answer:
      "Basic plans include up to 10 photos, while Pro and Enterprise plans offer unlimited photo uploads to showcase your restaurant, dishes, and ambiance.",
  },
]

export default function Home() {
  return (
    <>
      <Header />
      <main>
        {/* Hero Section */}
        <section className="relative overflow-hidden bg-gradient-to-b from-slate-50 to-white py-14 900:py-14">
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute -top-[40%] -right-[10%] h-[500px] w-[500px] rounded-full bg-gradient-to-br from-teal-100/40 to-blue-100/30 blur-3xl"></div>
            <div className="absolute top-[60%] -left-[5%] h-[300px] w-[300px] rounded-full bg-gradient-to-br from-blue-100/40 to-purple-100/30 blur-3xl"></div>
          </div>

          <div className="max-w-[1200px]  relative w-full mx-auto px-4">
            <div className="flex items-start 900:gap-1 gap-14 900:items-center 900:flex-row flex-col justify-between w-full">
              <div className="max-w-2xl w-full">
                <div className="mb-3 md:mb-6 inline-flex items-center rounded-full bg-slate-100 px-3 py-1 text-sm text-slate-800">
                  <span className="mr-2 rounded-full bg-teal-500 p-1">
                    <Check className="h-3 w-3 text-white" />
                  </span>
                  Trusted by over 10,000 restaurants <span className="sm:flex hidden">{" "}worldwide</span>
                </div>
                <h1 className="mb-3 md:mb-6 text-[44px] font-bold leading-[1.05] tracking-tight text-slate-900 md:text-6xl lg:text-7xl">
                  Your restaurant,{" "}
                  <span className="bg-gradient-to-r from-teal-600 to-blue-600 bg-clip-text text-transparent">
                    one link away
                  </span>
                </h1>
                <p className="mb-5 md:mb-8 text-lg sm:text-xl leading-relaxed text-slate-600">
                  Create a beautiful digital presence that connects with customers. Showcase your menu, collect
                  reservations, and grow your business—all from a single, stunning profile page.
                </p>

                <div className="flex flex-col space-y-3 md:space-y-4 sm:flex-row sm:space-x-4 sm:space-y-0">
                  <Link href="/auth/signup">
                    <Button
                      size="lg"
                      className="group h-14 sm:w-auto w-full bg-gradient-to-r from-teal-600 to-blue-600 px-8 text-lg hover:from-teal-700 hover:to-blue-700"
                    >
                      Create your page
                      <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                    </Button>
                  </Link>
                  <Link href="#features">
                    <Button
                      size="lg"
                      variant="outline"
                      className="h-14 border-slate-300 px-8 sm:w-auto w-full text-lg text-slate-700 hover:bg-slate-100"
                    >
                      Explore features
                    </Button>
                  </Link>
                </div>

                <div className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-4">
                  {stats.map((stat, i) => (
                    <StatsCounter key={i} value={stat.value} label={stat.label} />
                  ))}
                </div>
              </div>

              <div className="relative w-full flex items-center justify-center 900:justify-end ">
                <MobilePreview />
              </div>
            </div>
          </div>
        </section>

        {/* Trusted By Section */}
        <section className="border-y border-slate-200 bg-white py-12">
          <div className="max-w-[1200px] mx-auto px-4">
            <p className="mb-8 text-center text-sm font-medium uppercase tracking-wider text-slate-500">
              Trusted by restaurants worldwide
            </p>
            <div className="flex flex-wrap items-center justify-center gap-x-12 gap-y-8">
              {["Trattoria Milano", "Café Parisienne", "Spice Garden", "Ocean Grill", "Bistro Moderne"].map(
                (name, i) => (
                  <div key={i} className="flex items-center text-slate-400">
                    <Utensils className="mr-2 h-5 w-5" />
                    <span className="text-lg font-medium">{name}</span>
                  </div>
                ),
              )}
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="bg-white py-14 lg:py-24">
          <div className="max-w-[1200px] mx-auto px-4">
            <div className="mb-10 lg:mb-16 max-w-3xl mx-auto text-center">
              <h2 className="mb-4 text-3xl font-bold text-slate-900 md:text-4xl lg:text-5xl">
                Everything you need to{" "}
                <span className="bg-gradient-to-r from-teal-600 to-blue-600 bg-clip-text text-transparent">
                  grow your restaurant
                </span>
              </h2>
              <p className="text-xl text-slate-600">
                Powerful features designed specifically for restaurants to enhance their online presence and connect
                with customers
              </p>
            </div>

            <div className="grid gap-4 lg:gap-8 md:grid-cols-2 lg:grid-cols-3">
              {features.map((feature, index) => (
                <FeatureCard key={index} icon={feature.icon} title={feature.title} description={feature.description} />
              ))}
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section className="bg-slate-50 py-14 lg:py-24">
          <div className="max-w-[1200px] mx-auto px-4">
            <div className="mb-10 lg:mb-16 max-w-3xl mx-auto text-center">
              <h2 className="mb-4 text-3xl font-bold text-slate-900 md:text-4xl lg:text-5xl">How dineri.app works</h2>
              <p className="text-xl text-slate-600">Get your restaurant online in three simple steps</p>
            </div>

            <div className="grid gap-4 lg:gap-8 md:grid-cols-3">
              {[
                {
                  step: "01",
                  title: "Create your profile",
                  description:
                    "Sign up and build your restaurant profile with your logo, photos, and basic information.",
                },
                {
                  step: "02",
                  title: "Add your content",
                  description: "Upload your menu, add reservation links, and connect your social media accounts.",
                },
                {
                  step: "03",
                  title: "Share with customers",
                  description:
                    "Share your unique dineri.app link on social media, Google Business, and your marketing materials.",
                },
              ].map((item, i) => (
                <div key={i} className="relative rounded-2xl bg-white p-8 shadow-sm transition-all hover:shadow-md">
                  <div className="mb-6 inline-block rounded-xl bg-gradient-to-r from-teal-600 to-blue-600 p-4 text-2xl font-bold text-white">
                    {item.step}
                  </div>
                  <h3 className="mb-3 text-xl font-bold text-slate-900">{item.title}</h3>
                  <p className="text-slate-600">{item.description}</p>

                  {i < 2 && (
                    <div className="absolute -right-[34px] top-1/2 hidden -translate-y-1/2 text-slate-300 md:block">
                      <ChevronRight className="h-8 w-8" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Testimonials Section */}
        <section className="bg-white py-14 lg:py-24">
          <div className="max-w-[1200px] mx-auto px-4">
            <div className="pb-10 lg:mb-16 max-w-3xl mx-auto text-center">
              <h2 className="mb-4 text-3xl font-bold text-slate-900 md:text-4xl lg:text-5xl">
                Loved by restaurant owners
              </h2>
              <p className="text-xl text-slate-600">See what our customers have to say about dineri.app</p>
            </div>

            <div className="grid gap-4 lg:gap-8 md:grid-cols-3">
              {testimonials.map((testimonial, index) => (
                <TestimonialCard
                  key={index}
                  name={testimonial.name}
                  role={testimonial.role}
                  image={testimonial.image}
                  content={testimonial.content}
                  rating={testimonial.rating}
                />
              ))}
            </div>
          </div>
        </section>

        <PricingSection />

        {/* FAQ Section */}
        <section className="bg-white py-14 lg:py-24">
          <div className="max-w-[1200px] mx-auto px-4">
            <div className="mb-8 lg:mb-16 max-w-3xl mx-auto text-center">
              <h2 className="mb-4 text-3xl font-bold text-slate-900 md:text-4xl lg:text-5xl">
                Frequently asked questions
              </h2>
              <p className="text-xl text-slate-600">Everything you need to know about dineri.app</p>
            </div>

            <div className="mx-auto max-w-3xl">
              <FAQAccordion items={faqs} />

              <div className="mt-8 lg:mt-12 rounded-2xl bg-gradient-to-r from-teal-600 to-blue-600 p-8 text-center text-white">
                <h3 className="mb-4 text-2xl font-bold">Still have questions?</h3>
                <p className="mb-6">Our team is here to help you get started with dineri.app</p>
                <Link href="/contact">
                  <Button size="lg" variant="secondary" className="bg-white text-blue-600 hover:bg-slate-100">
                    Contact our team
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 py-14 lg:py-24">
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute top-0 left-0 h-[800px] w-[800px] rounded-full bg-teal-600/10 blur-3xl"></div>
            <div className="absolute bottom-0 right-0 h-[600px] w-[600px] rounded-full bg-blue-600/10 blur-3xl"></div>
            <div className="absolute top-1/2 left-1/2 h-[300px] w-[300px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-teal-500/5 blur-2xl"></div>
          </div>

          <div className="max-w-[1200px] relative mx-auto px-4 w-full">
            <div className="mx-auto max-w-5xl w-full">
              <div className="grid gap-6 lg:gap-12 md:grid-cols-2 w-full">
                <div className="flex flex-col justify-center">
                  <div className="mb-2 w-fit inline-flex items-center rounded-full bg-teal-500/20 px-3 py-1 text-sm text-teal-300">
                    <span className="mr-2 rounded-full bg-teal-400 p-1">
                      <Check className="h-3 w-3 text-slate-900" />
                    </span>
                    Join 10,000+ restaurants
                  </div>
                  <h2 className="mb-6 text-3xl font-bold text-white md:text-4xl lg:text-5xl">
                    Ready to transform your restaurant&apos;s{" "}
                    <span className="bg-gradient-to-r from-teal-400 to-blue-400 bg-clip-text text-transparent">
                      online presence?
                    </span>
                  </h2>
                  <p className="mb-8 text-xl text-slate-300">
                    Create your beautiful restaurant profile in minutes and start connecting with more customers today.
                  </p>

                  <div className="flex flex-col space-y-4 sm:flex-row sm:space-x-4 sm:space-y-0">
                    <Link href="/auth/signup">
                      <Button
                        size="lg"
                        className="group h-14 bg-gradient-to-r from-teal-500 md:w-auto w-full to-blue-500 px-8 text-lg hover:from-teal-600 hover:to-blue-600"
                      >
                        Create your page
                        <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                      </Button>
                    </Link>
                    <Link href="/demo">
                      <Button
                        size="lg"
                        variant="outline"
                        className="h-14 border-slate-700 px-8 text-lg text-black md:w-auto w-full hover:text-white hover:bg-slate-800"
                      >
                        View demo
                      </Button>
                    </Link>
                  </div>
                </div>

                <div className="relative">
                  <div className="absolute -left-10 -top-10 h-40 w-40 rounded-full bg-teal-500/10 blur-2xl"></div>
                  <div className="absolute -right-10 -bottom-10 h-40 w-40 rounded-full bg-blue-500/10 blur-2xl"></div>

                  <div className="relative rounded-2xl border border-slate-700 bg-slate-800/80 p-8 backdrop-blur-sm">
                    <div className="mb-6 flex items-center justify-between">
                      <h3 className="text-2xl font-bold text-white">Stay updated</h3>
                      <div className="rounded-full bg-teal-500/20 p-2 text-teal-300">
                        <Mail className="h-5 w-5" />
                      </div>
                    </div>

                    <p className="mb-6 text-slate-300">
                      Subscribe to our newsletter for the latest features, tips, and success stories.
                    </p>

                    <NewsletterForm />

                    <div className="mt-8 flex items-center justify-between border-t border-slate-700 pt-6">
                      <div className="flex items-center gap-2">
                        <div className="flex items-center justify-center -space-x-3">
                          {[1, 2, 3].map((i) => (
                            <div key={i} className="h-8 w-8 overflow-hidden rounded-full bg-slate-700">
                              <Image
                                src={"https://media.licdn.com/dms/image/v2/D4E03AQHj7dWSR5ovJA/profile-displayphoto-shrink_200_200/profile-displayphoto-shrink_200_200/0/1729369054465?e=2147483647&v=beta&t=yJ_cs3qCQOyfL5id1H9P0oAAlbUJFHPLjoWzLU6SUl8"}
                                className="w-full h-full"
                                alt=""
                                width={40}
                                height={40} />
                            </div>
                          ))}
                        </div>
                        <span className="text-sm text-slate-400">Join 5,000+ subscribers</span>
                      </div>
                      <div className="flex items-center">
                        <div className="flex">
                          {[1, 2, 3, 4, 5].map((i) => (
                            <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400" />
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Contact Section */}
        <section className="bg-white py-14 lg:py-24">
          <div className="max-w-[1200px] mx-auto px-4">
            <div className="mb-10 lg:mb-16 max-w-3xl mx-auto text-center">
              <h2 className="mb-4 text-3xl font-bold text-slate-900 md:text-4xl lg:text-5xl">Get in touch</h2>
              <p className="text-xl text-slate-600">Have questions? We&apos;re here to help</p>
            </div>

            <div className="grid max-w-4xl mx-auto gap-3 lg:gap-8 md:grid-cols-3">
              <ContactCard
                icon={Mail}
                title="Email Support"
                description="support@dineri.app"
                link="mailto:support@dineri.app"
              />
              <ContactCard
                icon={MessageCircle}
                title="WhatsApp"
                description="Chat with us"
                link="https://wa.me/message/support"
              />
              <ContactCard icon={Clock} title="Business Hours" description="Mon-Fri, 9am-6pm CET" />
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}

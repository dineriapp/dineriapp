import {
  BarChart,
  Calendar,
  Globe,
  MenuIcon,
  Palette,
  Share2,
} from "lucide-react";
import { FeatureCard } from "./feature-card";

const features = [
  {
    icon: Globe,
    title: "Beautiful Profile Page",
    description:
      "Create a stunning, mobile-friendly page that reflects your restaurant’s unique vibe and style.",
  },
  {
    icon: MenuIcon,
    title: "Digital Menu",
    description:
      "Showcase your dishes with prices, descriptions, and dietary info. Easy for customers to browse and order.",
  },
  {
    icon: Calendar,
    title: "Event Highlights",
    description:
      "Promote events, tastings, or live music to keep your audience engaged and coming back.",
  },
  {
    icon: BarChart,
    title: "Analytics & Insights",
    description:
      "Track views, clicks, and orders to better understand your audience and improve performance.",
  },
  {
    icon: Share2,
    title: "Social Integration",
    description:
      "Link all your social profiles in one place and boost your visibility across platforms.",
  },
  {
    icon: Palette,
    title: "Custom Branding",
    description:
      "Use your restaurant’s colors, fonts, and imagery to create a fully branded profile.",
  },
];

const FeaturesSection = () => {
  return (
    <section id="features" className="bg-main-background py-14 lg:py-24">
      <div className="max-w-[1200px] mx-auto px-4">
        <div className="mb-10 lg:mb-16 max-w-3xl mx-auto text-center">
          <h2 className="mb-4 text-3xl font-bold text-main md:text-4xl lg:text-5xl">
            Everything you need to{" "}
            <span className="bg-gradient-to-r from-main-action to-main bg-clip-text text-transparent">
              grow your restaurant
            </span>
          </h2>
          <p className="text-lg text-main-text">
            Powerful tools made for restaurants. Create a stunning profile page,
            share all your links, take direct orders with payments, and track
            performance. No commissions. Just your brand, fully in control.
          </p>
        </div>

        <div className="grid gap-4 lg:gap-8 md:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, index) => (
            <FeatureCard
              key={index}
              icon={feature.icon}
              title={feature.title}
              description={feature.description}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;

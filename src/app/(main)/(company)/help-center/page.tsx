"use client";

import { Card, CardContent } from "@/components/ui/card";
import {
  ChevronRight,
  Code,
  HelpCircle,
  Home,
  Sparkle,
  BarChart,
  Calendar,
  Globe,
  MenuIcon,
  Palette,
  Share2,
} from "lucide-react";

export default function Page() {
  const featureCards = [
    { title: "Getting Started", icon: Home },
    { title: "Installation", icon: Sparkle },
    { title: "API Reference", icon: Code },
    { title: "Help", icon: HelpCircle },
  ];

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

  return (
    <div className="sm:px-6 md:px-12 lg:px-20 py-12">
      {/* Header */}
      <div className="text-center mb-16">
        <h1 className="text-5xl md:text-6xl font-extrabold text-main-blue mb-4 leading-tight">
          Welcome to <span className="text-main-blue">Dineri</span>
        </h1>
        <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto">
          The idea for Dineri.app was born from years of experience building
          websites for restaurants.
        </p>
      </div>

      {/* Feature Cards (Top Section) */}
      <div className="grid md:grid-cols-2 gap-6 mb-20">
        {featureCards.map((card, index) => (
          <Card
            key={index}
            className="bg-white border border-indigo-100 shadow-sm hover:border-main-green hover:shadow-md transition-all duration-200 hover:bg-transparent cursor-pointer group"
          >
            <CardContent className="p-6 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <card.icon className="w-6 h-6 text-main-blue group-hover:text-ain-blue" />
                <span className="font-semibold text-lg text-ain-blue group-hover:text-ain-blue">
                  {card.title}
                </span>
              </div>
              <ChevronRight className="w-5 h-5 text-indigo-400 group-hover:text-ain-blue transition-colors" />
            </CardContent>
          </Card>
        ))}
      </div>

      {/* "Why Dineri" Section */}
      <div className="mb-20">
        <h2 className="text-4xl font-bold text-main-blue mb-10 text-center">
          Why Dineri
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="flex gap-5 cursor-pointer transition-colors p-6 rounded-lg border border-indigo-100  hover:border-main-green/50 shadow-sm"
            >
              <div className="flex-shrink-0">
                <feature.icon className="w-7 h-7 text-indigo-600" />
              </div>
              <div>
                <h3 className="font-semibold text-lg text-ain-blue mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-700 leading-relaxed text-sm">
                  {feature.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

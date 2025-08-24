"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ChevronRight, Code, HelpCircle, Home, Sparkle } from "lucide-react";
import {
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
    <>
      {/* <div className="flex justify-center mb-8">
        <Badge className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2">
          NEW Announcing our next round of funding
        </Badge>
      </div> */}

      <div className="text-center mb-12 mt-12">
        <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-4">
          Welcome to Dineri
        </h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          The idea for Dineri.app was born from years of experience building
          websites for restaurants.
        </p>
      </div>

      <div className="grid md:grid-cols-2  gap-4 mb-16">
        {featureCards.map((card, index) => (
          <Card
            key={index}
            className="bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer group"
          >
            <CardContent className="p-6 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <card.icon className="w-5 h-5 text-gray-600" />
                <span className="font-medium text-gray-900 text-lg">
                  {card.title}
                </span>
              </div>
              <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-gray-600 transition-colors" />
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="mb-12">
        <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
          Why Dineri
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {features.map((feature, index) => (
            <div key={index} className="flex gap-4 bg-gray-50 p-5 rounded-sm">
              <div className="flex-shrink-0">
                <feature.icon className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

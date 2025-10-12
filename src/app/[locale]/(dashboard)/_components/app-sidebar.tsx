"use client";
import {
  BarChart,
  Calendar,
  Check,
  ChevronDown,
  Dot,
  HelpCircle,
  Home,
  LinkIcon,
  Loader2,
  Palette,
  Plus,
  QrCode,
  Settings,
  ShoppingCart,
  Utensils,
  UtensilsCrossed,
  Zap,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { useRestaurants } from "@/lib/restaurents-queries";
import { useUserStore } from "@/stores/auth-store";
import { useRestaurantStore } from "@/stores/restaurant-store";
import { useUpgradePopupStore } from "@/stores/upgrade-popup-store";
import { User as prismaUserType, User } from "@prisma/client";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { toast } from "sonner";
import { NavUser } from "./nav-user";
import { Locale } from "@/i18n/routing";
import { useLocale, useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";

const navigationGroups = {
  en: [
    {
      label: "Overview",
      items: [
        { href: "/dashboard", label: "Dashboard", icon: Home },
        { href: "/dashboard/stats", label: "Analytics", icon: BarChart },
        { href: "/dashboard/orders", label: "Orders", icon: ShoppingCart },
        { href: "/dashboard/reservations", label: "Reservations", icon: UtensilsCrossed },
      ],
    },
    {
      label: "Content",
      items: [
        { href: "/dashboard/links", label: "Links", icon: LinkIcon },
        { href: "/dashboard/menu", label: "Menu", icon: UtensilsCrossed },
        { href: "/dashboard/events", label: "Events", icon: Calendar },
        { href: "/dashboard/faq", label: "FAQ", icon: HelpCircle },
        { href: "/dashboard/settings/popups", label: "Popups", icon: Zap },
      ],
    },
    {
      label: "Marketing",
      items: [{ href: "/dashboard/qr-codes", label: "QR Codes", icon: QrCode }],
    },
    {
      label: "Customization",
      items: [
        { href: "/dashboard/appearance", label: "Appearance", icon: Palette },
        { href: "/dashboard/settings/business-information", label: "Settings", icon: Settings },
      ],
    },
  ],

  de: [
    {
      label: "Übersicht",
      items: [
        { href: "/dashboard", label: "Dashboard", icon: Home },
        { href: "/dashboard/stats", label: "Analytik", icon: BarChart },
        { href: "/dashboard/orders", label: "Bestellungen", icon: ShoppingCart },
        { href: "/dashboard/reservations", label: "Reservations", icon: UtensilsCrossed },
      ],
    },
    {
      label: "Inhalt",
      items: [
        { href: "/dashboard/links", label: "Links", icon: LinkIcon },
        { href: "/dashboard/menu", label: "Menü", icon: UtensilsCrossed },
        { href: "/dashboard/events", label: "Veranstaltungen", icon: Calendar },
        { href: "/dashboard/faq", label: "FAQ", icon: HelpCircle },
        { href: "/dashboard/settings/popups", label: "Popups", icon: Zap },
      ],
    },
    {
      label: "Marketing",
      items: [{ href: "/dashboard/qr-codes", label: "QR-Codes", icon: QrCode }],
    },
    {
      label: "Anpassung",
      items: [
        { href: "/dashboard/appearance", label: "Erscheinungsbild", icon: Palette },
        { href: "/dashboard/settings/business-information", label: "Einstellungen", icon: Settings },
      ],
    },
  ],

  es: [
    {
      label: "Resumen",
      items: [
        { href: "/dashboard", label: "Panel", icon: Home },
        { href: "/dashboard/stats", label: "Analíticas", icon: BarChart },
        { href: "/dashboard/orders", label: "Pedidos", icon: ShoppingCart },
        { href: "/dashboard/reservations", label: "Reservations", icon: UtensilsCrossed },
      ],
    },
    {
      label: "Contenido",
      items: [
        { href: "/dashboard/links", label: "Enlaces", icon: LinkIcon },
        { href: "/dashboard/menu", label: "Menú", icon: UtensilsCrossed },
        { href: "/dashboard/events", label: "Eventos", icon: Calendar },
        { href: "/dashboard/faq", label: "FAQ", icon: HelpCircle },
        { href: "/dashboard/settings/popups", label: "Popups", icon: Zap },
      ],
    },
    {
      label: "Marketing",
      items: [{ href: "/dashboard/qr-codes", label: "Códigos QR", icon: QrCode }],
    },
    {
      label: "Personalización",
      items: [
        { href: "/dashboard/appearance", label: "Apariencia", icon: Palette },
        { href: "/dashboard/settings/business-information", label: "Configuración", icon: Settings },
      ],
    },
  ],

  fr: [
    {
      label: "Aperçu",
      items: [
        { href: "/dashboard", label: "Tableau de bord", icon: Home },
        { href: "/dashboard/stats", label: "Analyses", icon: BarChart },
        { href: "/dashboard/orders", label: "Commandes", icon: ShoppingCart },
        { href: "/dashboard/reservations", label: "Reservations", icon: UtensilsCrossed },

      ],
    },
    {
      label: "Contenu",
      items: [
        { href: "/dashboard/links", label: "Liens", icon: LinkIcon },
        { href: "/dashboard/menu", label: "Menu", icon: UtensilsCrossed },
        { href: "/dashboard/events", label: "Événements", icon: Calendar },
        { href: "/dashboard/faq", label: "FAQ", icon: HelpCircle },
        { href: "/dashboard/settings/popups", label: "Popups", icon: Zap },
      ],
    },
    {
      label: "Marketing",
      items: [{ href: "/dashboard/qr-codes", label: "Codes QR", icon: QrCode }],
    },
    {
      label: "Personnalisation",
      items: [
        { href: "/dashboard/appearance", label: "Apparence", icon: Palette },
        { href: "/dashboard/settings/business-information", label: "Paramètres", icon: Settings },
      ],
    },
  ],

  it: [
    {
      label: "Panoramica",
      items: [
        { href: "/dashboard", label: "Dashboard", icon: Home },
        { href: "/dashboard/stats", label: "Analitiche", icon: BarChart },
        { href: "/dashboard/orders", label: "Ordini", icon: ShoppingCart },
        { href: "/dashboard/reservations", label: "Reservations", icon: UtensilsCrossed },
      ],
    },
    {
      label: "Contenuto",
      items: [
        { href: "/dashboard/links", label: "Link", icon: LinkIcon },
        { href: "/dashboard/menu", label: "Menù", icon: UtensilsCrossed },
        { href: "/dashboard/events", label: "Eventi", icon: Calendar },
        { href: "/dashboard/faq", label: "FAQ", icon: HelpCircle },
        { href: "/dashboard/settings/popups", label: "Popups", icon: Zap },
      ],
    },
    {
      label: "Marketing",
      items: [{ href: "/dashboard/qr-codes", label: "Codici QR", icon: QrCode }],
    },
    {
      label: "Personalizzazione",
      items: [
        { href: "/dashboard/appearance", label: "Aspetto", icon: Palette },
        { href: "/dashboard/settings/business-information", label: "Impostazioni", icon: Settings },
      ],
    },
  ],

  nl: [
    {
      label: "Overzicht",
      items: [
        { href: "/dashboard", label: "Dashboard", icon: Home },
        { href: "/dashboard/stats", label: "Statistieken", icon: BarChart },
        { href: "/dashboard/orders", label: "Bestellingen", icon: ShoppingCart },
        { href: "/dashboard/reservations", label: "Reservations", icon: UtensilsCrossed },
      ],
    },
    {
      label: "Inhoud",
      items: [
        { href: "/dashboard/links", label: "Links", icon: LinkIcon },
        { href: "/dashboard/menu", label: "Menu", icon: UtensilsCrossed },
        { href: "/dashboard/events", label: "Evenementen", icon: Calendar },
        { href: "/dashboard/faq", label: "FAQ", icon: HelpCircle },
        { href: "/dashboard/settings/popups", label: "Popups", icon: Zap },
      ],
    },
    {
      label: "Marketing",
      items: [{ href: "/dashboard/qr-codes", label: "QR-codes", icon: QrCode }],
    },
    {
      label: "Aanpassing",
      items: [
        { href: "/dashboard/appearance", label: "Uiterlijk", icon: Palette },
        { href: "/dashboard/settings/business-information", label: "Instellingen", icon: Settings },
      ],
    },
  ],
};

export function AppSidebar({
  user,
  prismaUser,
}: {
  user: any;
  prismaUser: prismaUserType;
}) {
  const locale: Locale = useLocale() as Locale
  const t = useTranslations("DashboardSidebar")
  const {
    restaurants,
    initializeRestaurants,
    selectedRestaurant,
    setSelectedRestaurant,
  } = useRestaurantStore();
  const { data } = useRestaurants();

  useEffect(() => {
    if (data?.restaurants) {
      initializeRestaurants(data.restaurants);
    }
  }, []);

  const router = useRouter();
  const pathname = usePathname()
  const openPopup = useUpgradePopupStore((state) => state.open);
  const { setSupabaseUser, setPrismaUser } = useUserStore();

  // Hydrate store with server data
  useEffect(() => {
    setSupabaseUser(user);
    setPrismaUser(prismaUser);
  }, [user, prismaUser, setSupabaseUser, setPrismaUser]);

  const hasMultiAccess =
    prismaUser?.subscription_plan === "enterprise" ? true : false;
  const isPremium = prismaUser?.subscription_plan === "basic" ? false : true;

  return (
    <Sidebar className="!pt-0 rounded-tl-[14px] !font-poppins rounded-bl-[14px] overflow-hidden">
      <SidebarHeader className="!px-0 !pt-0">
        <div className="h-16 flex items-center px-2 border-b border-black/10">
          <Link href="/dashboard" className="flex items-center space-x-2 group">
            <Image
              src={"/logo.png"}
              alt="logo.png"
              width={250}
              height={100}
              className="w-full max-w-[170px] "
            />
          </Link>
        </div>
        <SidebarMenu className="px-2">
          <SidebarMenuItem>
            <DropdownMenu>
              <p className="text-xs py-1 mb-1 text-main-text/60 font-medium">
                {t("restaurants_label")}
              </p>
              <DropdownMenuTrigger
                asChild
                className="border w-full rounded-full px-5 !py-4 h-[40px]"
              >
                <SidebarMenuButton>
                  <div className="flex items-center gap-2">
                    <Utensils className="h-4 w-4" />
                    {selectedRestaurant?.name || (
                      <Loader2 className="animate-spin opacity-60 size-4" />
                    )}
                  </div>
                  <ChevronDown className="ml-auto" />
                </SidebarMenuButton>
              </DropdownMenuTrigger>

              <DropdownMenuContent className="w-[--radix-popper-anchor-width] min-w-[234px] max-w-[240px] rounded-lg shadow-md border border-main-action/20 bg-white">
                <div className="max-h-60 overflow-y-auto">
                  {restaurants.map((rest) => {
                    const isActive = rest.id === selectedRestaurant?.id;

                    return (
                      <DropdownMenuItem
                        key={rest.id}
                        onClick={() => {
                          if (isPremium) {
                            setSelectedRestaurant(rest, { refresh: true });
                          } else {
                            toast.error(t("switch_error_title"), {
                              description: t("switch_error_description"),
                            });
                          }
                        }}
                        className={`
                                                        flex items-center justify-between gap-2 px-3 py-2 text-sm rounded-md
                                                        text-main transition-colors cursor-pointer
                                                        hover:bg-main-background
                                                        ${isActive
                            ? " font-medium text-black"
                            : ""
                          }
                                                    `}
                      >
                        <div className="flex items-center gap-2">
                          <Dot className="h-4 w-4 text-main-action" />
                          <span className="line-clamp-1">{rest.name}</span>
                        </div>
                        {isActive && (
                          <Check className="h-4 w-4 text-main-action" />
                        )}
                      </DropdownMenuItem>
                    );
                  })}
                </div>

                <div className="border-t border-main-background mt-2 px-3 py-3">
                  {hasMultiAccess ? (
                    <Button
                      size="sm"
                      variant="secondary"
                      className="w-full bg-main-action hover:bg-emerald-700 font-poppins rounded-full h-[38px] text-white text-sm"
                      onClick={() => router.push("/dashboard/create")}
                    >
                      <Plus /> {t("new_restaurant")}
                    </Button>
                  ) : (
                    <div className="bg-main-background p-3 rounded-md text-xs text-main-text/80">
                      <p className="mb-1 font-semibold text-main-text">
                        {t("need_more")}
                      </p>
                      <p className="max-w-[200px]">
                        {t("multi_restaurant_text")}
                        .
                      </p>
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() =>
                          openPopup(
                            t("multi_restaurant_text")
                          )
                        }
                        className="mt-2 w-full bg-main-action hover:bg-emerald-700 rounded-full h-[38px] text-white text-sm"
                      >
                        {t("upgrade_plan")}
                      </Button>
                    </div>
                  )}
                </div>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent className="gap-1">
        {navigationGroups[locale]?.map((group) => (
          <SidebarGroup key={group.label} className="py-0">
            <SidebarGroupLabel className="!text-[12px] font-semibold uppercase">
              {group.label}
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu className="gap-0">
                {group.items.map((item) => {
                  const Icon = item.icon;
                  const isActive = pathname === item.href;
                  const isLocked =
                    !isPremium &&
                    (item.label === "Analytics" || item.label === "QR Codes");

                  const handleClick = (e: React.MouseEvent) => {
                    if (isLocked) {
                      e.preventDefault();
                      openPopup(
                        t("locked_feature")
                      );
                    }
                  };

                  return (
                    <SidebarMenuItem key={item.href} className="relative !py-0">
                      <SidebarMenuButton
                        asChild
                        className="group/btn rounded-none !py-5"
                      >
                        <Link
                          href={isLocked ? "#" : item.href}
                          onClick={handleClick}
                          className={`
                                                        flex items-center space-x-2 w-full
                                                        rounded-md px-2 py-1.5 text-sm transition
                                                        ${isLocked
                              ? "cursor-not-allowed opacity-60"
                              : ""
                            }
                                                        ${isActive
                              ? "bg-gray-100 text-main-action font-medium"
                              : "hover:bg-main-background font-normal"
                            }
                                                    `}
                        >
                          <Icon className="h-5 w-5 group-hover/btn:!text-main-action" />
                          <span className="group-hover/btn:!text-main-action">
                            {item.label}
                          </span>
                        </Link>
                      </SidebarMenuButton>

                      {/* PRO Badge */}
                      {isLocked && (
                        <div className="absolute top-1 right-2 bg-[#f4b400] text-white text-[8px] px-1 py-[1px] rounded font-semibold">
                          PRO
                        </div>
                      )}
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>
      <SidebarFooter>
        <NavUser data={{ user: user as User }} />
      </SidebarFooter>
    </Sidebar>
  );
}

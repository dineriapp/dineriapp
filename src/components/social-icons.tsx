import { cn } from "@/lib/utils";
import {
    Facebook,
    Instagram,
    Mail,
    MapPin,
    Phone
} from "lucide-react";
import type { FC } from "react";
import { JSX } from "react";
import { FaTiktok, FaWhatsapp } from "react-icons/fa";

interface SocialLink {
    url: string;
    icon: JSX.Element;
}

interface SocialIconsProps {
    className?: string
    restaurant: {
        instagram?: string | null;
        facebook?: string | null;
        whatsapp?: string | null;
        tiktok?: string | null;
        email?: string | null;
        address?: string | null;
        phone?: string | null;
    };
    theme: {
        socialIconColor: string;
        social_icon_gap: number;
        socialIconBgShow: boolean;
        socialIconBgColor: string;
    };
    isPreview?: boolean
}

const SocialIcons: FC<SocialIconsProps> = ({
    restaurant,
    theme,
    className,
}) => {
    // Create social links dynamically
    const socialLinks: SocialLink[] = [];
    if (restaurant.instagram) {
        socialLinks.push({
            url: restaurant.instagram,
            icon: <Instagram className="h-6 w-6" />
        });
    }

    if (restaurant.facebook) {
        socialLinks.push({
            url: restaurant.facebook,
            icon: <Facebook className="h-6 w-6" />
        });
    }

    if (restaurant.whatsapp) {
        const formattedWhatsapp = `https://wa.me/${restaurant.whatsapp.replace(/\D/g, "")}`;
        socialLinks.push({
            url: formattedWhatsapp,
            icon: <FaWhatsapp className="h-6 w-6" />
        });
    }
    if (restaurant.tiktok) {
        const formattedTiktok = `${restaurant.tiktok}`;

        socialLinks.push({
            url: formattedTiktok,
            icon: <FaTiktok className="h-6 w-6" />
        });
    }

    if (restaurant.email) {
        socialLinks.push({
            url: `mailto:${restaurant.email}`,
            icon: <Mail className="h-6 w-6" />
        });
    }

    if (restaurant.phone) {
        socialLinks.push({
            url: `tel:${restaurant.phone}`,
            icon: <Phone className="h-5.5 w-5.5" />
        });
    }


    if (restaurant.address) {
        const encodedAddress = encodeURIComponent(restaurant.address);
        socialLinks.push({
            url: `https://maps.google.com/?q=${encodedAddress}`,
            icon: <MapPin className="h-5.5 w-5.5" />
        });
    }

    return (
        <div className={cn("flex flex-wrap items-center justify-center", className)}
            style={{
                gap: `${Number(theme.social_icon_gap)}px`
            }}
        >
            {socialLinks.map((link, index) => (
                <a
                    key={index}
                    href={link.url}
                    target={link.url.startsWith("mailto:") ? "_self" : "_blank"}
                    rel="noopener noreferrer"
                    className={`p-2.5 sm:p-4 rounded-full backdrop-blur-sm transition-transform hover:scale-110 ${theme.socialIconBgShow ? "shadow-md" : ""
                        }`}
                    style={{
                        color: theme.socialIconColor || "#10b981",
                        backgroundColor: theme.socialIconBgShow ? theme.socialIconBgColor : "transparent"
                    }}
                >
                    {link.icon}
                </a>
            ))}
        </div>
    );
};

export default SocialIcons;
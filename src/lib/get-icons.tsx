import {
    Menu,
    AlertTriangle,
    Heart,
    ShoppingBag,
    Star,
    Leaf,
    Link,
    CalendarDays,
    MapPin,
    Phone,
    Instagram,
    Facebook,
    type LucideIcon,
    type LucideProps,
    HelpCircle,
} from "lucide-react";
import type { JSX } from "react"
// 1. Define strict types for icon slugs
export type IconSlug =
    | "menu"
    | "alert"
    | "heart"
    | "shopping"
    | "star"
    | "leaf"
    | "link"
    | "events"
    | "faq"
    | "location"
    | "phone"
    | "instagram"
    | "facebook";

// 2. Type-safe icon registry with explicit mapping
const iconRegistry: Record<IconSlug, LucideIcon> = {
    menu: Menu,
    faq: HelpCircle,
    alert: AlertTriangle,
    heart: Heart,
    shopping: ShoppingBag,
    star: Star,
    leaf: Leaf,
    link: Link,
    events: CalendarDays,
    location: MapPin,
    phone: Phone,
    instagram: Instagram,
    facebook: Facebook,
};

// 3. Get all valid icon slugs programmatically
export const ALL_ICON_SLUGS = Object.keys(iconRegistry) as IconSlug[];

// 4. Safe icon getter with validation
export function getLucideIconBySlug(
    slug: string,
    props: LucideProps = {}
): JSX.Element | null {
    const normalizedSlug = slug.toLowerCase() as IconSlug;
    const IconComponent = iconRegistry[normalizedSlug];

    return IconComponent
        ? <IconComponent {...props} />
        : null;
}

// Utility function to validate icon slugs
export function isValidIconSlug(slug: string): slug is IconSlug {
    return ALL_ICON_SLUGS.includes(slug as IconSlug);
}
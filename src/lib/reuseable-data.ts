import { Template } from "./types";
import { Building2, Clock, CreditCard, Globe2, Instagram, Phone, ShieldAlert, Zap } from "lucide-react"

export const templates: Template[] = [
    {
        id: "classic-elegant",
        name: "Classic Elegant",
        description: "Sophisticated dark theme with gold accents",
        category: "Premium",
        preview: {
            bg_type: "gradient",
            bg_gradient_start: "#1a1a1a",
            bg_gradient_end: "#2d2d2d",
            gradient_direction: "bottom_right",
            bg_color: "#1a1a1a",
            social_icon_bg_color: "#d4af37",
            social_icon_color: "#000000",
            social_icon_bg_show: true,
            accent_color: "#d4af37",
            buttons_gap_in_px: 16,
            social_icon_gap: 12,
            headings_text_color: "#ffffff",
            button_icons_show: true,
            button_text_icons_color: "#000000",
            button_style: "rounded",
            button_variant: "solid",
            font_family: "Playfair Display",
            bg_image_url: "",
        }
    },
    {
        id: "modern-minimalist",
        name: "Modern Minimalist",
        description: "Clean and simple with subtle gradients",
        category: "Modern",
        preview: {
            bg_type: "gradient",
            bg_gradient_start: "#f8fafc",
            bg_gradient_end: "#e2e8f0",
            social_icon_bg_color: "#000000",
            social_icon_color: "#000000",
            gradient_direction: "bottom",
            buttons_gap_in_px: 16,
            social_icon_gap: 12,
            social_icon_bg_show: false,
            bg_color: "#ffffff",
            accent_color: "#0f172a",
            button_icons_show: true,
            headings_text_color: "#1e293b",
            button_text_icons_color: "#ffffff",
            button_style: "square",
            button_variant: "solid",
            font_family: "Inter",
            bg_image_url: "",
        }
    },
    {
        id: "warm-cozy",
        name: "Warm & Cozy",
        description: "Inviting warm colors perfect for cafes",
        category: "Cozy",
        preview: {
            bg_type: "gradient",
            bg_gradient_start: "#fef3c7",
            bg_gradient_end: "#fed7aa",
            button_icons_show: true,
            buttons_gap_in_px: 16,
            social_icon_gap: 12,
            social_icon_bg_show: false,
            gradient_direction: "bottom_right",
            bg_color: "#fef3c7",
            social_icon_bg_color: "#000000",
            social_icon_color: "#c2410c",
            accent_color: "#c2410c",
            headings_text_color: "#7c2d12",
            button_text_icons_color: "#ffffff",
            button_style: "pill",
            button_variant: "solid",
            font_family: "Roboto",
            bg_image_url: "",
        }
    },
    {
        id: "ocean-fresh",
        name: "Ocean Fresh",
        description: "Cool blues and teals for seafood restaurants",
        category: "Fresh",
        preview: {
            bg_type: "gradient",
            bg_gradient_start: "#0891b2",
            bg_gradient_end: "#0d9488",
            social_icon_bg_show: false,
            buttons_gap_in_px: 16,
            social_icon_gap: 12,
            social_icon_color: "#FFFFFF",
            social_icon_bg_color: "#000000",
            button_icons_show: true,
            gradient_direction: "bottom_left",
            bg_color: "#0891b2",
            accent_color: "#ffffff",
            headings_text_color: "#ffffff",
            button_text_icons_color: "#0d9488",
            button_style: "rounded",
            button_variant: "solid",
            font_family: "SF Pro Display",
            bg_image_url: "",
        }
    },
    {
        id: "sunset-vibes",
        name: "Sunset Vibes",
        description: "Vibrant sunset colors for energetic venues",
        category: "Vibrant",
        preview: {
            bg_type: "gradient",
            social_icon_bg_color: "#000000",
            social_icon_color: "#FFFFFF",
            bg_gradient_start: "#f97316",
            bg_gradient_end: "#dc2626",
            gradient_direction: "top_right",
            social_icon_bg_show: false,
            bg_color: "#f97316",
            accent_color: "#ffffff",
            buttons_gap_in_px: 16,
            social_icon_gap: 12,
            button_icons_show: true,
            headings_text_color: "#ffffff",
            button_text_icons_color: "#dc2626",
            button_style: "pill",
            button_variant: "solid",
            font_family: "Helvetica Neue",
            bg_image_url: "",
        }
    },
    {
        id: "forest-green",
        name: "Forest Green",
        description: "Natural green theme for organic restaurants",
        category: "Natural",
        preview: {
            social_icon_bg_color: "#000000",
            social_icon_color: "#FFFFFF",
            bg_type: "gradient",
            bg_gradient_start: "#166534",
            bg_gradient_end: "#15803d",
            social_icon_bg_show: false,
            button_icons_show: true,
            gradient_direction: "bottom",
            bg_color: "#166534",
            buttons_gap_in_px: 16,
            social_icon_gap: 12,
            accent_color: "#fbbf24",
            headings_text_color: "#ffffff",
            button_text_icons_color: "#166534",
            button_style: "rounded",
            button_variant: "solid",
            font_family: "Inter",
            bg_image_url: "",
        }
    }
]


export const container = {
    hidden: { opacity: 0 },
    show: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1,
        },
    },
}

export const container2 = {
    hidden: { opacity: 0 },
    show: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1,
            delayChildren: 0.3,
        },
    },
}

export const motionItem = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 },
}

export const fonts = [
    { name: "Inter", value: "var(--font-inter)", preview: "Modern and clean", weights: [100, 200, 300, 400, 500, 600, 700, 800, 900] },
    { name: "Roboto", value: "var(--font-roboto)", preview: "Professional and readable", weights: [100, 300, 400, 500, 700, 900] },
    { name: "Lora", value: "var(--font-lora)", preview: "Elegant serif style", weights: [400, 500, 600, 700] },
    { name: "Poppins", value: "var(--font-poppins)", preview: "Friendly and geometric", weights: [100, 200, 300, 400, 500, 600, 700, 800, 900] },
    { name: "Open Sans", value: "var(--font-open-sans)", preview: "Neutral and versatile", weights: [300, 400, 500, 600, 700, 800] },
    { name: "Merriweather", value: "var(--font-merriweather)", preview: "Classic reading font", weights: [300, 400, 700, 900] },
    { name: "Montserrat", value: "var(--font-montserrat)", preview: "Bold and modern", weights: [100, 200, 300, 400, 500, 600, 700, 800, 900] },
    { name: "Playfair Display", value: "var(--font-playfair-display)", preview: "Stylish display serif", weights: [400, 500, 600, 700, 800, 900] },
];

export const gradientDirections = [
    { value: "bottom", label: "Bottom", preview: "Top to Bottom" },
    { value: "top", label: "Top", preview: "Bottom to Top" },
    { value: "right", label: "Right", preview: "Left to Right" },
    { value: "left", label: "Left", preview: "Right to Left" },
    { value: "bottom_right", label: "Bottom Right", preview: "Top Left to Bottom Right" },
    { value: "bottom_left", label: "Bottom Left", preview: "Top Right to Bottom Left" },
    { value: "top_right", label: "Top Right", preview: "Bottom Left to Top Right" },
    { value: "top_left", label: "Top Left", preview: "Bottom Right to Top Left" },
]

export const gradientPresets = [
    { name: "Teal", start: "#0d9488", end: "#0891b2" },
    { name: "Blue", start: "#0369a1", end: "#0284c7" },
    { name: "Sunset", start: "#b91c1c", end: "#dc2626" },
    { name: "Purple", start: "#6d28d9", end: "#7c3aed" },
    { name: "Night", start: "#1e293b", end: "#334155" },
]

export const colorPresets = [
    { name: "Teal", color: "#0d9488" },
    { name: "Blue", color: "#3b82f6" },
    { name: "Red", color: "#ef4444" },
    { name: "Purple", color: "#8b5cf6" },
    { name: "Orange", color: "#f97316" },
    { name: "Green", color: "#22c55e" },
    { name: "Pink", color: "#ec4899" },
    { name: "Yellow", color: "#eab308" },
]

export const textColorPresets = [
    { name: "White", color: "#ffffff" },
    { name: "Black", color: "#000000" },
    { name: "Gray Dark", color: "#374151" },
    { name: "Gray Light", color: "#9ca3af" },
]

export const container3 = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1 } },
}

export const container4 = {
    hidden: { opacity: 0 },
    show: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1,
        },
    },
}

export const SettingsSidebarTabs = {
    en: [
        {
            id: "business-information",
            title: "Business Information",
            icon: Building2,
            description: "Basic information about your restaurant",
            href: "/dashboard/settings/business-information",
        },
        {
            id: "contact",
            title: "Contact Information",
            icon: Phone,
            description: "How customers can reach you",
            href: "/dashboard/settings/contact",
        },
        {
            id: "change-password",
            title: "Change Password",
            icon: ShieldAlert,
            description: "Update your profile password",
            href: "/dashboard/settings/change-password",
        },
        {
            id: "hours",
            title: "Opening Hours",
            icon: Clock,
            description: "When your restaurant is open",
            href: "/dashboard/settings/hours",
        },
        {
            id: "social",
            title: "Social Media",
            icon: Instagram,
            description: "Connect your social profiles",
            href: "/dashboard/settings/social",
        },
        {
            id: "stripe",
            title: "Stripe Settings",
            icon: CreditCard,
            description: "Configure payment processing",
            href: "/dashboard/settings/stripe",
        },
        {
            id: "popups",
            title: "Popups",
            icon: Zap,
            description: "Manage welcome popups and notifications",
            href: "/dashboard/settings/popups",
        },
        {
            id: "integrations",
            title: "Integrations",
            icon: Globe2,
            description: "Connect third-party services",
            href: "/dashboard/settings/integrations",
        },
        {
            id: "subscription",
            title: "Subscription",
            icon: Globe2,
            description: "Manage Subscription",
            href: "/dashboard/settings/subscription",
        },
    ],

    de: [
        {
            id: "business-information",
            title: "Geschäftsinformationen",
            icon: Building2,
            description: "Grundlegende Informationen zu deinem Restaurant",
            href: "/dashboard/settings/business-information",
        },
        {
            id: "contact",
            title: "Kontaktinformationen",
            icon: Phone,
            description: "Wie Kunden dich erreichen können",
            href: "/dashboard/settings/contact",
        },
        {
            id: "change-password",
            title: "Passwort ändern",
            icon: ShieldAlert,
            description: "Aktualisiere dein Profilpasswort",
            href: "/dashboard/settings/change-password",
        },
        {
            id: "hours",
            title: "Öffnungszeiten",
            icon: Clock,
            description: "Wann dein Restaurant geöffnet ist",
            href: "/dashboard/settings/hours",
        },
        {
            id: "social",
            title: "Soziale Medien",
            icon: Instagram,
            description: "Verbinde deine Social-Media-Profile",
            href: "/dashboard/settings/social",
        },
        {
            id: "stripe",
            title: "Stripe-Einstellungen",
            icon: CreditCard,
            description: "Zahlungsabwicklung konfigurieren",
            href: "/dashboard/settings/stripe",
        },
        {
            id: "popups",
            title: "Popups",
            icon: Zap,
            description: "Willkommens-Popups und Benachrichtigungen verwalten",
            href: "/dashboard/settings/popups",
        },
        {
            id: "integrations",
            title: "Integrationen",
            icon: Globe2,
            description: "Dienste von Drittanbietern verbinden",
            href: "/dashboard/settings/integrations",
        },
        {
            id: "subscription",
            title: "Abonnement",
            icon: Globe2,
            description: "Abonnement verwalten",
            href: "/dashboard/settings/subscription",
        },
    ],

    es: [
        {
            id: "business-information",
            title: "Información del negocio",
            icon: Building2,
            description: "Información básica sobre tu restaurante",
            href: "/dashboard/settings/business-information",
        },
        {
            id: "contact",
            title: "Información de contacto",
            icon: Phone,
            description: "Cómo los clientes pueden contactarte",
            href: "/dashboard/settings/contact",
        },
        {
            id: "change-password",
            title: "Cambiar contraseña",
            icon: ShieldAlert,
            description: "Actualiza la contraseña de tu perfil",
            href: "/dashboard/settings/change-password",
        },
        {
            id: "hours",
            title: "Horario de apertura",
            icon: Clock,
            description: "Cuándo está abierto tu restaurante",
            href: "/dashboard/settings/hours",
        },
        {
            id: "social",
            title: "Redes sociales",
            icon: Instagram,
            description: "Conecta tus perfiles sociales",
            href: "/dashboard/settings/social",
        },
        {
            id: "stripe",
            title: "Configuración de Stripe",
            icon: CreditCard,
            description: "Configura el procesamiento de pagos",
            href: "/dashboard/settings/stripe",
        },
        {
            id: "popups",
            title: "Popups",
            icon: Zap,
            description: "Gestiona popups de bienvenida y notificaciones",
            href: "/dashboard/settings/popups",
        },
        {
            id: "integrations",
            title: "Integraciones",
            icon: Globe2,
            description: "Conecta servicios de terceros",
            href: "/dashboard/settings/integrations",
        },
        {
            id: "subscription",
            title: "Suscripción",
            icon: Globe2,
            description: "Gestionar suscripción",
            href: "/dashboard/settings/subscription",
        },
    ],

    fr: [
        {
            id: "business-information",
            title: "Informations commerciales",
            icon: Building2,
            description: "Informations de base sur votre restaurant",
            href: "/dashboard/settings/business-information",
        },
        {
            id: "contact",
            title: "Informations de contact",
            icon: Phone,
            description: "Comment les clients peuvent vous joindre",
            href: "/dashboard/settings/contact",
        },
        {
            id: "change-password",
            title: "Changer le mot de passe",
            icon: ShieldAlert,
            description: "Mettre à jour le mot de passe de votre profil",
            href: "/dashboard/settings/change-password",
        },
        {
            id: "hours",
            title: "Heures d'ouverture",
            icon: Clock,
            description: "Quand votre restaurant est ouvert",
            href: "/dashboard/settings/hours",
        },
        {
            id: "social",
            title: "Réseaux sociaux",
            icon: Instagram,
            description: "Connectez vos profils sociaux",
            href: "/dashboard/settings/social",
        },
        {
            id: "stripe",
            title: "Paramètres Stripe",
            icon: CreditCard,
            description: "Configurer le traitement des paiements",
            href: "/dashboard/settings/stripe",
        },
        {
            id: "popups",
            title: "Popups",
            icon: Zap,
            description: "Gérer les popups de bienvenue et les notifications",
            href: "/dashboard/settings/popups",
        },
        {
            id: "integrations",
            title: "Intégrations",
            icon: Globe2,
            description: "Connectez des services tiers",
            href: "/dashboard/settings/integrations",
        },
        {
            id: "subscription",
            title: "Abonnement",
            icon: Globe2,
            description: "Gérer l'abonnement",
            href: "/dashboard/settings/subscription",
        },
    ],

    it: [
        {
            id: "business-information",
            title: "Informazioni aziendali",
            icon: Building2,
            description: "Informazioni di base sul tuo ristorante",
            href: "/dashboard/settings/business-information",
        },
        {
            id: "contact",
            title: "Informazioni di contatto",
            icon: Phone,
            description: "Come i clienti possono contattarti",
            href: "/dashboard/settings/contact",
        },
        {
            id: "change-password",
            title: "Cambia password",
            icon: ShieldAlert,
            description: "Aggiorna la password del tuo profilo",
            href: "/dashboard/settings/change-password",
        },
        {
            id: "hours",
            title: "Orari di apertura",
            icon: Clock,
            description: "Quando il tuo ristorante è aperto",
            href: "/dashboard/settings/hours",
        },
        {
            id: "social",
            title: "Social Media",
            icon: Instagram,
            description: "Collega i tuoi profili social",
            href: "/dashboard/settings/social",
        },
        {
            id: "stripe",
            title: "Impostazioni Stripe",
            icon: CreditCard,
            description: "Configura l'elaborazione dei pagamenti",
            href: "/dashboard/settings/stripe",
        },
        {
            id: "popups",
            title: "Popups",
            icon: Zap,
            description: "Gestisci popup di benvenuto e notifiche",
            href: "/dashboard/settings/popups",
        },
        {
            id: "integrations",
            title: "Integrazioni",
            icon: Globe2,
            description: "Collega servizi di terze parti",
            href: "/dashboard/settings/integrations",
        },
        {
            id: "subscription",
            title: "Abbonamento",
            icon: Globe2,
            description: "Gestisci abbonamento",
            href: "/dashboard/settings/subscription",
        },
    ],

    nl: [
        {
            id: "business-information",
            title: "Bedrijfsinformatie",
            icon: Building2,
            description: "Basisinformatie over je restaurant",
            href: "/dashboard/settings/business-information",
        },
        {
            id: "contact",
            title: "Contactinformatie",
            icon: Phone,
            description: "Hoe klanten je kunnen bereiken",
            href: "/dashboard/settings/contact",
        },
        {
            id: "change-password",
            title: "Wachtwoord wijzigen",
            icon: ShieldAlert,
            description: "Werk het wachtwoord van je profiel bij",
            href: "/dashboard/settings/change-password",
        },
        {
            id: "hours",
            title: "Openingstijden",
            icon: Clock,
            description: "Wanneer je restaurant open is",
            href: "/dashboard/settings/hours",
        },
        {
            id: "social",
            title: "Social Media",
            icon: Instagram,
            description: "Verbind je sociale profielen",
            href: "/dashboard/settings/social",
        },
        {
            id: "stripe",
            title: "Stripe-instellingen",
            icon: CreditCard,
            description: "Configureer betalingsverwerking",
            href: "/dashboard/settings/stripe",
        },
        {
            id: "popups",
            title: "Popups",
            icon: Zap,
            description: "Beheer welkomstpopups en meldingen",
            href: "/dashboard/settings/popups",
        },
        {
            id: "integrations",
            title: "Integraties",
            icon: Globe2,
            description: "Verbind diensten van derden",
            href: "/dashboard/settings/integrations",
        },
        {
            id: "subscription",
            title: "Abonnement",
            icon: Globe2,
            description: "Beheer abonnement",
            href: "/dashboard/settings/subscription",
        },
    ],
};


export const OrderStatusActions = {
    en: {
        pending: "Confirm Order",
        confirmed: "Start Preparing",
        preparing: "Mark as Ready",
        ready: "Mark as Delivered",
        delivered: "Delivered",
        cancelled: "Cancelled",
    },
    de: {
        pending: "Bestellung bestätigen",
        confirmed: "Zubereitung starten",
        preparing: "Als fertig markieren",
        ready: "Als geliefert markieren",
        delivered: "Geliefert",
        cancelled: "Storniert",
    },
    es: {
        pending: "Confirmar pedido",
        confirmed: "Comenzar preparación",
        preparing: "Marcar como listo",
        ready: "Marcar como entregado",
        delivered: "Entregado",
        cancelled: "Cancelado",
    },
    fr: {
        pending: "Confirmer la commande",
        confirmed: "Commencer la préparation",
        preparing: "Marquer comme prêt",
        ready: "Marquer comme livré",
        delivered: "Livré",
        cancelled: "Annulé",
    },
    it: {
        pending: "Conferma ordine",
        confirmed: "Inizia preparazione",
        preparing: "Segna come pronto",
        ready: "Segna come consegnato",
        delivered: "Consegnato",
        cancelled: "Annullato",
    },
    nl: {
        pending: "Bestelling bevestigen",
        confirmed: "Start met bereiden",
        preparing: "Markeer als klaar",
        ready: "Markeer als geleverd",
        delivered: "Geleverd",
        cancelled: "Geannuleerd",
    },
};


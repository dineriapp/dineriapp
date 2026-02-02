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

export const gradientDirectionsLangs = {
    en: [
        { value: "bottom", label: "Bottom", preview: "Top to Bottom" },
        { value: "top", label: "Top", preview: "Bottom to Top" },
        { value: "right", label: "Right", preview: "Left to Right" },
        { value: "left", label: "Left", preview: "Right to Left" },
        { value: "bottom_right", label: "Bottom Right", preview: "Top Left to Bottom Right" },
        { value: "bottom_left", label: "Bottom Left", preview: "Top Right to Bottom Left" },
        { value: "top_right", label: "Top Right", preview: "Bottom Left to Top Right" },
        { value: "top_left", label: "Top Left", preview: "Bottom Right to Top Left" },
    ],
    es: [
        { value: "bottom", label: "Abajo", preview: "De arriba a abajo" },
        { value: "top", label: "Arriba", preview: "De abajo a arriba" },
        { value: "right", label: "Derecha", preview: "De izquierda a derecha" },
        { value: "left", label: "Izquierda", preview: "De derecha a izquierda" },
        { value: "bottom_right", label: "Abajo derecha", preview: "De arriba izquierda a abajo derecha" },
        { value: "bottom_left", label: "Abajo izquierda", preview: "De arriba derecha a abajo izquierda" },
        { value: "top_right", label: "Arriba derecha", preview: "De abajo izquierda a arriba derecha" },
        { value: "top_left", label: "Arriba izquierda", preview: "De abajo derecha a arriba izquierda" },
    ],
    de: [
        { value: "bottom", label: "Unten", preview: "Von oben nach unten" },
        { value: "top", label: "Oben", preview: "Von unten nach oben" },
        { value: "right", label: "Rechts", preview: "Von links nach rechts" },
        { value: "left", label: "Links", preview: "Von rechts nach links" },
        { value: "bottom_right", label: "Unten rechts", preview: "Von oben links nach unten rechts" },
        { value: "bottom_left", label: "Unten links", preview: "Von oben rechts nach unten links" },
        { value: "top_right", label: "Oben rechts", preview: "Von unten links nach oben rechts" },
        { value: "top_left", label: "Oben links", preview: "Von unten rechts nach oben links" },
    ],
    fr: [
        { value: "bottom", label: "Bas", preview: "De haut en bas" },
        { value: "top", label: "Haut", preview: "De bas en haut" },
        { value: "right", label: "Droite", preview: "De gauche à droite" },
        { value: "left", label: "Gauche", preview: "De droite à gauche" },
        { value: "bottom_right", label: "Bas droite", preview: "De haut gauche à bas droite" },
        { value: "bottom_left", label: "Bas gauche", preview: "De haut droite à bas gauche" },
        { value: "top_right", label: "Haut droite", preview: "De bas gauche à haut droite" },
        { value: "top_left", label: "Haut gauche", preview: "De bas droite à haut gauche" },
    ],
    nl: [
        { value: "bottom", label: "Onder", preview: "Van boven naar onder" },
        { value: "top", label: "Boven", preview: "Van onder naar boven" },
        { value: "right", label: "Rechts", preview: "Van links naar rechts" },
        { value: "left", label: "Links", preview: "Van rechts naar links" },
        { value: "bottom_right", label: "Rechts onder", preview: "Van links boven naar rechts onder" },
        { value: "bottom_left", label: "Links onder", preview: "Van rechts boven naar links onder" },
        { value: "top_right", label: "Rechts boven", preview: "Van links onder naar rechts boven" },
        { value: "top_left", label: "Links boven", preview: "Van rechts onder naar links boven" },
    ],
    it: [
        { value: "bottom", label: "Basso", preview: "Dall'alto verso il basso" },
        { value: "top", label: "Alto", preview: "Dal basso verso l'alto" },
        { value: "right", label: "Destra", preview: "Da sinistra a destra" },
        { value: "left", label: "Sinistra", preview: "Da destra a sinistra" },
        { value: "bottom_right", label: "In basso a destra", preview: "Da in alto a sinistra a in basso a destra" },
        { value: "bottom_left", label: "In basso a sinistra", preview: "Da in alto a destra a in basso a sinistra" },
        { value: "top_right", label: "In alto a destra", preview: "Da in basso a sinistra a in alto a destra" },
        { value: "top_left", label: "In alto a sinistra", preview: "Da in basso a destra a in alto a sinistra" },
    ],
}


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

export const FAQ_TEMPLATES = {
    en: [
        {
            category: "Hours & Location",
            description: "Information about our location and operating hours",
            faqs: [
                { question: "What are your opening hours?", answer: "We are open Monday to Sunday from 11:00 AM to 10:00 PM." },
                {
                    question: "Where are you located?",
                    answer: "You can find our address and directions in the contact section above.",
                },
            ],
        },
        {
            category: "Reservations & Booking",
            description: "Everything about making and managing reservations",
            faqs: [
                {
                    question: "Do you take reservations?",
                    answer: "Yes, we accept reservations. You can book a table using the reservation link above.",
                },
                { question: "How far in advance can I book?", answer: "You can make reservations up to 30 days in advance." },
            ],
        },
        {
            category: "Menu & Dietary",
            description: "Questions about our menu and dietary accommodations",
            faqs: [
                {
                    question: "Do you have vegetarian options?",
                    answer: "Yes, we have a variety of vegetarian dishes clearly marked on our menu.",
                },
                {
                    question: "Do you offer vegan meals?",
                    answer: "Yes, we have several vegan options available. Please ask your server for details.",
                },
            ],
        },
        {
            category: "Policies & Services",
            description: "Information about our services and policies",
            faqs: [
                { question: "Do you offer takeaway?", answer: "Yes, all our menu items are available for takeaway." },
                {
                    question: "Do you deliver?",
                    answer: "Yes, we offer delivery through our delivery partners. Check our delivery section for details.",
                },
            ],
        },
    ],
    de: [
        {
            category: "Öffnungszeiten & Standort",
            description: "Informationen zu unserem Standort und unseren Öffnungszeiten",
            faqs: [
                { question: "Wie sind Ihre Öffnungszeiten?", answer: "Wir haben Montag bis Sonntag von 11:00 bis 22:00 Uhr geöffnet." },
                { question: "Wo befinden Sie sich?", answer: "Unsere Adresse und Wegbeschreibung finden Sie im obigen Kontaktbereich." }
            ]
        },
        {
            category: "Reservierungen & Buchungen",
            description: "Alles rund um Reservierungen und Buchungen",
            faqs: [
                { question: "Nehmen Sie Reservierungen an?", answer: "Ja, Sie können über den obigen Reservierungslink einen Tisch buchen." },
                { question: "Wie weit im Voraus kann ich buchen?", answer: "Sie können bis zu 30 Tage im Voraus reservieren." }
            ]
        },
        {
            category: "Speisekarte & Ernährung",
            description: "Fragen zu unserer Speisekarte und Ernährungsangeboten",
            faqs: [
                { question: "Haben Sie vegetarische Optionen?", answer: "Ja, wir haben eine Vielzahl vegetarischer Gerichte, die deutlich auf der Speisekarte gekennzeichnet sind." },
                { question: "Bieten Sie vegane Mahlzeiten an?", answer: "Ja, wir haben mehrere vegane Optionen. Bitte fragen Sie Ihr Servicepersonal nach Details." }
            ]
        },
        {
            category: "Richtlinien & Dienstleistungen",
            description: "Informationen zu unseren Dienstleistungen und Richtlinien",
            faqs: [
                { question: "Bieten Sie Essen zum Mitnehmen an?", answer: "Ja, alle unsere Gerichte sind auch zum Mitnehmen erhältlich." },
                { question: "Liefern Sie auch?", answer: "Ja, wir bieten Lieferungen über unsere Lieferpartner an. Weitere Informationen finden Sie im Lieferbereich." }
            ]
        }
    ],
    es: [
        {
            category: "Horario y Ubicación",
            description: "Información sobre nuestra ubicación y horarios de apertura",
            faqs: [
                { question: "¿Cuál es su horario de apertura?", answer: "Abrimos de lunes a domingo de 11:00 a 22:00." },
                { question: "¿Dónde están ubicados?", answer: "Puede encontrar nuestra dirección e indicaciones en la sección de contacto arriba." }
            ]
        },
        {
            category: "Reservas y Citas",
            description: "Todo sobre cómo hacer y gestionar reservas",
            faqs: [
                { question: "¿Aceptan reservas?", answer: "Sí, aceptamos reservas. Puede reservar una mesa usando el enlace de reservas arriba." },
                { question: "¿Con cuánta antelación puedo reservar?", answer: "Puede hacer reservas con hasta 30 días de anticipación." }
            ]
        },
        {
            category: "Menú y Dietas",
            description: "Preguntas sobre nuestro menú y opciones dietéticas",
            faqs: [
                { question: "¿Tienen opciones vegetarianas?", answer: "Sí, tenemos una variedad de platos vegetarianos claramente marcados en nuestro menú." },
                { question: "¿Ofrecen comidas veganas?", answer: "Sí, tenemos varias opciones veganas disponibles. Pregunte a su camarero para más detalles." }
            ]
        },
        {
            category: "Políticas y Servicios",
            description: "Información sobre nuestros servicios y políticas",
            faqs: [
                { question: "¿Ofrecen comida para llevar?", answer: "Sí, todos nuestros platos están disponibles para llevar." },
                { question: "¿Hacen entregas?", answer: "Sí, ofrecemos entrega a domicilio a través de nuestros socios de reparto. Consulte la sección de entregas para más detalles." }
            ]
        }
    ],
    fr: [
        {
            category: "Horaires & Emplacement",
            description: "Informations sur notre emplacement et nos horaires d'ouverture",
            faqs: [
                { question: "Quels sont vos horaires d'ouverture ?", answer: "Nous sommes ouverts du lundi au dimanche de 11h00 à 22h00." },
                { question: "Où êtes-vous situés ?", answer: "Vous pouvez trouver notre adresse et l'itinéraire dans la section contact ci-dessus." }
            ]
        },
        {
            category: "Réservations",
            description: "Tout sur la réservation et la gestion des réservations",
            faqs: [
                { question: "Acceptez-vous les réservations ?", answer: "Oui, nous acceptons les réservations. Vous pouvez réserver une table via le lien de réservation ci-dessus." },
                { question: "Combien de temps à l'avance puis-je réserver ?", answer: "Vous pouvez réserver jusqu'à 30 jours à l'avance." }
            ]
        },
        {
            category: "Menu & Régimes",
            description: "Questions sur notre menu et nos options alimentaires",
            faqs: [
                { question: "Avez-vous des options végétariennes ?", answer: "Oui, nous proposons une variété de plats végétariens clairement indiqués sur notre menu." },
                { question: "Proposez-vous des repas véganes ?", answer: "Oui, nous avons plusieurs options véganes disponibles. Veuillez demander plus d'informations à votre serveur." }
            ]
        },
        {
            category: "Politiques & Services",
            description: "Informations sur nos services et politiques",
            faqs: [
                { question: "Proposez-vous des plats à emporter ?", answer: "Oui, tous nos plats sont disponibles à emporter." },
                { question: "Faites-vous des livraisons ?", answer: "Oui, nous proposons un service de livraison via nos partenaires. Consultez notre section livraison pour plus de détails." }
            ]
        }
    ],
    it: [
        {
            category: "Orari e Posizione",
            description: "Informazioni sulla nostra posizione e sugli orari di apertura",
            faqs: [
                { question: "Quali sono i vostri orari di apertura?", answer: "Siamo aperti dal lunedì alla domenica dalle 11:00 alle 22:00." },
                { question: "Dove vi trovate?", answer: "Puoi trovare il nostro indirizzo e le indicazioni nella sezione contatti qui sopra." }
            ]
        },
        {
            category: "Prenotazioni",
            description: "Tutto sulle prenotazioni e la loro gestione",
            faqs: [
                { question: "Accettate prenotazioni?", answer: "Sì, accettiamo prenotazioni. Puoi prenotare un tavolo utilizzando il link alle prenotazioni qui sopra." },
                { question: "Con quanto anticipo posso prenotare?", answer: "Puoi effettuare prenotazioni fino a 30 giorni in anticipo." }
            ]
        },
        {
            category: "Menu e Diete",
            description: "Domande sul nostro menu e sulle opzioni alimentari",
            faqs: [
                { question: "Avete opzioni vegetariane?", answer: "Sì, abbiamo una varietà di piatti vegetariani chiaramente indicati nel nostro menu." },
                { question: "Offrite pasti vegani?", answer: "Sì, abbiamo diverse opzioni vegane disponibili. Chiedi maggiori dettagli al tuo cameriere." }
            ]
        },
        {
            category: "Politiche e Servizi",
            description: "Informazioni sui nostri servizi e politiche",
            faqs: [
                { question: "Offrite cibo da asporto?", answer: "Sì, tutti i nostri piatti sono disponibili per l'asporto." },
                { question: "Fate consegne a domicilio?", answer: "Sì, offriamo consegne tramite i nostri partner. Consulta la sezione consegne per maggiori dettagli." }
            ]
        }
    ],
    nl: [
        {
            category: "Openingstijden & Locatie",
            description: "Informatie over onze locatie en openingstijden",
            faqs: [
                { question: "Wat zijn jullie openingstijden?", answer: "Wij zijn geopend van maandag tot en met zondag van 11:00 tot 22:00." },
                { question: "Waar zijn jullie gevestigd?", answer: "Ons adres en de routebeschrijving vindt u in het bovenstaande contactgedeelte." }
            ]
        },
        {
            category: "Reserveringen",
            description: "Alles over het maken en beheren van reserveringen",
            faqs: [
                { question: "Accepteren jullie reserveringen?", answer: "Ja, wij accepteren reserveringen. U kunt een tafel boeken via de bovenstaande reserveringslink." },
                { question: "Hoe ver van tevoren kan ik reserveren?", answer: "U kunt tot 30 dagen van tevoren reserveren." }
            ]
        },
        {
            category: "Menu & Dieet",
            description: "Vragen over ons menu en dieetopties",
            faqs: [
                { question: "Hebben jullie vegetarische opties?", answer: "Ja, we hebben een verscheidenheid aan vegetarische gerechten die duidelijk op ons menu staan aangegeven." },
                { question: "Bieden jullie veganistische maaltijden aan?", answer: "Ja, we hebben verschillende veganistische opties beschikbaar. Vraag uw ober om meer informatie." }
            ]
        },
        {
            category: "Beleid & Diensten",
            description: "Informatie over onze diensten en beleid",
            faqs: [
                { question: "Bieden jullie afhaalmaaltijden aan?", answer: "Ja, al onze gerechten zijn beschikbaar om af te halen." },
                { question: "Leveren jullie ook?", answer: "Ja, wij leveren via onze bezorgpartners. Bekijk het gedeelte over bezorging voor meer details." }
            ]
        }
    ]
}

export const faq_container_animation = {
    hidden: { opacity: 0 },
    show: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1,
        },
    },
}

export const faq_item_animation = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 },
}


export const itemSlugPage = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 },
}
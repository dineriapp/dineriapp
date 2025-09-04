import { Template } from "./types";

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


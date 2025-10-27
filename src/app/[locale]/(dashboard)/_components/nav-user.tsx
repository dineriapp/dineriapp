"use client"

import { LogOutIcon, Mail, MoreVertical } from "lucide-react"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger
} from "@/components/ui/dropdown-menu"
import { SidebarMenu, SidebarMenuButton, SidebarMenuItem, useSidebar } from "@/components/ui/sidebar"
import { Link } from "@/i18n/navigation"
import { signOut, useSession } from "@/lib/auth/auth-client"
import { Calendar, CreditCard, MailCheck, MailX } from "lucide-react"
import { useTranslations } from "next-intl"
import { useRouter } from "next/navigation"
import { toast } from "sonner"


export function NavUser() {
    const { isMobile } = useSidebar()
    const { data: session } = useSession();

    const router = useRouter()
    const t = useTranslations("NavUser")
    if (!session?.user) return null

    const handleSignOut = async () => {
        toast(t("toastSignedOut"), {
            description: t("toastDescription"),
        })
        await signOut()
        router.replace("/")
    }


    return (
        <SidebarMenu>
            <SidebarMenuItem>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <SidebarMenuButton
                            size="lg"
                            className=" data-[state=open]:text-white flex items-center gap-x-3"
                        >
                            <Avatar className="h-8 w-8 rounded-lg border">
                                <AvatarImage
                                    src={session?.user.image || undefined}
                                    alt={session?.user.name || session?.user.email || "User"}
                                />
                                <AvatarFallback className="rounded-lg !text-[20px] !font-[600]">
                                    {session?.user.email?.slice(0, 1).toUpperCase()}
                                </AvatarFallback>
                            </Avatar>

                            <div className="grid flex-1 text-left text-sm leading-tight">
                                <span className="truncate text-xs text-main-text/80">
                                    {session?.user?.email}
                                </span>
                            </div>

                            <MoreVertical className="ml-auto size-4 text-slate-400 group-hover:text-white transition" />
                        </SidebarMenuButton>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                        className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
                        side={isMobile ? "bottom" : "right"}
                        align="end"
                        sideOffset={4}
                    >
                        <DropdownMenuLabel className="p-0 font-normal">
                            <div className="flex flex-col gap-2  py-2 text-sm">
                                {/* Avatar and Email */}
                                <div className="flex items-center gap-2 px-2">
                                    <Avatar className="h-8 w-8 rounded-lg border">
                                        <AvatarImage
                                            src={session?.user.image || undefined}
                                            alt={session?.user.name || session?.user.email || "User"}
                                        />

                                        <AvatarFallback className="rounded-lg !text-[20px] !font-[600]">
                                            {session?.user.email?.slice(0, 1).toUpperCase()}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className="flex flex-col space-y-0 text-left leading-tight">
                                        <span className="text-[15px] leading-[1.3] font-semibold truncate">
                                            {session?.user.name || ""}
                                        </span>
                                        <span className="text-xs leading-[1.3] text-muted-foreground truncate">
                                            {session?.user.email || ""}
                                        </span>
                                    </div>
                                </div>

                                <div className="mt-2 rounded-md space-y-2">

                                    {/* Email Verification */}
                                    <div className="flex items-center px-2 justify-between text-xs text-muted-foreground">
                                        <div className="flex items-center gap-2">
                                            {session?.user.emailVerified ? (
                                                <MailCheck className="text-green-600 h-4 w-4" />
                                            ) : (
                                                <MailX className="text-red-600 h-4 w-4" />
                                            )}
                                            <span>{t("emailVerified")}</span>
                                        </div>
                                        <span
                                            className={session?.user.emailVerified ? "text-green-600 font-medium" : "text-red-600 font-medium"}
                                        >
                                            {session?.user.emailVerified ? t("yes") : t("no")}
                                        </span>
                                    </div>

                                    <div className="border-t border-slate-300" />

                                    {/* Subscription Plan */}
                                    <div className="flex items-center px-2 justify-between text-xs text-muted-foreground">
                                        <div className="flex items-center gap-2">
                                            <CreditCard className="h-4 w-4 text-blue-500" />
                                            <span>{t("plan")}</span>

                                        </div>
                                        <span className="font-medium capitalize ">
                                            {session?.user.subscription_plan}
                                        </span>
                                    </div>

                                    {/* Subscription Status */}
                                    <div className="flex items-center px-2 justify-between text-xs text-muted-foreground">
                                        <div className="flex items-center gap-2 ml-6">
                                            <span>{t("status")}</span>
                                        </div>
                                        <span
                                            className={
                                                session?.user.subscription_status === "active"
                                                    ? "text-green-600 font-medium"
                                                    : session?.user.subscription_status === "past_due"
                                                        ? "text-yellow-600 font-medium"
                                                        : "text-red-600 font-medium"
                                            }
                                        >
                                            {session?.user.subscription_status}
                                        </span>
                                    </div>

                                    <div className="border-t border-slate-300" />

                                    {/* Joined Date */}
                                    <div className="flex items-center px-2 justify-between text-xs text-muted-foreground">
                                        <div className="flex items-center gap-2">
                                            <Calendar className="h-4 w-4 text-slate-500" />
                                            <span>{t("joined")}</span>
                                        </div>
                                        <span className="font-medium">
                                            {new Date(session?.user.createdAt).toLocaleDateString()}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </DropdownMenuLabel>

                        <DropdownMenuSeparator />
                        <DropdownMenuItem asChild>
                            <Link href={"/dashboard/change-email"}>
                                <Mail />
                                {t("changeEmail")}
                            </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => {
                            handleSignOut()
                        }}>
                            <LogOutIcon />
                            {t("logOut")}
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </SidebarMenuItem>
        </SidebarMenu>
    )
}

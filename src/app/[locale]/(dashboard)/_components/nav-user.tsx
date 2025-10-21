"use client"

import { LogOutIcon, Mail, MoreVertical, User as UserIcon } from "lucide-react"

import { signout } from "@/actions/auth"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger
} from "@/components/ui/dropdown-menu"
import { SidebarMenu, SidebarMenuButton, SidebarMenuItem, useSidebar } from "@/components/ui/sidebar"
import { User } from "@prisma/client"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { useTranslations } from "next-intl"
import { Link } from "@/i18n/navigation"
export function NavUser({ data }: { data: { user: User } }) {
    const { isMobile } = useSidebar()
    const router = useRouter()
    const t = useTranslations("NavUser")
    if (!data?.user) return null

    const handleSignOut = async () => {
        toast(t("toastSignedOut"), {
            description: t("toastDescription"),
        })
        await signout()
        router.push("/")
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
                            <div className="flex items-center justify-center h-8 w-8 rounded-lg bg-slate-700/20 text-slate-500">
                                <UserIcon className="h-5 w-5" />
                            </div>

                            <div className="grid flex-1 text-left text-sm leading-tight">
                                <span className="truncate text-xs text-main-text/80">
                                    {data?.user?.email}
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
                            <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                                <Avatar className="h-8 w-8 rounded-lg border">
                                    <AvatarFallback className="rounded-lg !text-[20px] !font-[600]">{data?.user.email?.slice(0, 1)}</AvatarFallback>
                                </Avatar>
                                <div className="grid flex-1 text-left text-sm leading-tight">
                                    <span className="truncate text-xs text-muted-foreground">{data?.user.email || ""}</span>
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

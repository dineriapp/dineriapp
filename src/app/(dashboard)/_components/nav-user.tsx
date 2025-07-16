"use client"

import { LogOutIcon, MoreVertical, User as UserIcon } from "lucide-react"

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

export function NavUser({ data }: { data: { user: User } }) {
    const { isMobile } = useSidebar()
    const router = useRouter()

    if (!data?.user) return null

    const handleSignOut = async () => {
        toast("Signed out successfully", {
            description: "You have been logged out of your account.",
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
                                    {data?.user.email || "your@email.com"}
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
                                <Avatar className="h-8 w-8 rounded-lg">
                                    <AvatarFallback className="rounded-lg">CN</AvatarFallback>
                                </Avatar>
                                <div className="grid flex-1 text-left text-sm leading-tight">
                                    <span className="truncate text-xs text-muted-foreground">{data?.user.email || ""}</span>
                                </div>
                            </div>
                        </DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => {
                            handleSignOut()
                        }}>
                            <LogOutIcon />
                            Log out
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </SidebarMenuItem>
        </SidebarMenu>
    )
}

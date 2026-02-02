"use client";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { Link } from "@/i18n/navigation";
import { signOut, useSession } from "@/lib/auth/auth-client";
import { BadgeCheck, Calendar, CreditCard, LogOutIcon, PieChart } from "lucide-react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { cn } from "@/lib/utils";

interface UserDropDownProps {
    className?: string;
    SizeClassName?: string;
}

export const UserDropDown = ({ className, SizeClassName = "size-[52px]" }: UserDropDownProps) => {
    const { data: session } = useSession()

    const nu = useTranslations("NavUser")

    const handleSignOut = async () => {
        toast(nu("toastSignedOut"), {
            description: nu("toastDescription"),
        })
        await signOut()
    }

    return (
        <>
            {
                session &&
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button
                            size="lg"
                            variant={"ghost"}
                            className={cn(`flex items-center cursor-pointer  !p-0 rounded-full`, className, SizeClassName)}
                        >
                            <Avatar className={cn(SizeClassName)}>
                                <AvatarImage
                                    src={session?.user.image || undefined}
                                    alt={session?.user.name || session?.user.email || "User"}
                                />
                                <AvatarFallback className="rounded-lg !text-[20px] !font-[600]">
                                    {session?.user.email?.slice(0, 1).toUpperCase()}
                                </AvatarFallback>
                            </Avatar>
                        </Button>
                    </DropdownMenuTrigger>

                    <DropdownMenuContent
                        className="w-[--radix-dropdown-menu-trigger-width]  min-w-56 rounded-lg"
                        side={"bottom"}
                        align="end"
                        sideOffset={4}
                    >
                        <DropdownMenuLabel className="p-0 font-normal">
                            <div className="flex flex-col gap-2 py-2 text-sm">
                                {/* Avatar and Email */}
                                <div className="flex items-center gap-2 px-2">
                                    <Avatar className="h-12 w-12 rounded-lg border">
                                        <AvatarImage
                                            src={session?.user.image || undefined}
                                            alt={session?.user.name || session?.user.email || "User"}
                                        />
                                        <AvatarFallback className="rounded-lg !text-[20px] !font-[600]">
                                            {session?.user.email?.slice(0, 1).toUpperCase()}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className="flex flex-col space-y-0 text-left leading-tight">
                                        <span className="text-[18px] font-semibold truncate">
                                            {session?.user.name || ""}
                                        </span>
                                        <span className="text-xs text-muted-foreground truncate">
                                            {session?.user.email || ""}
                                        </span>
                                    </div>
                                </div>

                                <div className="mt-2 rounded-md space-y-2">
                                    {/* Subscription Plan */}
                                    <div className="flex items-center px-2 justify-between text-[15px] text-muted-foreground">
                                        <div className="flex items-center gap-2">
                                            <CreditCard className="h-5 w-5 text-blue-500" />
                                            <span>{nu("plan")}</span>
                                        </div>
                                        <span className="font-medium capitalize">
                                            {session?.user.subscription_plan}
                                        </span>
                                    </div>

                                    <div className="border-t border-slate-300" />

                                    {/* Subscription Status */}
                                    <div className="flex items-center px-2 justify-between text-[15px] text-muted-foreground">
                                        <div className="flex items-center gap-2 ">
                                            <BadgeCheck className="h-5 w-5 text-blue-500" />
                                            <span>{nu("status")}</span>
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
                                    <div className="flex items-center px-2 justify-between text-[15px] text-muted-foreground">
                                        <div className="flex items-center gap-2">
                                            <Calendar className="h-5 w-5 text-slate-500" />
                                            <span className="">{nu("joined")}</span>
                                        </div>
                                        <span className="font-medium">
                                            {new Date(session?.user.createdAt).toLocaleDateString()}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </DropdownMenuLabel>

                        <DropdownMenuSeparator />
                        <DropdownMenuItem asChild className="h-10 hover:!bg-main-green group cursor-pointer hover:!text-white">
                            <Link href={"/dashboard"}>
                                <PieChart className="group-hover:!text-white" />
                                {nu("dashboard")}
                            </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem className="h-10 hover:!bg-red-400 group cursor-pointer hover:!text-white" onClick={handleSignOut}>
                            <LogOutIcon className="group-hover:!text-white" />
                            {nu("logOut")}
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            }
        </>

    )
}
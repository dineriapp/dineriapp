"use client"
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { useUserStore } from '@/stores/auth-store'
import { Copy, QrCode } from 'lucide-react'
import { motion } from "motion/react"
import Link from 'next/link'
import { toast } from 'sonner'

const Share = ({ slug, selectedRestaurant }: { slug: string, selectedRestaurant: boolean }) => {

    const { prismaUser } = useUserStore();

    const copyToClipboard = () => {
        if (selectedRestaurant) {
            navigator.clipboard.writeText(`https://dineri.app/${slug}`)
            toast("URL copied to clipboard")
        }
    }

    return (
        <Card className="hover:shadow-md transition-shadow backdrop-blur-sm bg-white border-slate-200">
            <CardHeader className='font-poppins'>
                <CardTitle className="text-slate-900">Your Restaurant Page</CardTitle>
                <CardDescription className="text-slate-500">Share your page with customers</CardDescription>
            </CardHeader>
            <CardContent>
                <motion.div
                    whileHover={{ scale: 1.02 }}
                    className="p-4 rounded-lg bg-gradient-to-r from-slate-50 to-white border border-slate-200 shadow-sm"
                >
                    <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-slate-700">dineri.app/{slug}</span>
                        <div className="flex gap-2">
                            <Button
                                size="sm"
                                variant="ghost"
                                className="h-8 w-8 p-0 text-slate-600 hover:text-teal-600 hover:bg-teal-50"
                                onClick={copyToClipboard}
                            >
                                <Copy className="h-4 w-4" />
                                <span className="sr-only">Copy URL</span>
                            </Button>
                        </div>
                    </div>
                </motion.div>
                <p className="text-xs text-slate-500 mt-4">
                    This is your unique page URL. Share it with your customers to help them find all your important links
                    in one place.
                </p>
            </CardContent>
            {
                prismaUser?.subscription_plan !== "basic" &&
                <CardFooter className="border-t border-slate-100 pt-4">
                    <Button
                        className="w-full justify-center bg-[#002147] hover:bg-main-hover/80 h-12 rounded-full cursor-pointer"
                        size="sm"
                        asChild
                    >
                        <Link className='flex items-center justify-center !leading-[1]' href={"/dashboard/qr-codes"}>
                            <QrCode className="h-4 w-4 mr-2" />
                            Generate QR Code
                        </Link>
                    </Button>
                </CardFooter>
            }
        </Card>
    )
}

export default Share

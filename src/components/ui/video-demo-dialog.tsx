'use client';

import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger
} from '@/components/ui/dialog';

export function VideoDemoDialog() {
    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button
                    size="lg"
                    variant="outline"
                    className="h-14 border-slate-700 px-8 text-lg text-black md:w-auto w-full hover:text-white hover:bg-slate-800"
                >
                    View demo
                </Button>
            </DialogTrigger>

            <DialogContent className="max-w-3xl w-full">
                <DialogHeader className="mb-4 flex items-start justify-between">
                    <DialogTitle className="text-2xl font-bold  text-start w-full">Dineri.app</DialogTitle>
                    <p className="mt-1 text-sm text-muted-foreground">
                        Dineri.app helps restaurants build beautiful link-in-bio pages, add custom links, showcase their menu, and connect with customers — all in one smart profile.
                    </p>
                </DialogHeader>

                {/* YouTube iframe */}
                <div className="relative w-full pt-[60.25%]"> {/* 16:9 ratio */}
                    <iframe
                        src="https://www.youtube.com/embed/zBZgdTb-dns"
                        title="YouTube video"
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                        className="absolute top-0 left-0 h-full w-full rounded-lg"
                    ></iframe>
                </div>
            </DialogContent>
        </Dialog>
    );
}

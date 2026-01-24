"use client";

import { getSignedURL } from "@/actions/upload-to-aws";
import { useState } from "react";
import { UploadCloud, File, Loader2 } from "lucide-react";

type Props = {
    fileUploadDone: (urls: string[]) => void;
    onUploadingChange: (uploading: boolean) => void;
    types?: string
};


export default function FileDropzone({ fileUploadDone, onUploadingChange, types }: Props) {
    const [uploading, setUploading] = useState(false);
    const [uploadedCount, setUploadedCount] = useState(0);

    async function sha256(file: File): Promise<string> {
        const buffer = await file.arrayBuffer();
        const hashBuffer = await crypto.subtle.digest("SHA-256", buffer);
        return btoa(String.fromCharCode(...new Uint8Array(hashBuffer)));
    }

    async function uploadFiles(files: FileList) {
        setUploading(true);
        onUploadingChange(true);

        const urls: string[] = [];

        for (const file of Array.from(files)) {
            const checksum = await sha256(file);

            const res = await getSignedURL(
                file.type,
                file.size,
                checksum,
                file.name.replace(/[^a-zA-Z0-9.\-_]/g, "-")
            );

            if (res.success !== true) throw new Error(res.error);

            if (res.data) {
                await fetch(res.data.uploadUrl, {
                    method: "PUT",
                    body: file,
                    headers: { "Content-Type": file.type },
                });
                urls.push(res.data.publicUrl);
            }
        }

        setUploadedCount((prev) => prev + urls.length);
        fileUploadDone(urls);

        setUploading(false);
        onUploadingChange(false);
    }

    return (
        <div
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
                e.preventDefault();
                if (e.dataTransfer.files) uploadFiles(e.dataTransfer.files);
            }}
            onClick={() => document.getElementById("fileInput")?.click()}
            className="
        group relative cursor-pointer rounded-xl border-2 border-dashed 
        border-muted-foreground/30 p-8 
        transition-all duration-200
        hover:border-primary hover:bg-primary/5
        active:scale-[0.98]
        flex items-center justify-center
      "
        >
            <input
                id="fileInput"
                type="file"
                hidden
                multiple
                accept={types ? types : "image/*,.pdf,.doc,.docx,.txt"}
                onChange={(e) => e.target.files && uploadFiles(e.target.files)}
            />

            {/* Glow ring */}
            <div className="absolute inset-0 rounded-xl ring-1 ring-transparent group-hover:ring-primary/20 transition" />

            {uploading ? (
                <Loader2 className="h-7 w-7 animate-spin text-primary" />
            ) : uploadedCount > 0 ? (
                <div className="flex flex-col items-center gap-1 text-muted-foreground">
                    <File className="h-6 w-6" />
                    <span className="text-xs font-medium">({uploadedCount})</span>
                </div>
            ) : (
                <UploadCloud className="h-7 w-7 text-muted-foreground group-hover:text-primary transition" />
            )}
        </div>
    );
}

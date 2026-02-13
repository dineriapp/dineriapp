"use client";

import { getSignedURL } from "@/actions/upload-to-aws";
import { File, UploadCloud } from "lucide-react";
import { useState } from "react";

type Props = {
    fileUploadDone: (urls: string[]) => void;
    onUploadingChange: (uploading: boolean) => void;
    types?: string
};


export default function FileDropzone({ fileUploadDone, onUploadingChange, types }: Props) {
    const [uploading, setUploading] = useState(false);
    const [uploadedCount, setUploadedCount] = useState(0);
    const [progress, setProgress] = useState(0);
    const [currentFile, setCurrentFile] = useState("");
    const [totalFiles, setTotalFiles] = useState(0);

    async function sha256(file: File): Promise<string> {
        const buffer = await file.arrayBuffer();
        const hashBuffer = await crypto.subtle.digest("SHA-256", buffer);
        return btoa(String.fromCharCode(...new Uint8Array(hashBuffer)));
    }

    async function uploadFiles(files: FileList) {
        setUploading(true);
        onUploadingChange(true);
        setProgress(0);
        setTotalFiles(files.length);

        const urls: string[] = [];
        let completedFiles = 0;

        for (const file of Array.from(files)) {
            setCurrentFile(file.name);

            const checksum = await sha256(file);

            const res = await getSignedURL(
                file.type,
                file.size,
                checksum,
                file.name.replace(/[^a-zA-Z0-9.\-_]/g, "-")
            );

            if (res.success !== true) {
                setUploading(false);
                onUploadingChange(false);
                throw new Error(res.error);
            }

            if (res.data) {
                await new Promise<void>((resolve, reject) => {
                    const xhr = new XMLHttpRequest();

                    xhr.upload.onprogress = (event) => {
                        if (event.lengthComputable) {
                            const fileProgress = (event.loaded / event.total) * 100;
                            const overallProgress =
                                ((completedFiles + fileProgress / 100) / files.length) * 100;
                            setProgress(Math.round(overallProgress));
                        }
                    };

                    xhr.onload = () => {
                        if (xhr.status === 200) resolve();
                        else reject(new Error("Upload failed"));
                    };

                    xhr.onerror = () => reject(new Error("Upload failed"));

                    xhr.open("PUT", res.data.uploadUrl);
                    xhr.setRequestHeader("Content-Type", file.type);
                    xhr.send(file);
                });

                completedFiles++;
                urls.push(res.data.publicUrl);
            }
        }

        setUploadedCount((prev) => prev + urls.length);
        fileUploadDone(urls);

        setUploading(false);
        onUploadingChange(false);
        setCurrentFile("");
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
                <div className="w-full flex flex-col gap-3">
                    <div className="flex justify-between text-xs text-muted-foreground">
                        <span>Uploading {currentFile}</span>
                        <span>{progress}%</span>
                    </div>

                    <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                        <div
                            className="h-full bg-primary transition-all duration-200"
                            style={{ width: `${progress}%` }}
                        />
                    </div>

                    <div className="text-[11px] text-muted-foreground text-center">
                        {progress}% of {totalFiles} file{totalFiles > 1 ? "s" : ""}
                    </div>
                </div>
            ) : uploadedCount > 0 ? (
                <div className="flex flex-col items-center gap-1 text-muted-foreground">
                    <File className="h-6 w-6" />
                    <span className="text-xs font-medium">
                        {uploadedCount} file{uploadedCount > 1 ? "s" : ""} uploaded
                    </span>
                </div>
            ) : (
                <UploadCloud className="h-7 w-7 text-muted-foreground group-hover:text-primary transition" />
            )}

        </div>
    );
}

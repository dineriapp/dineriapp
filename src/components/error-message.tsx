import { cn } from "@/lib/utils";
import React from "react";

interface ErrorMessageProps {
    title: string;
    message: string;
    className?: string;
}

export const ErrorMessage: React.FC<ErrorMessageProps> = ({
    title,
    message,
    className,
}) => {
    return (
        <div className={cn("max-w-[1200px] mx-auto px-4 py-16", className)}>
            <div className="text-center">
                <h2 className="text-2xl font-bold text-slate-900 mb-2">{title}</h2>
                <p className="text-slate-600">{message}</p>
            </div>
        </div>
    );
};
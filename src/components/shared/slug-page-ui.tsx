import { cn } from '@/lib/utils'
import React from 'react'

interface SlugPageUiProps {
    isPreview?: boolean,
    className?: string
}

const SlugPageUi = ({ isPreview = false, className }: SlugPageUiProps) => {
    return (
        <div className={cn('w-full relative', isPreview ? "" : "min-h-screen", className)}>

        </div>
    )
}

export default SlugPageUi

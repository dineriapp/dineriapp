import React from 'react'

const Loading = () => {
    return (
        <div className='flex items-center justify-center flex-col h-screen'>
            <div className="max-w-[1200px] mx-auto flex justify-center px-4 py-16">
                <div className="flex items-center space-x-2 text-slate-500">
                    <div className="animate-spin h-5 w-5 border-2 border-teal-600 border-t-transparent rounded-full" />
                    <span>Loading restaurant...</span>
                </div>
            </div>
        </div>
    )
}

export default Loading

import React from 'react'

const VerifiedBadge = () => {
    return (
        <svg
            width={24}
            height={24}
            viewBox="0 0 24 24"
            className="inline-block align-text-bottom"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            style={{ marginBottom: "0.125em" }}
        >
            <circle cx={12} cy={12} r={10} fill="#1D9BF0" />
            <path
                d="M9.5 12.5L11 14.5L14.5 10"
                stroke="white"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </svg>

    )
}

export default VerifiedBadge

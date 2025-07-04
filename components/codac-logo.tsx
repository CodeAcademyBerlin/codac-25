import React from "react";

import { cn } from "@/lib/utils";

interface CodacLogoProps {
    /**
     * Optional text to display alongside the logo
     */
    text?: string;

    /**
     * Size variant for the logo
     */
    size?: "xs" | "sm" | "md" | "lg" | "xl" | "2xl";



    /**
     * Whether to show only the logo without text
     */
    logoOnly?: boolean;

    /**
     * Custom className for additional styling
     */
    className?: string;

    /**
     * Custom className for the text
     */
    textClassName?: string;

    /**
     * Custom className for the logo SVG
     */
    logoClassName?: string;

    /**
 * Whether to use the brand gradient colors
 */
    useGradient?: boolean;

    /**
     * Animation class for the left diamond
     */
    leftDiamondAnimation?: string;

    /**
     * Animation class for the right diamond
     */
    rightDiamondAnimation?: string;
}

const sizeConfig = {
    xs: {
        logo: "w-6 h-6",
        text: "text-sm",
    },
    sm: {
        logo: "w-8 h-8",
        text: "text-base",
    },
    md: {
        logo: "w-12 h-12",
        text: "text-lg",
    },
    lg: {
        logo: "w-16 h-16",
        text: "text-xl",
    },
    xl: {
        logo: "w-20 h-20",
        text: "text-2xl",
    },
    "2xl": {
        logo: "w-24 h-24",
        text: "text-3xl",
    },
};

export const CodacLogo: React.FC<CodacLogoProps> = ({
    text,
    size = "md",
    logoOnly = false,
    className,
    textClassName,
    logoClassName,
    useGradient = false,
    leftDiamondAnimation,
    rightDiamondAnimation,
}) => {
    const config = sizeConfig[size];
    const showText = !logoOnly && text;

    const containerClasses = cn(
        "flex items-center",
        className
    );

    const textClasses = cn(
        "font-codac-brand font-medium tracking-tight",
        config.text,
        useGradient && "bg-gradient-codac bg-clip-text text-transparent",
        textClassName
    );

    const logoClasses = cn(
        config.logo,
        logoClassName
    );

    return (
        <div className={containerClasses}>
            <div className={cn(logoClasses, "relative")}>
                <svg
                    viewBox="-60 0 800 685"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className="w-full h-full"
                >
                    {/* Left Diamond */}
                    <g id="left-diamond" className={cn("left-diamond", leftDiamondAnimation)}>
                        <path
                            d="M292.461 8L125 342.461L292.461 676.923L-42 342.461L292.461 8Z"
                            fill="url(#paint0_linear_0_1)"
                        />
                        <path
                            d="M292.461 8L125 342.461L292.461 676.923M292.461 8L-42 342.461L292.461 676.923"
                            stroke="currentColor"
                            strokeWidth="15"
                            strokeLinejoin="round"
                        />
                    </g>

                    {/* Right Diamond */}
                    <g id="right-diamond" className={cn("right-diamond", rightDiamondAnimation)}>
                        <path
                            d="M392.461 676.923L559.923 342.461L392.461 8L726.923 342.461L392.461 676.923Z"
                            fill="url(#paint1_linear_0_1)"
                        />
                        <path
                            d="M392.461 8L559.923 342.461L392.461 676.923M392.461 8L726.923 342.461L392.461 676.923"
                            stroke="currentColor"
                            strokeWidth="15"
                            strokeLinejoin="round"
                        />
                    </g>

                    {/* <line
            fill="node"
            x1="796"
            y1="345.5"
            x2="-113"
            y2="345.5"
            stroke="currentColor"
            strokeWidth="25"
          /> */}
                    <defs>
                        <linearGradient
                            id="paint0_linear_0_1"
                            x1="250.5"
                            y1="673.5"
                            x2="268"
                            y2="70.5"
                            gradientUnits="userSpaceOnUse"
                        >
                            <stop stopColor="#E77096" />
                            <stop offset="1" stopColor="#52EACE" />
                        </linearGradient>
                        <linearGradient
                            id="paint1_linear_0_1"
                            x1="250.5"
                            y1="673.5"
                            x2="268"
                            y2="70.5"
                            gradientUnits="userSpaceOnUse"
                        >
                            <stop stopColor="#E77096" />
                            <stop offset="1" stopColor="#52EACE" />
                        </linearGradient>
                    </defs>
                </svg>

                {showText && (
                    <span className={cn(
                        textClasses,
                        "absolute top-0 bottom-0 flex items-center justify-center text-center",
                        "left-[41%] right-[41%]"
                    )}>
                        {text}
                    </span>
                )}
            </div>
        </div>
    );
};

// Convenient preset components
export const CodacBrand: React.FC<Omit<CodacLogoProps, "text">> = (props) => (
    <CodacLogo text="CODAC" useGradient {...props} />
);

export const CodacBrandFull: React.FC<Omit<CodacLogoProps, "text">> = (props) => (
    <CodacLogo text="Code Academy Berlin" useGradient {...props} />
);

export default CodacLogo;

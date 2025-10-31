interface LogoProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
}

export function Logo({ size = 24, className, ...props }: LogoProps) {
  return (
    <svg
      viewBox="-60 0 800 685"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      {...props}
    >
      <g id="left-diamond" className="left-diamond">
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

      <g
        id="right-diamond"
        className="right-diamond animate-diamond-pulse"
        style={{ animationDelay: "1s" }}
      >
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
  );
}
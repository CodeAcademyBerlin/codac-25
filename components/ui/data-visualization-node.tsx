'use client';

import { PlayCircle, PauseCircle, ZoomIn, ZoomOut } from 'lucide-react';
import React, { useState, useRef } from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface DataVisualizationProps {
    type: 'line' | 'bar' | 'scatter' | 'heatmap' | 'pie';
    data?: any[];
    title?: string;
    width?: number;
    height?: number;
    className?: string;
}

// Sample data for demonstration - replace with real data in production
const generateSampleData = (type: string) => {
    switch (type) {
        case 'line':
            return Array.from({ length: 25 }, (_, i) => ({
                x: 2000 + i,
                y: Math.sin(i * 0.2) * 30 + 120 + Math.random() * 15,
                label: `${2000 + i}`,
                value: Math.round((Math.sin(i * 0.2) * 30 + 120 + Math.random() * 15) * 100) / 100,
                trend: i > 0 ? 'up' : 'neutral'
            }));
        case 'bar':
            return [
                { category: 'Python', value: 92, description: 'Data Science & ML' },
                { category: 'JavaScript', value: 88, description: 'Web Development' },
                { category: 'React', value: 85, description: 'Frontend Framework' },
                { category: 'SQL', value: 90, description: 'Database Queries' },
                { category: 'TensorFlow', value: 78, description: 'Machine Learning' },
                { category: 'Node.js', value: 82, description: 'Backend Development' },
            ];
        case 'scatter':
            return Array.from({ length: 45 }, (_, i) => {
                const x = Math.random() * 90 + 5;
                const y = Math.random() * 90 + 5;
                const categories = ['High Performance', 'Medium Performance', 'Learning'];
                const category = categories[i % 3];

                return {
                    x,
                    y,
                    size: Math.random() * 8 + 6,
                    category,
                    value: Math.round(Math.random() * 100),
                    model: `Model ${String(i + 1).padStart(2, '0')}`,
                    accuracy: Math.round((Math.random() * 0.3 + 0.7) * 100) / 100
                };
            });
        default:
            return [];
    }
};

// Interactive Tooltip Component
const Tooltip = ({ show, x, y, content, className = '' }: any) => {
    if (!show) return null;

    return (
        <div
            className={cn(
                "absolute z-50 bg-popover text-popover-foreground text-sm rounded-lg p-3 shadow-xl border border-border",
                "transform -translate-x-1/2 -translate-y-full pointer-events-none",
                "opacity-0 animate-in fade-in-0 zoom-in-95 duration-200 backdrop-blur-sm",
                show && "opacity-100",
                className
            )}
            style={{
                left: x,
                top: y - 10,
                boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
            }}
        >
            <div className="font-medium">{content.title}</div>
            <div className="text-muted-foreground">{content.subtitle}</div>
            {content.details && (
                <div className="mt-1 text-xs text-muted-foreground">
                    {content.details}
                </div>
            )}
            <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-t-popover"></div>
        </div>
    );
};

// Artistic Line Chart with dramatic visual effects
const InteractiveLineChart = ({ data, width = 500, height = 300, title }: any) => {
    const [tooltip, setTooltip] = useState({ show: false, x: 0, y: 0, content: {} });
    const [hoveredPoint, setHoveredPoint] = useState<number | null>(null);
    const [isAnimating, setIsAnimating] = useState(false);
    const [zoom, setZoom] = useState(1);
    const svgRef = useRef<SVGSVGElement>(null);

    const padding = 60;
    const chartWidth = width - padding * 2;
    const chartHeight = height - padding * 2;

    const xScale = (value: number) => padding + ((value - 2000) / 24) * chartWidth;
    const yScale = (value: number) => padding + (1 - (value - 80) / 80) * chartHeight;

    const pathData = data.map((point: any, i: number) =>
        `${i === 0 ? 'M' : 'L'} ${xScale(point.x)} ${yScale(point.y)}`
    ).join(' ');

    const handlePointHover = (event: React.MouseEvent, point: any, index: number) => {
        const rect = svgRef.current?.getBoundingClientRect();
        if (rect) {
            setTooltip({
                show: true,
                x: event.clientX - rect.left,
                y: event.clientY - rect.top,
                content: {
                    title: `${point.label}: ${point.value}°C`,
                    subtitle: `Global Temperature`,
                    details: `Year ${point.x} • ${point.value > 120 ? 'Above' : 'Below'} average`
                }
            });
            setHoveredPoint(index);
        }
    };

    const handlePointLeave = () => {
        setTooltip({ show: false, x: 0, y: 0, content: {} });
        setHoveredPoint(null);
    };

    const animateChart = () => {
        setIsAnimating(true);
        setTimeout(() => setIsAnimating(false), 2000);
    };

    return (
        <Card className="relative overflow-hidden bg-gradient-to-br from-card via-card to-card/50 border-2 shadow-2xl">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 bg-gradient-to-r from-primary/5 to-secondary/5">
                <CardTitle className="text-base font-semibold bg-gradient-to-r from-primary to-chart-1 bg-clip-text text-transparent">{title}</CardTitle>
                <div className="flex gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={animateChart}
                        disabled={isAnimating}
                        className="border-primary/20 hover:border-primary/50 transition-all duration-300"
                    >
                        {isAnimating ? <PauseCircle className="h-4 w-4" /> : <PlayCircle className="h-4 w-4" />}
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setZoom(zoom > 1 ? zoom - 0.2 : 1)}
                        className="border-primary/20 hover:border-primary/50 transition-all duration-300"
                    >
                        <ZoomOut className="h-4 w-4" />
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setZoom(zoom + 0.2)}
                        className="border-primary/20 hover:border-primary/50 transition-all duration-300"
                    >
                        <ZoomIn className="h-4 w-4" />
                    </Button>
                </div>
            </CardHeader>
            <CardContent className="p-6 bg-gradient-to-br from-background/50 to-muted/30">
                <div className="relative">
                    <svg
                        ref={svgRef}
                        width={width}
                        height={height}
                        className="overflow-visible drop-shadow-lg"
                        style={{ transform: `scale(${zoom})`, transformOrigin: 'center' }}
                    >
                        <defs>
                            {/* Dramatic gradient for line */}
                            <linearGradient id="lineGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                                <stop offset="0%" stopColor="var(--chart-1)" stopOpacity="1" />
                                <stop offset="50%" stopColor="var(--chart-1)" stopOpacity="0.6" />
                                <stop offset="100%" stopColor="var(--chart-1)" stopOpacity="0.1" />
                            </linearGradient>

                            {/* Artistic line gradient - single color with opacity variation */}
                            <linearGradient id="lineStroke" x1="0%" y1="0%" x2="100%" y2="0%">
                                <stop offset="0%" stopColor="var(--chart-1)" stopOpacity="0.8" />
                                <stop offset="50%" stopColor="var(--chart-1)" stopOpacity="1" />
                                <stop offset="100%" stopColor="var(--chart-1)" stopOpacity="0.8" />
                            </linearGradient>

                            {/* Dramatic glow effect */}
                            <filter id="dramaticGlow">
                                <feGaussianBlur stdDeviation="4" result="coloredBlur" />
                                <feColorMatrix values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 3 0" />
                                <feMerge>
                                    <feMergeNode in="coloredBlur" />
                                    <feMergeNode in="SourceGraphic" />
                                </feMerge>
                            </filter>

                            {/* Grid pattern */}
                            <pattern id="gridPattern" width="40" height="40" patternUnits="userSpaceOnUse">
                                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="var(--border)" strokeWidth="0.5" opacity="0.3" />
                            </pattern>
                        </defs>

                        {/* Artistic grid background */}
                        <rect width={width} height={height} fill="url(#gridPattern)" opacity="0.4" />

                        {/* Animated grid lines with gradient */}
                        {[0, 1, 2, 3, 4, 5].map(i => (
                            <g key={i}>
                                <line
                                    x1={padding}
                                    y1={padding + i * chartHeight / 5}
                                    x2={width - padding}
                                    y2={padding + i * chartHeight / 5}
                                    stroke="var(--border)"
                                    strokeWidth="1"
                                    strokeDasharray="8,4"
                                    opacity="0.6"
                                    className={cn(
                                        "transition-all duration-1000",
                                        isAnimating && "animate-pulse"
                                    )}
                                />
                                <line
                                    x1={padding + i * chartWidth / 5}
                                    y1={padding}
                                    x2={padding + i * chartWidth / 5}
                                    y2={height - padding}
                                    stroke="var(--border)"
                                    strokeWidth="1"
                                    strokeDasharray="8,4"
                                    opacity="0.4"
                                    className={cn(
                                        "transition-all duration-1000",
                                        isAnimating && "animate-pulse"
                                    )}
                                />
                            </g>
                        ))}

                        {/* Dramatic area fill with artistic gradient */}
                        <path
                            d={`${pathData} L ${xScale(data[data.length - 1].x)} ${height - padding} L ${xScale(data[0].x)} ${height - padding} Z`}
                            fill="url(#lineGradient)"
                            opacity="0.4"
                            className={cn(
                                "transition-all duration-1000",
                                isAnimating && "animate-pulse"
                            )}
                        />

                        {/* Main line with artistic gradient stroke and glow */}
                        <path
                            d={pathData}
                            stroke="url(#lineStroke)"
                            strokeWidth="4"
                            fill="none"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            filter="url(#dramaticGlow)"
                            className={cn(
                                "transition-all duration-500 drop-shadow-lg",
                                isAnimating && "animate-pulse"
                            )}
                        />

                        {/* Interactive data points with dramatic effects */}
                        {data.map((point: any, i: number) => {
                            const primaryColor = 'var(--chart-1)';
                            const opacity = 0.8 + (i % 3) * 0.1; // Subtle opacity variation

                            return (
                                <g key={i}>
                                    {/* Outer glow ring */}
                                    <circle
                                        cx={xScale(point.x)}
                                        cy={yScale(point.y)}
                                        r={hoveredPoint === i ? 15 : 8}
                                        fill={primaryColor}
                                        opacity={hoveredPoint === i ? 0.3 : 0.1}
                                        className="transition-all duration-300"
                                    />
                                    {/* Main point */}
                                    <circle
                                        cx={xScale(point.x)}
                                        cy={yScale(point.y)}
                                        r={hoveredPoint === i ? 8 : 5}
                                        fill={primaryColor}
                                        stroke="var(--background)"
                                        strokeWidth="3"
                                        className={cn(
                                            "cursor-pointer transition-all duration-300 hover:scale-110 drop-shadow-lg",
                                            isAnimating && "animate-bounce"
                                        )}
                                        style={{
                                            animationDelay: `${i * 50}ms`,
                                            opacity: opacity,
                                            filter: hoveredPoint === i ? `drop-shadow(0 0 12px ${primaryColor})` : ""
                                        }}
                                        onMouseEnter={(e) => handlePointHover(e, point, i)}
                                        onMouseLeave={handlePointLeave}
                                    />
                                    {/* Inner highlight */}
                                    <circle
                                        cx={xScale(point.x)}
                                        cy={yScale(point.y)}
                                        r={hoveredPoint === i ? 4 : 2}
                                        fill="var(--background)"
                                        opacity="0.8"
                                        className="pointer-events-none transition-all duration-300"
                                    />
                                </g>
                            );
                        })}

                        {/* Artistic axes with gradients */}
                        <line
                            x1={padding}
                            y1={height - padding}
                            x2={width - padding}
                            y2={height - padding}
                            stroke="url(#lineStroke)"
                            strokeWidth="3"
                            filter="url(#dramaticGlow)"
                        />
                        <line
                            x1={padding}
                            y1={padding}
                            x2={padding}
                            y2={height - padding}
                            stroke="url(#lineStroke)"
                            strokeWidth="3"
                            filter="url(#dramaticGlow)"
                        />

                        {/* Enhanced axis labels */}
                        <text x={width / 2} y={height - 20} textAnchor="middle" className="text-sm fill-muted-foreground font-bold drop-shadow">Year</text>
                        <text x={30} y={height / 2} textAnchor="middle" className="text-sm fill-muted-foreground font-bold drop-shadow" transform={`rotate(-90, 30, ${height / 2})`}>Temperature (°C)</text>
                    </svg>

                    <Tooltip {...tooltip} />
                </div>

                {/* Artistic legend with single color theme */}
                <div className="mt-6 flex flex-wrap gap-3">
                    <Badge variant="outline" className="bg-gradient-to-r from-chart-1/20 to-chart-1/10 border-chart-1/30 shadow-lg">
                        <div className="w-3 h-3 bg-chart-1 rounded-full mr-2 shadow-sm"></div>
                        Temperature Trend
                    </Badge>
                    <Badge variant="outline" className="bg-gradient-to-r from-chart-1/20 to-chart-1/10 border-chart-1/30 shadow-lg">
                        <div className="w-3 h-3 bg-chart-1 rounded-full mr-2 shadow-sm"></div>
                        {data.filter((p: any) => p.value > 120).length} years above average
                    </Badge>
                </div>
            </CardContent>
        </Card>
    );
};

// Artistic Bar Chart with dramatic color effects
const InteractiveBarChart = ({ data, width = 450, height = 300, title }: any) => {
    const [tooltip, setTooltip] = useState({ show: false, x: 0, y: 0, content: {} });
    const [hoveredBar, setHoveredBar] = useState<number | null>(null);
    const [sortBy, setSortBy] = useState<'alphabetical' | 'value'>('value');
    const svgRef = useRef<SVGSVGElement>(null);

    const padding = 60;
    const chartWidth = width - padding * 2;
    const chartHeight = height - padding * 2;

    const sortedData = [...data].sort((a, b) => {
        if (sortBy === 'alphabetical') return a.category.localeCompare(b.category);
        return b.value - a.value;
    });

    const barWidth = chartWidth / sortedData.length - 10;
    const maxValue = Math.max(...sortedData.map((d: any) => d.value));

    const handleBarHover = (event: React.MouseEvent, item: any, index: number) => {
        const rect = svgRef.current?.getBoundingClientRect();
        if (rect) {
            setTooltip({
                show: true,
                x: event.clientX - rect.left,
                y: event.clientY - rect.top,
                content: {
                    title: `${item.category}: ${item.value}%`,
                    subtitle: item.description,
                    details: `Proficiency level: ${item.value >= 90 ? 'Expert' : item.value >= 80 ? 'Advanced' : 'Intermediate'}`
                }
            });
            setHoveredBar(index);
        }
    };

    const handleBarLeave = () => {
        setTooltip({ show: false, x: 0, y: 0, content: {} });
        setHoveredBar(null);
    };

    return (
        <Card className="relative overflow-hidden bg-gradient-to-br from-card via-card to-card/50 border-2 shadow-2xl">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 bg-gradient-to-r from-primary/5 to-secondary/5">
                <CardTitle className="text-base font-semibold bg-gradient-to-r from-primary to-chart-1 bg-clip-text text-transparent">{title}</CardTitle>
                <div className="flex gap-2">
                    <Button
                        variant={sortBy === 'value' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setSortBy('value')}
                        className="transition-all duration-300 shadow-lg"
                    >
                        By Value
                    </Button>
                    <Button
                        variant={sortBy === 'alphabetical' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setSortBy('alphabetical')}
                        className="transition-all duration-300 shadow-lg"
                    >
                        A-Z
                    </Button>
                </div>
            </CardHeader>
            <CardContent className="p-6 bg-gradient-to-br from-background/50 to-muted/30">
                <div className="relative">
                    <svg ref={svgRef} width={width} height={height} className="drop-shadow-lg">
                        <defs>
                            {/* Artistic gradients for bars - single color with opacity variations */}
                            {sortedData.map((_, i: number) => {
                                const primaryColor = 'var(--chart-1)'; // Using chart-1 for bars
                                const baseOpacity = 0.9 + (i % 3) * 0.05; // Slightly higher opacity for bars

                                return (
                                    <linearGradient key={i} id={`barGradient${i}`} x1="0%" y1="0%" x2="0%" y2="100%">
                                        <stop offset="0%" stopColor={primaryColor} stopOpacity={baseOpacity} />
                                        <stop offset="50%" stopColor={primaryColor} stopOpacity={baseOpacity * 0.9} />
                                        <stop offset="100%" stopColor={primaryColor} stopOpacity={baseOpacity * 0.7} />
                                    </linearGradient>
                                );
                            })}

                            {/* Dramatic shadow filter */}
                            <filter id="barShadow">
                                <feDropShadow dx="0" dy="4" stdDeviation="8" floodColor="var(--foreground)" floodOpacity="0.3" />
                            </filter>

                            {/* Background pattern */}
                            <pattern id="barPattern" width="20" height="20" patternUnits="userSpaceOnUse">
                                <circle cx="10" cy="10" r="1" fill="var(--border)" opacity="0.1" />
                            </pattern>
                        </defs>

                        {/* Artistic background */}
                        <rect width={width} height={height} fill="url(#barPattern)" />

                        {/* Animated bars with dramatic effects */}
                        {sortedData.map((item: any, i: number) => {
                            const barHeight = (item.value / maxValue) * chartHeight;
                            const x = padding + i * (barWidth + 10);
                            const y = height - padding - barHeight;

                            return (
                                <g key={`${item.category}-${i}`}>
                                    {/* Background glow */}
                                    <rect
                                        x={x - 2}
                                        y={y - 2}
                                        width={barWidth + 4}
                                        height={barHeight + 4}
                                        fill={`url(#barGradient${i})`}
                                        opacity={hoveredBar === i ? 0.3 : 0.1}
                                        rx="8"
                                        className="transition-all duration-500"
                                    />

                                    {/* Main bar */}
                                    <rect
                                        x={x}
                                        y={y}
                                        width={barWidth}
                                        height={barHeight}
                                        fill={`url(#barGradient${i})`}
                                        rx="6"
                                        filter="url(#barShadow)"
                                        className={cn(
                                            "cursor-pointer transition-all duration-500 hover:scale-105",
                                            hoveredBar === i && "drop-shadow-2xl"
                                        )}
                                        style={{
                                            transform: hoveredBar === i ? 'translateY(-4px)' : '',
                                            filter: hoveredBar === i ? 'brightness(1.2) saturate(1.3)' : ''
                                        }}
                                        onMouseEnter={(e) => handleBarHover(e, item, i)}
                                        onMouseLeave={handleBarLeave}
                                    />

                                    {/* Highlight line */}
                                    <rect
                                        x={x + 4}
                                        y={y + 4}
                                        width={barWidth - 8}
                                        height="3"
                                        fill="var(--background)"
                                        opacity="0.6"
                                        rx="2"
                                        className="pointer-events-none"
                                    />

                                    {/* Artistic value labels */}
                                    <text
                                        x={x + barWidth / 2}
                                        y={y - 12}
                                        textAnchor="middle"
                                        className={cn(
                                            "text-sm font-bold transition-all duration-300 fill-foreground drop-shadow-sm",
                                            hoveredBar === i ? "text-lg fill-primary scale-110" : ""
                                        )}
                                        style={{
                                            filter: hoveredBar === i ? 'drop-shadow(0 0 8px var(--primary))' : ''
                                        }}
                                    >
                                        {item.value}%
                                    </text>

                                    {/* Category labels */}
                                    <text
                                        x={x + barWidth / 2}
                                        y={height - 25}
                                        textAnchor="middle"
                                        className="text-xs fill-muted-foreground font-medium"
                                        transform={`rotate(-35, ${x + barWidth / 2}, ${height - 25})`}
                                    >
                                        {item.category}
                                    </text>
                                </g>
                            );
                        })}

                        {/* Artistic axes */}
                        <line x1={padding} y1={padding} x2={padding} y2={height - padding} stroke="var(--foreground)" strokeWidth="3" filter="url(#barShadow)" />
                        <line x1={padding} y1={height - padding} x2={width - padding} y2={height - padding} stroke="var(--foreground)" strokeWidth="3" filter="url(#barShadow)" />

                        <text x={30} y={height / 2} textAnchor="middle" className="text-sm fill-muted-foreground font-bold drop-shadow" transform={`rotate(-90, 30, ${height / 2})`}>Proficiency (%)</text>
                    </svg>

                    <Tooltip {...tooltip} />
                </div>

                {/* Artistic summary with single color theme */}
                <div className="mt-6 grid grid-cols-2 gap-4 text-sm">
                    <div className="p-3 bg-gradient-to-r from-chart-1/10 to-chart-1/5 rounded-lg border border-chart-1/20 shadow-lg">
                        <span className="font-medium">Average:</span>
                        <span className="text-chart-1 font-bold ml-1">
                            {Math.round(data.reduce((a: number, b: any) => a + b.value, 0) / data.length)}%
                        </span>
                    </div>
                    <div className="p-3 bg-gradient-to-r from-chart-1/10 to-chart-1/5 rounded-lg border border-chart-1/20 shadow-lg">
                        <span className="font-medium">Top Skill:</span>
                        <span className="text-chart-1 font-bold ml-1">
                            {data.find((d: any) => d.value === maxValue)?.category}
                        </span>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};

// Artistic Scatter Plot with dramatic visual effects
const InteractiveScatterPlot = ({ data, width = 450, height = 300, title }: any) => {
    const [tooltip, setTooltip] = useState({ show: false, x: 0, y: 0, content: {} });
    const [hoveredPoint, setHoveredPoint] = useState<number | null>(null);
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
    const svgRef = useRef<SVGSVGElement>(null);

    const padding = 60;
    const chartWidth = width - padding * 2;
    const chartHeight = height - padding * 2;

    // Artistic color scheme using single color with size/opacity variations
    const primaryColor = 'var(--chart-1)'; // Using chart-1 for scatter plot
    const colors = {
        'High Performance': primaryColor,
        'Medium Performance': primaryColor,
        'Learning': primaryColor
    };

    const categories = Object.keys(colors);
    const filteredData = selectedCategory ? data.filter((d: any) => d.category === selectedCategory) : data;

    const handlePointHover = (event: React.MouseEvent, point: any, index: number) => {
        const rect = svgRef.current?.getBoundingClientRect();
        if (rect) {
            setTooltip({
                show: true,
                x: event.clientX - rect.left,
                y: event.clientY - rect.top,
                content: {
                    title: `${point.model}`,
                    subtitle: `${point.category}`,
                    details: `Accuracy: ${point.accuracy} • Score: ${point.value}`
                }
            });
            setHoveredPoint(index);
        }
    };

    const handlePointLeave = () => {
        setTooltip({ show: false, x: 0, y: 0, content: {} });
        setHoveredPoint(null);
    };

    return (
        <Card className="relative overflow-hidden bg-gradient-to-br from-card via-card to-card/50 border-2 shadow-2xl">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 bg-gradient-to-r from-primary/5 to-secondary/5">
                <CardTitle className="text-base font-semibold bg-gradient-to-r from-primary to-chart-1 bg-clip-text text-transparent">{title}</CardTitle>
                <div className="flex gap-2">
                    <Button
                        variant={selectedCategory === null ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setSelectedCategory(null)}
                        className="transition-all duration-300 shadow-lg"
                    >
                        All
                    </Button>
                    {categories.map(category => (
                        <Button
                            key={category}
                            variant={selectedCategory === category ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => setSelectedCategory(category)}
                            className="transition-all duration-300 shadow-lg"
                        >
                            {category.split(' ')[0]}
                        </Button>
                    ))}
                </div>
            </CardHeader>
            <CardContent className="p-6 bg-gradient-to-br from-background/50 to-muted/30">
                <div className="relative">
                    <svg ref={svgRef} width={width} height={height} className="drop-shadow-lg">
                        <defs>
                            {/* Artistic filters for each category - single color with variations */}
                            {categories.map((_, i) => {
                                const opacityVariation = 0.7 + (i * 0.15); // More variation for scatter plot depth

                                return (
                                    <g key={i}>
                                        <filter id={`pointShadow${i}`}>
                                            <feDropShadow dx="0" dy="2" stdDeviation="6" floodColor={primaryColor} floodOpacity="0.4" />
                                        </filter>
                                        <radialGradient id={`pointGradient${i}`} cx="30%" cy="30%">
                                            <stop offset="0%" stopColor="var(--background)" stopOpacity="0.8" />
                                            <stop offset="70%" stopColor={primaryColor} stopOpacity={opacityVariation} />
                                            <stop offset="100%" stopColor={primaryColor} stopOpacity="1" />
                                        </radialGradient>
                                    </g>
                                );
                            })}

                            {/* Background pattern */}
                            <pattern id="scatterPattern" width="30" height="30" patternUnits="userSpaceOnUse">
                                <circle cx="15" cy="15" r="1" fill="var(--border)" opacity="0.1" />
                                <circle cx="0" cy="0" r="0.5" fill="var(--border)" opacity="0.05" />
                                <circle cx="30" cy="30" r="0.5" fill="var(--border)" opacity="0.05" />
                            </pattern>
                        </defs>

                        {/* Artistic background */}
                        <rect width={width} height={height} fill="url(#scatterPattern)" />

                        {/* Enhanced grid with artistic effect */}
                        {[0, 1, 2, 3, 4, 5].map(i => (
                            <g key={i}>
                                <line
                                    x1={padding}
                                    y1={padding + i * chartHeight / 5}
                                    x2={width - padding}
                                    y2={padding + i * chartHeight / 5}
                                    stroke="var(--border)"
                                    strokeWidth="1"
                                    strokeDasharray="6,3"
                                    opacity="0.4"
                                />
                                <line
                                    x1={padding + i * chartWidth / 5}
                                    y1={padding}
                                    x2={padding + i * chartWidth / 5}
                                    y2={height - padding}
                                    stroke="var(--border)"
                                    strokeWidth="1"
                                    strokeDasharray="6,3"
                                    opacity="0.4"
                                />
                            </g>
                        ))}

                        {/* Artistic data points */}
                        {filteredData.map((point: any, i: number) => {
                            const categoryIndex = categories.indexOf(point.category);
                            // Use size variations for visual interest instead of color
                            const sizeMultiplier = point.category === 'High Performance' ? 1.2 :
                                point.category === 'Medium Performance' ? 1.0 : 0.9;
                            const pointOpacity = point.category === 'High Performance' ? 0.9 :
                                point.category === 'Medium Performance' ? 0.85 : 0.8;

                            // Ensure proper coordinate mapping for the scatter plot
                            const cx = padding + (point.x / 100) * chartWidth;
                            const cy = height - padding - (point.y / 100) * chartHeight;
                            const baseSize = Math.max(4, point.size * 0.8); // Ensure minimum size

                            return (
                                <g key={i}>
                                    {/* Outer glow ring */}
                                    <circle
                                        cx={cx}
                                        cy={cy}
                                        r={hoveredPoint === i ? baseSize * 2.0 * sizeMultiplier : baseSize * 1.3 * sizeMultiplier}
                                        fill={primaryColor}
                                        opacity={hoveredPoint === i ? 0.3 : 0.15}
                                        className="transition-all duration-500"
                                    />

                                    {/* Main point with gradient */}
                                    <circle
                                        cx={cx}
                                        cy={cy}
                                        r={hoveredPoint === i ? baseSize * 1.3 * sizeMultiplier : baseSize * sizeMultiplier}
                                        fill={`url(#pointGradient${categoryIndex})`}
                                        filter={`url(#pointShadow${categoryIndex})`}
                                        className={cn(
                                            "cursor-pointer transition-all duration-500 hover:scale-125",
                                            hoveredPoint === i && "animate-pulse"
                                        )}
                                        style={{
                                            opacity: pointOpacity,
                                            filter: hoveredPoint === i ?
                                                `url(#pointShadow${categoryIndex}) brightness(1.3) saturate(1.4)` :
                                                `url(#pointShadow${categoryIndex})`
                                        }}
                                        onMouseEnter={(e) => handlePointHover(e, point, i)}
                                        onMouseLeave={handlePointLeave}
                                    />

                                    {/* Inner highlight */}
                                    <circle
                                        cx={cx}
                                        cy={cy}
                                        r={hoveredPoint === i ? baseSize * 0.5 * sizeMultiplier : baseSize * 0.3 * sizeMultiplier}
                                        fill="var(--background)"
                                        opacity="0.9"
                                        className="pointer-events-none transition-all duration-300"
                                    />
                                </g>
                            );
                        })}

                        {/* Artistic axes */}
                        <line x1={padding} y1={height - padding} x2={width - padding} y2={height - padding} stroke="var(--foreground)" strokeWidth="3" />
                        <line x1={padding} y1={padding} x2={padding} y2={height - padding} stroke="var(--foreground)" strokeWidth="3" />

                        <text x={width / 2} y={height - 20} textAnchor="middle" className="text-sm fill-muted-foreground font-bold drop-shadow">Model Complexity</text>
                        <text x={30} y={height / 2} textAnchor="middle" className="text-sm fill-muted-foreground font-bold drop-shadow" transform={`rotate(-90, 30, ${height / 2})`}>Accuracy Score</text>
                    </svg>

                    <Tooltip {...tooltip} />
                </div>

                {/* Artistic legend with single color theme */}
                <div className="mt-6 flex flex-wrap gap-4">
                    {categories.map((category) => {
                        const sizeIndicator = category === 'High Performance' ? 'w-5 h-5' :
                            category === 'Medium Performance' ? 'w-4 h-4' : 'w-3 h-3';
                        const opacityClass = category === 'High Performance' ? 'opacity-100' :
                            category === 'Medium Performance' ? 'opacity-75' : 'opacity-60';

                        return (
                            <div key={category} className="flex items-center gap-3 p-3 bg-gradient-to-r from-chart-1/20 to-chart-1/10 rounded-lg border border-chart-1/20 shadow-lg">
                                <div className={cn("bg-chart-1 rounded-full shadow-lg", sizeIndicator, opacityClass)} />
                                <span className="text-sm font-medium">{category}</span>
                                <Badge variant="outline" className="ml-1 shadow-sm">
                                    {data.filter((d: any) => d.category === category).length}
                                </Badge>
                            </div>
                        );
                    })}
                </div>
            </CardContent>
        </Card>
    );
};

export const DataVisualizationNode = ({
    type,
    data,
    title = 'Data Visualization',
    width = 500,
    height = 300,
    className
}: DataVisualizationProps) => {
    const chartData = data || generateSampleData(type);

    const renderChart = () => {
        switch (type) {
            case 'line':
                return <InteractiveLineChart data={chartData} width={width} height={height} title={title} />;
            case 'bar':
                return <InteractiveBarChart data={chartData} width={width} height={height} title={title} />;
            case 'scatter':
                return <InteractiveScatterPlot data={chartData} width={width} height={height} title={title} />;
            default:
                return (
                    <Card>
                        <CardHeader>
                            <CardTitle>{title}</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center justify-center h-40 bg-muted rounded">
                                <p className="text-muted-foreground">Chart type not implemented</p>
                            </div>
                        </CardContent>
                    </Card>
                );
        }
    };

    return (
        <div className={cn('my-8', className)}>
            {renderChart()}
        </div>
    );
};

// Export enhanced sample charts
export const ClimateChart = () => (
    <DataVisualizationNode
        type="line"
        title="Global Temperature Trends (1880-2023)"
        width={500}
        height={300}
    />
);

export const SkillsChart = () => (
    <DataVisualizationNode
        type="bar"
        title="Technical Skills Proficiency"
        width={450}
        height={300}
    />
);

export const MLModelChart = () => (
    <DataVisualizationNode
        type="scatter"
        title="Machine Learning Model Performance"
        width={450}
        height={300}
    />
); 
'use client';

import React, { useState, useRef } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { PlayCircle, PauseCircle, ZoomIn, ZoomOut } from 'lucide-react';

interface DataVisualizationProps {
    type: 'line' | 'bar' | 'scatter' | 'heatmap' | 'pie';
    data?: any[];
    title?: string;
    width?: number;
    height?: number;
    className?: string;
}

// Enhanced mock data with more realistic values
const generateMockData = (type: string) => {
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
                { category: 'Python', value: 92, color: '#3776ab', description: 'Data Science & ML' },
                { category: 'JavaScript', value: 88, color: '#f7df1e', description: 'Web Development' },
                { category: 'React', value: 85, color: '#61dafb', description: 'Frontend Framework' },
                { category: 'SQL', value: 90, color: '#f29111', description: 'Database Queries' },
                { category: 'TensorFlow', value: 78, color: '#ff6f00', description: 'Machine Learning' },
                { category: 'Node.js', value: 82, color: '#68a063', description: 'Backend Development' },
            ];
        case 'scatter':
            return Array.from({ length: 60 }, (_, i) => ({
                x: Math.random() * 100,
                y: Math.random() * 100,
                size: Math.random() * 12 + 6,
                category: ['High Performance', 'Medium Performance', 'Learning'][Math.floor(Math.random() * 3)],
                value: Math.round(Math.random() * 100),
                model: `Model ${i + 1}`,
                accuracy: Math.round((Math.random() * 0.3 + 0.7) * 100) / 100
            }));
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
                "absolute z-50 bg-gray-900 text-white text-sm rounded-lg p-3 shadow-lg border border-gray-700",
                "transform -translate-x-1/2 -translate-y-full pointer-events-none",
                "opacity-0 animate-in fade-in-0 zoom-in-95 duration-200",
                show && "opacity-100",
                className
            )}
            style={{ left: x, top: y - 10 }}
        >
            <div className="font-medium">{content.title}</div>
            <div className="text-gray-300">{content.subtitle}</div>
            {content.details && (
                <div className="mt-1 text-xs text-gray-400">
                    {content.details}
                </div>
            )}
            <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-t-gray-900"></div>
        </div>
    );
};

// Enhanced Line Chart with interactions
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
        <Card className="relative overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-base font-semibold">{title}</CardTitle>
                <div className="flex gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={animateChart}
                        disabled={isAnimating}
                    >
                        {isAnimating ? <PauseCircle className="h-4 w-4" /> : <PlayCircle className="h-4 w-4" />}
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setZoom(zoom > 1 ? zoom - 0.2 : 1)}
                    >
                        <ZoomOut className="h-4 w-4" />
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setZoom(zoom + 0.2)}
                    >
                        <ZoomIn className="h-4 w-4" />
                    </Button>
                </div>
            </CardHeader>
            <CardContent className="p-4">
                <div className="relative">
                    <svg
                        ref={svgRef}
                        width={width}
                        height={height}
                        className="overflow-visible"
                        style={{ transform: `scale(${zoom})`, transformOrigin: 'center' }}
                    >
                        <defs>
                            <linearGradient id="lineGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                                <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.8" />
                                <stop offset="100%" stopColor="#1e40af" stopOpacity="0.1" />
                            </linearGradient>
                            <filter id="glow">
                                <feGaussianBlur stdDeviation="3" result="coloredBlur" />
                                <feMerge>
                                    <feMergeNode in="coloredBlur" />
                                    <feMergeNode in="SourceGraphic" />
                                </feMerge>
                            </filter>
                        </defs>

                        {/* Animated grid lines */}
                        {[0, 1, 2, 3, 4, 5].map(i => (
                            <line
                                key={i}
                                x1={padding}
                                y1={padding + i * chartHeight / 5}
                                x2={width - padding}
                                y2={padding + i * chartHeight / 5}
                                stroke="#e5e7eb"
                                strokeWidth="1"
                                strokeDasharray="5,5"
                                className={isAnimating ? "animate-pulse" : ""}
                            />
                        ))}

                        {/* Area fill with animation */}
                        <path
                            d={`${pathData} L ${xScale(data[data.length - 1].x)} ${height - padding} L ${xScale(data[0].x)} ${height - padding} Z`}
                            fill="url(#lineGradient)"
                            opacity="0.3"
                            className={isAnimating ? "animate-pulse" : ""}
                        />

                        {/* Main line with glow effect */}
                        <path
                            d={pathData}
                            stroke="#3b82f6"
                            strokeWidth="3"
                            fill="none"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            filter="url(#glow)"
                            className={cn(
                                "transition-all duration-300",
                                isAnimating && "animate-pulse"
                            )}
                        />

                        {/* Interactive data points */}
                        {data.map((point: any, i: number) => (
                            <circle
                                key={i}
                                cx={xScale(point.x)}
                                cy={yScale(point.y)}
                                r={hoveredPoint === i ? 8 : 5}
                                fill={hoveredPoint === i ? "#ef4444" : "#1e40af"}
                                stroke="white"
                                strokeWidth="2"
                                className={cn(
                                    "cursor-pointer transition-all duration-200 hover:scale-110",
                                    isAnimating && "animate-bounce"
                                )}
                                style={{
                                    animationDelay: `${i * 50}ms`,
                                    filter: hoveredPoint === i ? "drop-shadow(0 0 6px rgba(59, 130, 246, 0.8))" : ""
                                }}
                                onMouseEnter={(e) => handlePointHover(e, point, i)}
                                onMouseLeave={handlePointLeave}
                            />
                        ))}

                        {/* Axes */}
                        <line x1={padding} y1={height - padding} x2={width - padding} y2={height - padding} stroke="#374151" strokeWidth="2" />
                        <line x1={padding} y1={padding} x2={padding} y2={height - padding} stroke="#374151" strokeWidth="2" />

                        {/* Axis labels */}
                        <text x={width / 2} y={height - 20} textAnchor="middle" className="text-sm fill-gray-600 font-medium">Year</text>
                        <text x={30} y={height / 2} textAnchor="middle" className="text-sm fill-gray-600 font-medium" transform={`rotate(-90, 30, ${height / 2})`}>Temperature (°C)</text>
                    </svg>

                    <Tooltip {...tooltip} />
                </div>

                {/* Interactive legend */}
                <div className="mt-4 flex flex-wrap gap-2">
                    <Badge variant="outline" className="bg-blue-50">
                        <div className="w-2 h-2 bg-blue-600 rounded-full mr-2"></div>
                        Temperature Trend
                    </Badge>
                    <Badge variant="outline" className="bg-green-50">
                        <div className="w-2 h-2 bg-green-600 rounded-full mr-2"></div>
                        {data.filter((p: any) => p.value > 120).length} years above average
                    </Badge>
                </div>
            </CardContent>
        </Card>
    );
};

// Enhanced Bar Chart with interactions
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
        <Card className="relative overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-base font-semibold">{title}</CardTitle>
                <div className="flex gap-2">
                    <Button
                        variant={sortBy === 'value' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setSortBy('value')}
                    >
                        By Value
                    </Button>
                    <Button
                        variant={sortBy === 'alphabetical' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setSortBy('alphabetical')}
                    >
                        A-Z
                    </Button>
                </div>
            </CardHeader>
            <CardContent className="p-4">
                <div className="relative">
                    <svg ref={svgRef} width={width} height={height}>
                        <defs>
                            {sortedData.map((item: any, i: number) => (
                                <linearGradient key={i} id={`barGradient${i}`} x1="0%" y1="0%" x2="0%" y2="100%">
                                    <stop offset="0%" stopColor={item.color} stopOpacity="0.9" />
                                    <stop offset="100%" stopColor={item.color} stopOpacity="0.6" />
                                </linearGradient>
                            ))}
                        </defs>

                        {/* Animated bars */}
                        {sortedData.map((item: any, i: number) => {
                            const barHeight = (item.value / maxValue) * chartHeight;
                            const x = padding + i * (barWidth + 10);
                            const y = height - padding - barHeight;

                            return (
                                <g key={`${item.category}-${i}`}>
                                    <rect
                                        x={x}
                                        y={y}
                                        width={barWidth}
                                        height={barHeight}
                                        fill={`url(#barGradient${i})`}
                                        rx="6"
                                        className={cn(
                                            "cursor-pointer transition-all duration-300 hover:scale-105",
                                            hoveredBar === i && "drop-shadow-lg"
                                        )}
                                        style={{
                                            transform: hoveredBar === i ? 'translateY(-2px)' : '',
                                            filter: hoveredBar === i ? 'brightness(1.1)' : ''
                                        }}
                                        onMouseEnter={(e) => handleBarHover(e, item, i)}
                                        onMouseLeave={handleBarLeave}
                                    />

                                    {/* Animated value labels */}
                                    <text
                                        x={x + barWidth / 2}
                                        y={y - 8}
                                        textAnchor="middle"
                                        className={cn(
                                            "text-sm font-bold transition-all duration-300",
                                            hoveredBar === i ? "fill-blue-600 text-base" : "fill-gray-800"
                                        )}
                                    >
                                        {item.value}%
                                    </text>

                                    {/* Category labels */}
                                    <text
                                        x={x + barWidth / 2}
                                        y={height - 25}
                                        textAnchor="middle"
                                        className="text-xs fill-gray-600"
                                        transform={`rotate(-35, ${x + barWidth / 2}, ${height - 25})`}
                                    >
                                        {item.category}
                                    </text>
                                </g>
                            );
                        })}

                        {/* Axes */}
                        <line x1={padding} y1={padding} x2={padding} y2={height - padding} stroke="#374151" strokeWidth="2" />
                        <line x1={padding} y1={height - padding} x2={width - padding} y2={height - padding} stroke="#374151" strokeWidth="2" />

                        <text x={30} y={height / 2} textAnchor="middle" className="text-sm fill-gray-600 font-medium" transform={`rotate(-90, 30, ${height / 2})`}>Proficiency (%)</text>
                    </svg>

                    <Tooltip {...tooltip} />
                </div>

                {/* Interactive summary */}
                <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
                    <div>
                        <span className="font-medium">Average:</span> {Math.round(data.reduce((a: number, b: any) => a + b.value, 0) / data.length)}%
                    </div>
                    <div>
                        <span className="font-medium">Top Skill:</span> {data.find((d: any) => d.value === maxValue)?.category}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};

// Enhanced Scatter Plot with interactions
const InteractiveScatterPlot = ({ data, width = 450, height = 300, title }: any) => {
    const [tooltip, setTooltip] = useState({ show: false, x: 0, y: 0, content: {} });
    const [hoveredPoint, setHoveredPoint] = useState<number | null>(null);
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
    const svgRef = useRef<SVGSVGElement>(null);

    const padding = 60;
    const chartWidth = width - padding * 2;
    const chartHeight = height - padding * 2;

    const colors = {
        'High Performance': '#10b981',
        'Medium Performance': '#3b82f6',
        'Learning': '#f59e0b'
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
        <Card className="relative overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-base font-semibold">{title}</CardTitle>
                <div className="flex gap-2">
                    <Button
                        variant={selectedCategory === null ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setSelectedCategory(null)}
                    >
                        All
                    </Button>
                    {categories.map(category => (
                        <Button
                            key={category}
                            variant={selectedCategory === category ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => setSelectedCategory(category)}
                        >
                            {category.split(' ')[0]}
                        </Button>
                    ))}
                </div>
            </CardHeader>
            <CardContent className="p-4">
                <div className="relative">
                    <svg ref={svgRef} width={width} height={height}>
                        <defs>
                            {categories.map((category, i) => (
                                <filter key={i} id={`shadow${i}`}>
                                    <feDropShadow dx="2" dy="2" stdDeviation="3" floodColor={colors[category as keyof typeof colors]} floodOpacity="0.3" />
                                </filter>
                            ))}
                        </defs>

                        {/* Grid */}
                        {[0, 1, 2, 3, 4, 5].map(i => (
                            <g key={i}>
                                <line
                                    x1={padding}
                                    y1={padding + i * chartHeight / 5}
                                    x2={width - padding}
                                    y2={padding + i * chartHeight / 5}
                                    stroke="#e5e7eb"
                                    strokeWidth="1"
                                    opacity="0.5"
                                />
                                <line
                                    x1={padding + i * chartWidth / 5}
                                    y1={padding}
                                    x2={padding + i * chartWidth / 5}
                                    y2={height - padding}
                                    stroke="#e5e7eb"
                                    strokeWidth="1"
                                    opacity="0.5"
                                />
                            </g>
                        ))}

                        {/* Data points */}
                        {filteredData.map((point: any, i: number) => (
                            <circle
                                key={i}
                                cx={padding + (point.x / 100) * chartWidth}
                                cy={height - padding - (point.y / 100) * chartHeight}
                                r={hoveredPoint === i ? point.size * 1.5 : point.size}
                                fill={colors[point.category as keyof typeof colors]}
                                opacity={hoveredPoint === i ? 1 : 0.7}
                                className={cn(
                                    "cursor-pointer transition-all duration-300 hover:scale-110",
                                    hoveredPoint === i && "animate-pulse"
                                )}
                                style={{
                                    filter: hoveredPoint === i ? `url(#shadow${categories.indexOf(point.category)})` : ''
                                }}
                                onMouseEnter={(e) => handlePointHover(e, point, i)}
                                onMouseLeave={handlePointLeave}
                            />
                        ))}

                        {/* Axes */}
                        <line x1={padding} y1={height - padding} x2={width - padding} y2={height - padding} stroke="#374151" strokeWidth="2" />
                        <line x1={padding} y1={padding} x2={padding} y2={height - padding} stroke="#374151" strokeWidth="2" />

                        <text x={width / 2} y={height - 20} textAnchor="middle" className="text-sm fill-gray-600 font-medium">Model Complexity</text>
                        <text x={30} y={height / 2} textAnchor="middle" className="text-sm fill-gray-600 font-medium" transform={`rotate(-90, 30, ${height / 2})`}>Accuracy Score</text>
                    </svg>

                    <Tooltip {...tooltip} />
                </div>

                {/* Interactive legend */}
                <div className="mt-4 flex flex-wrap gap-3">
                    {categories.map(category => (
                        <div key={category} className="flex items-center gap-2">
                            <div
                                className="w-3 h-3 rounded-full"
                                style={{ backgroundColor: colors[category as keyof typeof colors] }}
                            />
                            <span className="text-sm font-medium">{category}</span>
                            <Badge variant="outline" className="ml-1">
                                {data.filter((d: any) => d.category === category).length}
                            </Badge>
                        </div>
                    ))}
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
    const chartData = data || generateMockData(type);

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
                            <div className="flex items-center justify-center h-40 bg-gray-50 rounded">
                                <p className="text-gray-500">Chart type not implemented</p>
                            </div>
                        </CardContent>
                    </Card>
                );
        }
    };

    return (
        <div className={cn('my-6', className)}>
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
'use client';

import React from 'react';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DataVisualizationNode } from '@/components/ui/data-visualization-node';
import { Separator } from '@/components/ui/separator';

// Enhanced demo page showcasing all interactive features
export const InteractiveChartsDemo = () => {
    return (
        <div className="max-w-6xl mx-auto p-6 space-y-8">
            <Card className="bg-gradient-to-r from-primary/10 to-secondary/10 border-none">
                <CardHeader className="text-center">
                    <CardTitle className="text-3xl font-bold bg-gradient-to-r from-primary to-brand bg-clip-text text-transparent">
                        🎓 Interactive Data Visualizations
                    </CardTitle>
                    <p className="text-muted-foreground mt-2">
                        Black Owls Graduation Demo - Showcasing Modern Web Development & Data Science Skills
                    </p>
                    <div className="flex justify-center gap-2 mt-4">
                        <Badge variant="secondary">React + TypeScript</Badge>
                        <Badge variant="secondary">Interactive SVG</Badge>
                        <Badge variant="secondary">Real-time Updates</Badge>
                        <Badge variant="secondary">Responsive Design</Badge>
                    </div>
                </CardHeader>
            </Card>

            {/* Interactive Features Guide */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        🎮 Interactive Features Guide
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid md:grid-cols-3 gap-6 text-sm">
                        <div>
                            <h4 className="font-semibold text-chart-1 mb-2">Hover Interactions</h4>
                            <ul className="space-y-1 text-muted-foreground">
                                <li>• Detailed tooltips with data values</li>
                                <li>• Point highlighting and scaling</li>
                                <li>• Smooth color transitions</li>
                                <li>• Glow effects and shadows</li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="font-semibold text-chart-3 mb-2">Click Controls</h4>
                            <ul className="space-y-1 text-muted-foreground">
                                <li>• Zoom in/out functionality</li>
                                <li>• Data sorting and filtering</li>
                                <li>• Animation playback</li>
                                <li>• Category selection</li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="font-semibold text-chart-5 mb-2">Visual Effects</h4>
                            <ul className="space-y-1 text-muted-foreground">
                                <li>• Gradient fills and patterns</li>
                                <li>• Bounce and pulse animations</li>
                                <li>• Dynamic legends and summaries</li>
                                <li>• Responsive scaling</li>
                            </ul>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Separator />

            {/* Line Chart Demo */}
            <div className="space-y-4">
                <div className="flex items-center gap-3">
                    <h2 className="text-2xl font-bold">📈 Climate Data Analysis</h2>
                    <Badge>Interactive Line Chart</Badge>
                </div>
                <p className="text-muted-foreground">
                    Hover over data points to see exact values, use the controls to zoom and animate the visualization.
                </p>
                <DataVisualizationNode
                    type="line"
                    title="Global Temperature Trends (1880-2024)"
                    width={700}
                    height={400}
                />
            </div>

            <Separator />

            {/* Bar Chart Demo */}
            <div className="space-y-4">
                <div className="flex items-center gap-3">
                    <h2 className="text-2xl font-bold">💻 Technical Skills Portfolio</h2>
                    <Badge>Interactive Bar Chart</Badge>
                </div>
                <p className="text-muted-foreground">
                    Click the sorting buttons to reorganize data, hover over bars for detailed proficiency information.
                </p>
                <DataVisualizationNode
                    type="bar"
                    title="Programming Languages & Frameworks Proficiency"
                    width={600}
                    height={400}
                />
            </div>

            <Separator />

            {/* Scatter Plot Demo */}
            <div className="space-y-4">
                <div className="flex items-center gap-3">
                    <h2 className="text-2xl font-bold">🤖 ML Model Performance</h2>
                    <Badge>Interactive Scatter Plot</Badge>
                </div>
                <p className="text-muted-foreground">
                    Filter by performance category, hover over points to see model details and accuracy metrics.
                </p>
                <DataVisualizationNode
                    type="scatter"
                    title="Machine Learning Model Performance Comparison"
                    width={600}
                    height={400}
                />
            </div>

            <Separator />

            {/* Implementation Showcase */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        🛠️ Implementation Highlights
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid md:grid-cols-2 gap-6">
                        <div>
                            <h4 className="font-semibold text-chart-1 mb-3">Modern React Patterns</h4>
                            <div className="space-y-2 text-sm">
                                <div className="flex items-center gap-2">
                                    <Badge variant="outline" className="text-xs">Hook</Badge>
                                    <code>useState</code> for interactive state management
                                </div>
                                <div className="flex items-center gap-2">
                                    <Badge variant="outline" className="text-xs">Hook</Badge>
                                    <code>useRef</code> for SVG element references
                                </div>
                                <div className="flex items-center gap-2">
                                    <Badge variant="outline" className="text-xs">Pattern</Badge>
                                    Event handling with coordinate calculations
                                </div>
                                <div className="flex items-center gap-2">
                                    <Badge variant="outline" className="text-xs">UX</Badge>
                                    Responsive design with Tailwind CSS
                                </div>
                            </div>
                        </div>
                        <div>
                            <h4 className="font-semibold text-chart-3 mb-3">Advanced SVG Features</h4>
                            <div className="space-y-2 text-sm">
                                <div className="flex items-center gap-2">
                                    <Badge variant="outline" className="text-xs">SVG</Badge>
                                    Gradient definitions and filters
                                </div>
                                <div className="flex items-center gap-2">
                                    <Badge variant="outline" className="text-xs">CSS</Badge>
                                    Smooth transitions and animations
                                </div>
                                <div className="flex items-center gap-2">
                                    <Badge variant="outline" className="text-xs">Math</Badge>
                                    Dynamic scaling and coordinate systems
                                </div>
                                <div className="flex items-center gap-2">
                                    <Badge variant="outline" className="text-xs">Accessibility</Badge>
                                    Proper ARIA labels and semantic markup
                                </div>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Footer */}
            <Card className="bg-gradient-to-r from-muted/50 to-primary/10 border-none">
                <CardContent className="pt-6">
                    <div className="text-center space-y-2">
                        <p className="text-muted-foreground">
                            Built with ❤️ by Code Academy Berlin - Black Owls Cohort
                        </p>
                        <div className="flex justify-center gap-4 text-sm text-muted-foreground">
                            <span>No external libraries required</span>
                            <span>•</span>
                            <span>Pure React + SVG</span>
                            <span>•</span>
                            <span>Fully responsive</span>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}; 
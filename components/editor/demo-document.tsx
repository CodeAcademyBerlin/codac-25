'use client';

import React from 'react';
import { PlateEditor } from './plate-editor';
import { dataSciencePortfolioContent } from './demo-data-science-content';
import { ClimateChart, SkillsChart, MLModelChart } from '@/components/ui/data-visualization-node';

// Enhanced content with embedded visualizations
const enhancedDataScienceContent = [
    ...dataSciencePortfolioContent.slice(0, 9), // Up to the Python code block

    // Add climate chart after the code
    {
        type: 'chart',
        chartType: 'line',
        title: 'Global Temperature Trends (1880-2023)',
        children: [{ text: '' }],
    },

    ...dataSciencePortfolioContent.slice(9, 13), // ML project section

    // Add ML performance chart
    {
        type: 'chart',
        chartType: 'scatter',
        title: 'Machine Learning Model Performance',
        children: [{ text: '' }],
    },

    ...dataSciencePortfolioContent.slice(13, 17), // Table section

    // Add skills chart before skills section
    {
        type: 'chart',
        chartType: 'bar',
        title: 'Technical Skills Proficiency',
        children: [{ text: '' }],
    },

    ...dataSciencePortfolioContent.slice(17), // Rest of content
];

interface DemoDocumentProps {
    readOnly?: boolean;
    showCharts?: boolean;
}

export const DemoDocument = ({ readOnly = true, showCharts = true }: DemoDocumentProps) => {
    return (
        <div className="w-full max-w-4xl mx-auto p-6 bg-gray-50 min-h-screen">
            <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                <div className="p-6">
                    <PlateEditor
                        initialValue={enhancedDataScienceContent}
                        readOnly={readOnly}
                    />
                </div>

                {/* Embedded Charts */}
                {showCharts && (
                    <div className="p-6 space-y-8 bg-gray-50">
                        <div className="text-center mb-8">
                            <h2 className="text-2xl font-bold text-gray-800 mb-2">
                                📊 Interactive Data Visualizations
                            </h2>
                            <p className="text-gray-600">
                                Beautiful charts and graphs showcasing data science projects
                            </p>
                        </div>

                        <div className="grid gap-8">
                            <ClimateChart />
                            <div className="grid md:grid-cols-2 gap-6">
                                <SkillsChart />
                                <MLModelChart />
                            </div>
                        </div>

                        <div className="text-center mt-8 p-6 bg-white rounded-lg border">
                            <h3 className="text-lg font-semibold mb-2">🎯 Demo Features</h3>
                            <div className="grid md:grid-cols-3 gap-4 text-sm text-gray-600">
                                <div className="p-3 bg-blue-50 rounded">
                                    <strong>Rich Editor</strong><br />
                                    AI-powered writing with ⌘+J
                                </div>
                                <div className="p-3 bg-green-50 rounded">
                                    <strong>Data Visualization</strong><br />
                                    Interactive charts & graphs
                                </div>
                                <div className="p-3 bg-purple-50 rounded">
                                    <strong>Portfolio Ready</strong><br />
                                    Professional presentation
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

// Quick Demo Component for Apple-style presentation
export const QuickDemo = () => {
    return (
        <div className="bg-gradient-to-br from-blue-50 to-indigo-100 min-h-screen p-8">
            <div className="max-w-6xl mx-auto">
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-bold text-gray-900 mb-4">
                        🎓 CODAC Platform Demo
                    </h1>
                    <p className="text-xl text-gray-700 mb-8">
                        The future of learning portfolio management
                    </p>
                    <div className="flex justify-center gap-4 text-sm">
                        <span className="px-3 py-1 bg-blue-500 text-white rounded-full">LMS</span>
                        <span className="px-3 py-1 bg-green-500 text-white rounded-full">Portfolio</span>
                        <span className="px-3 py-1 bg-purple-500 text-white rounded-full">Community</span>
                        <span className="px-3 py-1 bg-orange-500 text-white rounded-full">AI-Powered</span>
                    </div>
                </div>

                <DemoDocument readOnly={false} />
            </div>
        </div>
    );
};

export default DemoDocument; 
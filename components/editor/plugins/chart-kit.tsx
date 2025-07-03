'use client';

import { createPlatePlugin } from 'platejs/react';
import { DataVisualizationNode } from '@/components/ui/data-visualization-node';

export const ChartPlugin = createPlatePlugin({
    key: 'chart',
    node: {
        isElement: true,
        isVoid: true,
    },
}).withComponent(ChartElement);

function ChartElement({
    element,
    ...props
}: any) {
    const { chartType, title, width, height } = element;

    return (
        <div {...props.attributes} contentEditable={false}>
            {props.children}
            <DataVisualizationNode
                type={chartType || 'line'}
                title={title || 'Chart'}
                width={width || 500}
                height={height || 300}
            />
        </div>
    );
}

export const ChartKit = [ChartPlugin]; 
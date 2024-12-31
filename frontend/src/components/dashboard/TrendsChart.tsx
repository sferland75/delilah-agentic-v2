import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface TrendData {
  date: string;
  value: number;
}

interface TrendsChartProps {
  completed: TrendData[];
  pending: TrendData[];
  predicted: TrendData[];
}

export const TrendsChart: React.FC<TrendsChartProps> = ({
  completed,
  pending,
  predicted
}) => {
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  // Calculate max value for scaling
  const allValues = [...completed, ...pending, ...predicted].map(d => d.value);
  const maxValue = Math.max(...allValues);
  const chartHeight = 400;
  const chartWidth = 800;
  const padding = 40;
  const dataWidth = chartWidth - (padding * 2);
  const dataHeight = chartHeight - (padding * 2);

  // Scale values to fit in chart
  const scaleY = (value: number) => {
    return chartHeight - (value / maxValue * dataHeight) - padding;
  };

  // Create points for the line
  const createPoints = (data: TrendData[]) => {
    const step = dataWidth / (data.length - 1);
    return data.map((d, i) => ({
      x: i * step + padding,
      y: scaleY(d.value)
    }));
  };

  const completedPoints = createPoints(completed);
  const pendingPoints = createPoints(pending);
  const predictedPoints = createPoints(predicted);

  // Create SVG path
  const createPath = (points: { x: number; y: number }[]) => {
    return points.map((p, i) => (
      i === 0 ? `M ${p.x},${p.y}` : `L ${p.x},${p.y}`
    )).join(' ');
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Assessment Trends</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[400px] w-full overflow-x-auto">
          <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} className="w-full h-full">
            {/* Grid lines */}
            {Array.from({ length: 5 }, (_, i) => (
              <line
                key={i}
                x1={padding}
                y1={padding + (dataHeight / 4) * i}
                x2={chartWidth - padding}
                y2={padding + (dataHeight / 4) * i}
                stroke="#e5e7eb"
                strokeDasharray="4,4"
              />
            ))}

            {/* Y-axis labels */}
            {Array.from({ length: 5 }, (_, i) => (
              <text
                key={i}
                x={padding - 10}
                y={padding + (dataHeight / 4) * i}
                textAnchor="end"
                alignmentBaseline="middle"
                className="text-xs fill-muted-foreground"
              >
                {Math.round(maxValue - (maxValue / 4) * i)}
              </text>
            ))}

            {/* Lines */}
            <path
              d={createPath(completedPoints)}
              fill="none"
              stroke="#10b981"
              strokeWidth="2"
            />
            <path
              d={createPath(pendingPoints)}
              fill="none"
              stroke="#f59e0b"
              strokeWidth="2"
            />
            <path
              d={createPath(predictedPoints)}
              fill="none"
              stroke="#6366f1"
              strokeWidth="2"
              strokeDasharray="5,5"
            />

            {/* Legend */}
            <g transform={`translate(${padding}, ${chartHeight - 20})`}>
              <circle cx="0" cy="0" r="4" fill="#10b981" />
              <text x="10" y="0" alignmentBaseline="middle" className="text-xs">Completed</text>
              <circle cx="100" cy="0" r="4" fill="#f59e0b" />
              <text x="110" y="0" alignmentBaseline="middle" className="text-xs">Pending</text>
              <circle cx="200" cy="0" r="4" fill="#6366f1" />
              <text x="210" y="0" alignmentBaseline="middle" className="text-xs">Predicted</text>
            </g>
          </svg>
        </div>
      </CardContent>
    </Card>
  );
};

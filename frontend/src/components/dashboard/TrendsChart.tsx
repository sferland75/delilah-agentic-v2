import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import { TrendData } from '../../types/dashboard';

interface Props {
  data: TrendData[];
}

const TrendsChart: React.FC<Props> = ({ data }) => {
  return (
    <div className="bg-white p-6 rounded-lg shadow-sm">
      <h2 className="text-lg font-medium text-gray-900 mb-4">Assessment Trends</h2>
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={data}
            margin={{
              top: 20,
              right: 30,
              left: 20,
              bottom: 5,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line
              type="monotone"
              dataKey="completed"
              stroke="#10B981"
              name="Completed"
            />
            <Line
              type="monotone"
              dataKey="pending"
              stroke="#F59E0B"
              name="Pending"
            />
            {data.some(d => d.predicted !== undefined) && (
              <Line
                type="monotone"
                dataKey="predicted"
                stroke="#6366F1"
                strokeDasharray="5 5"
                name="Predicted"
              />
            )}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default TrendsChart;
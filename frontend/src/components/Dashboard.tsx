import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { mockMetrics, MockDataGenerator, mockAgentStatus } from '../mocks/mockData';
import { 
  ArrowUpIcon, 
  ArrowDownIcon, 
  ActivityIcon, 
  UsersIcon,
  ClockIcon,
  FileTextIcon
} from 'lucide-react';
import { AgentMessage } from '../types/agent';

interface MetricCardProps {
  title: string;
  value: number;
  trend: number;
  details: string;
  icon: React.ReactNode;
}

const MetricCard: React.FC<MetricCardProps> = ({ title, value, trend, details, icon }) => (
  <Card className="hover:shadow-lg transition-shadow duration-200">
    <CardHeader className="flex flex-row items-center justify-between pb-2">
      <CardTitle className="text-sm font-medium">{title}</CardTitle>
      {icon}
    </CardHeader>
    <CardContent>
      <div className="space-y-1">
        <p className="text-2xl font-bold">{value}</p>
        <div className="flex items-center space-x-2 text-sm">
          {trend > 0 ? (
            <ArrowUpIcon className="w-4 h-4 text-green-500" />
          ) : trend < 0 ? (
            <ArrowDownIcon className="w-4 h-4 text-red-500" />
          ) : null}
          {trend !== 0 && (
            <span className={trend > 0 ? "text-green-500" : "text-red-500"}>
              {Math.abs(trend)}%
            </span>
          )}
          <span className="text-muted-foreground">{details}</span>
        </div>
      </div>
    </CardContent>
  </Card>
);

const Dashboard: React.FC = () => {
  console.log('Dashboard component mounting');
  const [metrics, setMetrics] = useState(mockMetrics);
  const [lastUpdate, setLastUpdate] = useState<AgentMessage | null>(null);
  const mockDataGenerator = new MockDataGenerator();

  useEffect(() => {
    console.log('Setting up metric updates');
    mockDataGenerator.startGenerating((update) => {
      setLastUpdate(update);
      if (update.type === 'metric_update' && update.data) {
        setMetrics(prev => ({
          ...prev,
          [update.metric]: {
            ...prev[update.metric],
            value: update.data.value,
            trend: update.data.trend,
            timestamp: update.data.timestamp
          }
        }));
      }
    }, 5000);

    return () => mockDataGenerator.stopGenerating();
  }, []);

  return (
    <div className="container mx-auto p-6 space-y-8">
      <div className="space-y-2">
        <h1 className="text-4xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Monitor your assessments and client insights
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Active Clients"
          value={24}
          trend={12}
          details="This week"
          icon={<UsersIcon className="h-4 w-4 text-muted-foreground" />}
        />
        <MetricCard
          title="Pending Assessments"
          value={8}
          trend={-5}
          details="3 high priority"
          icon={<ActivityIcon className="h-4 w-4 text-muted-foreground" />}
        />
        <MetricCard
          title="Scheduled Hours"
          value={32}
          trend={8}
          details="Next week: 36"
          icon={<ClockIcon className="h-4 w-4 text-muted-foreground" />}
        />
        <MetricCard
          title="Reports Due"
          value={5}
          trend={0}
          details="2 urgent"
          icon={<FileTextIcon className="h-4 w-4 text-muted-foreground" />}
        />
      </div>

      {lastUpdate && (
        <div className="text-sm text-muted-foreground">
          Last update: {new Date(lastUpdate.type === 'metric_update' ? lastUpdate.data.timestamp : Date.now()).toLocaleTimeString()}
        </div>
      )}
    </div>
  );
};

export default Dashboard;
import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';

interface ErrorSummary {
  error_counts: Record<string, number>;
  error_timestamps: Record<string, string[]>;
}

const ErrorMonitor: React.FC = () => {
  const [errorSummary, setErrorSummary] = useState<ErrorSummary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchErrorSummary();
    const interval = setInterval(fetchErrorSummary, 60000); // Refresh every minute
    return () => clearInterval(interval);
  }, []);

  const fetchErrorSummary = async () => {
    try {
      const response = await fetch('/api/errors/summary');
      if (!response.ok) throw new Error('Failed to fetch error summary');
      const data = await response.json();
      setErrorSummary(data);
    } catch (error) {
      console.error('Error fetching error summary:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Loading error summary...</div>;
  if (!errorSummary) return <div>No error data available</div>;

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold mb-4">System Errors</h2>
      {Object.entries(errorSummary.error_counts).map(([errorType, count]) => (
        <Alert key={errorType} variant={count > 5 ? 'destructive' : 'default'}>
          <AlertTitle>{errorType}</AlertTitle>
          <AlertDescription>
            <p>Count: {count}</p>
            <p>Latest occurrences:</p>
            <ul className="list-disc pl-5 mt-2">
              {errorSummary.error_timestamps[errorType]
                .slice(0, 3)
                .map((timestamp, index) => (
                  <li key={index}>
                    {format(new Date(timestamp), 'MMM d, yyyy HH:mm:ss')}
                  </li>
                ))}
            </ul>
          </AlertDescription>
        </Alert>
      ))}
    </div>
  );
};

export default ErrorMonitor;
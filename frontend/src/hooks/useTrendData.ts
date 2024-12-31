import { useState, useEffect } from 'react';

interface TrendData {
  date: string;
  value: number;
}

function generateDates(days: number): string[] {
  const dates: string[] = [];
  const today = new Date();
  
  for (let i = days; i >= 0; i--) {
    const date = new Date();
    date.setDate(today.getDate() - i);
    dates.push(date.toISOString().split('T')[0]);
  }
  
  return dates;
}

function generateTrendData(days: number, baseValue: number, volatility: number): TrendData[] {
  const dates = generateDates(days);
  let currentValue = baseValue;
  
  return dates.map(date => {
    const change = (Math.random() - 0.5) * volatility;
    currentValue = Math.max(0, currentValue + change);
    return {
      date,
      value: Math.round(currentValue * 10) / 10
    };
  });
}

function generatePredictions(lastValue: number, days: number): TrendData[] {
  const today = new Date();
  const data: TrendData[] = [];
  let currentValue = lastValue;
  
  for (let i = 1; i <= days; i++) {
    const date = new Date();
    date.setDate(today.getDate() + i);
    
    // Add a slight upward trend with some randomness
    currentValue = currentValue * (1 + (Math.random() * 0.02));
    
    data.push({
      date: date.toISOString().split('T')[0],
      value: Math.round(currentValue * 10) / 10
    });
  }
  
  return data;
}

export function useTrendData() {
  const [trendData, setTrendData] = useState<{
    completed: TrendData[];
    pending: TrendData[];
    predicted: TrendData[];
  }>({
    completed: [],
    pending: [],
    predicted: []
  });

  useEffect(() => {
    // Generate 90 days of historical data
    const completed = generateTrendData(90, 20, 2); // Start at 20, low volatility
    const pending = generateTrendData(90, 10, 1.5); // Start at 10, medium volatility
    
    // Generate 30 days of predictions based on last completed value
    const lastCompleted = completed[completed.length - 1].value;
    const predicted = generatePredictions(lastCompleted, 30);

    setTrendData({
      completed,
      pending,
      predicted
    });
  }, []);

  return trendData;
}

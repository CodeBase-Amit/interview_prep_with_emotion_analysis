'use client';

import { useEffect, useState } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  LineElement,
  PointElement,
} from 'chart.js';
import { Bar, Line } from 'react-chartjs-2';
import { getEmotionColor } from '@/lib/utils';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend
);

interface SentimentChartProps {
  sentimentData?: SentimentData[];
  type?: 'emotions' | 'scores' | 'timeline';
}

const SentimentChart = ({ sentimentData, type = 'emotions' }: SentimentChartProps) => {
  const [chartData, setChartData] = useState<any>(null);
  const [options, setOptions] = useState<any>(null);

  useEffect(() => {
    if (!sentimentData || sentimentData.length === 0) {
      return;
    }

    if (type === 'emotions') {
      // Group by emotions and count occurrences
      const emotionCounts: Record<string, number> = {};
      sentimentData.forEach(data => {
        emotionCounts[data.emotion] = (emotionCounts[data.emotion] || 0) + 1;
      });

      // Prepare chart data
      const labels = Object.keys(emotionCounts);
      const data = Object.values(emotionCounts);
      const backgroundColor = labels.map(emotion => {
        // Extract color from the utility function
        const colorClass = getEmotionColor(emotion);
        // Convert Tailwind class to hex color
        switch (emotion) {
          case 'neutral': return '#9CA3AF'; // gray-400
          case 'happy': return '#4ADE80'; // green-400
          case 'sad': return '#60A5FA'; // blue-400
          case 'anxious': return '#FBBF24'; // yellow-400
          case 'confident': return '#A78BFA'; // purple-400
          case 'confused': return '#FB923C'; // orange-400
          case 'uncertain': return '#818CF8'; // indigo-400
          default: return '#9CA3AF'; // gray-400
        }
      });

      setChartData({
        labels,
        datasets: [
          {
            label: 'Emotion Distribution',
            data,
            backgroundColor,
            borderColor: backgroundColor.map(color => color),
            borderWidth: 1,
          },
        ],
      });

      setOptions({
        responsive: true,
        plugins: {
          legend: {
            display: false,
          },
          title: {
            display: true,
            text: 'Emotion Distribution',
            color: '#E5E7EB', // text-gray-200
          },
        },
        scales: {
          x: {
            ticks: {
              color: '#D1D5DB', // text-gray-300
            },
            grid: {
              color: '#374151', // gray-700
            },
          },
          y: {
            beginAtZero: true,
            ticks: {
              precision: 0,
              color: '#D1D5DB', // text-gray-300
            },
            grid: {
              color: '#374151', // gray-700
            },
          },
        },
      });
    } else if (type === 'scores') {
      // Use sentiment scores if available
      const hasScores = sentimentData.some(data => data.score !== undefined);
      
      if (!hasScores) {
        return;
      }

      // Get average scores for each emotion
      const emotionScores: Record<string, { total: number; count: number }> = {};
      
      sentimentData.forEach(data => {
        if (data.score !== undefined) {
          if (!emotionScores[data.emotion]) {
            emotionScores[data.emotion] = { total: 0, count: 0 };
          }
          emotionScores[data.emotion].total += data.score;
          emotionScores[data.emotion].count += 1;
        }
      });

      const labels = Object.keys(emotionScores);
      const data = Object.entries(emotionScores).map(
        ([_, { total, count }]) => (total / count) // average score
      );
      const backgroundColor = labels.map(emotion => {
        // Convert Tailwind class to hex color (same as above)
        switch (emotion) {
          case 'neutral': return '#9CA3AF'; // gray-400
          case 'happy': return '#4ADE80'; // green-400
          case 'sad': return '#60A5FA'; // blue-400
          case 'anxious': return '#FBBF24'; // yellow-400
          case 'confident': return '#A78BFA'; // purple-400
          case 'confused': return '#FB923C'; // orange-400
          case 'uncertain': return '#818CF8'; // indigo-400
          default: return '#9CA3AF'; // gray-400
        }
      });

      setChartData({
        labels,
        datasets: [
          {
            label: 'Average Sentiment Scores',
            data,
            backgroundColor,
            borderColor: backgroundColor.map(color => color),
            borderWidth: 1,
          },
        ],
      });

      setOptions({
        responsive: true,
        plugins: {
          legend: {
            display: false,
          },
          title: {
            display: true,
            text: 'Average Sentiment Scores by Emotion',
            color: '#E5E7EB', // text-gray-200
          },
        },
        scales: {
          x: {
            ticks: {
              color: '#D1D5DB', // text-gray-300
            },
            grid: {
              color: '#374151', // gray-700
            },
          },
          y: {
            beginAtZero: false,
            min: -1,
            max: 1,
            ticks: {
              color: '#D1D5DB', // text-gray-300
            },
            grid: {
              color: '#374151', // gray-700
            },
          },
        },
      });
    } else if (type === 'timeline') {
      // Timeline of emotion changes during the interview
      const timestamps = sentimentData.map(data => {
        const date = new Date(data.timestamp);
        return `${date.getHours()}:${date.getMinutes().toString().padStart(2, '0')}`;
      });
      
      // If we have scores, use those for the line
      const hasScores = sentimentData.some(data => data.score !== undefined);
      
      if (hasScores) {
        const scores = sentimentData.map(data => data.score || 0);
        const magnitudes = sentimentData.map(data => data.magnitude || 0);
        
        setChartData({
          labels: timestamps,
          datasets: [
            {
              label: 'Sentiment Score',
              data: scores,
              borderColor: '#4ADE80', // green-400
              backgroundColor: 'rgba(74, 222, 128, 0.5)',
              tension: 0.3,
            },
            {
              label: 'Magnitude',
              data: magnitudes,
              borderColor: '#FBBF24', // yellow-400
              backgroundColor: 'rgba(251, 191, 36, 0.5)',
              tension: 0.3,
            },
          ],
        });
      } else {
        // Use confidence as a proxy
        const confidences = sentimentData.map(data => data.confidence);
        
        setChartData({
          labels: timestamps,
          datasets: [
            {
              label: 'Confidence Level',
              data: confidences,
              borderColor: '#60A5FA', // blue-400
              backgroundColor: 'rgba(96, 165, 250, 0.5)',
              tension: 0.3,
            },
          ],
        });
      }
      
      setOptions({
        responsive: true,
        plugins: {
          legend: {
            position: 'top' as const,
            labels: {
              color: '#E5E7EB', // text-gray-200
            },
          },
          title: {
            display: true,
            text: 'Sentiment Timeline During Interview',
            color: '#E5E7EB', // text-gray-200
          },
        },
        scales: {
          x: {
            ticks: {
              color: '#D1D5DB', // text-gray-300
            },
            grid: {
              color: '#374151', // gray-700
            },
          },
          y: {
            ticks: {
              color: '#D1D5DB', // text-gray-300
            },
            grid: {
              color: '#374151', // gray-700
            },
          },
        },
      });
    }
  }, [sentimentData, type]);

  if (!chartData || !options || !sentimentData || sentimentData.length === 0) {
    return (
      <div className="flex items-center justify-center h-48 bg-gray-800 rounded-lg">
        <p className="text-gray-400">No sentiment data available</p>
      </div>
    );
  }

  if (type === 'timeline') {
    return <Line options={options} data={chartData} />;
  }

  return <Bar options={options} data={chartData} />;
};

export default SentimentChart; 
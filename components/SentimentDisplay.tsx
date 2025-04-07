'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { getEmotionIcon, getEmotionColor } from '@/lib/utils';
import SentimentChart from './SentimentChart';

interface SentimentDisplayProps {
  sentimentData?: SentimentData[];
  showDetailed?: boolean;
}

const SentimentDisplay = ({ sentimentData, showDetailed = false }: SentimentDisplayProps) => {
  const [dominantEmotion, setDominantEmotion] = useState<string>('neutral');
  
  useEffect(() => {
    if (!sentimentData || sentimentData.length === 0) {
      setDominantEmotion('neutral');
      return;
    }
    
    // Calculate the most frequent emotion
    const emotionCounts: Record<string, number> = {};
    
    sentimentData.forEach(data => {
      emotionCounts[data.emotion] = (emotionCounts[data.emotion] || 0) + 1;
    });
    
    // Find the emotion with the highest count
    let maxCount = 0;
    let maxEmotion = 'neutral';
    
    Object.entries(emotionCounts).forEach(([emotion, count]) => {
      if (count > maxCount) {
        maxCount = count;
        maxEmotion = emotion;
      }
    });
    
    setDominantEmotion(maxEmotion);
  }, [sentimentData]);

  // If there's no sentiment data, show a default neutral state
  if (!sentimentData || sentimentData.length === 0) {
    return (
      <div className="flex items-center gap-2">
        <Image 
          src="/emotions/neutral.svg" 
          alt="Neutral" 
          width={24} 
          height={24} 
          className="object-contain"
        />
        <span className="text-sm">No emotion data</span>
      </div>
    );
  }

  // Simple view for the interview card
  if (!showDetailed) {
    return (
      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-2">
          <Image 
            src={getEmotionIcon(dominantEmotion)} 
            alt={dominantEmotion} 
            width={24} 
            height={24} 
            className="object-contain"
          />
          <span className="text-sm capitalize">{dominantEmotion}</span>
        </div>
        <div className="h-32">
          <SentimentChart sentimentData={sentimentData} type="emotions" />
        </div>
      </div>
    );
  }

  // Detailed view for the interview feedback page
  return (
    <div className="w-full">
      <h3 className="text-lg font-medium mb-3">Emotional Analysis</h3>
      
      <div className="flex flex-col gap-6">
        <div className="flex items-center gap-2 mb-2">
          <Image 
            src={getEmotionIcon(dominantEmotion)} 
            alt={dominantEmotion} 
            width={32} 
            height={32} 
            className="object-contain"
          />
          <span className="text-base font-medium capitalize">Dominant emotion: {dominantEmotion}</span>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-gray-800 p-4 rounded-lg">
            <h4 className="text-base mb-3">Emotion Distribution</h4>
            <SentimentChart sentimentData={sentimentData} type="emotions" />
          </div>
          
          {sentimentData.some(data => data.score !== undefined) && (
            <div className="bg-gray-800 p-4 rounded-lg">
              <h4 className="text-base mb-3">Average Sentiment Scores</h4>
              <SentimentChart sentimentData={sentimentData} type="scores" />
            </div>
          )}
          
          <div className="bg-gray-800 p-4 rounded-lg md:col-span-2">
            <h4 className="text-base mb-3">Sentiment Timeline</h4>
            <SentimentChart sentimentData={sentimentData} type="timeline" />
          </div>
        </div>
        
        <div className="flex flex-wrap gap-2 mt-3">
          <h4 className="w-full text-base mb-2">Detected Emotions:</h4>
          {sentimentData.map((data, index) => (
            <div 
              key={index} 
              className={`rounded-full px-3 py-1 text-xs flex items-center gap-1 ${getEmotionColor(data.emotion)} text-white`}
              title={data.transcript}
            >
              <Image 
                src={getEmotionIcon(data.emotion)} 
                alt={data.emotion} 
                width={16} 
                height={16} 
                className="object-contain"
              />
              <span className="capitalize">{data.emotion}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SentimentDisplay; 
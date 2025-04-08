'use client';

import React from 'react';
import { SpeechAnalysisResult } from '@/lib/speech-analysis';
import Image from 'next/image';
import { getEmotionIcon } from '@/lib/utils';

// SVG Icons for visual indicators
const PaceIcon = ({ type }: { type: 'too_slow' | 'good' | 'too_fast' }) => {
  if (type === 'good') {
    return (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="12" cy="12" r="10" stroke="#4CAF50" strokeWidth="2" />
        <path d="M8 12L11 15L16 9" stroke="#4CAF50" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  } else if (type === 'too_slow') {
    return (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="12" cy="12" r="10" stroke="#2196F3" strokeWidth="2" />
        <path d="M12 8V16M9 12H15" stroke="#2196F3" strokeWidth="2" strokeLinecap="round" />
      </svg>
    );
  } else {
    return (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="12" cy="12" r="10" stroke="#FF9800" strokeWidth="2" />
        <path d="M12 8V12M12 16V16.01" stroke="#FF9800" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  }
};

const EmotionIcon = ({ type }: { type: string }) => {
  // Simple mapping of emotions to basic emoji-like icons
  switch (type.toLowerCase()) {
    case 'happy':
    case 'confident':
      return (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="12" cy="12" r="10" stroke="#4CAF50" strokeWidth="2" />
          <path d="M8 13C8 13 9.5 15 12 15C14.5 15 16 13 16 13" stroke="#4CAF50" strokeWidth="2" strokeLinecap="round" />
          <circle cx="9" cy="9" r="1" fill="#4CAF50" />
          <circle cx="15" cy="9" r="1" fill="#4CAF50" />
        </svg>
      );
    case 'neutral':
      return (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="12" cy="12" r="10" stroke="#9E9E9E" strokeWidth="2" />
          <path d="M8 13H16" stroke="#9E9E9E" strokeWidth="2" strokeLinecap="round" />
          <circle cx="9" cy="9" r="1" fill="#9E9E9E" />
          <circle cx="15" cy="9" r="1" fill="#9E9E9E" />
        </svg>
      );
    case 'anxious':
    case 'nervous':
      return (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="12" cy="12" r="10" stroke="#FF9800" strokeWidth="2" />
          <path d="M8 15C8 15 9.5 13 12 13C14.5 13 16 15 16 15" stroke="#FF9800" strokeWidth="2" strokeLinecap="round" />
          <circle cx="9" cy="9" r="1" fill="#FF9800" />
          <circle cx="15" cy="9" r="1" fill="#FF9800" />
        </svg>
      );
    case 'uncertain':
    case 'confused':
      return (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="12" cy="12" r="10" stroke="#F44336" strokeWidth="2" />
          <path d="M9 10C9 10 9.5 8 12 8C14.5 8 15 10 15 10" stroke="#F44336" strokeWidth="2" strokeLinecap="round" />
          <path d="M12 13V15M12 17V17.01" stroke="#F44336" strokeWidth="2" strokeLinecap="round" />
        </svg>
      );
    default:
      return (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="12" cy="12" r="10" stroke="#9E9E9E" strokeWidth="2" />
          <circle cx="9" cy="9" r="1" fill="#9E9E9E" />
          <circle cx="15" cy="9" r="1" fill="#9E9E9E" />
          <path d="M9 15L15 15" stroke="#9E9E9E" strokeWidth="2" strokeLinecap="round" />
        </svg>
      );
  }
};

interface SpeechFeedbackProps {
  analysis: SpeechAnalysisResult;
  onDismiss: () => void;
}

export const SpeechFeedback: React.FC<SpeechFeedbackProps> = ({ analysis, onDismiss }) => {
  const { fillerWords, pace, sentiment, feedback, transcript } = analysis;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 my-4 mx-auto max-w-3xl">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100">Speech Analysis</h3>
        <button 
          onClick={onDismiss}
          className="text-gray-400 hover:text-gray-500 dark:text-gray-500 dark:hover:text-gray-400"
        >
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd"></path>
          </svg>
        </button>
      </div>
      
      {transcript && (
        <div className="mb-4">
          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Your Response:</h4>
          <p className="text-sm text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-700 p-3 rounded-md">
            {transcript}
          </p>
        </div>
      )}

      <div className="grid grid-cols-3 gap-4 mb-4">
        <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-md flex flex-col items-center">
          <div className="mb-1">
            <PaceIcon type={pace.status} />
          </div>
          <div className="text-xs font-medium text-gray-700 dark:text-gray-300">Speaking Pace</div>
          <div className="text-sm text-gray-600 dark:text-gray-400">{Math.round(pace.wordsPerMinute)} words/min</div>
        </div>
        
        <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-md flex flex-col items-center">
          <div className="text-2xl mb-1">
            {fillerWords.count}
          </div>
          <div className="text-xs font-medium text-gray-700 dark:text-gray-300">Filler Words</div>
          <div className="text-xs text-gray-600 dark:text-gray-400 truncate max-w-full">
            {fillerWords.instances.length > 0 
              ? fillerWords.instances.slice(0, 3).join(', ') 
              : 'None detected'}
          </div>
        </div>
        
        <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-md flex flex-col items-center">
          <div className="mb-1">
            <EmotionIcon type={sentiment} />
          </div>
          <div className="text-xs font-medium text-gray-700 dark:text-gray-300">Emotion</div>
          <div className="text-sm text-gray-600 dark:text-gray-400 capitalize">{sentiment}</div>
        </div>
      </div>
      
      <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-md">
        <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Feedback:</h4>
        <ul className="space-y-2">
          {feedback.map((item, index) => (
            <li key={index} className="text-sm flex items-start">
              <svg className="text-blue-500 w-4 h-4 mt-0.5 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2h-1V9a1 1 0 00-1-1z" clipRule="evenodd"></path>
              </svg>
              <span className="text-gray-600 dark:text-gray-400">{item}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default SpeechFeedback; 
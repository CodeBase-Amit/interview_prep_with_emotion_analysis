'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { getEmotionIcon, getEmotionColor } from '@/lib/utils';

interface SentimentScore {
  score: number;
  emotion: string;
  confidence: number;
}

interface SpeechAnalysis {
  fillerWords: {
    total: number;
    details: Record<string, number>;
  };
  wordCount: number;
  clarity: string;
  tone: string;
  avgWordsPerSentence: number;
}

interface QuestionAnswerFeedbackProps {
  questionNumber: number;
  question: string;
  answer: string;
  sentimentScore: SentimentScore | null;
  speechAnalysis?: SpeechAnalysis;
  idealAnswer?: string;
}

/**
 * Component to display a question, answer, and detailed feedback in the feedback report
 */
const QuestionAnswerFeedback: React.FC<QuestionAnswerFeedbackProps> = ({
  questionNumber,
  question,
  answer,
  sentimentScore,
  speechAnalysis,
  idealAnswer
}) => {
  const [showIdealAnswer, setShowIdealAnswer] = useState(false);
  
  // Format sentiment score for display
  const formattedScore = sentimentScore?.score ? 
    (sentimentScore.score * 100).toFixed(0) : 'N/A';
  
  // Get background color class based on score
  const getScoreColorClass = (score: number) => {
    if (score >= 0.7) return 'bg-green-500';
    if (score >= 0.4) return 'bg-blue-500';
    if (score >= 0) return 'bg-yellow-500';
    if (score >= -0.4) return 'bg-orange-500';
    return 'bg-red-500';
  };
  
  // Get color for clarity rating
  const getClarityColor = (clarity: string) => {
    switch (clarity) {
      case 'good': return 'text-green-400';
      case 'verbose': return 'text-yellow-400';
      case 'choppy': return 'text-orange-400';
      default: return 'text-gray-400';
    }
  };
  
  // Get color for tone
  const getToneColor = (tone: string) => {
    switch (tone) {
      case 'confident': return 'text-green-400';
      case 'formal': return 'text-blue-400';
      case 'casual': return 'text-yellow-400';
      case 'uncertain': return 'text-orange-400';
      default: return 'text-gray-400';
    }
  };

  return (
    <div className="bg-dark-200 p-4 rounded-lg">
      <div className="flex justify-between items-center mb-3">
        <h3 className="text-lg font-medium">Question {questionNumber}</h3>
        
        {sentimentScore && (
          <div className="flex items-center gap-2">
            <div className="flex items-center bg-dark-300 px-3 py-1 rounded-full">
              <Image 
                src={getEmotionIcon(sentimentScore.emotion)} 
                alt={sentimentScore.emotion} 
                width={16} 
                height={16} 
                className="mr-1"
              />
              <span className="text-xs capitalize mr-1">{sentimentScore.emotion}</span>
              <span 
                className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                  sentimentScore.score ? getScoreColorClass(sentimentScore.score) : 'bg-gray-500'
                }`}
              >
                {formattedScore}
              </span>
            </div>
          </div>
        )}
      </div>
      
      {/* Question */}
      <div className="mb-4">
        <div className="bg-dark-300 p-3 rounded-lg mb-2">
          <p className="text-primary-200 font-medium">Q: {question}</p>
        </div>
        
        {/* Your Answer */}
        <div className="bg-dark-300 p-3 rounded-lg">
          <p className="text-light-100">A: {answer || 'No answer provided'}</p>
        </div>
      </div>
      
      {/* Speech Analysis Section */}
      {speechAnalysis && (
        <div className="mt-4 bg-dark-300 p-3 rounded-lg">
          <h4 className="text-sm font-medium mb-2 text-primary-200">Speech Analysis</h4>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs mb-3">
            {/* Word Count */}
            <div className="flex items-center">
              <span className="text-light-300 mr-2">Words:</span>
              <span className="font-medium">{speechAnalysis.wordCount}</span>
            </div>
            
            {/* Clarity */}
            <div className="flex items-center">
              <span className="text-light-300 mr-2">Clarity:</span>
              <span className={`font-medium capitalize ${getClarityColor(speechAnalysis.clarity)}`}>
                {speechAnalysis.clarity}
              </span>
            </div>
            
            {/* Tone */}
            <div className="flex items-center">
              <span className="text-light-300 mr-2">Tone:</span>
              <span className={`font-medium capitalize ${getToneColor(speechAnalysis.tone)}`}>
                {speechAnalysis.tone}
              </span>
            </div>
          </div>
          
          {/* Filler Words */}
          {speechAnalysis.fillerWords.total > 0 && (
            <div className="mt-2">
              <div className="flex items-center mb-1">
                <span className="text-xs text-light-300 mr-2">Filler Words:</span>
                <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                  speechAnalysis.fillerWords.total > 5 ? 'bg-red-500/30' : 
                  speechAnalysis.fillerWords.total > 2 ? 'bg-yellow-500/30' : 'bg-green-500/30'
                }`}>
                  {speechAnalysis.fillerWords.total}
                </span>
              </div>
              
              <div className="flex flex-wrap gap-1">
                {Object.entries(speechAnalysis.fillerWords.details).map(([word, count]) => (
                  <span 
                    key={word} 
                    className="text-xs bg-dark-400 px-2 py-0.5 rounded-full"
                  >
                    "{word}" × {count}
                  </span>
                ))}
              </div>
            </div>
          )}
          
          {/* Sentence Structure */}
          <div className="mt-2 text-xs">
            <span className="text-light-300">Avg words per sentence:</span>{' '}
            <span className={`font-medium ${
              speechAnalysis.avgWordsPerSentence > 25 ? 'text-yellow-400' :
              speechAnalysis.avgWordsPerSentence < 5 ? 'text-yellow-400' : 'text-green-400'
            }`}>
              {speechAnalysis.avgWordsPerSentence.toFixed(1)}
            </span>
          </div>
        </div>
      )}
      
      {/* Ideal Answer Section */}
      {idealAnswer && (
        <div className="mt-4">
          <button
            onClick={() => setShowIdealAnswer(!showIdealAnswer)}
            className="w-full flex items-center justify-between bg-primary-200/10 hover:bg-primary-200/20 text-primary-200 p-2 rounded-lg transition-colors text-sm font-medium"
          >
            <span>{showIdealAnswer ? 'Hide Ideal Answer' : 'Show Ideal Answer'}</span>
            <svg 
              className={`w-4 h-4 transition-transform ${showIdealAnswer ? 'rotate-180' : ''}`}
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          
          {showIdealAnswer && (
            <div className="mt-2 bg-primary-200/5 border border-primary-200/20 p-3 rounded-lg">
              <h4 className="text-sm font-medium mb-2 text-primary-200">Ideal Answer:</h4>
              <p className="text-sm text-light-100">{idealAnswer}</p>
            </div>
          )}
        </div>
      )}
      
      {/* Confidence Score */}
      {sentimentScore && (
        <div className="text-xs text-light-300 mt-3">
          <p>Confidence: {(sentimentScore.confidence * 100).toFixed(0)}%</p>
        </div>
      )}
    </div>
  );
};

export default QuestionAnswerFeedback; 
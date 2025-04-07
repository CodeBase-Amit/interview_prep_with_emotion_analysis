import Sentiment from 'sentiment';

export interface SentimentResult {
  score: number;      // -1.0 (negative) to 1.0 (positive)
  magnitude: number;  // 0.0 to +inf (intensity)
  emotion: string;    // mapped emotion
  confidence: number; // confidence level
}

const sentiment = new Sentiment();

/**
 * Analyze sentiment of text using the sentiment.js library (local, no API calls)
 */
export function analyzeSentimentLocal(text: string): SentimentResult {
  // Get raw sentiment analysis
  const result = sentiment.analyze(text);
  
  // Calculate normalized score between -1 and 1
  // Comparative score is already normalized by word count
  const normalizedScore = Math.max(-1, Math.min(1, result.comparative));
  
  // Use the absolute score as a rough proxy for magnitude (intensity)
  // Multiply by 2 to better match Google NLP's scale (roughly 0-2)
  const magnitude = Math.min(2, Math.abs(normalizedScore) * 2);
  
  // Map scores to emotions
  let emotion = 'neutral';
  
  if (normalizedScore >= 0.5) {
    emotion = 'happy';
  } else if (normalizedScore >= 0.25) {
    emotion = 'confident';
  } else if (normalizedScore > -0.25) {
    emotion = 'neutral';
  } else if (normalizedScore > -0.5) {
    emotion = 'uncertain';
  } else {
    emotion = 'sad';
  }
  
  // Calculate confidence level (0.5-1.0)
  // Higher absolute scores = higher confidence
  const confidence = 0.5 + Math.min(0.5, Math.abs(normalizedScore) * 0.5);
  
  // Add extra confidence for stronger signals
  const positiveWords = result.positive.length;
  const negativeWords = result.negative.length;
  const wordBoost = Math.min(0.2, (positiveWords + negativeWords) * 0.05);
  
  return {
    score: normalizedScore,
    magnitude,
    emotion,
    confidence: Math.min(1.0, confidence + wordBoost)
  };
}

/**
 * Enriches sentiment analysis with more detailed emotion detection
 * based on keyword matching
 */
export function enrichSentimentAnalysis(text: string, basicResult: SentimentResult): SentimentResult {
  const lowerText = text.toLowerCase();
  
  // Check for specific emotional markers
  if (
    lowerText.includes('anxious') || 
    lowerText.includes('nervous') || 
    lowerText.includes('worried') ||
    lowerText.includes('stress') ||
    lowerText.includes('afraid')
  ) {
    return { ...basicResult, emotion: 'anxious' };
  }
  
  if (
    lowerText.includes('confused') || 
    lowerText.includes('not sure') || 
    lowerText.includes('don\'t understand') ||
    lowerText.includes('difficult to') ||
    lowerText.includes('unclear')
  ) {
    return { ...basicResult, emotion: 'confused' };
  }
  
  if (
    lowerText.includes('confident') || 
    lowerText.includes('certain') || 
    lowerText.includes('definitely') ||
    lowerText.includes('absolutely') ||
    lowerText.includes('i know')
  ) {
    return { ...basicResult, emotion: 'confident', confidence: Math.min(1.0, basicResult.confidence + 0.1) };
  }
  
  return basicResult;
}

/**
 * Combined sentiment analysis function that uses sentiment.js with 
 * additional emotion detection
 */
export function analyzeSentiment(text: string): SentimentResult {
  const basicResult = analyzeSentimentLocal(text);
  return enrichSentimentAnalysis(text, basicResult);
} 
export interface SpeechAnalysisResult {
  fillerWords: {
    count: number;
    instances: string[];
  };
  pace: {
    wordsPerMinute: number;
    status: 'too_slow' | 'good' | 'too_fast';
  };
  pauses: number;
  sentiment: string;
  feedback: string[];
  transcript: string;
}

const FILLER_WORDS = [
  'um', 'uh', 'like', 'you know', 'so', 'actually', 'basically',
  'literally', 'i mean', 'sort of', 'kind of', 'i guess', 'right'
];

// Ideal speaking pace range (words per minute)
const IDEAL_PACE_MIN = 130;
const IDEAL_PACE_MAX = 160;

/**
 * Analyzes speech for filler words, pace, and other metrics
 * @param text The transcript text to analyze
 * @param durationMs The duration of the speech in milliseconds
 */
export function analyzeSpeech(text: string, durationMs: number, sentiment: string): SpeechAnalysisResult {
  const words = text.trim().split(/\s+/);
  const wordCount = words.length;
  
  // Find filler words
  const fillerWords = {
    count: 0,
    instances: [] as string[]
  };
  
  const lowerText = text.toLowerCase();
  FILLER_WORDS.forEach(filler => {
    // Use regex to find all instances
    const regex = new RegExp(`\\b${filler}\\b`, 'gi');
    const matches = lowerText.match(regex);
    
    if (matches) {
      fillerWords.count += matches.length;
      fillerWords.instances.push(...matches);
    }
  });
  
  // Calculate pace (words per minute)
  const durationMinutes = durationMs / 60000;
  const wordsPerMinute = wordCount / durationMinutes;
  
  let paceStatus: 'too_slow' | 'good' | 'too_fast' = 'good';
  if (wordsPerMinute < IDEAL_PACE_MIN) {
    paceStatus = 'too_slow';
  } else if (wordsPerMinute > IDEAL_PACE_MAX) {
    paceStatus = 'too_fast';
  }
  
  // Count pauses (rough estimate based on punctuation)
  const pauseMatches = text.match(/[.,;:?!]\s/g);
  const pauses = pauseMatches ? pauseMatches.length : 0;
  
  // Generate feedback based on analysis
  const feedback: string[] = [];
  
  // Filler words feedback
  if (fillerWords.count > 0) {
    const fillerPct = (fillerWords.count / wordCount) * 100;
    
    if (fillerPct > 10) {
      feedback.push(`You used ${fillerWords.count} filler words (${fillerPct.toFixed(1)}% of speech). Try to reduce words like "${fillerWords.instances.slice(0, 3).join('", "')}" by pausing instead.`);
    } else if (fillerPct > 5) {
      feedback.push(`You used ${fillerWords.count} filler words. Try to be more direct in your responses.`);
    }
  }
  
  // Pace feedback
  if (paceStatus === 'too_fast') {
    feedback.push(`You're speaking quite fast (${Math.round(wordsPerMinute)} words/min). Try slowing down to sound more confident.`);
  } else if (paceStatus === 'too_slow') {
    feedback.push(`Your pace is a bit slow (${Math.round(wordsPerMinute)} words/min). Try to be more concise.`);
  }
  
  // Pauses feedback
  if (wordCount > 30 && pauses < 2) {
    feedback.push("Try adding more pauses in your speech to emphasize key points.");
  }
  
  // Sentiment/emotion feedback
  if (sentiment === 'anxious') {
    feedback.push("You seem a bit anxious. Take a deep breath before responding to the next question.");
  } else if (sentiment === 'uncertain') {
    feedback.push("Your response sounds uncertain. Try using more confident language.");
  } else if (sentiment === 'confused') {
    feedback.push("You sound confused. It's okay to ask for clarification if you don't understand the question.");
  }
  
  // If no specific feedback, give general encouragement
  if (feedback.length === 0) {
    if (sentiment === 'confident' || sentiment === 'happy') {
      feedback.push("Great job! You sound confident and engaged.");
    } else {
      feedback.push("Your response is clear. Keep maintaining good communication.");
    }
  }
  
  return {
    fillerWords,
    pace: {
      wordsPerMinute,
      status: paceStatus
    },
    pauses,
    sentiment,
    feedback,
    transcript: text
  };
} 
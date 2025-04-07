import { interviewCovers, mappings } from "@/constants";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const techIconBaseURL = "https://cdn.jsdelivr.net/gh/devicons/devicon/icons";

const normalizeTechName = (tech: string) => {
  const key = tech.toLowerCase().replace(/\.js$/, "").replace(/\s+/g, "");
  return mappings[key as keyof typeof mappings];
};

const checkIconExists = async (url: string) => {
  try {
    const response = await fetch(url, { method: "HEAD" });
    return response.ok; // Returns true if the icon exists
  } catch {
    return false;
  }
};

export const getTechLogos = async (techArray: string[]) => {
  const logoURLs = techArray.map((tech) => {
    const normalized = normalizeTechName(tech);
    return {
      tech,
      url: `${techIconBaseURL}/${normalized}/${normalized}-original.svg`,
    };
  });

  const results = await Promise.all(
      logoURLs.map(async ({ tech, url }) => ({
        tech,
        url: (await checkIconExists(url)) ? url : "/tech.svg",
      }))
  );

  return results;
};

export const getRandomInterviewCover = () => {
  const randomIndex = Math.floor(Math.random() * interviewCovers.length);
  return `/covers${interviewCovers[randomIndex]}`;
};

// Sentiment analysis utility function
export const analyzeSentiment = async (text: string): Promise<{ emotion: string; confidence: number }> => {
  try {
    // Basic emotions mapping
    const emotions = ['neutral', 'happy', 'sad', 'anxious', 'confident', 'confused', 'uncertain'];
    
    // For a real implementation, you would use a proper NLP API like Google's Natural Language API,
    // Microsoft Azure Text Analytics, or IBM Watson Tone Analyzer
    
    // This is a placeholder implementation that randomly selects an emotion based on keywords
    let selectedEmotion = 'neutral';
    let confidence = 0.6;
    
    const lowerText = text.toLowerCase();
    
    // Simple keyword-based emotion detection
    if (lowerText.includes('excited') || lowerText.includes('great') || lowerText.includes('happy')) {
      selectedEmotion = 'happy';
      confidence = 0.75;
    } else if (lowerText.includes('sorry') || lowerText.includes('unfortunately')) {
      selectedEmotion = 'sad';
      confidence = 0.7;
    } else if (lowerText.includes('i think') || lowerText.includes('maybe') || lowerText.includes('perhaps')) {
      selectedEmotion = 'uncertain';
      confidence = 0.8;
    } else if (lowerText.includes('i know') || lowerText.includes('definitely') || lowerText.includes('absolutely')) {
      selectedEmotion = 'confident';
      confidence = 0.85;
    } else if (lowerText.includes('worry') || lowerText.includes('concern') || lowerText.includes('nervous')) {
      selectedEmotion = 'anxious';
      confidence = 0.75;
    } else if (lowerText.includes('not sure') || lowerText.includes('don\'t understand')) {
      selectedEmotion = 'confused';
      confidence = 0.7;
    }
    
    return { emotion: selectedEmotion, confidence };
  } catch (error) {
    console.error('Error analyzing sentiment:', error);
    return { emotion: 'neutral', confidence: 0.5 };
  }
};

// Helper function to get emotion icon
export const getEmotionIcon = (emotion: string) => {
  const emotionIcons: Record<string, string> = {
    'neutral': '/emotions/neutral.svg',
    'happy': '/emotions/happy.svg',
    'sad': '/emotions/sad.svg',
    'anxious': '/emotions/anxious.svg',
    'confident': '/emotions/confident.svg',
    'confused': '/emotions/confused.svg',
    'uncertain': '/emotions/uncertain.svg'
  };
  
  return emotionIcons[emotion] || emotionIcons.neutral;
};

// Get emotion color for styling
export const getEmotionColor = (emotion: string) => {
  const emotionColors: Record<string, string> = {
    'neutral': 'bg-gray-400',
    'happy': 'bg-green-400',
    'sad': 'bg-blue-400',
    'anxious': 'bg-yellow-400',
    'confident': 'bg-purple-400',
    'confused': 'bg-orange-400',
    'uncertain': 'bg-indigo-400'
  };
  
  return emotionColors[emotion] || emotionColors.neutral;
};

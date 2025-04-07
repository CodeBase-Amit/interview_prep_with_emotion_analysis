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

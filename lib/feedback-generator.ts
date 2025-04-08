import { SpeechAnalysisResult } from './speech-analysis';
import Sentiment from 'sentiment';

// Advanced sentiment analyzer
const sentimentAnalyzer = new Sentiment();

// Templates for different feedback categories
const paceTemplates = {
  too_fast: [
    "Please slow down your pace. Speaking this quickly can make it difficult for interviewers to follow your thoughts.",
    "I noticed you're speaking very rapidly. Try to slow down to appear more thoughtful and confident.",
    "Your speaking pace is too fast. Take a moment to breathe between sentences to improve clarity.",
    "You're rushing through your answer. Slowing down will help you articulate your points more clearly."
  ],
  too_slow: [
    "Try to pick up your pace a little. Speaking too slowly can sometimes signal uncertainty.",
    "Your speaking rhythm is quite measured, but could benefit from a bit more energy.",
    "Consider speaking slightly faster to convey more confidence in your knowledge.",
    "Your pace is a bit slow, which might make your answer seem less engaging."
  ],
  good: [
    "Your speaking pace is excellent - clear and easy to follow.",
    "You're speaking at a good rate that balances clarity and engagement.",
    "Your pace is well-measured and professional.",
    "You have a good rhythm in your speech pattern."
  ]
};

const fillerWordTemplates = {
  high: [
    "You're using too many filler words like '{examples}'. This can make you sound less confident.",
    "I noticed frequent use of '{examples}' in your response. Try to reduce these filler words.",
    "Your answer contains many filler words. Practice pausing instead of saying '{examples}'.",
    "Try to eliminate filler words like '{examples}' from your speech to sound more polished."
  ],
  moderate: [
    "Watch out for occasional filler words like '{examples}' in your responses.",
    "You used a few filler words such as '{examples}'. Try to be more direct.",
    "Be mindful of phrases like '{examples}' that can dilute your message.",
    "Your answer includes some unnecessary fillers like '{examples}'."
  ],
  low: [
    "Good job minimizing filler words in your answer.",
    "Your response is clear and direct with few unnecessary words.",
    "You've done well avoiding filler words in your answer.",
    "Your speech is concise with minimal use of filler words."
  ]
};

const emotionTemplates = {
  anxious: [
    "You sound a bit nervous in your response. Try taking a deep breath before answering.",
    "I sense some anxiety in your tone. Remember that it's normal to feel this way in interviews.",
    "Your voice suggests some nervousness. Try to ground yourself before responding to the next question.",
    "There's a hint of anxiety in your answer. Taking a moment to collect your thoughts can help."
  ],
  confident: [
    "You sound confident in your response, which is excellent for an interview setting.",
    "Your tone conveys good confidence and authority on the subject.",
    "The confidence in your voice adds credibility to your answer.",
    "You're projecting confidence in your speech, which makes your answer more convincing."
  ],
  uncertain: [
    "Your tone suggests some uncertainty. Try using more definitive language.",
    "You sound a bit hesitant in parts of your answer. More assertive phrasing would help.",
    "There's some uncertainty in your tone. Consider rephrasing with more conviction.",
    "Your voice indicates some doubt. Using phrases like 'I am confident that...' can help."
  ],
  confused: [
    "You seem unsure about parts of your answer. It's okay to ask for clarification if needed.",
    "Your response indicates some confusion. Taking a moment to organize your thoughts might help.",
    "You sound a bit confused in your explanation. Try breaking complex ideas into smaller parts.",
    "There's some confusion apparent in your answer. Remember it's better to clarify than to guess."
  ],
  neutral: [
    "Your tone is neutral and professional, which works well in an interview.",
    "You maintain a balanced tone throughout your answer.",
    "Your voice has a good neutral quality that's appropriate for this context.",
    "The even tone in your response comes across as professional."
  ],
  happy: [
    "Your enthusiasm comes through in your answer, which is engaging.",
    "The positive tone in your voice helps convey your interest in the topic.",
    "Your upbeat tone adds energy to your response.",
    "The enthusiasm in your voice makes your answer more engaging."
  ],
  sad: [
    "Your tone sounds a bit downbeat. Try to bring more energy to your responses.",
    "There's a somewhat somber quality to your voice. More animation would improve engagement.",
    "Your voice could use more energy and enthusiasm.",
    "Try to inject more positivity into your tone for the next response."
  ]
};

const pauseTemplates = {
  few: [
    "Try incorporating more pauses in your speech to emphasize key points.",
    "Using strategic pauses would give your answer more impact.",
    "Your answer could benefit from more pauses to let important points sink in.",
    "Consider adding brief pauses between main ideas to help the interviewer follow your thinking."
  ],
  good: [
    "You're using pauses effectively to structure your answer.",
    "Your pauses help organize your thoughts clearly.",
    "The way you pace your answer with well-timed pauses is effective.",
    "Good use of pauses to emphasize your key points."
  ]
};

// Collection of feedback templates for various aspects of speech
const paceFeedbackTemplates = {
  too_fast: [
    "Your speaking pace is quite fast at {wpm} words per minute. Try slowing down to appear more confident and allow your interviewer to process your responses more easily.",
    "You're speaking at {wpm} words per minute, which is on the faster side. Taking a few strategic pauses can help you control your pace and sound more authoritative.",
    "I noticed you're speaking quickly ({wpm} wpm). Remember that speaking slowly and deliberately conveys confidence and expertise."
  ],
  too_slow: [
    "Your speaking pace is {wpm} words per minute, which is a bit measured. Try to be more concise and maintain good energy in your responses.",
    "You're speaking at {wpm} words per minute. While thoughtfulness is good, try to be a bit more direct to keep the interviewer engaged.",
    "Your pace is somewhat slow at {wpm} wpm. For interviews, aim for a moderate pace that shows both thoughtfulness and energy."
  ],
  good: [
    "Your speaking pace is excellent at {wpm} words per minute - clear and easy to follow.",
    "Great job maintaining an ideal speaking pace of {wpm} words per minute. This makes your answers very digestible.",
    "You have a well-balanced speaking rate of {wpm} wpm, which sounds natural and professional."
  ]
};

const fillerWordFeedbackTemplates = {
  high: [
    "I noticed {count} filler words like \"{examples}\" in your response. Try to replace these with strategic pauses instead.",
    "Your answer contained {count} fillers such as \"{examples}\". These can make you sound less confident. Try pausing silently when you need a moment to think.",
    "There were {count} filler words (\"{examples}\") in your response. Reducing these will make your communication sound more polished and confident."
  ],
  medium: [
    "You used a few filler words ({count}) like \"{examples}\". Being aware of them is the first step to reducing them.",
    "I detected {count} fillers such as \"{examples}\". For a more polished interview presence, try to minimize these.",
    "Your response had {count} filler expressions like \"{examples}\". Practice pausing instead of using these fillers."
  ],
  low: [
    "Great job keeping filler words to a minimum with just {count} instances.",
    "You used very few filler words ({count}), which makes your response sound confident and prepared.",
    "Excellent control of your speech with only {count} filler words - this shows great preparation."
  ],
  none: [
    "Fantastic job avoiding filler words completely in your response!",
    "Your answer was completely free of filler words, making it clean and professional.",
    "Impressive communication skills - no filler words detected in your response."
  ]
};

const emotionFeedbackTemplates = {
  anxious: [
    "You're coming across as somewhat anxious. Remember to take deep breaths before answering. Interviewers expect some nervousness.",
    "I'm detecting some anxiety in your tone. Try the 4-7-8 breathing technique before your next response (inhale for 4, hold for 7, exhale for 8).",
    "There's a hint of nervousness in your voice. Speaking slightly more slowly can help you appear more confident."
  ],
  nervous: [
    "I can hear some nervousness in your tone. Remember that interviewers expect candidates to be a bit nervous - it's completely normal.",
    "You sound a bit nervous, which is completely understandable. Try speaking at a slightly lower pitch to convey more confidence.",
    "Your voice indicates some nervousness. Try grounding yourself by feeling your feet firmly on the floor as you speak."
  ],
  confused: [
    "You seem a bit uncertain about this topic. It's perfectly okay to ask for clarification if you need it.",
    "Your response suggests some confusion. In an interview, it's better to ask for clarification than to guess at what the interviewer is asking.",
    "I'm detecting some uncertainty. Remember that saying 'I'd need to research that further' is better than giving a confused answer."
  ],
  uncertain: [
    "You're using language that sounds uncertain (maybe, perhaps, I think). Try making more definitive statements when discussing your experience.",
    "Your tone suggests some hesitation. For areas where you have expertise, use more confident language.",
    "I notice some tentative language in your response. Try replacing phrases like 'I think' with 'I believe' or simply stating facts directly."
  ],
  confident: [
    "You sound confident and self-assured - excellent job projecting expertise.",
    "Great job conveying confidence in your response. This leaves a positive impression on interviewers.",
    "Your confident tone enhances the credibility of your answer. Well done!"
  ],
  happy: [
    "Your enthusiasm comes through nicely in your response. This positive energy is great for interviews.",
    "I can hear the genuine interest in your voice. Showing passion for the topic is always a plus in interviews.",
    "The positive tone in your response shows your engagement with the topic - interviewers appreciate this enthusiasm."
  ],
  neutral: [
    "Your tone is professional and measured. For some questions, adding a bit more enthusiasm could be beneficial.",
    "You have a calm, neutral tone. This works well for many interview questions, though varying your tone can help emphasize key points.",
    "Your response has a balanced, professional tone. This works well, though don't be afraid to show enthusiasm where appropriate."
  ]
};

const pauseFeedbackTemplates = {
  too_few: [
    "Try incorporating more strategic pauses in your responses. They give the interviewer time to process your points and make you appear thoughtful.",
    "Your answer could benefit from a few well-placed pauses. Pauses aren't awkward - they show you're thinking carefully.",
    "Consider adding more brief pauses between key points. This gives weight to your important statements and helps the interviewer follow along."
  ],
  good: [
    "Great use of pauses to emphasize your key points.",
    "You're using pauses effectively to structure your response. This makes your answer easy to follow.",
    "Excellent pacing with well-timed pauses that give weight to your main points."
  ]
};

// Extra linguistic pattern feedback templates
const linguisticPatternTemplates = {
  hedging: [
    "Try to minimize hedging phrases like \"sort of,\" \"kind of,\" or \"I guess.\" Be more direct and assertive in your claims.",
    "I noticed some hedging language that can undermine your expertise. Replace tentative phrases with more definitive statements.",
    "Consider removing qualifying language like \"maybe\" or \"possibly\" when discussing your achievements or expertise."
  ],
  passive_voice: [
    "Using active voice rather than passive voice makes your achievements sound more impactful. Instead of \"The project was completed by me,\" say \"I completed the project.\"",
    "Try replacing passive constructions with active ones to highlight your direct involvement and leadership.",
    "Active voice tends to sound more confident in interviews. Focus on statements where you are the subject taking action."
  ],
  technical_jargon: [
    "You're using appropriate technical terminology that demonstrates your expertise in this area.",
    "Good use of industry-specific terms that showcase your knowledge without being overwhelming.",
    "Your technical vocabulary is impressive and well-balanced - you're explaining complex concepts clearly."
  ]
};

/**
 * Generates detailed, conversational feedback based on speech analysis
 * @param analysis The speech analysis results
 * @returns Array of detailed feedback strings
 */
export function generateDetailedFeedback(analysis: SpeechAnalysisResult): string[] {
  const feedback: string[] = [];
  const { fillerWords, pace, pauses, sentiment, transcript } = analysis;
  
  // Generate pace feedback
  const paceTemplate = getRandomTemplate(paceFeedbackTemplates[pace.status]);
  feedback.push(paceTemplate.replace('{wpm}', Math.round(pace.wordsPerMinute).toString()));
  
  // Generate filler word feedback
  let fillerCategory: 'none' | 'low' | 'medium' | 'high' = 'none';
  if (fillerWords.count === 0) {
    fillerCategory = 'none';
  } else if (fillerWords.count <= 2) {
    fillerCategory = 'low';
  } else if (fillerWords.count <= 5) {
    fillerCategory = 'medium';
  } else {
    fillerCategory = 'high';
  }
  
  if (fillerCategory !== 'none') {
    const fillerTemplate = getRandomTemplate(fillerWordFeedbackTemplates[fillerCategory]);
    const fillerExamples = fillerWords.instances.slice(0, 3).join('", "');
    feedback.push(fillerTemplate
      .replace('{count}', fillerWords.count.toString())
      .replace('{examples}', fillerExamples)
    );
  } else {
    feedback.push(getRandomTemplate(fillerWordFeedbackTemplates.none));
  }
  
  // Generate emotion feedback
  if (sentiment in emotionFeedbackTemplates) {
    feedback.push(getRandomTemplate(emotionFeedbackTemplates[sentiment as keyof typeof emotionFeedbackTemplates]));
  }
  
  // Generate pause feedback
  const wordCount = transcript.split(/\s+/).length;
  if (wordCount > 40 && pauses < 3) {
    feedback.push(getRandomTemplate(pauseFeedbackTemplates.too_few));
  } else if (pauses >= 3) {
    // Only sometimes add positive pause feedback to avoid too many feedback items
    if (Math.random() > 0.5) {
      feedback.push(getRandomTemplate(pauseFeedbackTemplates.good));
    }
  }
  
  // Add linguistic pattern analysis (simplified)
  const lowerTranscript = transcript.toLowerCase();
  
  // Check for hedging language
  const hedgingPatterns = [
    'sort of', 'kind of', 'i guess', 'maybe', 'possibly', 'probably',
    'somewhat', 'i think', 'i believe', 'in my opinion'
  ];
  
  const hasHedging = hedgingPatterns.some(pattern => lowerTranscript.includes(pattern));
  if (hasHedging) {
    feedback.push(getRandomTemplate(linguisticPatternTemplates.hedging));
  }
  
  // Simple check for passive voice (very simplified)
  const passivePatterns = [
    'was done', 'were made', 'has been', 'have been', 
    'was created', 'were developed', 'was implemented'
  ];
  
  const hasPassive = passivePatterns.some(pattern => lowerTranscript.includes(pattern));
  if (hasPassive) {
    feedback.push(getRandomTemplate(linguisticPatternTemplates.passive_voice));
  }
  
  // Randomly select from available feedback to avoid overwhelming the user
  // If we have more than 3 feedback items, randomly select 3
  if (feedback.length > 3) {
    return shuffleArray(feedback).slice(0, 3);
  }
  
  return feedback;
}

// Helper function to get a random template from an array
function getRandomTemplate(templates: string[]): string {
  const randomIndex = Math.floor(Math.random() * templates.length);
  return templates[randomIndex];
}

// Helper function to shuffle an array (Fisher-Yates algorithm)
function shuffleArray<T>(array: T[]): T[] {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
} 
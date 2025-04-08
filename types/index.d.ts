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

interface QuestionAnswerPair {
  question: string;
  answer: string;
  sentimentScore: SentimentScore | null;
}

interface EnhancedQuestionAnswerPair extends QuestionAnswerPair {
  speechAnalysis?: SpeechAnalysis;
  idealAnswer?: string;
}

interface Feedback {
  id: string;
  interviewId: string;
  totalScore: number;
  categoryScores: Array<{
    name: string;
    score: number;
    comment: string;
  }>;
  strengths: string[];
  areasForImprovement: string[];
  finalAssessment: string;
  createdAt: string;
  sentimentAnalysis?: SentimentData[];
  questionsAndAnswers?: EnhancedQuestionAnswerPair[];
}

interface Interview {
  id: string;
  role: string;
  level: string;
  questions: string[];
  techstack: string[];
  createdAt: string;
  userId: string;
  type: string;
  finalized: boolean;
}

interface CreateFeedbackParams {
  interviewId: string;
  userId: string;
  transcript: { role: string; content: string }[];
  feedbackId?: string;
  sentimentData?: SentimentData[];
}

interface User {
  name: string;
  email: string;
  id: string;
}

interface InterviewCardProps {
  id?: string;
  userId?: string;
  role: string;
  type: string;
  techstack: string[];
  createdAt?: string;
  sentimentData?: SentimentData[];
}

interface AgentProps {
  userName: string;
  userId?: string;
  interviewId?: string;
  feedbackId?: string;
  type: "generate" | "interview";
  questions?: string[];
}

interface RouteParams {
  params: Promise<Record<string, string>>;
  searchParams: Promise<Record<string, string>>;
}

interface GetFeedbackByInterviewIdParams {
  interviewId: string;
  userId: string;
}

interface GetLatestInterviewsParams {
  userId: string;
  limit?: number;
}

interface SignInParams {
  email: string;
  idToken: string;
}

interface SignUpParams {
  uid: string;
  name: string;
  email: string;
  password: string;
}

type FormType = "sign-in" | "sign-up";

interface InterviewFormProps {
  interviewId: string;
  role: string;
  level: string;
  type: string;
  techstack: string[];
  amount: number;
}

interface TechIconProps {
  techStack: string[];
}

interface SentimentData {
  timestamp: string;
  emotion: string;
  confidence: number;
  transcript: string;
  score?: number;
  magnitude?: number;
}

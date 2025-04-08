'use server';

import {db} from "@/firebase/admin";
import {generateObject} from "ai";
import {google} from "@ai-sdk/google";
import {feedbackSchema} from "@/constants";
import {z} from "zod";

// Define the necessary interfaces
interface SavedMessage {
    role: 'user' | 'system' | 'assistant';
    content: string;
}

interface SentimentScore {
    score: number;
    emotion: string;
    confidence: number;
}

interface QuestionAnswerPair {
    question: string;
    answer: string;
    sentimentScore: SentimentScore | null;
}

interface SentimentData {
    timestamp: string;
    emotion: string;
    confidence: number;
    score: number;
    magnitude?: number;
    transcript: string;
}

interface EnhancedQuestionAnswerPair extends QuestionAnswerPair {
    speechAnalysis: SpeechAnalysis;
    idealAnswer: string;
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

export async function getInterviewsByUserId(userId: string): Promise<Interview[] | null> {
    const interviews = await db
        .collection('interviews')
        .where('userId', '==', userId)
        .orderBy('createdAt', 'desc')
        .get();

    return interviews.docs.map((doc) => ({
        id: doc.id,
        ...doc.data()
    })) as Interview[];
}

export async function getLatestInterviews(params: GetLatestInterviewsParams): Promise<Interview[] | null> {
    const { userId, limit = 20 } = params;

    const interviews = await db
        .collection('interviews')
        .orderBy('createdAt', 'desc')
        .where('finalized', '==', true)
        .where('userId', '!=', userId)
        .limit(limit)
        .get();

    return interviews.docs.map((doc) => ({
        id: doc.id,
        ...doc.data()
    })) as Interview[];
}

export async function getInterviewById(id: string): Promise<Interview | null> {
    const interview = await db
        .collection('interviews')
        .doc(id)
        .get();

    return interview.data() as Interview | null;
}

export async function createFeedback(params: CreateFeedbackParams) {
    const { interviewId, userId, transcript, sentimentData } = params;

    try {
        // Format the transcript for AI analysis
        const formattedTranscript = transcript
         .map((sentence: { role: string; content: string; }) => (
             `- ${sentence.role}: ${sentence.content}\n`
         )).join('');

        // Extract questions and answers from the transcript
        const questionAnswerPairs = extractQuestionsAndAnswers(transcript as SavedMessage[]);

        // Analyze sentiment for each answer
        const analyzedQAPairs = attachSentimentToAnswers(questionAnswerPairs, sentimentData || []);
        
        // Enhance each answer with speech analysis and ideal answer
        const enhancedQAPairs = await enhanceQuestionsAndAnswers(analyzedQAPairs);

        // Generate the feedback using AI
        const { object: { totalScore, categoryScores, strengths, areasForImprovement, finalAssessment } } = await generateObject({
            model: google('gemini-2.0-flash-001', {
                structuredOutputs: false,
            }),
            schema: feedbackSchema,
            prompt: `You are an AI interviewer analyzing a mock interview. Your task is to evaluate the candidate based on structured categories. Be thorough and detailed in your analysis. Don't be lenient with the candidate. If there are mistakes or areas for improvement, point them out.
        Transcript:
        ${formattedTranscript}

        Please score the candidate from 0 to 100 in the following areas. Do not add categories other than the ones provided:
        - **Communication Skills**: Clarity, articulation, structured responses.
        - **Technical Knowledge**: Understanding of key concepts for the role.
        - **Problem-Solving**: Ability to analyze problems and propose solutions.
        - **Cultural & Role Fit**: Alignment with company values and job role.
        - **Confidence & Clarity**: Confidence in responses, engagement, and clarity.
        `,
            system:
        "You are a professional interviewer analyzing a mock interview. Your task is to evaluate the candidate based on structured categories",
        });

        // Save feedback to the database
        const feedback = await db.collection('feedback').add({
            interviewId,
            userId,
            totalScore,
            categoryScores,
            strengths,
            areasForImprovement,
            finalAssessment,
            sentimentAnalysis: sentimentData || [],
            questionsAndAnswers: enhancedQAPairs || [], // Use the enhanced QA pairs
            createdAt: new Date().toISOString()
        })

        return {
            success: true,
            feedbackId: feedback.id
        }
    } catch (e) {
        console.error('Error saving feedback', e)

        return { success: false }
    }
}

/**
 * Extract questions and answers from the transcript
 */
function extractQuestionsAndAnswers(transcript: SavedMessage[]): QuestionAnswerPair[] {
    const qaPairs: QuestionAnswerPair[] = [];
    
    // Process the transcript to extract questions and answers
    for (let i = 0; i < transcript.length; i++) {
        const message = transcript[i];
        
        // Check if the message is from the assistant (interviewer)
        if (message.role === 'assistant') {
            // Look for a question pattern (ending with a question mark or starting with specific keywords)
            const messageText = message.content.trim();
            const isQuestion = messageText.endsWith('?') || 
                               /^(what|how|why|can you|could you|tell me|describe|explain)/i.test(messageText);
            
            if (isQuestion) {
                const questionObj: QuestionAnswerPair = {
                    question: messageText,
                    answer: '',
                    sentimentScore: null
                };
                
                // Look for the user's answer in the next message
                if (i + 1 < transcript.length && transcript[i + 1].role === 'user') {
                    questionObj.answer = transcript[i + 1].content.trim();
                }
                
                qaPairs.push(questionObj);
            }
        }
    }
    
    return qaPairs;
}

/**
 * Attach sentiment analysis results to answers
 */
function attachSentimentToAnswers(qaPairs: QuestionAnswerPair[], sentimentData: any[]): QuestionAnswerPair[] {
    // If no sentiment data available, return the original pairs
    if (!sentimentData || sentimentData.length === 0) {
        return qaPairs;
    }
    
    // Create a copy to avoid modifying the original array
    const analyzedPairs = [...qaPairs];
    
    // Match sentiment data with answers based on the transcript text
    for (let i = 0; i < analyzedPairs.length; i++) {
        const pair = analyzedPairs[i];
        
        // Find the sentiment data that best matches this answer
        const matchingSentiment = sentimentData.find(data => 
            data.transcript && pair.answer && 
            (data.transcript.includes(pair.answer) || pair.answer.includes(data.transcript))
        );
        
        if (matchingSentiment) {
            pair.sentimentScore = {
                score: matchingSentiment.score || 0,
                emotion: matchingSentiment.emotion,
                confidence: matchingSentiment.confidence
            };
        }
    }
    
    return analyzedPairs;
}

/**
 * Enhance each question-answer pair with detailed speech analysis and ideal answers
 */
async function enhanceQuestionsAndAnswers(qaPairs: QuestionAnswerPair[]): Promise<EnhancedQuestionAnswerPair[]> {
    // Create a copy to avoid modifying the original array
    const enhancedPairs: EnhancedQuestionAnswerPair[] = [];
    
    // Process each question-answer pair sequentially
    for (const pair of qaPairs) {
        if (!pair.question || !pair.answer) {
            // Skip pairs with missing questions or answers
            continue;
        }
        
        try {
            // Generate speech analysis feedback for the answer
            const speechAnalysis = analyzeAnswerSpeech(pair.answer);
            
            // Generate the ideal answer using AI
            const idealAnswer = await generateIdealAnswer(pair.question);
            
            // Create the enhanced pair
            const enhancedPair: EnhancedQuestionAnswerPair = {
                ...pair,
                speechAnalysis,
                idealAnswer
            };
            
            enhancedPairs.push(enhancedPair);
        } catch (error) {
            console.error('Error enhancing QA pair:', error);
            // If enhancement fails, include the original pair without enhancements
            enhancedPairs.push(pair as EnhancedQuestionAnswerPair);
        }
    }
    
    return enhancedPairs;
}

/**
 * Analyze speech patterns in an answer (fillers, pace, clarity, etc.)
 */
function analyzeAnswerSpeech(answer: string): SpeechAnalysis {
    // Count filler words
    const fillerWords = ['um', 'uh', 'like', 'you know', 'so', 'actually', 'basically', 'literally'];
    const fillerCounts: Record<string, number> = {};
    let totalFillers = 0;
    
    for (const filler of fillerWords) {
        // Use regex to count occurrences of each filler word
        const regex = new RegExp(`\\b${filler}\\b`, 'gi');
        const matches = answer.match(regex);
        const count = matches ? matches.length : 0;
        
        if (count > 0) {
            fillerCounts[filler] = count;
            totalFillers += count;
        }
    }
    
    // Analyze clarity and conciseness
    const wordCount = answer.split(/\s+/).length;
    const sentenceCount = answer.split(/[.!?]+/).filter(s => s.trim().length > 0).length;
    const avgWordsPerSentence = sentenceCount > 0 ? wordCount / sentenceCount : 0;
    
    // Determine clarity level based on sentence length
    let clarity = 'good';
    if (avgWordsPerSentence > 25) {
        clarity = 'verbose';
    } else if (avgWordsPerSentence < 5 && wordCount > 10) {
        clarity = 'choppy';
    }
    
    // Analyze tone based on keyword indicators
    const toneIndicators = {
        confident: ['certainly', 'definitely', 'absolutely', 'confident', 'sure', 'know'],
        uncertain: ['maybe', 'perhaps', 'possibly', 'might', 'could be', 'not sure', 'guess'],
        formal: ['therefore', 'moreover', 'consequently', 'thus', 'hence'],
        casual: ['pretty', 'cool', 'stuff', 'thing', 'kinda', 'sorta']
    };
    
    const toneCounts: Record<string, number> = {
        confident: 0,
        uncertain: 0,
        formal: 0,
        casual: 0
    };
    
    // Count tone indicators
    for (const [tone, indicators] of Object.entries(toneIndicators)) {
        for (const indicator of indicators) {
            const regex = new RegExp(`\\b${indicator}\\b`, 'gi');
            const matches = answer.match(regex);
            if (matches) {
                toneCounts[tone] += matches.length;
            }
        }
    }
    
    // Determine dominant tone
    const dominantTone = Object.entries(toneCounts)
        .sort((a, b) => b[1] - a[1])
        .filter(([_, count]) => count > 0)
        .map(([tone]) => tone)[0] || 'neutral';
    
    return {
        fillerWords: {
            total: totalFillers,
            details: fillerCounts
        },
        wordCount,
        clarity,
        tone: dominantTone,
        avgWordsPerSentence
    };
}

/**
 * Generate an ideal answer for a question using AI
 */
async function generateIdealAnswer(question: string): Promise<string> {
    try {
        const response = await generateObject({
            model: google('gemini-1.5-flash', {
                structuredOutputs: false,
            }),
            prompt: `As an expert interviewer, provide a concise, professional model answer to the following interview question. The answer should be technically accurate, well-structured, and demonstrate deep knowledge.
            
            Question: "${question}"
            
            Provide a model answer that would impress an interviewer. Keep it under 150 words.`,
            schema: z.object({
                modelAnswer: z.string()
            })
        });
        
        return response.object.modelAnswer;
    } catch (error) {
        console.error('Error generating ideal answer:', error);
        return "Could not generate an ideal answer for this question.";
    }
}

export async function getFeedbackByInterviewId(params: GetFeedbackByInterviewIdParams): Promise<Feedback | null> {
    const { interviewId, userId } = params;

    const feedback = await db
        .collection('feedback')
        .where('interviewId', '==', interviewId)
        .where('userId', '==', userId)
        .limit(1)
        .get();

    if(feedback.empty) return null;
    const feedbackDoc = feedback.docs[0];

    return {
        id: feedbackDoc.id, ...feedbackDoc.data()
    } as Feedback;
}
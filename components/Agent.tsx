'use client';

import Image from "next/image";
import {cn} from "@/lib/utils";
import {useRouter} from "next/navigation";
import {useEffect, useState, useRef} from "react";
import { vapi } from '@/lib/vapi.sdk';
import {interviewer} from "@/constants";
import {createFeedback} from "@/lib/actions/general.action";
import {analyzeSentiment} from "@/lib/sentiment-local";
import {analyzeSpeech, SpeechAnalysisResult} from "@/lib/speech-analysis";
import SpeechFeedback from "@/components/SpeechFeedback";
import { generateDetailedFeedback } from '@/lib/feedback-generator';

enum CallStatus {
    INACTIVE = 'INACTIVE',
    CONNECTING = 'CONNECTING',
    ACTIVE = 'ACTIVE',
    FINISHED = 'FINISHED',
}

interface SavedMessage {
    role: 'user' | 'system' | 'assistant';
    content: string;
}

const Agent = ({ userName, userId, type, interviewId, questions }: AgentProps) => {
    const router = useRouter();
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [callStatus, setCallStatus] = useState<CallStatus>(CallStatus.INACTIVE);
    const [messages, setMessages] = useState<SavedMessage[]>([]);
    const [sentimentData, setSentimentData] = useState<SentimentData[]>([]);
    const [currentEmotion, setCurrentEmotion] = useState<string>('neutral');
    const [speechAnalysis, setSpeechAnalysis] = useState<SpeechAnalysisResult | null>(null);
    const [showSpeechFeedback, setShowSpeechFeedback] = useState(false);
    
    // Refs for speech timing
    const speechStartTimeRef = useRef<number | null>(null);
    const isUserSpeakingRef = useRef(false);
    
    useEffect(() => {
        const onCallStart = () => setCallStatus(CallStatus.ACTIVE);
        const onCallEnd = () => setCallStatus(CallStatus.FINISHED);

        const onMessage = async (message: Message) => {
            if(message.type === 'transcript' && message.transcriptType === 'final') {
                const newMessage = { role: message.role, content: message.transcript }

                setMessages((prev) => [...prev, newMessage]);
                
                // Only analyze sentiment for user responses
                if (message.role === 'user') {
                    try {
                        // Stop tracking speech time
                        isUserSpeakingRef.current = false;
                        const speechEndTime = Date.now();
                        const speechDuration = speechStartTimeRef.current 
                            ? speechEndTime - speechStartTimeRef.current 
                            : 5000; // fallback to 5 seconds
                        
                        // Analyze sentiment using our local implementation
                        const { emotion, confidence, score, magnitude } = analyzeSentiment(message.transcript);
                        
                        const newSentimentData: SentimentData = {
                            timestamp: new Date().toISOString(),
                            emotion,
                            confidence,
                            score,
                            magnitude,
                            transcript: message.transcript
                        };
                        
                        setSentimentData(prev => [...prev, newSentimentData]);
                        setCurrentEmotion(emotion);
                        
                        // Analyze speech when message is sent from user
                        analyzeUserSpeech(message.transcript, speechDuration);
                    } catch (error) {
                        console.error('Failed to analyze sentiment:', error);
                    }
                } else {
                    // If the assistant is done speaking, prepare for user's speech
                    speechStartTimeRef.current = null;
                    setShowSpeechFeedback(false);
                }
            }
        }

        const onSpeechStart = () => {
            setIsSpeaking(true);
            // If user starts speaking, record the time
            // Since vapi doesn't expose a clear way to check whose turn it is,
            // we'll use the messages array state to determine
            const lastMessage = messages[messages.length - 1];
            const isUserTurn = lastMessage?.role === 'assistant' || messages.length === 0;
            
            if (isUserTurn) {
                isUserSpeakingRef.current = true;
                speechStartTimeRef.current = Date.now();
            }
        };
        
        const onSpeechEnd = () => {
            setIsSpeaking(false);
        };

        const onError = (error: Error) => console.log('Error', error);

        vapi.on('call-start', onCallStart);
        vapi.on('call-end', onCallEnd);
        vapi.on('message', onMessage);
        vapi.on('speech-start', onSpeechStart);
        vapi.on('speech-end', onSpeechEnd);
        vapi.on('error', onError);

        return () => {
            vapi.off('call-start', onCallStart);
            vapi.off('call-end', onCallEnd);
            vapi.off('message', onMessage);
            vapi.off('speech-start', onSpeechStart);
            vapi.off('speech-end', onSpeechEnd);
            vapi.off('error', onError)
        }
    }, [messages])

    const handleGenerateFeedback = async (messages: SavedMessage[]) => {
        console.log('Generate feedback here.');

        const { success, feedbackId: id } = await createFeedback({
            interviewId: interviewId!,
            userId: userId!,
            transcript: messages,
            sentimentData
        })

        if(success && id) {
            router.push(`/interview/${interviewId}/feedback`);
        } else {
            console.log('Error saving feedback');
            router.push('/');
        }
    }


    useEffect(() => {
        if(callStatus === CallStatus.FINISHED) {
            if(type === 'generate') {
                router.push('/')
            } else {
                handleGenerateFeedback(messages);
            }
        }
    }, [messages, callStatus, type, userId, router, interviewId]);

    const handleCall = async () => {
        setCallStatus(CallStatus.CONNECTING);

        if(type ==='generate') {
            await vapi.start(process.env.NEXT_PUBLIC_VAPI_WORKFLOW_ID!, {
                variableValues: {
                    username: userName,
                    userid: userId,
                }
            })
        } else {
            let formattedQuestions = '';

            if(questions) {
                formattedQuestions = questions
                    .map((question) => `- ${question}`)
                    .join('\n');
            }
            await vapi.start(interviewer, {
                variableValues: {
                    questions: formattedQuestions
                }
            })
        }
    }

    const handleDisconnect = async () => {
        setCallStatus(CallStatus.FINISHED);

        vapi.stop();
    }

    const latestMessage = messages[messages.length - 1]?.content;
    const isCallInactiveOrFinished = callStatus === CallStatus.INACTIVE || callStatus === CallStatus.FINISHED;

    // Import the emotion icon based on current emotion
    const getEmotionClass = (emotion: string) => {
        switch(emotion) {
            case 'happy': return 'bg-green-400';
            case 'sad': return 'bg-blue-400';
            case 'anxious': return 'bg-yellow-400';
            case 'confident': return 'bg-purple-400';
            case 'confused': return 'bg-orange-400';
            case 'uncertain': return 'bg-indigo-400';
            default: return 'bg-gray-400';
        }
    };

    // Analyze speech when message is sent from user
    const analyzeUserSpeech = (text: string, speechDuration: number) => {
        // Basic sentiment detection (this is simplified, in reality we would use NLP)
        let sentiment = 'neutral';
        
        // Simple sentiment detection based on keywords
        const lowerText = text.toLowerCase();
        if (lowerText.includes('nervous') || lowerText.includes('anxious') || lowerText.includes('worry')) {
            sentiment = 'anxious';
        } else if (lowerText.includes('confus') || lowerText.includes('not sure') || lowerText.includes('unclear')) {
            sentiment = 'confused';
        } else if (lowerText.includes('happy') || lowerText.includes('excite') || lowerText.includes('look forward')) {
            sentiment = 'happy';
        } else if (lowerText.includes('confident') || lowerText.includes('certain') || lowerText.includes('sure')) {
            sentiment = 'confident';
        } else if (lowerText.includes('uncertain') || lowerText.includes('maybe') || lowerText.includes('probably')) {
            sentiment = 'uncertain';
        }
        
        // Analyze speech pattern
        const analysis = analyzeSpeech(text, speechDuration, sentiment);
        
        // Generate detailed feedback
        const detailedFeedback = generateDetailedFeedback(analysis);
        analysis.feedback = detailedFeedback;
        
        setSpeechAnalysis(analysis);
        setShowSpeechFeedback(true);
    };

    return (
        <>
        <div className="call-view">
            <div className="card-interviewer">
                <div className="avatar">
                    <Image src="/robo_logo.png" alt="vapi" width={65} height={54} className="object-cover" />
                    {isSpeaking && <span className="animate-speak" />}
                </div>
                <h3>Prep Bot</h3>
            </div>

            <div className="card-border">
                <div className="card-content">
                    <div className="relative">
                        <Image src="/man-avatar-icon-free-vector.png" alt="user avatar" width={540} height={540} className="rounded-full object-cover size-[120px]" />
                        
                        {callStatus === CallStatus.ACTIVE && (
                            <div className={`absolute top-0 right-0 w-6 h-6 rounded-full ${getEmotionClass(currentEmotion)} border-2 border-white flex items-center justify-center`}>
                            </div>
                        )}
                    </div>
                    <h3>{userName}</h3>
                    {callStatus === CallStatus.ACTIVE && (
                        <p className="text-sm capitalize mt-1">{currentEmotion}</p>
                    )}
                </div>
            </div>
        </div>
            {messages.length > 0 && (
                <div className="transcript-border">
                    <div className="transcript">
                        <p key={latestMessage} className={cn('transition-opacity duration-500 opacity-0', 'animate-fadeIn opacity-100')}>
                            {latestMessage}
                        </p>
                    </div>
                </div>
            )}
            
            {/* Speech Analysis Feedback */}
            {showSpeechFeedback && speechAnalysis && (
                <SpeechFeedback 
                    analysis={speechAnalysis} 
                    onDismiss={() => setShowSpeechFeedback(false)} 
                />
            )}

            <div className="w-full flex justify-center mt-4">
                {callStatus !== 'ACTIVE' ? (
                    <button className="relative btn-call" onClick={handleCall}>
                        <span className={cn('absolute animate-ping rounded-full opacity-75', callStatus !=='CONNECTING' && 'hidden')}
                             />

                            <span>
                                {isCallInactiveOrFinished ? 'Call' : '. . .'}
                            </span>
                    </button>
                ) : (
                    <button className="btn-disconnect" onClick={handleDisconnect}>
                        End
                    </button>
                )}
            </div>
        </>
    )
}

export default Agent
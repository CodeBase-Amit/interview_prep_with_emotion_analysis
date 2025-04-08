import dayjs from "dayjs";
import Link from "next/link";
import Image from "next/image";
import { redirect } from "next/navigation";

import {
    getFeedbackByInterviewId,
    getInterviewById,
} from "@/lib/actions/general.action";
import { Button } from "@/components/ui/button";
import { getCurrentUser } from "@/lib/actions/auth.action";
import SentimentDisplay from "@/components/SentimentDisplay";
import QuestionAnswerFeedback from "@/components/QuestionAnswerFeedback";

const Page = async ({ params }: RouteParams) => {
    const { id } = await params;
    const user = await getCurrentUser();

    const interview = await getInterviewById(id);
    if(!interview) redirect('/');

    const feedback = await getFeedbackByInterviewId({
        interviewId: id,
        userId: user?.id!,
       });

    return (
        <section className="section-feedback">
            <div className="flex flex-row justify-center">
                <h1 className="text-4xl font-semibold">
                    Feedback on the Interview -{" "}
                    <span className="capitalize">{interview.role}</span> Interview
                </h1>
            </div>

            <div className="flex flex-col gap-4">
                <div className="flex flex-row gap-5">
                    <div className="flex flex-row gap-2 items-center">
                        <Image src="/star.svg" width={22} height={22} alt="star" />
                        <p>
                            Overall Impression:{" "}
                            <span className="text-primary-200 font-bold">
                {feedback?.totalScore}
              </span>
                            /100
                        </p>
                    </div>

                    <div className="flex flex-row gap-2">
                        <Image src="/calendar.svg" width={22} height={22} alt="calendar" />
                        <p>
                            {feedback?.createdAt
                                ? dayjs(feedback.createdAt).format("MMM D, YYYY h:mm A")
                                : "N/A"}
                        </p>
                    </div>
                </div>
            </div>

            <hr />

            <p>{feedback?.finalAssessment}</p>

            <div className="flex flex-col gap-4 mt-6">
                <h2 className="text-xl font-semibold">Breakdown of the Interview:</h2>
                {feedback?.categoryScores?.map((category, index) => (
                    <div key={index} className="bg-dark-200 p-4 rounded-lg">
                        <p className="font-bold text-lg">
                            {index + 1}. {category.name} ({category.score}/100)
                        </p>
                        <p>{category.comment}</p>
                    </div>
                ))}
            </div>

            {feedback?.sentimentAnalysis && feedback.sentimentAnalysis.length > 0 && (
                <div className="flex flex-col gap-4 mt-6">
                    <SentimentDisplay sentimentData={feedback.sentimentAnalysis} showDetailed={true} />
                </div>
            )}

            {/* Question and Answer Review Section */}
            {feedback?.questionsAndAnswers && feedback.questionsAndAnswers.length > 0 && (
                <div className="flex flex-col gap-4 mt-6">
                    <h2 className="text-xl font-semibold">Interview Questions and Answers</h2>
                    <div className="flex flex-col gap-4">
                        {feedback.questionsAndAnswers.map((qa, index) => (
                            <QuestionAnswerFeedback 
                                key={index} 
                                questionNumber={index + 1}
                                question={qa.question}
                                answer={qa.answer}
                                sentimentScore={qa.sentimentScore}
                                speechAnalysis={qa.speechAnalysis}
                                idealAnswer={qa.idealAnswer}
                            />
                        ))}
                    </div>
                </div>
            )}

            <div className="flex flex-col gap-3 mt-6">
                <h3 className="text-lg font-semibold">Strengths</h3>
                <ul className="list-disc pl-5 space-y-2">
                    {feedback?.strengths?.map((strength, index) => (
                        <li key={index}>{strength}</li>
                    ))}
                </ul>
            </div>

            <div className="flex flex-col gap-3 mt-4">
                <h3 className="text-lg font-semibold">Areas for Improvement</h3>
                <ul className="list-disc pl-5 space-y-2">
                    {feedback?.areasForImprovement?.map((area, index) => (
                        <li key={index}>{area}</li>
                    ))}
                </ul>
            </div>

            <div className="buttons mt-8">
                <Button className="btn-secondary flex-1">
                    <Link href="/" className="flex w-full justify-center">
                        <p className="text-sm font-semibold text-primary-200 text-center">
                            Back to dashboard
                        </p>
                    </Link>
                </Button>

                <Button className="btn-primary flex-1">
                    <Link
                        href={`/interview/${id}`}
                        className="flex w-full justify-center"
                    >
                        <p className="text-sm font-semibold text-black text-center">
                            Retake Interview
                        </p>
                    </Link>
                </Button>
            </div>
        </section>
    )
}
export default Page
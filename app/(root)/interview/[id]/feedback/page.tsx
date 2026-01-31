import { db } from "@/firebase/admin";
import { notFound, redirect } from "next/navigation";
// import { Button } from "@/components/ui/button"; // Optional: Add if needed for "Back to Home"
// import { Card } from "@/components/ui/card";    // Optional: Add if needed for layout

interface FeedbackPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function FeedbackPage({ params }: FeedbackPageProps) {
    const { id: interviewId } = await params;

  if (!interviewId) return notFound();

  // Fetch Feedback linked to this interview
  const feedbackQuery = await db
    .collection("feedback")
    .where("interviewId", "==", interviewId)
    .limit(1)
    .get();

  if (feedbackQuery.empty) {
    // If feedback isn't ready yet, it might be processing.
    // In a real app, we'd show a loading state or revalidate.
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <h1 className="text-2xl font-bold">Processing your interview...</h1>
        <p className="text-muted-foreground">This may take a few moments. Please refresh.</p>
      </div>
    );
  }

  const feedbackData = feedbackQuery.docs[0].data();
  const { totalScore, strengths, weaknesses, feedback, questions } = feedbackData;

  // Determine score color
  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-500";
    if (score >= 60) return "text-yellow-500";
    return "text-red-500";
  };

  return (
    <div className="container max-w-4xl mx-auto py-10 px-4 space-y-8">
      
      {/* Header & Score */}
      <div className="flex flex-col md:flex-row gap-8 items-center justify-between bg-card p-8 rounded-2xl border shadow-sm">
        <div className="space-y-2">
           <h1 className="text-3xl font-bold">Interview Results</h1>
           <p className="text-muted-foreground">Here is how you performed in your AI interview.</p>
        </div>
        
        <div className="flex flex-col items-center justify-center relative w-40 h-40">
           {/* Simple Circular Progress - SVG */}
           <svg className="w-full h-full transform -rotate-90">
             <circle
               cx="80"
               cy="80"
               r="70"
               stroke="currentColor"
               strokeWidth="10"
               fill="transparent"
               className="text-muted"
             />
             <circle
               cx="80"
               cy="80"
               r="70"
               stroke="currentColor"
               strokeWidth="10"
               fill="transparent"
               strokeDasharray={440}
               strokeDashoffset={440 - (440 * totalScore) / 100}
               className={`transition-all duration-1000 ${getScoreColor(totalScore).replace('text-', 'stroke-')}`}
             />
           </svg>
           <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className={`text-4xl font-bold ${getScoreColor(totalScore)}`}>{totalScore}</span>
              <span className="text-xs text-muted-foreground uppercase">Score</span>
           </div>
        </div>
      </div>

      {/* Summary Section */}
      <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-green-500/10 border border-green-500/20 p-6 rounded-xl">
             <h3 className="text-lg font-semibold text-green-700 mb-4 flex items-center gap-2">
                ✅ Strengths
             </h3>
             <ul className="space-y-2">
                 {strengths.map((str: string, i: number) => (
                     <li key={i} className="flex items-start gap-2 text-green-800 text-sm">
                         <span className="mt-1.5 w-1.5 h-1.5 bg-green-600 rounded-full shrink-0"/>
                         {str}
                     </li>
                 ))}
             </ul>
          </div>

          <div className="bg-red-500/10 border border-red-500/20 p-6 rounded-xl">
             <h3 className="text-lg font-semibold text-red-700 mb-4 flex items-center gap-2">
                ⚠️ Areas for Improvement
             </h3>
             <ul className="space-y-2">
                 {weaknesses.map((weak: string, i: number) => (
                     <li key={i} className="flex items-start gap-2 text-red-900 text-sm">
                         <span className="mt-1.5 w-1.5 h-1.5 bg-red-600 rounded-full shrink-0"/>
                         {weak}
                     </li>
                 ))}
             </ul>
          </div>
      </div>

      {/* General Feedback */}
      <div className="bg-card border p-6 rounded-xl shadow-sm">
          <h3 className="text-xl font-semibold mb-4">Overall Feedback</h3>
          <p className="text-muted-foreground leading-relaxed">{feedback}</p>
      </div>

      {/* Detailed Q&A Analysis */}
      <div className="space-y-6">
          <h3 className="text-2xl font-bold">Detailed Analysis</h3>
          {questions.map((q: any, i: number) => ( // eslint-disable-line @typescript-eslint/no-explicit-any
             <div key={i} className="bg-card border rounded-xl p-6 shadow-sm space-y-4">
                 <div className="flex justify-between items-start gap-4">
                     <div>
                         <span className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Question {i + 1}</span>
                         <h4 className="text-lg font-medium mt-1">{q.question}</h4>
                     </div>
                     <div className={`px-3 py-1 rounded-full text-sm font-bold ${q.score >= 7 ? 'bg-green-100 text-green-700' : q.score >= 4 ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'}`}>
                         {q.score}/10
                     </div>
                 </div>

                 <div className="grid md:grid-cols-2 gap-4 text-sm">
                     <div className="bg-muted p-4 rounded-lg">
                         <p className="font-semibold mb-2 text-muted-foreground">Your Answer</p>
                         <p className="italic">"{q.userAnswer}"</p>
                     </div>
                     <div className="bg-blue-50/50 border border-blue-100 p-4 rounded-lg">
                         <p className="font-semibold mb-2 text-blue-700">Ideal Answer Link</p>
                         <p className="text-blue-900">{q.idealAnswer}</p>
                     </div>
                 </div>
                 
                 <div className="pt-2 border-t mt-2">
                    <p className="text-sm text-muted-foreground"><span className="font-semibold text-foreground">Feedback: </span> {q.feedback}</p>
                 </div>
             </div>
          ))}
      </div>
      
      <div className="flex justify-center pt-8 pb-12">
            <a href="/interview" className="px-8 py-3 rounded-full bg-primary text-primary-foreground font-medium hover:opacity-90 transition-opacity">
                Start New Interview
            </a>
      </div>

    </div>
  );
}

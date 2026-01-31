"use client";

import { cn } from "@/utils";
import Image from "next/image";
import { useEffect, useState, useRef } from "react";
import { Loader2, Mic, MicOff, Volume2 } from "lucide-react";
import { Button } from "@/components/ui/button";

enum CallStatus {
  FETCHING = "FETCHING",
  INTRO = "INTRO",
  ASKING = "ASKING",
  LISTENING = "LISTENING",
  PROCESSING = "PROCESSING",
  FINISHED = "FINISHED",
}

const Agent = ({ userName, role, techStack, questionCount }: AgentProps) => {
  const [callStatus, setCallStatus] = useState<CallStatus>(CallStatus.FETCHING);
  const [questions, setQuestions] = useState<string[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [transcript, setTranscript] = useState("");
  const [isAiSpeaking, setIsAiSpeaking] = useState(false);
  
  const recognitionRef = useRef<any>(null); // eslint-disable-line @typescript-eslint/no-explicit-any

  // 1. Fetch Questions
  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const res = await fetch("/api/interview/generate", {
          method: "POST",
          body: JSON.stringify({ role, techStack, count: questionCount || 5 }),
        });
        const data = await res.json();
        if (data.questions && data.questions.length > 0) {
          setQuestions(data.questions);
          setCallStatus(CallStatus.INTRO);
        } else {
             console.error("No questions generated");
        }
      } catch (error) {
        console.error("Failed to fetch questions", error);
      }
    };

    if (role && techStack) {
        fetchQuestions();
    }
  }, [role, techStack, questionCount]);


  // 2. Speech Utils
  const speak = (text: string, onEnd?: () => void) => {
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      const voices = window.speechSynthesis.getVoices();
        const preferredVoice = voices.find(v => v.name.includes("Google US English") || v.name.includes("Samantha"));
        if (preferredVoice) utterance.voice = preferredVoice;
      
      setIsAiSpeaking(true);
      utterance.onend = () => {
        setIsAiSpeaking(false);
        if (onEnd) onEnd();
      };
      window.speechSynthesis.speak(utterance);
    }
  };

  const startListening = () => {
    if (recognitionRef.current) {
        setCallStatus(CallStatus.LISTENING);
        setTranscript("");
        try {
            recognitionRef.current.start();
        } catch(e) { console.error(e) } 
    }
  };

  const stopListening = () => {
     if (recognitionRef.current) {
         recognitionRef.current.stop();
         setCallStatus(CallStatus.PROCESSING);
     }
  };

  // 3. Initialize STT
  useEffect(() => {
    if (typeof window !== 'undefined' && ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
        // @ts-expect-error - SpeechRecognition is not fully typed
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        recognitionRef.current = new SpeechRecognition();
        recognitionRef.current.continuous = true; 
        recognitionRef.current.interimResults = true;
        recognitionRef.current.lang = 'en-US';

        recognitionRef.current.onresult = (event: any) => { // eslint-disable-line @typescript-eslint/no-explicit-any
             let finalTranscript = "";
             for (let i = event.resultIndex; i < event.results.length; ++i) {
                if (event.results[i].isFinal) {
                    finalTranscript += event.results[i][0].transcript;
                } else {
                    finalTranscript += event.results[i][0].transcript;
                }
             }
             setTranscript(finalTranscript);
        };
    }
  }, []);

  // 4. Interview Flow Control
  
  // Start the interview from Intro
  useEffect(() => {
      if (callStatus === CallStatus.INTRO) {
          setTimeout(() => {
              speak(`Hello ${userName}. I'm ready to interview you for the ${role} position. Let's begin.`, () => {
                  setCallStatus(CallStatus.ASKING);
              });
          }, 1000);
      }
  }, [callStatus, userName, role]);

  // Ask Question
  useEffect(() => {
      if (callStatus === CallStatus.ASKING && questions.length > 0) {
          const question = questions[currentQuestionIndex];
          speak(question, () => {
               startListening(); // Auto start listening after asking
          });
      }
  }, [callStatus, currentQuestionIndex, questions]);


  const handleNextQuestion = () => {
      stopListening();
      if (currentQuestionIndex < questions.length - 1) {
          setCurrentQuestionIndex(prev => prev + 1);
          setCallStatus(CallStatus.ASKING);
      } else {
          setCallStatus(CallStatus.FINISHED);
          speak("Thank you for completing the interview. Good luck!");
      }
  };


  return (
    <div className="flex flex-col h-full bg-background relative overflow-hidden">
      
      {/* Loading State */}
      {callStatus === CallStatus.FETCHING && (
         <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-background/80 backdrop-blur-sm">
             <Loader2 className="w-12 h-12 animate-spin text-primary mb-4" />
             <p className="text-xl font-medium">Generating your interview...</p>
         </div>
      )}

      {/* Main Split View */}
      <div className="flex-1 flex flex-col md:flex-row gap-4 p-4 items-center justify-center">
        
        {/* AI Interviewer Side */}
        <div className={cn(
             "h-full w-full md:w-1/2 flex flex-col items-center justify-between p-6 rounded-2xl transition-all duration-500",
             "bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border border-indigo-500/20",
             isAiSpeaking && "ring-4 ring-indigo-500/30"
        )}>
           <div className="flex flex-col items-center gap-4 mt-8">
               <div className="relative">
                    <div className={cn("absolute inset-0 rounded-full bg-indigo-500 blur-2xl opacity-20 transition-all", isAiSpeaking && "opacity-50 scale-125")}></div>
                    <Image
                        src="/ai-avatar.png"
                        alt="AI Interviewer"
                        width={180}
                        height={180}
                        className="object-cover relative z-10 rounded-full border-4 border-indigo-500/50"
                    />
               </div>
               <h3 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-purple-400">AI Interviewer</h3>
               <div className="px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-mono uppercase tracking-wider">
                   {isAiSpeaking ? "Speaking..." : "Waiting"}
               </div>
           </div>

           <div className="w-full max-w-lg text-center mt-8 p-4 min-h-[100px] flex items-center justify-center">
                <p className="text-lg md:text-2xl font-medium leading-relaxed text-indigo-100">
                    {questions[currentQuestionIndex] || "Preparing next question..."}
                </p>
           </div>
        </div>

        {/* User Side */}
        <div className={cn(
             "h-full w-full md:w-1/2 flex flex-col items-center justify-between p-6 rounded-2xl transition-all duration-500",
             "bg-gradient-to-br from-emerald-500/10 to-teal-500/10 border border-emerald-500/20",
             callStatus === "LISTENING" && "ring-4 ring-emerald-500/30"
        )}>
            <div className="flex flex-col items-center gap-4 mt-8">
               <div className="relative">
                    <div className={cn("absolute inset-0 rounded-full bg-emerald-500 blur-2xl opacity-20 transition-all", callStatus === "LISTENING" && "opacity-50 scale-125")}></div>
                     <Image
                        src="/user-avatar.png"
                        alt="User"
                        width={140}
                        height={140}
                        className="object-cover relative z-10 rounded-full border-4 border-emerald-500/50"
                     />
               </div>
               <h3 className="text-xl font-bold text-emerald-100">{userName}</h3>
               <div className={cn(
                   "px-3 py-1 rounded-full text-xs font-mono uppercase tracking-wider transition-colors",
                   callStatus === "LISTENING" ? "bg-emerald-500 text-white animate-pulse" : "bg-emerald-500/20 text-emerald-300"
               )}>
                   {callStatus === "LISTENING" ? "Listening..." : "Ready"}
               </div>
           </div>

           <div className="w-full max-w-lg text-center mt-4 p-4 min-h-[100px] flex items-center justify-center">
                <p className="text-lg md:text-xl font-medium leading-relaxed text-emerald-100/90 italic">
                    "{transcript || "Listening for your answer..."}"
                </p>
           </div>
        </div>
      </div>

      {/* Control Bar */}
      <div className="h-24 bg-muted/40 backdrop-blur-md border-t border-white/5 flex items-center justify-center gap-6 px-4">
         {callStatus === CallStatus.FINISHED ? (
             <Button size="lg" className="rounded-full px-8 bg-green-600 hover:bg-green-700" onClick={() => window.location.href = '/'}>
                 Finish Interview
             </Button>
         ) : (
             <>
                <Button 
                    variant={callStatus === "LISTENING" ? "destructive" : "outline"}
                    size="icon"
                    className="w-14 h-14 rounded-full border-2"
                    onClick={() => callStatus === "LISTENING" ? stopListening() : startListening()}
                >
                    {callStatus === "LISTENING" ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
                </Button>
                
                <Button 
                    size="lg" 
                    className="rounded-full px-8 text-lg font-medium"
                    onClick={handleNextQuestion}
                >
                    Next Question
                </Button>
             </>
         )}
      </div>

    </div>
  );
};

export default Agent;


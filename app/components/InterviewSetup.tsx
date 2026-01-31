"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Mic, MicOff } from "lucide-react";
import { cn } from "@/lib/utils";
import Image from "next/image";

type Checkpoint = "ROLE" | "TECH" | "COUNT" | "CONFIRM";

export default function InterviewSetup() {
  const router = useRouter();
  const [currentMessage, setCurrentMessage] = useState("Hi! I'm your AI Interviewer. To get started, please tell me what role you are interviewing for?");
  const [inputValue, setInputValue] = useState("");
  const [checkpoint, setCheckpoint] = useState<Checkpoint>("ROLE");
  const [isListening, setIsListening] = useState(false);
  const [isAiSpeaking, setIsAiSpeaking] = useState(false);
  
  // Voice Refs
  const recognitionRef = useRef<any>(null); // eslint-disable-line @typescript-eslint/no-explicit-any

  // State to store collected data
  const [setupData, setSetupData] = useState({
    role: "",
    techStack: "",
    questionCount: "5",
  });

  // Text to Speech
  const speak = (text: string) => {
    if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(text);
        const voices = window.speechSynthesis.getVoices();
        const preferredVoice = voices.find(v => v.name.includes("Google US English") || v.name.includes("Samantha"));
        if (preferredVoice) utterance.voice = preferredVoice;
        utterance.rate = 1;
        
        setIsAiSpeaking(true);
        utterance.onend = () => setIsAiSpeaking(false);
        window.speechSynthesis.speak(utterance);
    }
  };

  // Initialize Speech Recognition
  useEffect(() => {
    if (typeof window !== 'undefined' && ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
        // @ts-expect-error - SpeechRecognition is not fully typed
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        recognitionRef.current = new SpeechRecognition();
        recognitionRef.current.continuous = false;
        recognitionRef.current.interimResults = false;
        recognitionRef.current.lang = 'en-US';

        recognitionRef.current.onresult = (event: any) => { // eslint-disable-line @typescript-eslint/no-explicit-any
            const transcript = event.results[0][0].transcript;
            setInputValue(transcript);
            setIsListening(false);
        };

        recognitionRef.current.onerror = (event: any) => { // eslint-disable-line @typescript-eslint/no-explicit-any
            console.error("Speech recognition error", event.error);
            setIsListening(false);
        };

        recognitionRef.current.onend = () => {
            setIsListening(false);
        };
    }
    
    // Initial Greeting
    setTimeout(() => {
        speak(currentMessage);
    }, 1000);
  }, []);

  const toggleListening = () => {
      if (!recognitionRef.current) {
          alert("Your browser does not support voice input.");
          return;
      }

      if (isListening) {
          recognitionRef.current.stop();
      } else {
          try {
            recognitionRef.current.start();
            setIsListening(true);
          } catch (e) {
              console.error(e);
          }
      }
  };

  const handleConfirm = () => {
      if (!inputValue) return;
      processResponse(inputValue);
      setInputValue("");
  };

  const processResponse = (userInput: string) => {
    let nextMessage = "";
    let nextCheckpoint = checkpoint;

    switch (checkpoint) {
      case "ROLE":
        setSetupData((prev) => ({ ...prev, role: userInput }));
        nextMessage = `Great! A ${userInput} role. What specific tech stack or topics should I focus on?`;
        nextCheckpoint = "TECH";
        break;
      case "TECH":
        setSetupData((prev) => ({ ...prev, techStack: userInput }));
        nextMessage = "Understood. How many questions would you like me to ask?";
        nextCheckpoint = "COUNT";
        break;
      case "COUNT":
        const count = parseInt(userInput.replace(/\D/g, ""));
        if (!count || count < 1 || count > 20) {
            nextMessage = "Please say a valid number between 1 and 20.";
             // Don't advance checkpoint
        } else {
            setSetupData((prev) => ({ ...prev, questionCount: count.toString() }));
            nextMessage = `Perfect. Starting your interview for ${setupData.role} with ${count} questions now.`;
            nextCheckpoint = "CONFIRM";
        }
        break;
      case "CONFIRM":
             // This state is just for transition
             return;
    }

    setCurrentMessage(nextMessage);
    setCheckpoint(nextCheckpoint);
    speak(nextMessage);

    // If finished, redirect after speech
    if (nextCheckpoint === "CONFIRM") {
        const query = new URLSearchParams({
            role: setupData.role,
            techStack: setupData.techStack,
            count: userInput.replace(/\D/g, "")
        }).toString();
        
        setTimeout(() => {
            router.push(`/interview?${query}`);
        }, 4000);
    }
  };


  return (
    <div className="flex flex-col h-full bg-background relative overflow-hidden">
      
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
                <p className="text-lg md:text-2xl font-medium leading-relaxed text-indigo-100 italic">
                    "{currentMessage}"
                </p>
           </div>
        </div>

        {/* User Side */}
        <div className={cn(
             "h-full w-full md:w-1/2 flex flex-col items-center justify-between p-6 rounded-2xl transition-all duration-500",
             "bg-gradient-to-br from-emerald-500/10 to-teal-500/10 border border-emerald-500/20",
             isListening && "ring-4 ring-emerald-500/30"
        )}>
            <div className="flex flex-col items-center gap-4 mt-8">
               <div className="relative">
                    <div className={cn("absolute inset-0 rounded-full bg-emerald-500 blur-2xl opacity-20 transition-all", isListening && "opacity-50 scale-125")}></div>
                     <Image
                        src="/user-avatar.png"
                        alt="User"
                        width={140}
                        height={140}
                        className="object-cover relative z-10 rounded-full border-4 border-emerald-500/50"
                     />
               </div>
               <h3 className="text-xl font-bold text-emerald-100">You</h3>
               <div className={cn(
                   "px-3 py-1 rounded-full text-xs font-mono uppercase tracking-wider transition-colors",
                   isListening ? "bg-emerald-500 text-white animate-pulse" : "bg-emerald-500/20 text-emerald-300"
               )}>
                   {isListening ? "Listening..." : "Ready"}
               </div>
           </div>

           <div className="w-full max-w-lg text-center mt-4 p-4 min-h-[100px] flex flex-col items-center justify-center gap-4">
                <p className="text-lg md:text-xl font-medium leading-relaxed text-emerald-100/90 italic">
                    "{inputValue || "Tap mic to speak..."}"
                </p>
                {inputValue && (
                     <Button 
                        onClick={handleConfirm}
                        className="rounded-full px-8 bg-green-600 hover:bg-green-700 animate-in fade-in zoom-in"
                    >
                        Confirm Answer
                    </Button>
                )}
           </div>
        </div>
      </div>

      {/* Control Bar */}
      <div className="h-24 bg-muted/40 backdrop-blur-md border-t border-white/5 flex items-center justify-center gap-6 px-4">
            <Button 
                variant={isListening ? "destructive" : "outline"}
                size="icon"
                className="w-16 h-16 rounded-full border-2 shadow-2xl"
                onClick={toggleListening}
            >
                {isListening ? <MicOff className="w-8 h-8" /> : <Mic className="w-8 h-8" />}
            </Button>
      </div>

    </div>
  );
}

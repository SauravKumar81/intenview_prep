import { db } from "@/firebase/admin";
import { google } from "@ai-sdk/google";
import { generateObject } from "ai";
import { z } from "zod";

export async function POST(req: Request) {
  try {
    const { userId, role, techStack, transcript, duration } = await req.json();

    // 1. Generate Feedback via AI
    const result = await generateObject({
      model: google("gemini-1.5-flash"),
      schema: z.object({
        totalScore: z.number().min(0).max(100),
        strengths: z.array(z.string()),
        weaknesses: z.array(z.string()),
        feedback: z.string(),
        questions: z.array(z.object({
             question: z.string(),
             userAnswer: z.string(),
             score: z.number().min(0).max(10),
             feedback: z.string(),
             idealAnswer: z.string()
        }))
      }),
      prompt: `Analyze the following interview transcript for a ${role} position (Tech Stack: ${techStack}).
      transcript: ${JSON.stringify(transcript)}
      
      Provide a detailed evaluation including:
      - A total score out of 100.
      - Key strengths and weaknesses.
      - For each question: a score (0-10), specific feedback on the answer, and an ideal better answer.`,
    });

    const assessment = result.object;

    // 2. Save Interview Metadata
    const interviewRef = db.collection("interviews").doc();
    await interviewRef.set({
      id: interviewRef.id,
      userId: userId || "guest",
      role,
      techStack,
      transcript, // Saving raw transcript too
      createdAt: new Date().toISOString(),
      duration
    });

    // 3. Save Feedback Analysis
    const feedbackRef = db.collection("feedback").doc();
    await feedbackRef.set({
      id: feedbackRef.id,
      interviewId: interviewRef.id,
      ...assessment,
      createdAt: new Date().toISOString()
    });

    return Response.json({ interviewId: interviewRef.id, feedbackId: feedbackRef.id });

  } catch (error) {
    console.error("Error saving interview:", error);
    return Response.json({ error: "Failed to save interview" }, { status: 500 });
  }
}

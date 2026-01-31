import { google } from "@ai-sdk/google";
import { generateObject } from "ai";
import { z } from "zod";

export async function POST(req: Request) {
  try {
    const { role, techStack, count } = await req.json();

    // Manual fallback questions as requested
    const manualQuestions = [
      `Can you tell me about yourself and your background in ${role}?`,
      `What are your core strengths and weaknesses as a ${role}?`,
      `Describe a challenging project you worked on using ${techStack}.`,
      `How do you handle tight deadlines and pressure?`,
      `Explain a complex technical concept related to ${techStack} to a non-technical person.`,
      `How do you stay updated with the latest trends in ${techStack}?`,
      `Tell me about a time you had a conflict with a team member and how you resolved it.`,
      `What is your preferred workflow or development methodology?`,
      `Describe a time you made a mistake in your code and how you fixed it.`,
      `Where do you see yourself in the next 5 years in your career?`
    ];

    // Attempt AI generation, but fallback to manual if it fails or return manual directly if desired.
    // For now, returning manual questions as requested.
    return Response.json({ questions: manualQuestions });

    /* 
    // Original AI Logic (Preserved)
    const result = await generateObject({
      model: google("gemini-1.5-flash"),
      schema: z.object({
        questions: z.array(z.string()),
      }),
      prompt: `Create a list of ${count} interview questions for a ${role} position focusing on ${techStack}. 
      The questions should be concise and conversational suitable for a voice interview. 
      Do not include numbering or prefixes like "Question 1".`,
    });

    return Response.json({ questions: result.object.questions }); 
    */
  } catch (error) {
    console.error("Error generating questions:", error);
    return Response.json({ 
        questions: [
            "Tell me about yourself.", 
            "What are your strengths?", 
            "What are your weaknesses?",
            "Why do you want this job?",
            "Describe a challenge you faced."
        ] 
    });
  }
}

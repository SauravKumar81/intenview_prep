import { generateText } from "ai";
import { google } from "@ai-sdk/google";
import { getRandomInterviewCover } from "@/utils";
import { db } from "@/firebase/admin";


export async function GET() {
  return Response.json({ success: true, data: "THANK YOU" }, { status: 200 });
}

export async function POST(request: Request) {
  const { type, role, level, techstack, amount, userid } = await request.json();

  try {
    const { text:questions } = await generateText({
      model: google("gemini-2.5-flash-preview-09-2025"),
      prompt: `
Prepare interview questions for a job interview.

The job role is: ${role}.
The experience level required is: ${level}.
The tech stack used in the job is: ${techstack}.
The questions should lean more towards: ${type} (behavioural/technical).
The number of questions needed is: ${amount}.

Please return ONLY the questions, with no explanation or extra text.
The questions will be read by a voice assistant, so avoid using "/" or "*" or any special symbols.
Return the output formatted exactly like this:
["Question 1", "Question 2", "Question 3"]
  `,
    });

    const interview ={
        role,type, level,
        techstack: techstack.split(','),
        questions:JSON.parse(questions),
        userId:userid,
        finalized:true,
        coverImage:getRandomInterviewCover(),
        createdAt: new Date().toISOString()
    }

    await db.collection("intervies").add(interview);

    return Response.json({success:true},{status:200})
  } catch (error) {
    console.error(error);
  }
}

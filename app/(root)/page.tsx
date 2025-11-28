import { Button } from "@/components/ui/button";
import { dummyInterviews } from "@/constants";
import Image from "next/image";
import Link from "next/link";

import InterviewCard from "../components/InterviewCard";

const page = () => {
  return (
    <>
      <section className="card-cta">
        <div className="flex flex-col gap-6 max-w-lg">
          <h2>Get Interview-Ready with Ai-Powered Practice & Feedback</h2>
          <p className="text-lg">
            {" "}
            Practice on real interview questions and receive instant feedback to
            improve your skills.
          </p>
          <Button asChild className="btn-primary max-sm:w-full">
            <Link href="/interview">Start an Interview</Link>
          </Button>
        </div>
        <Image
          src="/robot.png"
          alt="robot"
          height={400}
          width={400}
          className="max-sm:hidden"
        />
      </section>
      <section className="flex flex-col gap-6 mt-8 ">
        <h2>Your Interview</h2>
        <div className="interview-section">
          {dummyInterviews.map((interview)=>(
            <InterviewCard { ... interview } key={interview.id}/>
          ))}
        </div>
      </section>
      <section className="flex flex-col gap-6 mt-8 ">
        <h2>Take an Interview</h2>
        <div className="interview-section">
          {dummyInterviews.map((interview)=>(
            <InterviewCard { ... interview } key={interview.id}/>
          ))}
          <p> You haven&apos;t taken any interviews yet. Click the button above to start one.</p>
        </div>
      </section>
    </>
  );
};

export default page;

import React from "react";
import dayjs from "dayjs";
import { getRandomInterviewCover } from "@/lib/utils";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import DisplayTechIcons from "./DisplayTechIcons";
const InterviewCard = ({
  interviewId,
  userId,
  role,
  type,
  techstack,
  createdAt,
}: InterviewCardProps) => {
  const feedback = null as Feedback | null;
  const normalizatonTypes = /mix/gi.test(type) ? "Mixed" : type;
  const formattedDate = dayjs(
    feedback?.createdAt || createdAt || new Date()
  ).format("MMM D, YYYY");

  return (
    <div className="card-border w-[360px] max-sm:w-full min-h-96">
      <div className="card-interview">
        <div>
          <div className="absolute  top-0 right-0 w-fit px-4 py-3 rounded-bl-lg bg-light-600">
            <p className="badge-text">{normalizatonTypes}</p>
          </div>
          <Image
            src={getRandomInterviewCover()}
            alt="coverImage"
            width={80}
            height={80}
            className="rounded-full object-fill size-[80px]"
          ></Image>
          <h3 className="mt-5 capitalize">{role} Interview</h3>
          <div className="flex flex-row gap-2 mt-3">
            <div className="flex flex-row gap-2">
              <Image
                src="/calendar.svg"
                alt="calendar"
                width={20}
                height={20}
              ></Image>
              <p>{formattedDate}</p>
            </div>
            <div className="flex flex-row gap-2">
              <Image
                src="/star.svg"
                alt="techstack"
                width={20}
                height={20}
              ></Image>
              <p>{feedback?.totalScore || "---"}/100</p>
            </div>
          </div>
          <p className="line-clamp-2 mt-5">
            {feedback?.finalAssessment ||
              "No feedback available yet. Complete the interview to receive detailed feedback."}
          </p>
        </div>
        <div className="mt-6 flex flex-wrap gap-2">
                <DisplayTechIcons techStack={techstack} />
              <Button className="btn-primary">
                <Link href ={feedback ? `/interviews/${interviewId}/feedback`:`/interviews/${interviewId}`}>
                </Link>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default InterviewCard;

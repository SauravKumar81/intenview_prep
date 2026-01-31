
import Agent from "@/app/components/Agent";
import InterviewSetup from "@/app/components/InterviewSetup";

type SearchParams = { [key: string]: string | string[] | undefined }

const page = async ({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) => {
  const params = await searchParams;
  const hasSetup = params.role && params.count;

  return (
    <>
      {hasSetup ? (
         <div className="h-full">
            <Agent 
              userName="You" 
              userId="user1" 
              type="generate" 
              role={params.role as string}
              techStack={params.techStack as string}
              questionCount={Number(params.count)}
            />
         </div>
      ) : (
          <InterviewSetup />
      )}
    </>
  )
};

export default page;

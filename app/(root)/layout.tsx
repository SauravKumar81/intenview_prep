import { isAuthentication } from "@/lib/actions/auth.action";
import { redirect } from "next/navigation"
import Image from "next/image";
import Link from "next/link";
import { ReactNode } from "react";
const Rootlayout = async({children}:{children: ReactNode}) => {
  const isUserAuthenticated = await isAuthentication();

  if(!isUserAuthenticated) redirect('/sign-in');
  return (
    <div className="root-layout">
      <nav>
        <Link href="/" className="items-center flex gap-2 ">
          <Image src="/logo.svg" alt="logo" height={32} width={38} />
          <h2>Inter_Prep</h2>
        </Link>
      </nav>
      {children}
    </div>
  )
}

export default Rootlayout
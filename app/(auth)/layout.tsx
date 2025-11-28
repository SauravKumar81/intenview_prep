import { isAuthentication } from "@/lib/actions/auth.action";
import { redirect } from "next/navigation";
import { ReactNode } from "react";
import { Toaster } from "sonner";

const AuthLayout = async({ children }: { children: ReactNode }) => {
  const isUserAuthenticated = await isAuthentication();
  if(isUserAuthenticated)redirect('/')
   
  return <div className="auth-layout">{children}<Toaster /></div>;
};

export default AuthLayout;

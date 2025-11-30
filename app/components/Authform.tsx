"use client";

import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import Image from "next/image";
import Link from "next/link";
import { toast } from "sonner";
import FormField from "./FormField";
import { useRouter } from "next/navigation";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth";
import { signIN, signUp } from "@/lib/actions/auth.action";
import { auth } from "@/firebase/client";

type FormType = "sign-in" | "sign-up";
const authformSchema = (type: FormType) => {
  return z.object({
    name:
      type === "sign-up"
        ? z.string().min(3, { message: "Name must be at least 3 characters." })
        : z.string().optional(),

    email: z.string().email({ message: "Invalid email address." }),

    password: z.string().min(6, {
      message: "Password must be at least 6 characters.",
    }),
  });
};
const Authfrorm = ({ type }: { type: FormType }) => {
  const router = useRouter();

  const formSchema = authformSchema(type);
  // 1. Define your form.
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
    },
  });

  // 2. Define a submit handler.
  async function onSubmit(values: z.infer<typeof formSchema>) {

    try {

      if (type === "sign-up") {

        // Handle sign-in logic here
        const { name, email, password } = values;
        // ths is for auth (client side )user creation "createUserWithEmailAndPassword: auth, email, password"
        const userCredentials = await createUserWithEmailAndPassword(auth, email, password);
        const result = await signUp({
          uid: userCredentials.user.uid,
          name:name!,
          email,
          password,
        })
        if(!result?.success){
          toast.error(result?.message);
          return;
        }

        toast.success("Account created successfully");
        router.push("/sign-in");
      } else {
        // Handle sign-up logic here
        const { email, password } = values;
        // Sign in the user with Firebase Authentication
        const userCredentials =  await signInWithEmailAndPassword(auth, email,password);
        const idToken = await userCredentials.user.getIdToken();
        if(!idToken){
          toast.error("Failed to retrieve ID token.");
          return;

        }
        await signIN({
          email,
          idToken,
        })

        toast.success("sign-in account successfully");
        router.push("/");
      }
    } catch (error) {
      console.log(error);
      toast.error(`Something went wrong. Please try again: ${error}`);
    }
  }
  const isSignIn = type === "sign-in";
  return (
    <div>
      <div className="flex justify-center items-center min-h-screen m-5 scroll-none">
        <div className="flex flex-col gap-6 card py-14 px-10 m-auto">
          <div className="flex flex-row gap-2 justify-center">
            <Image src="/logo.svg" alt="logo" height={32} width={38} />
            <h2 className="text-primary-100">Inter_Prep</h2>
          </div>

          <h3>Practice job interviews with AI</h3>

          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="w-full space-y-6 mt-4 form "
            >
              {!isSignIn && (
                <FormField
                  control={form.control}
                  name="name"
                  label="Name"
                  placeholder="Enter your name"
                />
              )}
              <FormField
                control={form.control}
                name="email"
                label="Email"
                placeholder="Enter your email"
                type="email"
              />
              <FormField
                control={form.control}
                name="password"
                label="Password"
                placeholder="Enter your password"
                type="password"
              />
              <Button className="btn" type="submit">
                {isSignIn ? "Sign In" : "Sign Up"}
              </Button>
            </form>
          </Form>

          <p className="text-center">
            {isSignIn ? " New to PrepWise? " : "  Already have an account ? "}
            
            <Link
              href={!isSignIn ? "/sign-in" : "/sign-up"}
              className="font-bold text-user-primary ml-1"
            >
              {isSignIn ? "  Create an account" : "Sign In"}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Authfrorm;

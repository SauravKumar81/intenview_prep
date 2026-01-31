"use client";

import { useState } from "react";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { auth } from "@/firebase/client";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { Loader2 } from "lucide-react";

export default function SignUpPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      // 1. Create User
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // 2. Add Profile (Name + Random Avatar)
      // Using DiceBear for deterministic random avatars based on UID
      const photoURL = `https://api.dicebear.com/9.x/avataaars/svg?seed=${user.uid}`;

      await updateProfile(user, {
        displayName: name,
        photoURL: photoURL
      });

      router.push("/"); // Redirect to home on success
    } catch (err: any) { // eslint-disable-line @typescript-eslint/no-explicit-any
      console.error(err);
      if (err.code === 'auth/email-already-in-use') {
          setError("Email is already registered");
      } else {
          setError("Failed to create account");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
      <div className="w-full max-w-md bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-xl">
        <h2 className="text-2xl font-bold text-center mb-6">Create Account</h2>
        
        {error && (
            <div className="bg-red-500/10 text-red-500 p-3 rounded-lg text-sm text-center mb-4">
                {error}
            </div>
        )}

        <form onSubmit={handleSignUp} className="space-y-4">
          <div>
            <label className="text-sm font-medium">Full Name</label>
            <Input 
                type="text" 
                placeholder="John Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
            />
          </div>
          <div>
            <label className="text-sm font-medium">Email</label>
            <Input 
                type="email" 
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
            />
          </div>
          <div>
            <label className="text-sm font-medium">Password</label>
            <Input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
            />
          </div>
          
          <Button type="submit" className="w-full" disabled={loading}>
             {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Sign Up"}
          </Button>
        </form>

        <div className="mt-6 text-center text-sm">
            <p className="text-muted-foreground">
                Already have an account?{" "}
                <Link href="/sign-in" className="text-indigo-500 hover:underline font-medium">
                    Sign In
                </Link>
            </p>
        </div>
      </div>
    </div>
  );
}
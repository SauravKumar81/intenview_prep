"use client";

import { useState } from "react";
import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from "@/firebase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { Loader2 } from "lucide-react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    setError("");

    try {
      await sendPasswordResetEmail(auth, email);
      setMessage("Password reset email sent! Check your inbox.");
    } catch (err: any) { // eslint-disable-line @typescript-eslint/no-explicit-any
      console.error(err);
      setError("Failed to send reset email. Please check the email address.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
      <div className="w-full max-w-md bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-xl">
        <h2 className="text-2xl font-bold text-center mb-6">Reset Password</h2>
        
        {message && (
            <div className="bg-green-500/10 text-green-500 p-3 rounded-lg text-sm text-center mb-4">
                {message}
            </div>
        )}

        {error && (
            <div className="bg-red-500/10 text-red-500 p-3 rounded-lg text-sm text-center mb-4">
                {error}
            </div>
        )}

        <form onSubmit={handleReset} className="space-y-4">
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
          
          <Button type="submit" className="w-full" disabled={loading}>
             {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Send Reset Link"}
          </Button>
        </form>

        <div className="mt-6 text-center text-sm">
            <Link href="/sign-in" className="text-indigo-500 hover:underline font-medium">
                Back to Sign In
            </Link>
        </div>
      </div>
    </div>
  );
}

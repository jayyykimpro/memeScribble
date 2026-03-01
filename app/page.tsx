"use client";

import { MemeScribbleHero } from "@/components/main/meme-hero";
import { useAuth } from "@/lib/context/auth-context";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function Home() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) {
      router.replace("/dashboard");
    }
  }, [user, loading, router]);

  if (loading || user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white font-mono">
        <p className="text-xl font-bold animate-pulse text-black">Checking vibe...</p>
      </div>
    );
  }

  return (
    <main>
      <MemeScribbleHero
        title="memeScribble"
        description="Just upload a pic and watch our AI turn you into the most pathetic, goofy meme doodle imaginable. No skills required."
        buttonText="Make me a meme"
        buttonHref="#"
      />
    </main>
  );
}
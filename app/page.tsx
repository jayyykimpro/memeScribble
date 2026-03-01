"use client";

import { MemeScribbleHero } from "@/components/main/meme-hero";

export default function Home() {
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
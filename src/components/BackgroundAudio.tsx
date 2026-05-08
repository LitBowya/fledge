import { useEffect, useRef } from "react";

const WORSHIP_AUDIO_SRC = "/audio/worship.mp3";

export default function BackgroundAudio() {
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    audio.volume = 0.1;

    let hasStarted = false;

    const removeInteractionListeners = () => {
      window.removeEventListener("pointerdown", handleFirstInteraction);
      window.removeEventListener("keydown", handleFirstInteraction);
      window.removeEventListener("touchstart", handleFirstInteraction);
    };

    const tryPlay = async (source: "autoplay" | "interaction") => {
      try {
        await audio.play();
        hasStarted = true;
        removeInteractionListeners();
      } catch (error) {
        if (source === "autoplay") {
          console.warn("Autoplay blocked by browser; waiting for user interaction.", error);
          return;
        }
        console.error("Audio playback failed after user interaction.", error);
      }
    };

    const handleFirstInteraction = () => {
      if (hasStarted) return;
      void tryPlay("interaction");
    };

    void tryPlay("autoplay");

    window.addEventListener("pointerdown", handleFirstInteraction);
    window.addEventListener("keydown", handleFirstInteraction);
    window.addEventListener("touchstart", handleFirstInteraction);

    return () => {
      removeInteractionListeners();
    };
  }, []);

  return (
    <audio
      ref={audioRef}
      src={WORSHIP_AUDIO_SRC}
      autoPlay
      loop
      playsInline
      preload="auto"
      aria-hidden="true"
      className="hidden"
    />
  );
}

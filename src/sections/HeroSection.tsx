import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import SplitText from "gsap/SplitText";
import FlyerSection from "./FlyerSection";

gsap.registerPlugin(SplitText);

export default function HeroSection() {
  const containerRef = useRef<HTMLElement | null>(null);

  useGSAP(
    () => {
      const container = containerRef.current;
      if (!container) return;

      const applyCoverMask = () => {
        const target = container.querySelector<HTMLElement>(".cover");
        if (!target) return;

        const y = gsap.getProperty(target, "--mask-y");
        const size = gsap.getProperty(target, "--mask-size");
        const mask = `radial-gradient(circle ${size} at 50% ${y}, transparent 99%, black 100%)`;

        target.style.webkitMaskImage = mask;
        target.style.maskImage = mask;
      };

      const tl = gsap.timeline();
      const worshipSplitText = SplitText.create(".worship", {
        type: "chars",
      });

      // We animate custom CSS variables instead of complex strings
      // --mask-y: position from top (-20% to 50%)
      // --mask-size: radius of the hole
      gsap.set(".cover", {
        "--mask-y": "-20%",
        "--mask-size": "56px",
        maskImage:
          "radial-gradient(circle var(--mask-size) at 50% var(--mask-y), transparent 99%, black 100%)",
        WebkitMaskImage:
          "radial-gradient(circle var(--mask-size) at 50% var(--mask-y), transparent 99%, black 100%)",
      });

      tl.from(".scripture", {
        y: -100,
        opacity: 0,
        duration: 1,
        stagger: 0.3,
      })
      .from(worshipSplitText.chars, {
        y: 200,
        opacity: 0,
        duration: 1,
        stagger: {
          amount: 0.25,
          from: "random",
        },
      })
        // 1. Drop and Bounce (Animating the Y variable)
        .to(".cover", {
          "--mask-y": "50%",
          duration: 1.5,
          ease: "bounce.out",
          onUpdate: applyCoverMask,
        })
        // 2. Scale up (Animating the Size variable)
        .to(
          ".cover",
          {
            "--mask-size": "1500px",
            duration: 1.5,
            ease: "power4.inOut",
            onUpdate: applyCoverMask,
          },
          "+=0.3",
        );
    },
    { scope: containerRef, revertOnUpdate: true },
  );

  return (
    <section ref={containerRef} className="relative">
      <FlyerSection />

      <div className="cover min-h-screen absolute inset-0 z-30 pointer-events-none bg-black flex flex-col items-center justify-center gap-20">
        <div className="relative border w-full h-full">
          <div className="scripture absolute top-20 left-1/2 -translate-x-1/2 text-center font-bold text-[rgba(248,208,110,1)] w-full">
            <p className="italic">(JOHN 4:23-24)</p>
            <p className="text-xl">IN SPIRIT AND IN TRUTH</p>
            <p className="text-xl">THE UNFILTERED WORSHIP</p>
          </div>

          <div className="h-28 w-28" />

          <div className=" absolute bottom-20 left-1/2 -translate-x-1/2 text-center font-bold text-[rgba(248,208,110,1)] w-full">
            <h1 className=" worship display-title wrap-break-word text-[10vw] font-black leading-[0.9] text-center uppercase w-full">
              Worship <br /> Unscripted
            </h1>
          </div>
        </div>
      </div>
    </section>
  );
}

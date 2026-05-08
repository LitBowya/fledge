import { forwardRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ArrowBigDown } from "lucide-react";

import { Button } from "#/components/ui/button";

const ArrowButton = forwardRef<
  HTMLButtonElement,
  React.ComponentProps<typeof Button>
>((props, ref) => {
  useGSAP(() => {
    gsap.to(".arrow", {
      y: 15,
      duration: 0.6,
      repeat: -1,
      yoyo: true,
      ease: "power1.inOut",
    });
  });

  return (
    <div className="fixed z-100 bottom-5 right-5 flex flex-col items-center justify-center">
      <ArrowBigDown className=" text-black arrow size-12" />

      <Button
        ref={ref}
        size="lg"
        className="font-bold rounded-full w-14 h-14 cursor-pointer"
        {...props}
      >
        RSVP
      </Button>
    </div>
  );
});

ArrowButton.displayName = "ArrowButton";

export default ArrowButton;

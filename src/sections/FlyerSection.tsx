import { useState, useRef } from "react";
import RegisterDialog from "#/sections/RegisterDialog";
import Navbar from "#/components/Navbar";

export const FLYER_IMAGES = [
  { id: 1, src: "/images/worship-background.jpeg", alt: "Main Event" },
  { id: 2, src: "/images/worship-1.jpeg", alt: "Special Guest" },
  { id: 3, src: "/images/worship-2.jpeg", alt: "Youth Night" },
  { id: 4, src: "/images/worship-3.jpeg", alt: "Sunday Service" },
] as const;

export default function FlyerSection() {
  const marqueeRef = useRef(null);
  const [flyers, setFlyers] = useState([...FLYER_IMAGES]);

  const handleSwap = (index: number) => {
    const newFlyers = [...flyers];
    const actualIndex = index % flyers.length; // Handle duplicated items
    [newFlyers[0], newFlyers[actualIndex]] = [
      newFlyers[actualIndex],
      newFlyers[0],
    ];
    setFlyers(newFlyers);
  };

  // We duplicate the side flyers (slice(1)) to create a seamless loop
  const sideFlyers = flyers.slice(1);

  return (
    <section className="min-h-screen w-full flex items-center p-4 lg:p-8 bg-[rgb(255,252,230)]">
      <Navbar />
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 max-w-7xl mx-auto w-full border border-white/20 rounded-3xl p-6 overflow-hidden">
        {/* LARGE FLYER */}
        <div className="relative lg:col-span-3 z-20">
          <img
            src={flyers[0].src}
            alt={flyers[0].alt}
            className="w-full lg:h-[800px] py-4 object-contain rounded-2xl border border-white/10"
            loading="eager"
            decoding="async"
            fetchPriority="high"
          />
        </div>

        {/* MARQUEE SIDEBAR */}
        <div className="relative h-[200px] lg:h-[750px] overflow-x-scroll group">
          <div ref={marqueeRef} className="flex lg:flex-col gap-4">
            {sideFlyers.map((flyer, idx) => (
              <div
                key={`${flyer.id}-${idx}`}
                onClick={() => handleSwap((idx % sideFlyers.length) + 1)}
                className="cursor-pointer min-w-[150px] lg:min-w-full"
              >
                <img
                  src={flyer.src}
                  alt={flyer.alt}
                  className="w-full h-32 lg:h-58 object-cover rounded-xl border-2 border-transparent hover:border-yellow-400 transition-all opacity-60 hover:opacity-100"
                  loading="lazy"
                  decoding="async"
                />
              </div>
            ))}
          </div>
        </div>
      </div>

      <div>
        <RegisterDialog />
      </div>
    </section>
  );
}

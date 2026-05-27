"use client";

import { useState, useRef, useEffect } from "react";

export default function WorkProcessSection() {
  const [sliderPositions, setSliderPositions] = useState<{ [key: number]: number }>({});
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const containerRefs = useRef<{ [key: number]: HTMLDivElement | null }>({});

  const steps = [
    {
      title: "Surface Preparation",
      desc: "Wall repair, sanding, priming, and prep before transformation begins.",
      beforeImage: "/landingPageImages/drywall.jpg",
      afterImage: "/landingPageImages/drywall-after.png",
    },
    {
      title: "Floor Restoration",
      desc: "Hardwood sanding, polishing, tile replacement, and leveling.",
      beforeImage: "/landingPageImages/floor.png",
      afterImage: "/landingPageImages/floor-after.png",
    },
    {
      title: "Cabinet Construction",
      desc: "Custom cabinetry build out, framing, installation, and finishing paint.",
      beforeImage: "/landingPageImages/cabinet.png",
      afterImage: "/landingPageImages/cabinet-after.png",
    },
    {
      title: "Commercial / Salon Renovation",
      desc: "Nail salons, spa floors, tile rework, lighting, and interior layout rebuild.",
      beforeImage: "/landingPageImages/salon.png",
      afterImage: "/landingPageImages/salon-after.png",
    },
  ];

  // Handle drag/move for both mouse and touch
  const handleMove = (index: number, clientX: number) => {
    const container = containerRefs.current[index];
    if (!container) return;

    const rect = container.getBoundingClientRect();
    let x = clientX - rect.left;
    
    // Constrain to container bounds
    x = Math.min(Math.max(x, 0), rect.width);
    
    // Calculate percentage (0-100)
    const percentage = (x / rect.width) * 100;
    
    setSliderPositions(prev => ({ ...prev, [index]: percentage }));
  };

  // Mouse event handlers
  const handleMouseDown = (index: number, e: React.MouseEvent) => {
    e.preventDefault();
    setActiveIndex(index);
    handleMove(index, e.clientX);
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (activeIndex !== null) {
      handleMove(activeIndex, e.clientX);
    }
  };

  const handleMouseUp = () => {
    setActiveIndex(null);
  };

  // Touch event handlers for mobile
  const handleTouchStart = (index: number, e: React.TouchEvent) => {
    e.preventDefault();
    setActiveIndex(index);
    const touch = e.touches[0];
    if (touch) {
      handleMove(index, touch.clientX);
    }
  };

  const handleTouchMove = (e: TouchEvent) => {
    if (activeIndex !== null) {
      e.preventDefault();
      const touch = e.touches[0];
      if (touch) {
        handleMove(activeIndex, touch.clientX);
      }
    }
  };

  const handleTouchEnd = () => {
    setActiveIndex(null);
  };

  // Add global event listeners
  useEffect(() => {
    if (activeIndex !== null) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      window.addEventListener('touchmove', handleTouchMove, { passive: false });
      window.addEventListener('touchend', handleTouchEnd);
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleTouchEnd);
    };
  }, [activeIndex]);

  return (
    <section className="w-full bg-white py-24">
      {/* HEADER */}
      <div className="mx-auto max-w-5xl px-6 text-center">
        <h2 className="text-4xl md:text-6xl font-semibold tracking-tight text-gray-900">
          From Skeleton to Masterpiece
        </h2>

        <p className="mt-5 text-gray-600 text-lg">
          Every project starts raw — exposed walls, unfinished floors, and open frames.
          We transform structure into precision-built spaces.
        </p>
      </div>

      {/* GRID */}
      <div className="mx-auto mt-16 grid max-w-7xl grid-cols-1 gap-10 px-6 md:grid-cols-2">
        {steps.map((step, i) => {
          const sliderPosition = sliderPositions[i] ?? 50;
          
          return (
            <div
              key={i}
              className="relative overflow-hidden rounded-2xl shadow-lg"
            >
              <div 
                ref={(el) => { containerRefs.current[i] = el; }}
                className="relative h-[380px] w-full select-none touch-none"
                onMouseDown={(e) => handleMouseDown(i, e)}
                onTouchStart={(e) => handleTouchStart(i, e)}
              >
                {/* Before Image (full image) */}
                <div
                  className="absolute inset-0 bg-cover bg-center"
                  style={{ backgroundImage: `url('${step.beforeImage}')` }}
                />
                
                {/* After Image (clipped based on slider position) */}
                <div
                  className="absolute inset-0 bg-cover bg-center"
                  style={{
                    backgroundImage: `url('${step.afterImage}')`,
                    clipPath: `inset(0 0 0 ${sliderPosition}%)`,
                  }}
                />
                
                {/* Slider Handle */}
                <div
                  className="absolute top-0 bottom-0 w-1 bg-white shadow-lg cursor-ew-resize touch-none"
                  style={{ left: `${sliderPosition}%` }}
                >
                  {/* Drag handle button - easier to grab on mobile */}
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 bg-white rounded-full shadow-lg flex items-center justify-center cursor-grab active:cursor-grabbing">
                    <svg className="w-5 h-5 text-gray-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l4-4 4 4m0 6l-4 4-4-4" />
                    </svg>
                  </div>
                </div>

                {/* Instruction overlay - shows on first load */}
                {sliderPositions[i] === undefined && (
                  <div className="absolute bottom-20 left-1/2 -translate-x-1/2 bg-black/60 text-white text-xs px-3 py-1.5 rounded-full whitespace-nowrap pointer-events-none animate-pulse">
                    👆 Drag to see transformation
                  </div>
                )}
              </div>

              {/* Text Overlay */}
              <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/80 via-black/30 to-transparent">
                <div className="flex gap-2 mb-2">
                  <span className="text-xs font-semibold text-white/70 bg-black/50 px-2 py-0.5 rounded-full">
                    BEFORE
                  </span>
                  <span className="text-xs font-semibold text-white/70 bg-black/50 px-2 py-0.5 rounded-full">
                    AFTER
                  </span>
                </div>
                <h3 className="text-2xl font-semibold text-white">
                  {step.title}
                </h3>
                <p className="mt-2 text-white/80 text-sm">
                  {step.desc}
                </p>
                <p className="mt-2 text-xs text-white/60 flex items-center gap-1">
                  <span>💡</span> Drag the slider — works on touch screens too
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
"use client";

import { useEffect, useState } from "react";
import { motion, useMotionValue, useSpring, useTransform, animate } from "framer-motion";
import { cn } from "@/lib/utils";

export function AnimatedNumber({ value }: { value: number | string }) {
  const [isMounted, setIsMounted] = useState(false);
  const numericValue = typeof value === 'string' ? parseFloat(value) : value;
  const count = useMotionValue(0);
  const rounded = useTransform(count, (latest) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(Math.floor(latest));
  });

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsMounted(true);
    const controls = animate(count, numericValue, { duration: 0.8, ease: "easeOut" });
    return () => controls.stop();
  }, [numericValue, count]);

  return (
    <motion.span suppressHydrationWarning>
      {isMounted ? rounded : new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(0)}
    </motion.span>
  );
}

export function SpotlightCard({ children, className, color = "rgba(255,255,255,0.05)", noMovement = false, ...props }: React.ComponentPropsWithoutRef<typeof motion.div> & { color?: string, noMovement?: boolean }) {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const rotateX = useSpring(useTransform(mouseY, [-200, 200], [noMovement ? 0 : 7, noMovement ? 0 : -7]), { stiffness: 150, damping: 25 });
  const rotateY = useSpring(useTransform(mouseX, [-200, 200], [noMovement ? 0 : -7, noMovement ? 0 : 7]), { stiffness: 150, damping: 25 });

  // Parallax: Nội dung di chuyển lệch pha để tạo chiều sâu
  const tx = useSpring(useTransform(mouseX, [-200, 200], [noMovement ? 0 : -6, noMovement ? 0 : 6]), { stiffness: 150, damping: 25 });
  const ty = useSpring(useTransform(mouseY, [-200, 200], [noMovement ? 0 : -6, noMovement ? 0 : 6]), { stiffness: 150, damping: 25 });

  function handleMouseMove({ currentTarget, clientX, clientY }: React.MouseEvent<HTMLDivElement>) {
    const { left, top, width, height } = currentTarget.getBoundingClientRect();
    mouseX.set(clientX - (left + width / 2));
    mouseY.set(clientY - (top + height / 2));
  }

  function handleMouseLeave() {
    mouseX.set(0);
    mouseY.set(0);
  }

  return (
    <motion.div
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={cn("relative group bg-[#0a0a0a]/60 backdrop-blur-2xl border border-white/5 rounded-3xl overflow-hidden transform-gpu transition-all duration-300 hover:border-white/20", className)}
      style={{ rotateX, rotateY, perspective: 1200 }}
      {...props}
    >
      {/* Glass Noise Surface */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.03] mix-blend-overlay scale-[2]" 
           style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }} 
      />

      {/* Spotlight Effect Layer */}
      <motion.div
        className="pointer-events-none absolute -inset-px rounded-3xl opacity-0 transition duration-300 group-hover:opacity-60"
        style={{
          background: useTransform(
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            [mouseX, mouseY] as any,
            ([x, y]: [number, number]) => `radial-gradient(450px circle at ${x + 250}px ${y + 150}px, ${color}, transparent)`
          ),
        }}
      />
      
      {/* Parallax Content Layer */}
      <motion.div style={{ x: tx as unknown as number, y: ty as unknown as number }} className="relative z-10 w-full h-full">
        {children}
      </motion.div>
    </motion.div>
  );
}

export function MagneticButton({ children, className }: { children: React.ReactNode, className?: string }) {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const springX = useSpring(x, { stiffness: 150, damping: 15 });
  const springY = useSpring(y, { stiffness: 150, damping: 15 });

  function handleMouseMove(e: React.MouseEvent<HTMLDivElement>) {
    const { clientX, clientY, currentTarget } = e;
    const { left, top, width, height } = currentTarget.getBoundingClientRect();
    const centerX = left + width / 2;
    const centerY = top + height / 2;
    
    // Magnetic pull to mouse - subtle distance factor
    x.set((clientX - centerX) * 0.4);
    y.set((clientY - centerY) * 0.4);
  }

  function handleMouseLeave() {
    x.set(0);
    y.set(0);
  }

  return (
    <motion.div
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ x: springX, y: springY }}
      className={cn("relative z-30 transition-shadow p-6 -m-6", className)}
    >
      {children}
    </motion.div>
  );
}

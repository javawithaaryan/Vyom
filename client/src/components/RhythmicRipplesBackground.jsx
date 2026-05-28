import React, { useRef, useEffect } from "react";

const RhythmicRipplesBackground = ({
  children,
  backgroundColor = "#0a0b1e",
  rippleColor = "rgba(93, 208, 226, 0.06)",
  rippleCount = 14,
  rippleSpeed = 0.3,
}) => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;

    if (!canvas) return;

    const ctx = canvas.getContext("2d");

    if (!ctx) return;

    let animationFrameId;
    let ripples = [];

    let width = 0;
    let height = 0;

    class Ripple {
      constructor() {
        this.reset(true);
      }

      reset(initial = false) {
        this.x = Math.random() * width;
        this.y = Math.random() * height;

        this.radius = initial
          ? Math.random() * 220
          : 0;

        this.maxRadius =
          Math.random() * 260 + 120;

        this.speed =
          Math.random() * rippleSpeed + 0.08;
      }

      update() {
        this.radius += this.speed;

        if (this.radius >= this.maxRadius) {
          this.reset();
        }
      }

      draw() {
        const centerX = width / 2;
        const centerY = height / 2;

        const dx = this.x - centerX;
        const dy = this.y - centerY;

        const distance = Math.sqrt(
          dx * dx + dy * dy
        );

        const maxDistance = Math.sqrt(
          centerX * centerX +
            centerY * centerY
        );

        // Fade ripples near content center
        const centerFade =
          distance / maxDistance;

        const alpha =
          (1 - this.radius / this.maxRadius) *
          centerFade *
          0.55;

        ctx.beginPath();

        ctx.arc(
          this.x,
          this.y,
          this.radius,
          0,
          Math.PI * 2
        );

        ctx.strokeStyle = `rgba(93, 208, 226, ${alpha})`;

        ctx.lineWidth = 1;

        ctx.stroke();
      }
    }

    const setupCanvas = () => {
      width = window.innerWidth;
      height = window.innerHeight;

      canvas.width = width;
      canvas.height = height;

      ripples = Array.from(
        { length: rippleCount },
        () => new Ripple()
      );
    };

    const animate = () => {
      ctx.clearRect(0, 0, width, height);

      ripples.forEach((ripple) => {
        ripple.update();
        ripple.draw();
      });

      animationFrameId =
        requestAnimationFrame(animate);
    };

    setupCanvas();
    animate();

    window.addEventListener(
      "resize",
      setupCanvas
    );

    return () => {
      window.removeEventListener(
        "resize",
        setupCanvas
      );

      cancelAnimationFrame(
        animationFrameId
      );
    };
  }, [rippleColor, rippleCount, rippleSpeed]);

  return (
    <section
      className="relative min-h-screen w-full overflow-hidden"
      style={{
        backgroundColor,
      }}
    >
      {/* Ripple Canvas */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 z-0 h-full w-full"
      />

      {/* Gradient Overlay */}
      <div className="absolute inset-0 z-[1] bg-gradient-to-b from-transparent via-[#0a0b1e]/10 to-[#0a0b1e]" />

      {/* Content */}
      <div className="relative z-10 flex min-h-screen items-center">
        <div className="mx-auto w-full max-w-7xl px-6">
          {children}
        </div>
      </div>
    </section>
  );
};

export default RhythmicRipplesBackground;
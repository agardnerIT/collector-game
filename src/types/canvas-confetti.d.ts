declare module "canvas-confetti" {
  interface ConfettiOptions {
    particleCount?: number;
    spread?: number;
    origin?: { x?: number; y?: number };
    colors?: string[];
    zIndex?: number;
  }
  function confetti(options?: ConfettiOptions): void;
  export default confetti;
}

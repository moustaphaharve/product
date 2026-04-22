import { motion } from "framer-motion";
import { Bot, Github, Mail } from "lucide-react";
import { Button } from "@product/ui";
import { useAppStore } from "../store/app";

export function WelcomeView() {
  const setStage = useAppStore((s) => s.setStage);

  return (
    <div className="h-screen w-screen flex items-center justify-center bg-bg-primary overflow-hidden relative">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,0.03),transparent_60%)]" />
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-10 flex flex-col items-center gap-8 max-w-md w-full px-8"
      >
        <div className="flex flex-col items-center gap-3">
          <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-white via-neutral-300 to-neutral-500 flex items-center justify-center shadow-lg">
            <Bot size={26} className="text-black" />
          </div>
          <div className="text-[22px] font-normal tracking-[-0.01em]">
            Product
          </div>
          <div className="text-sm text-text-secondary text-center max-w-sm">
            Design and simulate robots using natural language.
          </div>
        </div>

        <div className="w-full flex flex-col gap-2 mt-2">
          <Button
            variant="primary"
            size="lg"
            className="w-full justify-center"
            onClick={() => setStage("onboarding")}
          >
            <Mail size={14} />
            Continue with email
          </Button>
          <Button
            variant="secondary"
            size="lg"
            className="w-full justify-center"
            onClick={() => setStage("onboarding")}
          >
            <Github size={14} />
            Continue with GitHub
          </Button>
          <Button
            variant="secondary"
            size="lg"
            className="w-full justify-center"
            onClick={() => setStage("onboarding")}
          >
            <GoogleMark />
            Continue with Google
          </Button>
        </div>

        <div className="text-[11px] text-text-tertiary text-center">
          By continuing you agree to our Terms and Privacy Policy.
        </div>

        <button
          onClick={() => setStage("ready")}
          className="text-xs text-text-tertiary hover:text-text-secondary transition-colors duration-micro"
        >
          Skip for local development
        </button>
      </motion.div>
    </div>
  );
}

function GoogleMark() {
  return (
    <svg width="14" height="14" viewBox="0 0 18 18" aria-hidden="true">
      <path
        fill="#FFC107"
        d="M17.64 9.2c0-.64-.06-1.25-.17-1.84H9v3.48h4.84c-.21 1.13-.84 2.09-1.8 2.73v2.27h2.91c1.7-1.57 2.69-3.88 2.69-6.64z"
      />
      <path
        fill="#4CAF50"
        d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.91-2.27c-.8.54-1.83.86-3.05.86-2.35 0-4.34-1.59-5.05-3.72H.92v2.34A9 9 0 0 0 9 18z"
      />
      <path
        fill="#1976D2"
        d="M3.95 10.69A5.4 5.4 0 0 1 3.68 9c0-.59.1-1.16.27-1.69V4.97H.92A9 9 0 0 0 0 9c0 1.45.35 2.82.92 4.03l3.03-2.34z"
      />
      <path
        fill="#E53935"
        d="M9 3.58c1.32 0 2.5.45 3.44 1.34l2.58-2.58C13.46.89 11.43 0 9 0A9 9 0 0 0 .92 4.97l3.03 2.34C4.66 5.17 6.65 3.58 9 3.58z"
      />
    </svg>
  );
}

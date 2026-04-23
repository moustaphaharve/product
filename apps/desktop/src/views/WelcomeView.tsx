import { motion } from "framer-motion";
import { Bot } from "lucide-react";
import { Button } from "@product/ui";
import { SignInButton, SignUpButton } from "@clerk/clerk-react";
import { useAppStore } from "../store/app";
import { WelcomeBackdrop } from "../components/shell/WelcomeBackdrop";

const CLERK_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY as
  | string
  | undefined;

export function WelcomeView() {
  const setStage = useAppStore((s) => s.setStage);

  return (
    <div className="h-screen w-screen flex items-center justify-center bg-bg-primary overflow-hidden relative">
      <WelcomeBackdrop />
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
          {CLERK_KEY ? (
            <>
              <SignInButton
                mode="modal"
                forceRedirectUrl="/"
                signUpForceRedirectUrl="/"
              >
                <Button
                  variant="primary"
                  size="lg"
                  className="w-full justify-center"
                >
                  Sign in
                </Button>
              </SignInButton>
              <SignUpButton
                mode="modal"
                forceRedirectUrl="/"
                signInForceRedirectUrl="/"
              >
                <Button
                  variant="secondary"
                  size="lg"
                  className="w-full justify-center"
                >
                  Create account
                </Button>
              </SignUpButton>
            </>
          ) : (
            <Button
              variant="primary"
              size="lg"
              className="w-full justify-center"
              onClick={() => setStage("onboarding")}
            >
              Continue
            </Button>
          )}
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

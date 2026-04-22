import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button, cn } from "@product/ui";
import { useAppStore } from "../store/app";
import { ArrowLeft, ArrowRight } from "lucide-react";

const USE_CASES = [
  { id: "hobby", label: "Hobby projects" },
  { id: "learning", label: "Learning / education" },
  { id: "startup", label: "Startup prototype" },
  { id: "research", label: "Research" },
  { id: "other", label: "Something else" },
];

const EXPERIENCE = [
  { id: "beginner", label: "Beginner", description: "I'm new to building robots." },
  {
    id: "some",
    label: "Some experience",
    description: "I've wired up microcontrollers and basic sensors.",
  },
  {
    id: "advanced",
    label: "Advanced",
    description: "I build with ROS, custom PCBs, or deploy to customers.",
  },
];

export function OnboardingView() {
  const finish = useAppStore((s) => s.finishOnboarding);
  const onboarding = useAppStore((s) => s.onboarding);
  const setOnboarding = useAppStore((s) => s.setOnboarding);
  const [step, setStep] = useState(0);

  const next = () => {
    if (step >= 2) finish();
    else setStep((s) => s + 1);
  };

  const back = () => setStep((s) => Math.max(0, s - 1));

  return (
    <div className="h-screen w-screen flex items-center justify-center bg-bg-primary overflow-hidden relative">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,0.03),transparent_60%)]" />
      <div className="relative z-10 w-[520px] max-w-[92vw]">
        <div className="mb-6 flex items-center justify-center gap-2">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className={cn(
                "h-1 rounded-full transition-all duration-panel ease-out-smooth",
                i === step ? "w-8 bg-text-primary" : "w-4 bg-border-secondary",
              )}
            />
          ))}
        </div>

        <AnimatePresence mode="wait">
          {step === 0 && (
            <motion.div
              key="step-0"
              initial={{ opacity: 0, x: 6 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -6 }}
              transition={{ duration: 0.25 }}
            >
              <StepShell
                heading="What are you building?"
                sub="Pick everything that fits. We'll personalize templates and defaults."
              >
                <div className="flex flex-wrap gap-2">
                  {USE_CASES.map((u) => {
                    const active = onboarding.useCase.includes(u.id);
                    return (
                      <button
                        key={u.id}
                        onClick={() => {
                          setOnboarding({
                            useCase: active
                              ? onboarding.useCase.filter((c) => c !== u.id)
                              : [...onboarding.useCase, u.id],
                          });
                        }}
                        className={cn(
                          "px-3 h-8 rounded-md border text-sm transition-colors duration-micro",
                          active
                            ? "bg-accent-subtle border-border-secondary text-text-primary"
                            : "bg-bg-secondary border-border-primary/60 text-text-secondary hover:text-text-primary",
                        )}
                      >
                        {u.label}
                      </button>
                    );
                  })}
                </div>
              </StepShell>
            </motion.div>
          )}

          {step === 1 && (
            <motion.div
              key="step-1"
              initial={{ opacity: 0, x: 6 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -6 }}
              transition={{ duration: 0.25 }}
            >
              <StepShell
                heading="Your experience level"
                sub="We'll tune verbosity and defaults accordingly."
              >
                <div className="flex flex-col gap-2">
                  {EXPERIENCE.map((e) => {
                    const active = onboarding.experience === e.id;
                    return (
                      <button
                        key={e.id}
                        onClick={() =>
                          setOnboarding({
                            experience: e.id as typeof onboarding.experience,
                          })
                        }
                        className={cn(
                          "w-full rounded-lg border px-3 py-2.5 text-left transition-colors duration-micro",
                          active
                            ? "bg-accent-subtle border-border-secondary"
                            : "bg-bg-secondary border-border-primary/60 hover:border-border-secondary",
                        )}
                      >
                        <div className="text-sm text-text-primary">
                          {e.label}
                        </div>
                        <div className="text-xs text-text-tertiary">
                          {e.description}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </StepShell>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              key="step-2"
              initial={{ opacity: 0, x: 6 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -6 }}
              transition={{ duration: 0.25 }}
            >
              <StepShell
                heading="Ready to build"
                sub="Jump straight in, or start from a sample template."
              >
                <div className="text-sm text-text-secondary">
                  We'll take you to the home screen. Type a prompt or pick a
                  template — your first project will auto-save as you iterate.
                </div>
              </StepShell>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="mt-6 flex items-center justify-between">
          <Button
            variant="ghost"
            onClick={back}
            disabled={step === 0}
            className="gap-1"
          >
            <ArrowLeft size={14} />
            Back
          </Button>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              onClick={finish}
              className="text-xs text-text-tertiary hover:text-text-secondary"
            >
              Skip
            </Button>
            <Button variant="primary" onClick={next} className="gap-1">
              {step === 2 ? "Enter Product" : "Continue"}
              <ArrowRight size={14} />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

function StepShell({
  heading,
  sub,
  children,
}: {
  heading: string;
  sub: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="text-xl tracking-[-0.01em] mb-1.5">{heading}</div>
      <div className="text-sm text-text-secondary mb-5">{sub}</div>
      {children}
    </div>
  );
}

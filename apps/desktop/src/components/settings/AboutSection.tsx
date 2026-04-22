import { Button } from "@product/ui";
import { Field, Section } from "./shared";

export function AboutSection() {
  return (
    <div>
      <Section heading="Product">
        <Field label="Version">
          <span className="text-xs text-text-tertiary font-mono">0.1.0</span>
        </Field>
        <Field label="Check for updates">
          <Button variant="secondary" size="sm">
            Check now
          </Button>
        </Field>
        <Field label="Changelog">
          <a
            href="https://github.com/mousmous1/product/releases"
            target="_blank"
            rel="noreferrer"
            className="text-xs text-text-secondary hover:text-text-primary underline underline-offset-2"
          >
            View on GitHub
          </a>
        </Field>
      </Section>
      <Section heading="Acknowledgments">
        <div className="py-3 text-xs text-text-tertiary leading-6">
          Built with Electron, React, Vite, Three.js, react-three-fiber,
          Fastify, Prisma, PostgreSQL, Tailwind CSS, Framer Motion, cmdk,
          Zustand, TanStack Query, MuJoCo, and the Anthropic SDK. The
          component database is seeded with real parts from Adafruit,
          SparkFun, Pololu, Robotis, Intel RealSense, Slamtec, NVIDIA,
          Arduino, and Raspberry Pi.
        </div>
      </Section>
    </div>
  );
}

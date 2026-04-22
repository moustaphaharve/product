import { Button } from "@product/ui";

export function Landing() {
  return (
    <main className="min-h-screen bg-bg-primary text-text-primary flex flex-col">
      <header className="border-b border-border-primary/50 h-12 flex items-center px-6">
        <div className="text-md font-medium">Product</div>
        <div className="flex-1" />
        <a
          href="https://github.com/mousmous1/product"
          className="text-sm text-text-secondary hover:text-text-primary"
        >
          GitHub
        </a>
      </header>

      <section className="flex-1 flex flex-col items-center justify-center text-center px-6 py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,0.04),transparent_60%)] pointer-events-none" />
        <h1 className="text-[44px] tracking-[-0.02em] font-normal max-w-3xl">
          Cursor for robotics.
        </h1>
        <p className="mt-4 text-md text-text-secondary max-w-xl">
          Describe a robot in plain English. Watch it come to life in a live
          3D physics simulation with real purchasable components and
          generated firmware.
        </p>
        <div className="mt-8 flex items-center gap-2">
          <Button variant="primary" size="lg">
            Download for Mac
          </Button>
          <Button variant="secondary" size="lg">
            Download for Windows
          </Button>
        </div>
        <div className="mt-12 w-full max-w-4xl h-72 rounded-xl border border-border-primary/60 bg-bg-secondary relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(255,255,255,0.06),transparent_60%)]" />
          <div className="absolute bottom-3 left-3 text-xs text-text-tertiary font-mono">
            product.app · off-road rover · 60 FPS
          </div>
        </div>
      </section>

      <footer className="border-t border-border-primary/50 text-xs text-text-tertiary text-center py-4">
        © {new Date().getFullYear()} Product
      </footer>
    </main>
  );
}

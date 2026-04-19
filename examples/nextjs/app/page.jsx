"use client";

import { useEffect } from "react";

export default function Home() {
  useEffect(() => {
    // Load Cider UI's interactive components on the client side only.
    // Skeleton/Toast/Dialog/etc. attach to window.CiderUI on import.
    import("ciderui/components/toast");
    import("ciderui/components/dialog");
  }, []);

  return (
    <main className="mt-10 mb-10">
      <h1>Cider UI — Next.js</h1>
      <p>
        Next.js App Router integration. Import ciderui's CSS in{" "}
        <code>globals.css</code>; lazy-load interactive components in a client
        component.
      </p>

      <section className="mt-8">
        <h2>Try it</h2>
        <div className="mt-3 flex flex-wrap gap-2">
          <button
            className="btn-filled"
            onClick={() =>
              window.showToast?.({
                title: "Hello from Next.js",
                variant: "success",
              })
            }
          >
            Show toast
          </button>
          <button
            className="btn-tinted"
            onClick={() => {
              const d = document.getElementById("demo-dialog");
              if (d) window.openDialog?.(d);
            }}
          >
            Open dialog
          </button>
        </div>
      </section>

      <dialog className="dialog alert" id="demo-dialog">
        <header>
          <h3>Hello</h3>
          <p>Dialog rendered as a Server Component, wired up client-side.</p>
        </header>
        <div className="dialog-footer">
          <button
            className="btn-filled"
            onClick={(e) =>
              window.closeDialog?.(e.currentTarget.closest("dialog"))
            }
          >
            Close
          </button>
        </div>
      </dialog>
    </main>
  );
}

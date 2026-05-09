"use client";

import type { CSSProperties } from "react";
import { useEffect, useRef } from "react";

const AUTO_HIDE_DELAY = 900;

export default function ScrollShell({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const viewportRef = useRef<HTMLDivElement>(null);
  const railRef = useRef<HTMLDivElement>(null);
  const thumbRef = useRef<HTMLDivElement>(null);
  const hideTimerRef = useRef<number | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  useEffect(() => {
    const viewport = viewportRef.current;
    const rail = railRef.current;
    const thumb = thumbRef.current;

    if (!viewport || !rail || !thumb) {
      return;
    }

    const showScrollbar = () => {
      rail.dataset.visible = "true";
      if (hideTimerRef.current !== null) {
        window.clearTimeout(hideTimerRef.current);
        hideTimerRef.current = null;
      }
      hideTimerRef.current = window.setTimeout(() => {
        rail.dataset.visible = "false";
      }, AUTO_HIDE_DELAY);
    };

    const hideScrollbar = () => {
      rail.dataset.visible = "false";
    };

    const syncScrollbar = () => {
      const isMobile = window.matchMedia("(max-width: 767px)").matches;
      const { scrollTop, scrollHeight, clientHeight } = viewport;
      const overflow = scrollHeight > clientHeight + 1;
      const minProgress = 0.06;
      const maxProgress = 1;
      rail.dataset.orientation = isMobile ? "mobile" : "desktop";

      if (!overflow) {
        thumb.style.setProperty("--scroll-progress", "0");
        hideScrollbar();
        return;
      }

      const maxScrollTop = Math.max(scrollHeight - clientHeight, 1);
      const progress = Math.min(
        maxProgress,
        Math.max(minProgress, scrollTop / maxScrollTop),
      );

      thumb.style.setProperty("--scroll-progress", progress.toString());
      showScrollbar();
    };

    const requestSync = () => {
      if (animationFrameRef.current !== null) {
        window.cancelAnimationFrame(animationFrameRef.current);
      }
      animationFrameRef.current = window.requestAnimationFrame(syncScrollbar);
    };

    const resizeObserver = new ResizeObserver(() => {
      requestSync();
    });

    resizeObserver.observe(viewport);
    const content = viewport.firstElementChild;
    if (content) {
      resizeObserver.observe(content);
    }

    viewport.addEventListener("scroll", requestSync, { passive: true });
    window.addEventListener("resize", requestSync);

    requestSync();

    return () => {
      if (animationFrameRef.current !== null) {
        window.cancelAnimationFrame(animationFrameRef.current);
      }
      if (hideTimerRef.current !== null) {
        window.clearTimeout(hideTimerRef.current);
      }
      resizeObserver.disconnect();
      viewport.removeEventListener("scroll", requestSync);
      window.removeEventListener("resize", requestSync);
    };
  }, []);

  return (
    <div className="scroll-shell">
      <div
        ref={viewportRef}
        className="scroll-shell__viewport"
        onPointerEnter={() => {
          if (railRef.current) {
            railRef.current.dataset.visible = "true";
          }
        }}
        onPointerMove={() => {
          if (railRef.current) {
            railRef.current.dataset.visible = "true";
          }
          if (hideTimerRef.current !== null) {
            window.clearTimeout(hideTimerRef.current);
          }
          hideTimerRef.current = window.setTimeout(() => {
            if (railRef.current) {
              railRef.current.dataset.visible = "false";
            }
          }, AUTO_HIDE_DELAY);
        }}
        onPointerLeave={() => {
          if (railRef.current) {
            railRef.current.dataset.visible = "false";
          }
        }}
      >
        <div className="scroll-shell__content">{children}</div>
      </div>

      <div
        ref={railRef}
        className="scroll-shell__rail"
        data-visible="false"
        aria-hidden="true"
      >
        <div
          ref={thumbRef}
          className="scroll-shell__thumb"
          style={{ "--scroll-progress": "0" } as CSSProperties}
        />
      </div>
    </div>
  );
}

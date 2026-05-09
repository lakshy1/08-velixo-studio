"use client";

import { useEffect, useRef, useState } from "react";

const THUMB_MIN_HEIGHT = 44;
const SHELL_INSET = 8;
const AUTO_HIDE_DELAY = 900;

type ScrollState = {
  visible: boolean;
  thumbHeight: number;
  thumbOffset: number;
};

export default function ScrollShell({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const viewportRef = useRef<HTMLDivElement>(null);
  const [scrollState, setScrollState] = useState<ScrollState>({
    visible: false,
    thumbHeight: THUMB_MIN_HEIGHT,
    thumbOffset: 0,
  });

  useEffect(() => {
    const viewport = viewportRef.current;

    if (!viewport) {
      return;
    }

    let animationFrame = 0;

    const syncScrollbar = () => {
      const { scrollTop, scrollHeight, clientHeight } = viewport;
      const overflow = scrollHeight > clientHeight + 1;

      if (!overflow) {
        setScrollState({
          visible: false,
          thumbHeight: THUMB_MIN_HEIGHT,
          thumbOffset: 0,
        });
        return;
      }

      const trackHeight = Math.max(clientHeight - SHELL_INSET * 2, THUMB_MIN_HEIGHT);
      const thumbHeight = Math.max(
        THUMB_MIN_HEIGHT,
        (clientHeight / scrollHeight) * trackHeight,
      );
      const maxThumbOffset = Math.max(trackHeight - thumbHeight, 0);
      const maxScrollTop = Math.max(scrollHeight - clientHeight, 1);
      const thumbOffset = (scrollTop / maxScrollTop) * maxThumbOffset;

      setScrollState({
        visible: true,
        thumbHeight,
        thumbOffset,
      });
    };

    const requestSync = () => {
      window.cancelAnimationFrame(animationFrame);
      animationFrame = window.requestAnimationFrame(syncScrollbar);
    };

    const resizeObserver = new ResizeObserver(requestSync);

    resizeObserver.observe(viewport);
    if (viewport.firstElementChild) {
      resizeObserver.observe(viewport.firstElementChild);
    }

    viewport.addEventListener("scroll", requestSync, { passive: true });
    window.addEventListener("resize", requestSync);

    requestSync();

    return () => {
      window.cancelAnimationFrame(animationFrame);
      resizeObserver.disconnect();
      viewport.removeEventListener("scroll", requestSync);
      window.removeEventListener("resize", requestSync);
    };
  }, []);

  useEffect(() => {
    if (!scrollState.visible) {
      return undefined;
    }

    const hideTimer = window.setTimeout(() => {
      setScrollState((current) => ({
        ...current,
        visible: false,
      }));
    }, AUTO_HIDE_DELAY);

    return () => {
      window.clearTimeout(hideTimer);
    };
  }, [scrollState.visible]);

  return (
    <div className="scroll-shell">
      <div
        ref={viewportRef}
        className="scroll-shell__viewport"
        onPointerEnter={() => {
          setScrollState((current) => ({
            ...current,
            visible: true,
          }));
        }}
        onPointerMove={() => {
          setScrollState((current) => ({
            ...current,
            visible: true,
          }));
        }}
        onPointerLeave={() => {
          setScrollState((current) => ({
            ...current,
            visible: false,
          }));
        }}
      >
        <div className="scroll-shell__content">{children}</div>
      </div>

      <div
        className="scroll-shell__rail"
        data-visible={scrollState.visible ? "true" : "false"}
        aria-hidden="true"
      >
        <div
          className="scroll-shell__thumb"
          style={{
            height: `${scrollState.thumbHeight}px`,
            transform: `translateY(${scrollState.thumbOffset}px)`,
          }}
        />
      </div>
    </div>
  );
}

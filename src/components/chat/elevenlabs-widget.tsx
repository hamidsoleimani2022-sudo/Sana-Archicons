"use client";

import { useEffect, useRef } from "react";

const AGENT_ID = process.env.NEXT_PUBLIC_ELEVENLABS_AGENT_ID;
const SCRIPT_SRC = "https://unpkg.com/@elevenlabs/convai-widget-embed";

/**
 * ElevenLabs-agent (spraak/chat) als zwevende widget.
 * Rendert niets zolang NEXT_PUBLIC_ELEVENLABS_AGENT_ID niet is ingesteld,
 * zodat de site zonder configuratie gewoon blijft werken. Het element wordt
 * via de DOM aangemaakt (custom element, geen JSX-typedeclaratie nodig).
 */
export function ElevenLabsWidget() {
  const hostRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!AGENT_ID || !hostRef.current) return;

    // Widget-script eenmalig laden
    if (!document.querySelector(`script[src="${SCRIPT_SRC}"]`)) {
      const script = document.createElement("script");
      script.src = SCRIPT_SRC;
      script.async = true;
      document.body.appendChild(script);
    }

    // <elevenlabs-convai agent-id="..."> element plaatsen
    const host = hostRef.current;
    if (!host.querySelector("elevenlabs-convai")) {
      const el = document.createElement("elevenlabs-convai");
      el.setAttribute("agent-id", AGENT_ID);
      host.appendChild(el);
    }

    return () => {
      host.replaceChildren();
    };
  }, []);

  if (!AGENT_ID) return null;
  return <div ref={hostRef} />;
}

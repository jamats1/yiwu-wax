"use client";

import { useEffect, useState } from "react";

const WHATSAPP_NUMBER = "8618058542270";

export function ReturnsWhatsAppButton() {
  const [whatsappUrl, setWhatsappUrl] = useState("");

  useEffect(() => {
    const msg = `Hi! I have a question about a return. I'm reaching out from ${window.location.href}.`;
    setWhatsappUrl(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(msg)}`);
  }, []);

  if (!whatsappUrl) return null;

  return (
    <a
      href={whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-2 rounded-full bg-[#25D366] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#20b558]"
    >
      WhatsApp us
    </a>
  );
}

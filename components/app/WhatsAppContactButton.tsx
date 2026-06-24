"use client";

import { MessageCircle } from "lucide-react";
import { useEffect, useState } from "react";

const WHATSAPP_NUMBER = "8618058542270";

export function WhatsAppContactButton() {
  const [whatsappUrl, setWhatsappUrl] = useState("");

  useEffect(() => {
    const msg = `Hi! I'm reaching out from ${window.location.href}. I'd like to know more about your African wax print fabrics.`;
    setWhatsappUrl(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(msg)}`);
  }, []);

  if (!whatsappUrl) return null;

  return (
    <a
      href={whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center gap-5 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-md"
    >
      <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#25D366]">
        <MessageCircle className="h-6 w-6 text-white" />
      </span>
      <div>
        <p className="font-semibold text-gray-900">WhatsApp</p>
        <p className="text-sm text-gray-500">Fastest way to reach us — chat now</p>
        <p className="mt-0.5 text-sm font-medium text-[#25D366]">+86 180 5854 2270</p>
      </div>
    </a>
  );
}

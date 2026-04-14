import { useState } from "react";
import {
  useGetTelegramStatus,
  getGetTelegramStatusQueryOptions,
} from "@workspace/api-client-react";
import TelegramConnectModal from "./telegram-connect-modal";

interface TelegramStatusBadgeProps {
  guruId: number;
  guruName: string;
  guruSlug: string;
}

export default function TelegramStatusBadge({ guruId, guruName, guruSlug }: TelegramStatusBadgeProps) {
  const [showModal, setShowModal] = useState(false);

  const { data: status } = useGetTelegramStatus(guruId, {
    query: {
      ...getGetTelegramStatusQueryOptions(guruId),
      enabled: !!guruId,
    },
  });

  if (!status) return null;

  return (
    <>
      {status.connected ? (
        <span className="text-[10px] font-medium tracking-[0.06em] uppercase text-[#2a7a2a] bg-[#f0f8f0] border border-[#c8e0c8] px-2 py-0.5">
          Telegram connected
        </span>
      ) : (
        <button
          onClick={() => setShowModal(true)}
          className="text-[10px] font-medium tracking-[0.06em] uppercase text-[#888] border border-[#ddd] px-2 py-0.5 hover:border-[#999] hover:text-[#555] cursor-pointer transition-colors"
        >
          Connect Telegram
        </button>
      )}
      <TelegramConnectModal
        guruId={guruId}
        guruName={guruName}
        isOpen={showModal}
        onClose={() => setShowModal(false)}
      />
    </>
  );
}

import { useState, useEffect, useRef } from "react";
import {
  useCreateTelegramConnection,
  useGetTelegramStatus,
  useGetTelegramBotInfo,
  getGetTelegramStatusQueryOptions,
  getGetTelegramBotInfoQueryOptions,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";

interface TelegramConnectModalProps {
  guruId: number;
  guruName: string;
  isOpen: boolean;
  onClose: () => void;
}

export default function TelegramConnectModal({
  guruId,
  guruName,
  isOpen,
  onClose,
}: TelegramConnectModalProps) {
  const [code, setCode] = useState<string | null>(null);
  const [expiresAt, setExpiresAt] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const queryClient = useQueryClient();

  const connectMutation = useCreateTelegramConnection();
  const { data: botInfo } = useGetTelegramBotInfo(guruId, {
    query: { ...getGetTelegramBotInfoQueryOptions(guruId), enabled: isOpen },
  });

  useEffect(() => {
    if (!isOpen) {
      setCode(null);
      setExpiresAt(null);
      setIsConnected(false);
      setError(null);
      if (pollRef.current) {
        clearInterval(pollRef.current);
        pollRef.current = null;
      }
    }
  }, [isOpen]);

  useEffect(() => {
    return () => {
      if (pollRef.current) {
        clearInterval(pollRef.current);
      }
    };
  }, []);

  async function handleGenerateCode() {
    setError(null);
    try {
      const result = await connectMutation.mutateAsync({ guruId });
      if (result.alreadyConnected) {
        setIsConnected(true);
        return;
      }
      if (result.code) {
        setCode(result.code);
        setExpiresAt(result.expiresAt ?? null);
        startPolling();
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Failed to generate connection code.");
      }
    }
  }

  function startPolling() {
    if (pollRef.current) clearInterval(pollRef.current);
    pollRef.current = setInterval(async () => {
      try {
        const statusOpts = getGetTelegramStatusQueryOptions(guruId);
        const data = await queryClient.fetchQuery({
          ...statusOpts,
          staleTime: 0,
        });
        if (data?.connected) {
          setIsConnected(true);
          if (pollRef.current) {
            clearInterval(pollRef.current);
            pollRef.current = null;
          }
          queryClient.invalidateQueries({ queryKey: statusOpts.queryKey });
        }
      } catch {}
    }, 3000);
  }

  const [countdown, setCountdown] = useState(0);

  useEffect(() => {
    if (!expiresAt) return;
    const update = () => {
      const left = Math.max(0, Math.floor((new Date(expiresAt).getTime() - Date.now()) / 1000));
      setCountdown(left);
      if (left === 0 && pollRef.current) {
        clearInterval(pollRef.current);
        pollRef.current = null;
      }
    };
    update();
    const timer = setInterval(update, 1000);
    return () => clearInterval(timer);
  }, [expiresAt]);

  const botUsername = botInfo?.botUsername;
  const botLink = botUsername ? `https://t.me/${botUsername}` : null;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/20" onClick={onClose} />
      <div className="relative bg-white border border-[#e0e0e0] max-w-[440px] w-full mx-4 p-8">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-[#999] hover:text-[#333] text-[18px] cursor-pointer"
        >
          x
        </button>

        {isConnected ? (
          <div className="text-center">
            <div className="w-12 h-12 mx-auto mb-4 border border-[#c8e0c8] bg-[#f0f8f0] flex items-center justify-center text-[#2a7a2a] text-[20px]">
              ✓
            </div>
            <p className="text-[11px] font-medium tracking-[0.12em] uppercase text-[#888] mb-2">
              Connected
            </p>
            <p className="text-[20px] font-light text-[#111] mb-3">
              You're connected to {guruName}
            </p>
            <p className="text-[13px] text-[#777] mb-6">
              Open Telegram and start chatting with your Guru.
            </p>
            {botLink && (
              <a
                href={botLink}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[13px] font-medium tracking-[0.04em] uppercase text-white bg-[#111] px-7 py-3 no-underline inline-block hover:bg-[#333] transition-colors"
              >
                Open in Telegram
              </a>
            )}
          </div>
        ) : !code ? (
          <div className="text-center">
            <p className="text-[11px] font-medium tracking-[0.12em] uppercase text-[#888] mb-2">
              Connect on Telegram
            </p>
            <p className="text-[20px] font-light text-[#111] mb-3">
              {guruName}
            </p>
            <p className="text-[13px] text-[#777] mb-6 leading-[1.6]">
              Generate a connection code, then paste it in the Guru's Telegram bot to link your account.
            </p>
            {error && (
              <p className="text-[12px] text-[#c44] mb-4">{error}</p>
            )}
            {!botInfo?.configured ? (
              <p className="text-[12px] text-[#999]">
                This Guru hasn't configured a Telegram bot yet. Check back later.
              </p>
            ) : (
              <button
                onClick={handleGenerateCode}
                disabled={connectMutation.isPending}
                className="text-[13px] font-medium tracking-[0.04em] uppercase text-white bg-[#111] px-7 py-3 border border-[#111] hover:bg-[#333] transition-colors cursor-pointer disabled:opacity-50"
              >
                {connectMutation.isPending ? "Generating..." : "Generate Code"}
              </button>
            )}
          </div>
        ) : (
          <div className="text-center">
            <p className="text-[11px] font-medium tracking-[0.12em] uppercase text-[#888] mb-4">
              Your Connection Code
            </p>
            <div className="flex justify-center gap-1.5 mb-4">
              {code.split("").map((char, i) => (
                <div
                  key={i}
                  className="w-10 h-12 border border-[#ddd] flex items-center justify-center text-[20px] font-mono font-medium text-[#111]"
                >
                  {char}
                </div>
              ))}
            </div>
            {countdown > 0 && (
              <p className="text-[11px] text-[#999] mb-4">
                Expires in {Math.floor(countdown / 60)}:{String(countdown % 60).padStart(2, "0")}
              </p>
            )}
            {countdown === 0 && expiresAt && (
              <p className="text-[11px] text-[#c44] mb-4">
                Code expired.{" "}
                <button
                  onClick={handleGenerateCode}
                  className="underline cursor-pointer text-[#c44]"
                >
                  Generate a new one
                </button>
              </p>
            )}
            <div className="border-t border-[#f0f0f0] pt-4 mt-2">
              <p className="text-[11px] font-medium tracking-[0.08em] uppercase text-[#888] mb-3">
                Steps
              </p>
              <div className="text-left space-y-2">
                <p className="text-[13px] text-[#555]">
                  <span className="text-[#bbb] mr-2">1.</span>
                  {botLink ? (
                    <>
                      Open{" "}
                      <a
                        href={botLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[#111] underline"
                      >
                        the Guru's Telegram bot
                      </a>
                    </>
                  ) : (
                    "Open the Guru's Telegram bot"
                  )}
                </p>
                <p className="text-[13px] text-[#555]">
                  <span className="text-[#bbb] mr-2">2.</span>
                  Paste the code above as a message
                </p>
                <p className="text-[13px] text-[#555]">
                  <span className="text-[#bbb] mr-2">3.</span>
                  Wait for confirmation (auto-detected)
                </p>
              </div>
            </div>
            <div className="mt-4 flex items-center justify-center gap-2">
              <div className="w-1.5 h-1.5 bg-[#111] rounded-full animate-pulse" />
              <p className="text-[11px] text-[#999]">
                Listening for connection...
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

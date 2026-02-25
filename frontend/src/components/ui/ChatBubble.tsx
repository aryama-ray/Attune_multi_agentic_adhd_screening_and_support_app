import type { Message } from "@/types";

interface ChatBubbleProps {
  message: Pick<Message, "role" | "content">;
  isTyping?: boolean;
}

export default function ChatBubble({
  message,
  isTyping = false,
}: ChatBubbleProps) {
  const isAgent = message.role === "agent";

  return (
    <div
      className={["flex gap-3", isAgent ? "justify-start" : "justify-end"].join(
        " "
      )}
    >
      {isAgent && (
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary-100">
          <span className="text-xs font-semibold text-primary-700">A</span>
        </div>
      )}

      <div
        className={[
          "max-w-[75%] rounded-2xl px-4 py-3 text-sm leading-relaxed",
          isAgent
            ? "rounded-tl-sm border border-border bg-surface text-foreground"
            : "rounded-tr-sm bg-primary text-white",
        ].join(" ")}
      >
        {isTyping ? (
          <span className="flex h-4 items-center gap-1">
            <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-current [animation-delay:0ms]" />
            <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-current [animation-delay:150ms]" />
            <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-current [animation-delay:300ms]" />
          </span>
        ) : (
          message.content
        )}
      </div>
    </div>
  );
}

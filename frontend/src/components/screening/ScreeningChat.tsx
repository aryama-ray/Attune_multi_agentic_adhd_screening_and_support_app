"use client";

import { useEffect, useRef } from "react";
import ChatBubble from "@/components/ui/ChatBubble";
import AnswerSelector from "@/components/screening/AnswerSelector";
import type { ScreeningAnswer } from "@/hooks/useScreeningChat";
import type { Question } from "@/lib/screeningData";

interface ScreeningChatProps {
  answers: ScreeningAnswer[];
  currentQuestion: Question;
  isEvaluating: boolean;
  onAnswer: (score: number) => void;
}

export default function ScreeningChat({
  answers,
  currentQuestion,
  isEvaluating,
  onAnswer,
}: ScreeningChatProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [answers.length, isEvaluating]);

  return (
    <div className="flex flex-col gap-4">
      {/* Previous Q/A pairs */}
      {answers.map((answer) => (
        <div key={answer.questionId} className="flex flex-col gap-2">
          <ChatBubble message={{ role: "agent", content: answer.questionText }} />
          <ChatBubble message={{ role: "user", content: answer.answerLabel }} />
        </div>
      ))}

      {/* Current state */}
      {isEvaluating ? (
        <ChatBubble
          message={{ role: "agent", content: "" }}
          isTyping
        />
      ) : (
        <>
          <ChatBubble
            message={{ role: "agent", content: currentQuestion.text }}
          />
          <AnswerSelector onSelect={onAnswer} />
        </>
      )}

      <div ref={bottomRef} />
    </div>
  );
}

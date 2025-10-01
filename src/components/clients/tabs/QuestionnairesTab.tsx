// src/components/clients/tabs/QuestionnairesTab.tsx
import React, { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/formatters";
import { useGetUserAnswersByUserIdQuery } from "@/API/questionnaire.api";
import type { UserAnswerDto } from "@/types/users/questionnaire.types";
import { UserInvestmentApi } from "@/types/users/userDetail.types";

interface QuestionnairesTabProps {
  userId: number;
  investments: UserInvestmentApi[];
}

export function QuestionnairesTab({
  userId,
  investments,
}: QuestionnairesTabProps) {
  // fetch answers for the user
  const {
    data: answersRaw,
    isLoading,
    error,
  } = useGetUserAnswersByUserIdQuery(userId, { skip: !userId });

  // Normalize & sort answers by questionId ascending
  const answers: UserAnswerDto[] = useMemo(() => {
    const arr = Array.isArray(answersRaw) ? answersRaw : [];
    // ensure numeric questionId and stable sort
    return arr
      .map((a) => ({
        ...a,
        questionId: Number(a.questionId ?? a.question?.id ?? 0),
      }))
      .sort((x, y) => x.questionId - y.questionId);
  }, [answersRaw]);

  // Simple ISO date detection: if value is ISO-like, format it
  const formatPossibleDate = (val: string) => {
    if (!val) return "—";
    // crude ISO detection (YYYY-...T...Z)
    const isoLike = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/.test(val);
    if (isoLike) {
      try {
        return formatDate(val);
      } catch {
        return val;
      }
    }
    return val;
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-end gap-2">
        <Button size="sm" variant="secondary">
          Export All (CSV)
        </Button>
        <Button size="sm" variant="outline">
          Request Update
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Registration Questionnaire</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-sm text-muted-foreground">
              Loading answers…
            </div>
          ) : error ? (
            <div className="text-sm text-red-500">Error loading answers</div>
          ) : answers.length === 0 ? (
            <div className="text-sm text-muted-foreground">
              No registration answers available.
            </div>
          ) : (
            <ol className="text-sm space-y-3 list-decimal pl-4">
              {answers.map((qa, idx) => (
                <li key={qa.id ?? idx}>
                  {/* show question text (fall back to questionId if missing) */}
                  <div className="text-foreground">
                    {qa.question?.question ?? `Question #${qa.questionId}`}
                  </div>
                  <div className="text-muted-foreground">
                    Answer: {formatPossibleDate(String(qa.answer ?? "—"))}
                  </div>
                </li>
              ))}
            </ol>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Investment Creation Questionnaire</CardTitle>
        </CardHeader>
        <CardContent>
          {investments.length === 0 ? (
            <div className="text-sm text-muted-foreground">
              No investments found.
            </div>
          ) : (
            <Accordion type="single" collapsible className="w-full">
              {investments.map((inv) => (
                <AccordionItem key={inv.id} value={String(inv.id)}>
                  <AccordionTrigger></AccordionTrigger>
                </AccordionItem>
              ))}
            </Accordion>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default QuestionnairesTab;

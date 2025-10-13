import React, { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { formatDate, formatCurrency } from "@/lib/formatters";
import {
  useGetUserAnswersByUserIdQuery,
  useGetInvestmentAnswersByUserIdQuery,
} from "@/API/questionnaire.api";
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
  // ✅ Registration answers query
  const {
    data: answersRaw,
    isLoading,
    error,
  } = useGetUserAnswersByUserIdQuery(userId, { skip: !userId });

  // ✅ Investment answers query
  const {
    data: clientsRaw,
    isLoading: isClientsLoading,
    error: clientsError,
  } = useGetInvestmentAnswersByUserIdQuery({ id: userId }, { skip: !userId });

  // ✅ Fix: handle both array and object-with-data
  const answers: UserAnswerDto[] = useMemo(() => {
    const arr = Array.isArray(answersRaw)
      ? answersRaw
      : Array.isArray((answersRaw as any)?.data)
      ? (answersRaw as any).data
      : [];

    return arr
      .map((a) => ({
        ...a,
        questionId: Number(a.questionId ?? a.question?.id ?? 0),
      }))
      .sort((x, y) => x.questionId - y.questionId);
  }, [answersRaw]);

  const formatPossibleDate = (val: string) => {
    if (!val) return "—";
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

      {/* ✅ Registration Questionnaire */}
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

      {/* ✅ Investment Creation Questionnaire (as before) */}
      <Card>
        <CardHeader>
          <CardTitle>Investment Creation Questionnaire</CardTitle>
        </CardHeader>
        <CardContent>
          {isClientsLoading ? (
            <div className="text-sm text-muted-foreground">
              Loading investments…
            </div>
          ) : clientsError ? (
            <div className="text-sm text-red-500">
              Error loading investments
            </div>
          ) : !clientsRaw?.data || clientsRaw.data.length === 0 ? (
            <div className="text-sm text-muted-foreground">
              No investments found.
            </div>
          ) : (
            <Accordion type="single" collapsible className="w-full">
              {clientsRaw.data.map((c: any) => {
                const amount =
                  typeof c.amount === "number"
                    ? c.amount
                    : Number(c.amount || 0);
                const status = String(c.investmentStatus || "").toLowerCase();

                return (
                  <AccordionItem key={c.id} value={String(c.id)}>
                    <AccordionTrigger
                      className="hover:no-underline items-center" // keep row layout + remove underline
                    >
                      {/* keep text stacked, but inside its own column so the chevron stays on the right */}
                      <div className="flex flex-col items-start text-left gap-1">
                        <div className="w-full font-semibold">
                          Investment {c.name ?? `#${c.id}`}
                        </div>
                        <div className="w-full text-md text-muted-foreground">
                          Amount: {formatCurrency(amount)} • Status:{" "}
                          {status || "—"}
                        </div>
                      </div>
                    </AccordionTrigger>

                    <AccordionContent>
                      <ul className="text-sm space-y-4 mt-2">
                        <li>
                          <div className="font-medium">Investment amount</div>
                          <div className="text-muted-foreground">
                            Answer: {formatCurrency(amount)}
                          </div>
                        </li>

                        <li>
                          <div className="font-medium">For whom</div>
                          <div className="text-muted-foreground">
                            Answer: {c.forWhome ?? "—"}
                          </div>
                        </li>

                        <li>
                          <div className="font-medium">Duration</div>
                          <div className="text-muted-foreground">
                            Answer: {c.duration ?? "—"}
                          </div>
                        </li>

                        <li>
                          <div className="font-medium">Referral code</div>
                          <div className="text-muted-foreground">
                            Answer: {c.referralCode ?? "—"}
                          </div>
                        </li>
                      </ul>
                    </AccordionContent>
                  </AccordionItem>
                );
              })}
            </Accordion>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default QuestionnairesTab;

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import type { Investment, QA } from "@/types/client";

interface QuestionnairesTabProps {
  registrationAnswers: QA[];
  investments: Investment[];
}

export function QuestionnairesTab({ registrationAnswers, investments }: QuestionnairesTabProps) {
  return (
    <div className="space-y-6">
      <div className="flex justify-end gap-2">
        <Button size="sm" variant="secondary">Export All (CSV)</Button>
        <Button size="sm" variant="outline">Request Update</Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Registration Questionnaire</CardTitle>
        </CardHeader>
        <CardContent>
          {registrationAnswers && registrationAnswers.length > 0 ? (
            <ol className="text-sm space-y-3 list-decimal pl-4">
              {registrationAnswers.map((qa, idx) => (
                <li key={qa.id ?? idx}>
                  <div className="text-foreground">{qa.question}</div>
                  <div className="text-muted-foreground">Answer: {qa.answer || "—"}</div>
                </li>
              ))}
            </ol>
          ) : (
            <div className="text-sm text-muted-foreground">No registration answers available.</div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Investment Creation Questionnaire</CardTitle>
        </CardHeader>
        <CardContent>
          {investments.length === 0 ? (
            <div className="text-sm text-muted-foreground">No investments found.</div>
          ) : (
            <Accordion type="single" collapsible className="w-full">
              {investments.map((inv) => (
                <AccordionItem key={inv.id} value={inv.id}>
                  <AccordionTrigger>
                    <div className="text-left">
                      <div className="font-medium">Investment {inv.nickname ? `(${inv.nickname})` : inv.id}</div>
                      <div className="text-muted-foreground text-xs">Amount: ${inv.amount.toLocaleString()} • Status: {inv.status}</div>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    {inv.creationAnswers && inv.creationAnswers.length > 0 ? (
                      <ul className="text-sm space-y-2 list-disc pl-4">
                        {inv.creationAnswers.map((qa) => (
                          <li key={qa.id}>
                            <div className="text-foreground">{qa.question}</div>
                            <div className="text-muted-foreground">Answer: {qa.answer || "—"}</div>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <div className="text-sm text-muted-foreground">No questionnaire answers for this investment.</div>
                    )}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

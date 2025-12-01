import { useState, useCallback } from "react";
import { questions } from "@/lib/raads-r-data";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RaadsRadialChart } from "@/components/RaadsRadialChart";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft } from "lucide-react";
import { useLocation } from "wouter";

type Answer = 0 | 1 | 2 | 3;

export default function RaadsRPage() {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, Answer>>({});
  const [isCompleted, setIsCompleted] = useState(false);
  const [location, setLocation] = useLocation();

  const handleAnswer = (value: string) => {
    const answer = parseInt(value) as Answer;
    setAnswers((prev) => ({
      ...prev,
      [questions[currentQuestionIndex].id]: answer,
    }));

    if (currentQuestionIndex < questions.length - 1) {
      setTimeout(() => setCurrentQuestionIndex((prev) => prev + 1), 200);
    } else {
      setIsCompleted(true);
    }
  };

  const calculateScores = useCallback(() => {
    const scores = {
      social_relatedness: 0,
      circumscribed_interests: 0,
      language: 0,
      sensory_motor: 0,
    };

    questions.forEach((q) => {
      const answer = answers[q.id];
      if (answer !== undefined) {
        let score = answer;
        if (q.isReverseScored) {
            // Reverse scoring: 0->3, 1->2, 2->1, 3->0
            score = (3 - answer) as Answer;
        }
        scores[q.subscale] += score;
      }
    });

    return scores;
  }, [answers]);

  const currentQuestion = questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex) / questions.length) * 100;

  if (isCompleted) {
    const scores = calculateScores();
    return (
      <div className="min-h-screen bg-gray-50 py-8 px-4">
        <div className="max-w-4xl mx-auto space-y-6">
          <Button variant="ghost" onClick={() => setLocation("/")}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Home
          </Button>

          <Card>
            <CardHeader>
              <CardTitle className="text-center">Your RAADS-R Results</CardTitle>
            </CardHeader>
            <CardContent>
              <RaadsRadialChart scores={scores} />
              <div className="mt-8 text-center text-sm text-gray-500">
                <p>Note: This is a screening tool and not a diagnostic instrument. Please consult a professional for a formal diagnosis.</p>
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-center">
             <Button onClick={() => window.print()}>Print Results</Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-2xl mx-auto space-y-6">
        <Button variant="ghost" onClick={() => setLocation("/")}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Home
        </Button>

        <Card>
          <CardHeader>
            <CardTitle>RAADS-R Assessment</CardTitle>
            <Progress value={progress} className="w-full mt-2" />
            <div className="text-sm text-gray-500 text-right mt-1">
              Question {currentQuestionIndex + 1} of {questions.length}
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-lg font-medium leading-relaxed">
              {currentQuestion.text}
            </div>

            <RadioGroup
              key={currentQuestion.id}
              onValueChange={handleAnswer}
              value={answers[currentQuestion.id]?.toString()}
              className="space-y-3"
            >
              <div className="flex items-center space-x-2 border p-3 rounded-lg hover:bg-gray-50 cursor-pointer">
                <RadioGroupItem value="3" id="opt-3" />
                <Label htmlFor="opt-3" className="flex-grow cursor-pointer font-normal">
                  True now and when I was young
                </Label>
              </div>
              <div className="flex items-center space-x-2 border p-3 rounded-lg hover:bg-gray-50 cursor-pointer">
                <RadioGroupItem value="2" id="opt-2" />
                <Label htmlFor="opt-2" className="flex-grow cursor-pointer font-normal">
                  True now only
                </Label>
              </div>
              <div className="flex items-center space-x-2 border p-3 rounded-lg hover:bg-gray-50 cursor-pointer">
                <RadioGroupItem value="1" id="opt-1" />
                <Label htmlFor="opt-1" className="flex-grow cursor-pointer font-normal">
                  True only when I was younger than 16
                </Label>
              </div>
              <div className="flex items-center space-x-2 border p-3 rounded-lg hover:bg-gray-50 cursor-pointer">
                <RadioGroupItem value="0" id="opt-0" />
                <Label htmlFor="opt-0" className="flex-grow cursor-pointer font-normal">
                  Never true
                </Label>
              </div>
            </RadioGroup>

            <div className="flex justify-between pt-4">
                <Button
                    variant="outline"
                    onClick={() => setCurrentQuestionIndex(prev => Math.max(0, prev - 1))}
                    disabled={currentQuestionIndex === 0}
                >
                    Previous
                </Button>
                {/* Next button is implicit via radio selection, but maybe we want one? */}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

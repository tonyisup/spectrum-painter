import { useState, useCallback } from "react";
import { questions } from "@/lib/raads-r-data";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RaadsRadialChart } from "@/components/RaadsRadialChart";
import { RadialChart } from "@/components/RadialChart";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft } from "lucide-react";
import { useLocation } from "wouter";
import { generateAudhdChartData } from "@/lib/audhd-mapper";

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
  const currentScores = calculateScores();
  const audhdChartData = generateAudhdChartData(answers);

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-7xl mx-auto space-y-6">
        <Button variant="ghost" onClick={() => setLocation("/")}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Home
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          {/* Left Column: Question Card */}
          <div className="space-y-6">
            {!isCompleted ? (
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
                    <div className="flex items-center space-x-2 border p-3 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
                      <RadioGroupItem value="3" id="opt-3" />
                      <Label htmlFor="opt-3" className="flex-grow cursor-pointer font-normal">
                        True now and when I was young
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2 border p-3 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
                      <RadioGroupItem value="2" id="opt-2" />
                      <Label htmlFor="opt-2" className="flex-grow cursor-pointer font-normal">
                        True now only
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2 border p-3 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
                      <RadioGroupItem value="1" id="opt-1" />
                      <Label htmlFor="opt-1" className="flex-grow cursor-pointer font-normal">
                        True only when I was younger than 16
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2 border p-3 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
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
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card className="bg-green-50 border-green-200">
                <CardHeader>
                  <CardTitle className="text-green-800">Assessment Complete!</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-green-700">
                    You have answered all 80 questions. Your results are displayed in the chart.
                  </p>
                  <div className="pt-4 flex gap-4">
                    <Button onClick={() => window.print()} variant="outline" className="bg-white">
                      Print Results
                    </Button>
                    <Button onClick={() => setLocation("/")}>
                      Return Home
                    </Button>
                  </div>
                  <div className="mt-8 text-sm text-gray-500">
                    <p>Note: This is a screening tool and not a diagnostic instrument. Please consult a professional for a formal diagnosis.</p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Right Column: Live Chart */}
          <div className="lg:sticky lg:top-8 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-center">
                  {isCompleted ? "Final RAADS-R Results" : "Live RAADS-R Results"}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <RaadsRadialChart scores={currentScores} />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-center">
                  AuDHD Spectrum Projection
                </CardTitle>
              </CardHeader>
              <CardContent>
                <RadialChart
                  selectedColor="#6366F1"
                  cellColors={audhdChartData.cellColors}
                  onCellClick={() => {}}
                  userName="Result Projection"
                  rotation={0}
                />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

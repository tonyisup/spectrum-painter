import { questions } from "./raads-r-data";
import mapping from "./raads-audhd-mapping.json";
import { AUDHD_TRAITS } from "./audhd-traits";

type Answer = 0 | 1 | 2 | 3;

interface ChartData {
  cellColors: Record<string, string>;
}

export function generateAudhdChartData(answers: Record<number, Answer>): ChartData {
  const cellColors: Record<string, string> = {};

  // For each trait in the mapping
  AUDHD_TRAITS.forEach((trait, traitIndex) => {
    const traitQuestions = (mapping as Record<string, number[]>)[trait];

    if (!traitQuestions || traitQuestions.length === 0) {
      return;
    }

    let currentScore = 0;
    let maxPossibleScore = 0;

    traitQuestions.forEach((questionId) => {
      const question = questions.find((q) => q.id === questionId);
      if (question) {
        maxPossibleScore += 3;
        const answer = answers[questionId];
        if (answer !== undefined) {
          let score = answer;
          if (question.isReverseScored) {
             // 0->3, 1->2, 2->1, 3->0
             score = (3 - answer) as Answer;
          }
          currentScore += score;
        }
      }
    });

    if (maxPossibleScore > 0) {
      const normalizedScore = (currentScore / maxPossibleScore) * 6; // Map to 0-6 rings
      const filledRings = Math.round(normalizedScore);

      // Use a distinct color for mapped results, e.g., Purple/Indigo like the default in ChartPage
      const color = "#6366F1";

      for (let ring = 1; ring <= filledRings; ring++) {
        const key = `${ring}-${traitIndex}`;
        cellColors[key] = color;
      }
    }
  });

  return { cellColors };
}

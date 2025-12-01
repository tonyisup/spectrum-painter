import { useState, useCallback, useRef } from "react";

interface CellData {
  ring: number;
  segment: number;
  color?: string;
}

interface RaadsRadialChartProps {
  scores: {
    social_relatedness: number;
    circumscribed_interests: number;
    language: number;
    sensory_motor: number;
  };
  userName?: string;
}

const TRAITS = [
  "Social Relatedness",
  "Circumscribed Interests",
  "Language",
  "Sensory Motor"
];

// Max scores for each subscale
const MAX_SCORES = {
  social_relatedness: 117,
  circumscribed_interests: 42,
  language: 21,
  sensory_motor: 60,
};

// Colors for each subscale
const COLORS = [
  "#FF6B6B", // Red
  "#4ECDC4", // Teal
  "#45B7D1", // Blue
  "#96CEB4", // Green
];

export function RaadsRadialChart({ scores, userName }: RaadsRadialChartProps) {
  const [hoveredCell, setHoveredCell] = useState<string | null>(null);

  const numRings = 6;
  const numSegments = 4;
  const centerX = 300;
  const centerY = 300;
  const maxRadius = 200;

  const getCellKey = (ring: number, segment: number) => `${ring}-${segment}`;

  const createCellPath = useCallback((ring: number, segment: number) => {
    const startAngle = (segment * (360 / numSegments)) * (Math.PI / 180) - Math.PI / 2;
    const endAngle = ((segment + 1) * (360 / numSegments)) * (Math.PI / 180) - Math.PI / 2;
    const innerRadius = (ring - 1) * (maxRadius / numRings);
    const outerRadius = ring * (maxRadius / numRings);

    const x1 = centerX + Math.cos(startAngle) * innerRadius;
    const y1 = centerY + Math.sin(startAngle) * innerRadius;
    const x2 = centerX + Math.cos(endAngle) * innerRadius;
    const y2 = centerY + Math.sin(endAngle) * innerRadius;
    const x3 = centerX + Math.cos(endAngle) * outerRadius;
    const y3 = centerY + Math.sin(endAngle) * outerRadius;
    const x4 = centerX + Math.cos(startAngle) * outerRadius;
    const y4 = centerY + Math.sin(startAngle) * outerRadius;

    const largeArcFlag = endAngle - startAngle <= Math.PI ? "0" : "1";

    return `
      M ${x1} ${y1}
      A ${innerRadius} ${innerRadius} 0 ${largeArcFlag} 1 ${x2} ${y2}
      L ${x3} ${y3}
      A ${outerRadius} ${outerRadius} 0 ${largeArcFlag} 0 ${x4} ${y4}
      Z
    `;
  }, []);

  const getLabelPosition = useCallback((index: number) => {
    const angle = (index * (360 / numSegments)) * (Math.PI / 180) - Math.PI / 2 + (Math.PI / numSegments);
    const labelRadius = maxRadius + 30;
    const x = centerX + Math.cos(angle) * labelRadius;
    const y = centerY + Math.sin(angle) * labelRadius;

    return { x, y };
  }, []);

  const getSegmentScore = (index: number) => {
    switch (index) {
      case 0: return scores.social_relatedness;
      case 1: return scores.circumscribed_interests;
      case 2: return scores.language;
      case 3: return scores.sensory_motor;
      default: return 0;
    }
  };

  const getSegmentMaxScore = (index: number) => {
    switch (index) {
      case 0: return MAX_SCORES.social_relatedness;
      case 1: return MAX_SCORES.circumscribed_interests;
      case 2: return MAX_SCORES.language;
      case 3: return MAX_SCORES.sensory_motor;
      default: return 1;
    }
  };

  const getCellColor = (ring: number, segment: number) => {
    const score = getSegmentScore(segment);
    const maxScore = getSegmentMaxScore(segment);
    const percentage = score / maxScore;
    const ringsFilled = Math.ceil(percentage * numRings);

    if (ring <= ringsFilled) {
      return COLORS[segment];
    }
    return "transparent";
  };

  const handleCellMouseEnter = (ring: number, segment: number) => {
    setHoveredCell(getCellKey(ring, segment));
  };

  const handleCellMouseLeave = () => {
    setHoveredCell(null);
  };

  return (
    <div className="flex flex-col items-center space-y-8">
      <div className="text-center">
        <h2 className="text-xl font-semibold text-primary mb-2">RAADS-R RESULTS</h2>
        {userName && <div className="text-lg font-medium text-gray-700">{userName}</div>}
      </div>

      <div className="relative">
        <svg
          width="600"
          height="600"
          viewBox="0 0 600 600"
          className="max-w-full h-auto"
        >
          {/* Grid circles */}
          {Array.from({ length: numRings }, (_, ring) => (
            <circle
              key={`circle-${ring}`}
              cx={centerX}
              cy={centerY}
              r={(ring + 1) * (maxRadius / numRings)}
              fill="none"
              stroke="#E5E7EB"
              strokeWidth="1"
            />
          ))}

          {/* Grid lines */}
          {Array.from({ length: numSegments }, (_, segment) => {
            const angle = (segment * (360 / numSegments)) * (Math.PI / 180) - Math.PI / 2;
            const x = centerX + Math.cos(angle) * maxRadius;
            const y = centerY + Math.sin(angle) * maxRadius;

            return (
              <line
                key={`line-${segment}`}
                x1={centerX}
                y1={centerY}
                x2={x}
                y2={y}
                stroke="#E5E7EB"
                strokeWidth="1"
              />
            );
          })}

          {/* Cells */}
          {Array.from({ length: numRings }, (_, ring) =>
            Array.from({ length: numSegments }, (_, segment) => {
              const cellKey = getCellKey(ring + 1, segment);
              const isHovered = hoveredCell === cellKey;
              const color = getCellColor(ring + 1, segment);

              return (
                <path
                  key={cellKey}
                  d={createCellPath(ring + 1, segment)}
                  fill={color}
                  stroke={isHovered ? "#6366F1" : "rgba(0,0,0,0.1)"}
                  strokeWidth={isHovered ? "2" : "1"}
                  className="transition-all duration-200"
                  onMouseEnter={() => handleCellMouseEnter(ring + 1, segment)}
                  onMouseLeave={handleCellMouseLeave}
                  data-testid={`cell-${ring + 1}-${segment}`}
                />
              );
            })
          )}

          {/* Trait labels */}
          {TRAITS.map((trait, index) => {
            const { x, y } = getLabelPosition(index);

            return (
              <text
                key={`label-${index}`}
                x={x}
                y={y}
                textAnchor="middle"
                dominantBaseline="middle"
                className="text-sm font-medium fill-gray-700 select-none"
                data-testid={`trait-label-${index}`}
              >
                {trait}
              </text>
            );
          })}
        </svg>

        {/* Legend / Score Summary */}
        <div className="mt-8 grid grid-cols-2 gap-4 max-w-md mx-auto">
            {TRAITS.map((trait, index) => (
                <div key={index} className="flex items-center space-x-2">
                    <div className="w-4 h-4 rounded-full" style={{ backgroundColor: COLORS[index] }}></div>
                    <span className="text-sm font-medium">
                        {trait}: {getSegmentScore(index)} / {getSegmentMaxScore(index)}
                    </span>
                </div>
            ))}
        </div>
        <div className="text-center mt-4 text-lg font-bold">
            Total Score: {Object.values(scores).reduce((a, b) => a + b, 0)}
        </div>
      </div>
    </div>
  );
}

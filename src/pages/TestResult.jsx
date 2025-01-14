import { useLocation, useNavigate } from "react-router-dom";
import { Card, Button } from "antd";
import { CheckCircleOutlined } from "@ant-design/icons";

const TestResult = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { answers, test, dateCompleted } = location.state || {};

  const calculateScores = () => {
    if (!answers || !test) return null;

    // Calculate total score
    const totalScore = answers.reduce((sum, answer) => sum + answer.score, 0);

    // Calculate maximum possible score
    const maxPossibleScore =
      answers.length *
      Math.max(...test.questions[0].options.map((opt) => opt.value));

    // Calculate average score
    const averageScore = totalScore / answers.length;

    // Calculate percentage
    const percentage = (totalScore / maxPossibleScore) * 100;

    return {
      totalScore,
      maxPossibleScore,
      averageScore: Number(averageScore.toFixed(2)),
      percentage: Number(percentage.toFixed(2)),
    };
  };

  const getInterpretation = (category, score) => {
    const interpretations = {
      Depression: {
        0: {
          level: "Minimal",
          description: "Your symptoms suggest minimal depression.",
        },
        5: {
          level: "Mild",
          description: "Your symptoms suggest mild depression.",
        },
        10: {
          level: "Moderate",
          description: "Your symptoms suggest moderate depression.",
        },
        15: {
          level: "Moderately Severe",
          description: "Your symptoms suggest moderately severe depression.",
        },
        20: {
          level: "Severe",
          description: "Your symptoms suggest severe depression.",
        },
      },
      Anxiety: {
        0: {
          level: "Minimal",
          description: "Your symptoms suggest minimal anxiety.",
        },
        5: {
          level: "Mild",
          description: "Your symptoms suggest mild anxiety.",
        },
        10: {
          level: "Moderate",
          description: "Your symptoms suggest moderate anxiety.",
        },
        15: {
          level: "Severe",
          description: "Your symptoms suggest severe anxiety.",
        },
      },
      Stress: {
        0: { level: "Low", description: "Your perceived stress level is low." },
        14: {
          level: "Moderate",
          description: "Your perceived stress level is moderate.",
        },
        27: {
          level: "High",
          description: "Your perceived stress level is high.",
        },
      },
    };

    const levels = Object.keys(interpretations[test.category])
      .map(Number)
      .sort((a, b) => a - b);

    const level = levels.reduce((prev, curr) => {
      return score >= curr ? curr : prev;
    }, levels[0]);

    return interpretations[test.category][level];
  };

  const scores = calculateScores();
  const interpretation = scores
    ? getInterpretation(test.category, scores.totalScore)
    : null;

  // Create complete result object
  const result = {
    id: `result_${Date.now()}`,
    testId: test.id,
    testTitle: test.title,
    category: test.category,
    dateCompleted,
    answers,
    scores,
    interpretation,
    duration: test.duration,
    status: "finished",
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <Card className="shadow-lg rounded-2xl">
          {/* Header */}
          <div className="text-center mb-8">
            <CheckCircleOutlined className="text-4xl text-custom-green mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Test Completed
            </h1>
            <p className="text-gray-600">{test.title}</p>
          </div>

          {/* Scores */}
          <div className="grid grid-cols-2 gap-4 mb-8">
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">Total Score</p>
              <p className="text-2xl font-bold text-gray-900">
                {scores?.totalScore}/{scores?.maxPossibleScore}
              </p>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">Average Score</p>
              <p className="text-2xl font-bold text-gray-900">
                {scores?.averageScore}
              </p>
            </div>
          </div>

          {/* Interpretation */}
          <div className="bg-custom-green/10 p-6 rounded-xl mb-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-2">
              {interpretation?.level}
            </h2>
            <p className="text-gray-600">{interpretation?.description}</p>
          </div>

          {/* Actions */}
          <div className="flex justify-between">
            <Button onClick={() => navigate("/tests")}>Back to Tests</Button>
            <Button
              type="primary"
              className="bg-custom-green"
              onClick={() => {
                // Here you could save the result to your database/storage
                console.log("Test result:", result);
                navigate("/tests");
              }}
            >
              Finish
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default TestResult;

import { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import {
  Card,
  Button,
  Spin,
  Alert,
  Progress,
  Divider,
  Tag,
  Typography,
} from "antd";
import {
  CheckCircleOutlined,
  ArrowLeftOutlined,
  FileTextOutlined,
} from "@ant-design/icons";
import { useSurveyStore } from "../stores/surveyStore";
import { useAuthStore } from "../stores/authStore";

const { Title, Text, Paragraph } = Typography;

const TestResult = () => {
  const { surveyId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { fetchSurveyResults, loading, error, selectedSurvey } =
    useSurveyStore();

  // Get score from navigation state if available
  const scoreFromState = location.state?.score;
  const statusFromState = location.state?.status;

  const [calculatedScore, setCalculatedScore] = useState(null);
  const [interpretation, setInterpretation] = useState(null);

  useEffect(() => {
    const loadResults = async () => {
      if (!surveyId || !user?.id) {
        navigate("/tests");
        return;
      }

      try {
        await fetchSurveyResults(surveyId, user.id);
      } catch (error) {
        console.error("Failed to load survey results:", error);
      }
    };

    loadResults();
  }, [surveyId, user?.id, fetchSurveyResults, navigate]);

  useEffect(() => {
    if (selectedSurvey?.questionList) {
      // Parse the score if it's available from the API response
      let totalScore = 0;
      let maxScore = 30; // Default max score

      if (scoreFromState) {
        // Parse score in format "11/30"
        const scoreParts = scoreFromState.split("/");
        if (scoreParts.length === 2) {
          totalScore = parseInt(scoreParts[0], 10);
          maxScore = parseInt(scoreParts[1], 10);
        }
      } else if (
        selectedSurvey.totalScore &&
        selectedSurvey.totalScore !== "null/null"
      ) {
        // Parse score from survey results
        const scoreParts = selectedSurvey.totalScore.split("/");
        if (scoreParts.length === 2) {
          totalScore = parseInt(scoreParts[0], 10);
          maxScore = parseInt(scoreParts[1], 10);
        }
      } else {
        // Calculate score manually if not available
        totalScore = calculateManualScore(selectedSurvey.questionList);
        maxScore = selectedSurvey.questionList.length * 3; // Assuming max value is 3 per question
      }

      setCalculatedScore({
        totalScore,
        maxPossibleScore: maxScore,
        percentage: Math.round((totalScore / maxScore) * 100),
      });

      setInterpretation(
        getInterpretation(
          selectedSurvey.questionList[0].questionCategory,
          totalScore
        )
      );
    }
  }, [selectedSurvey, scoreFromState]);

  // Function to manually calculate score if needed
  const calculateManualScore = (questions) => {
    let totalScore = 0;

    questions.forEach((question) => {
      const selectedOption = question.questionOptions.find(
        (opt) => opt.checked
      );
      if (selectedOption) {
        // For PSS (Perceived Stress Scale), questions 4, 5, 7, and 8 are typically reverse-scored
        const isReverseScored = ["3", "4", "6", "7"].includes(question.id);

        if (isReverseScored) {
          totalScore += 3 - selectedOption.value;
        } else {
          totalScore += selectedOption.value;
        }
      }
    });

    return totalScore;
  };

  const getInterpretation = (category, score) => {
    // Standardize category name
    const categoryName = category ? category.toUpperCase() : "ANXIETY";

    const interpretations = {
      ANXIETY: [
        {
          threshold: 0,
          level: "Minimal",
          color: "green",
          description:
            "Your anxiety level is minimal. Continue practicing good mental health habits.",
        },
        {
          threshold: 10,
          level: "Mild",
          color: "lime",
          description:
            "You're experiencing mild anxiety. Consider some stress-reduction techniques.",
        },
        {
          threshold: 15,
          level: "Moderate",
          color: "gold",
          description:
            "Your anxiety level is moderate. Consider speaking with a mental health professional.",
        },
        {
          threshold: 20,
          level: "High",
          color: "orange",
          description:
            "You're experiencing high anxiety. We recommend consulting with a mental health professional.",
        },
        {
          threshold: 25,
          level: "Severe",
          color: "red",
          description:
            "Your anxiety level is severe. Please seek professional help as soon as possible.",
        },
      ],
      DEPRESSION: [
        {
          threshold: 0,
          level: "Minimal",
          color: "green",
          description:
            "Your depression symptoms are minimal. Continue practicing good mental health habits.",
        },
        {
          threshold: 10,
          level: "Mild",
          color: "lime",
          description:
            "You're showing mild symptoms of depression. Consider some self-care techniques.",
        },
        {
          threshold: 15,
          level: "Moderate",
          color: "gold",
          description:
            "Your depression symptoms are moderate. Consider speaking with a mental health professional.",
        },
        {
          threshold: 20,
          level: "Moderately Severe",
          color: "orange",
          description:
            "You're showing moderately severe symptoms of depression. We recommend consulting with a mental health professional.",
        },
        {
          threshold: 25,
          level: "Severe",
          color: "red",
          description:
            "Your depression symptoms are severe. Please seek professional help as soon as possible.",
        },
      ],
      STRESS: [
        {
          threshold: 0,
          level: "Low",
          color: "green",
          description:
            "Your stress level is low. Continue practicing good stress management techniques.",
        },
        {
          threshold: 14,
          level: "Moderate",
          color: "gold",
          description:
            "You're experiencing moderate stress. Consider implementing additional stress-reduction strategies.",
        },
        {
          threshold: 27,
          level: "High",
          color: "red",
          description:
            "Your stress level is high. We recommend seeking support and implementing comprehensive stress management techniques.",
        },
      ],
    };

    // Default to anxiety if category not found
    const categoryInterpretations =
      interpretations[categoryName] || interpretations["ANXIETY"];

    // Find the appropriate interpretation based on score
    let result = categoryInterpretations[0];
    for (const interp of categoryInterpretations) {
      if (score >= interp.threshold) {
        result = interp;
      } else {
        break;
      }
    }

    return result;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Spin size="large" tip="Loading your results..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <Alert
          message="Error Loading Results"
          description={error}
          type="error"
          showIcon
          action={
            <Button onClick={() => navigate("/tests")} type="primary" danger>
              Back to Tests
            </Button>
          }
        />
      </div>
    );
  }

  if (!selectedSurvey) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <Alert
          message="No Results Found"
          description="We couldn't find the test results you're looking for."
          type="warning"
          showIcon
          action={
            <Button onClick={() => navigate("/tests")} type="primary">
              Back to Tests
            </Button>
          }
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <Card className="shadow-lg rounded-2xl overflow-hidden">
          {/* Header */}
          <div className="bg-custom-green text-white p-6 -mx-6 -mt-6 mb-6">
            <Button
              type="text"
              icon={<ArrowLeftOutlined />}
              className="text-white hover:text-white/80 mb-4"
              onClick={() => navigate("/tests")}
            >
              Back to Tests
            </Button>
            <div className="text-center">
              <CheckCircleOutlined className="text-4xl mb-4" />
              <Title level={2} className="text-white m-0">
                {selectedSurvey.title}
              </Title>
              <Text className="text-white/80">
                {selectedSurvey.description}
              </Text>
            </div>
          </div>

          {/* Score Section */}
          {calculatedScore && (
            <div className="mb-8">
              <Title level={4} className="text-center mb-6">
                Your Results
              </Title>

              <div className="flex justify-center mb-6">
                <div className="w-64 h-64 relative">
                  <Progress
                    type="circle"
                    percent={calculatedScore.percentage}
                    strokeColor={interpretation?.color || "green"}
                    strokeWidth={10}
                    format={() => (
                      <div className="text-center">
                        <div className="text-3xl font-bold">
                          {calculatedScore.totalScore}/
                          {calculatedScore.maxPossibleScore}
                        </div>
                        <div className="text-gray-500">Total Score</div>
                      </div>
                    )}
                  />
                </div>
              </div>

              <div className="text-center mb-6">
                <Tag
                  color={interpretation?.color || "green"}
                  className="text-lg px-4 py-1"
                >
                  {interpretation?.level || "Unknown"} Level
                </Tag>
              </div>

              <div
                className={`p-6 rounded-xl bg-${
                  interpretation?.color || "green"
                }-50 border border-${interpretation?.color || "green"}-100`}
              >
                <Paragraph className="text-lg">
                  {interpretation?.description ||
                    "Thank you for completing this assessment."}
                </Paragraph>
              </div>
            </div>
          )}

          <Divider>
            <FileTextOutlined /> Your Responses
          </Divider>

          {/* Responses Section */}
          <div className="space-y-6 mt-6">
            {selectedSurvey.questionList.map((question, index) => {
              const selectedOption = question.questionOptions.find(
                (opt) => opt.checked
              );

              return (
                <div key={question.id} className="border-b pb-4">
                  <div className="flex">
                    <div className="bg-custom-green/10 text-custom-green font-bold rounded-full w-8 h-8 flex items-center justify-center mr-3 flex-shrink-0">
                      {parseInt(question.id) + 1}
                    </div>
                    <div>
                      <Text strong className="text-gray-800">
                        {question.questionText}
                      </Text>
                      <div className="mt-3 ml-2">
                        <Text type="secondary">Your answer: </Text>
                        <Tag color="blue" className="ml-2">
                          {selectedOption?.label || "Not answered"}
                        </Tag>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Actions */}
          <div className="flex justify-between mt-8">
            <Button onClick={() => navigate("/tests")}>Back to Tests</Button>
            <Button
              type="primary"
              className="bg-custom-green hover:bg-custom-green/90"
              onClick={() => navigate("/dashboard")}
            >
              Go to Dashboard
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default TestResult;

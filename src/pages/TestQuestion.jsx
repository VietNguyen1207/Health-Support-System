import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Radio,
  Button,
  Progress,
  Card,
  Spin,
  message,
  Typography,
  Space,
  Divider,
} from "antd";
import {
  ArrowLeftOutlined,
  ArrowRightOutlined,
  CheckCircleOutlined,
  QuestionCircleOutlined,
  FileTextOutlined,
} from "@ant-design/icons";
import { useSurveyStore } from "../stores/surveyStore";
import { useAuthStore } from "../stores/authStore";

const { Title, Text, Paragraph } = Typography;

const TestQuestion = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const test = location.state?.test;
  const { user } = useAuthStore();

  const {
    questions,
    loadingQuestions,
    fetchSurveyQuestions,
    clearQuestions,
    submitSurveyAnswers,
  } = useSurveyStore();

  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [selectedOption, setSelectedOption] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Fetch questions when component mounts
  useEffect(() => {
    if (!test?.id) {
      message.error("No test selected. Redirecting to tests page.");
      navigate("/test");
      return;
    }

    const loadQuestions = async () => {
      try {
        await fetchSurveyQuestions(test.id);
      } catch (error) {
        message.error("Failed to load questions. Please try again.");
        navigate("/test");
      }
    };

    loadQuestions();

    // Clean up questions when component unmounts
    return () => clearQuestions();
  }, [test, fetchSurveyQuestions, clearQuestions, navigate]);

  const handleAnswer = (value) => {
    setSelectedOption(value);
    setAnswers({
      ...answers,
      [currentQuestion]: {
        questionId: questions[currentQuestion].id,
        question: questions[currentQuestion].questionText,
        selectedOption: value,
        answer: questions[currentQuestion].questionOptions.find(
          (opt) => opt.value === value
        )?.label,
        score: value,
        answerID: questions[currentQuestion].questionOptions.find(
          (opt) => opt.value === value
        )?.answerID,
      },
    });
  };

  const handleNext = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setSelectedOption(answers[currentQuestion + 1]?.selectedOption || null);
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
      setSelectedOption(answers[currentQuestion - 1]?.selectedOption || null);
    }
  };

  const handleSubmit = async () => {
    if (!user?.studentId || !test?.id) {
      message.error("User or test information is missing.");
      return;
    }

    // Check if all questions have been answered
    const unansweredCount = questions.length - Object.keys(answers).length;
    if (unansweredCount > 0) {
      message.warning(
        `You have ${unansweredCount} unanswered question(s). Please answer all questions before submitting.`
      );
      return;
    }

    setSubmitting(true);
    try {
      // Extract just the answer IDs for submission
      const answerIDs = Object.values(answers).map((answer) => answer.answerID);

      console.log("Submitting answer IDs:", answerIDs);

      // Submit the answer IDs
      const result = await submitSurveyAnswers(
        test.id,
        user.studentId,
        answerIDs
      );

      console.log("Survey submission result:", result);

      // Navigate to results page with the survey ID in the URL
      navigate(`/test-result/${test.id}`);
    } catch (error) {
      console.error("Failed to submit survey:", error);
      message.error("Failed to submit your answers. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loadingQuestions) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="mb-4">
            <Spin size="large" />
          </div>
          <Title level={4} className="text-gray-700">
            Loading Assessment
          </Title>
          <Paragraph className="text-gray-500">
            Please wait while we prepare your questions...
          </Paragraph>
        </div>
      </div>
    );
  }

  if (!questions || questions.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="shadow-md rounded-lg text-center p-8 max-w-md">
          <FileTextOutlined className="text-5xl text-primary-green mb-4" />
          <Title level={3} className="mb-2">
            No Questions Available
          </Title>
          <Paragraph className="text-gray-500 mb-6">
            We couldn't find any questions for this assessment.
          </Paragraph>
          <Button
            type="primary"
            onClick={() => navigate("/test")}
            className="bg-primary-green hover:bg-primary-green/90"
            size="large"
            icon={<ArrowLeftOutlined />}
          >
            Back to Tests
          </Button>
        </Card>
      </div>
    );
  }

  const progress = ((currentQuestion + 1) / questions.length) * 100;

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        {/* Test Header */}
        <Card className="shadow-sm mb-8 border-t-4 border-t-primary-green">
          <div className="flex items-start">
            <div className="mr-4">
              <div className="bg-primary-green/10 p-3 rounded-full">
                <FileTextOutlined className="text-2xl text-primary-green" />
              </div>
            </div>
            <div>
              <Title level={3} className="mb-1">
                {test?.title || "Psychological Assessment"}
              </Title>
              <Paragraph className="text-gray-500">
                {test?.description ||
                  "Please answer each question honestly based on your experiences over the last 2 weeks."}
              </Paragraph>
            </div>
          </div>
        </Card>

        {/* Progress Bar */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-2">
            <Text className="text-gray-600">
              Question {currentQuestion + 1} of {questions.length}
            </Text>
            <Text className="text-primary-green font-medium">
              {Math.round(progress)}% Complete
            </Text>
          </div>
          <Progress
            percent={progress}
            showInfo={false}
            strokeColor="#4a7c59"
            trailColor="#e5e7eb"
            strokeWidth={10}
            className="rounded-full overflow-hidden"
          />
        </div>

        {/* Question Card */}
        <Card
          className="shadow-md rounded-lg mb-8 hover:shadow-lg transition-shadow duration-300"
          bordered={false}
        >
          <div className="flex items-start mb-6">
            <div className="mr-4 mt-1">
              <div className="bg-primary-green/10 p-2 rounded-full">
                <QuestionCircleOutlined className="text-xl text-primary-green" />
              </div>
            </div>
            <Title level={4} className="text-gray-800 mb-0">
              {questions[currentQuestion].questionText}
            </Title>
          </div>

          <Divider className="my-4" />

          <Radio.Group
            onChange={(e) => handleAnswer(e.target.value)}
            value={selectedOption}
            className="w-full"
          >
            <Space direction="vertical" className="w-full">
              {questions[currentQuestion].questionOptions.map((option) => (
                <Radio.Button
                  key={option.answerID}
                  value={option.value}
                  className="w-full text-left py-3 px-4 border rounded-lg mb-2 hover:border-primary-green transition-colors"
                  style={{
                    height: "auto",
                    backgroundColor:
                      selectedOption === option.value ? "#f0f9f1" : "white",
                    borderColor:
                      selectedOption === option.value ? "#4a7c59" : "#d9d9d9",
                  }}
                >
                  {option.label}
                </Radio.Button>
              ))}
            </Space>
          </Radio.Group>
        </Card>

        {/* Navigation Buttons */}
        <div className="flex justify-between">
          <Button
            onClick={handlePrevious}
            disabled={currentQuestion === 0}
            icon={<ArrowLeftOutlined />}
            size="large"
            className="border-gray-300 text-gray-600"
          >
            Previous
          </Button>

          {currentQuestion === questions.length - 1 ? (
            <Button
              type="primary"
              onClick={handleSubmit}
              disabled={!answers[currentQuestion] || submitting}
              loading={submitting}
              icon={<CheckCircleOutlined />}
              size="large"
              className="bg-primary-green hover:bg-primary-green/90"
            >
              Submit Assessment
            </Button>
          ) : (
            <Button
              type="primary"
              onClick={handleNext}
              disabled={!answers[currentQuestion]}
              icon={<ArrowRightOutlined />}
              size="large"
              className="bg-primary-green hover:bg-primary-green/90"
            >
              Next Question
            </Button>
          )}
        </div>

        {/* Question Navigation Dots */}
        <div className="mt-8 flex justify-center">
          <div className="flex flex-wrap justify-center gap-2 max-w-md">
            {questions.map((_, index) => (
              <div
                key={index}
                className={`w-3 h-3 rounded-full cursor-pointer transition-all duration-300 ${
                  index === currentQuestion
                    ? "bg-primary-green scale-125"
                    : answers[index]
                    ? "bg-primary-green/40"
                    : "bg-gray-300"
                }`}
                onClick={() => setCurrentQuestion(index)}
                title={`Question ${index + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TestQuestion;

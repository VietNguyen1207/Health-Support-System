import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Radio, Button, Progress, Card, Spin, message } from "antd";
import { useSurveyStore } from "../stores/surveyStore";

const TestQuestion = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const test = location.state?.test;

  const { questions, loadingQuestions, fetchSurveyQuestions, clearQuestions } =
    useSurveyStore();

  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [selectedOption, setSelectedOption] = useState(null);

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

  const handleSubmit = () => {
    // Navigate to results with answers and test data
    navigate("/test-results", {
      state: {
        answers: Object.values(answers),
        test: {
          ...test,
          title: test.title,
          questions: questions,
        },
        dateCompleted: new Date().toISOString(),
      },
    });
  };

  if (loadingQuestions) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Spin size="large" />
          <p className="mt-4 text-gray-600">Loading questions...</p>
        </div>
      </div>
    );
  }

  if (!questions || questions.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-lg text-gray-800">No questions available.</p>
          <Button
            type="primary"
            onClick={() => navigate("/test")}
            className="mt-4 bg-custom-green hover:bg-custom-green/90"
          >
            Back to Tests
          </Button>
        </div>
      </div>
    );
  }

  const progress = ((currentQuestion + 1) / questions.length) * 100;

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        {/* Test Header */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            {test?.title || "Psychological Assessment"}
          </h1>
          <p className="text-gray-600">
            {test?.description ||
              "Please answer each question honestly based on your experiences over the last 2 weeks."}
          </p>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <Progress
            percent={progress}
            showInfo={false}
            strokeColor="#4a7c59"
            trailColor="#e5e7eb"
          />
          <p className="text-center text-sm text-gray-500 mt-2">
            Question {currentQuestion + 1} of {questions.length}
          </p>
        </div>

        {/* Question Card */}
        <Card className="shadow-md rounded-lg mb-8">
          <h2 className="text-lg font-medium text-gray-900 mb-6">
            {questions[currentQuestion].questionText}
          </h2>

          <Radio.Group
            onChange={(e) => handleAnswer(e.target.value)}
            value={selectedOption}
            className="flex flex-col space-y-4"
          >
            {questions[currentQuestion].questionOptions.map((option) => (
              <Radio
                key={option.answerID}
                value={option.value}
                className="text-gray-700 py-2"
              >
                {option.label}
              </Radio>
            ))}
          </Radio.Group>
        </Card>

        {/* Navigation Buttons */}
        <div className="flex justify-between">
          <Button
            onClick={handlePrevious}
            disabled={currentQuestion === 0}
            className="text-gray-600"
          >
            Previous
          </Button>

          {currentQuestion === questions.length - 1 ? (
            <Button
              type="primary"
              onClick={handleSubmit}
              disabled={!answers[currentQuestion]}
              className="bg-custom-green hover:bg-custom-green/90"
            >
              Submit
            </Button>
          ) : (
            <Button
              type="primary"
              onClick={handleNext}
              disabled={!answers[currentQuestion]}
              className="bg-primary-green hover:bg-primary-green/90"
            >
              Next
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default TestQuestion;

import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Radio, Button, Progress, Card } from "antd";

const TestQuestion = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const test = location.state?.test;
  const questions = test?.questions || [];

  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [selectedOption, setSelectedOption] = useState(null);

  const handleAnswer = (value) => {
    setSelectedOption(value);
    setAnswers({
      ...answers,
      [currentQuestion]: {
        questionId: questions[currentQuestion].id,
        question: questions[currentQuestion].text,
        selectedOption: value,
        answer: questions[currentQuestion].options.find(
          (opt) => opt.value === value
        )?.label,
        score: value,
      },
    });
  };

  const handleNext = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setSelectedOption(answers[currentQuestion + 1] || null);
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
      setSelectedOption(answers[currentQuestion - 1] || null);
    }
  };

  const handleSubmit = () => {
    // Navigate to results with answers and test data
    navigate("/test-results", {
      state: {
        answers: Object.values(answers),
        test,
        dateCompleted: new Date().toISOString(),
      },
    });
  };

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
            {questions[currentQuestion].text}
          </h2>

          <Radio.Group
            onChange={(e) => handleAnswer(e.target.value)}
            value={selectedOption}
            className="flex flex-col space-y-4"
          >
            {questions[currentQuestion].options.map((option) => (
              <Radio
                key={option.value}
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
              className="bg-custom-green hover:bg-custom-green/90"
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

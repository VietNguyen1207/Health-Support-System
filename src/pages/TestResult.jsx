import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Card,
  Button,
  Spin,
  Alert,
  Progress,
  Divider,
  Tag,
  Typography,
  Row,
  Col,
  Tooltip,
  List,
  Avatar,
} from "antd";
import {
  ArrowLeftOutlined,
  FileTextOutlined,
  CalendarOutlined,
  BarChartOutlined,
  HeartOutlined,
  ExclamationCircleOutlined,
  HomeOutlined,
  InfoCircleOutlined,
  RightOutlined,
  ClockCircleOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { useSurveyStore } from "../stores/surveyStore";
import { useAuthStore } from "../stores/authStore";

const { Title, Text, Paragraph } = Typography;

const TestResult = () => {
  const { surveyId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { fetchSurveyResults, loading, error, selectedSurvey } =
    useSurveyStore();

  const [calculatedScore, setCalculatedScore] = useState(null);
  const [interpretation, setInterpretation] = useState(null);
  const [needsConsultation, setNeedsConsultation] = useState(false);
  const [completedDate, setCompletedDate] = useState(null);
  const [showResponses, setShowResponses] = useState(false);

  useEffect(() => {
    const loadResults = async () => {
      if (!surveyId || !user?.studentId) {
        console.error("Missing surveyId or studentId");
        navigate("/test");
        return;
      }

      try {
        // console.log(
        //   `Fetching results for survey ${surveyId} and student ${user.studentId}`
        // );
        await fetchSurveyResults(surveyId, user.studentId);
      } catch (error) {
        console.error("Failed to load survey results:", error);
      }
    };

    loadResults();
  }, [surveyId, user?.studentId, fetchSurveyResults, navigate]);

  useEffect(() => {
    if (selectedSurvey) {
      // console.log("Selected survey data:", selectedSurvey);

      // Set completed date
      setCompletedDate(new Date().toLocaleDateString());

      // Parse the score from the API response
      if (
        selectedSurvey.totalScore &&
        selectedSurvey.totalScore !== "null/null"
      ) {
        const scoreParts = selectedSurvey.totalScore.split("/");
        if (scoreParts.length === 2) {
          const totalScore = parseInt(scoreParts[0], 10);
          const maxPossibleScore = parseInt(scoreParts[1], 10);

          setCalculatedScore({
            totalScore,
            maxPossibleScore,
            percentage: Math.round((totalScore / maxPossibleScore) * 100),
          });

          // Get the category from the first question
          const category =
            selectedSurvey.questionList?.[0]?.questionCategory || "ANXIETY";
          const result = getInterpretation(category, totalScore);
          setInterpretation(result);

          // Determine if score is high enough to recommend consultation
          if (
            (category === "ANXIETY" && totalScore >= 20) ||
            (category === "DEPRESSION" && totalScore >= 20) ||
            (category === "STRESS" && totalScore >= 27)
          ) {
            setNeedsConsultation(true);
          }
        }
      }
    }
  }, [selectedSurvey]);

  const getInterpretation = (category, score) => {
    const categoryName = category ? category.toUpperCase() : "ANXIETY";

    const interpretations = {
      ANXIETY: [
        {
          threshold: 0,
          level: "Minimal",
          color: "green",
          description:
            "Your anxiety level is minimal. Continue practicing good mental health habits.",
          icon: <HeartOutlined />,
          recommendations: [
            "Continue your current self-care practices",
            "Maintain regular exercise and sleep routines",
            "Practice mindfulness for preventive care",
          ],
        },
        {
          threshold: 10,
          level: "Mild",
          color: "lime",
          description:
            "You're experiencing mild anxiety. Consider some stress-reduction techniques.",
          icon: <HeartOutlined />,
          recommendations: [
            "Try deep breathing exercises when feeling anxious",
            "Consider adding meditation to your daily routine",
            "Maintain a regular sleep schedule",
          ],
        },
        {
          threshold: 15,
          level: "Moderate",
          color: "gold",
          description:
            "Your anxiety level is moderate. Consider speaking with a mental health professional.",
          icon: <ExclamationCircleOutlined />,
          recommendations: [
            "Schedule a consultation with a counselor",
            "Practice daily relaxation techniques",
            "Identify and reduce stressors in your environment",
          ],
        },
        {
          threshold: 20,
          level: "High",
          color: "orange",
          description:
            "You're experiencing high anxiety. We recommend consulting with a mental health professional.",
          icon: <ExclamationCircleOutlined />,
          recommendations: [
            "Book an appointment with a mental health professional",
            "Learn and practice grounding techniques for anxiety attacks",
            "Consider joining a support group",
          ],
        },
        {
          threshold: 25,
          level: "Severe",
          color: "red",
          description:
            "Your anxiety level is severe. Please seek professional help as soon as possible.",
          icon: <ExclamationCircleOutlined />,
          recommendations: [
            "Seek professional help immediately",
            "Discuss treatment options with a mental health professional",
            "Establish a support system with trusted friends or family",
          ],
        },
      ],
      DEPRESSION: [
        {
          threshold: 0,
          level: "Minimal",
          color: "green",
          description:
            "Your depression symptoms are minimal. Continue practicing good mental health habits.",
          icon: <HeartOutlined />,
          recommendations: [
            "Maintain social connections and activities you enjoy",
            "Continue regular exercise and healthy eating habits",
            "Practice gratitude journaling",
          ],
        },
        {
          threshold: 10,
          level: "Mild",
          color: "lime",
          description:
            "You're showing mild symptoms of depression. Consider some self-care techniques.",
          icon: <HeartOutlined />,
          recommendations: [
            "Increase physical activity and time outdoors",
            "Establish a consistent daily routine",
            "Practice positive self-talk and affirmations",
          ],
        },
        {
          threshold: 15,
          level: "Moderate",
          color: "gold",
          description:
            "Your depression symptoms are moderate. Consider speaking with a mental health professional.",
          icon: <ExclamationCircleOutlined />,
          recommendations: [
            "Schedule a consultation with a mental health professional",
            "Establish a regular sleep schedule",
            "Set small, achievable daily goals",
          ],
        },
        {
          threshold: 20,
          level: "Moderately Severe",
          color: "orange",
          description:
            "You're showing moderately severe symptoms of depression. We recommend consulting with a mental health professional.",
          icon: <ExclamationCircleOutlined />,
          recommendations: [
            "Book an appointment with a mental health professional",
            "Reach out to trusted friends or family for support",
            "Focus on basic self-care like nutrition and sleep",
          ],
        },
        {
          threshold: 25,
          level: "Severe",
          color: "red",
          description:
            "Your depression symptoms are severe. Please seek professional help as soon as possible.",
          icon: <ExclamationCircleOutlined />,
          recommendations: [
            "Seek professional help immediately",
            "Consider discussing treatment options with a psychiatrist",
            "Ensure you're not alone during difficult periods",
          ],
        },
      ],
      STRESS: [
        {
          threshold: 0,
          level: "Low",
          color: "green",
          description:
            "Your stress level is low. Continue practicing good stress management techniques.",
          icon: <HeartOutlined />,
          recommendations: [
            "Maintain your current stress management practices",
            "Continue regular exercise and relaxation activities",
            "Practice preventive self-care",
          ],
        },
        {
          threshold: 14,
          level: "Moderate",
          color: "gold",
          description:
            "You're experiencing moderate stress. Consider implementing additional stress-reduction strategies.",
          icon: <ExclamationCircleOutlined />,
          recommendations: [
            "Identify and address sources of stress",
            "Practice time management and prioritization",
            "Incorporate relaxation techniques into your daily routine",
          ],
        },
        {
          threshold: 27,
          level: "High",
          color: "red",
          description:
            "Your stress level is high. We recommend seeking support and implementing comprehensive stress management techniques.",
          icon: <ExclamationCircleOutlined />,
          recommendations: [
            "Consult with a mental health professional",
            "Evaluate and adjust work-life balance",
            "Practice daily stress reduction techniques",
          ],
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
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white flex items-center justify-center">
        <div className="text-center">
          <div className="mb-4">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-50">
              <Spin size="large" />
            </div>
          </div>
          <Title level={4} className="m-0 mb-2">
            Loading Your Results
          </Title>
          <Text type="secondary">
            Please wait while we analyze your responses...
          </Text>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-8 flex items-center justify-center">
        <Card className="w-full max-w-lg shadow-md rounded-lg overflow-hidden">
          <Alert
            message="Error Loading Results"
            description={error}
            type="error"
            showIcon
            className="mb-4"
          />
          <div className="flex justify-center">
            <Button
              onClick={() => navigate("/test")}
              type="primary"
              danger
              icon={<ArrowLeftOutlined />}>
              Back to Tests
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  if (!selectedSurvey) {
    return (
      <div className="min-h-screen bg-gray-50 p-8 flex items-center justify-center">
        <Card className="w-full max-w-lg shadow-md rounded-lg overflow-hidden">
          <Alert
            message="No Results Found"
            description="We couldn't find the test results you're looking for."
            type="warning"
            showIcon
            className="mb-4"
          />
          <div className="flex justify-center">
            <Button
              onClick={() => navigate("/test")}
              type="primary"
              icon={<ArrowLeftOutlined />}>
              Back to Tests
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-8 px-4">
      {/* Breadcrumb Navigation */}
      <div className="max-w-4xl mx-auto mb-4">
        <div className="flex items-center text-sm text-gray-500 mb-6">
          <Button
            type="link"
            className="p-0 h-auto flex items-center text-gray-500 hover:text-primary-green"
            onClick={() => navigate("/")}>
            <HomeOutlined className="mr-1" />
            <span>Home</span>
          </Button>
          <RightOutlined className="mx-2 text-xs" />
          <Button
            type="link"
            className="p-0 h-auto flex items-center text-gray-500 hover:text-primary-green"
            onClick={() => navigate("/test")}>
            <span>Tests</span>
          </Button>
          <RightOutlined className="mx-2 text-xs" />
          <span className="text-primary-green font-medium">Results</span>
        </div>
      </div>

      <div className="max-w-4xl mx-auto">
        {/* Main Results Card */}
        <Card
          className="shadow-lg rounded-xl overflow-hidden border-0 mb-6"
          bodyStyle={{ padding: 0 }}>
          {/* Header with gradient background */}
          <div
            className="text-white p-8"
            style={{
              background: interpretation
                ? `linear-gradient(135deg, ${interpretation.color}, ${
                    interpretation.color === "green"
                      ? "#2e8b57"
                      : interpretation.color === "lime"
                      ? "#32cd32"
                      : interpretation.color === "gold"
                      ? "#daa520"
                      : interpretation.color === "orange"
                      ? "#ff8c00"
                      : "#cc0000"
                  })`
                : "linear-gradient(135deg, #4a7c59, #2e8b57)",
              position: "relative",
              overflow: "hidden",
            }}>
            {/* Decorative circles */}
            <div
              className="absolute top-0 right-0 w-64 h-64 rounded-full opacity-10 bg-white"
              style={{ transform: "translate(30%, -30%)" }}></div>
            <div
              className="absolute bottom-0 left-0 w-40 h-40 rounded-full opacity-10 bg-white"
              style={{ transform: "translate(-30%, 30%)" }}></div>

            <div className="relative z-10">
              <div className="flex items-center justify-between mb-6">
                <Tag className="text-gray-800 font-medium px-3 py-1 rounded-full flex items-center">
                  {selectedSurvey.completeStatus}
                </Tag>
                <Tag className="text-gray-800 font-medium px-3 py-1 rounded-full flex items-center">
                  <ClockCircleOutlined className="mr-1" />
                  {completedDate || "Today"}
                </Tag>
              </div>

              <div className="text-center mb-4">
                <Title level={2} className="text-white m-0 mb-2">
                  {selectedSurvey.title}
                </Title>
                <Paragraph className="text-white/80 m-0">
                  {selectedSurvey.description}
                </Paragraph>
              </div>
            </div>
          </div>

          {/* Results Content */}
          <div className="p-8">
            {/* Score Section */}
            {calculatedScore && (
              <div className="mb-8">
                <Row gutter={[24, 24]} align="middle">
                  <Col xs={24} md={8}>
                    <div className="flex justify-center">
                      <div className="relative">
                        <Progress
                          type="circle"
                          percent={calculatedScore.percentage}
                          strokeColor={interpretation?.color || "green"}
                          strokeWidth={10}
                          width={160}
                          format={() => (
                            <div className="text-center">
                              <div className="text-3xl font-bold">
                                {calculatedScore.totalScore}
                              </div>
                              <div className="text-gray-500 text-sm">
                                of {calculatedScore.maxPossibleScore}
                              </div>
                            </div>
                          )}
                        />
                        <div
                          className="absolute -top-2 -right-2 bg-white p-1 rounded-full shadow-md"
                          style={{
                            border: `2px solid ${
                              interpretation?.color || "green"
                            }`,
                          }}>
                          <Tooltip title="Your assessment score">
                            <InfoCircleOutlined
                              style={{
                                color: interpretation?.color || "green",
                              }}
                              className="text-lg"
                            />
                          </Tooltip>
                        </div>
                      </div>
                    </div>
                  </Col>

                  <Col xs={24} md={16}>
                    <div>
                      <div className="flex items-center mb-3">
                        <Title level={3} className="m-0 mr-3">
                          {interpretation?.level}{" "}
                          {selectedSurvey.questionList?.[0]?.questionCategory ||
                            "Anxiety"}
                        </Title>
                        <Tag
                          color={interpretation?.color}
                          icon={interpretation?.icon}
                          className="text-sm px-3 py-1 rounded-full">
                          {interpretation?.level} Level
                        </Tag>
                      </div>

                      <Paragraph className="text-gray-600 mb-4">
                        {interpretation?.description}
                      </Paragraph>

                      {/* Recommendations */}
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <div className="flex items-center mb-3">
                          <HeartOutlined className="text-primary-green mr-2" />
                          <Text strong>Recommendations</Text>
                        </div>
                        <List
                          size="small"
                          dataSource={interpretation?.recommendations || []}
                          renderItem={(item, index) => (
                            <List.Item className="border-0 py-1 px-0">
                              <div className="flex items-start">
                                <div className="w-6 h-6 rounded-full bg-primary-green/10 flex items-center justify-center mr-3 mt-0.5">
                                  <Text className="text-primary-green font-medium">
                                    {index + 1}
                                  </Text>
                                </div>
                                <Text className="text-gray-700">{item}</Text>
                              </div>
                            </List.Item>
                          )}
                        />
                      </div>
                    </div>
                  </Col>
                </Row>
              </div>
            )}

            {/* Consultation Recommendation */}
            {needsConsultation && (
              <div className="mb-8">
                <Card
                  className="border-0 shadow-md rounded-xl overflow-hidden"
                  bodyStyle={{ padding: 0 }}>
                  <div className="bg-orange-50 p-6">
                    <Row gutter={[16, 16]} align="middle">
                      <Col xs={24} md={16}>
                        <div className="flex items-start">
                          <Avatar
                            icon={<UserOutlined />}
                            className="bg-orange-500 mr-4"
                            size={48}
                          />
                          <div>
                            <Title
                              level={4}
                              className="m-0 mb-2 text-orange-700">
                              Professional Support Recommended
                            </Title>
                            <Paragraph className="mb-0 text-orange-600">
                              Based on your assessment results, we recommend
                              scheduling a consultation with one of our mental
                              health professionals for personalized guidance and
                              support.
                            </Paragraph>
                          </div>
                        </div>
                      </Col>
                      <Col
                        xs={24}
                        md={8}
                        className="flex justify-center md:justify-end">
                        <Button
                          type="primary"
                          size="large"
                          icon={<CalendarOutlined />}
                          onClick={() => navigate("/book-appointment")}
                          className="bg-orange-500 hover:bg-orange-600 border-orange-500 hover:border-orange-600 rounded-lg">
                          Book Consultation
                        </Button>
                      </Col>
                    </Row>
                  </div>
                </Card>
              </div>
            )}

            {/* Question Responses */}
            <div className="mb-8">
              <Divider orientation="left">
                <div className="flex items-center justify-between w-full">
                  <div className="flex items-center">
                    <FileTextOutlined className="mr-2 text-primary-green" />
                    <span>Your Responses</span>
                  </div>
                  <Button
                    type="link"
                    onClick={() => setShowResponses(!showResponses)}
                    className="text-primary-green hover:text-primary-green/80">
                    {showResponses ? "Hide Responses" : "Show Responses"}
                  </Button>
                </div>
              </Divider>

              {showResponses ? (
                <div className="bg-gray-50 rounded-xl p-4">
                  {selectedSurvey.questionList &&
                    selectedSurvey.questionList.map((question, index) => {
                      // Find the selected option (the one with checked=true)
                      const selectedOption = question.questionOptions?.find(
                        (option) => option.checked === true
                      );

                      return (
                        <div
                          key={index}
                          className={`p-4 rounded-lg ${
                            index % 2 === 0 ? "bg-white" : "bg-gray-50"
                          } ${
                            index !== selectedSurvey.questionList.length - 1
                              ? "mb-3"
                              : ""
                          }`}>
                          <div className="flex items-start">
                            <div className="w-8 h-8 rounded-full bg-primary-green/10 flex items-center justify-center mr-3 shrink-0">
                              <Text className="text-primary-green font-medium">
                                {index + 1}
                              </Text>
                            </div>
                            <div>
                              <Text strong className="text-gray-800">
                                {question.questionText}
                              </Text>
                              <div className="mt-2 ml-1">
                                <Tag
                                  color={
                                    selectedOption?.value >= 3
                                      ? "orange"
                                      : "blue"
                                  }
                                  className="rounded-full">
                                  {selectedOption
                                    ? selectedOption.label
                                    : "No answer selected"}
                                </Tag>
                                {selectedOption && (
                                  <Text
                                    type="secondary"
                                    className="ml-2 text-xs">
                                    Score: {selectedOption.value}
                                  </Text>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                </div>
              ) : (
                <div className="bg-gray-50 rounded-xl p-6 text-center">
                  <div className="mb-3">
                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gray-100">
                      <FileTextOutlined className="text-gray-400 text-xl" />
                    </div>
                  </div>
                  <Text className="text-gray-500 block mb-3">
                    Your detailed responses are hidden
                  </Text>
                  <Button
                    type="primary"
                    ghost
                    onClick={() => setShowResponses(true)}
                    className="border-primary-green text-primary-green hover:border-primary-green/80 hover:text-primary-green/80">
                    Show {selectedSurvey.questionList?.length || 0} Responses
                  </Button>
                </div>
              )}
            </div>

            {/* Next Steps */}
            <div>
              <Divider orientation="left">
                <div className="flex items-center">
                  <BarChartOutlined className="mr-2 text-primary-green" />
                  <span>Next Steps</span>
                </div>
              </Divider>

              <Row gutter={[16, 16]}>
                <Col xs={24} md={8}>
                  <Card
                    hoverable
                    className="text-center h-full border-0 shadow-sm hover:shadow-md transition-shadow"
                    onClick={() => navigate("/test")}>
                    <div className="mb-3">
                      <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-blue-50">
                        <FileTextOutlined className="text-blue-500 text-xl" />
                      </div>
                    </div>
                    <Title level={5} className="mb-1">
                      Take Another Test
                    </Title>
                    <Text type="secondary" className="block mb-3">
                      Explore other assessments
                    </Text>
                    <Button
                      type="primary"
                      className="bg-blue-500 hover:bg-blue-600 border-blue-500">
                      View Tests
                    </Button>
                  </Card>
                </Col>

                <Col xs={24} md={8}>
                  <Card
                    hoverable
                    className="text-center h-full border-0 shadow-sm hover:shadow-md transition-shadow"
                    onClick={() => navigate("/book-appointment")}>
                    <div className="mb-3">
                      <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-green-50">
                        <CalendarOutlined className="text-green-500 text-xl" />
                      </div>
                    </div>
                    <Title level={5} className="mb-1">
                      Book Appointment
                    </Title>
                    <Text type="secondary" className="block mb-3">
                      Speak with a professional
                    </Text>
                    <Button
                      type="primary"
                      className="bg-primary-green hover:bg-primary-green/90 border-primary-green">
                      Book Now
                    </Button>
                  </Card>
                </Col>

                <Col xs={24} md={8}>
                  <Card
                    hoverable
                    className="text-center h-full border-0 shadow-sm hover:shadow-md transition-shadow"
                    onClick={() => navigate("/test-record")}>
                    <div className="mb-3">
                      <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-purple-50">
                        <BarChartOutlined className="text-purple-500 text-xl" />
                      </div>
                    </div>
                    <Title level={5} className="mb-1">
                      View History
                    </Title>
                    <Text type="secondary" className="block mb-3">
                      Track your progress
                    </Text>
                    <Button
                      type="primary"
                      className="bg-purple-500 hover:bg-purple-600 border-purple-500">
                      See Records
                    </Button>
                  </Card>
                </Col>
              </Row>
            </div>
          </div>
        </Card>

        {/* Bottom Navigation */}
        <div className="flex justify-between">
          <Button
            icon={<ArrowLeftOutlined />}
            onClick={() => navigate("/test")}
            className="flex items-center">
            Back to Tests
          </Button>
          <Button
            type="primary"
            onClick={() => navigate("/student-profile")}
            className="bg-primary-green hover:bg-primary-green/90">
            Go to Profile
          </Button>
        </div>
      </div>
    </div>
  );
};

export default TestResult;

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
  Space,
} from "antd";
import {
  CheckCircleOutlined,
  ArrowLeftOutlined,
  FileTextOutlined,
  CalendarOutlined,
  BarChartOutlined,
  HeartOutlined,
  ExclamationCircleOutlined,
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

  useEffect(() => {
    const loadResults = async () => {
      if (!surveyId || !user?.studentId) {
        console.error("Missing surveyId or studentId");
        navigate("/test");
        return;
      }

      try {
        console.log(
          `Fetching results for survey ${surveyId} and student ${user.studentId}`
        );
        await fetchSurveyResults(surveyId, user.studentId);
      } catch (error) {
        console.error("Failed to load survey results:", error);
      }
    };

    loadResults();
  }, [surveyId, user?.studentId, fetchSurveyResults, navigate]);

  useEffect(() => {
    if (selectedSurvey) {
      console.log("Selected survey data:", selectedSurvey);

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
        },
        {
          threshold: 10,
          level: "Mild",
          color: "lime",
          description:
            "You're experiencing mild anxiety. Consider some stress-reduction techniques.",
          icon: <HeartOutlined />,
        },
        {
          threshold: 15,
          level: "Moderate",
          color: "gold",
          description:
            "Your anxiety level is moderate. Consider speaking with a mental health professional.",
          icon: <ExclamationCircleOutlined />,
        },
        {
          threshold: 20,
          level: "High",
          color: "orange",
          description:
            "You're experiencing high anxiety. We recommend consulting with a mental health professional.",
          icon: <ExclamationCircleOutlined />,
        },
        {
          threshold: 25,
          level: "Severe",
          color: "red",
          description:
            "Your anxiety level is severe. Please seek professional help as soon as possible.",
          icon: <ExclamationCircleOutlined />,
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
        },
        {
          threshold: 10,
          level: "Mild",
          color: "lime",
          description:
            "You're showing mild symptoms of depression. Consider some self-care techniques.",
          icon: <HeartOutlined />,
        },
        {
          threshold: 15,
          level: "Moderate",
          color: "gold",
          description:
            "Your depression symptoms are moderate. Consider speaking with a mental health professional.",
          icon: <ExclamationCircleOutlined />,
        },
        {
          threshold: 20,
          level: "Moderately Severe",
          color: "orange",
          description:
            "You're showing moderately severe symptoms of depression. We recommend consulting with a mental health professional.",
          icon: <ExclamationCircleOutlined />,
        },
        {
          threshold: 25,
          level: "Severe",
          color: "red",
          description:
            "Your depression symptoms are severe. Please seek professional help as soon as possible.",
          icon: <ExclamationCircleOutlined />,
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
        },
        {
          threshold: 14,
          level: "Moderate",
          color: "gold",
          description:
            "You're experiencing moderate stress. Consider implementing additional stress-reduction strategies.",
          icon: <ExclamationCircleOutlined />,
        },
        {
          threshold: 27,
          level: "High",
          color: "red",
          description:
            "Your stress level is high. We recommend seeking support and implementing comprehensive stress management techniques.",
          icon: <ExclamationCircleOutlined />,
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
        <div className="text-center">
          <Spin size="large" />
          <div className="mt-4">
            <Text type="secondary">Loading your results...</Text>
          </div>
        </div>
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
            <Button onClick={() => navigate("/test")} type="primary" danger>
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
            <Button onClick={() => navigate("/test")} type="primary">
              Back to Tests
            </Button>
          }
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-6 px-4">
      <div className="max-w-2xl mx-auto">
        <Card className="shadow-md rounded-lg overflow-hidden">
          {/* Header - More compact */}
          <div
            className="text-white p-5 -mx-6 -mt-6 mb-5"
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
            }}
          >
            <Button
              type="text"
              icon={<ArrowLeftOutlined />}
              className="text-white hover:text-white/80 mb-2"
              onClick={() => navigate("/test")}
            >
              Back to Tests
            </Button>
            <div className="text-center">
              <div className="mb-2">
                <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-white/20">
                  <CheckCircleOutlined className="text-xl" />
                </div>
              </div>
              <Title level={3} className="text-white m-0">
                {selectedSurvey.title}
              </Title>
              <Text className="text-white/80 block mt-1">
                {selectedSurvey.description}
              </Text>
              <div className="mt-2">
                <Tag color="white" className="text-gray-800">
                  {selectedSurvey.completeStatus}
                </Tag>
              </div>
            </div>
          </div>

          {/* Score Section - Better proportions */}
          {calculatedScore && (
            <div className="mb-5">
              <Row gutter={[16, 16]} align="middle" justify="center">
                <Col xs={24} sm={10}>
                  <div className="flex justify-center">
                    <div className="w-32 h-32 relative">
                      <Progress
                        type="circle"
                        percent={calculatedScore.percentage}
                        strokeColor={interpretation?.color || "green"}
                        strokeWidth={8}
                        format={() => (
                          <div className="text-center">
                            <div className="text-2xl font-bold">
                              {calculatedScore.totalScore}
                            </div>
                            <div className="text-gray-500 text-xs">
                              of {calculatedScore.maxPossibleScore}
                            </div>
                          </div>
                        )}
                      />
                    </div>
                  </div>
                </Col>

                <Col xs={24} sm={14}>
                  <div className="text-center sm:text-left">
                    <Title level={4} className="mb-2">
                      Your Results
                    </Title>

                    <div className="mb-2">
                      <Tag
                        color={interpretation?.color}
                        icon={interpretation?.icon}
                        className="text-sm px-2 py-1"
                      >
                        {interpretation?.level} Level
                      </Tag>
                    </div>

                    <Paragraph className="text-sm mb-0">
                      {interpretation?.description}
                    </Paragraph>
                  </div>
                </Col>
              </Row>
            </div>
          )}

          {/* Recommendation Section - More compact */}
          {needsConsultation && (
            <div className="mb-5">
              <Divider className="my-3">
                <Space size="small">
                  <ExclamationCircleOutlined />
                  <span className="text-sm">Recommendation</span>
                </Space>
              </Divider>

              <div
                className="p-3 rounded-lg mb-3"
                style={{
                  backgroundColor: "rgba(255, 165, 0, 0.1)",
                  borderLeft: "3px solid #ff8c00",
                }}
              >
                <Row gutter={[8, 8]} align="middle">
                  <Col xs={24} sm={16}>
                    <Title level={5} className="m-0 mb-1">
                      Consider Speaking with a Professional
                    </Title>
                    <Paragraph className="mb-0 text-xs">
                      Based on your assessment results, we recommend scheduling
                      a consultation with one of our mental health
                      professionals.
                    </Paragraph>
                  </Col>
                  <Col xs={24} sm={8} className="text-center">
                    <Button
                      type="primary"
                      icon={<CalendarOutlined />}
                      onClick={() => navigate("/book-appointment")}
                      style={{
                        background: "#ff8c00",
                        borderColor: "#ff8c00",
                      }}
                    >
                      Book Now
                    </Button>
                  </Col>
                </Row>
              </div>
            </div>
          )}

          {/* Next Steps Section - Simplified cards */}
          <div className="mb-4">
            <Divider className="my-3">
              <Space size="small">
                <BarChartOutlined />
                <span className="text-sm">Next Steps</span>
              </Space>
            </Divider>

            <Row gutter={[8, 8]}>
              <Col xs={24} sm={8}>
                <Card
                  className="text-center hover:shadow-sm transition-shadow"
                  bordered={false}
                  size="small"
                  bodyStyle={{ padding: "12px 8px" }}
                  style={{ backgroundColor: "#f9f9f9" }}
                >
                  <div className="mb-1">
                    <FileTextOutlined className="text-blue-500 text-lg" />
                  </div>
                  <Title level={5} className="mb-0 text-sm">
                    Take Another Test
                  </Title>
                  <Button
                    size="small"
                    type="link"
                    onClick={() => navigate("/test")}
                    className="p-0 h-auto text-xs"
                  >
                    View Tests
                  </Button>
                </Card>
              </Col>

              <Col xs={24} sm={8}>
                <Card
                  className="text-center hover:shadow-sm transition-shadow"
                  bordered={false}
                  size="small"
                  bodyStyle={{ padding: "12px 8px" }}
                  style={{ backgroundColor: "#f9f9f9" }}
                >
                  <div className="mb-1">
                    <CalendarOutlined className="text-green-500 text-lg" />
                  </div>
                  <Title level={5} className="mb-0 text-sm">
                    Book Appointment
                  </Title>
                  <Button
                    size="small"
                    type="link"
                    onClick={() => navigate("/book-appointment")}
                    className="p-0 h-auto text-xs"
                    style={{ color: "#4a7c59" }}
                  >
                    Book Now
                  </Button>
                </Card>
              </Col>

              <Col xs={24} sm={8}>
                <Card
                  className="text-center hover:shadow-sm transition-shadow"
                  bordered={false}
                  size="small"
                  bodyStyle={{ padding: "12px 8px" }}
                  style={{ backgroundColor: "#f9f9f9" }}
                >
                  <div className="mb-1">
                    <BarChartOutlined className="text-purple-500 text-lg" />
                  </div>
                  <Title level={5} className="mb-0 text-sm">
                    View History
                  </Title>
                  <Button
                    size="small"
                    type="link"
                    onClick={() => navigate("/test-record")}
                    className="p-0 h-auto text-xs"
                    style={{ color: "#722ed1" }}
                  >
                    See Records
                  </Button>
                </Card>
              </Col>
            </Row>
          </div>

          {/* Actions - Simplified */}
          <div className="flex justify-between mt-4 pt-3 border-t">
            <Button
              size="small"
              icon={<ArrowLeftOutlined />}
              onClick={() => navigate("/test")}
            >
              Back
            </Button>
            <Button
              size="small"
              type="primary"
              onClick={() => navigate("/dashboard")}
              style={{ backgroundColor: "#4a7c59", borderColor: "#4a7c59" }}
            >
              Dashboard
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default TestResult;

import React, { useState, useEffect } from "react";
import {
  Card,
  Typography,
  Spin,
  Tabs,
  Timeline,
  Empty,
  Button,
  Tag,
  Collapse,
  Progress,
  Table,
  Tooltip,
  Badge,
  Divider,
  Select,
  Alert,
} from "antd";
import {
  BarChartOutlined,
  CalendarOutlined,
  CheckCircleOutlined,
  FileTextOutlined,
  HistoryOutlined,
  InfoCircleOutlined,
  LineChartOutlined,
  QuestionCircleOutlined,
  RiseOutlined,
  FallOutlined,
  ClockCircleOutlined,
  FilterOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import { api } from "../../stores/apiConfig";
import { useAuthStore } from "../../stores/authStore";
import { useNavigate } from "react-router-dom";

const { Title, Text, Paragraph } = Typography;
const { TabPane } = Tabs;
const { Panel } = Collapse;
const { Option } = Select;

const TestRecord = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [testRecords, setTestRecords] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [categories, setCategories] = useState([]);
  const [expandedSurvey, setExpandedSurvey] = useState(null);
  const [showResponses, setShowResponses] = useState(false);

  // Fetch survey list first to get all available surveys and their categories
  useEffect(() => {
    const fetchSurveyList = async () => {
      try {
        setLoading(true);
        const response = await api.get("/surveys");

        // Extract unique categories
        const uniqueCategories = [
          ...new Set(response.data.map((survey) => survey.category)),
        ];
        setCategories(uniqueCategories);

        // Get survey IDs to fetch results
        const surveyIds = response.data.map((survey) => survey.id);
        await fetchTestResults(surveyIds);
      } catch (error) {
        console.error("Error fetching survey list:", error);
      } finally {
        setLoading(false);
      }
    };

    if (user?.studentId) {
      fetchSurveyList();
    }
  }, [user]);

  // Fetch test results for all surveys
  const fetchTestResults = async (surveyIds) => {
    if (!user?.studentId || !surveyIds?.length) return;

    setLoading(true);
    const allResults = [];
    const processedSurveyIds = new Set(); // Track which surveys we've processed

    try {
      // Fetch results for each survey
      for (const surveyId of surveyIds) {
        // Skip if we've already processed this survey
        if (processedSurveyIds.has(surveyId)) continue;

        try {
          // Fetch the latest result for this survey
          const latestResult = await api.get(
            `/surveys/results/student?surveyId=${surveyId}&studentId=${user.studentId}`
          );

          if (latestResult.data) {
            // Add this result to our collection
            allResults.push(latestResult.data);
            // Mark this survey as processed
            processedSurveyIds.add(surveyId);

            // Log for debugging
            console.log(
              `Added survey ${surveyId} with periodic ${latestResult.data.periodic}`
            );
          }
        } catch (err) {
          console.log(`No results found for survey ${surveyId}`);
          // Continue with next survey
        }
      }

      // Process and organize the results
      setTestRecords(allResults);
      console.log("Final results count:", allResults.length);
    } catch (error) {
      console.error("Error fetching test results:", error);
    } finally {
      setLoading(false);
    }
  };

  // Group records by category
  const recordsByCategory = React.useMemo(() => {
    const grouped = {};

    testRecords.forEach((record) => {
      if (!grouped[record.category]) {
        grouped[record.category] = [];
      }
      grouped[record.category].push(record);
    });

    // Sort records within each category by periodic (descending) and then by date
    Object.keys(grouped).forEach((category) => {
      grouped[category].sort((a, b) => {
        if (b.periodic !== a.periodic) return b.periodic - a.periodic;
        return new Date(b.startDate) - new Date(a.startDate);
      });
    });

    return grouped;
  }, [testRecords]);

  // Format the score as a percentage
  const formatScorePercentage = (score) => {
    if (!score || !score.includes("/")) return "0%";

    const [numerator, denominator] = score.split("/").map(Number);
    if (isNaN(numerator) || isNaN(denominator) || denominator === 0)
      return "0%";

    return `${Math.round((numerator / denominator) * 100)}%`;
  };

  // Get severity level based on score percentage and category
  const getSeverityLevel = (score, category) => {
    if (!score || !score.includes("/")) return "normal";

    const [numerator, denominator] = score.split("/").map(Number);
    if (isNaN(numerator) || isNaN(denominator) || denominator === 0)
      return "normal";

    const percentage = (numerator / denominator) * 100;

    // Different logic based on category
    switch (category) {
      case "ANXIETY":
        if (percentage <= 33) return "success";
        if (percentage <= 67) return "warning";
        return "danger";

      case "DEPRESSION":
        if (percentage <= 33) return "success";
        if (percentage <= 67) return "warning";
        return "danger";

      case "STRESS":
        if (percentage <= 33) return "success";
        if (percentage <= 67) return "warning";
        return "danger";

      default:
        if (percentage <= 33) return "success";
        if (percentage <= 67) return "warning";
        return "danger";
    }
  };

  // Format a date string to a more readable format
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // Get color theme based on category
  const getCategoryColor = (category) => {
    const colorMap = {
      ANXIETY: "#3b82f6", // blue
      DEPRESSION: "#8b5cf6", // purple
      STRESS: "#f59e0b", // amber
    };

    return colorMap[category] || "#4a7c59"; // default to your custom green
  };

  // Determine if a survey is the latest in its category
  const isLatestInCategory = (survey, categoryRecords) => {
    if (!categoryRecords || categoryRecords.length === 0) return false;
    return survey.periodic === categoryRecords[0].periodic;
  };

  // Handle showing detailed results for a survey
  const handleViewDetails = (surveyId) => {
    setExpandedSurvey(expandedSurvey === surveyId ? null : surveyId);
  };

  // Determine score trend for a category
  const getScoreTrend = (records) => {
    if (!records || records.length < 2) return "stable";

    // We have at least 2 records, compare the most recent with the previous one
    const latest = records[0];
    const previous = records[1];

    // Extract scores
    const [latestScore, latestTotal] = latest.totalScore.split("/").map(Number);
    const [prevScore, prevTotal] = previous.totalScore.split("/").map(Number);

    // Calculate percentages
    const latestPercent = (latestScore / latestTotal) * 100;
    const prevPercent = (prevScore / prevTotal) * 100;

    // For "negative" categories like anxiety, depression, lower is better
    // So if the new percentage is lower, that's an improvement
    if (
      latest.category === "ANXIETY" ||
      latest.category === "DEPRESSION" ||
      latest.category === "STRESS"
    ) {
      if (latestPercent < prevPercent) return "improving";
      if (latestPercent > prevPercent) return "worsening";
      return "stable";
    } else {
      // For "positive" categories, higher is better
      if (latestPercent > prevPercent) return "improving";
      if (latestPercent < prevPercent) return "worsening";
      return "stable";
    }
  };

  // Handle view full result
  const handleViewFullResult = (surveyId) => {
    navigate(`/test-result/${surveyId}`);
  };

  if (loading && testRecords.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Spin size="large" />
          <div className="mt-4">
            <Text className="text-gray-600">
              Loading your assessment history...
            </Text>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="general-wrapper">
      {/* Hero section - matching your app's style */}
      <div className="hero-section">
        <div className="hero-content">
          <h1 className="hero-title">Assessment History</h1>
          <p className="hero-subtitle">
            Track your mental health journey over time with a comprehensive view
            of your assessment results
          </p>
        </div>
      </div>

      <div className="mb-12 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative -mt-10">
        {/* Filter Card - matching your app's filter styling */}
        <Card className="shadow-lg rounded-xl border border-gray-100 transition-all hover:shadow-xl backdrop-blur-sm bg-white/95">
          <div className="relative mb-6">
            <div className="absolute -top-4 -left-4 w-12 h-12 bg-custom-green/10 rounded-full"></div>
            <h2 className="text-lg font-semibold text-gray-800 flex items-center relative z-10">
              <FilterOutlined className="mr-2 text-custom-green" />
              <span>Filter Assessments</span>
            </h2>
            <div className="h-1 w-16 bg-custom-green/30 rounded-full mt-2"></div>
          </div>

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                <span className="inline-block w-2 h-2 bg-custom-green rounded-full mr-2"></span>
                Assessment Category
              </label>
              <Select
                placeholder="All categories"
                allowClear
                value={selectedCategory}
                onChange={setSelectedCategory}
                className="w-full"
                size="large"
                suffixIcon={<SearchOutlined className="text-gray-400" />}
                dropdownStyle={{ borderRadius: "0.75rem" }}
              >
                <Option value={null}>All Categories</Option>
                {categories.map((category) => (
                  <Option key={category} value={category}>
                    {category.charAt(0) + category.slice(1).toLowerCase()}
                  </Option>
                ))}
              </Select>
            </div>

            <div className="flex-1">
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-gray-700 flex items-center">
                  <span className="inline-block w-2 h-2 bg-custom-green rounded-full mr-2"></span>
                  Result Details
                </label>
                <Button
                  type="link"
                  size="small"
                  onClick={() => setShowResponses(!showResponses)}
                  className="text-custom-green hover:text-custom-green/80"
                >
                  {showResponses ? "Hide All Responses" : "Show All Responses"}
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                <Tooltip title="Low severity">
                  <Tag color="success" className="px-2 py-1 rounded-lg">
                    Low
                  </Tag>
                </Tooltip>
                <Tooltip title="Moderate severity">
                  <Tag color="processing" className="px-2 py-1 rounded-lg">
                    Moderate
                  </Tag>
                </Tooltip>
                <Tooltip title="High severity - may need attention">
                  <Tag color="warning" className="px-2 py-1 rounded-lg">
                    High
                  </Tag>
                </Tooltip>
                <Tooltip title="Very high severity - needs attention">
                  <Tag color="error" className="px-2 py-1 rounded-lg">
                    Severe
                  </Tag>
                </Tooltip>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        {Object.keys(recordsByCategory).length === 0 ? (
          <div className="bg-white rounded-xl shadow-md p-8 text-center border border-gray-100">
            <Empty
              description={
                <span className="text-gray-500">
                  No assessment records found. Complete an assessment to see
                  your results here.
                </span>
              }
              image={Empty.PRESENTED_IMAGE_SIMPLE}
            />
            <Button
              type="primary"
              onClick={() => navigate("/test")}
              className="mt-4 bg-custom-green hover:bg-custom-green/90"
            >
              Take an Assessment
            </Button>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Display filtered categories */}
            {Object.entries(recordsByCategory)
              .filter(
                ([category]) =>
                  !selectedCategory || category === selectedCategory
              )
              .map(([category, records]) => {
                const trend = getScoreTrend(records);

                return (
                  <div
                    key={category}
                    className="bg-white rounded-xl shadow-md overflow-hidden transition-all hover:shadow-lg"
                  >
                    {/* Category Header */}
                    <div
                      className="p-6 border-b"
                      style={{
                        borderBottomColor: `${getCategoryColor(category)}40`,
                        background: `linear-gradient(135deg, ${getCategoryColor(
                          category
                        )}10 0%, ${getCategoryColor(category)}05 100%)`,
                      }}
                    >
                      <div className="flex justify-between items-center flex-wrap gap-4">
                        <div className="flex items-center">
                          <div
                            className="bg-white p-3 rounded-full mr-4 shadow-sm"
                            style={{
                              boxShadow: `0 0 0 3px ${getCategoryColor(
                                category
                              )}20`,
                            }}
                          >
                            {category === "ANXIETY" ? (
                              <QuestionCircleOutlined
                                style={{
                                  color: getCategoryColor(category),
                                  fontSize: "1.5rem",
                                }}
                              />
                            ) : category === "DEPRESSION" ? (
                              <LineChartOutlined
                                style={{
                                  color: getCategoryColor(category),
                                  fontSize: "1.5rem",
                                }}
                              />
                            ) : (
                              <BarChartOutlined
                                style={{
                                  color: getCategoryColor(category),
                                  fontSize: "1.5rem",
                                }}
                              />
                            )}
                          </div>
                          <div>
                            <Title
                              level={4}
                              className="mb-0"
                              style={{ color: getCategoryColor(category) }}
                            >
                              {category.charAt(0) +
                                category.slice(1).toLowerCase()}{" "}
                              Assessments
                            </Title>
                            <Text className="text-gray-500">
                              {records.length}{" "}
                              {records.length === 1 ? "result" : "results"}{" "}
                              across{" "}
                              {Math.max(...records.map((r) => r.periodic))}{" "}
                              {Math.max(...records.map((r) => r.periodic)) === 1
                                ? "period"
                                : "periods"}
                            </Text>
                          </div>
                        </div>

                        {/* Trend Badge */}
                        {records.length > 1 && (
                          <div>
                            {trend === "improving" ? (
                              <Tag
                                color="success"
                                icon={<RiseOutlined />}
                                className="px-3 py-1 rounded-full"
                              >
                                Improving
                              </Tag>
                            ) : trend === "worsening" ? (
                              <Tag
                                color="error"
                                icon={<FallOutlined />}
                                className="px-3 py-1 rounded-full"
                              >
                                Needs Attention
                              </Tag>
                            ) : (
                              <Tag
                                color="processing"
                                className="px-3 py-1 rounded-full"
                              >
                                Stable
                              </Tag>
                            )}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Records */}
                    <div className="divide-y divide-gray-100">
                      {records.map((record, index) => {
                        const severity = getSeverityLevel(
                          record.totalScore,
                          category
                        );
                        const [score, total] = record.totalScore
                          .split("/")
                          .map(Number);
                        const scorePercent = Math.round((score / total) * 100);

                        return (
                          <div
                            key={`${record.surveyId}-${record.periodic}`}
                            className="p-6"
                          >
                            <div className="flex items-start">
                              {/* Period Badge */}
                              <div className="flex-none mr-4">
                                <div className="rounded-full w-10 h-10 flex items-center justify-center font-medium bg-gray-100">
                                  {record.periodic}
                                </div>
                                <div className="text-xs text-center mt-1 text-gray-500">
                                  Period
                                </div>
                              </div>

                              {/* Record Card */}
                              <div className="flex-1">
                                <Card
                                  className="w-full hover:shadow-md transition-shadow duration-300 border rounded-lg overflow-hidden"
                                  style={{
                                    borderLeftWidth: "3px",
                                    borderLeftColor: getCategoryColor(category),
                                  }}
                                  bodyStyle={{ padding: "16px" }}
                                >
                                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                                    <div>
                                      <div className="flex items-center flex-wrap gap-2">
                                        <Title level={5} className="mb-0 mr-2">
                                          {record.title}
                                        </Title>
                                        {isLatestInCategory(
                                          record,
                                          records
                                        ) && (
                                          <Tag
                                            color="green"
                                            className="rounded-full px-2"
                                          >
                                            Latest
                                          </Tag>
                                        )}
                                      </div>

                                      <div className="flex items-center mt-2 text-gray-500 text-sm">
                                        <CalendarOutlined className="mr-1" />
                                        <span>
                                          {formatDate(record.startDate)} to{" "}
                                          {formatDate(record.endDate)}
                                        </span>
                                        <Divider type="vertical" />
                                        <span>{record.standardType}</span>
                                      </div>
                                    </div>

                                    <div className="flex items-center">
                                      <div className="mr-4 text-right">
                                        <div className="text-sm text-gray-500">
                                          Total Score
                                        </div>
                                        <div className="font-bold text-lg">
                                          {record.totalScore}
                                        </div>
                                      </div>

                                      <Tooltip
                                        title={`${scorePercent}% - ${
                                          severity === "success"
                                            ? "Low severity"
                                            : severity === "warning"
                                            ? "Moderate severity"
                                            : "High severity - needs attention"
                                        }`}
                                      >
                                        <Progress
                                          type="circle"
                                          percent={scorePercent}
                                          width={60}
                                          strokeColor={
                                            severity === "success"
                                              ? "#52c41a"
                                              : severity === "warning"
                                              ? "#faad14"
                                              : "#f5222d"
                                          }
                                          format={() => (
                                            <div className="text-xs">
                                              <div className="font-bold">
                                                {score}
                                              </div>
                                              <div className="text-gray-400">
                                                /{total}
                                              </div>
                                            </div>
                                          )}
                                        />
                                      </Tooltip>
                                    </div>
                                  </div>

                                  {/* Expanded Details or Button */}
                                  {expandedSurvey ===
                                    `${record.surveyId}-${record.periodic}` ||
                                  showResponses ? (
                                    <div className="mt-4 pt-4 border-t border-gray-100">
                                      <div className="mb-4">
                                        <Text
                                          strong
                                          className="text-gray-700 flex items-center mb-2"
                                        >
                                          <InfoCircleOutlined className="mr-2" />
                                          Assessment Details
                                        </Text>
                                        <Paragraph className="text-gray-600">
                                          {record.description}
                                        </Paragraph>
                                      </div>

                                      <div className="mb-4">
                                        <div className="flex justify-between items-center mb-2">
                                          <Text
                                            strong
                                            className="text-gray-700 flex items-center"
                                          >
                                            <FileTextOutlined className="mr-2" />
                                            Your Responses
                                          </Text>
                                          {!showResponses && (
                                            <Button
                                              type="link"
                                              size="small"
                                              onClick={() =>
                                                setExpandedSurvey(null)
                                              }
                                              className="text-gray-500"
                                            >
                                              Hide Responses
                                            </Button>
                                          )}
                                        </div>

                                        <div className="space-y-3">
                                          {record.questionList.map(
                                            (question, qIndex) => {
                                              // Find the selected option
                                              const selectedOption =
                                                question.questionOptions.find(
                                                  (opt) => opt.checked
                                                );

                                              return (
                                                <div
                                                  key={question.id}
                                                  className="border border-gray-200 rounded-lg p-3 hover:bg-gray-50"
                                                >
                                                  <div className="flex justify-between flex-col sm:flex-row gap-3">
                                                    <div className="flex-1">
                                                      <Text strong>
                                                        Q{qIndex + 1}:
                                                      </Text>
                                                      <Paragraph className="mb-1">
                                                        {question.questionText}
                                                      </Paragraph>
                                                    </div>
                                                    <div>
                                                      {selectedOption ? (
                                                        <Tag
                                                          color={
                                                            selectedOption.value <=
                                                            1
                                                              ? "success"
                                                              : selectedOption.value <=
                                                                2
                                                              ? "processing"
                                                              : selectedOption.value <=
                                                                3
                                                              ? "warning"
                                                              : "error"
                                                          }
                                                          className="px-3 py-1 text-center min-w-[120px]"
                                                        >
                                                          <div>
                                                            {
                                                              selectedOption.label
                                                            }
                                                          </div>
                                                          <div className="text-xs mt-1">
                                                            Score:{" "}
                                                            {
                                                              selectedOption.value
                                                            }
                                                          </div>
                                                        </Tag>
                                                      ) : (
                                                        <Tag color="default">
                                                          No answer selected
                                                        </Tag>
                                                      )}
                                                    </div>
                                                  </div>
                                                </div>
                                              );
                                            }
                                          )}
                                        </div>
                                      </div>

                                      <div className="flex justify-end mt-4">
                                        <Button
                                          type="primary"
                                          onClick={() =>
                                            handleViewFullResult(
                                              record.surveyId
                                            )
                                          }
                                          className="bg-custom-green hover:bg-custom-green/90"
                                        >
                                          View Full Report
                                        </Button>
                                      </div>
                                    </div>
                                  ) : (
                                    <div className="flex justify-between mt-4 pt-4 border-t border-gray-100">
                                      <Button
                                        type="default"
                                        onClick={() =>
                                          setExpandedSurvey(
                                            `${record.surveyId}-${record.periodic}`
                                          )
                                        }
                                        icon={<QuestionCircleOutlined />}
                                      >
                                        View Responses
                                      </Button>

                                      <Button
                                        type="primary"
                                        onClick={() =>
                                          handleViewFullResult(record.surveyId)
                                        }
                                        className="bg-custom-green hover:bg-custom-green/90"
                                      >
                                        View Full Report
                                      </Button>
                                    </div>
                                  )}
                                </Card>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
          </div>
        )}
      </div>
    </div>
  );
};

export default TestRecord;

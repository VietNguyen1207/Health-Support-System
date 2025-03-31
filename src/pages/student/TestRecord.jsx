import React, { useState, useEffect, useCallback } from "react";
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
  Modal,
  message,
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
import { useSurveyStore } from "../../stores/surveyStore";
import { useNavigate } from "react-router-dom";

const { Title, Text, Paragraph } = Typography;
const { TabPane } = Tabs;
const { Panel } = Collapse;
const { Option } = Select;

const TestRecord = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { fetchSurveyRecords, surveyRecords, loadingRecords } =
    useSurveyStore();
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedPeriod, setSelectedPeriod] = useState(null);
  const [categories, setCategories] = useState([]);
  const [periods, setPeriods] = useState([]);
  const [expandedSurvey, setExpandedSurvey] = useState(null);
  const [showResponses, setShowResponses] = useState(false);
  const [selectedPeriodReport, setSelectedPeriodReport] = useState(null);
  const [viewingReportForPeriod, setViewingReportForPeriod] = useState(null);
  const [reportModalVisible, setReportModalVisible] = useState(false);
  const [loadingReport, setLoadingReport] = useState(false);

  // Fetch survey records
  useEffect(() => {
    if (user?.studentId) {
      fetchSurveyRecords().then((data) => {
        if (data) {
          // Extract unique categories from the survey results
          const uniqueCategories = new Set();
          // Get available periods and sort them numerically descending
          const availablePeriods = data
            .map((item) => item.periodic)
            .sort((a, b) => parseInt(b) - parseInt(a));

          // Loop through all records to extract unique categories
          data.forEach((periodData) => {
            periodData.surveyResults.forEach((survey) => {
              uniqueCategories.add(survey.category);
            });
          });

          setCategories(Array.from(uniqueCategories));
          setPeriods(availablePeriods);

          // Default to the latest period
          if (availablePeriods.length > 0 && !selectedPeriod) {
            setSelectedPeriod(availablePeriods[0]);
          }
        }
      });
    }
  }, [user, fetchSurveyRecords]);

  // Format score as a percentage
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

  // Format date string
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

  // Handle view full report
  const handleViewFullReport = useCallback(
    (surveyId, periodicID) => {
      // If we're viewing the entire survey history (not period-specific)
      if (!periodicID) {
        navigate(`/test-result/${surveyId}`);
        return;
      }

      // If we're viewing a specific period report
      setLoadingReport(true);
      setViewingReportForPeriod(periodicID);

      useSurveyStore
        .getState()
        .fetchSurveyReportByPeriod(surveyId, periodicID)
        .then((data) => {
          setSelectedPeriodReport(data);
          setReportModalVisible(true);
          setLoadingReport(false);
        })
        .catch((error) => {
          console.error("Failed to load period report:", error);
          message.error("Failed to load the report. Please try again.");
          setLoadingReport(false);
        });
    },
    [navigate]
  );

  // Filter surveys based on category
  const getFilteredSurveysByPeriod = () => {
    if (!surveyRecords || !selectedPeriod) return [];

    // Find the period data matching the selected period
    const periodData = surveyRecords.find((p) => p.periodic === selectedPeriod);
    if (!periodData) return [];

    // Filter by category if a category is selected
    if (selectedCategory) {
      return periodData.surveyResults.filter(
        (survey) => survey.category === selectedCategory
      );
    }

    return periodData.surveyResults;
  };

  // Get scores for a survey from a specific period
  const getSurveyScoresForTrend = (surveyId) => {
    if (!surveyRecords) return [];

    const scores = [];

    // Loop through all periods to find matching survey results
    surveyRecords.forEach((periodData) => {
      const matchingSurvey = periodData.surveyResults.find(
        (s) => s.surveyId === surveyId
      );
      if (
        matchingSurvey &&
        matchingSurvey.std &&
        matchingSurvey.std.length > 0
      ) {
        scores.push({
          periodic: periodData.periodic,
          periodicId: matchingSurvey.periodicID,
          score: matchingSurvey.std[0].score,
          category: matchingSurvey.category,
        });
      }
    });

    // Sort by periodic in ascending order
    return scores.sort((a, b) => parseInt(a.periodic) - parseInt(b.periodic));
  };

  // Determine score trend for a category
  const getScoreTrend = (surveyId) => {
    const scores = getSurveyScoresForTrend(surveyId);

    if (scores.length < 2) return "stable";

    // Compare current period with previous period
    const latestScore = scores[scores.length - 1];
    const previousScore = scores[scores.length - 2];

    // Extract scores
    const [latestNum, latestTotal] = latestScore.score.split("/").map(Number);
    const [prevNum, prevTotal] = previousScore.score.split("/").map(Number);

    // Calculate percentages
    const latestPercent = (latestNum / latestTotal) * 100;
    const prevPercent = (prevNum / prevTotal) * 100;

    // For "negative" categories like anxiety, depression, lower is better
    const category = latestScore.category;
    if (
      category === "ANXIETY" ||
      category === "DEPRESSION" ||
      category === "STRESS"
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

  // Add a function to render the survey report modal
  const renderSurveyReportModal = () => {
    if (!selectedPeriodReport) return null;

    return (
      <Modal
        title={
          <div className="flex items-center">
            <div
              className="w-8 h-8 rounded-full mr-3 flex items-center justify-center"
              style={{
                backgroundColor: `${getCategoryColor(
                  selectedPeriodReport.category
                )}20`,
                color: getCategoryColor(selectedPeriodReport.category),
              }}
            >
              {selectedPeriodReport.category === "ANXIETY" ? (
                <QuestionCircleOutlined />
              ) : selectedPeriodReport.category === "DEPRESSION" ? (
                <LineChartOutlined />
              ) : (
                <BarChartOutlined />
              )}
            </div>
            <span>
              {selectedPeriodReport.title} - Period{" "}
              {selectedPeriodReport.periodic}
            </span>
          </div>
        }
        open={reportModalVisible}
        onCancel={() => {
          setReportModalVisible(false);
          setSelectedPeriodReport(null);
        }}
        width={800}
        footer={[
          <Button
            key="close"
            onClick={() => {
              setReportModalVisible(false);
              setSelectedPeriodReport(null);
            }}
          >
            Close
          </Button>,
          // <Button
          //   key="fullView"
          //   type="primary"
          //   onClick={() => {
          //     setReportModalVisible(false);
          //     navigate(`/test-result/${selectedPeriodReport.surveyId}`);
          //   }}
          //   className="bg-custom-green hover:bg-custom-green/90"
          // >
          //   View All Periods
          // </Button>,
        ]}
        className="survey-report-modal"
      >
        <Spin spinning={loadingReport}>
          {selectedPeriodReport && (
            <div className="survey-report-content">
              <div className="mb-4">
                <div className="flex items-center mb-3">
                  <InfoCircleOutlined className="text-custom-green mr-2" />
                  <Text strong className="text-gray-800">
                    Survey Details
                  </Text>
                </div>
                <Paragraph className="text-gray-600">
                  {selectedPeriodReport.description}
                </Paragraph>
              </div>

              <div className="mb-4 bg-gray-50 p-4 rounded-lg">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Text type="secondary" className="text-xs">
                      Total Score
                    </Text>
                    <div className="text-gray-800 font-semibold">
                      {selectedPeriodReport.totalScore}
                    </div>
                  </div>
                  <div>
                    <Text type="secondary" className="text-xs">
                      Standard Type
                    </Text>
                    <div className="text-gray-800">
                      {selectedPeriodReport.standardType}
                    </div>
                  </div>
                  <div>
                    <Text type="secondary" className="text-xs">
                      Completion Status
                    </Text>
                    <div>
                      <Tag
                        color={
                          selectedPeriodReport.completeStatus === "COMPLETED"
                            ? "success"
                            : "warning"
                        }
                      >
                        {selectedPeriodReport.completeStatus}
                      </Tag>
                    </div>
                  </div>
                  <div>
                    <Text type="secondary" className="text-xs">
                      Date Range
                    </Text>
                    <div className="text-gray-800">
                      {formatDate(selectedPeriodReport.startDate)} -{" "}
                      {formatDate(selectedPeriodReport.endDate)}
                    </div>
                  </div>
                </div>
              </div>

              <Divider orientation="left">
                <div className="flex items-center">
                  <FileTextOutlined className="mr-2 text-custom-green" />
                  <span>Your Responses</span>
                </div>
              </Divider>

              <div className="space-y-3">
                {selectedPeriodReport.questionList &&
                  selectedPeriodReport.questionList.map((question, index) => {
                    // Find the selected option (the one with checked=true)
                    const selectedOption = question.questionOptions?.find(
                      (option) => option.checked === true
                    );

                    return (
                      <Card
                        key={index}
                        className="border border-gray-100 rounded-lg"
                        size="small"
                      >
                        <div className="flex items-start">
                          <div className="w-8 h-8 rounded-full bg-custom-green/10 flex items-center justify-center mr-3 shrink-0">
                            <Text className="text-custom-green font-medium">
                              {index + 1}
                            </Text>
                          </div>
                          <div className="flex-1">
                            <Text strong className="text-gray-800 block mb-2">
                              {question.questionText}
                            </Text>
                            <div className="ml-1">
                              {selectedOption ? (
                                <Tag
                                  color={
                                    selectedOption.value >= 3
                                      ? "orange"
                                      : "blue"
                                  }
                                  className="rounded-full"
                                >
                                  {selectedOption.label} (Score:{" "}
                                  {selectedOption.value})
                                </Tag>
                              ) : (
                                <Tag color="default" className="rounded-full">
                                  No answer selected
                                </Tag>
                              )}
                            </div>
                          </div>
                        </div>
                      </Card>
                    );
                  })}
              </div>
            </div>
          )}
        </Spin>
      </Modal>
    );
  };

  if (loadingRecords && (!surveyRecords || surveyRecords.length === 0)) {
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
      {/* Hero section */}
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
        {/* Filter Card */}
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
                Period
              </label>
              <Select
                placeholder="Select period"
                value={selectedPeriod}
                onChange={setSelectedPeriod}
                className="w-full"
                size="large"
                dropdownStyle={{ borderRadius: "0.75rem" }}
              >
                {periods.map((period) => (
                  <Option key={period} value={period}>
                    Period {period}
                  </Option>
                ))}
              </Select>
            </div>

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
          </div>
        </Card>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        {!surveyRecords || surveyRecords.length === 0 ? (
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
        ) : !selectedPeriod ? (
          <div className="bg-white rounded-xl shadow-md p-8 text-center border border-gray-100">
            <Alert
              message="Please select a period"
              description="Choose a period from the dropdown menu above to view your assessment results."
              type="info"
              showIcon
            />
          </div>
        ) : (
          <div className="space-y-6">
            {getFilteredSurveysByPeriod().length === 0 ? (
              <div className="bg-white rounded-xl shadow-md p-8 text-center border border-gray-100">
                <Empty
                  description={
                    <span className="text-gray-500">
                      No assessments found for the selected filters.
                    </span>
                  }
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                />
              </div>
            ) : (
              getFilteredSurveysByPeriod().map((survey) => {
                // Extract student data - assuming the first student is the current user
                const studentData = survey.std[0] || {
                  score: "0/0",
                  studentComplete: "NOT_COMPLETED",
                };
                const [score, total] = studentData.score.split("/").map(Number);
                const scorePercent = Math.round((score / total) * 100);
                const severity = getSeverityLevel(
                  studentData.score,
                  survey.category
                );
                const trend = getScoreTrend(survey.surveyId);

                return (
                  <div
                    key={survey.periodicID}
                    className="bg-white rounded-xl shadow-md overflow-hidden transition-all hover:shadow-lg"
                  >
                    {/* Category Header */}
                    <div
                      className="p-6 border-b"
                      style={{
                        borderBottomColor: `${getCategoryColor(
                          survey.category
                        )}40`,
                        background: `linear-gradient(135deg, ${getCategoryColor(
                          survey.category
                        )}10 0%, ${getCategoryColor(survey.category)}05 100%)`,
                      }}
                    >
                      <div className="flex justify-between items-center flex-wrap gap-4">
                        <div className="flex items-center">
                          <div
                            className="bg-white p-3 rounded-full mr-4 shadow-sm"
                            style={{
                              boxShadow: `0 0 0 3px ${getCategoryColor(
                                survey.category
                              )}20`,
                            }}
                          >
                            {survey.category === "ANXIETY" ? (
                              <QuestionCircleOutlined
                                style={{
                                  color: getCategoryColor(survey.category),
                                  fontSize: "1.5rem",
                                }}
                              />
                            ) : survey.category === "DEPRESSION" ? (
                              <LineChartOutlined
                                style={{
                                  color: getCategoryColor(survey.category),
                                  fontSize: "1.5rem",
                                }}
                              />
                            ) : (
                              <BarChartOutlined
                                style={{
                                  color: getCategoryColor(survey.category),
                                  fontSize: "1.5rem",
                                }}
                              />
                            )}
                          </div>
                          <div>
                            <Title
                              level={4}
                              className="mb-0"
                              style={{
                                color: getCategoryColor(survey.category),
                              }}
                            >
                              {survey.surveyName}
                            </Title>
                            <Text className="text-gray-500 block">
                              {survey.category.charAt(0) +
                                survey.category.slice(1).toLowerCase()}{" "}
                              •{survey.standardType} • Period {selectedPeriod}
                            </Text>
                          </div>
                        </div>

                        {/* Trend Badge */}
                        {trend !== "stable" && (
                          <div>
                            {trend === "improving" ? (
                              <Tag
                                color="success"
                                icon={<RiseOutlined />}
                                className="px-3 py-1 rounded-full"
                              >
                                Improving
                              </Tag>
                            ) : (
                              <Tag
                                color="error"
                                icon={<FallOutlined />}
                                className="px-3 py-1 rounded-full"
                              >
                                Needs Attention
                              </Tag>
                            )}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Result Content */}
                    <div className="p-6">
                      <div className="flex flex-col md:flex-row items-start gap-6">
                        {/* Left Column - Score and Status */}
                        <div className="md:w-1/3 w-full">
                          <Card className="rounded-xl border border-gray-100">
                            <div className="flex flex-col items-center">
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
                                  width={120}
                                  strokeColor={
                                    severity === "success"
                                      ? "#52c41a"
                                      : severity === "warning"
                                      ? "#faad14"
                                      : "#f5222d"
                                  }
                                  format={() => (
                                    <div className="text-center">
                                      <div className="font-bold text-xl">
                                        {score}
                                      </div>
                                      <div className="text-gray-400 text-sm">
                                        /{total}
                                      </div>
                                    </div>
                                  )}
                                />
                              </Tooltip>

                              <div className="mt-4 text-center">
                                <Tag
                                  color={
                                    studentData.studentComplete === "COMPLETED"
                                      ? "success"
                                      : "warning"
                                  }
                                  className="px-3 py-1 rounded-full"
                                >
                                  {studentData.studentComplete === "COMPLETED"
                                    ? "Completed"
                                    : "Not Completed"}
                                </Tag>

                                {studentData.lastCompleteDate && (
                                  <div className="text-gray-500 text-xs mt-2">
                                    Completed on:{" "}
                                    {formatDate(studentData.lastCompleteDate)}
                                  </div>
                                )}
                              </div>
                            </div>
                          </Card>

                          <div className="mt-4">
                            <Button
                              type="primary"
                              block
                              onClick={() =>
                                handleViewFullReport(
                                  survey.surveyId,
                                  survey.periodicID
                                )
                              }
                              className="bg-custom-green hover:bg-custom-green/90 h-10 rounded-lg"
                            >
                              View Full Report
                            </Button>
                          </div>
                        </div>

                        {/* Right Column - Details */}
                        <div className="md:w-2/3 w-full">
                          <Card className="rounded-xl border border-gray-100 h-full">
                            <div className="mb-4">
                              <div className="flex items-center mb-2">
                                <InfoCircleOutlined className="text-custom-green mr-2" />
                                <Text strong className="text-gray-800">
                                  Assessment Details
                                </Text>
                              </div>
                              <Paragraph className="text-gray-600">
                                {survey.description}
                              </Paragraph>
                            </div>

                            <Divider style={{ margin: "16px 0" }} />

                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <Text type="secondary" className="text-xs">
                                  Start Date
                                </Text>
                                <div className="text-gray-800">
                                  {formatDate(survey.startDate)}
                                </div>
                              </div>

                              <div>
                                <Text type="secondary" className="text-xs">
                                  End Date
                                </Text>
                                <div className="text-gray-800">
                                  {formatDate(survey.endDate)}
                                </div>
                              </div>

                              <div>
                                <Text type="secondary" className="text-xs">
                                  Standard Type
                                </Text>
                                <div className="text-gray-800">
                                  {survey.standardType}
                                </div>
                              </div>

                              <div>
                                <Text type="secondary" className="text-xs">
                                  Period Duration
                                </Text>
                                <div className="text-gray-800">
                                  {survey.periodic}{" "}
                                  {survey.periodic === 1 ? "week" : "weeks"}
                                </div>
                              </div>
                            </div>

                            {/* Periodic History */}
                            <div className="mt-6">
                              <div className="flex items-center mb-2">
                                <HistoryOutlined className="text-custom-green mr-2" />
                                <Text strong className="text-gray-800">
                                  Historical Scores
                                </Text>
                              </div>

                              <div className="bg-gray-50 p-3 rounded-lg">
                                {getSurveyScoresForTrend(survey.surveyId)
                                  .length > 0 ? (
                                  <div className="space-y-2">
                                    {getSurveyScoresForTrend(
                                      survey.surveyId
                                    ).map((historicalScore) => {
                                      const [histScore, histTotal] =
                                        historicalScore.score
                                          .split("/")
                                          .map(Number);
                                      const histPercent = Math.round(
                                        (histScore / histTotal) * 100
                                      );

                                      return (
                                        <div
                                          key={historicalScore.periodicId}
                                          className="flex items-center"
                                        >
                                          <div className="w-20 flex-shrink-0">
                                            <Tag
                                              color={
                                                historicalScore.periodic ===
                                                selectedPeriod
                                                  ? "blue"
                                                  : "default"
                                              }
                                              className="rounded-full text-center w-full"
                                            >
                                              Period {historicalScore.periodic}
                                            </Tag>
                                          </div>
                                          <div className="flex-grow ml-3">
                                            <Progress
                                              percent={histPercent}
                                              size="small"
                                              format={() =>
                                                `${histScore}/${histTotal}`
                                              }
                                              status={
                                                getSeverityLevel(
                                                  historicalScore.score,
                                                  historicalScore.category
                                                ) === "success"
                                                  ? "success"
                                                  : getSeverityLevel(
                                                      historicalScore.score,
                                                      historicalScore.category
                                                    ) === "warning"
                                                  ? "normal"
                                                  : "exception"
                                              }
                                            />
                                          </div>
                                        </div>
                                      );
                                    })}
                                  </div>
                                ) : (
                                  <div className="text-center text-gray-500 py-2">
                                    No historical data available yet
                                  </div>
                                )}
                              </div>
                            </div>
                          </Card>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}
      </div>

      {/* Add this at the end, before the closing div */}
      {renderSurveyReportModal()}
    </div>
  );
};

export default TestRecord;

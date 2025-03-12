import { useState, useMemo, useEffect } from "react";
import {
  DownOutlined,
  SearchOutlined,
  MenuOutlined,
  DeleteOutlined,
  EditOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  PlusOutlined,
  FileTextOutlined,
  QuestionCircleOutlined,
  RightOutlined,
  UserOutlined,
  CalendarOutlined,
} from "@ant-design/icons";
import {
  Input,
  Select,
  Pagination,
  Dropdown,
  Button,
  Spin,
  Empty,
  notification,
  Progress,
  Tooltip,
  Badge,
  Tag,
} from "antd";
import { useNavigate } from "react-router-dom";
import { useSurveyStore } from "../stores/surveyStore";
import { useAuthStore } from "../stores/authStore";

const { Option } = Select;

const Test = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const { surveys, loading, fetchSurveys } = useSurveyStore();
  const [selectedTest, setSelectedTest] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState();
  const [selectedCategory, setSelectedCategory] = useState();
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 6;

  // Fetch surveys data
  useEffect(() => {
    const fetchData = async () => {
      try {
        await fetchSurveys();
      } catch (error) {
        console.error("Error fetching surveys:", error);

        // Handle 403 Forbidden error
        if (
          error.message.includes("permission") ||
          error.message.includes("403") ||
          error.response?.status === 403
        ) {
          notification.error({
            message: "Authentication Error",
            description: "Your session may have expired. Please log in again.",
            duration: 5,
          });
        } else {
          notification.error({
            message: "Error Loading Tests",
            description:
              "Failed to load available tests. Please try again later.",
            duration: 5,
          });
        }
      }
    };

    fetchData();
  }, [fetchSurveys]);

  // Get unique statuses and categories for filters
  const statuses = useMemo(
    () => [
      ...new Set(
        surveys.map((survey) => survey.completeStatus || "NOT COMPLETED")
      ),
    ],
    [surveys]
  );

  const categories = useMemo(() => {
    return [...new Set(surveys.map((survey) => survey.categoryName))].filter(
      Boolean
    );
  }, [surveys]);

  // Filter surveys based on search and filters
  const filteredTests = useMemo(() => {
    return surveys.filter((survey) => {
      const matchesSearch =
        survey.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        survey.description.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus =
        !selectedStatus || survey.completeStatus === selectedStatus;
      const matchesCategory =
        !selectedCategory || survey.categoryName === selectedCategory;

      return matchesSearch && matchesStatus && matchesCategory;
    });
  }, [surveys, searchQuery, selectedStatus, selectedCategory]);

  // Calculate pagination
  const totalTests = filteredTests.length;
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const currentTests = filteredTests.slice(startIndex, endIndex);

  const handleTestClick = (test) => {
    setSelectedTest(test);
    setIsModalOpen(true);
  };

  const handleStartTest = async (test) => {
    try {
      // Navigate to the test with the survey data
      navigate("/test-question", {
        state: {
          test: {
            ...test,
            id: test.id,
          },
        },
      });
    } catch (error) {
      console.error("Error starting test:", error);
    }
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  // Function to format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // Loading skeleton for tests
  const renderSkeletons = () => (
    <div className="space-y-6 max-w-3xl mx-auto px-4">
      {[1, 2, 3].map((i) => (
        <div
          key={i}
          className="bg-white rounded-xl shadow-md border border-gray-100 p-6"
        >
          <div className="animate-pulse">
            <div className="flex justify-between items-center mb-4">
              <div className="h-6 bg-gray-200 rounded w-1/3"></div>
              <div className="h-8 bg-gray-200 rounded-xl w-24"></div>
            </div>
            <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-5/6 mb-6"></div>
            <div className="flex space-x-4">
              <div className="h-8 bg-gray-200 rounded-lg w-24"></div>
              <div className="h-8 bg-gray-200 rounded-lg w-32"></div>
              <div className="h-8 bg-gray-200 rounded-lg w-28"></div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  // Map categories to specific colors
  const getCategoryColor = (category) => {
    const colorMap = {
      anxiety: {
        bg: "bg-blue-50",
        text: "text-blue-600",
        border: "border-blue-400",
      },
      depression: {
        bg: "bg-purple-50",
        text: "text-purple-600",
        border: "border-purple-400",
      },
      stress: {
        bg: "bg-amber-50",
        text: "text-amber-600",
        border: "border-amber-400",
      },
    };

    // Default color if category not found in map
    const defaultColor = {
      bg: "bg-custom-green/10",
      text: "text-custom-green",
      border: "border-custom-green",
    };

    // Check if category exists and convert to lowercase for case-insensitive matching
    const categoryLower = category ? category.toLowerCase() : "";

    // Find the matching color or use default
    for (const [key, value] of Object.entries(colorMap)) {
      if (categoryLower.includes(key)) {
        return value;
      }
    }

    return defaultColor;
  };

  return (
    <div className="general-wrapper ">
      {/* Hero section */}
      <div className="hero-section">
        <div className="hero-content">
          <h1 className="hero-title">Mental Health Assessments</h1>
          <p className="hero-subtitle">
            Complete these assessments to help us understand your mental
            well-being and provide personalized support
          </p>
        </div>
      </div>

      {/* Search and Filters Section - Redesigned */}
      <div className="mb-12 max-w-3xl mx-auto px-4 relative -mt-10 ">
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 transition-all hover:shadow-xl backdrop-blur-sm bg-white/95">
          {/* Header with decorative element */}
          <div className="relative mb-6">
            <div className="absolute -top-4 -left-4 w-12 h-12 bg-custom-green/10 rounded-full"></div>
            <h2 className="text-lg font-semibold text-gray-800 flex items-center relative z-10">
              <SearchOutlined className="mr-2 text-custom-green" />
              <span>Find Assessments</span>
            </h2>
            <div className="h-1 w-16 bg-custom-green/30 rounded-full mt-2"></div>
          </div>

          {/* Search Bar */}
          <div className="flex items-center bg-gray-50 rounded-xl p-4 mb-6 border border-gray-200 focus-within:ring-2 focus-within:ring-custom-green/30 focus-within:border-custom-green/50 transition-all hover:border-custom-green/30 shadow-sm">
            <SearchOutlined className="text-gray-400 text-lg mr-3" />
            <Input
              placeholder="Search by test name or description"
              variant="borderless"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 bg-transparent text-base"
              size="large"
            />
            {searchQuery && (
              <Button
                type="text"
                className="text-gray-400 hover:text-gray-600"
                onClick={() => setSearchQuery("")}
              >
                ✕
              </Button>
            )}
          </div>

          {/* Filters - Enhanced with visual cues */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="transition-all duration-300 hover:transform hover:scale-[1.01]">
              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                <span className="inline-block w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                Status
              </label>
              <Select
                placeholder="All statuses"
                allowClear
                style={{ width: "100%" }}
                onChange={(value) => setSelectedStatus(value)}
                value={selectedStatus}
                className="w-full"
                size="large"
                suffixIcon={<DownOutlined className="text-gray-400" />}
                dropdownStyle={{ borderRadius: "0.75rem" }}
              >
                {statuses.map((status) => (
                  <Option key={status} value={status}>
                    {status === "COMPLETED" ? (
                      <span className="flex items-center">
                        <CheckCircleOutlined className="mr-2 text-green-500" />
                        Completed
                      </span>
                    ) : (
                      <span className="flex items-center">
                        <ClockCircleOutlined className="mr-2 text-blue-500" />
                        Not Completed
                      </span>
                    )}
                  </Option>
                ))}
              </Select>
            </div>

            <div className="flex-1 transition-all duration-300 hover:transform hover:scale-[1.01]">
              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                <span className="inline-block w-2 h-2 bg-custom-green rounded-full mr-2"></span>
                Category
              </label>
              <Select
                placeholder="All categories"
                allowClear
                style={{ width: "100%" }}
                onChange={setSelectedCategory}
                value={selectedCategory}
                className="w-full"
                size="large"
                suffixIcon={<DownOutlined className="text-gray-400" />}
                dropdownStyle={{ borderRadius: "0.75rem" }}
              >
                {categories.map((category) => (
                  <Option key={category} value={category}>
                    <span className="capitalize">{category.toLowerCase()}</span>
                  </Option>
                ))}
              </Select>
            </div>
          </div>

          {/* Active filters display */}
          {(selectedStatus || selectedCategory || searchQuery) && (
            <div className="mt-6 pt-4 border-t border-gray-100">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-sm text-gray-500">Active filters:</span>
                {searchQuery && (
                  <Tag
                    closable
                    onClose={() => setSearchQuery("")}
                    className="bg-gray-100 text-gray-700 rounded-lg px-3 py-1"
                  >
                    Search:{" "}
                    {searchQuery.length > 15
                      ? searchQuery.substring(0, 15) + "..."
                      : searchQuery}
                  </Tag>
                )}
                {selectedStatus && (
                  <Tag
                    closable
                    onClose={() => setSelectedStatus(undefined)}
                    className="bg-blue-50 text-blue-600 rounded-lg px-3 py-1"
                  >
                    Status:{" "}
                    {selectedStatus === "COMPLETED"
                      ? "Completed"
                      : "Not Completed"}
                  </Tag>
                )}
                {selectedCategory && (
                  <Tag
                    closable
                    onClose={() => setSelectedCategory(undefined)}
                    className="bg-custom-green/10 text-custom-green rounded-lg px-3 py-1"
                  >
                    Category: {selectedCategory}
                  </Tag>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Test Cards List */}
      {loading ? (
        <div className="max-w-4xl mx-auto px-6 mb-12">{renderSkeletons()}</div>
      ) : (
        <>
          <div className="max-w-4xl mx-auto px-6 mb-12 space-y-6">
            {filteredTests.length > 0 ? (
              currentTests.map((test) => {
                const categoryColor = getCategoryColor(test.categoryName);

                return (
                  <div
                    key={test.id}
                    onClick={() => handleTestClick(test)}
                    className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 border border-gray-100 hover:border-gray-200 cursor-pointer transform hover:-translate-y-1 overflow-hidden group"
                  >
                    <div
                      className={`border-l-4 ${categoryColor.border} h-full p-6 relative`}
                    >
                      {/* Decorative elements */}
                      <div
                        className={`absolute top-0 right-0 w-32 h-32 ${categoryColor.bg} rounded-full -mr-16 -mt-16 opacity-0 group-hover:opacity-30 transition-all duration-500`}
                      ></div>
                      <div className="absolute bottom-0 left-1/2 w-16 h-16 bg-gray-50 rounded-full -mb-8 -ml-8 opacity-0 group-hover:opacity-50 transition-all duration-700 delay-100"></div>

                      <div className="flex items-center justify-between mb-3 relative z-10">
                        <h3
                          className={`text-xl font-semibold text-gray-800 group-hover:${categoryColor.text} transition-colors`}
                        >
                          {test.title}
                        </h3>
                        <div className="flex items-center">
                          {test.completeStatus === "COMPLETED" ? (
                            <div className="bg-green-50 text-green-600 rounded-xl px-3 py-1.5 flex items-center">
                              <CheckCircleOutlined className="mr-1.5" />
                              <span className="font-medium">Completed</span>
                            </div>
                          ) : (
                            <div className="bg-blue-50 text-blue-600 rounded-xl px-3 py-1.5 flex items-center">
                              <ClockCircleOutlined className="mr-1.5" />
                              <span className="font-medium">Not Completed</span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Card Content */}
                      <p className="text-gray-600 mb-6 line-clamp-2 relative z-10">
                        {test.description}
                      </p>

                      <div className="flex flex-wrap gap-3 relative z-10">
                        <Tooltip title="Estimated time to complete">
                          <span
                            className={`flex items-center bg-gray-50 px-3 py-1.5 rounded-lg text-gray-700 hover:${categoryColor.bg} transition-colors`}
                          >
                            <CalendarOutlined
                              className={`mr-2 ${categoryColor.text}`}
                            />
                            {test.numberOfQuestions * 3} mins
                          </span>
                        </Tooltip>

                        <Tooltip title="Number of questions">
                          <span
                            className={`flex items-center bg-gray-50 px-3 py-1.5 rounded-lg text-gray-700 hover:${categoryColor.bg} transition-colors`}
                          >
                            <QuestionCircleOutlined
                              className={`mr-2 ${categoryColor.text}`}
                            />
                            {test.numberOfQuestions} Questions
                          </span>
                        </Tooltip>

                        {/* Enhanced Category Tag */}
                        <span
                          className={`flex items-center ${categoryColor.bg} ${
                            categoryColor.text
                          } px-3 py-1.5 rounded-lg ml-auto shadow-sm border border-${
                            categoryColor.border.split("-")[1]
                          }-200 group-hover:shadow transition-all`}
                        >
                          <FileTextOutlined className="mr-2" />
                          <span className="font-medium">
                            {test.categoryName}
                          </span>
                        </span>

                        {/* <Button
                          type="primary"
                          className={`flex items-center bg-custom-green hover:bg-custom-green/90 text-white font-bold rounded-lg shadow-sm hover:shadow-md transition-all transform hover:scale-105 px-4 py-1 h-auto border-0`}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleStartTest(test);
                          }}
                        >
                          <span className="flex items-center">
                            {test.completeStatus === "COMPLETED" ? (
                              <>
                                <span className="mr-1">Retake</span>
                              </>
                            ) : (
                              <>
                                <span className="mr-1">Start</span>
                              </>
                            )}
                          </span>
                        </Button> */}
                      </div>

                      {/* Status indicator dot */}
                      {test.status === "ACTIVE" ? (
                        <div className="absolute top-6 right-6 w-2 h-2 bg-green-500 rounded-full shadow-sm shadow-green-200 animate-pulse"></div>
                      ) : (
                        <div className="absolute top-6 right-6 w-2 h-2 bg-red-500 rounded-full shadow-sm shadow-red-200"></div>
                      )}
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="bg-white rounded-xl shadow-md p-8 text-center border border-gray-100">
                <Empty
                  description={
                    <span className="text-gray-500">
                      No assessments found matching your criteria.
                    </span>
                  }
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                />
                <Button
                  type="primary"
                  className="mt-4 bg-custom-green hover:bg-custom-green/90"
                  onClick={() => {
                    setSearchQuery("");
                    setSelectedStatus(undefined);
                    setSelectedCategory(undefined);
                  }}
                >
                  Clear Filters
                </Button>
              </div>
            )}
          </div>

          {/* Pagination and Results Count */}
          {filteredTests.length > 0 && (
            <div className="max-w-3xl mx-auto px-4 mt-8">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                <div className="text-sm text-gray-500">
                  Showing {Math.min(startIndex + 1, totalTests)}-
                  {Math.min(endIndex, totalTests)} of {totalTests}{" "}
                  {totalTests === 1 ? "assessment" : "assessments"}
                </div>
                <Pagination
                  current={currentPage}
                  total={totalTests}
                  pageSize={pageSize}
                  onChange={handlePageChange}
                  showSizeChanger={false}
                />
              </div>
            </div>
          )}
        </>
      )}

      {/* Modal for Test Details  */}
      {isModalOpen && selectedTest && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 backdrop-blur-sm z-[100]"
          onClick={() => setIsModalOpen(false)}
        >
          <div
            className="bg-white rounded-xl shadow-xl p-0 max-w-2xl w-full max-h-[90vh] overflow-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="bg-custom-green text-white p-6 rounded-t-xl">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-2xl font-bold mb-2">
                    {selectedTest.title}
                  </h2>
                  <div className="flex items-center space-x-2">
                    <span className="bg-white/20 px-3 py-1 rounded-full text-sm">
                      {selectedTest.categoryName}
                    </span>
                    {selectedTest.completeStatus === "COMPLETED" ? (
                      <span className="bg-white/20 px-3 py-1 rounded-full text-sm flex items-center">
                        <CheckCircleOutlined className="mr-1" />
                        Completed
                      </span>
                    ) : (
                      <span className="bg-white/20 px-3 py-1 rounded-full text-sm flex items-center">
                        <ClockCircleOutlined className="mr-1" />
                        Not Completed
                      </span>
                    )}
                  </div>
                </div>
                <Button
                  type="text"
                  className="text-white hover:text-white/80 hover:bg-white/10"
                  onClick={() => setIsModalOpen(false)}
                >
                  ✕
                </Button>
              </div>
            </div>

            {/* Modal Content */}
            <div className="p-6">
              <p className="text-gray-600 mb-6">{selectedTest.description}</p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div className="bg-gray-50 p-5 rounded-xl">
                  <h3 className="font-semibold text-gray-800 mb-4 flex items-center">
                    <FileTextOutlined className="mr-2 text-custom-green" />
                    Assessment Details
                  </h3>
                  <ul className="space-y-3">
                    <li className="flex justify-between items-center pb-2 border-b border-gray-100">
                      <span className="text-gray-500">Questions:</span>
                      <span className="font-medium text-gray-800">
                        {selectedTest.numberOfQuestions}
                      </span>
                    </li>
                    <li className="flex justify-between items-center pb-2 border-b border-gray-100">
                      <span className="text-gray-500">Estimated Time:</span>
                      <span className="font-medium text-gray-800">
                        {selectedTest.numberOfQuestions * 3} minutes
                      </span>
                    </li>
                    <li className="flex justify-between items-center pb-2 border-b border-gray-100">
                      <span className="text-gray-500">Category:</span>
                      <span className="font-medium text-gray-800">
                        {selectedTest.categoryName}
                      </span>
                    </li>
                    <li className="flex justify-between items-center pb-2 border-b border-gray-100">
                      <span className="text-gray-500">Created By:</span>
                      <span className="font-medium text-gray-800">
                        {selectedTest.createBy}
                      </span>
                    </li>
                    <li className="flex justify-between items-center">
                      <span className="text-gray-500">Created On:</span>
                      <span className="font-medium text-gray-800">
                        {formatDate(selectedTest.createdAt)}
                      </span>
                    </li>
                  </ul>
                </div>

                <div className="bg-gray-50 p-5 rounded-xl">
                  <h3 className="font-semibold text-gray-800 mb-4 flex items-center">
                    <QuestionCircleOutlined className="mr-2 text-custom-green" />
                    Instructions
                  </h3>
                  <ul className="space-y-2 text-gray-600">
                    <li className="flex items-start">
                      <div className="bg-custom-green/10 rounded-full p-1 mr-3 mt-0.5">
                        <CheckCircleOutlined className="text-custom-green text-sm" />
                      </div>
                      <span>
                        Answer all questions honestly for accurate results
                      </span>
                    </li>
                    <li className="flex items-start">
                      <div className="bg-custom-green/10 rounded-full p-1 mr-3 mt-0.5">
                        <CheckCircleOutlined className="text-custom-green text-sm" />
                      </div>
                      <span>There are no right or wrong answers</span>
                    </li>
                    <li className="flex items-start">
                      <div className="bg-custom-green/10 rounded-full p-1 mr-3 mt-0.5">
                        <CheckCircleOutlined className="text-custom-green text-sm" />
                      </div>
                      <span>
                        Take your time to consider each question carefully
                      </span>
                    </li>
                    <li className="flex items-start">
                      <div className="bg-custom-green/10 rounded-full p-1 mr-3 mt-0.5">
                        <CheckCircleOutlined className="text-custom-green text-sm" />
                      </div>
                      <span>
                        Your responses will help us provide personalized support
                      </span>
                    </li>
                  </ul>

                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <div className="flex items-center">
                      <Tag
                        color={
                          selectedTest.status === "ACTIVE" ? "green" : "red"
                        }
                        className="mr-2"
                      >
                        {selectedTest.status}
                      </Tag>
                      {selectedTest.status === "INACTIVE" && (
                        <span className="text-sm text-red-500">
                          This assessment is currently inactive
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <Button onClick={() => setIsModalOpen(false)}>Cancel</Button>
                <Button
                  type="primary"
                  className="bg-custom-green hover:bg-custom-green/90"
                  onClick={() => handleStartTest(selectedTest)}
                  disabled={selectedTest.status === "INACTIVE"}
                  size="large"
                >
                  {selectedTest.completeStatus === "COMPLETED"
                    ? "Retake Assessment"
                    : "Start Assessment"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Test;

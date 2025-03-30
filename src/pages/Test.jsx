import { useState, useMemo, useEffect } from "react";
import {
  DownOutlined,
  SearchOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  FileTextOutlined,
  QuestionCircleOutlined,
  CalendarOutlined,
  BarChartOutlined,
  HistoryOutlined,
} from "@ant-design/icons";
import {
  Input,
  Select,
  Pagination,
  Button,
  Empty,
  notification,
  Tooltip,
  Tag,
  Modal,
} from "antd";
import { useNavigate } from "react-router-dom";
import { useSurveyStore } from "../stores/surveyStore";
import { useAuthStore } from "../stores/authStore";

const { Option } = Select;

const Test = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
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
    return [...new Set(surveys.map((survey) => survey.category))].filter(
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
        !selectedCategory || survey.category === selectedCategory;

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
      // Check if test is completed - in new rules, completed tests cannot be retaken in same period
      if (test.completeStatus === "COMPLETED") {
        notification.info({
          message: "Assessment Already Completed",
          description: `You've already completed this assessment for the current period. It will be available again after the period ends (${
            test.periodic
          } week${test.periodic > 1 ? "s" : ""}).`,
          duration: 6,
        });
        return;
      }

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

  // Function to navigate to TestRecord page
  const handleViewTestHistory = () => {
    navigate("/test-record");
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

  // Function to get category color
  const getCategoryColor = (category) => {
    const colorMap = {
      ANXIETY: {
        bg: "bg-blue-50",
        text: "text-blue-600",
        border: "border-blue-400",
      },
      DEPRESSION: {
        bg: "bg-purple-50",
        text: "text-purple-600",
        border: "border-purple-400",
      },
      STRESS: {
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

    return colorMap[category] || defaultColor;
  };

  return (
    <div className="general-wrapper ">
      {/* Hero section */}
      <div className="hero-section bg-emerald-gradient">
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
          {user.role === "student" && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="transition-all duration-300 hover:transform hover:scale-[1.01]">
                <label className="text-sm font-medium text-gray-700 mb-2 flex items-center">
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
                <label className="text-sm font-medium text-gray-700 mb-2 flex items-center">
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
                      <span className="capitalize">
                        {category.toLowerCase()}
                      </span>
                    </Option>
                  ))}
                </Select>
              </div>
            </div>
          )}

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
                {user.role === "student" && selectedStatus && (
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
                {user.role === "student" && selectedCategory && (
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
                const categoryColor = getCategoryColor(test.category);

                return (
                  <div
                    key={test.id}
                    onClick={() => handleTestClick(test)}
                    className={`bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 border border-gray-100 hover:border-gray-200 cursor-pointer transform hover:-translate-y-1 overflow-hidden group ${
                      test.status === "ACTIVE"
                        ? "opacity-100"
                        : user.role === "student" || user.role === "parent"
                        ? "hidden"
                        : "block"
                    }`}
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
                        {user.role === "student" && (
                          <div className="flex items-center">
                            {test.completeStatus === "COMPLETED" ? (
                              <div className="bg-green-50 text-green-600 rounded-xl px-3 py-1.5 flex items-center">
                                <CheckCircleOutlined className="mr-1.5" />
                                <span className="font-medium">Completed</span>
                              </div>
                            ) : (
                              <div className="bg-blue-50 text-blue-600 rounded-xl px-3 py-1.5 flex items-center">
                                <ClockCircleOutlined className="mr-1.5" />
                                <span className="font-medium">
                                  Not Completed
                                </span>
                              </div>
                            )}
                          </div>
                        )}
                      </div>

                      {test.status === "INACTIVE" && (
                        <Tag
                          color="error"
                          className="absolute top-3 right-5 text-white px-2 py-1 rounded-lg"
                        >
                          Inactive
                        </Tag>
                      )}

                      {/* Card Content */}
                      <p className="text-gray-600 mb-4 line-clamp-2 relative z-10">
                        {test.description}
                      </p>

                      {/* Period information - new */}
                      {test.periodic > 0 && (
                        <div className="mb-4 bg-gray-50 p-2 rounded-lg border border-gray-100 relative z-10">
                          <div className="flex items-center text-sm text-gray-600">
                            <CalendarOutlined
                              className={`mr-2 ${categoryColor.text}`}
                            />
                            <span>
                              Renews every {test.periodic} week
                              {test.periodic > 1 ? "s" : ""}
                            </span>
                          </div>
                        </div>
                      )}

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

                        {/* Updated Category Tag */}
                        <span
                          className={`flex items-center ${categoryColor.bg} ${
                            categoryColor.text
                          } px-3 py-1.5 rounded-lg ml-auto shadow-sm border border-${
                            categoryColor.border.split("-")[1]
                          }-200 group-hover:shadow transition-all`}
                        >
                          <FileTextOutlined className="mr-2" />
                          <span className="font-medium">{test.category}</span>
                        </span>
                      </div>
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
                {/* <div className="text-sm text-gray-500">
                  Showing {Math.min(startIndex + 1, totalTests)}-
                  {Math.min(endIndex, totalTests)} of {totalTests}{" "}
                  {totalTests === 1 ? "assessment" : "assessments"}
                </div> */}
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
        <Modal
          title={
            <div className="flex items-center gap-3 border-b pb-3">
              <div className="bg-custom-green/10 p-2 rounded-lg">
                <FileTextOutlined className="text-xl text-custom-green" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-800 m-0">
                  {selectedTest.title}
                </h3>
                <p className="text-sm text-gray-500 m-0">Assessment Details</p>
              </div>
            </div>
          }
          open={isModalOpen}
          onCancel={() => setIsModalOpen(false)}
          width={700}
          className="test-details-modal"
          centered
          destroyOnClose={true}
          footer={
            <div className="flex justify-end gap-3">
              <Button size="large" onClick={() => setIsModalOpen(false)}>
                Cancel
              </Button>
              {user.role === "student" && (
                <Button
                  type="primary"
                  className="bg-custom-green hover:bg-custom-green/90"
                  onClick={() => handleStartTest(selectedTest)}
                  disabled={
                    selectedTest.status === "INACTIVE" ||
                    selectedTest.completeStatus === "COMPLETED"
                  }
                  size="large"
                >
                  {selectedTest.completeStatus === "COMPLETED"
                    ? "Completed for this Period"
                    : "Start Assessment"}
                </Button>
              )}
            </div>
          }
        >
          <div className="space-y-4 animate-fadeIn">
            {/* Category and Status Badges */}
            <div className={`flex flex-wrap gap-2 mb-3`}>
              <Tag className="bg-custom-green/10 text-custom-green border-custom-green px-3 py-1 rounded-lg">
                {selectedTest.category}
              </Tag>
              {user.role === "student" &&
                (selectedTest.completeStatus === "COMPLETED" ? (
                  <Tag className="bg-green-50 text-green-600 border-green-200 px-3 py-1 rounded-lg flex items-center">
                    <CheckCircleOutlined className="mr-1" />
                    Completed
                  </Tag>
                ) : (
                  <Tag className="bg-blue-50 text-blue-600 border-blue-200 px-3 py-1 rounded-lg flex items-center">
                    <ClockCircleOutlined className="mr-1" />
                    Not Completed
                  </Tag>
                ))}

              {/* Add status tag showing active/inactive state */}
              <Tag
                className={`px-3 py-1 rounded-lg flex items-center ${
                  selectedTest.status === "ACTIVE"
                    ? "bg-green-50 text-green-600 border-green-200"
                    : "bg-red-50 text-red-600 border-red-200"
                }`}
              >
                {selectedTest.status === "ACTIVE" ? (
                  <>
                    <CheckCircleOutlined className="mr-1" />
                    Active
                  </>
                ) : (
                  <>
                    <ClockCircleOutlined className="mr-1" />
                    Inactive
                  </>
                )}
              </Tag>
            </div>

            {/* Description */}
            <div className="border-b pb-3">
              <p className="text-gray-600">{selectedTest.description}</p>
            </div>

            {/* Period Reset Information */}
            {selectedTest.periodic > 0 && (
              <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 mb-3">
                <h3 className="font-semibold text-gray-800 mb-2 flex items-center">
                  <CalendarOutlined className="mr-2 text-blue-500" />
                  Assessment Period Information
                </h3>
                <div className="flex items-center">
                  <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                    <ClockCircleOutlined className="text-blue-600" />
                  </div>
                  <div className="text-gray-700">
                    <p className="m-0">
                      <span className="font-medium">Period Length:</span>{" "}
                      {selectedTest.periodic} week
                      {selectedTest.periodic > 1 ? "s" : ""}
                    </p>
                    {selectedTest.completeStatus === "COMPLETED" && (
                      <p className="m-0 mt-1 text-sm">
                        <span className="bg-yellow-100 px-2 py-0.5 rounded-md text-yellow-700">
                          Note:
                        </span>{" "}
                        You have already completed this assessment for the
                        current period. The assessment will be available again
                        at the start of the next period.
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Assessment Details Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
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
                      {selectedTest.category}
                    </span>
                  </li>
                  <li className="flex justify-between items-center pb-2 border-b border-gray-100">
                    <span className="text-gray-500">Survey Code:</span>
                    <span className="font-medium text-gray-800">
                      {selectedTest.standardType}
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
                      You can only complete this assessment once per period (
                      {selectedTest.periodic} week
                      {selectedTest.periodic > 1 ? "s" : ""})
                    </span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Results Section (Only if completed) */}
            {user.role === "student" &&
              selectedTest.statusStudentResponse &&
              selectedTest.statusStudentResponse.length > 0 && (
                <div className="bg-gray-50 p-5 rounded-xl">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="font-semibold text-gray-800 flex items-center m-0">
                      <BarChartOutlined className="mr-2 text-custom-green" />
                      Your Results
                    </h3>
                    <Button
                      type="link"
                      className="text-custom-green"
                      icon={<HistoryOutlined />}
                      onClick={handleViewTestHistory}
                    >
                      View History
                    </Button>
                  </div>
                  <div className="space-y-3">
                    {selectedTest.statusStudentResponse.map(
                      (response, index) => {
                        // Only show the latest or highest score attempt if there are multiple
                        if (
                          index ===
                          selectedTest.statusStudentResponse.length - 1
                        ) {
                          return (
                            <div
                              key={index}
                              className="bg-white p-4 rounded-lg border border-gray-100"
                            >
                              <div className="flex justify-between items-center pb-2 border-b border-gray-100">
                                <span className="text-gray-500">
                                  Last Completed:
                                </span>
                                <span className="font-medium text-gray-800">
                                  {response.lastCompleteDate
                                    ? formatDate(response.lastCompleteDate)
                                    : "Not completed yet"}
                                </span>
                              </div>
                              <div className="flex justify-between items-center pt-2">
                                <span className="text-gray-500">Score:</span>
                                <span className="font-medium text-gray-800">
                                  {response.score}
                                </span>
                              </div>
                            </div>
                          );
                        }
                        return null;
                      }
                    )}
                  </div>
                </div>
              )}
          </div>
        </Modal>
      )}
    </div>
  );
};

export default Test;

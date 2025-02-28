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
} from "antd";
import { useNavigate } from "react-router-dom";
import { useSurveyStore } from "../stores/surveyStore";
import { useAuthStore } from "../stores/authStore";

const { Option } = Select;

const Test = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const { surveys, loading, fetchSurveys, getStudentSurveyStatus } =
    useSurveyStore();
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

          // Optional: Redirect to login page
          // logout();
          // navigate("/login");
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

  // Get student-specific survey data
  const studentSurveys = useMemo(() => {
    if (user?.studentId) {
      return getStudentSurveyStatus(surveys, user.studentId);
    }
    return surveys;
  }, [surveys, user, getStudentSurveyStatus]);

  // Get unique statuses and categories for filters
  const statuses = useMemo(
    () => [
      ...new Set(
        studentSurveys.map((survey) => survey.studentStatus || "Not Started")
      ),
    ],
    [studentSurveys]
  );

  const categories = useMemo(() => {
    return [
      ...new Set(studentSurveys.map((survey) => survey.categoryName)),
    ].filter(Boolean);
  }, [studentSurveys]);

  // Menu items for dropdown
  const menuItems = {
    items: [
      {
        key: "1",
        label: (
          <div
            onClick={() => {
              console.log("Edit clicked");
              // Add your edit logic here
            }}
          >
            <EditOutlined /> Edit
          </div>
        ),
      },
      {
        key: "2",
        label: (
          <div
            onClick={() => {
              console.log("Delete clicked");
              // Add your delete logic here
            }}
          >
            <DeleteOutlined /> Delete
          </div>
        ),
      },
    ],
  };

  // Filter surveys based on search and filters
  const filteredTests = useMemo(() => {
    return studentSurveys.filter((survey) => {
      const matchesSearch =
        survey.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        survey.description.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus =
        !selectedStatus || survey.studentStatus === selectedStatus;
      const matchesCategory =
        !selectedCategory || survey.categoryName === selectedCategory;

      return matchesSearch && matchesStatus && matchesCategory;
    });
  }, [studentSurveys, searchQuery, selectedStatus, selectedCategory]);

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

  return (
    <div className="general-wrapper bg-gradient-to-b from-gray-50 to-white min-h-screen py-12">
      <div className="max-w-5xl mx-auto px-4">
        {loading ? (
          <div className="flex justify-center items-center min-h-[400px]">
            <Spin size="large" />
          </div>
        ) : (
          <div className="test-content max-w-5xl mx-auto px-4">
            {/* Title Section */}
            <div className="text-center mb-12">
              <h1 className="text-4xl font-bold text-gray-900 mb-3">
                Available Tests
              </h1>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Select a psychological assessment to begin your journey of
                self-discovery
              </p>
            </div>
            {/* Search and Filters Section */}
            <div className="search-filters mb-10 max-w-3xl mx-auto">
              <div className="">
                {/* Search Bar */}
                <div className="flex items-center bg-gray-50 rounded-xl p-3 mb-4 bg-white rounded-lg shadow-sm border border-gray-370 p-2 ">
                  <SearchOutlined className="text-gray-400 text-lg mr-3" />
                  <Input
                    placeholder="Search tests..."
                    variant="borderless"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="flex-1 bg-transparent"
                  />
                </div>

                {/* Filters */}
                <div className="flex flex-col sm:flex-row gap-4 ">
                  <Select
                    placeholder="Filter by status"
                    allowClear
                    style={{ width: "30%" }}
                    onChange={(value) => setSelectedStatus(value)}
                    value={selectedStatus}
                  >
                    {statuses.map((status) => (
                      <Option key={status} value={status}>
                        {status.charAt(0).toUpperCase() + status.slice(1)}
                      </Option>
                    ))}
                  </Select>

                  <Select
                    placeholder="Filter by category"
                    allowClear
                    style={{ width: "30%" }}
                    onChange={setSelectedCategory}
                    value={selectedCategory}
                  >
                    {categories.map((category) => (
                      <Option key={category} value={category}>
                        {category}
                      </Option>
                    ))}
                  </Select>
                </div>
              </div>
            </div>

            {/* Test Cards List */}
            <div className="test-cards space-y-6 max-w-3xl mx-auto px-4">
              {filteredTests.length > 0 ? (
                currentTests.map((test) => (
                  <div
                    key={test.id}
                    onClick={() => handleTestClick(test)}
                    className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 border border-gray-100 hover:border-gray-200 cursor-pointer transform hover:-translate-y-1"
                  >
                    <div className="p-6 flex items-center justify-between">
                      <div className="flex-1 pr-4">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="text-xl font-semibold text-gray-800">
                            {test.title}
                          </h3>
                          <div className="flex items-center">
                            {test.studentStatus === "Finished" ? (
                              <span className="flex items-center text-green-500 bg-green-50 rounded-xl p-2">
                                <CheckCircleOutlined className="mr-1.5" />
                                <span className="text-sm">
                                  Completed ({test.studentScore})
                                </span>
                              </span>
                            ) : (
                              <span className="flex items-center text-blue-500 bg-blue-50 rounded-xl p-2">
                                <ClockCircleOutlined className="mr-1.5" />
                                <span className="text-sm">Not Started</span>
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Card Content */}
                        <p className="text-gray-600 mb-6 line-clamp-2 ">
                          {test.description}
                        </p>
                        <div className="flex space-x-6">
                          <span className="flex items-center bg-gray-50 px-3 py-1.5 rounded-lg">
                            <svg
                              className="w-4 h-4 mr-2"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                              />
                            </svg>
                            {test.numberOfQuestions * 3} mins
                          </span>
                          <span className="flex items-center bg-gray-50 px-3 py-1.5 rounded-lg">
                            <svg
                              className="w-4 h-4 mr-2"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                              />
                            </svg>
                            {test.numberOfQuestions} Questions
                          </span>
                          <span className="flex items-center bg-custom-green/10 text-custom-green px-3 py-1.5 rounded-lg">
                            <svg
                              className="w-4 h-4 mr-2"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
                              />
                            </svg>
                            {test.categoryName}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center justify-center w-12 h-12 bg-gray-50 rounded-full hover:bg-gray-100 transition-colors">
                        <DownOutlined
                          className="text-custom-green text-lg"
                          rotate={-90}
                        />
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <Empty
                    description="No tests found matching your criteria."
                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                  />
                </div>
              )}
            </div>

            {/* Pagination and Results Count */}
            <div className="max-w-3xl mx-auto px-4 mt-6">
              <div className="flex flex-col items-end space-y-2">
                <Pagination
                  current={currentPage}
                  total={totalTests}
                  pageSize={pageSize}
                  onChange={handlePageChange}
                  showSizeChanger={false}
                />
                <div className="text-sm text-gray-500">
                  Showing {filteredTests.length}{" "}
                  {filteredTests.length === 1 ? "test" : "tests"}
                </div>
              </div>
            </div>

            {/* Modal for Test Details */}
            {isModalOpen && selectedTest && (
              <div
                className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 backdrop-blur-sm z-[100]"
                onClick={() => setIsModalOpen(false)}
              >
                <div
                  className="bg-white rounded-xl p-6 max-w-2xl w-full max-h-[90vh] overflow-auto"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="mb-6">
                    <h2 className="text-2xl font-bold text-gray-800 mb-2">
                      {selectedTest.title}
                    </h2>
                    <div className="flex items-center space-x-2 mb-4">
                      <span className="bg-custom-green/10 text-custom-green px-3 py-1 rounded-full text-sm">
                        {selectedTest.categoryName}
                      </span>
                      {selectedTest.studentStatus === "Finished" ? (
                        <span className="bg-green-50 text-green-600 px-3 py-1 rounded-full text-sm flex items-center">
                          <CheckCircleOutlined className="mr-1" />
                          Completed ({selectedTest.studentScore})
                        </span>
                      ) : (
                        <span className="bg-blue-50 text-blue-600 px-3 py-1 rounded-full text-sm flex items-center">
                          <ClockCircleOutlined className="mr-1" />
                          Not Started
                        </span>
                      )}
                    </div>
                    <p className="text-gray-600">{selectedTest.description}</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h3 className="font-medium text-gray-800 mb-2">
                        Details
                      </h3>
                      <ul className="space-y-2">
                        <li className="flex justify-between">
                          <span className="text-gray-500">Questions:</span>
                          <span className="font-medium">
                            {selectedTest.numberOfQuestions}
                          </span>
                        </li>
                        <li className="flex justify-between">
                          <span className="text-gray-500">Estimated Time:</span>
                          <span className="font-medium">
                            {selectedTest.numberOfQuestions * 3} minutes
                          </span>
                        </li>
                        <li className="flex justify-between">
                          <span className="text-gray-500">Category:</span>
                          <span className="font-medium">
                            {selectedTest.categoryName}
                          </span>
                        </li>
                      </ul>
                    </div>

                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h3 className="font-medium text-gray-800 mb-2">
                        Instructions
                      </h3>
                      <ul className="space-y-1 text-gray-600 text-sm">
                        <li>• Answer all questions honestly</li>
                        <li>• There are no right or wrong answers</li>
                        <li>• Take your time to consider each question</li>
                        <li>
                          • Your responses will help us provide better support
                        </li>
                      </ul>
                    </div>
                  </div>

                  <div className="flex justify-end space-x-3">
                    <Button onClick={() => setIsModalOpen(false)}>
                      Cancel
                    </Button>
                    <Button
                      type="primary"
                      className="bg-custom-green hover:bg-custom-green/90"
                      onClick={() => handleStartTest(selectedTest)}
                      disabled={selectedTest.status === "INACTIVE"}
                    >
                      {selectedTest.studentStatus === "Finished"
                        ? "Retake Test"
                        : "Start Test"}
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Test;

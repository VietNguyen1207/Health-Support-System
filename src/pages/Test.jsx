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
import { Input, Select, Pagination, Dropdown, Button } from "antd";
import { useNavigate } from "react-router-dom";

const { Option } = Select;

const Test = () => {
  const navigate = useNavigate();
  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTest, setSelectedTest] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState();
  const [selectedCategory, setSelectedCategory] = useState();
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 6;

  // Fetch tests data
  useEffect(() => {
    const fetchTests = async () => {
      try {
        const response = await fetch("/src/data/tests.json");
        const data = await response.json();
        setTests(data.tests);
      } catch (error) {
        console.error("Error fetching tests:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTests();
  }, []);

  // Get unique statuses and categories for filters
  const statuses = useMemo(
    () => [...new Set(tests.map((test) => test.status))],
    [tests]
  );

  const categories = useMemo(() => {
    return [...new Set(tests.map((test) => test.category))].filter(Boolean);
  }, [tests]);

  // Move the items array inside the component but outside any render logic
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

  // Filter tests based on search and filters
  const filteredTests = useMemo(() => {
    return tests.filter((test) => {
      const matchesSearch =
        test.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        test.description.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus = !selectedStatus || test.status === selectedStatus;
      const matchesCategory =
        !selectedCategory || test.category === selectedCategory;

      return matchesSearch && matchesStatus && matchesCategory;
    });
  }, [tests, searchQuery, selectedStatus, selectedCategory]);

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
      const response = await fetch("/src/data/test-questions.json");
      const data = await response.json();

      // Get questions for this specific test using test.id
      const testQuestions = data.questions[test.id];

      if (testQuestions) {
        navigate("/test-question", {
          state: {
            test: {
              ...test,
              questions: testQuestions.questions,
            },
          },
        });
      }
    } catch (error) {
      console.error("Error fetching test questions:", error);
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
            <div className="text-gray-500">Loading tests...</div>
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
                    // `bordered` is deprecated. Please use `variant` instead
                    // bordered={false}
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
                            {test.status === "finished" ? (
                              <span className="flex items-center text-green-500 bg-green-50 rounded-xl p-2">
                                <CheckCircleOutlined className="mr-1.5" />
                                <span className="text-sm">Completed</span>
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
                            {test.duration}
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
                            {test.questions} Questions
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
                            {test.category}
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
                  <p className="text-gray-500">
                    No tests found matching your criteria.
                  </p>
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
                  className="bg-white rounded-xl max-w-2xl w-full shadow-2xl transform transition-all relative"
                  onClick={(e) => e.stopPropagation()}
                >
                  {/* Modal Header */}
                  <div className="p-6 border-b">
                    <div className="flex justify-between items-start">
                      <h2 className="text-xl font-semibold text-gray-900">
                        {selectedTest.title}
                      </h2>
                      <Dropdown
                        menu={menuItems}
                        trigger={["click"]}
                        placement="bottomRight"
                      >
                        <button
                          onClick={(e) => e.stopPropagation()}
                          className="text-gray-400 hover:text-gray-500"
                        >
                          <MenuOutlined style={{ fontSize: "24px" }} />
                        </button>
                      </Dropdown>
                    </div>
                  </div>

                  {/* Modal Body */}
                  <div className="p-6">
                    <div className="space-y-4">
                      <div>
                        <h3 className="text-sm font-medium text-gray-900">
                          Description
                        </h3>
                        <p className="mt-1 text-sm text-gray-500">
                          {selectedTest.detailedDescription}
                        </p>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <h3 className="text-sm font-medium text-gray-900">
                            Duration
                          </h3>
                          <p className="mt-1 text-sm text-gray-500">
                            {selectedTest.duration}
                          </p>
                        </div>
                        <div>
                          <h3 className="text-sm font-medium text-gray-900">
                            Number of Questions
                          </h3>
                          <p className="mt-1 text-sm text-gray-500">
                            {selectedTest.questions}
                          </p>
                        </div>
                      </div>

                      <div>
                        <h3 className="text-sm font-medium text-gray-900">
                          Category
                        </h3>
                        <p className="mt-1 text-sm text-gray-500">
                          {selectedTest.category}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Modal Footer */}
                  <div className="p-6 border-t bg-gray-50 flex justify-end space-x-3 rounded-b-lg">
                    <button
                      onClick={() => setIsModalOpen(false)}
                      className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => handleStartTest(selectedTest)}
                      className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary -green hover:bg-custom-green/90"
                    >
                      Start Test
                    </button>
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

import { useState, useEffect } from "react";
import { Card, Typography, Spin, Tabs, Select, Input, Button } from "antd";
import {
  BarChartOutlined,
  LineChartOutlined,
  PieChartOutlined,
  FilterOutlined,
  SearchOutlined,
  UserOutlined,
} from "@ant-design/icons";
// Import chart library - using Recharts as example
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const { Title } = Typography;
const { TabPane } = Tabs;
const { Option } = Select;

export default function Dashboard() {
  // States for dashboard data
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState([]);
  const [students, setStudents] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  // Example data for charts - replace with actual API data
  const [assessmentData, setAssessmentData] = useState([]);
  const [categoryDistribution, setCategoryDistribution] = useState([]);
  // const [trendData, setTrendData] = useState([]);

  // Fetch dashboard data
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);

        // Make API calls to fetch dashboard data
        // const metricsResponse = await api.get("/metrics");
        // const studentsResponse = await api.get("/students");
        // const assessmentsResponse = await api.get("/assessments/stats");

        // Placeholder data - replace with actual API responses
        setMetrics([
          { id: 1, title: "Total Students", value: 256 },
          { id: 2, title: "Assessments Completed", value: 1024 },
          { id: 3, title: "At-Risk Students", value: 15 },
          { id: 4, title: "Average Satisfaction", value: "92%" },
        ]);

        setAssessmentData([
          { name: "Jan", anxiety: 65, depression: 45, stress: 30 },
          { name: "Feb", anxiety: 59, depression: 48, stress: 35 },
          { name: "Mar", anxiety: 62, depression: 51, stress: 40 },
          { name: "Apr", anxiety: 58, depression: 47, stress: 33 },
          { name: "May", anxiety: 55, depression: 42, stress: 29 },
          { name: "Jun", anxiety: 50, depression: 40, stress: 25 },
        ]);

        setCategoryDistribution([
          { name: "Anxiety", value: 35 },
          { name: "Depression", value: 25 },
          { name: "Stress", value: 20 },
          { name: "General Well-being", value: 20 },
        ]);

        setStudents([
          {
            id: 1,
            name: "Alex Johnson",
            risk: "low",
            lastAssessment: "2023-06-15",
            scores: { anxiety: 12, depression: 8, stress: 15 },
          },
          {
            id: 2,
            name: "Jamie Smith",
            risk: "high",
            lastAssessment: "2023-06-18",
            scores: { anxiety: 28, depression: 24, stress: 22 },
          },
          {
            id: 3,
            name: "Taylor Reed",
            risk: "medium",
            lastAssessment: "2023-06-10",
            scores: { anxiety: 18, depression: 16, stress: 19 },
          },
          {
            id: 4,
            name: "Morgan Chen",
            risk: "low",
            lastAssessment: "2023-06-17",
            scores: { anxiety: 10, depression: 6, stress: 12 },
          },
        ]);

        setLoading(false);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  // Helper function for risk indicator color
  const getRiskColor = (risk) => {
    switch (risk) {
      case "high":
        return "indicator-danger";
      case "medium":
        return "indicator-warning";
      case "low":
        return "indicator-good";
      default:
        return "indicator-good";
    }
  };

  return (
    <div className="dashboard-grid general-wrapper animate-fadeIn">
      <Title level={2}>Dashboard Overview</Title>

      {loading ? (
        <div className="flex justify-center my-12">
          <Spin size="large" />
        </div>
      ) : (
        <>
          {/* Metrics Section */}
          <section className="mb-8">
            <div className="metrics-grid">
              {metrics.map((metric) => (
                <div key={metric.id} className="metric-card">
                  <h3>{metric.title}</h3>
                  <p className="text-2xl font-bold">{metric.value}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Charts Section */}
          <section className="mb-8">
            <Title level={3} className="mb-4">
              Assessment Analytics
            </Title>
            <Tabs defaultActiveKey="1">
              <TabPane
                tab={
                  <span>
                    <LineChartOutlined /> Trends
                  </span>
                }
                key="1">
                <Card>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={assessmentData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line
                        type="monotone"
                        dataKey="anxiety"
                        stroke="#8884d8"
                      />
                      <Line
                        type="monotone"
                        dataKey="depression"
                        stroke="#82ca9d"
                      />
                      <Line type="monotone" dataKey="stress" stroke="#ffc658" />
                    </LineChart>
                  </ResponsiveContainer>
                </Card>
              </TabPane>
              <TabPane
                tab={
                  <span>
                    <BarChartOutlined /> Categories
                  </span>
                }
                key="2">
                <Card>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={assessmentData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="anxiety" fill="#8884d8" />
                      <Bar dataKey="depression" fill="#82ca9d" />
                      <Bar dataKey="stress" fill="#ffc658" />
                    </BarChart>
                  </ResponsiveContainer>
                </Card>
              </TabPane>
              <TabPane
                tab={
                  <span>
                    <PieChartOutlined /> Distribution
                  </span>
                }
                key="3">
                <Card>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={categoryDistribution}
                        cx="50%"
                        cy="50%"
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, percent }) =>
                          `${name}: ${(percent * 100).toFixed(0)}%`
                        }></Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </Card>
              </TabPane>
            </Tabs>
          </section>

          {/* Student List Section */}
          <section>
            <div className="flex justify-between items-center mb-4">
              <Title level={3} className="mb-0">
                Student Overview
              </Title>
              <div className="dashboard-controls">
                <Input
                  prefix={<SearchOutlined />}
                  placeholder="Search students"
                  className="search-input"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <Select
                  className="category-filter"
                  defaultValue="all"
                  onChange={setSelectedCategory}
                  placeholder="Filter by risk"
                  suffixIcon={<FilterOutlined />}>
                  <Option value="all">All Risk Levels</Option>
                  <Option value="high">High Risk</Option>
                  <Option value="medium">Medium Risk</Option>
                  <Option value="low">Low Risk</Option>
                </Select>
              </div>
            </div>

            <div className="student-list">
              {students
                .filter(
                  (student) =>
                    student.name
                      .toLowerCase()
                      .includes(searchQuery.toLowerCase()) &&
                    (selectedCategory === "all" ||
                      student.risk === selectedCategory)
                )
                .map((student) => (
                  <div key={student.id} className="student-card">
                    <div className="flex justify-between items-center">
                      <h3 className="flex items-center">
                        <UserOutlined className="mr-2" /> {student.name}
                      </h3>
                      <div
                        className={`health-indicator ${getRiskColor(
                          student.risk
                        )}`}>
                        {student.risk.charAt(0).toUpperCase() +
                          student.risk.slice(1)}{" "}
                        Risk
                      </div>
                    </div>
                    <p className="text-sm text-gray-500">
                      Last assessment: {student.lastAssessment}
                    </p>
                    <div className="health-indicators">
                      <div className="flex flex-col mt-3 w-full">
                        <div className="flex justify-between mb-1">
                          <span className="text-sm">Anxiety</span>
                          <span className="text-sm">
                            {student.scores.anxiety}/30
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-purple-500 h-2 rounded-full"
                            style={{
                              width: `${(student.scores.anxiety / 30) * 100}%`,
                            }}></div>
                        </div>
                      </div>
                      <div className="flex flex-col mt-2 w-full">
                        <div className="flex justify-between mb-1">
                          <span className="text-sm">Depression</span>
                          <span className="text-sm">
                            {student.scores.depression}/30
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-green-500 h-2 rounded-full"
                            style={{
                              width: `${
                                (student.scores.depression / 30) * 100
                              }%`,
                            }}></div>
                        </div>
                      </div>
                      <div className="flex flex-col mt-2 w-full">
                        <div className="flex justify-between mb-1">
                          <span className="text-sm">Stress</span>
                          <span className="text-sm">
                            {student.scores.stress}/30
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-yellow-500 h-2 rounded-full"
                            style={{
                              width: `${(student.scores.stress / 30) * 100}%`,
                            }}></div>
                        </div>
                      </div>
                    </div>
                    <div className="flex justify-end mt-4">
                      <Button type="primary">View Details</Button>
                    </div>
                  </div>
                ))}
            </div>
          </section>
        </>
      )}
    </div>
  );
}

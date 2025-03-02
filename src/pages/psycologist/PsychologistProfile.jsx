import React, { useState, useEffect } from "react";
import {
  Card,
  Tag,
  Spin,
  Empty,
  Tabs,
  Button,
  Tooltip,
  Statistic,
  Avatar,
  Divider,
  Badge,
  List,
  Timeline,
} from "antd";
import {
  UserOutlined,
  MailOutlined,
  PhoneOutlined,
  HomeOutlined,
  CalendarOutlined,
  TeamOutlined,
  TrophyOutlined,
  BulbOutlined,
  EditOutlined,
  EnvironmentOutlined,
  ClockCircleOutlined,
  FileTextOutlined,
  CheckCircleOutlined,
  MedicineBoxOutlined,
  BookOutlined,
} from "@ant-design/icons";
import { useUserStore } from "../../stores/userStore";
import { useAuthStore } from "../../stores/authStore";

const { TabPane } = Tabs;

const PsychologistProfile = () => {
  const { user: authUser } = useAuthStore();
  const { getUserDetails, loading } = useUserStore();
  const [userData, setUserData] = useState(null);
  const [activeTab, setActiveTab] = useState("1");

  useEffect(() => {
    const fetchPsychologistDetails = async () => {
      try {
        // For now, we're using a hardcoded ID, but this could be dynamic
        const psychologistId = "UID003";
        const data = await getUserDetails(psychologistId);
        setUserData(data);
      } catch (error) {
        console.error("Failed to fetch psychologist details:", error);
      }
    };

    fetchPsychologistDetails();
  }, [getUserDetails]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spin size="large" />
      </div>
    );
  }

  if (!userData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Empty description="No psychologist data available" />
      </div>
    );
  }

  const { psychologistInfo } = userData;

  // Function to get status color
  const getStatusColor = (status) => {
    switch (status?.toUpperCase()) {
      case "ACTIVE":
        return "green";
      case "AWAY":
        return "orange";
      case "UNAVAILABLE":
        return "red";
      default:
        return "default";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white pt-16 pb-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Header with profile summary */}
        <Card className="rounded-2xl shadow-md overflow-hidden mb-8">
          <div className="bg-gradient-to-r from-custom-green to-custom-green/80 p-6 text-white">
            <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
              <div className="w-32 h-32 bg-white rounded-full flex items-center justify-center shadow-md border-4 border-white">
                <span
                  className="text-4xl font-bold tracking-wider"
                  style={{
                    color: "#3a6a49",
                    textShadow: "0 1px 2px rgba(255,255,255,0.2)",
                  }}
                >
                  {userData.fullName
                    .split(" ")
                    .map((name) => name[0])
                    .join("")}
                </span>
              </div>

              <div className="flex-1 text-center md:text-left">
                <div className="flex flex-col md:flex-row md:justify-between md:items-center">
                  <div>
                    <h1 className="text-3xl font-bold mb-2">
                      {userData.fullName}
                    </h1>
                    <p className="text-green-100 text-lg mb-4">
                      {psychologistInfo.departmentName}
                    </p>
                    <div className="flex flex-wrap gap-2 mb-4 justify-center md:justify-start">
                      <Badge
                        status={getStatusColor(psychologistInfo.status)}
                        text={
                          <span className="text-white bg-white/20 px-3 py-1 rounded-full text-sm">
                            {psychologistInfo.status}
                          </span>
                        }
                      />
                      <span className="text-white bg-white/20 px-3 py-1 rounded-full text-sm">
                        {userData.gender.charAt(0) +
                          userData.gender.slice(1).toLowerCase()}
                      </span>
                      <span className="text-white bg-white/20 px-3 py-1 rounded-full text-sm">
                        ID: {psychologistInfo.psychologistId}
                      </span>
                    </div>
                  </div>

                  <div className="mt-4 md:mt-0">
                    <Tooltip title="Edit Profile">
                      <Button
                        type="default"
                        shape="round"
                        icon={<EditOutlined />}
                        className="bg-white/20 border-white/30 text-white hover:bg-white/30"
                      >
                        Edit Profile
                      </Button>
                    </Tooltip>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card bordered={false} className="bg-gray-50 rounded-xl">
                <Statistic
                  title="Years of Experience"
                  value={psychologistInfo.yearsOfExperience}
                  suffix="years"
                  valueStyle={{ color: "#4a7c59" }}
                  prefix={<TrophyOutlined />}
                />
              </Card>

              <Card bordered={false} className="bg-gray-50 rounded-xl">
                <Statistic
                  title="Department"
                  value={psychologistInfo.departmentName}
                  valueStyle={{ fontSize: "16px" }}
                  prefix={<MedicineBoxOutlined />}
                />
              </Card>

              <Card bordered={false} className="bg-gray-50 rounded-xl">
                <Statistic
                  title="Status"
                  value={psychologistInfo.status}
                  valueStyle={{
                    color:
                      psychologistInfo.status === "ACTIVE"
                        ? "#52c41a"
                        : "#faad14",
                    fontSize: "16px",
                  }}
                  prefix={<CheckCircleOutlined />}
                />
              </Card>
            </div>

            <Divider />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-medium text-gray-700 mb-4">
                  Contact Information
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="bg-custom-green/10 p-2 rounded-full">
                      <MailOutlined className="text-custom-green" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 m-0">Email</p>
                      <p className="font-medium text-gray-900 m-0">
                        {userData.email}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="bg-custom-green/10 p-2 rounded-full">
                      <PhoneOutlined className="text-custom-green" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 m-0">Phone</p>
                      <p className="font-medium text-gray-900 m-0">
                        {userData.phoneNumber}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="bg-custom-green/10 p-2 rounded-full">
                      <HomeOutlined className="text-custom-green" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 m-0">Address</p>
                      <p className="font-medium text-gray-900 m-0">
                        {userData.address}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-medium text-gray-700 mb-4">
                  Professional Information
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="bg-custom-green/10 p-2 rounded-full">
                      <UserOutlined className="text-custom-green" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 m-0">Full Name</p>
                      <p className="font-medium text-gray-900 m-0">
                        {userData.fullName}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="bg-custom-green/10 p-2 rounded-full">
                      <BookOutlined className="text-custom-green" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 m-0">Department</p>
                      <p className="font-medium text-gray-900 m-0">
                        {psychologistInfo.departmentName}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="bg-custom-green/10 p-2 rounded-full">
                      <ClockCircleOutlined className="text-custom-green" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 m-0">Experience</p>
                      <p className="font-medium text-gray-900 m-0">
                        {psychologistInfo.yearsOfExperience} years
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Main content with tabs */}
        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          type="card"
          className="bg-white rounded-2xl shadow-md p-6"
        >
          <TabPane
            tab={
              <span className="flex items-center gap-2">
                <CalendarOutlined />
                <span>Schedule</span>
              </span>
            }
            key="1"
          >
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold text-gray-900">
                  Upcoming Appointments
                </h2>
                <Button
                  type="primary"
                  className="bg-custom-green hover:bg-custom-green/90"
                  icon={<CalendarOutlined />}
                >
                  Manage Schedule
                </Button>
              </div>

              <div className="min-h-[300px] flex items-center justify-center">
                <Empty
                  description="No upcoming appointments"
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                >
                  <Button
                    type="primary"
                    className="bg-custom-green hover:bg-custom-green/90 mt-4"
                  >
                    View Calendar
                  </Button>
                </Empty>
              </div>
            </div>
          </TabPane>

          <TabPane
            tab={
              <span className="flex items-center gap-2">
                <TeamOutlined />
                <span>Students</span>
              </span>
            }
            key="2"
          >
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold text-gray-900">
                  Assigned Students
                </h2>
                <Button
                  type="primary"
                  className="bg-custom-green hover:bg-custom-green/90"
                  icon={<TeamOutlined />}
                >
                  View All Students
                </Button>
              </div>

              <div className="min-h-[300px] flex items-center justify-center">
                <Empty
                  description="No students assigned yet"
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                >
                  <Button
                    type="primary"
                    className="bg-custom-green hover:bg-custom-green/90 mt-4"
                  >
                    Browse Students
                  </Button>
                </Empty>
              </div>
            </div>
          </TabPane>

          <TabPane
            tab={
              <span className="flex items-center gap-2">
                <FileTextOutlined />
                <span>Reports</span>
              </span>
            }
            key="3"
          >
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold text-gray-900">
                  Recent Reports
                </h2>
                <Button
                  type="primary"
                  className="bg-custom-green hover:bg-custom-green/90"
                  icon={<FileTextOutlined />}
                >
                  Create New Report
                </Button>
              </div>

              <div className="min-h-[300px] flex items-center justify-center">
                <Empty
                  description="No reports available"
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                >
                  <Button
                    type="primary"
                    className="bg-custom-green hover:bg-custom-green/90 mt-4"
                  >
                    Create First Report
                  </Button>
                </Empty>
              </div>
            </div>
          </TabPane>

          <TabPane
            tab={
              <span className="flex items-center gap-2">
                <BulbOutlined />
                <span>Programs</span>
              </span>
            }
            key="4"
          >
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold text-gray-900">
                  Facilitated Programs
                </h2>
                <Button
                  type="primary"
                  className="bg-custom-green hover:bg-custom-green/90"
                  icon={<BulbOutlined />}
                >
                  Create Program
                </Button>
              </div>

              <div className="min-h-[300px] flex items-center justify-center">
                <Empty
                  description="No programs available"
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                >
                  <Button
                    type="primary"
                    className="bg-custom-green hover:bg-custom-green/90 mt-4"
                  >
                    Browse Programs
                  </Button>
                </Empty>
              </div>
            </div>
          </TabPane>
        </Tabs>
      </div>
    </div>
  );
};

export default PsychologistProfile;

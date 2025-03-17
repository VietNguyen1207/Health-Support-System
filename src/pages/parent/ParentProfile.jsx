import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
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
  Progress,
  Row,
  Col,
  Typography,
  Alert,
  Space,
  Collapse,
} from "antd";
import {
  UserOutlined,
  MailOutlined,
  PhoneOutlined,
  HomeOutlined,
  CalendarOutlined,
  TeamOutlined,
  EditOutlined,
  ClockCircleOutlined,
  FileTextOutlined,
  CheckCircleOutlined,
  BookOutlined,
  BarChartOutlined,
  RightOutlined,
  LinkOutlined,
  HeartOutlined,
  ExclamationCircleOutlined,
  EnvironmentOutlined,
  InfoCircleOutlined,
  BulbOutlined,
  ScheduleOutlined,
  SolutionOutlined,
  SafetyOutlined,
  StarOutlined,
  HistoryOutlined,
} from "@ant-design/icons";
import { useParentStore } from "../../stores/parentStore";
import { useAuthStore } from "../../stores/authStore";
import dayjs from "dayjs";

const { TabPane } = Tabs;
const { Title, Text, Paragraph } = Typography;
const { Panel } = Collapse;

const ParentProfile = () => {
  const { user: authUser } = useAuthStore();
  const { fetchParentDetails, loading, error, parentData } = useParentStore();
  const [activeTab, setActiveTab] = useState("1");
  const [selectedChild, setSelectedChild] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const loadParentData = async () => {
      try {
        const userId = authUser?.userId;
        if (!userId) {
          console.error("No user ID available");
          return;
        }
        await fetchParentDetails(userId);
      } catch (error) {
        console.error("Failed to load parent data:", error);
      }
    };

    loadParentData();
  }, [fetchParentDetails, authUser]);

  useEffect(() => {
    // Set the first child as selected by default when data loads
    if (parentData?.childrenRecord?.length > 0 && !selectedChild) {
      setSelectedChild(parentData.childrenRecord[0]);
    }
  }, [parentData, selectedChild]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-50 to-white">
        <div className="text-center">
          <div className="mb-4">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-blue-50 p-4">
              <Spin size="large" />
            </div>
          </div>
          <Title level={4} className="m-0 mb-2">
            Loading Profile
          </Title>
          <Text type="secondary">
            Please wait while we fetch your family's information...
          </Text>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-b from-gray-50 to-white">
        <Card className="w-full max-w-lg shadow-lg rounded-xl overflow-hidden">
          <Alert
            message="Error Loading Profile"
            description={error}
            type="error"
            showIcon
            className="mb-4"
          />
          <div className="flex justify-center">
            <Button
              onClick={() => fetchParentDetails(authUser?.userId)}
              type="primary"
              className="bg-blue-500 hover:bg-blue-600"
            >
              Try Again
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  if (!parentData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-50 to-white">
        <Card className="w-full max-w-lg shadow-lg rounded-xl overflow-hidden">
          <Empty
            description="No parent data available"
            image={Empty.PRESENTED_IMAGE_SIMPLE}
          />
          <div className="flex justify-center mt-4">
            <Button
              onClick={() => navigate("/")}
              type="primary"
              className="bg-blue-500 hover:bg-blue-600"
            >
              Go to Home
            </Button>
          </div>
        </Card>
      </div>
    );
  }

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

  // Function to get program status color
  const getProgramStatusColor = (status) => {
    switch (status?.toUpperCase()) {
      case "ACTIVE":
        return "green";
      case "COMPLETED":
        return "blue";
      case "CANCELLED":
        return "red";
      case "FULL":
        return "orange";
      default:
        return "default";
    }
  };

  // Function to get appointment status color
  const getAppointmentStatusColor = (status) => {
    switch (status?.toUpperCase()) {
      case "SCHEDULED":
        return "blue";
      case "COMPLETED":
        return "green";
      case "CANCELLED":
        return "red";
      case "IN_PROGRESS":
        return "orange";
      default:
        return "default";
    }
  };

  // Helper function to calculate duration in minutes
  const calculateDuration = (startTime, endTime) => {
    if (!startTime || !endTime) return 0;

    const [startHour, startMinute] = startTime.split(":").map(Number);
    const [endHour, endMinute] = endTime.split(":").map(Number);

    const startMinutes = startHour * 60 + startMinute;
    const endMinutes = endHour * 60 + endMinute;

    return endMinutes - startMinutes;
  };

  // Function to render the children selector
  const renderChildrenSelector = () => {
    return (
      <div className="mb-8">
        <div className="flex items-center mb-6">
          <div className="bg-blue-500/10 p-2 rounded-full mr-3">
            <TeamOutlined className="text-blue-500 text-xl" />
          </div>
          <Title level={3} className="m-0">
            Your Children
          </Title>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {parentData.childrenRecord.map((child) => (
            <Card
              key={child.userId}
              hoverable
              className={`border rounded-xl transition-all ${
                selectedChild?.userId === child.userId
                  ? "border-custom-green shadow-lg"
                  : "border-gray-200 hover:border-custom-green/50"
              }`}
              onClick={() => setSelectedChild(child)}
              bodyStyle={{ padding: "20px" }}
            >
              <div className="flex items-center">
                <Avatar
                  size={64}
                  icon={<UserOutlined />}
                  className={`${
                    selectedChild?.userId === child.userId
                      ? "bg-custom-green"
                      : "bg-gray-300"
                  }`}
                />
                <div className="ml-4">
                  <Text strong className="block text-lg">
                    {child.fullName}
                  </Text>
                  <Text type="secondary" className="block text-sm mb-2">
                    ID: {child.studentInfo.studentId}
                  </Text>
                  <div className="flex flex-wrap gap-2">
                    <Tag
                      color={child.gender === "MALE" ? "blue" : "magenta"}
                      className="rounded-full"
                    >
                      {child.gender.charAt(0) +
                        child.gender.slice(1).toLowerCase()}
                    </Tag>
                    <Tag color="orange" className="rounded-full">
                      Grade {child.studentInfo.grade}
                    </Tag>
                    <Tag color="cyan" className="rounded-full">
                      Class {child.studentInfo.className}
                    </Tag>
                  </div>
                </div>
              </div>

              {selectedChild?.userId === child.userId && (
                <div className="mt-3 pt-3 border-t border-gray-100 text-center">
                  <Text type="secondary" className="text-xs">
                    Currently Selected
                  </Text>
                </div>
              )}
            </Card>
          ))}
        </div>
      </div>
    );
  };

  // Function to render the child details
  const renderChildDetails = () => {
    if (!selectedChild) return null;

    return (
      <div>
        <Card className="rounded-xl shadow-lg mb-8 overflow-hidden border-0">
          <div
            className="bg-gradient-to-r from-custom-green to-custom-green/80 p-8 text-white"
            style={{ position: "relative", overflow: "hidden" }}
          >
            {/* Decorative circles */}
            <div
              className="absolute top-0 right-0 w-64 h-64 rounded-full opacity-10 bg-white"
              style={{ transform: "translate(30%, -30%)" }}
            ></div>
            <div
              className="absolute bottom-0 left-0 w-40 h-40 rounded-full opacity-10 bg-white"
              style={{ transform: "translate(-30%, 30%)" }}
            ></div>

            <div className="relative z-10 flex flex-col md:flex-row items-center md:items-start gap-6">
              <div className="w-28 h-28 bg-white rounded-full flex items-center justify-center shadow-md border-4 border-white">
                <span
                  className="text-4xl font-bold tracking-wider"
                  style={{
                    color: "#3a6a49",
                    textShadow: "0 1px 2px rgba(255,255,255,0.2)",
                  }}
                >
                  {selectedChild.fullName
                    .split(" ")
                    .map((name) => name[0])
                    .join("")}
                </span>
              </div>

              <div className="flex-1 text-center md:text-left">
                <div className="flex flex-col md:flex-row md:justify-between md:items-center">
                  <div>
                    <h1 className="text-3xl font-bold mb-2">
                      {selectedChild.fullName}
                    </h1>
                    <p className="text-green-100 mb-4 text-lg">
                      {selectedChild.studentInfo.schoolName} - Class{" "}
                      {selectedChild.studentInfo.className}
                    </p>
                    <div className="flex flex-wrap gap-2 mb-4 justify-center md:justify-start">
                      <span className="text-white bg-green-700/50 px-3 py-1 rounded-full text-sm font-medium border border-green-100/30">
                        Grade {selectedChild.studentInfo.grade}
                      </span>
                      <span className="text-white bg-blue-600/40 px-3 py-1 rounded-full text-sm font-medium border border-blue-100/30">
                        {selectedChild.gender.charAt(0) +
                          selectedChild.gender.slice(1).toLowerCase()}
                      </span>
                      <span className="text-white bg-purple-600/40 px-3 py-1 rounded-full text-sm font-medium border border-purple-100/30">
                        ID: {selectedChild.studentInfo.studentId}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="p-6">
            <Row gutter={[24, 24]}>
              <Col xs={24} md={8}>
                <Card
                  bordered={false}
                  className="bg-gray-50 rounded-xl shadow-sm hover:shadow-md transition-all"
                >
                  <Statistic
                    title={
                      <div className="flex items-center">
                        <HeartOutlined className="text-red-500 mr-2" />
                        <span>Depression Score</span>
                      </div>
                    }
                    value={selectedChild.studentInfo.depressionScore || 0}
                    valueStyle={{ color: "#4a7c59" }}
                    prefix={<HeartOutlined />}
                    suffix={
                      selectedChild.studentInfo.depressionScore > 0 ? "/27" : ""
                    }
                  />
                  {selectedChild.studentInfo.depressionScore === 0 ? (
                    <Text type="secondary" className="block mt-2 text-xs">
                      No assessment taken yet
                    </Text>
                  ) : (
                    <Progress
                      percent={Math.round(
                        (selectedChild.studentInfo.depressionScore / 27) * 100
                      )}
                      showInfo={false}
                      strokeColor={
                        selectedChild.studentInfo.depressionScore > 20
                          ? "red"
                          : selectedChild.studentInfo.depressionScore > 15
                          ? "orange"
                          : selectedChild.studentInfo.depressionScore > 10
                          ? "gold"
                          : "green"
                      }
                      className="mt-2"
                    />
                  )}
                </Card>
              </Col>

              <Col xs={24} md={8}>
                <Card
                  bordered={false}
                  className="bg-gray-50 rounded-xl shadow-sm hover:shadow-md transition-all"
                >
                  <Statistic
                    title={
                      <div className="flex items-center">
                        <HeartOutlined className="text-blue-500 mr-2" />
                        <span>Anxiety Score</span>
                      </div>
                    }
                    value={selectedChild.studentInfo.anxietyScore || 0}
                    valueStyle={{ color: "#4a7c59" }}
                    prefix={<HeartOutlined />}
                    suffix={
                      selectedChild.studentInfo.anxietyScore > 0 ? "/21" : ""
                    }
                  />
                  {selectedChild.studentInfo.anxietyScore === 0 ? (
                    <Text type="secondary" className="block mt-2 text-xs">
                      No assessment taken yet
                    </Text>
                  ) : (
                    <Progress
                      percent={Math.round(
                        (selectedChild.studentInfo.anxietyScore / 21) * 100
                      )}
                      showInfo={false}
                      strokeColor={
                        selectedChild.studentInfo.anxietyScore > 15
                          ? "red"
                          : selectedChild.studentInfo.anxietyScore > 10
                          ? "orange"
                          : selectedChild.studentInfo.anxietyScore > 5
                          ? "gold"
                          : "green"
                      }
                      className="mt-2"
                    />
                  )}
                </Card>
              </Col>

              <Col xs={24} md={8}>
                <Card
                  bordered={false}
                  className="bg-gray-50 rounded-xl shadow-sm hover:shadow-md transition-all"
                >
                  <Statistic
                    title={
                      <div className="flex items-center">
                        <HeartOutlined className="text-yellow-500 mr-2" />
                        <span>Stress Score</span>
                      </div>
                    }
                    value={selectedChild.studentInfo.stressScore || 0}
                    valueStyle={{ color: "#4a7c59" }}
                    prefix={<HeartOutlined />}
                    suffix={
                      selectedChild.studentInfo.stressScore > 0 ? "/40" : ""
                    }
                  />
                  {selectedChild.studentInfo.stressScore === 0 ? (
                    <Text type="secondary" className="block mt-2 text-xs">
                      No assessment taken yet
                    </Text>
                  ) : (
                    <Progress
                      percent={Math.round(
                        (selectedChild.studentInfo.stressScore / 40) * 100
                      )}
                      showInfo={false}
                      strokeColor={
                        selectedChild.studentInfo.stressScore > 27
                          ? "red"
                          : selectedChild.studentInfo.stressScore > 14
                          ? "gold"
                          : "green"
                      }
                      className="mt-2"
                    />
                  )}
                </Card>
              </Col>
            </Row>

            <Divider />

            <Row gutter={[24, 24]}>
              <Col xs={24} md={12}>
                <div>
                  <h3 className="text-lg font-medium text-gray-700 mb-4 flex items-center">
                    <MailOutlined className="text-custom-green mr-2" />
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
                          {selectedChild.email}
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
                          {selectedChild.phoneNumber}
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
                          {selectedChild.address}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </Col>

              <Col xs={24} md={12}>
                <div>
                  <h3 className="text-lg font-medium text-gray-700 mb-4 flex items-center">
                    <BookOutlined className="text-custom-green mr-2" />
                    School Information
                  </h3>
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="bg-custom-green/10 p-2 rounded-full">
                        <BookOutlined className="text-custom-green" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-500 m-0">School</p>
                        <p className="font-medium text-gray-900 m-0">
                          {selectedChild.studentInfo.schoolName}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="bg-custom-green/10 p-2 rounded-full">
                        <TeamOutlined className="text-custom-green" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-500 m-0">Class</p>
                        <p className="font-medium text-gray-900 m-0">
                          {selectedChild.studentInfo.className}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="bg-custom-green/10 p-2 rounded-full">
                        <SolutionOutlined className="text-custom-green" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-500 m-0">Grade</p>
                        <p className="font-medium text-gray-900 m-0">
                          {selectedChild.studentInfo.grade}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </Col>
            </Row>
          </div>
        </Card>

        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          type="card"
          className="bg-white rounded-xl shadow-md p-6"
        >
          <TabPane
            tab={
              <span className="flex items-center gap-2">
                <CalendarOutlined />
                <span>Appointments</span>
              </span>
            }
            key="1"
          >
            {renderAppointmentsTab()}
          </TabPane>

          <TabPane
            tab={
              <span className="flex items-center gap-2">
                <BulbOutlined />
                <span>Programs</span>
              </span>
            }
            key="2"
          >
            {renderProgramsTab()}
          </TabPane>

          <TabPane
            tab={
              <span className="flex items-center gap-2">
                <BarChartOutlined />
                <span>Assessments</span>
              </span>
            }
            key="3"
          >
            {renderAssessmentsTab()}
          </TabPane>
        </Tabs>
      </div>
    );
  };

  // Function to render the appointments tab
  const renderAppointmentsTab = () => {
    const appointments = selectedChild?.appointmentsRecord || [];

    if (appointments.length === 0) {
      return (
        <div className="min-h-[300px] flex items-center justify-center">
          <Empty
            description="No appointments scheduled"
            image={Empty.PRESENTED_IMAGE_SIMPLE}
          >
            <Button
              type="primary"
              className="bg-custom-green hover:bg-custom-green/90 mt-4"
              onClick={() => navigate("/book-appointment")}
            >
              Book an Appointment
            </Button>
          </Empty>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold text-gray-900">
            Appointment History
          </h2>
          <Button
            type="primary"
            className="bg-custom-green hover:bg-custom-green/90"
            icon={<CalendarOutlined />}
            onClick={() => navigate("/book-appointment")}
          >
            Book New Appointment
          </Button>
        </div>

        <List
          className="appointment-list"
          itemLayout="horizontal"
          dataSource={appointments}
          renderItem={(appointment) => {
            const appointmentDate = appointment.timeSlotID
              ? dayjs(
                  appointment.timeSlotID.split("-")[2] +
                    "-" +
                    appointment.timeSlotID.split("-")[3] +
                    "-" +
                    appointment.timeSlotID.split("-")[4]
                )
              : dayjs();

            const isToday = appointmentDate.isSame(dayjs(), "day");
            const createdDate = dayjs(appointment.createdAt);
            const updatedDate = dayjs(appointment.updatedAt);

            return (
              <Card
                className="mb-4 hover:shadow-md transition-all"
                bodyStyle={{ padding: "16px" }}
                key={appointment.appointmentID}
              >
                <div className="flex flex-col space-y-4">
                  {/* Header with appointment ID and status */}
                  <div className="flex justify-between items-center border-b pb-3">
                    <div className="flex items-center">
                      <div className="bg-custom-green/10 p-2 rounded-full mr-2">
                        <CalendarOutlined className="text-custom-green" />
                      </div>
                      <span className="text-gray-500 text-sm">
                        Appointment ID:{" "}
                        <span className="font-medium text-gray-700">
                          {appointment.appointmentID}
                        </span>
                      </span>
                    </div>
                    <Tag
                      color={getAppointmentStatusColor(appointment.status)}
                      className="rounded-full px-3 py-1"
                    >
                      {appointment.status}
                    </Tag>
                  </div>

                  {/* Main content */}
                  <div className="flex flex-col md:flex-row md:items-center">
                    {/* Date column */}
                    <div className="md:w-1/3 mb-4 md:mb-0">
                      <div className="flex items-start">
                        <div className="bg-custom-green/10 p-3 rounded-lg mr-3 text-center">
                          <div className="text-custom-green font-bold text-xl">
                            {appointmentDate.format("DD")}
                          </div>
                          <div className="text-custom-green text-sm">
                            {appointmentDate.format("MMM YYYY")}
                          </div>
                        </div>
                        <div>
                          <div className="text-gray-900 font-medium">
                            {appointmentDate.format("dddd")}
                          </div>
                          <div className="flex items-center text-gray-500 text-sm">
                            <ClockCircleOutlined className="mr-1" />
                            {appointment.startTime} - {appointment.endTime}
                          </div>
                          {isToday && (
                            <Badge
                              status="processing"
                              color="#4a7c59"
                              text={
                                <span className="text-custom-green text-xs">
                                  Today
                                </span>
                              }
                            />
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Psychologist info */}
                    <div className="md:w-1/3 mb-4 md:mb-0">
                      <div className="flex items-center">
                        <Avatar
                          icon={<UserOutlined />}
                          className="bg-custom-green mr-3"
                          size={40}
                        />
                        <div>
                          <div className="text-gray-900 font-medium">
                            {appointment.psychologistResponse?.name || "N/A"}
                          </div>
                          <div className="text-gray-500 text-sm">
                            {appointment.psychologistResponse?.departmentName ||
                              "Department not specified"}
                          </div>
                          <div className="text-gray-400 text-xs mt-1">
                            Experience:{" "}
                            {appointment.psychologistResponse
                              ?.yearsOfExperience || "N/A"}{" "}
                            years
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="md:w-1/3 flex justify-end items-center">
                      <div className="flex flex-col md:flex-row gap-2">
                        <Button
                          type="default"
                          onClick={() =>
                            navigate(
                              `/appointment-details/${appointment.appointmentID}`
                            )
                          }
                        >
                          Details <RightOutlined />
                        </Button>
                      </div>
                    </div>
                  </div>

                  {/* Footer with additional info */}
                  <div className="border-t pt-3 mt-2 text-xs text-gray-500 flex flex-wrap justify-between">
                    <div>
                      Created: {createdDate.format("MMM DD, YYYY HH:mm")}
                    </div>
                    <div>
                      Last Updated: {updatedDate.format("MMM DD, YYYY HH:mm")}
                    </div>
                    <div>
                      Duration:{" "}
                      {calculateDuration(
                        appointment.startTime,
                        appointment.endTime
                      )}{" "}
                      minutes
                    </div>
                  </div>
                </div>
              </Card>
            );
          }}
        />
      </div>
    );
  };

  // Function to render the programs tab
  const renderProgramsTab = () => {
    const programs = selectedChild?.programsRecord || [];

    if (programs.length === 0) {
      return (
        <div className="min-h-[300px] flex items-center justify-center">
          <Empty
            description="No programs joined"
            image={Empty.PRESENTED_IMAGE_SIMPLE}
          >
            <Button
              type="primary"
              className="bg-custom-green hover:bg-custom-green/90 mt-4"
              onClick={() => navigate("/program")}
            >
              Browse Programs
            </Button>
          </Empty>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold text-gray-900">
            Enrolled Programs
          </h2>
          <Button
            type="primary"
            className="bg-custom-green hover:bg-custom-green/90"
            icon={<BulbOutlined />}
            onClick={() => navigate("/program")}
          >
            Browse Programs
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {programs.map((program) => {
            const startDate = dayjs(program.startDate);
            const endDate = startDate.add(program.duration, "week");
            const isActive = program.status === "ACTIVE";
            const participantPercentage =
              (program.currentParticipants / program.maxParticipants) * 100;

            return (
              <Card
                key={program.programID}
                className="hover:shadow-lg transition-all border border-gray-100 rounded-xl overflow-hidden"
                bodyStyle={{ padding: 0 }}
              >
                <div className="p-5">
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="text-lg font-medium text-gray-800">
                      {program.title}
                    </h3>
                    <div className="flex gap-2">
                      <Tag
                        color={getProgramStatusColor(program.status)}
                        className="rounded-full"
                      >
                        {program.status.charAt(0) +
                          program.status.slice(1).toLowerCase()}
                      </Tag>
                      <Tag
                        color={
                          program.studentStatus === "JOINED"
                            ? "green"
                            : "default"
                        }
                        className="rounded-full"
                      >
                        {program.studentStatus}
                      </Tag>
                    </div>
                  </div>

                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                    {program.description}
                  </p>

                  <div className="grid grid-cols-2 gap-3 mb-4">
                    <div className="flex items-center gap-2">
                      <CalendarOutlined className="text-custom-green" />
                      <span className="text-sm">
                        {startDate.format("MMM DD, YYYY")}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <ClockCircleOutlined className="text-custom-green" />
                      <span className="text-sm">{program.duration} weeks</span>
                    </div>
                  </div>

                  {/* Weekly Schedule */}
                  <div className="bg-gray-50 p-3 rounded-lg mb-4">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm text-gray-500">
                        Weekly Schedule
                      </span>
                      <span className="text-sm font-medium">
                        {program.weeklySchedule.weeklyAt}s
                      </span>
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <ClockCircleOutlined className="text-custom-green mr-2" />
                      <span>
                        {program.weeklySchedule.startTime.substring(0, 5)} -{" "}
                        {program.weeklySchedule.endTime.substring(0, 5)}
                      </span>
                    </div>
                  </div>

                  {/* Participants */}
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm text-gray-500">
                        Participants
                      </span>
                    </div>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      </div>
    );
  };

  // Function to render the assessments tab
  const renderAssessmentsTab = () => {
    const surveyResults = selectedChild?.surveyResults || [];

    if (surveyResults.length === 0) {
      return (
        <div className="min-h-[300px] flex items-center justify-center">
          <Empty
            description="No assessments taken yet"
            image={Empty.PRESENTED_IMAGE_SIMPLE}
          >
            <Button
              type="primary"
              className="bg-custom-green hover:bg-custom-green/90 mt-4"
              onClick={() => navigate("/test")}
            >
              Take an Assessment
            </Button>
          </Empty>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold text-gray-900">
            Assessment History
          </h2>
          <Button
            type="primary"
            className="bg-custom-green hover:bg-custom-green/90"
            icon={<FileTextOutlined />}
            onClick={() => navigate("/test")}
          >
            Take New Assessment
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {surveyResults.map((survey) => {
            const completedDate = dayjs(survey.completedAt || new Date());

            // Calculate score percentage
            let scorePercentage = 0;
            let scoreColor = "green";

            if (survey.totalScore && survey.totalScore.includes("/")) {
              const [score, total] = survey.totalScore.split("/").map(Number);
              scorePercentage = Math.round((score / total) * 100);

              if (scorePercentage > 75) {
                scoreColor = "red";
              } else if (scorePercentage > 50) {
                scoreColor = "orange";
              } else if (scorePercentage > 25) {
                scoreColor = "gold";
              }
            }

            return (
              <Card
                key={survey.surveyId}
                className="hover:shadow-md transition-all rounded-xl overflow-hidden"
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <Title level={4} className="m-0 mb-1">
                      {survey.title}
                    </Title>
                    <Text type="secondary" className="text-sm">
                      Completed on {completedDate.format("MMM DD, YYYY")}
                    </Text>
                  </div>
                  <Tag color={scoreColor} className="rounded-full px-3 py-1">
                    {survey.totalScore || "N/A"}
                  </Tag>
                </div>

                <Paragraph className="text-gray-600 mb-4 line-clamp-2">
                  {survey.description || "No description available"}
                </Paragraph>

                <div className="mb-4">
                  <div className="flex justify-between items-center mb-1">
                    <Text className="text-sm text-gray-500">Score</Text>
                    <Text className="text-sm font-medium">
                      {survey.totalScore || "N/A"}
                    </Text>
                  </div>
                  <Progress
                    percent={scorePercentage}
                    showInfo={false}
                    strokeColor={scoreColor}
                    trailColor="#e5e7eb"
                    size="small"
                  />
                </div>

                <div className="flex justify-end">
                  <Button
                    type="primary"
                    className="bg-custom-green hover:bg-custom-green/90"
                    onClick={() => navigate(`/test-result/${survey.surveyId}`)}
                  >
                    View Results
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
      </div>
    );
  };

  // Render parent profile information
  const renderParentInfo = () => {
    return (
      <Card className="rounded-xl shadow-lg mb-8 overflow-hidden border-0">
        <div
          className="bg-gradient-to-r from-blue-600 to-blue-500 p-8 text-white"
          style={{ position: "relative", overflow: "hidden" }}
        >
          {/* Decorative circles */}
          <div
            className="absolute top-0 right-0 w-64 h-64 rounded-full opacity-10 bg-white"
            style={{ transform: "translate(30%, -30%)" }}
          ></div>
          <div
            className="absolute bottom-0 left-0 w-40 h-40 rounded-full opacity-10 bg-white"
            style={{ transform: "translate(-30%, 30%)" }}
          ></div>

          <div className="relative z-10 flex flex-col md:flex-row items-center md:items-start gap-6">
            <div className="w-28 h-28 bg-white rounded-full flex items-center justify-center shadow-md border-4 border-white">
              <span
                className="text-4xl font-bold tracking-wider"
                style={{
                  color: "#3b82f6",
                  textShadow: "0 1px 2px rgba(255,255,255,0.2)",
                }}
              >
                {parentData.fullName
                  .split(" ")
                  .map((name) => name[0])
                  .join("")}
              </span>
            </div>

            <div className="flex-1 text-center md:text-left">
              <div className="flex flex-col md:flex-row md:justify-between md:items-center">
                <div>
                  <h1 className="text-3xl font-bold mb-2">
                    {parentData.fullName}
                  </h1>
                  <p className="text-blue-100 mb-4 text-lg">
                    Parent of {parentData.childrenRecord.length}{" "}
                    {parentData.childrenRecord.length === 1
                      ? "child"
                      : "children"}
                  </p>
                  <div className="flex flex-wrap gap-2 mb-4 justify-center md:justify-start">
                    <span className="text-white bg-blue-700/50 px-3 py-1 rounded-full text-sm font-medium border border-blue-100/30">
                      {parentData.role}
                    </span>
                    <span className="text-white bg-purple-600/40 px-3 py-1 rounded-full text-sm font-medium border border-purple-100/30">
                      {parentData.gender.charAt(0) +
                        parentData.gender.slice(1).toLowerCase()}
                    </span>
                    <span className="text-white bg-green-600/40 px-3 py-1 rounded-full text-sm font-medium border border-green-100/30">
                      ID: {parentData.userId}
                    </span>
                  </div>
                </div>

                <div className="mt-4 md:mt-0">
                  <Tooltip title="Edit Profile">
                    <Button
                      type="default"
                      shape="round"
                      icon={<EditOutlined />}
                      className="bg-white/20 border-white/30 text-white hover:bg-white/30 hover:border-white/50"
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
          <Row gutter={[24, 24]}>
            <Col xs={24} md={12}>
              <div>
                <h3 className="text-lg font-medium text-gray-700 mb-4 flex items-center">
                  <MailOutlined className="text-blue-500 mr-2" />
                  Contact Information
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="bg-blue-500/10 p-2 rounded-full">
                      <MailOutlined className="text-blue-500" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 m-0">Email</p>
                      <p className="font-medium text-gray-900 m-0">
                        {parentData.email}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="bg-blue-500/10 p-2 rounded-full">
                      <PhoneOutlined className="text-blue-500" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 m-0">Phone</p>
                      <p className="font-medium text-gray-900 m-0">
                        {parentData.phoneNumber}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="bg-blue-500/10 p-2 rounded-full">
                      <HomeOutlined className="text-blue-500" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 m-0">Address</p>
                      <p className="font-medium text-gray-900 m-0">
                        {parentData.address}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </Col>

            <Col xs={24} md={12}>
              <div>
                <h3 className="text-lg font-medium text-gray-700 mb-4 flex items-center">
                  <UserOutlined className="text-blue-500 mr-2" />
                  Account Information
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="bg-blue-500/10 p-2 rounded-full">
                      <UserOutlined className="text-blue-500" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 m-0">Full Name</p>
                      <p className="font-medium text-gray-900 m-0">
                        {parentData.fullName}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="bg-blue-500/10 p-2 rounded-full">
                      <TeamOutlined className="text-blue-500" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 m-0">Children</p>
                      <p className="font-medium text-gray-900 m-0">
                        {parentData.childrenRecord.length}{" "}
                        {parentData.childrenRecord.length === 1
                          ? "child"
                          : "children"}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="bg-blue-500/10 p-2 rounded-full">
                      <CalendarOutlined className="text-blue-500" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 m-0">
                        Account Created
                      </p>
                      <p className="font-medium text-gray-900 m-0">
                        {dayjs(parentData.createdAt).format("MMMM DD, YYYY")}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </Col>
          </Row>
        </div>
      </Card>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white pt-16 pb-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Parent Information */}
        {renderParentInfo()}

        {/* Children Selector */}
        {renderChildrenSelector()}

        {/* Selected Child Details */}
        {renderChildDetails()}
      </div>
    </div>
  );
};

export default ParentProfile;

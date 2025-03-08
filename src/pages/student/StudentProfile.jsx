import React, { useState, useEffect } from "react";
import {
  Card,
  Progress,
  Tag,
  Spin,
  Empty,
  Modal,
  Tabs,
  Button,
  Tooltip,
  Statistic,
  List,
  Avatar,
  Badge,
} from "antd";
import {
  CalendarOutlined,
  TeamOutlined,
  FieldTimeOutlined,
  LinkOutlined,
  UserOutlined,
  MailOutlined,
  PhoneOutlined,
  HomeOutlined,
  BookOutlined,
  HeartOutlined,
  BarChartOutlined,
  ClockCircleOutlined,
  FileTextOutlined,
  EditOutlined,
  EnvironmentOutlined,
  BulbOutlined,
  VideoCameraOutlined,
  RightOutlined,
} from "@ant-design/icons";
import { useUserStore } from "../../stores/userStore";
import { useAuthStore } from "../../stores/authStore";
import { useAppointmentStore } from "../../stores/appointmentStore";
import { useNavigate } from "react-router-dom";
import dayjs from "dayjs";

const { TabPane } = Tabs;

const StudentProfile = () => {
  const { user: authUser } = useAuthStore();
  const { getUserDetails, loading: userLoading } = useUserStore();
  const { fetchUpcomingAppointments, loading: appointmentLoading } =
    useAppointmentStore();
  const [userData, setUserData] = useState(null);
  const [selectedProgram, setSelectedProgram] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [activeTab, setActiveTab] = useState("1");
  const [upcomingAppointments, setUpcomingAppointments] = useState([]);
  const [loadingAppointments, setLoadingAppointments] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserDetails = async () => {
      if (authUser?.userId) {
        try {
          const data = await getUserDetails(authUser.userId);
          setUserData(data);
        } catch (error) {
          console.error("Failed to fetch user details:", error);
        }
      }
    };

    fetchUserDetails();
  }, [getUserDetails, authUser]);

  useEffect(() => {
    // Fetch upcoming appointments when the appointments tab is selected
    if (activeTab === "3" && userData?.studentInfo?.studentId) {
      fetchAppointments();
    }
  }, [activeTab, userData]);

  const fetchAppointments = async () => {
    if (!userData?.studentInfo?.studentId) return;

    setLoadingAppointments(true);
    try {
      const appointments = await fetchUpcomingAppointments(
        userData.studentInfo.studentId
      );
      setUpcomingAppointments(appointments);
    } catch (error) {
      console.error("Failed to fetch upcoming appointments:", error);
    } finally {
      setLoadingAppointments(false);
    }
  };

  const handleProgramClick = (program) => {
    setSelectedProgram(program);
    setIsModalVisible(true);
  };

  const getIndicatorColor = (score) => {
    if (score <= 3) return "#4a7c59";
    if (score <= 6) return "#fbbf24";
    return "#ef4444";
  };

  const getIndicatorText = (score) => {
    if (score <= 3) return "Low";
    if (score <= 6) return "Moderate";
    return "High";
  };

  const renderAssessmentCard = (title, score, icon, maxScore = 10) => (
    <Card
      className="assessment-card bg-white rounded-xl shadow-sm hover:shadow-md transition-all"
      bordered={false}
    >
      <div className="flex items-center mb-4">
        <div className="bg-custom-green/10 p-2 rounded-full mr-3">{icon}</div>
        <h3 className="text-lg font-semibold text-gray-900 m-0">{title}</h3>
      </div>

      <div className="flex items-center justify-between">
        <Progress
          type="circle"
          percent={(score / maxScore) * 100}
          strokeColor={getIndicatorColor(score)}
          strokeWidth={10}
          width={80}
          format={() => <span className="text-lg">{score}</span>}
        />
        <div className="text-right">
          <span className="text-sm text-gray-500">Level</span>
          <div
            className={`mt-1 px-3 py-1 rounded-full text-sm font-medium inline-block
              ${
                score <= 3
                  ? "bg-green-50 text-green-700"
                  : score <= 6
                  ? "bg-yellow-50 text-yellow-700"
                  : "bg-red-50 text-red-700"
              }`}
          >
            {getIndicatorText(score)}
          </div>
        </div>
      </div>

      <p className="text-xs text-gray-500 mt-4 mb-0">
        Last updated: {new Date().toLocaleDateString()}
      </p>
    </Card>
  );

  // Render the appointments tab content
  const renderAppointmentsTab = () => {
    if (loadingAppointments) {
      return (
        <div className="py-10 flex justify-center">
          <Spin size="large" />
        </div>
      );
    }

    if (upcomingAppointments.length === 0) {
      return (
        <div className="min-h-[300px] flex items-center justify-center">
          <Empty
            description="No upcoming appointments"
            image={Empty.PRESENTED_IMAGE_SIMPLE}
          >
            <Button
              type="primary"
              className="bg-custom-green hover:bg-custom-green/90 mt-4"
              onClick={() => navigate("/book-appointment")}
            >
              Schedule Appointment
            </Button>
          </Empty>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold text-gray-900">
            Upcoming Appointments
          </h2>
          <Button
            type="primary"
            className="bg-custom-green hover:bg-custom-green/90"
            icon={<CalendarOutlined />}
            onClick={() => navigate("/book-appointment")}
          >
            Schedule New
          </Button>
        </div>

        <List
          className="appointment-list"
          itemLayout="horizontal"
          dataSource={upcomingAppointments}
          renderItem={(appointment) => {
            const appointmentDate = dayjs(appointment.slotDate);
            const isToday = appointmentDate.isSame(dayjs(), "day");
            const isPast = appointmentDate.isBefore(dayjs(), "day");

            return (
              <Card
                className="mb-4 hover:shadow-md transition-all"
                bodyStyle={{ padding: "16px" }}
              >
                <div className="flex flex-col md:flex-row md:items-center">
                  {/* Date column */}
                  <div className="md:w-1/4 mb-4 md:mb-0">
                    <div className="flex items-start">
                      <div className="bg-custom-green/10 p-3 rounded-lg mr-3 text-center">
                        <div className="text-custom-green font-bold text-xl">
                          {appointmentDate.format("DD")}
                        </div>
                        <div className="text-custom-green text-sm">
                          {appointmentDate.format("MMM")}
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
                  <div className="md:w-2/4 mb-4 md:mb-0">
                    <div className="flex items-center">
                      <Avatar
                        icon={<UserOutlined />}
                        className="bg-custom-green mr-3"
                        size={40}
                      />
                      <div>
                        <div className="text-gray-900 font-medium">
                          {appointment.psychologistName}
                        </div>
                        <div className="text-gray-500 text-sm">
                          Psychologist ({appointment.psychologistID})
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="md:w-1/4 flex justify-end items-center">
                    <div className="flex flex-col md:flex-row gap-2">
                      {appointment.type === "ONLINE" && (
                        <Button
                          type="primary"
                          icon={<VideoCameraOutlined />}
                          className="bg-custom-green hover:bg-custom-green/90"
                        >
                          Join
                        </Button>
                      )}
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
              </Card>
            );
          }}
        />

        <div className="text-center mt-4">
          <Button
            type="link"
            onClick={() => navigate("/appointment-record")}
            className="text-custom-green"
          >
            View Appointment History
          </Button>
        </div>
      </div>
    );
  };

  if (userLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spin size="large" />
      </div>
    );
  }

  if (!userData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Empty description="No student data available" />
      </div>
    );
  }

  const { studentInfo, programsRecord } = userData;

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white pt-16 pb-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Header with profile summary */}
        <div className="bg-white rounded-2xl shadow-md p-6 mb-8">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
            <div className="w-32 h-32 bg-gradient-to-br from-custom-green/80 to-custom-green rounded-full flex items-center justify-center shadow-md">
              <span
                className="text-4xl text-custom-green font-bold tracking-wider"
                style={{ textShadow: "0 1px 2px rgba(0,0,0,0.2)" }}
              >
                {userData.fullName
                  .split(" ")
                  .map((name) => name[0])
                  .join("")}
              </span>
            </div>

            <div className="flex-1">
              <div className="flex flex-col md:flex-row md:justify-between md:items-center">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900 mb-2 text-center md:text-left">
                    {userData.fullName}
                  </h1>
                  <div className="flex flex-wrap gap-2 mb-4 justify-center md:justify-start">
                    <Tag color="blue">
                      {userData.role.charAt(0) +
                        userData.role.slice(1).toLowerCase()}
                    </Tag>
                    <Tag color="green">
                      {userData.gender.charAt(0) +
                        userData.gender.slice(1).toLowerCase()}
                    </Tag>
                    {userData.verified && <Tag color="cyan">Verified</Tag>}
                  </div>
                </div>

                <Tooltip title="Edit Profile">
                  <Button
                    type="primary"
                    shape="round"
                    icon={<EditOutlined />}
                    className="bg-custom-green hover:bg-custom-green/90"
                  >
                    Edit Profile
                  </Button>
                </Tooltip>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                <div className="flex items-center gap-2">
                  <UserOutlined className="text-custom-green" />
                  <div>
                    <p className="text-sm text-gray-500 m-0">Student ID</p>
                    <p className="font-medium text-gray-900 m-0">
                      {studentInfo.studentId}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <BookOutlined className="text-custom-green" />
                  <div>
                    <p className="text-sm text-gray-500 m-0">Grade</p>
                    <p className="font-medium text-gray-900 m-0">
                      {studentInfo.grade} - Class {studentInfo.className}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <EnvironmentOutlined className="text-custom-green" />
                  <div>
                    <p className="text-sm text-gray-500 m-0">School</p>
                    <p className="font-medium text-gray-900 m-0">
                      {studentInfo.schoolName}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <MailOutlined className="text-custom-green" />
                  <div>
                    <p className="text-sm text-gray-500 m-0">Email</p>
                    <p className="font-medium text-gray-900 m-0">
                      {userData.email}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <PhoneOutlined className="text-custom-green" />
                  <div>
                    <p className="text-sm text-gray-500 m-0">Phone</p>
                    <p className="font-medium text-gray-900 m-0">
                      {userData.phoneNumber}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <HomeOutlined className="text-custom-green" />
                  <div>
                    <p className="text-sm text-gray-500 m-0">Address</p>
                    <p className="font-medium text-gray-900 m-0 truncate max-w-[200px]">
                      {userData.address}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

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
                <HeartOutlined />
                <span>Mental Health</span>
              </span>
            }
            key="1"
          >
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold text-gray-900">
                  Mental Health Overview
                </h2>
                <Button type="link" icon={<FileTextOutlined />}>
                  View Full Report
                </Button>
              </div>

              {/* Stats summary */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <Card bordered={false} className="bg-gray-50 rounded-xl">
                  <Statistic
                    title="Overall Well-being"
                    value={
                      Math.round(
                        ((10 -
                          studentInfo.anxietyScore +
                          (10 - studentInfo.stressScore) +
                          (10 - studentInfo.depressionScore)) /
                          3) *
                          10
                      ) / 10
                    }
                    suffix="/ 10"
                    precision={1}
                    valueStyle={{ color: "#4a7c59" }}
                  />
                  <p className="text-xs text-gray-500 mt-2">
                    Based on assessment scores
                  </p>
                </Card>

                <Card bordered={false} className="bg-gray-50 rounded-xl">
                  <Statistic
                    title="Last Assessment"
                    value={new Date().toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                    valueStyle={{ fontSize: "16px" }}
                  />
                  <Button type="link" size="small" className="mt-2 p-0">
                    Take New Assessment
                  </Button>
                </Card>

                <Card bordered={false} className="bg-gray-50 rounded-xl">
                  <Statistic
                    title="Assessments Completed"
                    value={studentInfo.surveyResults?.length || 0}
                    suffix={
                      studentInfo.surveyResults?.length === 1 ? "test" : "tests"
                    }
                  />
                  <Button type="link" size="small" className="mt-2 p-0">
                    View History
                  </Button>
                </Card>
              </div>

              {/* Assessment cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {renderAssessmentCard(
                  "Anxiety Level",
                  studentInfo.anxietyScore,
                  <BarChartOutlined className="text-custom-green" />
                )}
                {renderAssessmentCard(
                  "Stress Level",
                  studentInfo.stressScore,
                  <ClockCircleOutlined className="text-custom-green" />
                )}
                {renderAssessmentCard(
                  "Depression Score",
                  studentInfo.depressionScore,
                  <HeartOutlined className="text-custom-green" />
                )}
              </div>

              {/* Recommendations */}
              <Card
                title={
                  <div className="flex items-center gap-2">
                    <BulbOutlined className="text-custom-green" />
                    <span>Recommendations</span>
                  </div>
                }
                className="mt-8"
                bordered={false}
              >
                <div className="space-y-4">
                  <p className="text-gray-600">
                    Based on your assessment results, here are some
                    recommendations:
                  </p>
                  <ul className="list-disc pl-5 space-y-2 text-gray-600">
                    <li>
                      Consider joining the "Stress Management" program to learn
                      coping strategies
                    </li>
                    <li>Schedule regular check-ins with your counselor</li>
                    <li>Practice mindfulness exercises daily</li>
                    <li>Maintain a regular sleep schedule</li>
                  </ul>
                </div>
              </Card>
            </div>
          </TabPane>

          <TabPane
            tab={
              <span className="flex items-center gap-2">
                <TeamOutlined />
                <span>Support Programs</span>
              </span>
            }
            key="2"
          >
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold text-gray-900">
                  Active Support Programs
                </h2>
                <Button
                  type="primary"
                  className="bg-custom-green hover:bg-custom-green/90"
                  icon={<TeamOutlined />}
                >
                  Browse All Programs
                </Button>
              </div>

              {programsRecord && programsRecord.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {programsRecord.map((program) => (
                    <Card
                      key={program.programID}
                      className="hover:shadow-lg transition-all cursor-pointer border border-gray-100 rounded-xl overflow-hidden"
                      bodyStyle={{ padding: 0 }}
                      onClick={() => handleProgramClick(program)}
                    >
                      <div className="p-5">
                        <div className="flex justify-between items-start mb-3">
                          <h3 className="text-lg font-medium text-gray-800">
                            {program.title}
                          </h3>
                          <Tag
                            color={program.type === "ONLINE" ? "blue" : "green"}
                            className="rounded-full"
                          >
                            {program.type.charAt(0) +
                              program.type.slice(1).toLowerCase()}
                          </Tag>
                        </div>

                        <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                          {program.description}
                        </p>

                        <div className="grid grid-cols-2 gap-3 mb-4">
                          <div className="flex items-center gap-2">
                            <CalendarOutlined className="text-custom-green" />
                            <span className="text-sm">
                              {new Date(program.startDate).toLocaleDateString()}
                            </span>
                          </div>

                          <div className="flex items-center gap-2">
                            <FieldTimeOutlined className="text-custom-green" />
                            <span className="text-sm">
                              {program.duration} weeks
                            </span>
                          </div>
                        </div>

                        <div className="bg-gray-50 p-3 rounded-lg">
                          <div className="flex justify-between items-center mb-1">
                            <span className="text-sm text-gray-500">
                              Participants
                            </span>
                            <span className="text-sm font-medium">
                              {program.currentParticipants}/
                              {program.maxParticipants}
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-1.5">
                            <div
                              className="bg-custom-green h-1.5 rounded-full"
                              style={{
                                width: `${
                                  (program.currentParticipants /
                                    program.maxParticipants) *
                                  100
                                }%`,
                              }}
                            ></div>
                          </div>
                        </div>
                      </div>

                      <div className="border-t border-gray-100 p-3 bg-gray-50 flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          <UserOutlined className="text-custom-green" />
                          <span className="text-sm text-gray-600">
                            {program.facilitatorName}
                          </span>
                        </div>
                        <Button
                          type="link"
                          className="text-custom-green p-0 flex items-center"
                          onClick={(e) => {
                            e.stopPropagation();
                            window.open(program.meetingLink, "_blank");
                          }}
                        >
                          {program.type === "ONLINE" && (
                            <LinkOutlined className="mr-1" />
                          )}
                          {program.type === "ONLINE"
                            ? "Join Meeting"
                            : "View Details"}
                        </Button>
                      </div>
                    </Card>
                  ))}
                </div>
              ) : (
                <Empty
                  description="No active support programs"
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                />
              )}
            </div>
          </TabPane>

          <TabPane
            tab={
              <span className="flex items-center gap-2">
                <CalendarOutlined />
                <span>Appointments</span>
              </span>
            }
            key="3"
          >
            {renderAppointmentsTab()}
          </TabPane>
        </Tabs>

        {/* Program Details Modal */}
        <Modal
          title={
            <div className="flex items-center gap-3 border-b pb-3">
              <div className="bg-custom-green/10 p-2 rounded-lg">
                <CalendarOutlined className="text-xl text-custom-green" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-800 m-0">
                  Program Details
                </h3>
                <p className="text-sm text-gray-500 m-0">
                  View complete program information
                </p>
              </div>
            </div>
          }
          open={isModalVisible}
          onCancel={() => setIsModalVisible(false)}
          footer={
            <div className="flex justify-end">
              <Button onClick={() => setIsModalVisible(false)}>Close</Button>
              {selectedProgram?.type === "ONLINE" &&
                selectedProgram?.meetingLink && (
                  <Button
                    type="primary"
                    className="bg-custom-green hover:bg-custom-green/90 ml-3"
                    onClick={() =>
                      window.open(selectedProgram.meetingLink, "_blank")
                    }
                  >
                    Join Meeting
                  </Button>
                )}
            </div>
          }
          width={600}
          centered
        >
          {selectedProgram ? (
            <div className="space-y-4 py-2">
              <h2 className="text-xl font-semibold">{selectedProgram.title}</h2>
              <p className="text-gray-600">{selectedProgram.description}</p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Program Date */}
                <div className="bg-gray-50 p-3 rounded-lg">
                  <div className="flex items-center gap-2 mb-1">
                    <CalendarOutlined className="text-custom-green" />
                    <p className="text-gray-500 text-sm">Start Date</p>
                  </div>
                  <p className="font-medium text-sm">
                    {new Date(selectedProgram.startDate).toLocaleDateString(
                      "en-US",
                      {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      }
                    )}
                  </p>
                </div>

                {/* Duration */}
                <div className="bg-gray-50 p-3 rounded-lg">
                  <div className="flex items-center gap-2 mb-1">
                    <FieldTimeOutlined className="text-custom-green" />
                    <p className="text-gray-500 text-sm">Duration</p>
                  </div>
                  <p className="font-medium text-sm">
                    {selectedProgram.duration} weeks
                  </p>
                </div>

                {/* Participants */}
                <div className="bg-gray-50 p-3 rounded-lg">
                  <div className="flex items-center gap-2 mb-1">
                    <TeamOutlined className="text-custom-green" />
                    <p className="text-gray-500 text-sm">Participants</p>
                  </div>
                  <p className="font-medium text-sm">
                    {selectedProgram.currentParticipants}/
                    {selectedProgram.maxParticipants} participants
                  </p>
                  <div className="w-full bg-gray-200 rounded-full h-1.5 mt-2">
                    <div
                      className="bg-custom-green h-1.5 rounded-full"
                      style={{
                        width: `${
                          (selectedProgram.currentParticipants /
                            selectedProgram.maxParticipants) *
                          100
                        }%`,
                      }}
                    ></div>
                  </div>
                </div>

                {/* Type */}
                <div className="bg-gray-50 p-3 rounded-lg">
                  <div className="flex items-center gap-2 mb-1">
                    <i className="text-custom-green" />
                    <p className="text-gray-500 text-sm">Type</p>
                  </div>
                  <Tag
                    color={selectedProgram.type === "ONLINE" ? "blue" : "green"}
                    className="mt-1"
                  >
                    {selectedProgram.type.charAt(0) +
                      selectedProgram.type.slice(1).toLowerCase()}
                  </Tag>
                </div>
              </div>

              {/* Facilitator Info */}
              <div className="bg-gray-50 p-3 rounded-lg">
                <div className="flex items-center">
                  <div className="bg-custom-green/10 p-2 rounded-full mr-3">
                    <UserOutlined className="text-custom-green" />
                  </div>
                  <div>
                    <p className="text-gray-500 text-sm mb-0">Facilitator</p>
                    <p className="font-medium text-sm">
                      {selectedProgram.facilitatorName}
                    </p>
                    <p className="text-xs text-gray-500">
                      {selectedProgram.departmentName}
                    </p>
                  </div>
                </div>
              </div>

              {/* Online Meeting Link */}
              {selectedProgram.type === "ONLINE" &&
                selectedProgram.meetingLink && (
                  <div className="bg-blue-50 p-3 rounded-lg">
                    <p className="text-gray-500 text-sm mb-1">Meeting Link</p>
                    <div className="flex items-center gap-2">
                      <LinkOutlined className="text-custom-green" />
                      <a
                        href={selectedProgram.meetingLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-custom-green hover:text-custom-green/80"
                      >
                        {selectedProgram.meetingLink}
                      </a>
                    </div>
                  </div>
                )}

              {/* Status */}
              <div className="bg-gray-50 p-3 rounded-lg">
                <p className="text-gray-500 text-sm mb-1">Program Status</p>
                <Tag
                  className={`mt-1 ${
                    selectedProgram.status === "ACTIVE"
                      ? "bg-green-50 text-green-700 border-green-200"
                      : selectedProgram.status === "FULL"
                      ? "bg-orange-50 text-orange-700 border-orange-200"
                      : "bg-red-50 text-red-700 border-red-200"
                  }`}
                >
                  {selectedProgram.status.charAt(0) +
                    selectedProgram.status.slice(1).toLowerCase()}
                </Tag>
              </div>

              {/* Tags */}
              {selectedProgram.tags && selectedProgram.tags.length > 0 && (
                <div className="pt-2">
                  <p className="text-gray-500 text-sm mb-2">Program Tags</p>
                  <div className="flex flex-wrap gap-2">
                    {selectedProgram.tags.map((tag) => (
                      <Tag
                        key={tag}
                        className="bg-gray-50 border border-gray-200 text-sm"
                      >
                        {tag}
                      </Tag>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <Empty description="Program details not available" />
          )}
        </Modal>
      </div>
    </div>
  );
};

export default StudentProfile;

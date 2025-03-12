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
  VideoCameraOutlined,
  RightOutlined,
  LinkOutlined,
} from "@ant-design/icons";
import { useUserStore } from "../../stores/userStore";
import { useAuthStore } from "../../stores/authStore";
import { useAppointmentStore } from "../../stores/appointmentStore";
import { useProgramStore } from "../../stores/programStore";
import dayjs from "dayjs";

const { TabPane } = Tabs;

const PsychologistProfile = () => {
  const { user: authUser } = useAuthStore();
  const { getUserDetails, loading: userLoading } = useUserStore();
  const { fetchUpcomingAppointments, loading: appointmentLoading } =
    useAppointmentStore();
  const { fetchFacilitatedPrograms } = useProgramStore();
  const [userData, setUserData] = useState(null);
  const [activeTab, setActiveTab] = useState("1");
  const [upcomingAppointments, setUpcomingAppointments] = useState([]);
  const [facilitatedPrograms, setFacilitatedPrograms] = useState([]);
  const [loadingAppointments, setLoadingAppointments] = useState(false);
  const [loadingPrograms, setLoadingPrograms] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPsychologistDetails = async () => {
      try {
        // For now, we're using a hardcoded ID, but this could be dynamic
        const psychologistId = authUser?.userId || "UID003";
        const data = await getUserDetails(psychologistId);
        setUserData(data);
      } catch (error) {
        console.error("Failed to fetch psychologist details:", error);
      }
    };

    fetchPsychologistDetails();
  }, [getUserDetails, authUser]);

  useEffect(() => {
    // Fetch upcoming appointments when the appointments tab is selected
    if (activeTab === "1" && userData?.psychologistInfo?.psychologistId) {
      fetchAppointments();
    }

    // Fetch facilitated programs when the programs tab is selected
    if (activeTab === "4" && userData?.psychologistInfo?.psychologistId) {
      fetchPrograms();
    }
  }, [activeTab, userData]);

  const fetchAppointments = async () => {
    if (!userData?.psychologistInfo?.psychologistId) return;

    setLoadingAppointments(true);
    try {
      const appointments = await fetchUpcomingAppointments(
        userData.psychologistInfo.psychologistId,
        "psychologist"
      );
      setUpcomingAppointments(appointments);
    } catch (error) {
      console.error("Failed to fetch upcoming appointments:", error);
    } finally {
      setLoadingAppointments(false);
    }
  };

  const fetchPrograms = async () => {
    if (!userData?.psychologistInfo?.psychologistId) return;

    setLoadingPrograms(true);
    try {
      const programs = await fetchFacilitatedPrograms(
        userData.psychologistInfo.psychologistId
      );
      setFacilitatedPrograms(programs);
    } catch (error) {
      console.error("Failed to fetch facilitated programs:", error);
    } finally {
      setLoadingPrograms(false);
    }
  };

  // Function to navigate to appointments page
  const handleNavigateToAppointments = () => {
    navigate("/calendar");
  };

  // Function to navigate to add program page
  const handleNavigateToAddProgram = () => {
    navigate("/add-program");
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

  // Render the programs tab content
  const renderProgramsTab = () => {
    if (loadingPrograms) {
      return (
        <div className="py-10 flex justify-center">
          <Spin size="large" />
        </div>
      );
    }

    if (facilitatedPrograms.length === 0) {
      return (
        <div className="min-h-[300px] flex items-center justify-center">
          <Empty
            description="No programs available"
            image={Empty.PRESENTED_IMAGE_SIMPLE}
          >
            <Button
              type="primary"
              className="bg-custom-green hover:bg-custom-green/90 mt-4"
              onClick={handleNavigateToAddProgram}
            >
              Create First Program
            </Button>
          </Empty>
        </div>
      );
    }

    // Group programs by status
    const activePrograms = facilitatedPrograms.filter(
      (program) => program.status === "ACTIVE"
    );
    const completedPrograms = facilitatedPrograms.filter(
      (program) => program.status === "COMPLETED"
    );

    return (
      <div className="space-y-8">
        {/* Active Programs Section */}
        <div>
          <h3 className="text-lg font-medium text-gray-800 mb-4 flex items-center">
            <Badge status="success" className="mr-2" />
            Active Programs ({activePrograms.length})
          </h3>

          {activePrograms.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {activePrograms.map((program) => (
                <ProgramCard key={program.programID} program={program} />
              ))}
            </div>
          ) : (
            <div className="bg-gray-50 rounded-lg p-4 text-center text-gray-500">
              No active programs at the moment
            </div>
          )}
        </div>

        {/* Completed Programs Section */}
        <div>
          <h3 className="text-lg font-medium text-gray-800 mb-4 flex items-center">
            <Badge status="processing" color="blue" className="mr-2" />
            Completed Programs ({completedPrograms.length})
          </h3>

          {completedPrograms.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {completedPrograms.map((program) => (
                <ProgramCard key={program.programID} program={program} />
              ))}
            </div>
          ) : (
            <div className="bg-gray-50 rounded-lg p-4 text-center text-gray-500">
              No completed programs yet
            </div>
          )}
        </div>
      </div>
    );
  };

  // Program Card Component
  const ProgramCard = ({ program }) => {
    const startDate = dayjs(program.startDate);
    const endDate = startDate.add(program.duration, "week");
    const isActive = program.status === "ACTIVE";
    const participantPercentage =
      (program.currentParticipants / program.maxParticipants) * 100;

    return (
      <Card
        className="hover:shadow-lg transition-all border border-gray-100 rounded-xl overflow-hidden"
        bodyStyle={{ padding: 0 }}
      >
        <div className="p-5">
          <div className="flex justify-between items-start mb-3">
            <h3 className="text-lg font-medium text-gray-800">
              {program.title}
            </h3>
            <Tag
              color={getProgramStatusColor(program.status)}
              className="rounded-full"
            >
              {program.status.charAt(0) + program.status.slice(1).toLowerCase()}
            </Tag>
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
              <span className="text-sm text-gray-500">Weekly Schedule</span>
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
              <span className="text-sm text-gray-500">Participants</span>
              <span className="text-sm font-medium">
                {program.currentParticipants}/{program.maxParticipants}
              </span>
            </div>
            <Progress
              percent={participantPercentage}
              showInfo={false}
              strokeColor="#4a7c59"
              trailColor="#e5e7eb"
              size="small"
            />

            {/* Enrolled students count */}
            <div className="mt-2 text-xs text-gray-500 flex items-center">
              <UserOutlined className="mr-1" />
              <span>{program.enrolled.length} students enrolled</span>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-100 p-3 bg-gray-50 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Tag color="cyan" className="m-0">
              {program.type}
            </Tag>
          </div>
          <div className="flex gap-2">
            {program.type === "ONLINE" && program.meetingLink && (
              <Button
                type="link"
                className="text-custom-green p-0 flex items-center"
                onClick={() => window.open(program.meetingLink, "_blank")}
              >
                <LinkOutlined className="mr-1" />
                Join Meeting
              </Button>
            )}
            <Button
              type="link"
              className="text-custom-green p-0"
              onClick={() => navigate(`/program-details/${program.programID}`)}
            >
              View Details
            </Button>
          </div>
        </div>
      </Card>
    );
  };

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
              onClick={handleNavigateToAppointments}
            >
              View Calendar
            </Button>
          </Empty>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        <List
          className="appointment-list"
          itemLayout="horizontal"
          dataSource={upcomingAppointments}
          renderItem={(appointment) => {
            const appointmentDate = dayjs(appointment.slotDate);
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
                      color={
                        appointment.status === "SCHEDULED"
                          ? "blue"
                          : appointment.status === "IN_PROGRESS"
                          ? "orange"
                          : "green"
                      }
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

                    {/* Student info */}
                    <div className="md:w-1/3 mb-4 md:mb-0">
                      <div className="flex items-center">
                        <Avatar
                          icon={<UserOutlined />}
                          className="bg-custom-green mr-3"
                          size={40}
                        />
                        <div>
                          <div className="text-gray-900 font-medium">
                            {appointment.studentName}
                          </div>
                          <div className="text-gray-500 text-sm">
                            Student ID: {appointment.studentID}
                          </div>
                          <div className="text-gray-400 text-xs mt-1">
                            Booked on {createdDate.format("MMM DD, YYYY")}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="md:w-1/3 flex justify-end items-center">
                      <div className="flex flex-col md:flex-row gap-2">
                        {/* <Button
                          type="primary"
                          icon={<CheckCircleOutlined />}
                          className="bg-custom-green hover:bg-custom-green/90"
                          onClick={() =>
                            navigate(`/check-in/${appointment.appointmentID}`)
                          }
                        >
                          Check In
                        </Button> */}
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

  // Helper function to calculate duration in minutes
  const calculateDuration = (startTime, endTime) => {
    const [startHour, startMinute] = startTime.split(":").map(Number);
    const [endHour, endMinute] = endTime.split(":").map(Number);

    const startMinutes = startHour * 60 + startMinute;
    const endMinutes = endHour * 60 + endMinute;

    return endMinutes - startMinutes;
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
                  onClick={handleNavigateToAppointments}
                >
                  Manage Schedule
                </Button>
              </div>

              {renderAppointmentsTab()}
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
                  onClick={handleNavigateToAddProgram}
                >
                  Create Program
                </Button>
              </div>

              {renderProgramsTab()}
            </div>
          </TabPane>
        </Tabs>
      </div>
    </div>
  );
};

export default PsychologistProfile;

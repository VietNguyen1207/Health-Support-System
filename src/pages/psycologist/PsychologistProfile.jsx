import { useState, useEffect } from "react";
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
  Progress,
  Typography,
  Modal,
  Table,
  Skeleton,
} from "antd";
import {
  UserOutlined,
  MailOutlined,
  PhoneOutlined,
  HomeOutlined,
  CalendarOutlined,
  TrophyOutlined,
  BulbOutlined,
  EditOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  MedicineBoxOutlined,
  BookOutlined,
  LinkOutlined,
  TeamOutlined,
} from "@ant-design/icons";
import { useUserStore } from "../../stores/userStore";
import { useAuthStore } from "../../stores/authStore";
import { useAppointmentStore } from "../../stores/appointmentStore";
import { useProgramStore } from "../../stores/programStore";
import dayjs from "dayjs";
import PropTypes from "prop-types";

const { TabPane } = Tabs;
const { Title, Text } = Typography;

const PsychologistProfile = () => {
  const { user: authUser } = useAuthStore();
  const { getUserDetails } = useUserStore();
  const [userLoading, setUserLoading] = useState(true);
  const { fetchUpcomingAppointments } = useAppointmentStore();
  const { fetchFacilitatedPrograms } = useProgramStore();
  const [userData, setUserData] = useState(null);
  const [activeTab, setActiveTab] = useState("1");
  const [upcomingAppointments, setUpcomingAppointments] = useState([]);
  const [facilitatedPrograms, setFacilitatedPrograms] = useState([]);
  const [loadingAppointments, setLoadingAppointments] = useState(false);
  const [loadingPrograms, setLoadingPrograms] = useState(false);
  const [selectedProgram, setSelectedProgram] = useState(null);
  const [participantsModalVisible, setParticipantsModalVisible] =
    useState(false);
  const [participants, setParticipants] = useState([]);
  const [loadingParticipants, setLoadingParticipants] = useState(false);
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
      } finally {
        setUserLoading(false);
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

  const fetchProgramParticipants = async (programId) => {
    setLoadingParticipants(true);
    try {
      const { fetchProgramParticipants } = useProgramStore.getState();
      const data = await fetchProgramParticipants(programId);
      setParticipants(data);
    } catch (error) {
      console.error("Failed to fetch program participants:", error);
    } finally {
      setLoadingParticipants(false);
    }
  };

  const handleProgramClick = (program) => {
    setSelectedProgram(program);
    setParticipantsModalVisible(true);
    fetchProgramParticipants(program.programID);
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
            Please wait while we fetch your family&apos;s information...
          </Text>
        </div>
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
  // const getStatusColor = (status) => {
  //   switch (status?.toUpperCase()) {
  //     case "ACTIVE":
  //       return "green";
  //     case "AWAY":
  //       return "orange";
  //     case "UNAVAILABLE":
  //       return "red";
  //     default:
  //       return "default";
  //   }
  // };

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
    // const endDate = startDate.add(program.duration, "week");
    // const isActive = program.status === "ACTIVE";
    const participantPercentage =
      (program.currentParticipants / program.maxParticipants) * 100;

    return (
      <Card
        className="hover:shadow-lg transition-all border border-gray-100 rounded-xl overflow-hidden cursor-pointer"
        bodyStyle={{ padding: 0 }}
        onClick={() => handleProgramClick(program)}
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
                onClick={(e) => {
                  e.stopPropagation(); // Prevent card click
                  window.open(program.meetingLink, "_blank");
                }}
              >
                <LinkOutlined className="mr-1" />
                Join Meeting
              </Button>
            )}
            <Button
              type="link"
              className="text-custom-green p-0 flex items-center"
              onClick={(e) => {
                e.stopPropagation(); // Prevent card click
                handleProgramClick(program);
              }}
            >
              <TeamOutlined className="mr-1" />
              View Participants
            </Button>
          </div>
        </div>
      </Card>
    );
  };

  ProgramCard.propTypes = {
    program: PropTypes.object.isRequired,
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
                        {/* <Button
                          type="default"
                          onClick={() =>
                            navigate(
                              `/appointment-details/${appointment.appointmentID}`
                            )
                          }
                        >
                          Details <RightOutlined />
                        </Button> */}
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

  // Add this Participants Modal component
  const ParticipantsModal = () => {
    const columns = [
      {
        title: "Student Name",
        dataIndex: "fullName",
        key: "fullName",
        render: (text, record) => (
          <div className="flex items-center">
            <Avatar
              icon={<UserOutlined />}
              className="mr-2"
              style={{
                backgroundColor:
                  record.gender === "MALE" ? "#1890ff" : "#ff6b81",
              }}
            />
            <div>
              <div className="font-medium">{text}</div>
              <div className="text-xs text-gray-500">
                ID: {record.studentId}
              </div>
            </div>
          </div>
        ),
      },
      {
        title: "Grade",
        dataIndex: "grade",
        key: "grade",
        render: (text, record) => (
          <span>{`Grade ${text} - ${record.className}`}</span>
        ),
      },
      {
        title: "School",
        dataIndex: "schoolName",
        key: "schoolName",
      },
      {
        title: "Assessment Scores",
        key: "scores",
        render: (_, record) => (
          <div className="flex gap-2">
            <Tooltip title="Anxiety Score">
              <Tag color="blue">{`Anxiety: ${record.anxietyScore || 0}`}</Tag>
            </Tooltip>
            <Tooltip title="Depression Score">
              <Tag color="purple">{`Depression: ${
                record.depressionScore || 0
              }`}</Tag>
            </Tooltip>
            <Tooltip title="Stress Score">
              <Tag color="orange">{`Stress: ${record.stressScore || 0}`}</Tag>
            </Tooltip>
          </div>
        ),
      },
      {
        title: "Contact",
        key: "contact",
        render: (_, record) => (
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-1">
              <MailOutlined className="text-gray-400" />
              <span className="text-sm">{record.email}</span>
            </div>
            <div className="flex items-center gap-1">
              <PhoneOutlined className="text-gray-400" />
              <span className="text-sm">{record.phone}</span>
            </div>
          </div>
        ),
      },
    ];

    const ParticipantsSkeletonLoading = () => (
      <div>
        {/* Program Info Skeleton */}
        <div className="mb-4 bg-gray-50 p-4 rounded-lg">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[1, 2, 3].map((item) => (
              <div key={item}>
                <Skeleton.Input style={{ width: 100 }} size="small" active />
                <Skeleton.Input
                  style={{ width: 150, marginTop: 8 }}
                  size="small"
                  active
                />
              </div>
            ))}
          </div>
        </div>

        {/* Participants Header Skeleton */}
        <div className="mb-4">
          <div className="flex items-center justify-between">
            <div>
              <Skeleton.Input style={{ width: 150 }} size="small" active />
              <Skeleton.Input
                style={{ width: 120, marginTop: 8 }}
                size="small"
                active
              />
            </div>
            <div className="flex gap-1">
              {[1, 2, 3].map((item) => (
                <Skeleton.Button
                  key={item}
                  style={{ width: 60, borderRadius: 16 }}
                  size="small"
                  active
                />
              ))}
            </div>
          </div>
        </div>

        {/* Table Skeleton */}
        <Skeleton active>
          <Skeleton.Node active style={{ width: "100%", height: 300 }}>
            <div className="bg-gray-100 h-full w-full rounded-md"></div>
          </Skeleton.Node>
        </Skeleton>
      </div>
    );

    return (
      <Modal
        title={
          <div className="flex items-center gap-2">
            <TeamOutlined className="text-custom-green" />
            <span>{selectedProgram?.title} - Participants</span>
          </div>
        }
        open={participantsModalVisible}
        onCancel={() => setParticipantsModalVisible(false)}
        width={900}
        footer={[
          <Button
            key="close"
            onClick={() => setParticipantsModalVisible(false)}
          >
            Close
          </Button>,
        ]}
      >
        {loadingParticipants ? (
          <ParticipantsSkeletonLoading />
        ) : participants?.enrolled?.length > 0 ? (
          <div>
            <div className="mb-4 bg-gray-50 p-4 rounded-lg">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Text type="secondary">Program</Text>
                  <div className="font-medium">{participants.title}</div>
                </div>
                <div>
                  <Text type="secondary">Facilitator</Text>
                  <div className="font-medium">
                    {participants.facilitatorName}
                  </div>
                </div>
                <div>
                  <Text type="secondary">Department</Text>
                  <div className="font-medium">
                    {participants.departmentName}
                  </div>
                </div>
              </div>
            </div>

            <div className="mb-4">
              <div className="flex items-center justify-between">
                <div>
                  <Text strong>Student Participants</Text>
                  <div className="text-sm text-gray-500">
                    {participants.enrolled.length} students enrolled
                  </div>
                </div>
                {participants.tags && (
                  <div className="flex flex-wrap gap-1">
                    {participants.tags.map((tag) => (
                      <Tag key={tag} color="cyan">
                        {tag}
                      </Tag>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <Table
              dataSource={participants.enrolled}
              columns={columns}
              rowKey="studentId"
              pagination={{ pageSize: 5 }}
              className="border rounded-lg overflow-hidden"
            />
          </div>
        ) : (
          <Empty
            description="No students have enrolled in this program yet"
            image={Empty.PRESENTED_IMAGE_SIMPLE}
          />
        )}
      </Modal>
    );
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
                    <h1 className="text-2xl font-bold text-gray-900 mb-2 text-center md:text-left">
                      {userData.fullName}
                    </h1>

                    <div className="flex flex-wrap gap-2 mb-4 justify-center md:justify-start">
                      {/* <Badge
                        status={getStatusColor(psychologistInfo.status)}
                        text={
                          <span className="text-sm text-gray-500 m-0">
                            {psychologistInfo.status}
                          </span>
                        }
                      /> */}
                      <Tag color="blue">{psychologistInfo.departmentName}</Tag>
                      <Tag color="green">
                        {userData.gender.charAt(0) +
                          userData.gender.slice(1).toLowerCase()}
                      </Tag>
                      <Tag color="cyan">{psychologistInfo.status}</Tag>
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
                      <p className="text-sm text-gray-500 m-0">
                        Psychologist ID
                      </p>
                      <p className="font-medium text-gray-900 m-0">
                        {psychologistInfo.psychologistId}
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
                  View Calendar
                </Button>
              </div>

              {renderAppointmentsTab()}
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

      {/* Add the ParticipantsModal at the end of the component */}
      <ParticipantsModal />
    </div>
  );
};

export default PsychologistProfile;

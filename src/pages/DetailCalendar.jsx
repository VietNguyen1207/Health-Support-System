import {
  Button,
  Modal,
  Space,
  Tabs,
  Tag,
  Typography,
  Card,
  Input,
  Progress,
  notification,
} from "antd";
import PropTypes from "prop-types";
import { useAppointmentStore } from "../stores/appointmentStore";
import { useProgramStore } from "../stores/programStore";
import { LoadingSkeleton } from "../components/ProgramDetailsModal";
import {
  CalendarOutlined,
  CarryOutOutlined,
  FieldTimeOutlined,
  LinkOutlined,
  TeamOutlined,
  UserOutlined,
  CheckOutlined,
  BarChartOutlined,
  ClockCircleOutlined,
  HeartOutlined,
} from "@ant-design/icons";
import { useEffect, useState } from "react";
import { message } from "antd";

const { Text } = Typography;

function DetailCalendar({ user, date, events, visible, onClose, fetchData }) {
  const { GetDetails } = useAppointmentStore();
  const { fetchProgramDetails } = useProgramStore();

  const [isLoading, setIsLoading] = useState(false);
  const [formattedItem, setFormattedItem] = useState([]);

  const formattedProgram = async (id) => {
    try {
      const data = await fetchProgramDetails(id);
      return data;
    } catch (error) {
      console.log("Falied to fetch program detail: ", error);
      // message.error("Failed to program detail");
    }
  };

  const formattedAppointment = async (id) => {
    try {
      const data = await GetDetails(id);
      return data;
    } catch (error) {
      console.log("Falied to fetch appointment detail: ", error);
      // message.error("Failed to fetch appointment detail");
    }
  };

  const fetchFormattedItem = async () => {
    try {
      setIsLoading(true);
      const appointments = events?.appointment || [];
      const programs = events?.program || [];

      const formatAppt = await Promise.all(
        appointments.map(async (appt) => {
          const data = await formattedAppointment(appt.appointmentID);
          if (data)
            return {
              key: data.appointmentID,
              label: `${appt.startTime} - ${
                appt?.psychologistName || appt?.studentName
              }`,
              icon: <UserOutlined />,
              children: (
                <AppointmentDetailContent
                  appointment={data}
                  date={date}
                  key={appt.appointmentID}
                  user={user}
                  fetchData={() => {
                    fetchData();
                    onClose();
                  }}
                />
              ),
            };
        })
      );

      const formatProgram = await Promise.all(
        programs.map(async (program) => {
          const data = await formattedProgram(program.programID);
          if (data)
            return {
              key: data.programID,
              label: `${program.title} - ${program.type}`,
              icon: <CarryOutOutlined />,
              children: (
                <ProgramDetailContent
                  program={data}
                  key={program.programID}
                  user={user}
                />
              ),
            };
        })
      );
      setIsLoading(false);
      setFormattedItem([...formatAppt, ...formatProgram]);
    } catch (error) {
      console.log("Failed to fetch data: ", error);
      // message.error("Failed to fetch data");
    }
  };

  useEffect(() => {
    fetchFormattedItem();
  }, [events]);

  return (
    <Modal
      open={visible}
      onCancel={onClose}
      footer={null}
      width={1000}
      centered
      styles={{
        body: {
          maxHeight: "78vh",
          padding: "5px 50px",
        },
      }}>
      {isLoading ? (
        <LoadingSkeleton />
      ) : formattedItem.length ? (
        <Tabs
          defaultActiveKey="1"
          type="card"
          style={{
            width: "100%",
            fontWeight: 400,
          }}
          items={formattedItem}
        />
      ) : (
        <Text>No events available.</Text>
      )}
    </Modal>
  );
}

// Add prop types validation
DetailCalendar.propTypes = {
  user: PropTypes.object.isRequired,
  date: PropTypes.string.isRequired,
  events: PropTypes.shape({
    appointment: PropTypes.arrayOf(
      PropTypes.shape({
        appointmentID: PropTypes.string.isRequired,
        psychologistID: PropTypes.string.isRequired,
        psychologistName: PropTypes.string.isRequired,
        studentID: PropTypes.string.isRequired,
        studentName: PropTypes.string.isRequired,
        startTime: PropTypes.string.isRequired,
        endTime: PropTypes.string.isRequired,
        status: PropTypes.string.isRequired,
      })
    ).isRequired,
    program: PropTypes.arrayOf(
      PropTypes.shape({
        programID: PropTypes.string.isRequired,
        title: PropTypes.string.isRequired,
        startDate: PropTypes.string.isRequired,
        duration: PropTypes.number.isRequired,
        status: PropTypes.string.isRequired,
        type: PropTypes.string.isRequired,
        meetingLink: PropTypes.string.isRequired,
      })
    ).isRequired,
  }),
  visible: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  fetchData: PropTypes.func.isRequired,
};

const ProgramDetailContent = ({ program, user }) => {
  console.log(user);

  return (
    <div className="space-y-4 w-full overflow-auto h-full">
      {/* Program Header */}
      <div className="border-b pb-3">
        <h2 className="text-xl font-bold text-gray-800 mb-2">
          {program.title}
        </h2>
        <p className="text-gray-600 text-sm">{program.description}</p>
      </div>

      {/* Program Details Grid */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-gray-50 p-3 rounded-lg">
          <div className="flex items-center gap-2 mb-1">
            <CalendarOutlined className="text-primary-green" />
            <p className="text-gray-500 text-sm">Start Date</p>
          </div>
          <p className="font-medium text-sm">
            {new Date(program.startDate).toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </p>
        </div>

        <div className="bg-gray-50 p-3 rounded-lg">
          <div className="flex items-center gap-2 mb-1">
            <FieldTimeOutlined className="text-primary-green" />
            <p className="text-gray-500 text-sm">Duration</p>
          </div>
          <p className="font-medium text-sm">{program.duration} weeks</p>
        </div>

        <div className="bg-gray-50 p-3 rounded-lg">
          <div className="flex items-center gap-2 mb-1">
            <TeamOutlined className="text-primary-green" />
            <p className="text-gray-500 text-sm">Capacity</p>
          </div>
          <p className="font-medium text-sm">
            {program?.numberParticipants} participants
          </p>
        </div>

        <div className="bg-gray-50 p-3 rounded-lg">
          <div className="flex items-center gap-2 mb-1">
            <i className="text-primary-green" />
            <p className="text-gray-500 text-sm">Type</p>
          </div>
          <Tag
            color={program.type === "Online" ? "blue" : "green"}
            className="mt-1">
            {program.type}
          </Tag>
        </div>
      </div>

      {/* Facilitator Info */}
      <div className="bg-gray-50 p-3 rounded-lg">
        <div className="flex items-center">
          <div className="bg-primary-green/10 p-2 rounded-full mr-3">
            <TeamOutlined className="text-primary-green" />
          </div>
          <div>
            <p className="text-gray-500 text-sm mb-0">Facilitator</p>
            <p className="font-medium text-sm">{program.facilitatorName}</p>
            <p className="text-xs text-gray-500">{program.departmentName}</p>
          </div>
        </div>
      </div>

      {/* Online Meeting Link - Fixed to prevent nested anchors */}
      {program.type === "Online" && program.meetingLink && (
        <div className="bg-blue-50 p-3 rounded-lg">
          <p className="text-gray-500 text-sm mb-1">Meeting Link</p>
          <div className="flex items-center gap-2">
            <LinkOutlined className="text-primary-green" />
            <Button
              type="link"
              href={program.meetingLink}
              target="_blank"
              rel="noopener noreferrer"
              className="p-0 h-auto text-primary-green hover:text-primary-green/80">
              Join Meeting
            </Button>
          </div>
        </div>
      )}

      {/* Tags */}
      {program.tags && program.tags.length > 0 && (
        <div className="pt-2">
          <Space wrap size={[0, 8]}>
            {program.tags.map((tag) => (
              <Tag
                key={tag}
                className="bg-gray-50 border border-gray-200 text-sm">
                {tag}
              </Tag>
            ))}
          </Space>
        </div>
      )}
    </div>
  );
};

const AppointmentDetailContent = ({ appointment, date, user, fetchData }) => {
  const {
    checkInAppointment,
    checkOutAppointment,
    appointmentStatus,
    clearAppointmentStatus,
    cancelAppointment,
  } = useAppointmentStore();
  const [isLoading, setIsLoading] = useState(false);
  const [notes, setNotes] = useState("");

  // Add these state variables for the cancel modal
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [cancelReason, setCancelReason] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Determine if appointment is in progress
  const isInProgress =
    appointmentStatus === "IN_PROGRESS" ||
    appointment?.status === "IN_PROGRESS";

  // Check if the appointment date has arrived
  const isAppointmentDateValid = () => {
    // Get the appointment date from the timeSlot
    const appointmentDate = new Date(date);
    // console.log(date);

    appointmentDate.setHours(0, 0, 0, 0); // Set to beginning of day

    // Get today's date
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Set to beginning of day

    // Return true if today is the same day or after the appointment date
    return today >= appointmentDate;
  };

  // Handle check-in
  const handleCheckIn = async () => {
    // Validate appointment date
    if (!isAppointmentDateValid()) {
      return message.error("Cannot check in before the appointment date");
    }

    try {
      setIsLoading(true);
      await checkInAppointment(appointment?.appointmentID);
      message.success("Student checked in successfully!");
    } catch (error) {
      message.error("Failed to check in student");
      console.log("Failed to check in student:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle check-out
  const handleCheckOut = async () => {
    // Validate appointment date
    if (!isAppointmentDateValid()) {
      return message.error("Cannot check out before the appointment date");
    }

    try {
      setIsLoading(true);
      await checkOutAppointment(appointment.appointmentID, notes || "No note");
      message.success("Appointment completed successfully!");
      fetchData();
      clearAppointmentStatus();
    } catch (error) {
      message.error("Failed to check out appointment");
      console.log("Failed to check out student:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Show cancel modal
  const showCancelModal = () => {
    setIsModalVisible(true);
  };

  // Handle cancel appointment
  const handleCancel = async () => {
    if (!cancelReason.trim()) {
      notification.error({
        message: "Reason Required",
        description: "Please provide a reason for cancellation.",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      await cancelAppointment(appointment.appointmentID, cancelReason);
      notification.success({
        message: "Appointment Cancelled",
        description: "Your appointment has been successfully cancelled.",
      });
      setIsModalVisible(false);
      setCancelReason("");
      fetchData(); // Refresh data after cancellation
    } catch (error) {
      notification.error({
        message: "Cancellation Failed",
        description:
          error.message || "Failed to cancel appointment. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Clean up on unmount
  useEffect(() => {
    return () => {
      clearAppointmentStatus();
    };
  }, [clearAppointmentStatus]);

  const scores = [
    {
      title: "Anxiety Level",
      score: appointment.studentResponse.anxietyScore,
      type: "anxiety",
    },
    {
      title: "Stress Level",
      score: appointment.studentResponse.stressScore,
      type: "stress",
    },
    {
      title: "Depression Level",
      score: appointment.studentResponse.depressionScore,
      type: "depression",
    },
  ];

  const getIndicatorColor = (score, type) => {
    switch (type) {
      case "anxiety":
        // Anxiety (max 21): 0-7 low, 8-14 moderate, 15-21 high
        if (score <= 7) return "#4a7c59"; // Green - Low
        if (score <= 14) return "#fbbf24"; // Yellow - Moderate
        return "#ef4444"; // Red - High

      case "depression":
        // Depression (max 28): 0-9 low, 10-18 moderate, 19-28 high
        if (score <= 9) return "#4a7c59"; // Green - Low
        if (score <= 18) return "#fbbf24"; // Yellow - Moderate
        return "#ef4444"; // Red - High

      case "stress":
        // Stress (max 40): 0-14 low, 15-25 moderate, 26-40 high
        if (score <= 14) return "#4a7c59"; // Green - Low
        if (score <= 25) return "#fbbf24"; // Yellow - Moderate
        return "#ef4444"; // Red - High

      default:
        // Default fallback
        if (score <= 30) return "#4a7c59";
        if (score <= 60) return "#fbbf24";
        return "#ef4444";
    }
  };

  const getIndicatorText = (score, type) => {
    switch (type) {
      case "anxiety":
        if (score <= 7) return "Low";
        if (score <= 14) return "Moderate";
        return "High";

      case "depression":
        if (score <= 9) return "Low";
        if (score <= 18) return "Moderate";
        return "High";

      case "stress":
        if (score <= 14) return "Low";
        if (score <= 25) return "Moderate";
        return "High";

      default:
        if (score <= 30) return "Low";
        if (score <= 60) return "Moderate";
        return "High";
    }
  };

  const renderAssessmentCard = (title, score, icon, type, maxScore) => {
    // Determine max score based on type if not provided
    if (!maxScore) {
      switch (type) {
        case "anxiety":
          maxScore = 21;
          break;
        case "depression":
          maxScore = 28;
          break;
        case "stress":
          maxScore = 40;
          break;
        default:
          maxScore = 10;
      }
    }

    return (
      <Card className="assessment-card bg-white rounded-xl shadow-sm hover:shadow-md transition-all">
        <div className="flex items-center mb-4">
          <div className="bg-custom-green/10 p-2 rounded-full mr-3">{icon}</div>
          <h3 className="text-lg font-semibold text-gray-900 m-0">{title}</h3>
        </div>

        <div className="flex items-center justify-between">
          <Progress
            type="circle"
            percent={(score / maxScore) * 100}
            strokeColor={getIndicatorColor(score, type)}
            strokeWidth={10}
            size={80}
            format={() => <span className="text-lg">{score}</span>}
          />
          <div className="text-right">
            <span className="text-sm text-gray-500">Level</span>
            <div
              className={`mt-1 px-3 py-1 rounded-full text-sm font-medium inline-block
                ${
                  getIndicatorText(score, type) === "Low"
                    ? "bg-green-50 text-green-700"
                    : getIndicatorText(score, type) === "Moderate"
                    ? "bg-yellow-50 text-yellow-700"
                    : "bg-red-50 text-red-700"
                }`}>
              {getIndicatorText(score, type)}
            </div>
          </div>
        </div>

        <div className="flex justify-between items-center mt-4">
          <p className="text-xs text-gray-500 mb-0">
            Last updated: {new Date().toLocaleDateString()}
          </p>
          <p className="text-xs text-gray-500 mb-0">
            Score: {score}/{maxScore}
          </p>
        </div>
      </Card>
    );
  };

  // Check if appointment date is valid for checking-in student
  const canPerformActions = isAppointmentDateValid();

  return (
    <div className="space-y-4 max-h-[69vh] overflow-auto pr-5">
      {/* Status and Action Section */}
      <div className="flex items-center justify-between mb-4 bg-white p-4 rounded-lg shadow-sm">
        <div>
          <h2 className="text-xl font-bold mb-2">Appointment Details</h2>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500">Status:</span>
            <Tag
              color={
                isInProgress
                  ? "processing"
                  : appointment.status === "COMPLETED"
                  ? "success"
                  : "default"
              }>
              {isInProgress
                ? "In Progress"
                : appointment.status === "COMPLETED"
                ? "Completed"
                : "Scheduled"}
            </Tag>

            {!canPerformActions && appointment.status !== "COMPLETED" && (
              <Tag color="warning">
                Available on {new Date(date).toLocaleDateString()}
              </Tag>
            )}
          </div>
        </div>

        {user.role === "psychologist" ? (
          <div className="flex gap-3">
            {!isInProgress && appointment.status !== "COMPLETED" && (
              <Button
                type="primary"
                icon={<UserOutlined />}
                onClick={handleCheckIn}
                loading={isLoading}
                disabled={!canPerformActions}
                title={
                  !canPerformActions
                    ? "Cannot check in before appointment date"
                    : ""
                }>
                Check-in Student
              </Button>
            )}

            {isInProgress && (
              <Button
                type="primary"
                icon={<CheckOutlined />}
                onClick={handleCheckOut}
                loading={isLoading}
                disabled={!canPerformActions}
                title={
                  !canPerformActions
                    ? "Cannot check out before appointment date"
                    : ""
                }>
                Complete & Check-out
              </Button>
            )}
          </div>
        ) : (
          user.role === "student" &&
          !isInProgress && (
            <>
              <Button danger onClick={showCancelModal}>
                Cancel
              </Button>
              <Modal
                title="Cancel Appointment"
                open={isModalVisible}
                onOk={handleCancel}
                onCancel={() => {
                  setIsModalVisible(false);
                  setCancelReason("");
                }}
                okText="Confirm Cancellation"
                cancelText="Keep Appointment"
                okButtonProps={{ danger: true, loading: isSubmitting }}>
                <p>Are you sure you want to cancel this appointment?</p>
                <div style={{ marginTop: 16 }}>
                  <label
                    htmlFor="cancelReason"
                    style={{ display: "block", marginBottom: 8 }}>
                    Please provide a reason for cancellation:
                  </label>
                  <Input.TextArea
                    id="cancelReason"
                    rows={4}
                    value={cancelReason}
                    onChange={(e) => setCancelReason(e.target.value)}
                    placeholder="Enter your reason for cancellation..."
                  />
                </div>
              </Modal>
            </>
          )
        )}
      </div>

      {/* Psychologist and Student Information Cards */}
      <div className="grid grid-flow-col gap-4">
        {user.role !== "psychologist" && (
          <Card
            title={
              <div className="flex items-center gap-2">
                <UserOutlined className="text-primary-green text-lg" />
                <span className="font-semibold">Psychologist Information</span>
              </div>
            }
            className="bg-white shadow-sm hover:shadow-md transition-shadow duration-200 h-full">
            <div className="space-y-3">
              <div className="flex items-center gap-2 p-2 bg-gray-50 rounded-md">
                <div className="w-28 text-gray-500">Name</div>
                <div className="font-medium">
                  {appointment.psychologistResponse.info.fullName}
                </div>
              </div>

              <div className="flex items-center gap-2 p-2 bg-gray-50 rounded-md">
                <div className="w-28 text-gray-500">Department</div>
                <div className="font-medium">
                  {appointment.psychologistResponse.departmentName}
                </div>
              </div>

              <div className="flex items-center gap-2 p-2 bg-gray-50 rounded-md">
                <div className="w-28 text-gray-500">Experience</div>
                <div className="font-medium">
                  {appointment.psychologistResponse.yearsOfExperience} years
                </div>
              </div>
            </div>
          </Card>
        )}

        {user.role !== "student" && (
          <Card
            title={
              <div className="flex items-center gap-2">
                <TeamOutlined className="text-primary-green text-lg" />
                <span className="font-semibold">Student Information</span>
              </div>
            }
            className="bg-white shadow-sm hover:shadow-md transition-shadow duration-200 h-full">
            <div className="space-y-3">
              <div className="flex items-center gap-2 p-2 bg-gray-50 rounded-md">
                <div className="w-28 text-gray-500">Name</div>
                <div className="font-medium">
                  {appointment.studentResponse.info.fullName}
                </div>
              </div>

              <div className="flex items-center gap-2 p-2 bg-gray-50 rounded-md">
                <div className="w-28 text-gray-500">Grade</div>
                <div className="font-medium">
                  {appointment.studentResponse.grade}
                </div>
              </div>

              <div className="flex items-center gap-2 p-2 bg-gray-50 rounded-md">
                <div className="w-28 text-gray-500">School</div>
                <div className="font-medium">
                  {appointment.studentResponse.schoolName}
                </div>
              </div>
            </div>
            {/* Scores Card */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {renderAssessmentCard(
                "Anxiety Level",
                appointment.studentResponse.anxietyScore,
                <BarChartOutlined className="text-custom-green" />,
                "anxiety",
                21
              )}
              {renderAssessmentCard(
                "Stress Level",
                appointment.studentResponse.stressScore,
                <ClockCircleOutlined className="text-custom-green" />,
                "stress",
                40
              )}
              {renderAssessmentCard(
                "Depression Level",
                appointment.studentResponse.depressionScore,
                <HeartOutlined className="text-custom-green" />,
                "depression",
                28
              )}
            </div>
          </Card>
        )}
      </div>

      {/* Session Notes - Only visible when checked in */}
      {user.role === "psychologist" && isInProgress && (
        <Card
          title="Session Notes"
          className="bg-white"
          extra={
            <Tag color="processing" className="mr-0">
              Current Session
            </Tag>
          }>
          <div className="space-y-4">
            <Input.TextArea
              placeholder="Enter session notes here..."
              rows={4}
              className="w-full"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>
        </Card>
      )}
    </div>
  );
};

ProgramDetailContent.propTypes = {
  user: PropTypes.object.isRequired,
  program: PropTypes.shape({
    programID: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    description: PropTypes.string.isRequired,
    startDate: PropTypes.string.isRequired,
    duration: PropTypes.number.isRequired,
    status: PropTypes.string.isRequired,
    facilitatorName: PropTypes.string.isRequired,
    departmentName: PropTypes.string.isRequired,
    numberParticipants: PropTypes.string,
    tags: PropTypes.arrayOf(PropTypes.string).isRequired,
    type: PropTypes.string.isRequired,
    meetingLink: PropTypes.string.isRequired,
  }).isRequired,
};

// Update PropTypes
AppointmentDetailContent.propTypes = {
  user: PropTypes.object.isRequired,
  date: PropTypes.string.isRequired,
  appointment: PropTypes.shape({
    appointmentID: PropTypes.string.isRequired,
    timeSlotID: PropTypes.string.isRequired,
    studentResponse: PropTypes.shape({
      studentId: PropTypes.string.isRequired,
      grade: PropTypes.number.isRequired,
      className: PropTypes.string.isRequired,
      schoolName: PropTypes.string.isRequired,
      depressionScore: PropTypes.number.isRequired,
      anxietyScore: PropTypes.number.isRequired,
      stressScore: PropTypes.number.isRequired,
      info: PropTypes.shape({
        userId: PropTypes.string.isRequired,
        fullName: PropTypes.string.isRequired,
        email: PropTypes.string.isRequired,
        phoneNumber: PropTypes.string.isRequired,
        address: PropTypes.string.isRequired,
        gender: PropTypes.string.isRequired,
        role: PropTypes.string.isRequired,
      }).isRequired,
    }).isRequired,
    psychologistResponse: PropTypes.shape({
      psychologistId: PropTypes.string.isRequired,
      departmentName: PropTypes.string.isRequired,
      yearsOfExperience: PropTypes.number.isRequired,
      status: PropTypes.string.isRequired,
      info: PropTypes.shape({
        userId: PropTypes.string.isRequired,
        fullName: PropTypes.string.isRequired,
        email: PropTypes.string.isRequired,
        phoneNumber: PropTypes.string.isRequired,
        address: PropTypes.string.isRequired,
        gender: PropTypes.string.isRequired,
        role: PropTypes.string.isRequired,
      }).isRequired,
    }).isRequired,
    status: PropTypes.oneOf(["SCHEDULED", "IN_PROGRESS", "COMPLETED"])
      .isRequired,
    createdAt: PropTypes.string.isRequired,
    updatedAt: PropTypes.string.isRequired,
  }).isRequired,
  fetchData: PropTypes.func.isRequired,
};

export default DetailCalendar;

import { Button, Modal, Space, Tabs, Tag, Typography, Card, Input } from "antd";
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
} from "@ant-design/icons";
import { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from "recharts";
import { message } from "antd";

const { Text } = Typography;

function DetailCalendar({ events, visible, onClose }) {
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

  useEffect(() => {
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
                    key={appt.appointmentID}
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
      }}
    >
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
};

const ProgramDetailContent = ({ program }) => {
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
            className="mt-1"
          >
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
              className="p-0 h-auto text-primary-green hover:text-primary-green/80"
            >
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
                className="bg-gray-50 border border-gray-200 text-sm"
              >
                {tag}
              </Tag>
            ))}
          </Space>
        </div>
      )}
    </div>
  );
};

ProgramDetailContent.propTypes = {
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

const AppointmentDetailContent = ({ appointment }) => {
  const { checkInAppointment, appointmentStatus, clearAppointmentStatus } =
    useAppointmentStore();
  const [isLoading, setIsLoading] = useState(false);

  // Handle check-in
  const handleCheckIn = async () => {
    try {
      setIsLoading(true);
      await checkInAppointment(appointment.appointmentID);
      message.success("Student checked in successfully!");
    } catch (error) {
      message.error("Failed to check in student");
    } finally {
      setIsLoading(false);
    }
  };

  // Handle check-out
  const handleCheckOut = () => {
    message.success("Appointment completed successfully!");
    clearAppointmentStatus(); // Clear the status when checking out
    // TODO: Implement API call to update appointment status to "Completed"
  };

  // Clean up on unmount
  useEffect(() => {
    return () => {
      clearAppointmentStatus();
    };
  }, [clearAppointmentStatus]);

  // Determine if appointment is in progress
  const isInProgress =
    appointmentStatus === "IN_PROGRESS" || appointment.status === "IN_PROGRESS";

  const calculatePercentage = (score) => score * 10;

  const getScoreColor = (score) => {
    if (score <= 25) return "#4CAF50"; // Xanh lá - Mức độ nhẹ
    if (score <= 50) return "#FFC107"; // Vàng - Mức độ trung bình
    return "#F44336"; // Đỏ - Mức độ nặng
  };

  const data = [
    {
      name: "Depression Score",
      score: calculatePercentage(appointment.studentResponse.depressionScore),
      fill: getScoreColor(
        calculatePercentage(appointment.studentResponse.depressionScore)
      ),
    },
    {
      name: "Anxiety Score",
      score: calculatePercentage(appointment.studentResponse.anxietyScore),
      fill: getScoreColor(
        calculatePercentage(appointment.studentResponse.anxietyScore)
      ),
    },
    {
      name: "Stress Score",
      score: calculatePercentage(appointment.studentResponse.stressScore),
      fill: getScoreColor(
        calculatePercentage(appointment.studentResponse.stressScore)
      ),
    },
  ];

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
              }
            >
              {isInProgress
                ? "In Progress"
                : appointment.status === "COMPLETED"
                ? "Completed"
                : "Scheduled"}
            </Tag>
          </div>
        </div>

        <div className="flex gap-3">
          {!isInProgress && appointment.status !== "COMPLETED" && (
            <Button
              type="primary"
              className="bg-blue-500 hover:bg-blue-600"
              icon={<UserOutlined />}
              onClick={handleCheckIn}
              loading={isLoading}
            >
              Check-in Student
            </Button>
          )}

          {isInProgress && (
            <Button
              type="primary"
              className="bg-primary-green hover:bg-primary-green/90"
              icon={<CheckOutlined />}
              onClick={handleCheckOut}
            >
              Complete & Check-out
            </Button>
          )}
        </div>
      </div>

      {/* Psychologist and Student Information Cards */}
      <div className="grid grid-cols-2 gap-4">
        <Card
          title={
            <div className="flex items-center gap-2">
              <UserOutlined className="text-primary-green text-lg" />
              <span className="font-semibold">Psychologist Information</span>
            </div>
          }
          className="bg-white shadow-sm hover:shadow-md transition-shadow duration-200"
        >
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

        <Card
          title={
            <div className="flex items-center gap-2">
              <TeamOutlined className="text-primary-green text-lg" />
              <span className="font-semibold">Student Information</span>
            </div>
          }
          className="bg-white shadow-sm hover:shadow-md transition-shadow duration-200"
        >
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
        </Card>
      </div>

      {/* Scores Card */}
      <Card
        title={
          <div className="flex items-center justify-between">
            <span>Assessment Scores</span>
            {isInProgress && (
              <Tag color="processing" className="ml-2">
                Session in Progress
              </Tag>
            )}
          </div>
        }
        className="bg-gray-50"
        styles={{
          title: {
            textAlign: "start",
            flex: 1,
          },
          body: {
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          },
        }}
      >
        <BarChart width={700} height={300} data={data}>
          <XAxis dataKey="name" />
          <YAxis domain={[0, 100]} ticks={[0, 25, 50, 75, 100]} />
          <Tooltip />
          <CartesianGrid strokeDasharray="3 3" />
          <Legend />
          <Bar dataKey="score" name="Score (%)" fill={(entry) => entry.fill} />
        </BarChart>
      </Card>

      {/* Session Notes - Only visible when checked in */}
      {isInProgress && (
        <Card
          title="Session Notes"
          className="bg-white"
          extra={
            <Tag color="processing" className="mr-0">
              Current Session
            </Tag>
          }
        >
          <div className="space-y-4">
            <Input.TextArea
              placeholder="Enter session notes here..."
              rows={4}
              className="w-full"
            />
            <div className="flex justify-end">
              <Button type="primary" className="bg-primary-green">
                Save Notes
              </Button>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};

// Update PropTypes
AppointmentDetailContent.propTypes = {
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
    status: PropTypes.oneOf(["Scheduled", "In Progress", "Completed"])
      .isRequired,
    createdAt: PropTypes.string.isRequired,
    updatedAt: PropTypes.string.isRequired,
  }).isRequired,
};

export default DetailCalendar;

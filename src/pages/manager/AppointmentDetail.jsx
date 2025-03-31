import {
  Modal,
  Descriptions,
  Tag,
  Card,
  Row,
  Col,
  Typography,
  Divider,
  Badge,
  Alert,
  Progress,
} from "antd";
import dayjs from "dayjs";
import PropTypes from "prop-types";
import {
  CalendarOutlined,
  ClockCircleOutlined,
  UserOutlined,
  MailOutlined,
  PhoneOutlined,
  EnvironmentOutlined,
  IdcardOutlined,
  BookOutlined,
  TrophyOutlined,
  FileTextOutlined,
  ExclamationCircleOutlined,
  InfoCircleOutlined,
  BarChartOutlined,
  HeartOutlined,
  CheckCircleOutlined,
} from "@ant-design/icons";

const { Text, Title } = Typography;

function AppointmentDetail({ open, onClose, appointmentData }) {
  if (!appointmentData) return null;

  const getStatusColor = (status) => {
    const colors = {
      SCHEDULED: "blue",
      COMPLETED: "green",
      CANCELLED: "red",
      IN_PROGRESS: "orange",
      default: "default",
    };
    return colors[status] || colors.default;
  };

  // Format for better UI
  const formatDate = (date) => {
    if (!date) return "N/A";
    return dayjs(date).format("MMM DD, YYYY");
  };

  const formatDateTime = (date) => {
    if (!date) return "N/A";
    return dayjs(date).format("MMM DD, YYYY - HH:mm");
  };

  // The data structure has changed, so we need to adapt our rendering
  // Check if we have the new flattened structure or the older nested structure
  const isNewFormat =
    appointmentData.studentResponse && !appointmentData.studentResponse.info;

  // Extract student and psychologist info based on format
  const studentInfo = isNewFormat
    ? appointmentData.studentResponse
    : appointmentData.studentResponse?.info || {};

  const psychologistInfo = isNewFormat
    ? appointmentData.psychologistResponse
    : appointmentData.psychologistResponse?.info || {};

  // Get assessment scores - handle both formats
  const assessmentScores = {
    anxietyScore: isNewFormat
      ? studentInfo.anxietyScore
      : appointmentData.studentResponse?.anxietyScore || 0,
    depressionScore: isNewFormat
      ? studentInfo.depressionScore
      : appointmentData.studentResponse?.depressionScore || 0,
    stressScore: isNewFormat
      ? studentInfo.stressScore
      : appointmentData.studentResponse?.stressScore || 0,
  };

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

  return (
    <Modal
      title={
        <div className="flex items-center gap-2">
          <CalendarOutlined className="text-custom-green" />
          <span>Appointment Details</span>
        </div>
      }
      open={open}
      onCancel={onClose}
      width={900}
      className="appointment-detail-modal"
      footer={null}
    >
      <div className="space-y-6">
        {/* Appointment Summary Card */}
        <Card className="bg-gray-50 border-0">
          <div className="flex flex-col md:flex-row gap-6 justify-between">
            <div>
              <Text type="secondary">ID</Text>
              <div className="font-medium">{appointmentData.appointmentID}</div>
            </div>
            <div>
              <Text type="secondary">Status</Text>
              <div>
                <Tag
                  color={getStatusColor(appointmentData.status)}
                  className="px-3 py-1 mt-1 text-sm"
                >
                  {appointmentData.status}
                </Tag>
              </div>
            </div>
            <div>
              <Text type="secondary">Date</Text>
              <div className="font-medium">
                <CalendarOutlined className="mr-2 text-green-500" />
                {formatDate(
                  appointmentData.slotDate || appointmentData.createdAt
                )}
              </div>
            </div>
            <div>
              <Text type="secondary">Time</Text>
              <div className="font-medium">
                <ClockCircleOutlined className="mr-2 text-blue-500" />
                {`${appointmentData.startTime} - ${appointmentData.endTime}`}
              </div>
            </div>
            <div>
              <Text type="secondary">Last Updated</Text>
              <div className="text-sm text-gray-500">
                {formatDateTime(appointmentData.updatedAt)}
              </div>
            </div>
          </div>
        </Card>

        {/* People involved in the appointment - Section 1 */}
        <Row gutter={16}>
          {/* Student Info */}
          <Col xs={24} md={12}>
            <Card
              title={
                <div className="flex items-center gap-2">
                  <UserOutlined className="text-blue-500" />
                  <span>Student Information</span>
                </div>
              }
              className="h-full"
            >
              <div className="space-y-4">
                <div>
                  <Text type="secondary" className="block mb-1">
                    Personal Details
                  </Text>
                  <div className="font-medium text-lg">
                    {isNewFormat ? studentInfo.fullName : studentInfo.fullName}
                  </div>
                  <div className="flex gap-2 text-sm text-gray-500 mt-1">
                    <IdcardOutlined />
                    <span>
                      {appointmentData.studentID || studentInfo.studentId}
                    </span>
                  </div>
                </div>

                <Divider className="my-3" />

                <div>
                  <Text type="secondary" className="block mb-1">
                    Contact Information
                  </Text>
                  <div className="flex gap-2 items-center mb-2">
                    <MailOutlined className="text-gray-400" />
                    <Text copyable>{studentInfo.email}</Text>
                  </div>
                  <div className="flex gap-2 items-center">
                    <PhoneOutlined className="text-gray-400" />
                    <Text copyable>
                      {studentInfo.phone || studentInfo.phoneNumber}
                    </Text>
                  </div>
                </div>

                <Divider className="my-3" />

                <div>
                  <Text type="secondary" className="block mb-1">
                    School Information
                  </Text>
                  <div className="flex gap-2 items-center mb-2">
                    <BookOutlined className="text-gray-400" />
                    <Text>
                      Grade {studentInfo.grade} - {studentInfo.className}
                    </Text>
                  </div>
                  <div className="flex gap-2 items-center">
                    <EnvironmentOutlined className="text-gray-400" />
                    <Text>{studentInfo.schoolName}</Text>
                  </div>
                </div>
              </div>
            </Card>
          </Col>

          {/* Psychologist Info */}
          <Col xs={24} md={12}>
            <Card
              title={
                <div className="flex items-center gap-2">
                  <UserOutlined className="text-green-500" />
                  <span>Psychologist Information</span>
                </div>
              }
              className="h-full"
            >
              <div className="space-y-4">
                <div>
                  <Text type="secondary" className="block mb-1">
                    Personal Details
                  </Text>
                  <div className="font-medium text-lg">
                    {psychologistInfo.fullName ||
                      psychologistInfo.name ||
                      appointmentData.psychologistName}
                  </div>
                  <div className="flex gap-2 text-sm text-gray-500 mt-1">
                    <IdcardOutlined />
                    <span>
                      {appointmentData.psychologistID ||
                        psychologistInfo.psychologistId}
                    </span>
                  </div>
                </div>

                <Divider className="my-3" />

                {psychologistInfo.email && (
                  <div>
                    <Text type="secondary" className="block mb-1">
                      Contact Information
                    </Text>
                    {psychologistInfo.email && (
                      <div className="flex gap-2 items-center mb-2">
                        <MailOutlined className="text-gray-400" />
                        <Text copyable>{psychologistInfo.email}</Text>
                      </div>
                    )}
                    {(psychologistInfo.phone ||
                      psychologistInfo.phoneNumber) && (
                      <div className="flex gap-2 items-center">
                        <PhoneOutlined className="text-gray-400" />
                        <Text copyable>
                          {psychologistInfo.phone ||
                            psychologistInfo.phoneNumber}
                        </Text>
                      </div>
                    )}
                    <Divider className="my-3" />
                  </div>
                )}

                <div>
                  <Text type="secondary" className="block mb-1">
                    Professional Information
                  </Text>
                  <div className="flex gap-2 items-center mb-2">
                    <EnvironmentOutlined className="text-gray-400" />
                    <Text>
                      {appointmentData.psychologistResponse?.departmentName}
                    </Text>
                  </div>
                  <div className="flex gap-2 items-center">
                    <TrophyOutlined className="text-gray-400" />
                    <Text>
                      {appointmentData.psychologistResponse?.yearsOfExperience}{" "}
                      years of experience
                    </Text>
                  </div>
                </div>
              </div>
            </Card>
          </Col>
        </Row>

        {/* Assessment Scores - Section 2 */}
        {(assessmentScores.anxietyScore > 0 ||
          assessmentScores.depressionScore > 0 ||
          assessmentScores.stressScore > 0) && (
          <Card
            title={
              <div className="flex items-center gap-2">
                <FileTextOutlined className="text-orange-500" />
                <span>Assessment Results</span>
              </div>
            }
          >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Anxiety Score */}
              <Card
                className="bg-blue-50 border-0 rounded-xl shadow-sm"
                bodyStyle={{ padding: "16px" }}
              >
                <div className="flex items-center mb-4">
                  <div className="bg-blue-100 p-2 rounded-full mr-3">
                    <BarChartOutlined className="text-blue-600" />
                  </div>
                  <Text className="font-medium">Anxiety Level</Text>
                </div>

                <div className="flex items-center justify-between">
                  <Progress
                    type="circle"
                    percent={(assessmentScores.anxietyScore / 21) * 100}
                    strokeColor={getIndicatorColor(
                      assessmentScores.anxietyScore,
                      "anxiety"
                    )}
                    strokeWidth={10}
                    size={80}
                    format={() => (
                      <span className="text-lg">
                        {assessmentScores.anxietyScore}
                      </span>
                    )}
                  />
                  <div className="text-right">
                    <span className="text-sm text-gray-500">Level</span>
                    <div
                      className={`mt-1 px-3 py-1 rounded-full text-sm font-medium inline-block
                        ${
                          getIndicatorText(
                            assessmentScores.anxietyScore,
                            "anxiety"
                          ) === "Low"
                            ? "bg-green-50 text-green-700"
                            : getIndicatorText(
                                assessmentScores.anxietyScore,
                                "anxiety"
                              ) === "Moderate"
                            ? "bg-yellow-50 text-yellow-700"
                            : "bg-red-50 text-red-700"
                        }`}
                    >
                      {getIndicatorText(
                        assessmentScores.anxietyScore,
                        "anxiety"
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex justify-between items-center mt-4">
                  <Text type="secondary" className="text-xs">
                    Score: {assessmentScores.anxietyScore}/21
                  </Text>
                </div>
              </Card>

              {/* Depression Score */}
              <Card
                className="bg-purple-50 border-0 rounded-xl shadow-sm"
                bodyStyle={{ padding: "16px" }}
              >
                <div className="flex items-center mb-4">
                  <div className="bg-purple-100 p-2 rounded-full mr-3">
                    <HeartOutlined className="text-purple-600" />
                  </div>
                  <Text className="font-medium">Depression Level</Text>
                </div>

                <div className="flex items-center justify-between">
                  <Progress
                    type="circle"
                    percent={(assessmentScores.depressionScore / 27) * 100}
                    strokeColor={getIndicatorColor(
                      assessmentScores.depressionScore,
                      "depression"
                    )}
                    strokeWidth={10}
                    size={80}
                    format={() => (
                      <span className="text-lg">
                        {assessmentScores.depressionScore}
                      </span>
                    )}
                  />
                  <div className="text-right">
                    <span className="text-sm text-gray-500">Level</span>
                    <div
                      className={`mt-1 px-3 py-1 rounded-full text-sm font-medium inline-block
                        ${
                          getIndicatorText(
                            assessmentScores.depressionScore,
                            "depression"
                          ) === "Low"
                            ? "bg-green-50 text-green-700"
                            : getIndicatorText(
                                assessmentScores.depressionScore,
                                "depression"
                              ) === "Moderate"
                            ? "bg-yellow-50 text-yellow-700"
                            : "bg-red-50 text-red-700"
                        }`}
                    >
                      {getIndicatorText(
                        assessmentScores.depressionScore,
                        "depression"
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex justify-between items-center mt-4">
                  <Text type="secondary" className="text-xs">
                    Score: {assessmentScores.depressionScore}/27
                  </Text>
                </div>
              </Card>

              {/* Stress Score */}
              <Card
                className="bg-orange-50 border-0 rounded-xl shadow-sm"
                bodyStyle={{ padding: "16px" }}
              >
                <div className="flex items-center mb-4">
                  <div className="bg-orange-100 p-2 rounded-full mr-3">
                    <ClockCircleOutlined className="text-orange-600" />
                  </div>
                  <Text className="font-medium">Stress Level</Text>
                </div>

                <div className="flex items-center justify-between">
                  <Progress
                    type="circle"
                    percent={(assessmentScores.stressScore / 40) * 100}
                    strokeColor={getIndicatorColor(
                      assessmentScores.stressScore,
                      "stress"
                    )}
                    strokeWidth={10}
                    size={80}
                    format={() => (
                      <span className="text-lg">
                        {assessmentScores.stressScore}
                      </span>
                    )}
                  />
                  <div className="text-right">
                    <span className="text-sm text-gray-500">Level</span>
                    <div
                      className={`mt-1 px-3 py-1 rounded-full text-sm font-medium inline-block
                        ${
                          getIndicatorText(
                            assessmentScores.stressScore,
                            "stress"
                          ) === "Low"
                            ? "bg-green-50 text-green-700"
                            : getIndicatorText(
                                assessmentScores.stressScore,
                                "stress"
                              ) === "Moderate"
                            ? "bg-yellow-50 text-yellow-700"
                            : "bg-red-50 text-red-700"
                        }`}
                    >
                      {getIndicatorText(assessmentScores.stressScore, "stress")}
                    </div>
                  </div>
                </div>

                <div className="flex justify-between items-center mt-4">
                  <Text type="secondary" className="text-xs">
                    Score: {assessmentScores.stressScore}/40
                  </Text>
                </div>
              </Card>
            </div>
          </Card>
        )}

        {/* Show "No assessment scores" message if needed */}
        {assessmentScores.anxietyScore === 0 &&
          assessmentScores.depressionScore === 0 &&
          assessmentScores.stressScore === 0 && (
            <Card className="bg-gray-50 border-gray-100">
              <div className="text-center text-gray-500">
                <InfoCircleOutlined className="mr-2" />
                <Text>
                  No assessment scores are available for this student yet.
                </Text>
              </div>
            </Card>
          )}

        {/* Appointment Timeline - Section 3 (moved down) */}
        <Card
          title={
            <div className="flex items-center gap-2">
              <ClockCircleOutlined className="text-custom-green" />
              <span>Appointment Notes</span>
            </div>
          }
          className="border-0 shadow-sm"
        >
          <div className="space-y-6">
            {/* Booking Request with Student Note */}
            {appointmentData.studentNotes && (
              <div className="relative pl-8 pb-6 border-l-2 border-blue-200">
                <div className="absolute -left-2 top-0">
                  <div className="bg-blue-500 rounded-full w-4 h-4"></div>
                </div>
                <div className="mb-1 flex items-center">
                  <Tag color="blue" className="mr-2">
                    Booking Request
                  </Tag>
                  <Text type="secondary" className="text-xs">
                    {formatDate(appointmentData.createdAt)}
                  </Text>
                </div>
                <Card className="bg-blue-50 border-blue-100 shadow-sm">
                  <div>
                    <Text strong className="block mb-1">
                      Student's Booking Note:
                    </Text>
                    <div className="italic text-gray-700 bg-white p-3 rounded-lg border border-blue-100">
                      "{appointmentData.studentNotes}"
                    </div>
                  </div>
                </Card>
              </div>
            )}

            {/* Scheduled Status */}
            {appointmentData.status === "SCHEDULED" && (
              <div className="relative pl-8 pb-6 border-l-2 border-green-200">
                <div className="absolute -left-2 top-0">
                  <div className="bg-green-500 rounded-full w-4 h-4"></div>
                </div>
                <div className="mb-1 flex items-center">
                  <Tag color="green" className="mr-2">
                    Confirmed
                  </Tag>
                  <Text type="secondary" className="text-xs">
                    Status: {appointmentData.status}
                  </Text>
                </div>
                <Card className="bg-green-50 border-green-100 shadow-sm">
                  <div className="flex items-center">
                    <CheckCircleOutlined className="text-green-500 text-lg mr-2" />
                    <Text>Appointment is scheduled and confirmed</Text>
                  </div>
                </Card>
              </div>
            )}

            {/* Completed Status */}
            {appointmentData.status === "COMPLETED" && (
              <div className="relative pl-8 pb-6 border-l-2 border-green-200">
                <div className="absolute -left-2 top-0">
                  <div className="bg-green-500 rounded-full w-4 h-4"></div>
                </div>
                <div className="mb-1 flex items-center">
                  <Tag color="green" className="mr-2">
                    Completed
                  </Tag>
                  <Text type="secondary" className="text-xs">
                    {formatDateTime(appointmentData.updatedAt)}
                  </Text>
                </div>
                <Card className="bg-green-50 border-green-100 shadow-sm">
                  <div className="flex items-center">
                    <CheckCircleOutlined className="text-green-500 text-lg mr-2" />
                    <Text>
                      This appointment has been completed successfully
                    </Text>
                  </div>
                </Card>
              </div>
            )}

            {/* In Progress Status */}
            {appointmentData.status === "IN_PROGRESS" && (
              <div className="relative pl-8 pb-6 border-l-2 border-orange-200">
                <div className="absolute -left-2 top-0">
                  <div className="bg-orange-500 rounded-full w-4 h-4"></div>
                </div>
                <div className="mb-1 flex items-center">
                  <Tag color="orange" className="mr-2">
                    In Progress
                  </Tag>
                  <Text type="secondary" className="text-xs">
                    {formatDateTime(appointmentData.updatedAt)}
                  </Text>
                </div>
                <Card className="bg-orange-50 border-orange-100 shadow-sm">
                  <div className="flex items-center">
                    <ClockCircleOutlined className="text-orange-500 text-lg mr-2" />
                    <Text>This appointment is currently in progress</Text>
                  </div>
                </Card>
              </div>
            )}

            {/* Cancelled with Reason */}
            {appointmentData.status === "CANCELLED" && (
              <div className="relative pl-8 pb-6 border-l-2 border-red-200">
                <div className="absolute -left-2 top-0">
                  <div className="bg-red-500 rounded-full w-4 h-4"></div>
                </div>
                <div className="mb-1 flex items-center">
                  <Tag color="red" className="mr-2">
                    Cancelled
                  </Tag>
                  <Text type="secondary" className="text-xs">
                    {formatDateTime(appointmentData.updatedAt)}
                  </Text>
                </div>
                {appointmentData.cancelReason ? (
                  <Card className="bg-red-50 border-red-100 shadow-sm">
                    <div>
                      <Text strong className="block mb-1">
                        Cancellation Reason:
                      </Text>
                      <div className="italic text-gray-700 bg-white p-3 rounded-lg border border-red-100">
                        "{appointmentData.cancelReason}"
                      </div>
                    </div>
                  </Card>
                ) : (
                  <Card className="bg-red-50 border-red-100 shadow-sm">
                    <div className="flex items-center">
                      <ExclamationCircleOutlined className="text-red-500 text-lg mr-2" />
                      <Text>
                        This appointment was cancelled (no reason provided)
                      </Text>
                    </div>
                  </Card>
                )}
              </div>
            )}
          </div>
        </Card>
      </div>
    </Modal>
  );
}

AppointmentDetail.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  appointmentData: PropTypes.object,
};

export default AppointmentDetail;

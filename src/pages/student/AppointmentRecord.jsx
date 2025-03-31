import { useState, useEffect } from "react";
import {
  Tabs,
  Table,
  Tag,
  Button,
  Spin,
  Empty,
  Modal,
  Card,
  Divider,
  Typography,
  notification,
  Alert,
  Progress,
  Row,
  Col,
} from "antd";
import {
  CalendarOutlined,
  ClockCircleOutlined,
  UserOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  InfoCircleOutlined,
  HistoryOutlined,
  IdcardOutlined,
  MailOutlined,
  PhoneOutlined,
  FileTextOutlined,
  BarChartOutlined,
  HeartOutlined,
} from "@ant-design/icons";
import { useAppointmentStore } from "../../stores/appointmentStore";
import { useAuthStore } from "../../stores/authStore";
import dayjs from "dayjs";

const { Title, Text } = Typography;
const { TabPane } = Tabs;

export default function AppointmentRecord() {
  const { user } = useAuthStore();
  const { fetchAppointmentRecords, loading, error, appointments } =
    useAppointmentStore();

  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [activeTab, setActiveTab] = useState("all");

  // Fetch appointments when component mounts
  useEffect(() => {
    if (user) {
      loadAppointments();
    }
  }, [user]);

  const loadAppointments = async () => {
    try {
      // Determine user role and ID
      const userRole = user?.role?.toLowerCase() || "";

      if (userRole === "student") {
        if (!user?.studentId) {
          console.error("Missing student ID:", user);
          notification.error({
            message: "Missing Information",
            description: "Student ID is missing. Please contact support.",
          });
          return;
        }

        console.log("Loading appointments for student:", user.studentId);
        await fetchAppointmentRecords(user.studentId, "student");
      } else if (userRole === "psychologist") {
        if (!user?.psychologistId) {
          console.error("Missing psychologist ID:", user);
          notification.error({
            message: "Missing Information",
            description: "Psychologist ID is missing. Please contact support.",
          });
          return;
        }

        console.log(
          "Loading appointments for psychologist:",
          user.psychologistId
        );
        await fetchAppointmentRecords(user.psychologistId, "psychologist");
      } else {
        console.error("Unsupported user role:", userRole);
        notification.error({
          message: "Unsupported Role",
          description:
            "Your user role is not supported for appointment records.",
        });
      }
    } catch (error) {
      console.error("Failed to load appointments:", error);
      notification.error({
        message: "Failed to load appointments",
        description: error.message || "An unexpected error occurred",
      });
    }
  };

  // Filter appointments based on active tab
  const filteredAppointments = appointments.filter((appointment) => {
    if (activeTab === "all") return true;
    return appointment.status === activeTab;
  });

  const getStatusTag = (status) => {
    switch (status) {
      case "COMPLETED":
        return (
          <Tag color="success" icon={<CheckCircleOutlined />}>
            Completed
          </Tag>
        );
      case "CANCELLED":
        return (
          <Tag color="error" icon={<CloseCircleOutlined />}>
            Cancelled
          </Tag>
        );
      default:
        return <Tag color="default">{status}</Tag>;
    }
  };

  const columns = [
    {
      title: "Date",
      dataIndex: "slotDate",
      key: "slotDate",
      render: (text) => (
        <div className="flex items-center">
          <CalendarOutlined className="mr-2 text-primary-green" />
          {dayjs(text).format("MMM DD, YYYY")}
        </div>
      ),
      sorter: (a, b) => new Date(a.slotDate) - new Date(b.slotDate),
    },
    {
      title: "Time",
      key: "time",
      render: (_, record) => (
        <div className="flex items-center">
          <ClockCircleOutlined className="mr-2 text-primary-green" />
          {record.startTime} - {record.endTime}
        </div>
      ),
    },
    {
      title: "Psychologist",
      key: "psychologist",
      render: (_, record) => (
        <div className="flex items-center">
          <UserOutlined className="mr-2 text-primary-green" />
          {record.psychologistName || record.psychologistID}
        </div>
      ),
    },
    {
      title: "Student",
      key: "student",
      render: (_, record) => (
        <div className="flex items-center">
          <UserOutlined className="mr-2 text-primary-green" />
          {record.studentName || record.studentID}
        </div>
      ),
      // Hide this column for students, only show for psychologists
      hidden: user?.role?.toLowerCase() === "student",
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status) => getStatusTag(status),
    },
    {
      title: "Actions",
      key: "actions",
      render: (_, record) => (
        <Button
          type="primary"
          onClick={() => {
            setSelectedAppointment(record);
            setIsModalVisible(true);
          }}
        >
          View Details
        </Button>
      ),
    },
  ];

  // Filter columns based on user role
  const filteredColumns = columns.filter(
    (col) => col.hidden !== true || user?.role?.toLowerCase() !== "student"
  );

  const renderAppointmentDetails = () => {
    if (!selectedAppointment) return null;

    return (
      <div className="space-y-6">
        {/* Appointment Summary Card */}
        <Card className="bg-gray-50 border-0">
          <div className="flex flex-col md:flex-row gap-6 justify-between">
            <div>
              <Text type="secondary">ID</Text>
              <div className="font-medium">
                {selectedAppointment.appointmentID}
              </div>
            </div>
            <div>
              <Text type="secondary">Status</Text>
              <div>{getStatusTag(selectedAppointment.status)}</div>
            </div>
            <div>
              <Text type="secondary">Date</Text>
              <div className="font-medium">
                <CalendarOutlined className="mr-2 text-green-500" />
                {dayjs(selectedAppointment.slotDate).format("MMM DD, YYYY")}
              </div>
            </div>
            <div>
              <Text type="secondary">Time</Text>
              <div className="font-medium">
                <ClockCircleOutlined className="mr-2 text-blue-500" />
                {`${selectedAppointment.startTime} - ${selectedAppointment.endTime}`}
              </div>
            </div>
            <div>
              <Text type="secondary">Last Updated</Text>
              <div className="text-sm text-gray-500">
                {dayjs(selectedAppointment.updatedAt).format(
                  "MMM DD, YYYY - HH:mm"
                )}
              </div>
            </div>
          </div>
        </Card>

        {/* People involved in the appointment */}
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
                    {selectedAppointment.studentName}
                  </div>
                  <div className="flex gap-2 text-sm text-gray-500 mt-1">
                    <IdcardOutlined />
                    <span>{selectedAppointment.studentID}</span>
                  </div>
                </div>

                <Divider className="my-3" />

                {selectedAppointment.studentEmail && (
                  <div>
                    <Text type="secondary" className="block mb-1">
                      Contact Information
                    </Text>
                    <div className="flex gap-2 items-center mb-2">
                      <MailOutlined className="text-gray-400" />
                      <Text copyable>{selectedAppointment.studentEmail}</Text>
                    </div>
                    {selectedAppointment.studentPhone && (
                      <div className="flex gap-2 items-center">
                        <PhoneOutlined className="text-gray-400" />
                        <Text copyable>{selectedAppointment.studentPhone}</Text>
                      </div>
                    )}
                  </div>
                )}
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
                    {selectedAppointment.psychologistName}
                  </div>
                  <div className="flex gap-2 text-sm text-gray-500 mt-1">
                    <IdcardOutlined />
                    <span>{selectedAppointment.psychologistID}</span>
                  </div>
                </div>

                <Divider className="my-3" />

                {selectedAppointment.psychologistEmail && (
                  <div>
                    <Text type="secondary" className="block mb-1">
                      Contact Information
                    </Text>
                    <div className="flex gap-2 items-center mb-2">
                      <MailOutlined className="text-gray-400" />
                      <Text copyable>
                        {selectedAppointment.psychologistEmail}
                      </Text>
                    </div>
                    {selectedAppointment.psychologistPhone && (
                      <div className="flex gap-2 items-center">
                        <PhoneOutlined className="text-gray-400" />
                        <Text copyable>
                          {selectedAppointment.psychologistPhone}
                        </Text>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </Card>
          </Col>
        </Row>

        {/* Assessment Results */}
        {selectedAppointment.assessmentResults && (
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
                    percent={
                      (selectedAppointment.assessmentResults.anxiety / 21) * 100
                    }
                    strokeColor="#108ee9"
                    strokeWidth={10}
                    size={80}
                    format={() => (
                      <span className="text-lg">
                        {selectedAppointment.assessmentResults.anxiety}
                      </span>
                    )}
                  />
                  <div className="text-right">
                    <span className="text-sm text-gray-500">Score</span>
                    <div className="mt-1 text-lg font-medium">
                      {selectedAppointment.assessmentResults.anxiety}/21
                    </div>
                  </div>
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
                    percent={
                      (selectedAppointment.assessmentResults.depression / 27) *
                      100
                    }
                    strokeColor="#722ed1"
                    strokeWidth={10}
                    size={80}
                    format={() => (
                      <span className="text-lg">
                        {selectedAppointment.assessmentResults.depression}
                      </span>
                    )}
                  />
                  <div className="text-right">
                    <span className="text-sm text-gray-500">Score</span>
                    <div className="mt-1 text-lg font-medium">
                      {selectedAppointment.assessmentResults.depression}/27
                    </div>
                  </div>
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
                    percent={
                      (selectedAppointment.assessmentResults.stress / 40) * 100
                    }
                    strokeColor="#fa8c16"
                    strokeWidth={10}
                    size={80}
                    format={() => (
                      <span className="text-lg">
                        {selectedAppointment.assessmentResults.stress}
                      </span>
                    )}
                  />
                  <div className="text-right">
                    <span className="text-sm text-gray-500">Score</span>
                    <div className="mt-1 text-lg font-medium">
                      {selectedAppointment.assessmentResults.stress}/40
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          </Card>
        )}

        {/* Appointment Notes */}
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
            {selectedAppointment.studentNotes && (
              <div className="relative pl-8 pb-6 border-l-2 border-blue-200">
                <div className="absolute -left-2 top-0">
                  <div className="bg-blue-500 rounded-full w-4 h-4"></div>
                </div>
                <div className="mb-1 flex items-center">
                  <Tag color="blue" className="mr-2">
                    Booking Request
                  </Tag>
                  <Text type="secondary" className="text-xs">
                    {dayjs(selectedAppointment.createdAt).format(
                      "MMM DD, YYYY"
                    )}
                  </Text>
                </div>
                <Card className="bg-blue-50 border-blue-100 shadow-sm">
                  <div>
                    <Text strong className="block mb-1">
                      Student's Booking Note:
                    </Text>
                    <div className="italic text-gray-700 bg-white p-3 rounded-lg border border-blue-100">
                      "{selectedAppointment.studentNotes}"
                    </div>
                  </div>
                </Card>
              </div>
            )}

            {/* Check-out Notes from Psychologist */}
            {selectedAppointment.status === "COMPLETED" &&
              selectedAppointment.psychologistNotes && (
                <div className="relative pl-8 pb-6 border-l-2 border-green-200">
                  <div className="absolute -left-2 top-0">
                    <div className="bg-green-500 rounded-full w-4 h-4"></div>
                  </div>
                  <div className="mb-1 flex items-center">
                    <Tag color="green" className="mr-2">
                      Session Notes
                    </Tag>
                    <Text type="secondary" className="text-xs">
                      {dayjs(selectedAppointment.checkOutTime).format(
                        "MMM DD, YYYY - HH:mm"
                      )}
                    </Text>
                  </div>
                  <Card className="bg-green-50 border-green-100 shadow-sm">
                    <div>
                      <Text strong className="block mb-1">
                        Psychologist's Notes:
                      </Text>
                      <div className="italic text-gray-700 bg-white p-3 rounded-lg border border-green-100">
                        "{selectedAppointment.psychologistNotes}"
                      </div>
                    </div>
                  </Card>
                </div>
              )}

            {/* Status Updates */}
            {selectedAppointment.status === "COMPLETED" && (
              <div className="relative pl-8 pb-6 border-l-2 border-green-200">
                <div className="absolute -left-2 top-0">
                  <div className="bg-green-500 rounded-full w-4 h-4"></div>
                </div>
                <div className="mb-1 flex items-center">
                  <Tag color="green" className="mr-2">
                    Session Timeline
                  </Tag>
                </div>
                <Card className="bg-green-50 border-green-100 shadow-sm">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Text>Check-in Time:</Text>
                      <Text strong>
                        {dayjs(selectedAppointment.checkInTime).format("HH:mm")}
                      </Text>
                    </div>
                    <div className="flex items-center justify-between">
                      <Text>Check-out Time:</Text>
                      <Text strong>
                        {dayjs(selectedAppointment.checkOutTime).format(
                          "HH:mm"
                        )}
                      </Text>
                    </div>
                    <div className="flex items-center justify-between">
                      <Text>Session Duration:</Text>
                      <Text strong>
                        {dayjs(selectedAppointment.checkOutTime).diff(
                          dayjs(selectedAppointment.checkInTime),
                          "minute"
                        )}{" "}
                        minutes
                      </Text>
                    </div>
                  </div>
                </Card>
              </div>
            )}

            {/* Cancellation Information */}
            {selectedAppointment.status === "CANCELLED" &&
              selectedAppointment.cancelReason && (
                <div className="relative pl-8 pb-6 border-l-2 border-red-200">
                  <div className="absolute -left-2 top-0">
                    <div className="bg-red-500 rounded-full w-4 h-4"></div>
                  </div>
                  <div className="mb-1 flex items-center">
                    <Tag color="red" className="mr-2">
                      Cancelled
                    </Tag>
                    <Text type="secondary" className="text-xs">
                      {dayjs(selectedAppointment.updatedAt).format(
                        "MMM DD, YYYY - HH:mm"
                      )}
                    </Text>
                  </div>
                  <Card className="bg-red-50 border-red-100 shadow-sm">
                    <div>
                      <Text strong className="block mb-1">
                        Cancellation Reason:
                      </Text>
                      <div className="italic text-gray-700 bg-white p-3 rounded-lg border border-red-100">
                        "{selectedAppointment.cancelReason}"
                      </div>
                    </div>
                  </Card>
                </div>
              )}
          </div>
        </Card>
      </div>
    );
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <div className="flex items-start">
          <div className="bg-primary-green/10 p-2 rounded-lg mr-3">
            <HistoryOutlined className="text-xl text-primary-green" />
          </div>
          <div>
            <Title level={2} className="text-gray-800 m-0 font-bold">
              Appointment Records
            </Title>
            <Text className="text-gray-500 text-base">
              View your completed and cancelled appointments history
            </Text>
          </div>
        </div>
      </div>

      {user?.role?.toLowerCase() === "student" && !user?.studentId && (
        <Alert
          message="Missing Student ID"
          description="Your student ID is missing. Please update your profile or contact support."
          type="warning"
          showIcon
          className="mb-6"
        />
      )}

      {user?.role?.toLowerCase() === "psychologist" &&
        !user?.psychologistId && (
          <Alert
            message="Missing Psychologist ID"
            description="Your psychologist ID is missing. Please update your profile or contact support."
            type="warning"
            showIcon
            className="mb-6"
          />
        )}

      <Card className="shadow-sm hover:shadow-md transition-shadow duration-300">
        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          tabBarExtraContent={
            <div className="flex items-center">
              <HistoryOutlined className="mr-2" />
              <Text type="secondary">{appointments.length} Records</Text>
            </div>
          }
        >
          <TabPane tab="All Records" key="all">
            {renderAppointmentTable(filteredAppointments)}
          </TabPane>
          <TabPane tab="Completed" key="COMPLETED">
            {renderAppointmentTable(filteredAppointments)}
          </TabPane>
          <TabPane tab="Cancelled" key="CANCELLED">
            {renderAppointmentTable(filteredAppointments)}
          </TabPane>
        </Tabs>
      </Card>

      <Modal
        title={null}
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setIsModalVisible(false)}>
            Close
          </Button>,
        ]}
        width={800}
        className="appointment-detail-modal"
      >
        {renderAppointmentDetails()}
      </Modal>
    </div>
  );

  function renderAppointmentTable(appointments) {
    if (loading) {
      return (
        <div className="py-10">
          <div className="flex justify-center mb-6">
            <Spin size="large" />
          </div>
          <div className="text-center">
            <Text type="secondary">Loading your appointment records...</Text>
          </div>
        </div>
      );
    }

    if (error) {
      return (
        <div className="text-center py-8">
          <Text type="danger">{error}</Text>
        </div>
      );
    }

    if (appointments.length === 0) {
      return (
        <Empty
          description={`No ${
            activeTab === "all" ? "" : activeTab.toLowerCase()
          } appointment records found`}
          image={Empty.PRESENTED_IMAGE_SIMPLE}
        />
      );
    }

    return (
      <Table
        columns={filteredColumns}
        dataSource={appointments}
        rowKey="appointmentID"
        pagination={{ pageSize: 10 }}
        rowClassName="hover:bg-gray-50"
      />
    );
  }
}

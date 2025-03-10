import React, { useState, useEffect } from "react";
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
} from "antd";
import {
  CalendarOutlined,
  ClockCircleOutlined,
  UserOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  InfoCircleOutlined,
  HistoryOutlined,
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
        <div className="flex justify-between items-center mb-4">
          <div>
            <Title level={4} className="mb-1">
              Appointment Record
            </Title>
            <Text type="secondary">
              {dayjs(selectedAppointment.slotDate).format("MMMM DD, YYYY")}
            </Text>
          </div>
          {getStatusTag(selectedAppointment.status)}
        </div>

        <Divider />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <Text type="secondary">Appointment ID</Text>
            <div className="flex items-center mt-1">
              <Text strong copyable>
                {selectedAppointment.appointmentID}
              </Text>
            </div>
          </div>

          <div>
            <Text type="secondary">Date & Time</Text>
            <div className="flex items-center mt-1">
              <CalendarOutlined className="mr-2 text-primary-green" />
              <Text strong>
                {dayjs(selectedAppointment.slotDate).format("MMMM DD, YYYY")} (
                {selectedAppointment.startTime} - {selectedAppointment.endTime})
              </Text>
            </div>
          </div>

          <div>
            <Text type="secondary">Psychologist</Text>
            <div className="flex items-center mt-1">
              <UserOutlined className="mr-2 text-primary-green" />
              <Text strong>
                {selectedAppointment.psychologistName || "Not specified"}{" "}
                <Text type="secondary">
                  ({selectedAppointment.psychologistID})
                </Text>
              </Text>
            </div>
          </div>

          <div>
            <Text type="secondary">Student</Text>
            <div className="flex items-center mt-1">
              <UserOutlined className="mr-2 text-primary-green" />
              <Text strong>
                {selectedAppointment.studentName || "Not specified"}{" "}
                <Text type="secondary">({selectedAppointment.studentID})</Text>
              </Text>
            </div>
          </div>
        </div>

        <Divider />

        <div>
          <Text type="secondary">Created At</Text>
          <div className="flex items-center mt-1">
            <InfoCircleOutlined className="mr-2 text-primary-green" />
            <Text>
              {dayjs(selectedAppointment.createdAt).format(
                "MMMM DD, YYYY HH:mm"
              )}
            </Text>
          </div>
        </div>

        {selectedAppointment.updatedAt && (
          <div className="mt-4">
            <Text type="secondary">Last Updated</Text>
            <div className="flex items-center mt-1">
              <InfoCircleOutlined className="mr-2 text-primary-green" />
              <Text>
                {dayjs(selectedAppointment.updatedAt).format(
                  "MMMM DD, YYYY HH:mm"
                )}
              </Text>
            </div>
          </div>
        )}
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

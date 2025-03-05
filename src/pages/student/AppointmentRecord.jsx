import React, { useState, useEffect } from "react";
import {
  Tabs,
  Table,
  Tag,
  Button,
  Spin,
  Empty,
  DatePicker,
  Modal,
  Tooltip,
  Card,
  Divider,
  Typography,
  notification,
} from "antd";
import {
  CalendarOutlined,
  ClockCircleOutlined,
  UserOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  InfoCircleOutlined,
} from "@ant-design/icons";
import { useAppointmentStore } from "../../stores/appointmentStore";
import { useAuthStore } from "../../stores/authStore";
import dayjs from "dayjs";

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;

export default function AppointmentRecord() {
  const { user } = useAuthStore();
  const { fetchFilteredAppointments, loading, error, appointments } =
    useAppointmentStore();

  const [activeTab, setActiveTab] = useState("completed");
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [dateRange, setDateRange] = useState(null);

  // Fetch appointments based on active tab
  useEffect(() => {
    fetchAppointments();
  }, [activeTab, dateRange]);

  const fetchAppointments = async () => {
    if (!user?.id) return;

    try {
      // Determine which statuses to fetch based on active tab
      const statuses =
        activeTab === "completed" ? ["COMPLETED"] : ["CANCELLED"];

      // Prepare filter object
      const filters = {
        studentId: user.id,
        status: statuses,
      };

      // Add date range if selected
      if (dateRange && dateRange[0] && dateRange[1]) {
        filters.startDate = dateRange[0].format("YYYY-MM-DD");
        filters.endDate = dateRange[1].format("YYYY-MM-DD");
      }

      await fetchFilteredAppointments(filters);
    } catch (error) {
      notification.error({
        message: "Failed to load appointments",
        description: error.message,
      });
    }
  };

  const getStatusTag = (status) => {
    switch (status) {
      case "COMPLETED":
        return (
          <Tag color="green" icon={<CheckCircleOutlined />}>
            Completed
          </Tag>
        );
      case "CANCELLED":
        return (
          <Tag color="red" icon={<CloseCircleOutlined />}>
            Cancelled
          </Tag>
        );
      case "SCHEDULED":
        return (
          <Tag color="blue" icon={<CalendarOutlined />}>
            Scheduled
          </Tag>
        );
      case "IN_PROGRESS":
        return (
          <Tag color="orange" icon={<ClockCircleOutlined />}>
            In Progress
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
          <CalendarOutlined className="mr-2 text-custom-green" />
          {dayjs(text).format("MMM DD, YYYY")}
        </div>
      ),
      sorter: (a, b) => dayjs(a.slotDate).unix() - dayjs(b.slotDate).unix(),
    },
    {
      title: "Time",
      key: "time",
      render: (_, record) => (
        <div className="flex items-center">
          <ClockCircleOutlined className="mr-2 text-custom-green" />
          {record.startTime} - {record.endTime}
        </div>
      ),
    },
    {
      title: "Psychologist",
      dataIndex: "psychologistID",
      key: "psychologistID",
      render: (text) => (
        <div className="flex items-center">
          <UserOutlined className="mr-2 text-custom-green" />
          {text}
        </div>
      ),
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
          className="bg-custom-green hover:bg-custom-green/90"
        >
          View Details
        </Button>
      ),
    },
  ];

  const renderAppointmentDetails = () => {
    if (!selectedAppointment) return null;

    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:justify-between">
          <div className="mb-4 sm:mb-0">
            <Text type="secondary">Appointment ID</Text>
            <Title level={5} className="mt-1">
              {selectedAppointment.appointmentID}
            </Title>
          </div>
          <div>{getStatusTag(selectedAppointment.status)}</div>
        </div>

        <Divider />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <Text type="secondary">Date</Text>
            <div className="flex items-center mt-1">
              <CalendarOutlined className="mr-2 text-custom-green" />
              <Text strong>
                {dayjs(selectedAppointment.slotDate).format("MMMM DD, YYYY")}
              </Text>
            </div>
          </div>

          <div>
            <Text type="secondary">Time</Text>
            <div className="flex items-center mt-1">
              <ClockCircleOutlined className="mr-2 text-custom-green" />
              <Text strong>
                {selectedAppointment.startTime} - {selectedAppointment.endTime}
              </Text>
            </div>
          </div>

          <div>
            <Text type="secondary">Psychologist ID</Text>
            <div className="flex items-center mt-1">
              <UserOutlined className="mr-2 text-custom-green" />
              <Text strong>{selectedAppointment.psychologistID}</Text>
            </div>
          </div>

          <div>
            <Text type="secondary">Student ID</Text>
            <div className="flex items-center mt-1">
              <UserOutlined className="mr-2 text-custom-green" />
              <Text strong>{selectedAppointment.studentID}</Text>
            </div>
          </div>
        </div>

        <Divider />

        <div>
          <Text type="secondary">Created At</Text>
          <div className="flex items-center mt-1">
            <InfoCircleOutlined className="mr-2 text-custom-green" />
            <Text>
              {dayjs(selectedAppointment.createdAt).format(
                "MMMM DD, YYYY HH:mm"
              )}
            </Text>
          </div>
        </div>

        {selectedAppointment.updatedAt && (
          <div>
            <Text type="secondary">Last Updated</Text>
            <div className="flex items-center mt-1">
              <InfoCircleOutlined className="mr-2 text-custom-green" />
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

  const handleTabChange = (key) => {
    setActiveTab(key);
  };

  const handleDateRangeChange = (dates) => {
    setDateRange(dates);
  };

  return (
    <div className="p-6">
      <Card className="shadow-md rounded-xl">
        <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-6">
          <Title level={3} className="mb-4 md:mb-0">
            Appointment Records
          </Title>

          <RangePicker
            onChange={handleDateRangeChange}
            className="w-full md:w-auto"
          />
        </div>

        <Tabs
          activeKey={activeTab}
          onChange={handleTabChange}
          items={[
            {
              key: "completed",
              label: (
                <span className="flex items-center">
                  <CheckCircleOutlined className="mr-2" />
                  Completed
                </span>
              ),
              children: (
                <div>
                  {loading ? (
                    <div className="flex justify-center py-12">
                      <Spin size="large" />
                    </div>
                  ) : error ? (
                    <div className="text-center py-8">
                      <Text type="danger">{error}</Text>
                    </div>
                  ) : appointments && appointments.length > 0 ? (
                    <Table
                      columns={columns}
                      dataSource={appointments}
                      rowKey="appointmentID"
                      pagination={{ pageSize: 10 }}
                    />
                  ) : (
                    <Empty
                      description="No completed appointments found"
                      image={Empty.PRESENTED_IMAGE_SIMPLE}
                    />
                  )}
                </div>
              ),
            },
            {
              key: "cancelled",
              label: (
                <span className="flex items-center">
                  <CloseCircleOutlined className="mr-2" />
                  Cancelled
                </span>
              ),
              children: (
                <div>
                  {loading ? (
                    <div className="flex justify-center py-12">
                      <Spin size="large" />
                    </div>
                  ) : error ? (
                    <div className="text-center py-8">
                      <Text type="danger">{error}</Text>
                    </div>
                  ) : appointments && appointments.length > 0 ? (
                    <Table
                      columns={columns}
                      dataSource={appointments}
                      rowKey="appointmentID"
                      pagination={{ pageSize: 10 }}
                    />
                  ) : (
                    <Empty
                      description="No cancelled appointments found"
                      image={Empty.PRESENTED_IMAGE_SIMPLE}
                    />
                  )}
                </div>
              ),
            },
          ]}
        />
      </Card>

      <Modal
        title="Appointment Details"
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setIsModalVisible(false)}>
            Close
          </Button>,
        ]}
        width={600}
      >
        {renderAppointmentDetails()}
      </Modal>
    </div>
  );
}

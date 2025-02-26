import React, { useEffect, useState } from "react";
import { useUserStore } from "../../stores/userStore";
import { useAuthStore } from "../../stores/authStore";
import {
  Table,
  Tag,
  Card,
  Typography,
  Spin,
  Empty,
  Tabs,
  Button,
  Modal,
  Result,
  Skeleton,
} from "antd";
import {
  CalendarOutlined,
  ClockCircleOutlined,
  UserOutlined,
  FileTextOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  HistoryOutlined,
  EnvironmentOutlined,
  PhoneOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";

const { Title, Text } = Typography;
const { TabPane } = Tabs;

export default function AppointmentRecord() {
  const { getUserWithAppointments, loading } = useUserStore();
  const { user } = useAuthStore();
  const [appointments, setAppointments] = useState([]);
  const [filteredAppointments, setFilteredAppointments] = useState([]);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);

  useEffect(() => {
    const fetchAppointments = async () => {
      if (user?.userId) {
        try {
          const userData = await getUserWithAppointments(user.userId);
          if (userData?.appointmentsRecord) {
            // Filter only completed and cancelled appointments
            const recordedAppointments = userData.appointmentsRecord.filter(
              (app) => app.status === "COMPLETED" || app.status === "CANCELLED"
            );
            setAppointments(recordedAppointments);
            setFilteredAppointments(recordedAppointments);
          }
        } catch (error) {
          console.error("Failed to fetch appointments:", error);
        }
      }
    };

    fetchAppointments();
  }, [getUserWithAppointments, user]);

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
      dataIndex: "createdAt",
      key: "date",
      render: (text) => dayjs(text).format("MMM DD, YYYY"),
      sorter: (a, b) => new Date(a.createdAt) - new Date(b.createdAt),
    },
    {
      title: "Time",
      key: "time",
      render: (_, record) => (
        <span>
          {record.checkInTime
            ? dayjs(record.checkInTime).format("hh:mm A")
            : "N/A"}
          {record.checkOutTime &&
            ` - ${dayjs(record.checkOutTime).format("hh:mm A")}`}
        </span>
      ),
    },
    {
      title: "Psychologist",
      dataIndex: ["psychologistResponse", "name"],
      key: "psychologist",
      render: (text, record) => (
        <div className="flex items-center">
          <UserOutlined className="mr-2" />
          <span>{text}</span>
          <Text type="secondary" className="ml-2">
            ({record.psychologistResponse.departmentName})
          </Text>
        </div>
      ),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status) => getStatusTag(status),
      filters: [
        { text: "Completed", value: "COMPLETED" },
        { text: "Cancelled", value: "CANCELLED" },
      ],
      onFilter: (value, record) => record.status === value,
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

  const renderAppointmentDetails = () => {
    if (!selectedAppointment)
      return <Skeleton active paragraph={{ rows: 6 }} />;

    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center mb-4">
          <div>
            <Title level={4} className="mb-1">
              Appointment Record
            </Title>
            <Text type="secondary">
              {dayjs(selectedAppointment.createdAt).format("MMMM DD, YYYY")}
            </Text>
          </div>
          {getStatusTag(selectedAppointment.status)}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Appointment Info */}
          <Card
            title={
              <div className="flex items-center">
                <CalendarOutlined className="mr-2 text-primary-green" />
                <span>Appointment Details</span>
              </div>
            }
            className="shadow-sm hover:shadow-md transition-shadow duration-300"
          >
            <div className="space-y-4">
              <div className="flex justify-between">
                <Text type="secondary">Appointment ID:</Text>
                <Text copyable>{selectedAppointment.appointmentID}</Text>
              </div>
              <div className="flex justify-between">
                <Text type="secondary">Date:</Text>
                <Text>
                  {dayjs(selectedAppointment.createdAt).format("MMMM DD, YYYY")}
                </Text>
              </div>
              <div className="flex justify-between">
                <Text type="secondary">Status:</Text>
                {getStatusTag(selectedAppointment.status)}
              </div>
              {selectedAppointment.checkInTime && (
                <div className="flex justify-between">
                  <Text type="secondary">Check-in Time:</Text>
                  <Text>
                    {dayjs(selectedAppointment.checkInTime).format("hh:mm A")}
                  </Text>
                </div>
              )}
              {selectedAppointment.checkOutTime && (
                <div className="flex justify-between">
                  <Text type="secondary">Check-out Time:</Text>
                  <Text>
                    {dayjs(selectedAppointment.checkOutTime).format("hh:mm A")}
                  </Text>
                </div>
              )}
              <div className="flex justify-between">
                <Text type="secondary">Duration:</Text>
                <Text>
                  {selectedAppointment.checkInTime &&
                  selectedAppointment.checkOutTime
                    ? `${Math.round(
                        (new Date(selectedAppointment.checkOutTime) -
                          new Date(selectedAppointment.checkInTime)) /
                          60000
                      )} minutes`
                    : "N/A"}
                </Text>
              </div>
            </div>
          </Card>

          {/* Psychologist Info */}
          <Card
            title={
              <div className="flex items-center">
                <UserOutlined className="mr-2 text-primary-green" />
                <span>Psychologist Information</span>
              </div>
            }
            className="shadow-sm hover:shadow-md transition-shadow duration-300"
          >
            <div className="space-y-4">
              <div className="flex justify-between">
                <Text type="secondary">Name:</Text>
                <Text>{selectedAppointment.psychologistResponse.name}</Text>
              </div>
              <div className="flex justify-between">
                <Text type="secondary">Department:</Text>
                <Text>
                  {selectedAppointment.psychologistResponse.departmentName}
                </Text>
              </div>
              <div className="flex justify-between">
                <Text type="secondary">Experience:</Text>
                <Text>
                  {selectedAppointment.psychologistResponse.yearsOfExperience}{" "}
                  years
                </Text>
              </div>
              <div className="flex justify-between">
                <Text type="secondary">Status:</Text>
                <Tag
                  color={
                    selectedAppointment.psychologistResponse.status === "ACTIVE"
                      ? "green"
                      : "orange"
                  }
                >
                  {selectedAppointment.psychologistResponse.status.replace(
                    "_",
                    " "
                  )}
                </Tag>
              </div>
            </div>
          </Card>
        </div>

        {/* Notes Section (if available) */}
        {selectedAppointment.psychologistNotes ? (
          <Card
            title={
              <div className="flex items-center">
                <FileTextOutlined className="mr-2 text-primary-green" />
                <span>Session Notes</span>
              </div>
            }
            className="shadow-sm hover:shadow-md transition-shadow duration-300"
          >
            <div className="p-4 bg-gray-50 rounded-md">
              <Text>{selectedAppointment.psychologistNotes}</Text>
            </div>
          </Card>
        ) : selectedAppointment.status === "COMPLETED" ? (
          <Card
            title={
              <div className="flex items-center">
                <FileTextOutlined className="mr-2 text-primary-green" />
                <span>Session Notes</span>
              </div>
            }
            className="shadow-sm hover:shadow-md transition-shadow duration-300"
          >
            <div className="p-4 bg-gray-50 rounded-md text-center">
              <Text type="secondary">
                No session notes were provided for this appointment.
              </Text>
            </div>
          </Card>
        ) : null}
      </div>
    );
  };

  const handleTabChange = (key) => {
    if (key === "all") {
      setFilteredAppointments(appointments);
    } else {
      setFilteredAppointments(appointments.filter((app) => app.status === key));
    }
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

      {loading ? (
        <Card className="shadow-sm">
          <div className="py-10">
            <div className="flex justify-center mb-6">
              <Spin size="large" />
            </div>
            <div className="text-center">
              <Text type="secondary">Loading your appointment records...</Text>
            </div>
            <div className="mt-8">
              <Skeleton active paragraph={{ rows: 6 }} />
            </div>
          </div>
        </Card>
      ) : appointments.length > 0 ? (
        <Card className="shadow-sm hover:shadow-md transition-shadow duration-300">
          <Tabs
            defaultActiveKey="all"
            onChange={handleTabChange}
            tabBarExtraContent={
              <div className="flex items-center">
                <HistoryOutlined className="mr-2" />
                <Text type="secondary">{appointments.length} Records</Text>
              </div>
            }
          >
            <TabPane tab="All Records" key="all">
              <Table
                columns={columns}
                dataSource={filteredAppointments}
                rowKey="appointmentID"
                pagination={{ pageSize: 10 }}
                rowClassName="hover:bg-gray-50"
                loading={loading}
              />
            </TabPane>
            <TabPane tab="Completed" key="COMPLETED">
              <Table
                columns={columns}
                dataSource={filteredAppointments}
                rowKey="appointmentID"
                pagination={{ pageSize: 10 }}
                rowClassName="hover:bg-gray-50"
                loading={loading}
              />
            </TabPane>
            <TabPane tab="Cancelled" key="CANCELLED">
              <Table
                columns={columns}
                dataSource={filteredAppointments}
                rowKey="appointmentID"
                pagination={{ pageSize: 10 }}
                rowClassName="hover:bg-gray-50"
                loading={loading}
              />
            </TabPane>
          </Tabs>
        </Card>
      ) : (
        <Card className="shadow-sm hover:shadow-md transition-shadow duration-300">
          <Result
            icon={<HistoryOutlined style={{ color: "#1890ff" }} />}
            title="No Appointment Records"
            subTitle="You don't have any completed or cancelled appointments yet."
            extra={
              <Button type="primary" href="/student/appointments">
                Book an Appointment
              </Button>
            }
          />
        </Card>
      )}

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
}

import { useAppointmentStore } from "../../stores/appointmentStore";
import {
  Table,
  Tag,
  Space,
  DatePicker,
  Select,
  Button,
  Alert,
  Card,
  Input,
  Typography,
  Spin,
  Empty,
  Tooltip,
  Skeleton,
  Row,
  Col,
} from "antd";
import {
  EyeOutlined,
  ReloadOutlined,
  SearchOutlined,
  CalendarOutlined,
  UserOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  SortAscendingOutlined,
  SortDescendingOutlined,
  PhoneOutlined,
  MailOutlined,
} from "@ant-design/icons";
import { useState, useEffect } from "react";
import dayjs from "dayjs";
import AppointmentDetail from "./AppointmentDetail";

const { Title, Text } = Typography;

// skeleton loading
const AppointmentSkeletonLoading = () => (
  <div>
    <Card className="mb-6 border rounded-lg">
      <Row gutter={[16, 16]}>
        <Col span={24} md={8}>
          <Skeleton.Input active style={{ width: "100%", height: 32 }} />
        </Col>
        <Col span={24} md={8}>
          <Skeleton.Input active style={{ width: "100%", height: 32 }} />
        </Col>
        <Col span={24} md={8}>
          <Row gutter={8}>
            <Col span={12}>
              <Skeleton.Button active style={{ width: "100%", height: 32 }} />
            </Col>
            <Col span={12}>
              <Skeleton.Button active style={{ width: "100%", height: 32 }} />
            </Col>
          </Row>
        </Col>
      </Row>
    </Card>

    {[...Array(5)].map((_, i) => (
      <Card key={i} className="mb-2">
        <Row gutter={16} align="middle">
          <Col span={4}>
            <Skeleton.Input active style={{ width: "90%" }} />
          </Col>
          <Col span={5}>
            <Skeleton paragraph={{ rows: 1 }} title={{ width: "60%" }} active />
          </Col>
          <Col span={5}>
            <Skeleton paragraph={{ rows: 1 }} title={{ width: "60%" }} active />
          </Col>
          <Col span={4}>
            <Skeleton paragraph={{ rows: 1 }} title={{ width: "80%" }} active />
          </Col>
          <Col span={3}>
            <Skeleton.Button active shape="round" style={{ width: "90%" }} />
          </Col>
          <Col span={3}>
            <Skeleton.Input active style={{ width: "90%" }} size="small" />
          </Col>
        </Row>
      </Card>
    ))}
  </div>
);

function AppointmentManagement() {
  const {
    fetchAllAppointmentRecords,
    GetDetails,
    loading,
    error,
    appointments,
  } = useAppointmentStore();

  const [filters, setFilters] = useState({
    status: [],
    startDate: null,
    endDate: null,
  });

  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [refreshing, setRefreshing] = useState(false);
  const [sortOrder, setSortOrder] = useState("newest");

  // Fetch appointments on mount
  useEffect(() => {
    handleSearch();
  }, []);

  const handleSearch = () => {
    setRefreshing(true);
    const params = {
      ...filters,
      startDate: filters.startDate?.format("YYYY-MM-DD"),
      endDate: filters.endDate?.format("YYYY-MM-DD"),
    };

    fetchAllAppointmentRecords(params).finally(() => {
      setRefreshing(false);
    });
  };

  const handleReset = () => {
    setFilters({
      status: [],
      startDate: null,
      endDate: null,
    });
    setSearchText("");
    setRefreshing(true);
    fetchAllAppointmentRecords({}).finally(() => {
      setRefreshing(false);
    });
  };

  const handleViewAppointment = async (record) => {
    try {
      const details = await GetDetails(record.appointmentID);
      setSelectedAppointment(details);
      setIsDetailModalOpen(true);
    } catch (error) {
      console.error("Error fetching appointment details:", error);
    }
  };

  // Filter appointments based on search text
  const filteredAppointments = appointments?.filter((appointment) => {
    if (!searchText) return true;

    return (
      appointment.appointmentID
        ?.toLowerCase()
        .includes(searchText.toLowerCase()) ||
      appointment.studentName
        ?.toLowerCase()
        .includes(searchText.toLowerCase()) ||
      appointment.psychologistName
        ?.toLowerCase()
        .includes(searchText.toLowerCase()) ||
      appointment.slotDate?.toLowerCase().includes(searchText.toLowerCase()) ||
      appointment.studentID?.toLowerCase().includes(searchText.toLowerCase()) ||
      appointment.psychologistID
        ?.toLowerCase()
        .includes(searchText.toLowerCase())
    );
  });

  // Sort appointments
  const sortedAppointments = [...(filteredAppointments || [])].sort((a, b) => {
    const aTime = dayjs(`${a.slotDate} ${a.startTime}`);
    const bTime = dayjs(`${b.slotDate} ${b.startTime}`);

    if (sortOrder === "newest") {
      return bTime - aTime;
    } else if (sortOrder === "oldest") {
      return aTime - bTime;
    }
    return 0;
  });

  const columns = [
    {
      title: "Appointment ID",
      dataIndex: "appointmentID",
      key: "appointmentID",
      width: 150,
      render: (id) => <div className="font-medium text-blue-600">{id}</div>,
    },
    {
      title: "Student",
      dataIndex: "studentName",
      key: "studentName",
      render: (name, record) => (
        <div>
          <div className="font-medium">{name}</div>
          <div className="text-xs text-gray-500 mt-1">
            <UserOutlined className="mr-1" />
            {record.studentID}
          </div>
        </div>
      ),
    },
    {
      title: "Psychologist",
      dataIndex: "psychologistName",
      key: "psychologistName",
      render: (name, record) => (
        <div>
          <div className="font-medium">{name}</div>
          <div className="text-xs text-gray-500 mt-1">
            <UserOutlined className="mr-1" />
            {record.psychologistID}
          </div>
        </div>
      ),
    },
    {
      title: "Date & Time",
      key: "datetime",
      render: (_, record) => (
        <div>
          <div className="font-medium">
            <CalendarOutlined className="mr-1 text-green-500" />
            {dayjs(record.slotDate).format("MMM DD, YYYY")}
          </div>
          <div className="text-xs text-gray-500 mt-1">
            <ClockCircleOutlined className="mr-1 text-blue-500" />
            {record.startTime} - {record.endTime}
          </div>
        </div>
      ),
      sorter: (a, b) =>
        dayjs(`${a.slotDate} ${a.startTime}`).unix() -
        dayjs(`${b.slotDate} ${b.startTime}`).unix(),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status) => {
        let color = "blue";
        let icon = <ClockCircleOutlined />;
        let text = "Scheduled";

        if (status === "COMPLETED") {
          color = "green";
          icon = <CheckCircleOutlined />;
          text = "Completed";
        } else if (status === "CANCELLED") {
          color = "red";
          icon = <CloseCircleOutlined />;
          text = "Cancelled";
        } else if (status === "IN_PROGRESS") {
          color = "orange";
          icon = <ClockCircleOutlined />;
          text = "In Progress";
        }

        return (
          <Tag color={color} icon={icon}>
            {text}
          </Tag>
        );
      },
    },
    {
      title: "Last Updated",
      dataIndex: "updatedAt",
      key: "updatedAt",
      render: (date) => (
        <Tooltip title={dayjs(date).format("YYYY-MM-DD HH:mm:ss")}>
          <div className="text-gray-500">{dayjs(date).fromNow()}</div>
        </Tooltip>
      ),
      sorter: (a, b) => dayjs(a.updatedAt).unix() - dayjs(b.updatedAt).unix(),
    },
    {
      title: "Actions",
      key: "actions",
      width: 100,
      render: (_, record) => (
        <Button
          type="primary"
          icon={<EyeOutlined />}
          onClick={() => handleViewAppointment(record)}
          className="bg-custom-green hover:bg-custom-green/90"
        >
          View Details
        </Button>
      ),
    },
  ];

  return (
    <div className="p-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <Title level={2} className="m-0">
            Appointment Management
          </Title>
          <Text type="secondary">View and monitor appointment records</Text>
        </div>

        <div className="flex gap-3">
          <Input
            placeholder="Search appointments..."
            prefix={<SearchOutlined className="text-gray-400" />}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            className="w-64"
          />
        </div>
      </div>

      {error && (
        <Alert
          message="Error"
          description={error}
          type="error"
          showIcon
          className="mb-6"
          closable
        />
      )}

      <Card className="mb-6 border rounded-lg">
        <div className="flex flex-wrap gap-4 items-center">
          <div className="flex-1 min-w-[300px]">
            <Text type="secondary" className="mb-2 block">
              Date Range:
            </Text>
            <DatePicker.RangePicker
              style={{ width: "100%" }}
              value={[filters.startDate, filters.endDate]}
              onChange={(dates) =>
                setFilters({
                  ...filters,
                  startDate: dates?.[0] || null,
                  endDate: dates?.[1] || null,
                })
              }
            />
          </div>

          <div className="flex-1 min-w-[200px]">
            <Text type="secondary" className="mb-2 block">
              Status:
            </Text>
            <Select
              mode="multiple"
              style={{ width: "100%" }}
              placeholder="Select status"
              value={filters.status}
              onChange={(value) => setFilters({ ...filters, status: value })}
              options={[
                { value: "SCHEDULED", label: "Scheduled" },
                { value: "COMPLETED", label: "Completed" },
                { value: "CANCELLED", label: "Cancelled" },
                { value: "IN_PROGRESS", label: "In Progress" },
              ]}
              allowClear
            />
          </div>

          <div className="flex-1 min-w-[200px]">
            <Text type="secondary" className="mb-2 block">
              Sort Order:
            </Text>
            <Select
              style={{ width: "100%" }}
              value={sortOrder}
              onChange={(value) => setSortOrder(value)}
              options={[
                {
                  value: "newest",
                  label: (
                    <div className="flex items-center">
                      <SortDescendingOutlined className="mr-2" />
                      Newest First
                    </div>
                  ),
                },
                {
                  value: "oldest",
                  label: (
                    <div className="flex items-center">
                      <SortAscendingOutlined className="mr-2" />
                      Oldest First
                    </div>
                  ),
                },
              ]}
            />
          </div>

          <div className="flex-1 min-w-[200px] flex flex-col justify-end">
            <div className="flex gap-2">
              <Button
                onClick={handleReset}
                icon={<ReloadOutlined spin={refreshing} />}
                className="w-1/2"
              >
                Reset
              </Button>
              <Button
                type="primary"
                onClick={handleSearch}
                loading={refreshing}
                className="w-1/2 bg-custom-green hover:bg-custom-green/90"
              >
                Search
              </Button>
            </div>
          </div>
        </div>
      </Card>

      {loading ? (
        <AppointmentSkeletonLoading />
      ) : appointments?.length === 0 ? (
        <Empty
          description="No appointments found"
          image={Empty.PRESENTED_IMAGE_SIMPLE}
        />
      ) : (
        <Table
          columns={columns}
          dataSource={sortedAppointments}
          loading={loading}
          rowKey="appointmentID"
          pagination={{
            total: sortedAppointments?.length,
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total) => `Total ${total} appointments`,
          }}
          className="border rounded-lg overflow-hidden"
          expandable={{
            expandedRowRender: (record) => (
              <div className="py-3 px-4 bg-gray-50 rounded-lg">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
                  <div>
                    <p className="text-gray-500 mb-1 text-sm">
                      Student Details
                    </p>
                    <div className="text-gray-800">
                      <div className="flex items-center mt-1">
                        <UserOutlined className="mr-2 text-blue-500" />
                        {record.studentName}
                      </div>
                      {record.studentNotes && (
                        <div className="mt-2 p-2 bg-blue-50 rounded-lg text-sm">
                          <Text italic className="block mb-1 text-gray-500">
                            Booking Note:
                          </Text>
                          "{record.studentNotes}"
                        </div>
                      )}
                    </div>
                  </div>
                  <div>
                    <p className="text-gray-500 mb-1 text-sm">
                      Psychologist Details
                    </p>
                    <div className="text-gray-800">
                      <div className="flex items-center mt-1">
                        <UserOutlined className="mr-2 text-green-500" />
                        {record.psychologistName}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Display cancellation reason if available */}
                {record.status === "CANCELLED" && record.cancelReason && (
                  <div className="mt-2">
                    <p className="text-gray-500 mb-1 text-sm">
                      Cancellation Reason
                    </p>
                    <div className="text-red-600 text-sm italic p-2 bg-red-50 rounded-lg">
                      "{record.cancelReason}"
                    </div>
                  </div>
                )}
              </div>
            ),
          }}
        />
      )}

      <AppointmentDetail
        open={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        appointmentData={selectedAppointment}
      />
    </div>
  );
}

export default AppointmentManagement;

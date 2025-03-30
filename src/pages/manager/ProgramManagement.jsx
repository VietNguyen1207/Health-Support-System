import { useEffect, useState, useMemo } from "react";
import {
  Flex,
  Card,
  Typography,
  Table,
  Tag,
  Space,
  Button,
  Modal,
  Form,
  Input,
  Select,
  DatePicker,
  TimePicker,
  InputNumber,
  Row,
  Col,
  Statistic,
  Badge,
  Tabs,
  Tooltip,
  message,
  Avatar,
  Progress,
  Empty,
} from "antd";
import {
  PlusOutlined,
  EditOutlined,
  EyeOutlined,
  CalendarOutlined,
  TeamOutlined,
  ClockCircleOutlined,
  EnvironmentOutlined,
  UserOutlined,
  CheckCircleOutlined,
  SyncOutlined,
  CloseCircleOutlined,
  ReloadOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import { useProgramStore } from "../../stores/programStore";
import SearchInputComponent from "../../components/SearchInputComponent";

const { Title, Text } = Typography;
const { TextArea } = Input;
const { Option } = Select;

// Hàm chuyển đổi trạng thái thành text hiển thị
const getStatusText = (status) => {
  switch (status) {
    case "ACTIVE":
      return "Active";
    case "IN_PROGRESS":
      return "In Progress";
    case "COMPLETED":
      return "Completed";
    default:
      return status;
  }
};

// Hàm lấy màu cho trạng thái
const getStatusColor = (status) => {
  switch (status) {
    case "ACTIVE":
      return "green";
    case "IN_PROGRESS":
      return "blue";
    case "COMPLETED":
      return "gray";
    default:
      return "default";
  }
};

// Hàm lấy icon cho trạng thái
const getStatusIcon = (status) => {
  switch (status) {
    case "ACTIVE":
      return <CheckCircleOutlined />;
    case "IN_PROGRESS":
      return <SyncOutlined spin />;
    case "COMPLETED":
      return <CloseCircleOutlined />;
    default:
      return null;
  }
};

// Hàm định dạng ngày giờ
const formatDate = (dateString) => {
  return dayjs(dateString).format("DD/MM/YYYY");
};

// Hàm định dạng thời gian
const formatTime = (timeString) => {
  return dayjs(`2000-01-01T${timeString}`).format("HH:mm");
};

function ProgramManagement() {
  const {
    programs = [],
    loading,
    fetchPrograms,
    updateProgram,
  } = useProgramStore();
  const [filteredPrograms, setFilteredPrograms] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [selectedProgram, setSelectedProgram] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [form] = Form.useForm();
  const [activeTab, setActiveTab] = useState("all");
  const [filters, setFilters] = useState({
    status: [],
    type: [],
    facilitator: [],
    department: [],
  });

  // Thống kê
  const statistics = useMemo(() => {
    if (!programs) return {};

    return {
      total: programs.length,
      active: programs.filter((p) => p.status === "ACTIVE").length,
      inProgress: programs.filter((p) => p.status === "IN_PROGRESS").length,
      completed: programs.filter((p) => p.status === "COMPLETED").length,
      online: programs.filter((p) => p.type === "ONLINE").length,
      offline: programs.filter((p) => p.type === "OFFLINE").length,
      totalParticipants: programs.reduce(
        (sum, p) => sum + p.currentParticipants,
        0
      ),
      maxCapacity: programs.reduce((sum, p) => sum + p.maxParticipants, 0),
    };
  }, [programs]);

  // Danh sách người hướng dẫn và phòng ban duy nhất
  const facilitators = useMemo(() => {
    if (!programs) return [];
    return [...new Set(programs.map((p) => p.facilitatorName))];
  }, [programs]);

  const departments = useMemo(() => {
    if (!programs) return [];
    return [...new Set(programs.map((p) => p.departmentName))];
  }, [programs]);

  // Fetch programs khi component mount
  useEffect(() => {
    fetchPrograms();
  }, [fetchPrograms]);

  // Cập nhật filteredPrograms khi programs thay đổi
  useEffect(() => {
    applyFilters();
  }, [programs, searchText, activeTab, filters]);

  // Hàm áp dụng bộ lọc
  const applyFilters = () => {
    if (!programs || !Array.isArray(programs)) {
      setFilteredPrograms([]);
      return;
    }

    let result = [...programs];

    // Lọc theo tab
    if (activeTab !== "all") {
      result = result.filter(
        (program) => program.status === activeTab.toUpperCase()
      );
    }

    // Lọc theo trạng thái
    if (filters.status.length > 0) {
      result = result.filter((program) =>
        filters.status.includes(program.status)
      );
    }

    // Lọc theo loại
    if (filters.type.length > 0) {
      result = result.filter((program) => filters.type.includes(program.type));
    }

    // Lọc theo người hướng dẫn
    if (filters.facilitator.length > 0) {
      result = result.filter((program) =>
        filters.facilitator.includes(program.facilitatorName)
      );
    }

    // Lọc theo phòng ban
    if (filters.department.length > 0) {
      result = result.filter((program) =>
        filters.department.includes(program.departmentName)
      );
    }

    // Tìm kiếm
    if (searchText) {
      const lowerCaseSearch = searchText.toLowerCase();
      result = result.filter(
        (program) =>
          program.title.toLowerCase().includes(lowerCaseSearch) ||
          program.description.toLowerCase().includes(lowerCaseSearch) ||
          program.tags.some((tag) =>
            tag.toLowerCase().includes(lowerCaseSearch)
          )
      );
    }

    setFilteredPrograms(result);
  };

  // Xử lý thay đổi tab
  const handleTabChange = (key) => {
    setActiveTab(key);
  };

  // Xử lý tìm kiếm
  const handleSearch = (value) => {
    setSearchText(value);
  };

  // Xử lý thay đổi bộ lọc
  const handleFilterChange = (filterType, values) => {
    setFilters((prev) => ({
      ...prev,
      [filterType]: values,
    }));
  };

  // Xử lý xem chi tiết chương trình
  const handleViewProgram = (program) => {
    setSelectedProgram(program);
    setIsModalVisible(true);
    setIsEditMode(false);
  };

  // Xử lý chỉnh sửa chương trình
  const handleEditProgram = (program) => {
    setSelectedProgram(program);
    setIsModalVisible(true);
    setIsEditMode(true);

    // Thiết lập giá trị ban đầu cho form
    form.setFieldsValue({
      title: program.title,
      description: program.description,
      startDate: dayjs(program.startDate),
      duration: program.duration,
      weeklyAt: program.weeklySchedule.weeklyAt,
      startTime: dayjs(`2000-01-01T${program.weeklySchedule.startTime}`),
      endTime: dayjs(`2000-01-01T${program.weeklySchedule.endTime}`),
      maxParticipants: program.maxParticipants,
      status: program.status,
      facilitatorName: program.facilitatorName,
      departmentName: program.departmentName,
      tags: program.tags,
      type: program.type,
      meetingLink: program.meetingLink || "",
    });
  };

  // Xử lý thêm chương trình mới
  const handleAddProgram = () => {
    setSelectedProgram(null);
    setIsModalVisible(true);
    setIsEditMode(true);
    form.resetFields();
  };

  // Xử lý xóa chương trình
  // const handleDeleteProgram = (programID) => {
  //   // Gọi API xóa chương trình
  //   message.success(`Program ${programID} deleted successfully`);
  //   // Sau khi xóa thành công, cập nhật lại danh sách
  //   fetchPrograms();
  // };

  // Xử lý submit form
  const handleFormSubmit = async (values) => {
    // Chuẩn bị dữ liệu để gửi lên server
    const formData = {
      ...values,
      startDate: values.startDate.format("YYYY-MM-DD"),
      weeklySchedule: {
        weeklyAt: values.weeklyAt,
        startTime: values.startTime.format("HH:mm:ss"),
        endTime: values.endTime.format("HH:mm:ss"),
      },
    };

    // Nếu là chỉnh sửa
    if (selectedProgram) {
      // Gọi API cập nhật chương trình
      await updateProgram(selectedProgram.programID, formData);
      message.success(
        `Program ${selectedProgram.programID} updated successfully`
      );
    } else {
      // Gọi API thêm chương trình mới
      message.success("New program added successfully");
    }

    // Đóng modal và cập nhật lại danh sách
    setIsModalVisible(false);
    fetchPrograms();
  };

  // Định nghĩa cột cho bảng
  const columns = [
    {
      title: "Program",
      key: "program",
      render: (_, record) => (
        <Flex vertical>
          <Text strong>{record.title}</Text>
          <Text type="secondary" ellipsis={{ tooltip: record.description }}>
            {record.description.length > 50
              ? `${record.description.substring(0, 50)}...`
              : record.description}
          </Text>
          <Flex gap={4} style={{ marginTop: 4 }}>
            {record.tags.slice(0, 2).map((tag) => (
              <Tag key={tag} color="blue">
                {tag.toLowerCase()}
              </Tag>
            ))}
            {record.tags.length > 2 && (
              <Tooltip title={record.tags.slice(2).join(", ")}>
                <Tag>+{record.tags.length - 2}</Tag>
              </Tooltip>
            )}
          </Flex>
        </Flex>
      ),
      width: "30%",
      sorter: (a, b) => a.title.localeCompare(b.title),
    },
    {
      title: "Schedule",
      key: "schedule",
      render: (_, record) => (
        <Flex vertical>
          <Flex align="center" gap={8}>
            <CalendarOutlined />
            <Text>{formatDate(record.startDate)}</Text>
          </Flex>
          <Flex align="center" gap={8}>
            <ClockCircleOutlined />
            <Text>
              {record.weeklySchedule.weeklyAt},{" "}
              {formatTime(record.weeklySchedule.startTime)} -{" "}
              {formatTime(record.weeklySchedule.endTime)}
            </Text>
          </Flex>
          <Flex align="center" gap={8}>
            <EnvironmentOutlined />
            <Text>{record.type}</Text>
          </Flex>
        </Flex>
      ),
      width: "25%",
      sorter: (a, b) => new Date(a.startDate) - new Date(b.startDate),
    },
    {
      title: "Facilitator",
      key: "facilitator",
      render: (_, record) => (
        <Flex vertical>
          <Flex align="center" gap={8}>
            <UserOutlined />
            <Text>{record.facilitatorName}</Text>
          </Flex>
          <Text type="secondary">{record.departmentName}</Text>
        </Flex>
      ),
      width: "20%",
      filters: facilitators.map((f) => ({ text: f, value: f })),
      onFilter: (value, record) => record.facilitatorName === value,
    },
    {
      title: "Participants",
      key: "participants",
      render: (_, record) => (
        <Flex align="center" gap={8}>
          <TeamOutlined />
          <Text>
            {record.currentParticipants}/{record.maxParticipants}
          </Text>
          <Progress
            percent={Math.round(
              (record.currentParticipants / record.maxParticipants) * 100
            )}
            size="small"
            showInfo={false}
            style={{ width: 60 }}
          />
        </Flex>
      ),
      width: "15%",
      sorter: (a, b) => a.currentParticipants - b.currentParticipants,
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status) => (
        <Tag icon={getStatusIcon(status)} color={getStatusColor(status)}>
          {getStatusText(status)}
        </Tag>
      ),
      width: "10%",
      filters: [
        { text: "Active", value: "ACTIVE" },
        { text: "In Progress", value: "IN_PROGRESS" },
        { text: "Completed", value: "COMPLETED" },
      ],
      onFilter: (value, record) => record.status === value,
    },
    {
      title: "Actions",
      key: "actions",
      render: (_, record) => (
        <Space size="small">
          <Tooltip title="View Details">
            <Button
              type="primary"
              size="small"
              icon={<EyeOutlined />}
              onClick={() => handleViewProgram(record)}
            />
          </Tooltip>
          <Tooltip title="Edit Program">
            <Button
              type="default"
              size="small"
              icon={<EditOutlined />}
              onClick={() => handleEditProgram(record)}
            />
          </Tooltip>
          {/* <Tooltip title="Delete Program">
            <Popconfirm
              title="Delete this program?"
              description="Are you sure you want to delete this program?"
              onConfirm={() => handleDeleteProgram(record.programID)}
              okText="Yes"
              cancelText="No">
              <Button
                type="default"
                danger
                size="small"
                icon={<DeleteOutlined />}
              />
            </Popconfirm>
          </Tooltip> */}
        </Space>
      ),
      width: "10%",
    },
  ];

  // Render chi tiết chương trình
  const renderProgramDetails = () => {
    if (!selectedProgram) return null;

    const detailTabItems = [
      {
        key: "details",
        label: (
          <span>
            <EyeOutlined /> Details
          </span>
        ),
        children: (
          <Flex vertical gap={16}>
            {/* Header */}
            <Card>
              <Flex align="center" gap={16}>
                <Avatar
                  size={64}
                  icon={<CalendarOutlined />}
                  style={{
                    backgroundColor:
                      selectedProgram.type === "ONLINE" ? "#1890ff" : "#52c41a",
                    padding: 12,
                  }}
                />
                <Flex vertical gap={4} flex={1}>
                  <Title level={4} style={{ margin: 0 }}>
                    {selectedProgram.title}
                  </Title>
                  <Flex gap={8} align="center">
                    <Tag
                      icon={getStatusIcon(selectedProgram.status)}
                      color={getStatusColor(selectedProgram.status)}>
                      {getStatusText(selectedProgram.status)}
                    </Tag>
                    <Tag
                      color={
                        selectedProgram.type === "ONLINE" ? "blue" : "green"
                      }>
                      {selectedProgram.type}
                    </Tag>
                  </Flex>
                </Flex>
              </Flex>
            </Card>

            {/* Program Info */}
            <Row gutter={16}>
              <Col xs={24} md={12}>
                <Card title="Program Information" size="small">
                  <Flex vertical gap={12}>
                    <Flex align="start" gap={8}>
                      <Text strong style={{ minWidth: 100 }}>
                        Description:
                      </Text>
                      <Text>{selectedProgram.description}</Text>
                    </Flex>
                    <Flex align="center" gap={8}>
                      <Text strong style={{ minWidth: 100 }}>
                        Duration:
                      </Text>
                      <Text>{selectedProgram.duration} weeks</Text>
                    </Flex>
                    <Flex align="center" gap={8}>
                      <Text strong style={{ minWidth: 100 }}>
                        Participants:
                      </Text>
                      <Text>
                        {selectedProgram.currentParticipants}/
                        {selectedProgram.maxParticipants}
                      </Text>
                    </Flex>
                    <Flex align="center" gap={8}>
                      <Text strong style={{ minWidth: 100 }}>
                        Tags:
                      </Text>
                      <Flex gap={4} wrap="wrap">
                        {selectedProgram.tags.map((tag) => (
                          <Tag key={tag} color="blue">
                            {tag.toLowerCase()}
                          </Tag>
                        ))}
                      </Flex>
                    </Flex>
                  </Flex>
                </Card>
              </Col>

              <Col xs={24} md={12}>
                <Card title="Schedule Information" size="small">
                  <Flex vertical gap={12}>
                    <Flex align="center" gap={8}>
                      <Text strong style={{ minWidth: 100 }}>
                        Start Date:
                      </Text>
                      <Text>{formatDate(selectedProgram.startDate)}</Text>
                    </Flex>
                    <Flex align="center" gap={8}>
                      <Text strong style={{ minWidth: 100 }}>
                        Weekly At:
                      </Text>
                      <Text>{selectedProgram.weeklySchedule.weeklyAt}</Text>
                    </Flex>
                    <Flex align="center" gap={8}>
                      <Text strong style={{ minWidth: 100 }}>
                        Time:
                      </Text>
                      <Text>
                        {formatTime(selectedProgram.weeklySchedule.startTime)} -{" "}
                        {formatTime(selectedProgram.weeklySchedule.endTime)}
                      </Text>
                    </Flex>
                    {selectedProgram.type === "ONLINE" && (
                      <Flex align="center" gap={8}>
                        <Text strong style={{ minWidth: 100 }}>
                          Meeting Link:
                        </Text>
                        <a
                          href={selectedProgram.meetingLink}
                          target="_blank"
                          rel="noopener noreferrer">
                          {selectedProgram.meetingLink}
                        </a>
                      </Flex>
                    )}
                  </Flex>
                </Card>
              </Col>
            </Row>

            {/* Facilitator Info */}
            <Card title="Facilitator Information" size="small">
              <Flex vertical gap={12}>
                <Flex align="center" gap={8}>
                  <Text strong style={{ minWidth: 100 }}>
                    Facilitator:
                  </Text>
                  <Text>{selectedProgram.facilitatorName}</Text>
                </Flex>
                <Flex align="center" gap={8}>
                  <Text strong style={{ minWidth: 100 }}>
                    Department:
                  </Text>
                  <Text>{selectedProgram.departmentName}</Text>
                </Flex>
              </Flex>
            </Card>
          </Flex>
        ),
      },
      {
        key: "participants",
        label: (
          <span>
            <TeamOutlined /> Participants
          </span>
        ),
        children: (
          <Card>
            {/* Placeholder for participants list */}
            <Empty description="Participant details will be displayed here" />
          </Card>
        ),
      },
    ];

    return <Tabs defaultActiveKey="details" items={detailTabItems} />;
  };

  // Render form chỉnh sửa/thêm mới
  const renderProgramForm = () => {
    const formTabItems = [
      {
        key: "basic",
        label: "Basic Information",
        children: (
          <Card>
            <Row gutter={16}>
              <Col span={24}>
                <Form.Item
                  name="title"
                  label="Program Title"
                  rules={[
                    { required: true, message: "Please enter program title" },
                  ]}>
                  <Input placeholder="Enter program title" />
                </Form.Item>
              </Col>
              <Col span={24}>
                <Form.Item
                  name="description"
                  label="Description"
                  rules={[
                    { required: true, message: "Please enter description" },
                  ]}>
                  <TextArea rows={4} placeholder="Enter program description" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="status"
                  label="Status"
                  rules={[{ required: true, message: "Please select status" }]}>
                  <Select>
                    <Option value="ACTIVE">Active</Option>
                    <Option value="IN_PROGRESS">In Progress</Option>
                    <Option value="COMPLETED">Completed</Option>
                  </Select>
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="type"
                  label="Type"
                  rules={[{ required: true, message: "Please select type" }]}>
                  <Select>
                    <Option value="ONLINE">Online</Option>
                    <Option value="OFFLINE">Offline</Option>
                  </Select>
                </Form.Item>
              </Col>
              <Col span={24}>
                <Form.Item
                  name="tags"
                  label="Tags"
                  rules={[
                    {
                      required: true,
                      message: "Please add at least one tag",
                    },
                  ]}>
                  <Select mode="tags" placeholder="Add tags">
                    <Option value="DEPRESSION">Depression</Option>
                    <Option value="ANXIETY">Anxiety</Option>
                    <Option value="STRESS">Stress</Option>
                    <Option value="ACADEMIC STRESS">Academic Stress</Option>
                    <Option value="WORK STRESS">Work Stress</Option>
                    <Option value="RELATIONSHIP STRESS">
                      Relationship Stress
                    </Option>
                  </Select>
                </Form.Item>
              </Col>
            </Row>
          </Card>
        ),
      },
      {
        key: "schedule",
        label: "Schedule",
        children: (
          <Card>
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="startDate"
                  label="Start Date"
                  rules={[
                    { required: true, message: "Please select start date" },
                  ]}>
                  <DatePicker style={{ width: "100%" }} />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="duration"
                  label="Duration (weeks)"
                  rules={[
                    { required: true, message: "Please enter duration" },
                  ]}>
                  <InputNumber min={1} style={{ width: "100%" }} />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  name="weeklyAt"
                  label="Weekly At"
                  rules={[{ required: true, message: "Please select day" }]}>
                  <Select>
                    <Option value="Monday">Monday</Option>
                    <Option value="Tuesday">Tuesday</Option>
                    <Option value="Wednesday">Wednesday</Option>
                    <Option value="Thursday">Thursday</Option>
                    <Option value="Friday">Friday</Option>
                    <Option value="Saturday">Saturday</Option>
                    <Option value="Sunday">Sunday</Option>
                  </Select>
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  name="startTime"
                  label="Start Time"
                  rules={[
                    { required: true, message: "Please select start time" },
                  ]}>
                  <TimePicker format="HH:mm" style={{ width: "100%" }} />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  name="endTime"
                  label="End Time"
                  rules={[
                    { required: true, message: "Please select end time" },
                  ]}>
                  <TimePicker format="HH:mm" style={{ width: "100%" }} />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="maxParticipants"
                  label="Maximum Participants"
                  rules={[
                    {
                      required: true,
                      message: "Please enter max participants",
                    },
                  ]}>
                  <InputNumber min={1} style={{ width: "100%" }} />
                </Form.Item>
              </Col>
              <Form.Item
                noStyle
                shouldUpdate={(prevValues, currentValues) =>
                  prevValues.type !== currentValues.type
                }>
                {({ getFieldValue }) =>
                  getFieldValue("type") === "ONLINE" ? (
                    <Col span={24}>
                      <Form.Item
                        name="meetingLink"
                        label="Meeting Link"
                        rules={[
                          {
                            required: true,
                            message: "Please enter meeting link",
                          },
                        ]}>
                        <Input placeholder="https://example.com/meeting" />
                      </Form.Item>
                    </Col>
                  ) : null
                }
              </Form.Item>
            </Row>
          </Card>
        ),
      },
      {
        key: "facilitator",
        label: "Facilitator",
        children: (
          <Card>
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="facilitatorName"
                  label="Facilitator Name"
                  rules={[
                    { required: true, message: "Please select facilitator" },
                  ]}>
                  <Select>
                    {facilitators.map((facilitator) => (
                      <Option key={facilitator} value={facilitator}>
                        {facilitator}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="departmentName"
                  label="Department"
                  rules={[
                    { required: true, message: "Please select department" },
                  ]}>
                  <Select>
                    {departments.map((department) => (
                      <Option key={department} value={department}>
                        {department}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
            </Row>
          </Card>
        ),
      },
    ];

    return (
      <Form
        form={form}
        layout="vertical"
        onFinish={handleFormSubmit}
        initialValues={{
          status: "ACTIVE",
          type: "ONLINE",
          maxParticipants: 20,
          duration: 4,
        }}>
        <Tabs defaultActiveKey="basic" items={formTabItems} />

        <Flex justify="end" gap={12} style={{ marginTop: 16 }}>
          <Button onClick={() => setIsModalVisible(false)}>Cancel</Button>
          <Button type="primary" htmlType="submit">
            {selectedProgram ? "Update Program" : "Create Program"}
          </Button>
        </Flex>
      </Form>
    );
  };

  // Sửa phần Filter tabs trong return
  const filterTabItems = [
    {
      key: "all",
      label: "All Programs",
    },
    {
      key: "ACTIVE",
      label: (
        <Badge count={statistics.active}>
          <span style={{ paddingRight: 10 }}>Active</span>
        </Badge>
      ),
    },
    {
      key: "IN_PROGRESS",
      label: (
        <Badge count={statistics.inProgress}>
          <span style={{ paddingRight: 10 }}>In Progress</span>
        </Badge>
      ),
    },
    {
      key: "COMPLETED",
      label: (
        <Badge count={statistics.completed}>
          <span style={{ paddingRight: 10 }}>Completed</span>
        </Badge>
      ),
    },
  ];

  return (
    <Flex vertical gap={20}>
      {/* Header with statistics */}
      <Card>
        <Flex justify="space-between" align="center" wrap="wrap">
          <Title level={4} style={{ margin: 0 }}>
            Program Management
          </Title>
          <Flex gap={16} align="center" wrap="wrap">
            <SearchInputComponent
              style={{ width: 250 }}
              placeholder="Search programs..."
              onSearch={handleSearch}
              allowClear
            />
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={handleAddProgram}>
              Add Program
            </Button>
          </Flex>
        </Flex>
      </Card>

      {/* Statistics */}
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} md={8} lg={6}>
          <Card>
            <Statistic
              title="Total Programs"
              value={statistics.total}
              loading={loading}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={8} lg={6}>
          <Card>
            <Statistic
              title="Active Programs"
              value={statistics.active}
              valueStyle={{ color: "#52c41a" }}
              loading={loading}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={8} lg={6}>
          <Card>
            <Statistic
              title="In Progress"
              value={statistics.inProgress}
              valueStyle={{ color: "#1890ff" }}
              loading={loading}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={8} lg={6}>
          <Card>
            <Statistic
              title="Completed"
              value={statistics.completed}
              valueStyle={{ color: "#8c8c8c" }}
              loading={loading}
            />
          </Card>
        </Col>
      </Row>

      {/* Filter tabs */}
      <Card>
        <Tabs
          activeKey={activeTab}
          onChange={handleTabChange}
          items={filterTabItems}
        />

        {/* Additional filters */}
        <Flex gap={16} style={{ marginTop: 16 }}>
          <Select
            mode="multiple"
            placeholder="Filter by type"
            style={{ width: 200 }}
            onChange={(values) => handleFilterChange("type", values)}
            options={[
              { label: "Online", value: "ONLINE" },
              { label: "Offline", value: "OFFLINE" },
            ]}
          />
          <Select
            mode="multiple"
            placeholder="Filter by facilitator"
            style={{ width: 200 }}
            onChange={(values) => handleFilterChange("facilitator", values)}
            options={facilitators.map((f) => ({ label: f, value: f }))}
          />
          <Select
            mode="multiple"
            placeholder="Filter by department"
            style={{ width: 200 }}
            onChange={(values) => handleFilterChange("department", values)}
            options={departments.map((d) => ({ label: d, value: d }))}
          />
          <Button
            icon={<ReloadOutlined />}
            onClick={() => {
              setFilters({
                status: [],
                type: [],
                facilitator: [],
                department: [],
              });
              setSearchText("");
              setActiveTab("all");
            }}>
            Reset Filters
          </Button>
        </Flex>
      </Card>

      {/* Programs table */}
      <Card>
        <Table
          columns={columns}
          dataSource={filteredPrograms}
          rowKey="programID"
          loading={loading}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            pageSizeOptions: ["10", "20", "50"],
            showTotal: (total) => `Total ${total} programs`,
          }}
        />
      </Card>

      {/* Program details/edit modal */}
      <Modal
        title={
          isEditMode
            ? selectedProgram
              ? "Edit Program"
              : "Add New Program"
            : "Program Details"
        }
        open={isModalVisible}
        onCancel={() => {
          setIsModalVisible(false);
          setIsEditMode(false);
        }}
        footer={null}
        width={800}
        destroyOnClose>
        {isEditMode ? renderProgramForm() : renderProgramDetails()}
      </Modal>
    </Flex>
  );
}

export default ProgramManagement;

import { useEffect, useState } from "react";
import {
  Table,
  Tag,
  Button,
  message,
  Tooltip,
  Card,
  Input,
  Badge,
  Dropdown,
  Menu,
  Typography,
  Segmented,
  Empty,
  Spin,
  Progress,
  Drawer,
  Avatar,
  Divider,
  Space,
} from "antd";
import {
  EditOutlined,
  ReloadOutlined,
  SearchOutlined,
  CalendarOutlined,
  TeamOutlined,
  MoreOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  SortAscendingOutlined,
  SortDescendingOutlined,
  ExclamationCircleOutlined,
  UserOutlined,
  EnvironmentOutlined,
  BulbOutlined,
  EyeOutlined,
  RightOutlined,
  PhoneOutlined,
  MailOutlined,
  InfoCircleOutlined,
} from "@ant-design/icons";
import { useProgramStore } from "../../stores/programStore";
import UpdateProgramModal from "../../components/UpdateProgramModal";
import { useNavigate } from "react-router-dom";

const { Text, Title } = Typography;

const UpdateProgram = () => {
  const navigate = useNavigate();
  const { fetchPrograms, loading, fetchProgramParticipants } =
    useProgramStore();
  const [programs, setPrograms] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [updateModalVisible, setUpdateModalVisible] = useState(false);
  const [selectedProgram, setSelectedProgram] = useState(null);
  const [filterType, setFilterType] = useState("All");
  const [sortOrder, setSortOrder] = useState("newest");

  // New states for participants
  const [participantsDrawerVisible, setParticipantsDrawerVisible] =
    useState(false);
  const [participants, setParticipants] = useState([]);
  const [loadingParticipants, setLoadingParticipants] = useState(false);

  // Fetch programs on component mount
  useEffect(() => {
    fetchProgramsList();
  }, []);

  const fetchProgramsList = async () => {
    try {
      setRefreshing(true);
      const data = await fetchPrograms();
      setPrograms(data);
    } catch (error) {
      console.log(error);
      message.error("Failed to fetch programs");
    } finally {
      setRefreshing(false);
    }
  };

  // Handle program update
  const handleUpdate = (program) => {
    if (!program || !program.programID) {
      message.error("Invalid program selected");
      return;
    }
    setSelectedProgram(program);
    setUpdateModalVisible(true);
  };

  // New function to handle viewing participants
  const handleViewParticipants = async (program, e) => {
    e.stopPropagation(); // Prevent row expansion when clicking the button

    if (!program || !program.programID) {
      message.error("Invalid program selected");
      return;
    }

    setSelectedProgram(program);
    setLoadingParticipants(true);
    setParticipantsDrawerVisible(true);

    try {
      const data = await fetchProgramParticipants(program.programID);
      setParticipants(data);
    } catch (error) {
      message.error("Failed to fetch program participants");
      console.error(error);
    } finally {
      setLoadingParticipants(false);
    }
  };

  // Handle successful updates
  const handleUpdateSuccess = () => {
    setUpdateModalVisible(false);
    setSelectedProgram(null);
    fetchProgramsList(); // Refresh the programs list
    message.success({
      content: "Program updated successfully!",
      icon: <CheckCircleOutlined className="text-green-500" />,
      className: "custom-success-message",
    });
  };

  // Filter and sort programs
  const getFilteredPrograms = () => {
    let filtered = [...programs];

    // Apply type filter
    if (filterType !== "All") {
      filtered = filtered.filter((program) => program.type === filterType);
    }

    // Apply search filter
    if (searchText) {
      filtered = filtered.filter(
        (program) =>
          program.title.toLowerCase().includes(searchText.toLowerCase()) ||
          program.description
            .toLowerCase()
            .includes(searchText.toLowerCase()) ||
          program.programID.toLowerCase().includes(searchText.toLowerCase()) ||
          program.departmentName
            ?.toLowerCase()
            .includes(searchText.toLowerCase())
      );
    }

    // Apply sorting
    filtered.sort((a, b) => {
      if (sortOrder === "newest") {
        return new Date(b.startDate) - new Date(a.startDate);
      } else if (sortOrder === "oldest") {
        return new Date(a.startDate) - new Date(b.startDate);
      } else if (sortOrder === "alphabetical") {
        return a.title.localeCompare(b.title);
      }
      return 0;
    });

    return filtered;
  };

  const filteredPrograms = getFilteredPrograms();

  // Format date helper function
  const formatDate = (dateString) => {
    return dateString
      ? new Date(dateString).toLocaleDateString("en-US", {
          year: "numeric",
          month: "short",
          day: "numeric",
        })
      : "Not specified";
  };

  // Define table columns
  const columns = [
    {
      title: "Title",
      dataIndex: "title",
      key: "title",
      width: "25%",
      render: (text, record) => (
        <div>
          <div className="font-medium">{text}</div>
          <div className="text-xs text-gray-500 mt-1">
            ID: {record.programID}
          </div>
        </div>
      ),
      filteredValue: searchText ? [searchText] : null,
      onFilter: (value, record) => {
        return (
          record.title.toLowerCase().includes(value.toLowerCase()) ||
          record.programID.toLowerCase().includes(value.toLowerCase()) ||
          record.description.toLowerCase().includes(value.toLowerCase()) ||
          record.departmentName?.toLowerCase().includes(value.toLowerCase())
        );
      },
    },
    {
      title: "Type",
      dataIndex: "type",
      key: "type",
      render: (type) => {
        const colorMap = {
          ONLINE: "blue",
          OFFLINE: "green",
        };
        return <Tag color={colorMap[type] || "default"}>{type}</Tag>;
      },
      filters: [
        { text: "Online", value: "ONLINE" },
        { text: "Offline", value: "OFFLINE" },
      ],
      onFilter: (value, record) => record.type === value,
    },
    {
      title: "Participants",
      key: "participants",
      render: (_, record) => {
        const percentage =
          (record.currentParticipants / record.maxParticipants) * 100;
        return (
          <div className="flex items-center gap-2">
            <Tooltip
              title={`${record.currentParticipants} out of ${record.maxParticipants} participants`}
            >
              <div className="w-32">
                <Progress
                  percent={percentage}
                  size="small"
                  status={percentage === 100 ? "success" : "active"}
                  format={() =>
                    `${record.currentParticipants}/${record.maxParticipants}`
                  }
                />
              </div>
            </Tooltip>
            <Button
              type="text"
              size="small"
              icon={<TeamOutlined />}
              onClick={(e) => handleViewParticipants(record, e)}
              className="text-blue-500 hover:text-blue-700 hover:bg-blue-50"
            >
              View
            </Button>
          </div>
        );
      },
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status) => {
        let color = "green";
        let icon = <CheckCircleOutlined />;
        let text = "Active";

        if (status === "CLOSED") {
          color = "red";
          icon = <CloseCircleOutlined />;
          text = "Closed";
        } else if (status === "FULL") {
          color = "orange";
          icon = <TeamOutlined />;
          text = "Full";
        }

        return (
          <Tag color={color} icon={icon}>
            {text}
          </Tag>
        );
      },
      filters: [
        { text: "Active", value: "ACTIVE" },
        { text: "Full", value: "FULL" },
        { text: "Closed", value: "CLOSED" },
      ],
      onFilter: (value, record) => record.status === value,
    },
    {
      title: "Schedule",
      key: "schedule",
      render: (_, record) => (
        <div className="text-xs">
          <div>
            <CalendarOutlined className="mr-1 text-green-500" />
            Start: {formatDate(record.startDate)}
          </div>
          <div className="mt-1">
            <ClockCircleOutlined className="mr-1 text-blue-500" />
            {record.weeklySchedule?.weeklyAt || "N/A"}:{" "}
            {record.weeklySchedule?.startTime?.substring(0, 5) || "N/A"} -{" "}
            {record.weeklySchedule?.endTime?.substring(0, 5) || "N/A"}
          </div>
        </div>
      ),
    },
    {
      title: "Actions",
      key: "actions",
      render: (_, record) => (
        <Button
          type="primary"
          icon={<EditOutlined />}
          onClick={() => handleUpdate(record)}
          className="bg-custom-green hover:bg-custom-green/90"
        >
          Edit
        </Button>
      ),
    },
  ];

  // Participant table columns for the drawer
  const participantColumns = [
    {
      title: "Student",
      dataIndex: "fullName",
      key: "fullName",
      render: (text, record) => (
        <div className="flex items-center">
          <Avatar
            icon={<UserOutlined />}
            className="mr-2"
            style={{
              backgroundColor: record.gender === "MALE" ? "#1890ff" : "#ff6b81",
            }}
          />
          <div>
            <div className="font-medium">{text}</div>
            <div className="text-xs text-gray-500">ID: {record.studentId}</div>
          </div>
        </div>
      ),
    },
    {
      title: "Contact",
      dataIndex: "email",
      key: "contact",
      render: (email, record) => (
        <div className="text-sm">
          <div className="flex items-center">
            <MailOutlined className="mr-2 text-gray-400" />
            {email || "N/A"}
          </div>
          <div className="flex items-center mt-1">
            <PhoneOutlined className="mr-2 text-gray-400" />
            {record.phone || "N/A"}
          </div>
        </div>
      ),
    },
    {
      title: "School",
      dataIndex: "schoolName",
      key: "school",
      render: (text, record) => (
        <div>
          <div>{text || "N/A"}</div>
          <div className="text-xs text-gray-500">
            Grade {record.grade} - {record.className}
          </div>
        </div>
      ),
    },
    {
      title: "Assessment Scores",
      key: "scores",
      render: (_, record) => (
        <div className="flex flex-wrap gap-1">
          {record.anxietyScore !== undefined && (
            <Tooltip title="Anxiety Score">
              <Tag color="blue">Anxiety: {record.anxietyScore}</Tag>
            </Tooltip>
          )}
          {record.depressionScore !== undefined && (
            <Tooltip title="Depression Score">
              <Tag color="purple">Depression: {record.depressionScore}</Tag>
            </Tooltip>
          )}
          {record.stressScore !== undefined && (
            <Tooltip title="Stress Score">
              <Tag color="orange">Stress: {record.stressScore}</Tag>
            </Tooltip>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="">
      <div className="">
        <div>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
            <div>
              <Title level={2} className="m-0">
                Program Management
              </Title>
              <Text type="secondary">View and update existing programs</Text>
            </div>

            <div className="flex gap-3">
              <Input
                placeholder="Search programs..."
                prefix={<SearchOutlined className="text-gray-400" />}
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                className="w-64"
              />
              <Button
                type="primary"
                onClick={() => navigate("/add-program")}
                className="bg-custom-green hover:bg-custom-green/90"
              >
                Create New Program
              </Button>
            </div>
          </div>

          {/* Filters Row */}
          <div className="mb-4 bg-gray-50 p-3 rounded-lg border border-gray-100">
            <div className="flex flex-wrap justify-between items-center gap-4">
              <div className="flex items-center gap-2">
                <Text type="secondary">Type:</Text>
                <Segmented
                  options={[
                    { label: "All", value: "All" },
                    { label: "Online", value: "ONLINE" },
                    { label: "Offline", value: "OFFLINE" },
                  ]}
                  value={filterType}
                  onChange={setFilterType}
                  className="bg-white"
                />
              </div>

              <div className="flex items-center gap-2">
                <Text type="secondary">Sort:</Text>
                <Segmented
                  options={[
                    {
                      label: (
                        <Tooltip title="Newest First">
                          <div className="flex items-center">
                            <SortDescendingOutlined />
                          </div>
                        </Tooltip>
                      ),
                      value: "newest",
                    },
                    {
                      label: (
                        <Tooltip title="Oldest First">
                          <div className="flex items-center">
                            <SortAscendingOutlined />
                          </div>
                        </Tooltip>
                      ),
                      value: "oldest",
                    },
                    {
                      label: (
                        <Tooltip title="Alphabetical">
                          <div className="flex items-center">A-Z</div>
                        </Tooltip>
                      ),
                      value: "alphabetical",
                    },
                  ]}
                  value={sortOrder}
                  onChange={setSortOrder}
                  className="bg-white"
                />

                <Button
                  icon={<ReloadOutlined spin={refreshing} />}
                  onClick={fetchProgramsList}
                  className="ml-2"
                >
                  Refresh
                </Button>
              </div>
            </div>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <Spin size="large" />
              <div className="mt-4 text-gray-500">Loading programs...</div>
            </div>
          ) : programs.length === 0 ? (
            <Empty
              description="No programs found"
              image={Empty.PRESENTED_IMAGE_SIMPLE}
            />
          ) : (
            <Table
              dataSource={filteredPrograms}
              columns={columns}
              rowKey="programID"
              pagination={{ pageSize: 10 }}
              className="border rounded-lg overflow-hidden"
              expandable={{
                expandedRowRender: (record) => (
                  <div className="py-3 px-4 bg-gray-50 rounded-lg">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-4">
                      <div>
                        <p className="text-gray-500 mb-1 text-sm">
                          Description
                        </p>
                        <p className="text-gray-800">{record.description}</p>
                      </div>
                      <div>
                        <p className="text-gray-500 mb-1 text-sm">Details</p>
                        <div className="flex flex-wrap gap-2">
                          <Tag icon={<ClockCircleOutlined />} color="blue">
                            {record.duration} Weeks
                          </Tag>
                          <Tag icon={<UserOutlined />} color="purple">
                            {record.facilitatorName}
                          </Tag>
                          {record.departmentName && (
                            <Tag icon={<EnvironmentOutlined />} color="cyan">
                              {record.departmentName}
                            </Tag>
                          )}
                        </div>
                      </div>
                      <div>
                        <p className="text-gray-500 mb-1 text-sm">Tags</p>
                        <div className="flex flex-wrap gap-2">
                          {record.tags &&
                            record.tags.map((tag, index) => (
                              <Tag key={index} color="gold">
                                {tag.tagName || tag}
                              </Tag>
                            ))}
                          {(!record.tags || record.tags.length === 0) && (
                            <Text type="secondary">No tags available</Text>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ),
              }}
            />
          )}
        </div>
      </div>

      {/* Participants Drawer */}
      <Drawer
        title={
          <div className="flex items-center gap-2">
            <TeamOutlined className="text-custom-green" />
            <span>{selectedProgram?.title} - Participants</span>
          </div>
        }
        placement="right"
        width={900}
        onClose={() => setParticipantsDrawerVisible(false)}
        open={participantsDrawerVisible}
        extra={
          <Space>
            <Button onClick={() => setParticipantsDrawerVisible(false)}>
              Close
            </Button>
          </Space>
        }
      >
        {loadingParticipants ? (
          <div className="flex justify-center py-12">
            <Spin size="large" />
          </div>
        ) : (
          <div>
            {/* Program Details Section */}
            <div className="mb-6 bg-gray-50 p-4 rounded-lg">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Text type="secondary">Start Date</Text>
                  <div className="font-medium">
                    {formatDate(selectedProgram?.startDate)}
                  </div>
                </div>
                <div>
                  <Text type="secondary">Facilitator</Text>
                  <div className="font-medium">
                    {selectedProgram?.facilitatorName}
                  </div>
                </div>
                <div>
                  <Text type="secondary">Department</Text>
                  <div className="font-medium">
                    {selectedProgram?.departmentName}
                  </div>
                </div>
              </div>

              <Divider className="my-4" />

              <div className="flex justify-between items-center">
                <div>
                  <Text type="secondary">Schedule</Text>
                  <div className="font-medium">
                    {selectedProgram?.weeklySchedule?.weeklyAt}s{" "}
                    {selectedProgram?.weeklySchedule?.startTime?.substring(
                      0,
                      5
                    )}{" "}
                    -{" "}
                    {selectedProgram?.weeklySchedule?.endTime?.substring(0, 5)}
                  </div>
                </div>
                <div>
                  <Text type="secondary">Duration</Text>
                  <div className="font-medium">
                    {selectedProgram?.duration} weeks
                  </div>
                </div>
                <div>
                  <Text type="secondary">Type</Text>
                  <div>
                    <Tag
                      color={
                        selectedProgram?.type === "ONLINE" ? "blue" : "green"
                      }
                    >
                      {selectedProgram?.type}
                    </Tag>
                  </div>
                </div>
                <div>
                  <Text type="secondary">Status</Text>
                  <div>
                    <Tag
                      color={
                        selectedProgram?.status === "ACTIVE"
                          ? "green"
                          : selectedProgram?.status === "FULL"
                          ? "orange"
                          : "red"
                      }
                    >
                      {selectedProgram?.status}
                    </Tag>
                  </div>
                </div>
              </div>
            </div>

            {/* Participants Count Summary */}
            <div className="mb-4 flex justify-between items-center">
              <Title level={4} className="m-0">
                <TeamOutlined className="mr-2" />
                Participants ({participants?.enrolled?.length || 0})
              </Title>
              <Tag color="blue" className="px-3 py-1 text-sm">
                {selectedProgram?.currentParticipants}/
                {selectedProgram?.maxParticipants} enrolled
              </Tag>
            </div>

            {/* Alert for no participants */}
            {!participants?.enrolled || participants.enrolled.length === 0 ? (
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <div className="flex items-start">
                  <InfoCircleOutlined className="text-blue-500 text-lg mt-0.5 mr-3" />
                  <div>
                    <Text strong>No participants yet</Text>
                    <div className="text-gray-600 mt-1">
                      This program doesn't have any enrolled participants yet.
                      Participants will appear here once they register.
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              // Participants Table
              <Table
                dataSource={participants.enrolled}
                columns={participantColumns}
                rowKey="studentId"
                pagination={{ pageSize: 10 }}
                className="border rounded-lg overflow-hidden"
              />
            )}
          </div>
        )}
      </Drawer>

      {/* Update Program Modal using the UpdateProgramModal component */}
      <UpdateProgramModal
        visible={updateModalVisible}
        program={selectedProgram}
        onCancel={() => {
          setUpdateModalVisible(false);
          setSelectedProgram(null);
        }}
        onSuccess={handleUpdateSuccess}
      />
    </div>
  );
};

export default UpdateProgram;

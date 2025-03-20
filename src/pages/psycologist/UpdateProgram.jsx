import React, { useEffect, useState } from "react";
import {
  Table,
  Tag,
  Button,
  Space,
  message,
  Modal,
  Tooltip,
  Card,
  Input,
  Badge,
  Avatar,
  Dropdown,
  Menu,
  Typography,
  Segmented,
  Empty,
} from "antd";
import {
  EditOutlined,
  DeleteOutlined,
  ReloadOutlined,
  ExclamationCircleOutlined,
  SearchOutlined,
  CalendarOutlined,
  TeamOutlined,
  FilterOutlined,
  MoreOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  DownloadOutlined,
  SortAscendingOutlined,
  SortDescendingOutlined,
} from "@ant-design/icons";
import { useProgramStore } from "../../stores/programStore";
import UpdateProgramModal from "../../components/UpdateProgramModal";

const { Title, Text } = Typography;

const UpdateProgram = () => {
  const { fetchPrograms, loading } = useProgramStore();
  const [programs, setPrograms] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [updateModalVisible, setUpdateModalVisible] = useState(false);
  const [selectedProgram, setSelectedProgram] = useState(null);
  const [filterType, setFilterType] = useState("All");
  const [sortOrder, setSortOrder] = useState("newest");

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
      message.error("Failed to fetch programs");
    } finally {
      setRefreshing(false);
    }
  };

  // Handle program deletion
  const handleDelete = (programId) => {
    Modal.confirm({
      title: "Delete Program",
      icon: <ExclamationCircleOutlined className="text-red-500" />,
      content: (
        <div>
          <p className="text-gray-700 mb-2">
            Are you sure you want to delete this program?
          </p>
          <p className="text-red-500 text-sm">
            This action cannot be undone and will remove all participant data.
          </p>
        </div>
      ),
      okText: "Yes, Delete",
      okType: "danger",
      okButtonProps: { className: "bg-red-500 hover:bg-red-600" },
      cancelText: "Cancel",
      className: "delete-confirmation-modal",
      onOk: async () => {
        message.info("Delete functionality will be implemented");
        // TODO: Implement delete API call
      },
    });
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
          program.description.toLowerCase().includes(searchText.toLowerCase())
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

  // Stats cards data
  const stats = [
    {
      title: "Total Programs",
      value: programs.length,
      icon: <CalendarOutlined className="text-blue-500" />,
      color: "bg-blue-50",
    },
    {
      title: "Active Programs",
      value: programs.filter((p) => p.status === "ACTIVE").length,
      icon: <CheckCircleOutlined className="text-green-500" />,
      color: "bg-green-50",
    },
    {
      title: "Full Programs",
      value: programs.filter((p) => p.status === "FULL").length,
      icon: <TeamOutlined className="text-orange-500" />,
      color: "bg-orange-50",
    },
  ];

  // Define table columns
  const columns = [
    {
      title: "Program Title",
      dataIndex: "title",
      key: "title",
      width: "25%",
      render: (text, record) => (
        <div className="py-2">
          <div className="font-medium text-gray-800 flex items-center">
            {text}
            {record.type === "ONLINE" && (
              <Badge
                count="Online"
                style={{ backgroundColor: "#1890ff" }}
                className="ml-2"
              />
            )}
          </div>
          <div className="text-sm text-gray-500 mt-1 line-clamp-2">
            {record.description}
          </div>
          <div className="mt-2 flex flex-wrap gap-1">
            {record.tags &&
              record.tags.map((tag) => (
                <Tag key={tag.tagId} color="blue" className="text-xs py-0.5">
                  {tag.tagName}
                </Tag>
              ))}
          </div>
        </div>
      ),
    },
    {
      title: "Schedule",
      dataIndex: "weeklySchedule",
      key: "schedule",
      width: "20%",
      render: (schedule, record) => (
        <div className="text-sm">
          <div className="flex items-center mb-1">
            <CalendarOutlined className="mr-2 text-blue-500" />
            <span className="font-medium">{schedule.weeklyAt}s</span>
          </div>
          <div className="flex items-center text-gray-500">
            <ClockCircleOutlined className="mr-2 text-gray-400" />
            {schedule.startTime.substring(0, 5)} -{" "}
            {schedule.endTime.substring(0, 5)}
          </div>
          <div className="mt-2 text-xs text-gray-500">
            Starts: {new Date(record.startDate).toLocaleDateString()}
          </div>
        </div>
      ),
    },
    {
      title: "Department",
      dataIndex: "departmentName",
      key: "department",
      width: "15%",
      render: (dept) => (
        <div className="text-sm">
          <div className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-center">
            {dept}
          </div>
        </div>
      ),
    },
    {
      title: "Participants",
      key: "participants",
      width: "15%",
      render: (_, record) => {
        const percentage =
          (record.currentParticipants / record.maxParticipants) * 100;
        let color = "bg-green-500";
        if (percentage >= 90) color = "bg-red-500";
        else if (percentage >= 70) color = "bg-orange-500";

        return (
          <div className="text-sm">
            <div className="flex items-center justify-between mb-1">
              <span className="font-medium">
                {record.currentParticipants}/{record.maxParticipants}
              </span>
              <span className="text-xs text-gray-500">
                {Math.round(percentage)}%
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className={`${color} h-2 rounded-full`}
                style={{ width: `${percentage}%` }}
              />
            </div>
          </div>
        );
      },
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      width: "10%",
      render: (status) => {
        const colorMap = {
          ACTIVE: { color: "green", icon: <CheckCircleOutlined /> },
          FULL: { color: "orange", icon: <TeamOutlined /> },
          CLOSED: { color: "red", icon: <CloseCircleOutlined /> },
        };
        const statusInfo = colorMap[status] || { color: "default", icon: null };

        return (
          <Tag
            color={statusInfo.color}
            icon={statusInfo.icon}
            className="px-2 py-1 flex items-center w-fit"
          >
            {status.charAt(0) + status.slice(1).toLowerCase()}
          </Tag>
        );
      },
    },
    {
      title: "Actions",
      key: "actions",
      width: "10%",
      render: (_, record) => (
        <Dropdown
          overlay={
            <Menu>
              <Menu.Item
                key="edit"
                icon={<EditOutlined className="text-blue-500" />}
                onClick={() => handleUpdate(record)}
              >
                Edit Program
              </Menu.Item>
              {/* <Menu.Item
                key="delete"
                icon={<DeleteOutlined className="text-red-500" />}
                onClick={() => handleDelete(record.programID)}
                danger
              >
                Delete Program
              </Menu.Item> */}
            </Menu>
          }
          trigger={["click"]}
        >
          <Button
            icon={<MoreOutlined />}
            className="border-none shadow-none hover:bg-gray-100 rounded-full"
          />
        </Dropdown>
      ),
    },
  ];

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header Section */}
      <div className="mb-6 flex flex-col md:flex-row justify-between items-start md:items-center">
        {/* <div>
          <Title level={2} className="text-gray-800 m-0">
            Program Management
          </Title>
          <Text className="text-gray-600">
            Manage and monitor all available programs
          </Text>
        </div> */}
        <Button
          type="primary"
          icon={<ReloadOutlined spin={refreshing} />}
          onClick={fetchProgramsList}
          loading={loading}
          className="bg-primary-green hover:bg-primary-green/90 mt-4 md:mt-0"
        >
          Refresh List
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {stats.map((stat, index) => (
          <Card
            key={index}
            className={`${stat.color} border-none shadow-sm hover:shadow-md transition-shadow`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">{stat.title}</p>
                <p className="text-2xl font-semibold mt-1">{stat.value}</p>
              </div>
              <div className="p-3 rounded-full bg-white/80 shadow-sm">
                {stat.icon}
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Search and Filters Bar */}
      <Card className="mb-6 shadow-sm">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex flex-col sm:flex-row items-center gap-4 w-full md:w-auto">
            <Input
              placeholder="Search programs..."
              prefix={<SearchOutlined className="text-gray-400" />}
              className="w-full sm:w-64"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              allowClear
            />
            <Segmented
              options={[
                { label: "All Types", value: "All" },
                { label: "Online", value: "ONLINE" },
                { label: "Offline", value: "OFFLINE" },
              ]}
              value={filterType}
              onChange={setFilterType}
              className="bg-gray-100 p-1 rounded-lg"
            />
          </div>

          <div className="flex items-center gap-2">
            <Text className="text-gray-500 mr-2">Sort by:</Text>
            <Segmented
              options={[
                {
                  label: (
                    <Tooltip title="Newest First">
                      <div className="flex items-center">
                        <SortDescendingOutlined />
                        <span className="ml-1 hidden sm:inline">Newest</span>
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
                        <span className="ml-1 hidden sm:inline">Oldest</span>
                      </div>
                    </Tooltip>
                  ),
                  value: "oldest",
                },
                {
                  label: (
                    <Tooltip title="Alphabetical">
                      <div className="flex items-center">
                        <span className="font-bold">A-Z</span>
                      </div>
                    </Tooltip>
                  ),
                  value: "alphabetical",
                },
              ]}
              value={sortOrder}
              onChange={setSortOrder}
              className="bg-gray-100 p-1 rounded-lg"
            />
          </div>
        </div>
      </Card>

      {/* Programs Table */}
      <Card className="shadow-sm">
        <Table
          columns={columns}
          dataSource={filteredPrograms}
          rowKey="programID"
          loading={loading}
          pagination={{
            pageSize: 10,
            showSizeChanger: false,
            showTotal: (total) => `Total ${total} programs`,
            className: "pagination-custom",
          }}
          className="programs-table"
          rowClassName="hover:bg-blue-50 transition-colors"
          locale={{
            emptyText: (
              <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description={
                  <span className="text-gray-500">
                    {searchText
                      ? "No programs match your search"
                      : "No programs available"}
                  </span>
                }
              />
            ),
          }}
        />
      </Card>

      <UpdateProgramModal
        visible={updateModalVisible}
        program={selectedProgram}
        onCancel={() => {
          setUpdateModalVisible(false);
          setSelectedProgram(null);
        }}
        onSuccess={handleUpdateSuccess}
      />

      {/* Add some custom styles */}
      <style jsx global>{`
        .programs-table .ant-table-thead > tr > th {
          background-color: #f8fafc;
          font-weight: 600;
          color: #4b5563;
        }
        .programs-table .ant-table-tbody > tr:hover > td {
          background-color: #f0f9ff;
        }
        .pagination-custom {
          margin-top: 1rem;
        }
        .delete-confirmation-modal .ant-modal-content {
          border-radius: 8px;
        }
        .custom-success-message {
          display: flex;
          align-items: center;
        }
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
    </div>
  );
};

export default UpdateProgram;

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
} from "antd";
import {
  EditOutlined,
  DeleteOutlined,
  ReloadOutlined,
  ExclamationCircleOutlined,
  SearchOutlined,
  CalendarOutlined,
  TeamOutlined,
} from "@ant-design/icons";
import { useProgramStore } from "../../stores/programStore";
import UpdateProgramModal from "../../components/UpdateProgramModal";

const UpdateProgram = () => {
  const { fetchPrograms, loading } = useProgramStore();
  const [programs, setPrograms] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [updateModalVisible, setUpdateModalVisible] = useState(false);
  const [selectedProgram, setSelectedProgram] = useState(null);

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
      content:
        "Are you sure you want to delete this program? This action cannot be undone.",
      okText: "Yes, Delete",
      okType: "danger",
      cancelText: "No",
      className: "delete-confirmation-modal",
      onOk: async () => {
        message.info("Delete functionality will be implemented");
        // TODO: Implement delete API call
      },
    });
  };

  // Handle program update
  const handleUpdate = (program) => {
    console.log("Selected program for update:", program); // Debug log
    if (!program || !program.programID) {
      message.error("Invalid program selected");
      return;
    }
    setSelectedProgram(program);
    setUpdateModalVisible(true);
  };

  // Add this function to handle successful updates
  const handleUpdateSuccess = () => {
    setUpdateModalVisible(false);
    setSelectedProgram(null);
    fetchProgramsList(); // Refresh the programs list
  };

  const filteredPrograms = programs.filter(
    (program) =>
      program.title.toLowerCase().includes(searchText.toLowerCase()) ||
      program.description.toLowerCase().includes(searchText.toLowerCase())
  );

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
      icon: <TeamOutlined className="text-green-500" />,
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
          <div className="font-medium text-gray-800">{text}</div>
          <div className="text-sm text-gray-500 mt-1">{record.description}</div>
        </div>
      ),
    },
    {
      title: "Type",
      dataIndex: "type",
      key: "type",
      width: "10%",
      render: (type) => (
        <Tag color={type === "ONLINE" ? "blue" : "green"}>
          {type.charAt(0) + type.slice(1).toLowerCase()}
        </Tag>
      ),
    },
    {
      title: "Schedule",
      dataIndex: "weeklySchedule",
      key: "schedule",
      width: "20%",
      render: (schedule) => (
        <div className="text-sm">
          <div>{schedule.weeklyAt}s</div>
          <div className="text-gray-500">
            {schedule.startTime.substring(0, 5)} -{" "}
            {schedule.endTime.substring(0, 5)}
          </div>
        </div>
      ),
    },
    {
      title: "Participants",
      key: "participants",
      width: "15%",
      render: (_, record) => (
        <div className="text-sm">
          {record.currentParticipants}/{record.maxParticipants}
          <div className="w-full bg-gray-200 rounded-full h-1.5 mt-1">
            <div
              className="bg-primary-green h-1.5 rounded-full"
              style={{
                width: `${
                  (record.currentParticipants / record.maxParticipants) * 100
                }%`,
              }}
            />
          </div>
        </div>
      ),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      width: "10%",
      render: (status) => {
        const colorMap = {
          ACTIVE: "green",
          FULL: "orange",
          CLOSED: "red",
        };
        return (
          <Tag color={colorMap[status] || "default"}>
            {status.charAt(0) + status.slice(1).toLowerCase()}
          </Tag>
        );
      },
    },
    {
      title: "Actions",
      key: "actions",
      width: "15%",
      render: (_, record) => (
        <Space>
          <Tooltip title="Edit Program">
            <Button
              icon={<EditOutlined />}
              onClick={() => handleUpdate(record)}
              className="text-blue-600 hover:text-blue-500"
            />
          </Tooltip>
          <Tooltip title="Delete Program">
            <Button
              icon={<DeleteOutlined />}
              onClick={() => handleDelete(record.programID)}
              className="text-red-600 hover:text-red-500"
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header Section */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Program Management</h1>
        <p className="text-gray-600">
          Manage and monitor all available programs
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {stats.map((stat, index) => (
          <Card key={index} className={`${stat.color} border-none shadow-sm`}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">{stat.title}</p>
                <p className="text-2xl font-semibold mt-1">{stat.value}</p>
              </div>
              <div className="p-3 rounded-full bg-white/80">{stat.icon}</div>
            </div>
          </Card>
        ))}
      </div>

      {/* Search and Actions Bar */}
      <Card className="mb-6">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <Input
            placeholder="Search programs..."
            prefix={<SearchOutlined className="text-gray-400" />}
            className="max-w-md"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            allowClear
          />
          <Button
            type="primary"
            icon={<ReloadOutlined spin={refreshing} />}
            onClick={fetchProgramsList}
            loading={loading}
            className="bg-primary-green hover:bg-primary-green/90"
          >
            Refresh List
          </Button>
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
      `}</style>
    </div>
  );
};

export default UpdateProgram;

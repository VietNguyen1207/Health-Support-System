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
} from "antd";
import { EditOutlined, EyeOutlined, ReloadOutlined } from "@ant-design/icons";
import { useState, useEffect } from "react";
import dayjs from "dayjs";
import AppointmentDetail from "./AppointmentDetail";

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

  // Fetch appointments on mount and when filters change
  useEffect(() => {
    handleSearch();
  }, []);

  const handleSearch = () => {
    const params = {
      ...filters,
      startDate: filters.startDate?.format("YYYY-MM-DD"),
      endDate: filters.endDate?.format("YYYY-MM-DD"),
    };
    fetchAllAppointmentRecords(params);
  };

  const handleReset = () => {
    setFilters({
      status: [],
      startDate: null,
      endDate: null,
    });
    fetchAllAppointmentRecords({});
  };

  const handleViewAppointment = async (record) => {
    const details = await GetDetails(record.appointmentID);
    setSelectedAppointment(details);
    setIsDetailModalOpen(true);
  };

  const columns = [
    {
      title: "Appointment ID",
      dataIndex: "appointmentID",
      key: "appointmentID",
      width: 120,
    },
    {
      title: "Student",
      dataIndex: "studentName",
      key: "studentName",
      render: (name, record) => (
        <div>
          <div>{name}</div>
          <div className="text-xs text-gray-500">{record.studentID}</div>
        </div>
      ),
    },
    {
      title: "Psychologist",
      dataIndex: "psychologistName",
      key: "psychologistName",
      render: (name, record) => (
        <div>
          <div>{name}</div>
          <div className="text-xs text-gray-500">{record.psychologistID}</div>
        </div>
      ),
    },
    {
      title: "Date & Time",
      key: "datetime",
      render: (_, record) => (
        <div>
          <div>{record.slotDate}</div>
          <div className="text-xs text-gray-500">
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
      render: (status) => (
        <Tag
          color={
            status === "SCHEDULED"
              ? "blue"
              : status === "COMPLETED"
              ? "green"
              : status === "CANCELLED"
              ? "red"
              : status === "IN_PROGRESS"
              ? "orange"
              : "default"
          }>
          {status}
        </Tag>
      ),
    },
    {
      title: "Last Updated",
      dataIndex: "updatedAt",
      key: "updatedAt",
      render: (date) => dayjs(date).format("YYYY-MM-DD HH:mm:ss"),
      sorter: (a, b) => dayjs(a.updatedAt).unix() - dayjs(b.updatedAt).unix(),
    },
    {
      title: "Actions",
      key: "actions",
      width: 150,
      render: (_, record) => (
        <Space>
          <Button
            type="primary"
            icon={<EyeOutlined />}
            size="small"
            onClick={() => handleViewAppointment(record)}></Button>
          <Button
            icon={<EditOutlined />}
            size="small"
            disabled={["COMPLETED", "CANCELLED"].includes(
              record.status
            )}></Button>
        </Space>
      ),
    },
  ];

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Appointment Management</h1>
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

      <Card className="mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
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

          <Select
            mode="multiple"
            style={{ width: "100%" }}
            placeholder="Status"
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

        <div className="flex justify-end mt-4 space-x-2">
          <Button onClick={handleReset} icon={<ReloadOutlined />}>
            Reset
          </Button>
          <Button type="primary" onClick={handleSearch}>
            Search
          </Button>
        </div>
      </Card>

      <Table
        columns={columns}
        dataSource={appointments}
        loading={loading}
        rowKey="appointmentID"
        pagination={{
          total: appointments?.length,
          pageSize: 10,
          showSizeChanger: true,
          showTotal: (total) => `Total ${total} appointments`,
        }}
        scroll={{ x: "max-content" }}
      />

      <AppointmentDetail
        open={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        appointmentData={selectedAppointment}
      />
    </div>
  );
}

export default AppointmentManagement;

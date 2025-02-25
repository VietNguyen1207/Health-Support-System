import { useEffect, useState } from "react";
import TableComponent from "../../components/TableComponent";
import { Button, Flex, message, Popconfirm, Typography, Space } from "antd";
import TagComponent from "../../components/TagComponent";
import { transformString } from "../../utils/Helper";
import dayjs from "dayjs";
import { useManagerStore } from "../../stores/managerStore";
import { ReloadOutlined } from "@ant-design/icons";

function ApplicationManagement() {
  const { fetchLeaveRequests, updateLeaveRequest, loading } = useManagerStore();
  const [data, setData] = useState([]);

  const fetchData = async () => {
    try {
      const data = await fetchLeaveRequests();
      setData(data);
    } catch (error) {
      console.error("Error fetching leave requests:", error);
    }
  };

  const handleUpdate = async (record, approve) => {
    try {
      await updateLeaveRequest(record.requestId, approve);
      message.success("Leave request updated successfully");
      fetchData();
    } catch (error) {
      console.error("Error updating leave request:", error);
      // message.error("Failed to cancel leave request");
    }
  };

  const columns = [
    {
      title: "Request ID",
      dataIndex: "requestId",
    },
    {
      title: "Psychologist Name",
      dataIndex: "psychologistName",
      sorter: (a, b) => a.psychologistName.localeCompare(b.psychologistName),
      filterSearch: true,
      onFilter: (value, record) =>
        record.psychologistName.toLowerCase().includes(value.toLowerCase()),
      filters: data
        .map((item) => item.psychologistName)
        .filter((value, index, self) => self.indexOf(value) === index)
        .map((name) => ({ text: name, value: name })),
    },
    {
      title: "Start Date",
      dataIndex: "startDate",
      render: (text) => new Date(text).toLocaleDateString(),
      sorter: (a, b) => new Date(a.startDate) - new Date(b.startDate),
      filterSearch: true,
      onFilter: (value, record) => {
        const recordDate = new Date(record.startDate).toLocaleDateString();
        return recordDate.toLowerCase().includes(value.toLowerCase());
      },
      filters: data
        .map((item) => new Date(item.startDate).toLocaleDateString())
        .filter((value, index, self) => self.indexOf(value) === index)
        .map((date) => ({ text: date, value: date })),
      width: "10%",
    },
    {
      title: "End Date",
      dataIndex: "endDate",
      render: (text) => new Date(text).toLocaleDateString(),
    },
    {
      title: "Reason",
      dataIndex: "reason",
      width: "25%",
    },
    {
      title: "Created At",
      dataIndex: "createdAt",
      render: (text) => dayjs(text).format("DD/MM/YYYY HH:mm:ss"),
      sorter: (a, b) => new Date(a.createdAt) - new Date(b.createdAt),
      width: "15%",
    },
    {
      title: "Status",
      dataIndex: "status",
      render: (value) => {
        const transformedValue = transformString(value);
        return (
          <TagComponent
            color={
              transformedValue === "Pending"
                ? "orange"
                : transformedValue === "Approved"
                ? "green"
                : transformedValue === "Cancelled"
                ? "red"
                : transformedValue === "Expired"
                ? "gray"
                : transformedValue === "Rejected"
                ? "volcano"
                : "default"
            }
            tag={value}
          />
        );
      },
      filters: [
        {
          text: "Pending",
          value: "PENDING",
        },
        {
          text: "Approved",
          value: "APPROVED",
        },
        {
          text: "Cancelled",
          value: "CANCELLED",
        },
        {
          text: "Expired",
          value: "EXPIRED",
        },
        {
          text: "Rejected",
          value: "REJECTED",
        },
      ],
      onFilter: (value, record) => record.status.includes(value),
      width: "10%",
    },
    {
      title: "",
      key: "actions",
      width: "5%",
      render: (_, record) =>
        record.status === "PENDING" && (
          <Flex align="center" justify="end" gap={10} vertical>
            <Popconfirm
              className="w-full"
              title="Approve Request"
              description="Are you sure you want to approve request?"
              onConfirm={() => handleUpdate(record, true)}
              okText="Yes"
              cancelText="No">
              <Button
                style={{
                  border: "1px solid #4a7c59",
                  color: "#4a7c59",
                }}>
                Approve
              </Button>
            </Popconfirm>
            <Popconfirm
              className="w-full"
              title="Reject Request"
              description="Are you sure you want to reject request?"
              onConfirm={() => handleUpdate(record, false)}
              okText="Yes"
              cancelText="No">
              <Button danger>Reject</Button>
            </Popconfirm>
          </Flex>
        ),
    },
  ];

  useEffect(() => {
    fetchData();
    // console.log(data);
  }, []);

  return (
    <div className="p-6">
      <Flex justify="space-between" align="center" className="mb-6">
        <Typography.Title level={2} style={{ margin: 0 }}>
          Application Management
        </Typography.Title>
        <Space>
          <Button
            icon={<ReloadOutlined />}
            onClick={fetchData}
            loading={loading}>
            Refresh
          </Button>
        </Space>
      </Flex>
      <TableComponent
        title="Applications"
        columns={columns}
        data={data}
        loading={loading}
        bordered={true}
        showSelection={false}
        setData={setData}
        size="middle"
      />
    </div>
  );
}

export default ApplicationManagement;

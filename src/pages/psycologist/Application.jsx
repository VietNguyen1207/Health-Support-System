import { useEffect, useState } from "react";
import { usePsychologistStore } from "../../stores/psychologistStore";
import TableComponent from "../../components/TableComponent";
import CreateApplication from "./CreateApplication";
import { Button, message, Popconfirm, Typography } from "antd";
import { useAuthStore } from "../../stores/authStore";
import TagComponent from "../../components/TagComponent";
import { transformString } from "../../utils/Helper";

function Application() {
  const { fetchLeaveRequests, cancelLeaveRequest, loading } =
    usePsychologistStore();
  const { user } = useAuthStore();
  const [data, setData] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchData = async () => {
    try {
      const data = await fetchLeaveRequests(user.psychologistId);
      setData(data);
    } catch (error) {
      console.error("Error fetching leave requests:", error);
    }
  };

  const handleCancel = async (record) => {
    try {
      await cancelLeaveRequest(user.psychologistId, record.requestId);
      message.success("Leave request canceled successfully");
      fetchData();
    } catch (error) {
      console.error("Error canceling leave request:", error);
      // message.error("Failed to cancel leave request");
    }
  };

  const columns = [
    {
      title: "Request ID",
      dataIndex: "requestId",
    },
    {
      title: "Start Date",
      dataIndex: "startDate",
      sorter: (a, b) => new Date(a.startDate) - new Date(b.startDate),
    },
    {
      title: "End Date",
      dataIndex: "endDate",
    },
    {
      title: "Reason",
      dataIndex: "reason",
      width: "30%",
    },
    {
      title: "Created At",
      dataIndex: "createdAt",
      render: (text) => new Date(text).toLocaleDateString(),
      sorter: (a, b) => new Date(a.createdAt) - new Date(b.createdAt),
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
                : "red"
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
          <Popconfirm
            title="Cancel Request"
            description="Are you sure you want to cancel request?"
            onConfirm={() => handleCancel(record)}
            okText="Yes"
            cancelText="No">
            <Button danger type="link">
              Cancel
            </Button>
          </Popconfirm>
        ),
    },
  ];

  useEffect(() => {
    fetchData();
    // console.log(data);
  }, []);

  return (
    <div className="general-wrapper h-full">
      <div className="max-w-7xl mx-auto mt-32 space-y-4 px-5 md:px-10">
        <div className="flex justify-between items-center">
          <Typography.Title level={2}>Application Management</Typography.Title>
          <Button type="primary" onClick={() => setIsModalOpen(true)}>
            Create Application
          </Button>
        </div>
        <CreateApplication
          isModalOpen={isModalOpen}
          setIsModalOpen={setIsModalOpen}
          user={user}
          fetchData={fetchData}
        />
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
    </div>
  );
}

export default Application;

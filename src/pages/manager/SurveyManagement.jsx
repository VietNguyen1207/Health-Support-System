import { useSurveyStore } from "../../stores/surveyStore";
import { useEffect, useState } from "react";
import {
  Button,
  Table,
  Modal,
  Form,
  Input,
  Spin,
  Space,
  Typography,
  Popconfirm,
  message,
} from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
} from "@ant-design/icons";

export default function SurveyManagement() {
  const { surveys, loading, fetchSurveys } = useSurveyStore();
  // State for modal and form
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [modalType, setModalType] = useState("create"); // "create" or "edit"
  const [selectedSurvey, setSelectedSurvey] = useState(null);
  const [form] = Form.useForm();

  // Fetch surveys on component mount
  useEffect(() => {
    fetchSurveys();
  }, [fetchSurveys]);

  // Handle modal actions
  const showCreateModal = () => {
    setModalType("create");
    setSelectedSurvey(null);
    form.resetFields();
    setIsModalVisible(true);
  };

  const showEditModal = (survey) => {
    setModalType("edit");
    setSelectedSurvey(survey);
    form.setFieldsValue({
      title: survey.title,
      description: survey.description,
    });
    setIsModalVisible(true);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
  };

  const handleSubmit = async (values) => {
    // Implement create/edit functionality based on modalType
    if (modalType === "create") {
      // Add create survey logic
      message.success("Survey created successfully");
    } else {
      // Add edit survey logic
      message.success("Survey updated successfully");
    }
    setIsModalVisible(false);
    fetchSurveys(); // Refresh survey list
  };

  const handleDelete = async (surveyId) => {
    // Add delete survey logic
    message.success("Survey deleted successfully");
    fetchSurveys(); // Refresh survey list
  };

  const handleViewSurvey = (survey) => {
    // Navigate to survey details/results page
    // e.g., navigate(`/manager/surveys/${survey.id}`);
  };

  // Table columns
  const columns = [
    {
      title: "Title",
      dataIndex: "title",
      key: "title",
      sorter: (a, b) => a.title.localeCompare(b.title),
    },
    {
      title: "Description",
      dataIndex: "description",
      key: "description",
      ellipsis: true,
    },
    {
      title: "Created At",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (text) => new Date(text).toLocaleDateString(),
      sorter: (a, b) => new Date(a.createdAt) - new Date(b.createdAt),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      filters: [
        { text: "Active", value: "active" },
        { text: "Draft", value: "draft" },
        { text: "Closed", value: "closed" },
      ],
      onFilter: (value, record) => record.status === value,
      render: (status) => {
        const statusColors = {
          active: "green",
          draft: "orange",
          closed: "red",
        };
        return <span style={{ color: statusColors[status] }}>{status}</span>;
      },
    },
    {
      title: "Responses",
      dataIndex: "responseCount",
      key: "responseCount",
      sorter: (a, b) => a.responseCount - b.responseCount,
    },
    {
      title: "Actions",
      key: "actions",
      render: (_, record) => (
        <Space>
          <Button
            icon={<EyeOutlined />}
            onClick={() => handleViewSurvey(record)}
            title="View Survey Details"
          />
          <Button
            icon={<EditOutlined />}
            onClick={() => showEditModal(record)}
            title="Edit Survey"
          />
          <Popconfirm
            title="Are you sure you want to delete this survey?"
            onConfirm={() => handleDelete(record.id)}
            okText="Yes"
            cancelText="No">
            <Button icon={<DeleteOutlined />} danger title="Delete Survey" />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: "20px" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginBottom: "20px",
        }}>
        <Typography.Title level={2}>Survey Management</Typography.Title>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={showCreateModal}>
          Create Survey
        </Button>
      </div>

      {loading ? (
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            padding: "50px",
          }}>
          <Spin size="large" />
        </div>
      ) : (
        <Table
          columns={columns}
          dataSource={surveys}
          rowKey="id"
          pagination={{ pageSize: 10 }}
        />
      )}

      <Modal
        title={modalType === "create" ? "Create New Survey" : "Edit Survey"}
        open={isModalVisible}
        onCancel={handleCancel}
        footer={null}>
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Form.Item
            name="title"
            label="Survey Title"
            rules={[
              { required: true, message: "Please enter a survey title" },
            ]}>
            <Input placeholder="Enter survey title" />
          </Form.Item>
          <Form.Item
            name="description"
            label="Description"
            rules={[{ required: true, message: "Please enter a description" }]}>
            <Input.TextArea placeholder="Enter survey description" rows={4} />
          </Form.Item>
          <Form.Item>
            <div
              style={{ display: "flex", justifyContent: "end", gap: "10px" }}>
              <Button onClick={handleCancel}>Cancel</Button>
              <Button type="primary" htmlType="submit">
                {modalType === "create" ? "Create" : "Update"}
              </Button>
            </div>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}

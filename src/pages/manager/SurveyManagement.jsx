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
  message,
  Row,
  Col,
  Card,
  Tag,
  Descriptions,
  Progress,
} from "antd";
import {
  PlusOutlined,
  EditOutlined,
  EyeOutlined,
  FileTextOutlined,
  UserOutlined,
  CalendarOutlined,
} from "@ant-design/icons";
import PropTypes from "prop-types";

export default function SurveyManagement() {
  const { surveys, loading, fetchSurveys } = useSurveyStore();
  // State for modal and form
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [modalType, setModalType] = useState("create"); // "create" or "edit" or "view"
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
      console.log("create survey", values);

      message.success("Survey created successfully");
    } else {
      // Add edit survey logic
      console.log("edit survey", values);
      message.success("Survey updated successfully");
    }
    setIsModalVisible(false);
    fetchSurveys(); // Refresh survey list
  };

  const handleViewSurvey = (survey) => {
    setSelectedSurvey(survey);
    setModalType("view");
    setIsModalVisible(true);
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
      title: "Actions",
      key: "actions",
      render: (_, record) => (
        <Space>
          <Button
            type="primary"
            size="small"
            icon={<EyeOutlined />}
            onClick={() => handleViewSurvey(record)}
            title="View Survey Details"
          />
          <Button
            size="small"
            icon={<EditOutlined />}
            onClick={() => showEditModal(record)}
            title="Edit Survey"
          />
          {/* <Popconfirm
            title="Are you sure you want to delete this survey?"
            onConfirm={() => handleDelete(record.id)}
            okText="Yes"
            cancelText="No">
            <Button icon={<DeleteOutlined />} danger title="Delete Survey" />
          </Popconfirm> */}
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
        title={
          modalType === "create"
            ? "Create New Survey"
            : modalType === "edit"
            ? "Edit Survey"
            : "Survey Details"
        }
        open={isModalVisible}
        onCancel={handleCancel}
        footer={null}
        width={modalType === "view" ? 1000 : 520}>
        {modalType === "view" ? (
          <SurveyDetail survey={selectedSurvey} />
        ) : (
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
              rules={[
                { required: true, message: "Please enter a description" },
              ]}>
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
        )}
      </Modal>
    </div>
  );
}

const { Title } = Typography;

function SurveyDetail({ survey }) {
  // Helper function to format date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Calculate completion percentage
  const getCompletionRate = (studentComplete) => {
    const [completed, total] = studentComplete.split("/");
    return Math.round((parseInt(completed) / parseInt(total)) * 100);
  };

  // Status tag color mapping
  const getStatusColor = (status) => {
    const colors = {
      ACTIVE: "green",
      DRAFT: "orange",
      CLOSED: "red",
    };
    return colors[status] || "default";
  };

  return (
    <div style={{ padding: "24px" }}>
      <Row gutter={[24, 24]}>
        {/* Header Section */}
        <Col span={24}>
          <Card>
            <Space direction="vertical" size="large" style={{ width: "100%" }}>
              <Space
                align="center"
                style={{ justifyContent: "space-between", width: "100%" }}>
                <Title level={2} style={{ margin: 0 }}>
                  {survey.title}
                </Title>
                <Tag
                  color={getStatusColor(survey.status)}
                  style={{ fontSize: "14px" }}>
                  {survey.status}
                </Tag>
              </Space>
              <Typography.Paragraph>{survey.description}</Typography.Paragraph>
            </Space>
          </Card>
        </Col>

        {/* Key Metrics */}
        <Col xs={24} sm={12} lg={8}>
          <Card>
            <Descriptions title="Survey Progress" column={1}>
              <Descriptions.Item>
                <Progress
                  type="circle"
                  percent={getCompletionRate(survey.studentComplete)}
                  format={() => `${survey.studentComplete}`}
                />
              </Descriptions.Item>
            </Descriptions>
          </Card>
        </Col>

        {/* Survey Details */}
        <Col xs={24} sm={12} lg={16}>
          <Card title="Survey Information">
            <Descriptions column={{ xs: 1, sm: 2 }} layout="vertical">
              <Descriptions.Item label="Survey ID">
                <Space>
                  <FileTextOutlined />
                  {survey.id}
                </Space>
              </Descriptions.Item>
              <Descriptions.Item label="Periodic ID">
                {survey.periodicID}
              </Descriptions.Item>
              <Descriptions.Item label="Standard Type">
                {survey.standardType}
              </Descriptions.Item>
              <Descriptions.Item label="Category">
                <Tag color="blue">{survey.category}</Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Questions">
                {survey.numberOfQuestions}
              </Descriptions.Item>
              <Descriptions.Item label="Periodic">
                Every {survey.periodic} days
              </Descriptions.Item>
            </Descriptions>
          </Card>
        </Col>

        {/* Timeline Information */}
        <Col span={24}>
          <Card title="Timeline & Administration">
            <Descriptions column={{ xs: 1, sm: 2, md: 3 }} layout="vertical">
              <Descriptions.Item label="Created By">
                <Space>
                  <UserOutlined />
                  {survey.createBy}
                </Space>
              </Descriptions.Item>
              <Descriptions.Item label="Created At">
                <Space>
                  <CalendarOutlined />
                  {formatDate(survey.createdAt)}
                </Space>
              </Descriptions.Item>
              <Descriptions.Item label="Completion Status">
                <Tag
                  color={
                    survey.completeStatus === "COMPLETED" ? "green" : "orange"
                  }>
                  {survey.completeStatus}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Start Date">
                {formatDate(survey.startDate)}
              </Descriptions.Item>
              <Descriptions.Item label="End Date">
                {formatDate(survey.endDate)}
              </Descriptions.Item>
            </Descriptions>
          </Card>
        </Col>
      </Row>
    </div>
  );
}

SurveyDetail.propTypes = {
  survey: PropTypes.object.isRequired,
};

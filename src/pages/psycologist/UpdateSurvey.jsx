import React, { useState, useEffect } from "react";
import {
  Form,
  Input,
  Button,
  Select,
  Card,
  DatePicker,
  InputNumber,
  Table,
  Tag,
  Space,
  message,
  Spin,
  Typography,
  Drawer,
  Radio,
  Divider,
  Empty,
  Tooltip,
} from "antd";
import {
  SearchOutlined,
  EditOutlined,
  SaveOutlined,
  CloseOutlined,
  ExclamationCircleOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { useSurveyStore } from "../../stores/surveyStore";
import dayjs from "dayjs";

const { TextArea } = Input;
const { Option } = Select;
const { Title, Text } = Typography;

const UpdateSurvey = () => {
  const navigate = useNavigate();
  const { surveys, loading, fetchSurveys, updateSurvey } = useSurveyStore();

  const [form] = Form.useForm();
  const [searchText, setSearchText] = useState("");
  const [selectedSurvey, setSelectedSurvey] = useState(null);
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Survey Standard Types
  const standardTypes = [
    { value: "GAD_7", label: "GAD-7 (Anxiety)" },
    { value: "PHQ_9", label: "PHQ-9 (Depression)" },
    { value: "PSS_10", label: "PSS-10 (Stress)" },
  ];

  // Survey Status Options
  const statusOptions = [
    { value: "ACTIVE", label: "Active" },
    { value: "INACTIVE", label: "Inactive" },
  ];

  // Fetch surveys on component mount
  useEffect(() => {
    fetchSurveys();
  }, [fetchSurveys]);

  // Handle drawer open
  const showDrawer = (survey) => {
    setSelectedSurvey(survey);
    setDrawerVisible(true);
    form.setFieldsValue({
      title: survey.title,
      description: survey.description,
      standType: survey.standardType, // Note the field name change to match API
      status: survey.status || "ACTIVE",
      startDate: survey.startDate ? dayjs(survey.startDate) : null,
      periodic: survey.periodic || 1,
    });
  };

  // Handle drawer close
  const closeDrawer = () => {
    setDrawerVisible(false);
    setSelectedSurvey(null);
    form.resetFields();
  };

  // Handle survey update submission
  const handleSurveyUpdate = async (values) => {
    if (!selectedSurvey) return;

    setSubmitting(true);

    // Format date to YYYY-MM-DD if it exists
    let formattedDate = values.startDate;
    if (formattedDate) {
      formattedDate = formattedDate.format("YYYY-MM-DD");
    }

    // Create the survey update data object
    const updateData = {
      title: values.title,
      description: values.description,
      standType: values.standType, // Match the API field name
      status: values.status,
      startDate: formattedDate,
      periodic: values.periodic || 1,
    };

    try {
      // Use the survey ID from the selected survey
      const surveyId = selectedSurvey.id || selectedSurvey.surveyId;
      await updateSurvey(surveyId, updateData);
      message.success("Survey updated successfully");
      closeDrawer();
      fetchSurveys(); // Refresh the surveys list
    } catch (error) {
      message.error(`Failed to update survey: ${error.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  // Table columns configuration
  const columns = [
    {
      title: "Title",
      dataIndex: "title",
      key: "title",
      sorter: (a, b) => a.title.localeCompare(b.title),
      render: (text, record) => (
        <div>
          <div className="font-medium">{text}</div>
          <div className="text-xs text-gray-500">
            ID: {record.id || record.surveyId}
          </div>
        </div>
      ),
      filteredValue: searchText ? [searchText] : null,
      onFilter: (value, record) => {
        return (
          record.title.toLowerCase().includes(value.toLowerCase()) ||
          (record.id || record.surveyId)
            .toLowerCase()
            .includes(value.toLowerCase()) ||
          (record.standardType || record.standType || "")
            .toLowerCase()
            .includes(value.toLowerCase())
        );
      },
    },
    {
      title: "Type",
      dataIndex: "standardType",
      key: "standardType",
      render: (text) => {
        const typeMap = {
          GAD_7: { color: "blue", label: "Anxiety (GAD-7)" },
          PHQ_9: { color: "purple", label: "Depression (PHQ-9)" },
          PSS_10: { color: "orange", label: "Stress (PSS-10)" },
        };

        const typeInfo = typeMap[text] || {
          color: "default",
          label: text || "Unknown",
        };

        return <Tag color={typeInfo.color}>{typeInfo.label}</Tag>;
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

        if (status === "INACTIVE") {
          color = "red";
          icon = <CloseOutlined />;
          text = "Inactive";
        } else if (status === "PENDING") {
          color = "orange";
          icon = <ClockCircleOutlined />;
          text = "Pending";
        }

        return (
          <Tag color={color} icon={icon}>
            {text}
          </Tag>
        );
      },
    },
    {
      title: "Periodic",
      dataIndex: "periodic",
      key: "periodic",
      render: (periodic) => <Tag color="blue">{periodic || 1}</Tag>,
    },
    {
      title: "Questions",
      key: "questions",
      render: (_, record) => {
        const count = record.questionList?.length || "N/A";
        return <Tag color="cyan">{count} Questions</Tag>;
      },
    },
    {
      title: "Actions",
      key: "actions",
      render: (_, record) => (
        <Button
          type="primary"
          icon={<EditOutlined />}
          onClick={() => showDrawer(record)}
          className="bg-custom-green hover:bg-custom-green/90"
        >
          Edit
        </Button>
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-12 px-4 sm:px-6 lg:px-8 pt-24">
      <div className="max-w-6xl mx-auto">
        <Card className="shadow-lg rounded-2xl mb-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
            <div>
              <Title level={2} className="m-0">
                Manage Surveys
              </Title>
              <Text type="secondary">Update existing surveys</Text>
            </div>

            <div className="flex gap-3">
              <Input
                placeholder="Search surveys..."
                prefix={<SearchOutlined className="text-gray-400" />}
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                className="w-64"
              />
              <Button
                type="primary"
                onClick={() => navigate("/create-test")}
                className="bg-custom-green hover:bg-custom-green/90"
              >
                Create New Survey
              </Button>
            </div>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <Spin size="large" />
              <div className="mt-4 text-gray-500">Loading surveys...</div>
            </div>
          ) : surveys.length === 0 ? (
            <Empty
              description="No surveys found"
              image={Empty.PRESENTED_IMAGE_SIMPLE}
            />
          ) : (
            <Table
              dataSource={surveys}
              columns={columns}
              rowKey={(record) => record.id || record.surveyId}
              pagination={{ pageSize: 10 }}
              className="border rounded-lg overflow-hidden"
            />
          )}
        </Card>
      </div>

      {/* Edit Survey Drawer */}
      <Drawer
        title="Update Survey"
        width={500}
        onClose={closeDrawer}
        open={drawerVisible}
        bodyStyle={{ paddingBottom: 80 }}
        footer={
          <div className="flex justify-end gap-2">
            <Button onClick={closeDrawer}>Cancel</Button>
            <Button
              type="primary"
              onClick={() => form.submit()}
              loading={submitting}
              className="bg-custom-green hover:bg-custom-green/90"
              icon={<SaveOutlined />}
            >
              Save Changes
            </Button>
          </div>
        }
      >
        {selectedSurvey && (
          <Form
            form={form}
            layout="vertical"
            onFinish={handleSurveyUpdate}
            initialValues={{
              title: selectedSurvey.title,
              description: selectedSurvey.description,
              standType: selectedSurvey.standardType,
              status: selectedSurvey.status || "ACTIVE",
              startDate: selectedSurvey.startDate
                ? dayjs(selectedSurvey.startDate)
                : null,
              periodic: selectedSurvey.periodic || 1,
            }}
          >
            <div className="mb-4">
              <Tag color="blue" className="mb-2">
                Survey ID: {selectedSurvey.id || selectedSurvey.surveyId}
              </Tag>
              {selectedSurvey.category && (
                <Tag color="purple" className="mb-2 ml-2">
                  Category: {selectedSurvey.category}
                </Tag>
              )}
            </div>

            <Form.Item
              name="title"
              label="Survey Title"
              rules={[{ required: true, message: "Please enter survey title" }]}
            >
              <Input placeholder="Enter survey title" />
            </Form.Item>

            <Form.Item
              name="description"
              label="Description"
              rules={[
                { required: true, message: "Please enter survey description" },
              ]}
            >
              <TextArea rows={4} placeholder="Enter survey description" />
            </Form.Item>

            <Form.Item
              name="standType"
              label="Standard Type"
              rules={[
                { required: true, message: "Please select standard type" },
              ]}
              tooltip="The type of standardized assessment this survey represents"
            >
              <Select placeholder="Select standard type">
                {standardTypes.map((type) => (
                  <Option key={type.value} value={type.value}>
                    {type.label}
                  </Option>
                ))}
              </Select>
            </Form.Item>

            <Form.Item
              name="status"
              label="Status"
              rules={[{ required: true, message: "Please select status" }]}
            >
              <Radio.Group>
                {statusOptions.map((option) => (
                  <Radio key={option.value} value={option.value}>
                    {option.label}
                  </Radio>
                ))}
              </Radio.Group>
            </Form.Item>

            <Form.Item
              name="startDate"
              label="Start Date"
              rules={[{ required: true, message: "Please select start date" }]}
            >
              <DatePicker className="w-full" />
            </Form.Item>

            <Form.Item
              name="periodic"
              label="Periodic"
              rules={[
                { required: true, message: "Please enter periodic number" },
              ]}
              tooltip="Period number for this survey"
            >
              <InputNumber min={1} className="w-full" />
            </Form.Item>

            <Divider />

            <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
              <div className="flex items-start">
                <ExclamationCircleOutlined className="text-yellow-500 mr-2 mt-1" />
                <div>
                  <Text strong>Note:</Text>
                  <Text className="block text-gray-600">
                    This will only update the survey metadata. Questions cannot
                    be modified using this form.
                  </Text>
                </div>
              </div>
            </div>
          </Form>
        )}
      </Drawer>
    </div>
  );
};

export default UpdateSurvey;

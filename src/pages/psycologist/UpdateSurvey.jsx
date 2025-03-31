import { useState, useEffect } from "react";
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
  message,
  Spin,
  Typography,
  Drawer,
  Radio,
  Divider,
  Empty,
  Progress,
  Tooltip,
  Space,
  Badge,
  Skeleton,
  Row,
  Col,
} from "antd";
import {
  SearchOutlined,
  EditOutlined,
  SaveOutlined,
  CloseOutlined,
  ExclamationCircleOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  UserOutlined,
  CalendarOutlined,
  FileTextOutlined,
  TeamOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { useSurveyStore } from "../../stores/surveyStore";
import dayjs from "dayjs";

const { TextArea } = Input;
const { Option } = Select;
const { Title, Text } = Typography;

const SurveySkeletonLoading = () => (
  <div>
    <div className="mb-6">
      <Skeleton.Input style={{ width: 300 }} active size="large" />
      <Skeleton.Input style={{ width: 200, marginTop: 8 }} active />
    </div>

    <div className="bg-gray-50 p-3 rounded-lg border border-gray-100 mb-4">
      <Skeleton.Button active style={{ width: 100, marginRight: 8 }} />
      <Skeleton.Button active style={{ width: 100, marginRight: 8 }} />
      <Skeleton.Button active style={{ width: 100 }} />
    </div>

    <Skeleton active paragraph={{ rows: 1 }} />

    <Row gutter={[16, 16]} className="mt-4">
      {[...Array(6)].map((_, i) => (
        <Col span={24} key={i}>
          <Skeleton.Input style={{ width: "100%", height: 50 }} active />
          <div className="mt-2">
            <Skeleton.Button active style={{ width: "40%", marginRight: 8 }} />
            <Skeleton.Button active style={{ width: "20%" }} />
          </div>
        </Col>
      ))}
    </Row>
  </div>
);

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

  // Format date helper function
  const formatDate = (dateString) => {
    return dateString
      ? dayjs(dateString).format("MMM DD, YYYY")
      : "Not specified";
  };

  // Calculate completion percentage
  const getCompletionPercentage = (completionString) => {
    if (!completionString) return 0;
    const [completed, total] = completionString.split("/").map(Number);
    return Math.round((completed / total) * 100);
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
          <div className="text-xs text-gray-500 mt-1">
            ID: {record.id || record.surveyId}
            {record.periodicID && (
              <span className="ml-2 text-blue-500">
                Period: {record.periodicID.split("_")[1] || "0"}
              </span>
            )}
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
      title: "Category",
      dataIndex: "category",
      key: "category",
      render: (category) => {
        const colorMap = {
          ANXIETY: "blue",
          DEPRESSION: "purple",
          STRESS: "orange",
        };
        return (
          <Tag color={colorMap[category] || "default"}>
            {category || "Unknown"}
          </Tag>
        );
      },
      filters: [
        { text: "Anxiety", value: "ANXIETY" },
        { text: "Depression", value: "DEPRESSION" },
        { text: "Stress", value: "STRESS" },
      ],
      onFilter: (value, record) => record.category === value,
    },
    {
      title: "Progress",
      key: "studentComplete",
      render: (_, record) => {
        const percentage = getCompletionPercentage(record.studentComplete);
        return (
          <Tooltip title={`${record.studentComplete} students completed`}>
            <div className="w-32">
              <Progress
                percent={percentage}
                size="small"
                status={percentage === 100 ? "success" : "active"}
                format={() => record.studentComplete}
              />
            </div>
          </Tooltip>
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
      filters: [
        { text: "Active", value: "ACTIVE" },
        { text: "Inactive", value: "INACTIVE" },
      ],
      onFilter: (value, record) => record.status === value,
    },
    {
      title: "Time Period",
      key: "timePeriod",
      render: (_, record) => (
        <div className="text-xs">
          <div>
            <CalendarOutlined className="mr-1 text-green-500" />
            Start: {formatDate(record.startDate)}
          </div>
          <div className="mt-1">
            <CalendarOutlined className="mr-1 text-red-500" />
            End: {formatDate(record.endDate)}
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
          onClick={() => showDrawer(record)}
          className="bg-custom-green hover:bg-custom-green/90"
        >
          Edit
        </Button>
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
                Survey Management
              </Title>
              <Text type="secondary">View and update existing surveys</Text>
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
            <SurveySkeletonLoading />
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
                          <Tag icon={<FileTextOutlined />} color="cyan">
                            {record.numberOfQuestions} Questions
                          </Tag>
                          <Tag icon={<ClockCircleOutlined />} color="blue">
                            {record.periodic} Week Period
                          </Tag>
                          <Tag icon={<UserOutlined />} color="purple">
                            {record.createBy}
                          </Tag>
                        </div>
                      </div>
                      <div>
                        <p className="text-gray-500 mb-1 text-sm">
                          Survey Type
                        </p>
                        <Tag color="gold">{record.standardType}</Tag>
                      </div>
                    </div>
                  </div>
                ),
              }}
            />
          )}
        </div>
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
            {/* Survey Details Summary */}
            <div className="mb-4 bg-gray-50 p-3 rounded-lg">
              <div className="flex flex-wrap gap-2 mb-3">
                <Tag color="blue">
                  ID: {selectedSurvey.id || selectedSurvey.surveyId}
                </Tag>
                {selectedSurvey.periodicID && (
                  <Tag color="purple">
                    Period ID: {selectedSurvey.periodicID}
                  </Tag>
                )}
                <Tag color="orange">
                  {selectedSurvey.category || "Unknown Category"}
                </Tag>
              </div>

              {/* Student Completion Data */}
              {selectedSurvey.studentComplete && (
                <div className="mb-3">
                  <Text type="secondary" className="block mb-1">
                    <TeamOutlined className="mr-1" /> Student Completion:
                  </Text>
                  <Progress
                    percent={getCompletionPercentage(
                      selectedSurvey.studentComplete
                    )}
                    size="small"
                    format={() => selectedSurvey.studentComplete}
                  />
                </div>
              )}

              {/* Date Range */}
              <div className="flex flex-wrap gap-4 text-sm">
                <div>
                  <CalendarOutlined className="mr-1 text-green-500" />
                  Start: {formatDate(selectedSurvey.startDate)}
                </div>
                <div>
                  <CalendarOutlined className="mr-1 text-red-500" />
                  End: {formatDate(selectedSurvey.endDate)}
                </div>
                <div>
                  <UserOutlined className="mr-1 text-blue-500" />
                  Created by: {selectedSurvey.createBy || "Unknown"}
                </div>
              </div>
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
              label="Periodic (weeks)"
              rules={[
                { required: true, message: "Please enter periodic number" },
              ]}
              tooltip="Number of weeks before the survey resets"
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

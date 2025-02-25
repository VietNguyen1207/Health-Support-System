import PropTypes from "prop-types";
import { usePsychologistStore } from "../../stores/psychologistStore";
import {
  Modal,
  Form,
  Input,
  DatePicker,
  Button,
  message,
  Typography,
  Popconfirm,
  Space,
} from "antd";
import { CalendarOutlined, FileTextOutlined } from "@ant-design/icons";
import dayjs from "dayjs";

const { RangePicker } = DatePicker;
const { Title } = Typography;
const { TextArea } = Input;

function CreateApplication({ isModalOpen, setIsModalOpen, user, fetchData }) {
  const { postLeaveRequest, loading } = usePsychologistStore();
  const [form] = Form.useForm();

  const handleSubmit = async (values) => {
    try {
      const formattedValues = {
        ...values,
        psychologistId: user.psychologistId,
        startDate: values.dateRange[0].format("YYYY-MM-DD"),
        endDate: values.dateRange[1].format("YYYY-MM-DD"),
      };
      await postLeaveRequest(user.psychologistId, formattedValues);
      message.success("Leave request submitted successfully");
      setIsModalOpen(false);
      form.resetFields();
      fetchData();
    } catch (error) {
      console.log(error);
      message.error("Failed to submit leave request");
    }
  };

  const disabledDate = (current) => {
    // Disable dates before 2 days from now
    return current && current < dayjs().add(2, "day").startOf("day");
  };

  const handleRangePickerChange = (dates) => {
    if (dates) {
      const [start, end] = dates;
      const diffDays = end.diff(start, "day");
      if (diffDays > 2) {
        // message.warning("You can only select up to 3 days");
        form.setFieldValue("dateRange", [start, start.add(2, "day")]);
      }
    }
  };

  return (
    <Modal
      title={
        <div className="flex items-center gap-2 text-gray-700">
          <CalendarOutlined className="text-primary-green" />
          <Title level={4} className="!mb-0">
            Create Leave Application
          </Title>
        </div>
      }
      open={isModalOpen}
      onCancel={() => {
        setIsModalOpen(false);
        form.resetFields();
      }}
      footer={null}
      maskClosable={false}
      width={600}
      className="top-10">
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        className="mt-6">
        <div className="space-y-6">
          {/* Date Range Selection */}
          <Form.Item
            label="Select Date Range"
            name="dateRange"
            rules={[
              {
                required: true,
                message: "Please select your leave dates",
              },
              {
                validator: (_, value) => {
                  if (!value) return Promise.resolve();
                  const [start, end] = value;
                  const diffDays = end.diff(start, "day");
                  if (diffDays > 2) {
                    return Promise.reject(
                      "Leave duration cannot exceed 3 days"
                    );
                  }
                  return Promise.resolve();
                },
              },
              {
                validator: (_, value) => {
                  if (!value) return Promise.resolve();
                  const [start] = value;
                  const today = dayjs();
                  const daysUntilStart = start.diff(today, "day");
                  if (daysUntilStart < 2) {
                    return Promise.reject(
                      "Leave request must be submitted at least 2 days in advance"
                    );
                  }
                  return Promise.resolve();
                },
              },
            ]}
            extra={
              <Space direction="vertical" className="mt-1">
                <div className="flex items-center gap-2 text-gray-500">
                  <div className="w-1.5 h-1.5 rounded-full bg-gray-400" />
                  <Typography.Text type="secondary">
                    Maximum leave duration is 3 days
                  </Typography.Text>
                </div>
                <div className="flex items-center gap-2 text-gray-500">
                  <div className="w-1.5 h-1.5 rounded-full bg-gray-400" />
                  <Typography.Text type="secondary">
                    Leave request must be submitted at least 2 days in advance
                  </Typography.Text>
                </div>
              </Space>
            }>
            <RangePicker
              className="w-full"
              disabledDate={disabledDate}
              format="DD/MM/YYYY"
              placeholder={["Start Date", "End Date"]}
              onChange={handleRangePickerChange}
            />
          </Form.Item>

          {/* Reason Input */}
          <Form.Item
            label="Reason for Leave"
            name="reason"
            rules={[
              {
                required: true,
                message: "Please provide a reason for your leave",
              },
            ]}>
            <TextArea
              placeholder="Enter your reason here..."
              autoSize={{ minRows: 4, maxRows: 6 }}
              showCount
              maxLength={500}
              prefix={<FileTextOutlined />}
            />
          </Form.Item>

          {/* Footer Buttons */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Popconfirm
              title="Cancel editing"
              description="Are you sure you want to cancel? All changes will be lost."
              onConfirm={() => {
                form.resetFields();
                setIsModalOpen(false);
              }}
              okText="Yes"
              cancelText="No">
              <Button danger>Cancel</Button>
            </Popconfirm>
            <Button type="primary" htmlType="submit" loading={loading}>
              Submit Application
            </Button>
          </div>
        </div>
      </Form>
    </Modal>
  );
}

CreateApplication.propTypes = {
  isModalOpen: PropTypes.bool.isRequired,
  setIsModalOpen: PropTypes.func.isRequired,
  user: PropTypes.object.isRequired,
  fetchData: PropTypes.func.isRequired,
};

export default CreateApplication;

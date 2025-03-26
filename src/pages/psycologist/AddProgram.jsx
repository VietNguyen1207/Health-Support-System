import {
  Form,
  Input,
  DatePicker,
  InputNumber,
  Select,
  Button,
  Card,
  message,
  Switch,
  Space,
  Spin,
  TimePicker,
  Alert,
} from "antd";
import { useNavigate } from "react-router-dom";
import { useProgramStore } from "../../stores/programStore";
import { useState, useEffect } from "react";
import { useAppointmentStore } from "../../stores/appointmentStore";
import { usePsychologistStore } from "../../stores/psychologistStore";
import { useAuthStore } from "../../stores/authStore";
import dayjs from "dayjs";

const { TextArea } = Input;
const { Option } = Select;

const DAYS_OF_WEEK = [
  { label: "Monday", value: "Monday" },
  { label: "Tuesday", value: "Tuesday" },
  { label: "Wednesday", value: "Wednesday" },
  { label: "Thursday", value: "Thursday" },
  { label: "Friday", value: "Friday" },
  { label: "Saturday", value: "Saturday" },
  { label: "Sunday", value: "Sunday" },
];

const AddProgram = () => {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const [isOnline, setIsOnline] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetchingData, setIsFetchingData] = useState(false);
  const { user } = useAuthStore();
  const { createProgram, fetchTags, tags } = useProgramStore();
  const { fetchDepartments } = useAppointmentStore();
  const [departments, setDepartments] = useState([]);
  const { fetchPsychologists } = usePsychologistStore();
  const [psychologists, setPsychologists] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);
  const [dayOfWeekWarning, setDayOfWeekWarning] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      setIsFetchingData(true);
      try {
        await fetchTags();
      } catch (error) {
        console.error("Failed to fetch tags:", error);
        message.error("Failed to load tags");
      } finally {
        setIsFetchingData(false);
      }
    };

    const loadPsychologists = async () => {
      setIsFetchingData(true);
      try {
        const data = await fetchPsychologists();
        const psychologistOptions = data.map((psy) => ({
          label: psy.info.fullName,
          value: psy.psychologistId,
        }));
        setPsychologists(psychologistOptions);
      } catch (error) {
        console.error("Failed to fetch psychologists:", error);
        message.error("Failed to load psychologists");
      } finally {
        setIsFetchingData(false);
      }
    };

    const loadDepartments = async () => {
      setIsFetchingData(true);
      try {
        const departmentsData = await fetchDepartments();
        setDepartments(departmentsData);
      } catch (error) {
        console.error("Failed to fetch departments:", error);
        message.error("Failed to load departments");
      } finally {
        setIsFetchingData(false);
      }
    };

    loadDepartments();
    loadPsychologists();
    fetchData();
  }, []);

  const onFinish = async (values) => {
    setIsLoading(true);
    try {
      // Format time values to string format
      const startTime = values.startTime.format("HH:mm:ss");
      const endTime = values.endTime.format("HH:mm:ss");

      const newProgram = {
        name: values.title,
        description: values.description,
        numberParticipants: parseInt(values.numberParticipants),
        duration: parseInt(values.duration),
        startDate: values.startDate.format("YYYY-MM-DD"),
        weeklyScheduleRequest: {
          weeklyAt: values.weeklyAt,
          startTime: startTime,
          endTime: endTime,
        },
        status: "Active",
        tags: values.tags,
        facilitatorId: values.facilitatorId,
        departmentId: values.departmentId,
        type: isOnline ? "Online" : "Offline",
        meetingLink: isOnline ? values.meetingLink : null,
      };

      // Log the data being sent
      console.log("Form data being sent:", newProgram);

      await createProgram(newProgram);
      message.success("Program created successfully!");
      navigate("/program");
    } catch (error) {
      console.error("Creation error:", error);
      message.error(
        "Failed to create program: " +
          (error.response?.data?.message || error.message || "Unknown error")
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Function to get day of week from a date
  const getDayOfWeek = (date) => {
    const days = [
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
    ];
    return days[date.day()];
  };

  // Handle date change
  const handleDateChange = (date) => {
    if (date) {
      setSelectedDate(date);
      const dayOfWeek = getDayOfWeek(date);

      // Automatically set the weeklyAt field to match the day of week
      form.setFieldsValue({ weeklyAt: dayOfWeek });

      // Clear any warnings since we've auto-corrected the value
      setDayOfWeekWarning(null);

      // Validate the form to update submit button status
      form.validateFields(["weeklyAt"]).catch(() => {
        // Silent catch - just for triggering validation
      });
    } else {
      setSelectedDate(null);
      setDayOfWeekWarning(null);
    }
  };

  // Handle weekly day selection
  const handleWeeklyDayChange = (value) => {
    if (selectedDate) {
      const dayOfWeek = getDayOfWeek(selectedDate);
      if (value !== dayOfWeek) {
        setDayOfWeekWarning(
          `The selected start date (${selectedDate.format(
            "YYYY-MM-DD"
          )}) is a ${dayOfWeek}, but you've selected ${value} for the weekly schedule.`
        );
      } else {
        setDayOfWeekWarning(null);
      }
    }
  };

  return (
    <div className="bg-gradient-to-b from-blue-50 to-white pt-24 pb-28 px-4 sm:px-6 lg:px-8">
      <div className="relative">
        {isFetchingData && (
          <div className="absolute inset-0 bg-white/70 z-50 flex justify-center items-center">
            <Spin size="large" />
          </div>
        )}
        <div className="max-w-4xl mx-auto">
          <Card className="shadow-lg rounded-xl border-0">
            <div className="mb-8 text-center">
              <h1 className="text-3xl font-bold text-gray-800 mb-3">
                Create New Program
              </h1>
              <p className="text-gray-600 text-lg">
                Design a comprehensive mental health and wellness program for
                students
              </p>
            </div>

            <Form
              form={form}
              layout="vertical"
              onFinish={onFinish}
              className="space-y-6"
              validateTrigger="onBlur"
              scrollToFirstError
            >
              {/* Program Basic Information Section */}
              <div className="bg-gray-50 p-6 rounded-lg mb-8">
                <h2 className="text-xl font-semibold text-gray-700 mb-4">
                  Basic Information
                </h2>
                <Form.Item
                  name="title"
                  label={
                    <span className="text-gray-700 font-medium">
                      Program Title
                    </span>
                  }
                  rules={[
                    { required: true, message: "Please enter program title" },
                  ]}
                >
                  <Input
                    placeholder="Enter program title"
                    className="rounded-lg h-11"
                  />
                </Form.Item>

                <Form.Item
                  name="description"
                  label={
                    <span className="text-gray-700 font-medium">
                      Description
                    </span>
                  }
                  rules={[
                    {
                      required: true,
                      message: "Please enter program description",
                    },
                  ]}
                >
                  <TextArea
                    rows={4}
                    placeholder="Enter program description"
                    className="rounded-lg"
                  />
                </Form.Item>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Form.Item
                    name="departmentId"
                    label={
                      <span className="text-gray-700 font-medium">
                        Department
                      </span>
                    }
                    rules={[
                      { required: true, message: "Please select a department" },
                    ]}
                  >
                    <Select
                      placeholder="Select program department"
                      loading={isLoading}
                    >
                      {departments.map((dept) => (
                        <Option
                          key={dept.departmentId}
                          value={dept.departmentId}
                        >
                          {dept.departmentName}
                        </Option>
                      ))}
                    </Select>
                  </Form.Item>

                  <Form.Item
                    name="tags"
                    label={
                      <span className="text-gray-700 font-medium">Tags</span>
                    }
                    rules={[
                      {
                        required: true,
                        message: "Please add at least one tag",
                      },
                    ]}
                  >
                    <Select
                      mode="multiple"
                      placeholder="Select relevant tags"
                      maxCount={3}
                      options={tags}
                      loading={isLoading}
                    />
                  </Form.Item>
                </div>
              </div>

              {/* Program Details Section */}
              <div className="bg-gray-50 p-6 rounded-lg mb-8">
                <h2 className="text-xl font-semibold text-gray-700 mb-4">
                  Program Details
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Form.Item
                    name="startDate"
                    label={
                      <span className="text-gray-700 font-medium">
                        Start Date
                      </span>
                    }
                    rules={[
                      { required: true, message: "Please select start date" },
                    ]}
                  >
                    <DatePicker
                      style={{ width: "100%" }}
                      className="rounded-lg"
                      disabledDate={(current) =>
                        current && current < new Date().setHours(0, 0, 0, 0)
                      }
                      onChange={handleDateChange}
                    />
                  </Form.Item>

                  <Form.Item
                    name="duration"
                    label={
                      <span className="text-gray-700 font-medium">
                        Duration
                      </span>
                    }
                    rules={[
                      { required: true, message: "Please enter duration" },
                      {
                        type: "number",
                        message: "Please enter a valid number",
                      },
                    ]}
                  >
                    <InputNumber
                      min={1}
                      max={52}
                      className="w-full rounded-lg"
                      placeholder="Enter duration"
                      addonAfter={"Weeks"}
                      controls={true}
                      keyboard={false}
                    />
                  </Form.Item>

                  <Form.Item
                    name="numberParticipants"
                    label={
                      <span className="text-gray-700 font-medium">
                        Maximum Capacity
                      </span>
                    }
                    rules={[
                      { required: true, message: "Please enter capacity" },
                      {
                        type: "number",
                        message: "Please enter a valid number",
                      },
                    ]}
                  >
                    <InputNumber
                      min={1}
                      max={100}
                      className="w-full rounded-lg"
                      placeholder="Enter maximum participants"
                      keyboard={false}
                    />
                  </Form.Item>

                  <Form.Item
                    name="facilitatorId"
                    label={
                      <span className="text-gray-700 font-medium">
                        Facilitator
                      </span>
                    }
                    rules={[
                      {
                        required: true,
                        message: "Please select a facilitator",
                      },
                    ]}
                  >
                    <Select
                      placeholder="Select facilitator"
                      options={psychologists}
                      className="rounded-lg"
                      loading={isLoading}
                      optionRender={(option) => (
                        <Space>
                          <span>{option.data.label}</span>
                        </Space>
                      )}
                    />
                  </Form.Item>
                </div>
              </div>

              {/* Weekly Schedule Section */}
              <div className="bg-gray-50 p-6 rounded-lg mb-8">
                <h2 className="text-xl font-semibold text-gray-700 mb-4">
                  Weekly Schedule
                </h2>

                {dayOfWeekWarning && (
                  <Alert
                    message="Day of Week Mismatch"
                    description={dayOfWeekWarning}
                    type="warning"
                    showIcon
                    className="mb-4"
                    closable
                    onClose={() => setDayOfWeekWarning(null)}
                  />
                )}

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <Form.Item
                    name="weeklyAt"
                    label={
                      <span className="text-gray-700 font-medium">
                        Day of Week
                      </span>
                    }
                    rules={[
                      { required: true, message: "Please select a day" },
                      ({ getFieldValue }) => ({
                        validator(_, value) {
                          const startDate = getFieldValue("startDate");
                          if (!startDate) return Promise.resolve();
                          if (!value) return Promise.resolve(); // Don't validate if no value selected

                          const startDayOfWeek = getDayOfWeek(startDate);
                          if (value !== startDayOfWeek) {
                            return Promise.reject(
                              new Error(
                                `Must match start date's day (${startDayOfWeek})`
                              )
                            );
                          }
                          return Promise.resolve();
                        },
                      }),
                    ]}
                    validateTrigger={["onChange", "onBlur"]}
                  >
                    <Select
                      placeholder="Select day"
                      options={DAYS_OF_WEEK}
                      className="rounded-lg"
                      onChange={(value) => {
                        handleWeeklyDayChange(value);
                        form.validateFields(["weeklyAt"]).catch(() => {});
                      }}
                    />
                  </Form.Item>

                  <Form.Item
                    name="startTime"
                    label={
                      <span className="text-gray-700 font-medium">
                        Start Time
                      </span>
                    }
                    rules={[
                      { required: true, message: "Please select start time" },
                    ]}
                  >
                    <TimePicker
                      format="HH:mm"
                      className="w-full rounded-lg"
                      placeholder="Select start time"
                      minuteStep={15}
                    />
                  </Form.Item>

                  <Form.Item
                    name="endTime"
                    label={
                      <span className="text-gray-700 font-medium">
                        End Time
                      </span>
                    }
                    rules={[
                      { required: true, message: "Please select end time" },
                      ({ getFieldValue }) => ({
                        validator(_, value) {
                          if (!value || !getFieldValue("startTime")) {
                            return Promise.resolve();
                          }
                          if (value.isBefore(getFieldValue("startTime"))) {
                            return Promise.reject(
                              new Error("End time must be after start time")
                            );
                          }
                          return Promise.resolve();
                        },
                      }),
                    ]}
                  >
                    <TimePicker
                      format="HH:mm"
                      className="w-full rounded-lg"
                      placeholder="Select end time"
                      minuteStep={15}
                    />
                  </Form.Item>
                </div>
              </div>

              {/* Program Delivery Section */}
              <div className="bg-gray-50 p-6 rounded-lg mb-8">
                <h2 className="text-xl font-semibold text-gray-700 mb-4">
                  Delivery Method
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Form.Item
                    name="type"
                    label={
                      <span className="text-gray-700 font-medium">
                        Program Type
                      </span>
                    }
                  >
                    <div className="flex items-center space-x-3">
                      <Switch
                        checked={isOnline}
                        onChange={(checked) => {
                          setIsOnline(checked);
                          form.setFieldValue(
                            "type",
                            checked ? "Online" : "Offline"
                          );
                          if (!checked) {
                            form.setFieldValue("meetingLink", undefined);
                          }
                        }}
                        className="bg-primary-green"
                      />
                      <span className="text-gray-600">
                        {isOnline ? "Online" : "Offline"}
                      </span>
                    </div>
                  </Form.Item>

                  {isOnline && (
                    <Form.Item
                      name="meetingLink"
                      label={
                        <span className="text-gray-700 font-medium">
                          Meeting Link
                        </span>
                      }
                      rules={[
                        {
                          required: isOnline,
                          message: "Please enter meeting link",
                        },
                        { type: "url", message: "Please enter a valid URL" },
                      ]}
                    >
                      <Input
                        placeholder="https://example.com/meeting"
                        className="rounded-lg h-11"
                      />
                    </Form.Item>
                  )}
                </div>
              </div>

              <div className="flex justify-end gap-4 pt-6">
                <Button
                  onClick={() => form.resetFields()}
                  className="h-11 px-6 rounded-lg hover:bg-gray-100"
                  disabled={isLoading}
                >
                  Cancel
                </Button>
                <Button
                  type="primary"
                  htmlType="submit"
                  loading={isLoading}
                  className="h-11 px-8 rounded-lg bg-primary-green hover:bg-primary-green/90 text-white font-medium"
                  disabled={
                    isLoading ||
                    form.getFieldError("weeklyAt").length > 0 ||
                    !form.isFieldTouched("startDate") ||
                    !form.isFieldTouched("weeklyAt")
                  }
                >
                  Create Program
                </Button>
              </div>
            </Form>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AddProgram;

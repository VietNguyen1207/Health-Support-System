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
} from "antd";
import { useNavigate } from "react-router-dom";
import { useProgramStore } from "../../stores/programStore";
import { useState, useEffect } from "react";
import { useUserStore } from "../../stores/userStore";

const { TextArea } = Input;
const { Option } = Select;

// const TAGS = [
//   { label: "Anxiety", value: "TAGS067" },
//   { label: "Mindfulness", value: "Mindfulness" },
//   { label: "Stress", value: "Stress" },
// ];

const AddProgram = () => {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const [isOnline, setIsOnline] = useState(false);
  const [psychologists, setPsychologists] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetchingUsers, setIsFetchingUsers] = useState(false);
  const { getAllUsers } = useUserStore();
  const { createProgram, fetchTags, tags } = useProgramStore();

  useEffect(() => {
    const fetchData = async () => {
      try {
        await fetchTags();
      } catch (error) {
        console.error("Failed to fetch tags:", error);
        message.error("Failed to load tags");
      }
    };
    fetchData();
  }, [fetchTags]);

  useEffect(() => {
    const fetchPsychologists = async () => {
      setIsFetchingUsers(true);
      try {
        const users = await getAllUsers();
        const filteredPsychologists = users
          .filter((user) => user.role.toLowerCase() === "psychologist")
          .map((user) => ({
            label: user.fullName,
            value: user.userId,
          }));
        setPsychologists(filteredPsychologists);
      } catch (error) {
        console.error("Failed to fetch psychologists:", error);
        message.error("Failed to load psychologists");
      } finally {
        setIsFetchingUsers(false);
      }
    };

    fetchPsychologists();
  }, [getAllUsers]);

  const onFinish = async (values) => {
    setIsLoading(true);
    try {
      const newProgram = {
        ...values,
        // startDate: new Date(values.startDate),

        // change date format
        startDate: values.startDate.toISOString(),
      };

      await createProgram(newProgram);
      console.log("====================================");
      console.log(newProgram);
      console.log("====================================");
      message.success("Program created successfully!");
      navigate("/program");
    } catch (error) {
      console.error("Error creating program:", error);
      message.error(
        "Failed to create program: " + (error.message || "Unknown error")
      );
    } finally {
      setIsLoading(false);
    }
  };

  const departments = ["Mental Health", "Support Group"];

  return (
    <div className="bg-gradient-to-b from-blue-50 to-white pt-24 pb-28 px-4 sm:px-6 lg:px-8">
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
                  <span className="text-gray-700 font-medium">Description</span>
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
                  name="department"
                  label={
                    <span className="text-gray-700 font-medium">
                      Department
                    </span>
                  }
                  rules={[
                    { required: true, message: "Please select a department" },
                  ]}
                >
                  <Select placeholder="Select program department">
                    {departments.map((department) => (
                      <Option key={department} value={department}>
                        {department}
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
                    { required: true, message: "Please add at least one tag" },
                  ]}
                >
                  <Select
                    mode="multiple"
                    placeholder="Select relevant tags"
                    // options={TAGS}
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
                  />
                </Form.Item>

                <Form.Item
                  name="duration"
                  label={
                    <span className="text-gray-700 font-medium">Duration</span>
                  }
                  rules={[
                    { required: true, message: "Please enter duration" },
                    { type: "number", message: "Please enter a valid number" },
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
                    { type: "number", message: "Please enter a valid number" },
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
                  name="managedByStaffID"
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
                    loading={isFetchingUsers}
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
                  rules={[
                    { required: true, message: "Please select program type" },
                  ]}
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
                onClick={() => navigate("/program")}
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
              >
                Create Program
              </Button>
            </div>
          </Form>
        </Card>
      </div>
    </div>
  );
};

export default AddProgram;

import {
  Form,
  Input,
  DatePicker,
  InputNumber,
  Select,
  Button,
  Card,
  message,
} from "antd";
import { useNavigate } from "react-router-dom";

const { TextArea } = Input;
const { Option } = Select;

const AddProgram = () => {
  const [form] = Form.useForm();
  const navigate = useNavigate();

  const onFinish = (values) => {
    // Format the data
    const newProgram = {
      ...values,
      startDate: values.startDate.format("YYYY-MM-DD"),
      status: "Open",
      enrolled: 0,
    };

    // Log the data that would be sent to the backend
    console.log("New Program Data:", newProgram);

    // Show success message
    message.success("Program created successfully!");
    navigate("/program");
  };

  const categories = [
    "Mental Health",
    "Support Group",
    "Wellness",
    "Academic Support",
    "Social Skills",
    "Personal Development",
    "Leadership",
    "Cultural Support",
    "Digital Wellness",
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white pt-24 pb-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <Card className="shadow-md">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Create New Program
            </h1>
            <p className="text-gray-600">
              Add a new mental health and wellness program for students
            </p>
          </div>

          <Form
            form={form}
            layout="vertical"
            onFinish={onFinish}
            className="space-y-4"
          >
            <Form.Item
              name="title"
              label="Program Title"
              rules={[
                { required: true, message: "Please enter program title" },
              ]}
            >
              <Input placeholder="Enter program title" />
            </Form.Item>

            <Form.Item
              name="description"
              label="Description"
              rules={[
                { required: true, message: "Please enter program description" },
              ]}
            >
              <TextArea rows={4} placeholder="Enter program description" />
            </Form.Item>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Form.Item
                name="category"
                label="Category"
                rules={[
                  { required: true, message: "Please select a category" },
                ]}
              >
                <Select placeholder="Select program category">
                  {categories.map((category) => (
                    <Option key={category} value={category}>
                      {category}
                    </Option>
                  ))}
                </Select>
              </Form.Item>

              <Form.Item
                name="startDate"
                label="Start Date"
                rules={[
                  { required: true, message: "Please select start date" },
                ]}
              >
                <DatePicker className="w-full" />
              </Form.Item>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Form.Item
                name="duration"
                label="Duration (weeks)"
                rules={[{ required: true, message: "Please enter duration" }]}
              >
                <InputNumber
                  min={1}
                  max={52}
                  className="w-full"
                  placeholder="Enter duration in weeks"
                />
              </Form.Item>

              <Form.Item
                name="capacity"
                label="Maximum Capacity"
                rules={[{ required: true, message: "Please enter capacity" }]}
              >
                <InputNumber
                  min={1}
                  max={100}
                  className="w-full"
                  placeholder="Enter maximum participants"
                />
              </Form.Item>
            </div>

            <Form.Item
              name="facilitator"
              label="Facilitator"
              rules={[
                { required: true, message: "Please enter facilitator name" },
              ]}
            >
              <Input placeholder="Enter facilitator name" />
            </Form.Item>

            <Form.Item
              name="tags"
              label="Tags"
              rules={[
                { required: true, message: "Please add at least one tag" },
              ]}
            >
              <Select mode="tags" placeholder="Add tags" className="w-full" />
            </Form.Item>

            <div className="flex justify-end gap-4 pt-4">
              <Button onClick={() => navigate("/program")}>Cancel</Button>
              <Button
                type="primary"
                htmlType="submit"
                className="bg-primary-green hover:bg-primary-green/90"
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

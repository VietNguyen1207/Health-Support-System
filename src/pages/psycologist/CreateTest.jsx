import React, { useState } from "react";
import {
  Form,
  Input,
  Button,
  Select,
  InputNumber,
  Card,
  Space,
  message,
} from "antd";
import { PlusOutlined, DeleteOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";

const { TextArea } = Input;
const { Option } = Select;

const CreateTest = () => {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const [questions, setQuestions] = useState([]);

  const onFinish = (values) => {
    const newTest = {
      // Basic test information
      title: values.title,
      category: values.category,
      description: values.description,
      duration: values.duration,

      // Questions array with their options and scores
      questions: questions.map((q, index) => ({
        id: index + 1,
        question: q.question,
        options: q.options.map((opt) => ({
          label: opt.label,
          value: opt.value,
        })),
      })),

      // Metadata
      createdAt: new Date().toISOString(),
      status: "active",
    };

    // Log the complete test object
    console.log("=== New Test Data ===");
    console.log("Basic Information:");
    console.log("Title:", newTest.title);
    console.log("Category:", newTest.category);
    console.log("Description:", newTest.description);
    console.log("Duration:", newTest.duration, "minutes");
    console.log("\nQuestions:");
    newTest.questions.forEach((q, index) => {
      console.log(`\nQuestion ${index + 1}:`, q.question);
      console.log("Options:");
      q.options.forEach((opt, i) => {
        console.log(`  ${i + 1}. ${opt.label} (Score: ${opt.value})`);
      });
    });
    console.log("\nComplete test object:", newTest);

    message.success("Test created successfully!");
    // navigate("/test");
  };

  const handleAddQuestion = () => {
    setQuestions([
      ...questions,
      {
        question: "",
        options: [
          { label: "Not at all", value: 0 },
          { label: "Several days", value: 1 },
          { label: "More than half the days", value: 2 },
          { label: "Nearly every day", value: 3 },
        ],
      },
    ]);
  };

  const handleQuestionChange = (index, value) => {
    const updatedQuestions = [...questions];
    updatedQuestions[index].question = value;
    setQuestions(updatedQuestions);
  };

  const handleOptionChange = (questionIndex, optionIndex, field, value) => {
    const updatedQuestions = [...questions];
    updatedQuestions[questionIndex].options[optionIndex][field] = value;
    setQuestions(updatedQuestions);
  };

  const handleAddOption = (questionIndex) => {
    const updatedQuestions = [...questions];
    updatedQuestions[questionIndex].options.push({
      label: "",
      value: 0,
    });
    setQuestions(updatedQuestions);
  };

  const handleDeleteOption = (questionIndex, optionIndex) => {
    const updatedQuestions = [...questions];
    updatedQuestions[questionIndex].options = updatedQuestions[
      questionIndex
    ].options.filter((_, index) => index !== optionIndex);
    setQuestions(updatedQuestions);
  };

  const handleDeleteQuestion = (index) => {
    const updatedQuestions = questions.filter((_, i) => i !== index);
    setQuestions(updatedQuestions);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-12 px-4 pt-24">
      <div className="max-w-4xl mx-auto">
        <Card className="shadow-lg rounded-2xl">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">
            Create New Survey
          </h1>

          <Form
            form={form}
            layout="vertical"
            onFinish={onFinish}
            requiredMark={false}
          >
            {/* Basic Survey Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <Form.Item
                name="title"
                label="Survey Name"
                rules={[
                  { required: true, message: "Please enter survey name" },
                ]}
              >
                <Input placeholder="e.g., Depression Assessment Test" />
              </Form.Item>

              <Form.Item
                name="category"
                label="Category"
                rules={[{ required: true, message: "Please select category" }]}
              >
                <Select placeholder="Select category">
                  <Option value="Depression">Depression</Option>
                  <Option value="Anxiety">Anxiety</Option>
                  <Option value="Stress">Stress</Option>
                </Select>
              </Form.Item>

              <Form.Item
                name="duration"
                label="Estimated Duration (minutes)"
                rules={[{ required: true, message: "Please enter duration" }]}
              >
                <InputNumber
                  min={1}
                  max={60}
                  placeholder="15"
                  className="w-full"
                />
              </Form.Item>
            </div>

            <Form.Item
              name="description"
              label="Description"
              rules={[{ required: true, message: "Please enter description" }]}
            >
              <TextArea rows={4} placeholder="Enter survey description..." />
            </Form.Item>

            {/* Questions Section */}
            <div className="mt-8">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold text-gray-900">
                  Questions
                </h2>
                <Button
                  type="dashed"
                  onClick={handleAddQuestion}
                  icon={<PlusOutlined />}
                >
                  Add Question
                </Button>
              </div>

              <Space direction="vertical" className="w-full" size="large">
                {questions.map((question, qIndex) => (
                  <Card
                    key={qIndex}
                    className="bg-gray-50"
                    extra={
                      <Button
                        type="text"
                        danger
                        icon={<DeleteOutlined />}
                        onClick={() => handleDeleteQuestion(qIndex)}
                      />
                    }
                  >
                    <Form.Item label={`Question ${qIndex + 1}`} required>
                      <Input
                        value={question.question}
                        onChange={(e) =>
                          handleQuestionChange(qIndex, e.target.value)
                        }
                        placeholder="Enter question text"
                      />
                    </Form.Item>

                    <div className="ml-6 space-y-3">
                      {question.options.map((option, optIndex) => (
                        <div key={optIndex} className="flex items-center gap-4">
                          <Input
                            value={option.label}
                            onChange={(e) =>
                              handleOptionChange(
                                qIndex,
                                optIndex,
                                "label",
                                e.target.value
                              )
                            }
                            placeholder="Enter answer option"
                            className="flex-1"
                          />
                          <InputNumber
                            min={0}
                            max={3}
                            value={option.value}
                            onChange={(value) =>
                              handleOptionChange(
                                qIndex,
                                optIndex,
                                "value",
                                value
                              )
                            }
                            placeholder="Score"
                            className="w-20"
                          />
                          <Button
                            type="text"
                            danger
                            icon={<DeleteOutlined />}
                            onClick={() => handleDeleteOption(qIndex, optIndex)}
                            disabled={question.options.length <= 2}
                          />
                        </div>
                      ))}

                      <Button
                        type="dashed"
                        onClick={() => handleAddOption(qIndex)}
                        icon={<PlusOutlined />}
                        size="small"
                        className="mt-2"
                      >
                        Add Option
                      </Button>
                    </div>
                  </Card>
                ))}
              </Space>
            </div>

            {/* Submit Buttons */}
            <div className="flex justify-end gap-4 mt-8">
              <Button onClick={() => navigate("/test")}>Cancel</Button>
              <Button
                type="primary"
                htmlType="submit"
                className="bg-custom-green"
                disabled={questions.length === 0}
              >
                Create Survey
              </Button>
            </div>
          </Form>
        </Card>
      </div>
    </div>
  );
};

export default CreateTest;

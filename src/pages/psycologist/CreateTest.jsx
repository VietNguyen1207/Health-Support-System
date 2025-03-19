import React, { useState } from "react";
import {
  Form,
  Input,
  Button,
  Select,
  Card,
  Space,
  message,
  DatePicker,
  InputNumber,
} from "antd";
import { PlusOutlined, DeleteOutlined, SaveOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { useSurveyStore } from "../../stores/surveyStore";

const { TextArea } = Input;
const { Option } = Select;

const CreateTest = () => {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const { createSurvey, loading } = useSurveyStore();
  const [questions, setQuestions] = useState([]);

  // Survey Standard Types
  const standardTypes = [
    { value: "GAD_7", label: "GAD-7 (Anxiety)" },
    { value: "PHQ_9", label: "PHQ-9 (Depression)" },
    { value: "PSS_10", label: "PSS-10 (Stress)" },
  ];

  const onFinish = async (values) => {
    // Format the questions to match the API structure
    const formattedQuestions = questions.map((q) => ({
      questionText: q.question,
      questionOptions: q.options.map((opt) => ({
        value: parseInt(opt.value), // Convert to integer as required by API
        label: opt.label,
      })),
    }));

    // Format date to YYYY-MM-DD
    const formattedDate = values.startDate.format("YYYY-MM-DD");

    // Create the survey data object to match API requirements
    const surveyData = {
      title: values.title,
      description: values.description,
      standardType: values.standardType,
      startDate: formattedDate,
      periodic: values.periodic || 1,
      question: formattedQuestions,
      // You can add more fields if needed
    };

    try {
      await createSurvey(surveyData);
      message.success("Survey created successfully!");
      navigate("/test");
    } catch (error) {
      message.error("Failed to create survey: " + error.message);
    }
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
            initialValues={{
              periodic: 1, // Default periodic value
            }}
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
                name="standardType"
                label="Standard Type"
                rules={[
                  { required: true, message: "Please select standard type" },
                ]}
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
                name="startDate"
                label="Start Date"
                rules={[
                  { required: true, message: "Please select start date" },
                ]}
              >
                <DatePicker className="w-full" />
              </Form.Item>

              <Form.Item
                name="periodic"
                label="Periodic"
                tooltip="Period number for this survey"
                rules={[
                  { required: true, message: "Please enter periodic number" },
                ]}
              >
                <InputNumber min={1} placeholder="1" className="w-full" />
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

              {questions.length === 0 && (
                <div className="text-center p-8 border border-dashed border-gray-300 rounded-lg">
                  <p className="text-gray-500">
                    Add questions to your survey using the button above
                  </p>
                </div>
              )}
            </div>

            {/* Submit Buttons */}
            <div className="flex justify-end gap-4 mt-8">
              <Button onClick={() => navigate("/test")}>Cancel</Button>
              <Button
                type="primary"
                htmlType="submit"
                icon={<SaveOutlined />}
                loading={loading}
                className="bg-custom-green hover:bg-custom-green/90"
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

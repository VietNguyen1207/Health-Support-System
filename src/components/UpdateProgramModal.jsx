import React, { useEffect, useState } from "react";
import {
  Modal,
  Form,
  Input,
  InputNumber,
  DatePicker,
  Select,
  TimePicker,
  Button,
  message,
  Divider,
} from "antd";
import {
  CalendarOutlined,
  ClockCircleOutlined,
  TeamOutlined,
  LinkOutlined,
  TagsOutlined,
} from "@ant-design/icons";
import { useProgramStore } from "../stores/programStore";
import { usePsychologistStore } from "../stores/psychologistStore";
import dayjs from "dayjs";

const { TextArea } = Input;
const { Option } = Select;

const UpdateProgramModal = ({ visible, program, onCancel, onSuccess }) => {
  const [form] = Form.useForm();
  const { updateProgram, fetchTags, tags, loading } = useProgramStore();
  const { fetchPsychologists, fetchDepartments } = usePsychologistStore();
  const [submitting, setSubmitting] = useState(false);
  const [programType, setProgramType] = useState(program?.type || "OFFLINE");
  const [psychologists, setPsychologists] = useState([]);
  const [departments, setDepartments] = useState([]);

  useEffect(() => {
    if (visible && program) {
      // Fetch all necessary data when modal opens
      const fetchData = async () => {
        try {
          // Fetch tags first so we have them available
          const tagsList = await fetchTags();
          const psychsData = await fetchPsychologists();
          const deptsData = await fetchDepartments();

          setPsychologists(
            psychsData.map((psych) => ({
              label: psych.info.fullName,
              value: psych.psychologistId,
            }))
          );

          setDepartments(
            deptsData.map((dept) => ({
              label: dept.departmentName,
              value: dept.departmentId,
            }))
          );

          // Log the tags for debugging
          console.log("Program tags:", program.tags);
          console.log("Available tags:", tagsList);

          // Set initial form values
          form.setFieldsValue({
            title: program.title,
            description: program.description,
            maxParticipants: program.maxParticipants,
            duration: program.duration,
            startDate: dayjs(program.startDate),
            weeklyAt: program.weeklySchedule.weeklyAt,
            startTime: dayjs(program.weeklySchedule.startTime, "HH:mm"),
            endTime: dayjs(program.weeklySchedule.endTime, "HH:mm"),
            status: program.status,
            tags: program.tags,
            type: program.type,
            meetingLink: program.meetingLink,
            facilitatorId: program.facilitatorId,
            departmentId: program.departmentId,
          });
        } catch (error) {
          console.error("Error fetching data:", error);
          message.error("Failed to load necessary data");
        }
      };

      fetchData();
      setProgramType(program.type);
    }
  }, [visible, program, form]);

  const handleSubmit = async (values) => {
    try {
      setSubmitting(true);

      if (!program || !program.programID) {
        throw new Error("Program ID is missing");
      }

      // Format the values before sending to updateProgram
      const formattedValues = {
        title: values.title,
        description: values.description,
        maxParticipants: parseInt(values.maxParticipants),
        duration: parseInt(values.duration),
        startDate: values.startDate.format("YYYY-MM-DD"),
        weeklyAt: values.weeklyAt,
        startTime: values.startTime,
        endTime: values.endTime,
        type: values.type,
        meetingLink: values.type === "ONLINE" ? values.meetingLink : null,
        facilitatorId: values.facilitatorId,
        departmentId: values.departmentId,
        tags: values.tags,
      };

      console.log("Updating program with ID:", program.programID);
      console.log("Update payload:", formattedValues);

      await updateProgram(program.programID, formattedValues);
      message.success("Program updated successfully");
      onSuccess();
    } catch (error) {
      console.error("Update error details:", {
        error,
        programId: program?.programID,
        message: error.message,
      });
      message.error(error.message || "Failed to update program");
    } finally {
      setSubmitting(false);
    }
  };

  const handleTypeChange = (value) => {
    setProgramType(value);
    if (value === "OFFLINE") {
      form.setFieldValue("meetingLink", undefined);
    }
  };

  return (
    <Modal
      title={
        <div className="flex items-center gap-3">
          <div className="bg-blue-50 p-2 rounded-lg">
            <CalendarOutlined className="text-xl text-blue-500" />
          </div>
          <div>
            <h3 className="text-xl font-semibold text-gray-800 m-0">
              Update Program
            </h3>
            <p className="text-sm text-gray-500 m-0">
              Modify program details and settings
            </p>
          </div>
        </div>
      }
      open={visible}
      onCancel={onCancel}
      width={720}
      footer={null}
      className="update-program-modal"
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        className="mt-6"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Basic Information */}
          <div className="md:col-span-2">
            <h4 className="text-sm font-medium text-gray-700 mb-4">
              Basic Information
            </h4>
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
              rules={[{ required: true, message: "Please enter description" }]}
            >
              <TextArea
                placeholder="Enter program description"
                rows={4}
                className="resize-none"
              />
            </Form.Item>
          </div>

          <Divider className="md:col-span-2 my-2" />

          {/* Schedule Information */}
          <div className="md:col-span-2">
            <h4 className="text-sm font-medium text-gray-700 mb-4">
              Schedule & Capacity
            </h4>
          </div>

          <Form.Item
            name="startDate"
            label="Start Date"
            rules={[{ required: true, message: "Please select start date" }]}
          >
            <DatePicker className="w-full" />
          </Form.Item>

          <Form.Item
            name="duration"
            label="Duration (weeks)"
            rules={[{ required: true, message: "Please enter duration" }]}
          >
            <InputNumber min={1} className="w-full" />
          </Form.Item>

          <Form.Item
            name="weeklyAt"
            label="Weekly Day"
            rules={[{ required: true, message: "Please select day" }]}
          >
            <Select>
              {[
                "Monday",
                "Tuesday",
                "Wednesday",
                "Thursday",
                "Friday",
                "Saturday",
                "Sunday",
              ].map((day) => (
                <Option key={day} value={day}>
                  {day}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <div className="flex gap-4">
            <Form.Item
              name="startTime"
              label="Start Time"
              className="flex-1"
              rules={[{ required: true, message: "Please select start time" }]}
            >
              <TimePicker format="HH:mm" className="w-full" />
            </Form.Item>

            <Form.Item
              name="endTime"
              label="End Time"
              className="flex-1"
              rules={[{ required: true, message: "Please select end time" }]}
            >
              <TimePicker format="HH:mm" className="w-full" />
            </Form.Item>
          </div>

          <Form.Item
            name="maxParticipants"
            label="Maximum Participants"
            rules={[
              { required: true, message: "Please enter max participants" },
            ]}
          >
            <InputNumber min={1} className="w-full" />
          </Form.Item>

          <Form.Item
            name="type"
            label="Program Type"
            rules={[{ required: true, message: "Please select program type" }]}
          >
            <Select onChange={handleTypeChange}>
              <Option value="ONLINE">Online</Option>
              <Option value="OFFLINE">Offline</Option>
            </Select>
          </Form.Item>

          {programType === "ONLINE" && (
            <Form.Item
              name="meetingLink"
              label="Meeting Link"
              rules={[
                {
                  required: true,
                  message: "Meeting link is required for online programs",
                },
                {
                  type: "url",
                  message: "Please enter a valid URL",
                },
              ]}
            >
              <Input
                prefix={<LinkOutlined className="text-gray-400" />}
                placeholder="Enter meeting link for online program"
              />
            </Form.Item>
          )}

          <Form.Item
            name="tags"
            label="Tags"
            rules={[
              { required: true, message: "Please select at least one tag" },
            ]}
          >
            <Select
              mode="multiple"
              placeholder="Select tags"
              maxCount={3}
              loading={loading}
              optionLabelProp="label"
            >
              {tags.map((tag) => (
                <Option key={tag.value} value={tag.value} label={tag.label}>
                  {tag.label}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="departmentId"
            label="Department"
            rules={[{ required: true, message: "Please select a department" }]}
          >
            <Select
              placeholder="Select department"
              options={departments}
              loading={loading}
            />
          </Form.Item>

          <Form.Item
            name="facilitatorId"
            label="Facilitator"
            rules={[{ required: true, message: "Please select a facilitator" }]}
          >
            <Select
              placeholder="Select facilitator"
              options={psychologists}
              loading={loading}
            />
          </Form.Item>
        </div>

        <div className="flex justify-end gap-3 mt-6">
          <Button onClick={onCancel}>Cancel</Button>
          <Button
            type="primary"
            htmlType="submit"
            loading={submitting}
            className="bg-primary-green hover:bg-primary-green/90"
          >
            Update Program
          </Button>
        </div>
      </Form>
    </Modal>
  );
};

export default UpdateProgramModal;

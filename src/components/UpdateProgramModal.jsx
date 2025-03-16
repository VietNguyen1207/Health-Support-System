import React, { useEffect, useState, useRef } from "react";
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
  Tag,
  Alert,
  Tooltip,
} from "antd";
import {
  CalendarOutlined,
  ClockCircleOutlined,
  TeamOutlined,
  LinkOutlined,
  TagsOutlined,
  BankOutlined,
  UserOutlined,
  LockOutlined,
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
  const [formChanged, setFormChanged] = useState(false);
  const initialValues = useRef(null);

  useEffect(() => {
    if (visible && program) {
      // Reset form change state when modal opens
      setFormChanged(false);

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

          console.log("Program data:", program);
          console.log("Program tags:", program.tags);
          console.log("Available tags:", tagsList);

          // Find the matching department ID based on name
          const departmentId =
            deptsData.find(
              (dept) => dept.departmentName === program.departmentName
            )?.departmentId || program.departmentId;

          // Find the matching facilitator ID based on name
          const facilitatorId =
            psychsData.find(
              (psych) => psych.info.fullName === program.facilitatorName
            )?.psychologistId || program.facilitatorId;

          // Format tags to match the expected format
          let formattedTags = [];

          // Check if program.tags is an array
          if (Array.isArray(program.tags)) {
            formattedTags = program.tags
              .map((tag) => {
                // If tag is already a string ID (like "TAG001"), use it directly
                if (typeof tag === "string" && /^TAG\d+$/.test(tag)) {
                  return tag;
                }

                // If tag has a tagId property, use that
                if (tag.tagId) {
                  return tag.tagId;
                }

                // If tag has a value property that looks like a tag ID, use that
                if (
                  tag.value &&
                  typeof tag.value === "string" &&
                  /^TAG\d+$/.test(tag.value)
                ) {
                  return tag.value;
                }

                // If tag has a tagName property, find the matching tag in tagsList
                if (tag.tagName) {
                  const matchingTag = tagsList.find(
                    (t) => t.label === tag.tagName
                  );
                  if (matchingTag) {
                    return matchingTag.value;
                  }
                }

                // If tag is an object with a name/label property, find the matching tag
                if (tag.name || tag.label) {
                  const tagName = tag.name || tag.label;
                  const matchingTag = tagsList.find((t) => t.label === tagName);
                  if (matchingTag) {
                    return matchingTag.value;
                  }
                }

                // If tag is a string but not an ID (like "RELATIONSHIP STRESS"), find the matching tag
                if (typeof tag === "string") {
                  const matchingTag = tagsList.find((t) => t.label === tag);
                  if (matchingTag) {
                    return matchingTag.value;
                  }
                }

                // If we can't determine the tag ID, log a warning and return null
                console.warn("Could not determine tag ID for:", tag);
                return null;
              })
              .filter(Boolean); // Remove any null values
          }

          console.log("Formatted tags:", formattedTags);

          // Prepare initial form values
          const formValues = {
            title: program.title,
            description: program.description,
            maxParticipants: program.maxParticipants,
            duration: program.duration,
            startDate: dayjs(program.startDate),
            weeklyAt: program.weeklySchedule.weeklyAt,
            startTime: dayjs(program.weeklySchedule.startTime, "HH:mm"),
            endTime: dayjs(program.weeklySchedule.endTime, "HH:mm"),
            status: program.status,
            tags: formattedTags,
            type: program.type,
            meetingLink: program.meetingLink,
            // Use the IDs instead of names
            facilitatorId: facilitatorId,
            departmentId: departmentId,
          };

          console.log("Setting form values:", formValues);

          // Store initial values for comparison
          initialValues.current = formValues;

          // Set form values
          form.setFieldsValue(formValues);
        } catch (error) {
          console.error("Error fetching data:", error);
          message.error("Failed to load necessary data");
        }
      };

      fetchData();
      setProgramType(program.type);
    }
  }, [visible, program, form]);

  // Track form changes
  const handleFormChange = () => {
    setFormChanged(true);
  };

  // Compare form values to detect changes
  const hasFormChanged = () => {
    if (!initialValues.current) return false;

    const currentValues = form.getFieldsValue();

    // Compare each field
    const changedFields = Object.keys(currentValues).filter((key) => {
      // Special handling for date and time objects
      if (key === "startDate") {
        return !currentValues[key]?.isSame(initialValues.current[key]);
      }
      if (key === "startTime" || key === "endTime") {
        return !currentValues[key]?.isSame(initialValues.current[key]);
      }
      // Special handling for arrays (tags)
      if (key === "tags") {
        // If lengths differ, there's a change
        if (currentValues[key]?.length !== initialValues.current[key]?.length) {
          return true;
        }
        // Check if all elements are the same
        if (currentValues[key] && initialValues.current[key]) {
          const currentTags = new Set(
            currentValues[key].map((t) =>
              typeof t === "object" ? t.tagId || t.value : t
            )
          );
          const initialTags = new Set(
            initialValues.current[key].map((t) =>
              typeof t === "object" ? t.tagId || t.value : t
            )
          );
          return (
            currentTags.size !== initialTags.size ||
            [...currentTags].some((tag) => !initialTags.has(tag))
          );
        }
      }
      // Default comparison
      return (
        JSON.stringify(currentValues[key]) !==
        JSON.stringify(initialValues.current[key])
      );
    });

    return changedFields.length > 0;
  };

  const handleSubmit = async (values) => {
    try {
      // Check if form has changed
      if (!hasFormChanged() && !formChanged) {
        message.info("No changes detected. Update skipped.");
        return;
      }

      setSubmitting(true);

      if (!program || !program.programID) {
        throw new Error("Program ID is missing");
      }

      // Log the form values for debugging
      console.log("Form values before submission:", values);

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
        // Ensure tags are just the tag IDs
        tags: Array.isArray(values.tags)
          ? values.tags.map((tag) =>
              typeof tag === "object" ? tag.value || tag.tagId : tag
            )
          : values.tags,
      };

      console.log("Formatted values for submission:", formattedValues);

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

  // Add this inside the component, before the return statement
  const validateEndTime = (_, value) => {
    const startTime = form.getFieldValue("startTime");
    if (startTime && value && value.isBefore(startTime)) {
      return Promise.reject(new Error("End time must be after start time"));
    }
    return Promise.resolve();
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
        onValuesChange={handleFormChange}
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
              <TimePicker
                format="HH:mm"
                className="w-full"
                onChange={() => {
                  // When start time changes, validate end time again
                  const endTime = form.getFieldValue("endTime");
                  if (endTime) {
                    form.validateFields(["endTime"]);
                  }
                }}
              />
            </Form.Item>

            <Form.Item
              name="endTime"
              label="End Time"
              className="flex-1"
              rules={[
                { required: true, message: "Please select end time" },
                { validator: validateEndTime },
              ]}
              dependencies={["startTime"]} // This ensures validation runs when startTime changes
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

          <Divider className="md:col-span-2 my-2" />

          {/* Program Assignment Section */}
          <div className="md:col-span-2">
            <h4 className="text-sm font-medium text-gray-700 mb-4">
              Program Assignment
            </h4>
          </div>

          <Form.Item
            name="departmentId"
            label={
              <div className="flex items-center">
                <span>Department</span>
                <Tooltip title="Department cannot be changed">
                  <span className="ml-1 text-gray-400">
                    <LockOutlined />
                  </span>
                </Tooltip>
              </div>
            }
            rules={[{ required: true, message: "Please select a department" }]}
          >
            <Select
              placeholder="Select department"
              options={departments}
              loading={loading}
              suffixIcon={<BankOutlined className="text-gray-400" />}
              className="rounded-lg"
              dropdownClassName="department-dropdown"
              optionLabelProp="label"
              showSearch
              disabled={true}
              filterOption={(input, option) =>
                option.label.toLowerCase().indexOf(input.toLowerCase()) >= 0
              }
              notFoundContent={
                loading ? (
                  <div className="text-center py-2">
                    <span className="text-gray-500">
                      Loading departments...
                    </span>
                  </div>
                ) : (
                  <div className="text-center py-2">
                    <span className="text-gray-500">No departments found</span>
                  </div>
                )
              }
            />
          </Form.Item>

          <Form.Item
            name="facilitatorId"
            label={
              <div className="flex items-center">
                <span>Facilitator</span>
                <Tooltip title="Facilitator cannot be changed">
                  <span className="ml-1 text-gray-400">
                    <LockOutlined />
                  </span>
                </Tooltip>
              </div>
            }
            rules={[{ required: true, message: "Please select a facilitator" }]}
          >
            <Select
              placeholder="Select facilitator"
              options={psychologists}
              loading={loading}
              suffixIcon={<UserOutlined className="text-gray-400" />}
              className="rounded-lg"
              dropdownClassName="facilitator-dropdown"
              optionLabelProp="label"
              showSearch
              disabled={true}
              filterOption={(input, option) =>
                option.label.toLowerCase().indexOf(input.toLowerCase()) >= 0
              }
              notFoundContent={
                loading ? (
                  <div className="text-center py-2">
                    <span className="text-gray-500">
                      Loading facilitators...
                    </span>
                  </div>
                ) : (
                  <div className="text-center py-2">
                    <span className="text-gray-500">No facilitators found</span>
                  </div>
                )
              }
              optionRender={(option) => (
                <div className="flex items-center py-1">
                  <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center mr-2">
                    <UserOutlined className="text-blue-500" />
                  </div>
                  <div>
                    <div className="font-medium">{option.data.label}</div>
                  </div>
                </div>
              )}
            />
          </Form.Item>

          {/* Tags Section */}
          <div className="md:col-span-2">
            <h4 className="text-sm font-medium text-gray-700 mb-4">
              Program Tags
            </h4>
          </div>

          <Form.Item
            name="tags"
            label="Tags"
            className="md:col-span-2"
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
              className="rounded-lg"
              suffixIcon={<TagsOutlined className="text-gray-400" />}
              tagRender={(props) => {
                const { label, closable, onClose } = props;
                return (
                  <Tag
                    color="blue"
                    closable={closable}
                    onClose={onClose}
                    className="mr-2 mb-2 py-1"
                  >
                    {label}
                  </Tag>
                );
              }}
            >
              {tags.map((tag) => (
                <Option key={tag.value} value={tag.value} label={tag.label}>
                  <div className="flex items-center py-1">
                    <TagsOutlined className="mr-2 text-blue-500" />
                    <span>{tag.label}</span>
                  </div>
                </Option>
              ))}
            </Select>
          </Form.Item>
        </div>

        <div className="flex justify-end gap-3 mt-6">
          <Button onClick={onCancel}>Cancel</Button>
          <Button
            type="primary"
            htmlType="submit"
            loading={submitting}
            className="bg-primary-green hover:bg-primary-green/90"
            disabled={!formChanged && !hasFormChanged()}
          >
            Update Program
          </Button>
        </div>
      </Form>

      {/* Add some custom styles */}
      <style jsx global>{`
        .department-dropdown .ant-select-item-option-selected {
          background-color: #f0f9ff;
        }
        .facilitator-dropdown .ant-select-item-option-selected {
          background-color: #f0f9ff;
        }
        .ant-select-selection-item-content {
          display: flex;
          align-items: center;
        }
      `}</style>
    </Modal>
  );
};

export default UpdateProgramModal;

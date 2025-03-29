import React, { useState, useEffect } from "react";
import { Modal, Button, Tag, Space, Skeleton, message, Popconfirm } from "antd";
import {
  CalendarOutlined,
  TeamOutlined,
  FieldTimeOutlined,
  LinkOutlined,
  UserOutlined,
  CloseCircleOutlined,
} from "@ant-design/icons";
import { useProgramStore } from "../stores/programStore";
import { useAuthStore } from "../stores/authStore";

const ProgramDetailsModal = ({
  isOpen,
  onClose,
  program,
  loading,
  onJoinProgram,
  onCancelParticipation,
}) => {
  const { registerProgram, fetchProgramDetails, cancelProgramParticipation } =
    useProgramStore();
  const { user } = useAuthStore();
  const [registering, setRegistering] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [registered, setRegistered] = useState(
    program?.studentStatus === "JOINED"
  );
  const [updatedProgram, setUpdatedProgram] = useState(null);

  // Use the updated program data if available, otherwise use the original program
  const displayProgram = updatedProgram || program;

  // Reset registered state when modal opens with new program
  useEffect(() => {
    if (program) {
      setRegistered(program.studentStatus === "JOINED");
      setUpdatedProgram(null);
    }
  }, [program]);

  // Add a cleanup effect to handle modal closing properly
  useEffect(() => {
    return () => {
      // Clean up state when modal closes
      if (!isOpen) {
        setUpdatedProgram(null);
      }
    };
  }, [isOpen]);

  const handleJoinProgram = async () => {
    if (!program || !user) return;

    // Get studentID from user object
    const studentId = user.studentId || user.studentInfo?.studentId;
    if (!studentId) {
      message.error("Student ID not found. Please update your profile.");
      return;
    }

    try {
      setRegistering(true);

      // Call the API to register for the program
      await registerProgram(program.programID, studentId);

      // Update local state to show success
      setRegistered(true);

      // Create a safe copy of the program with updated values
      const updatedProgramData = {
        ...program,
        currentParticipants: program.currentParticipants + 1,
        status:
          program.currentParticipants + 1 >= program.maxParticipants
            ? "FULL"
            : program.status,
        studentStatus: "JOINED",
      };

      // Update the local state
      setUpdatedProgram(updatedProgramData);

      // Show success message
      message.success("Successfully registered for the program!");

      // Call the callback if provided to update the parent component
      if (onJoinProgram) {
        onJoinProgram(program.programID, updatedProgramData);
      }

      // Fetch the updated program details in the background
      try {
        const updatedData = await fetchProgramDetails(program.programID);
        if (updatedData) {
          setUpdatedProgram(updatedData);
        }
      } catch (error) {
        console.error("Failed to fetch updated program details:", error);
        // Keep the optimistic update if fetch fails
      }
    } catch (error) {
      console.error("Registration error in component:", error);
      message.error(
        `Failed to register: ${error.message || "Please try again"}`
      );
    } finally {
      setRegistering(false);
    }
  };

  const handleCancelParticipation = async () => {
    if (!program) return;

    // Check if the student is actually registered
    if (program.studentStatus !== "JOINED") {
      message.error("You are not registered for this program");
      return;
    }

    try {
      setCancelling(true);

      // Call the API to cancel program participation
      await cancelProgramParticipation(program.programID);

      // Update local state
      setRegistered(false);

      // Create a safe copy of the program with updated values
      const updatedProgramData = {
        ...program,
        currentParticipants: Math.max(0, program.currentParticipants - 1),
        status: "ACTIVE", // Reset to active since a spot opened up
        studentStatus: undefined, // Remove joined status
      };

      // Update the local state
      setUpdatedProgram(updatedProgramData);

      // Show success message
      message.success("Successfully cancelled program participation");

      // Call the callback if provided to update the parent component
      if (onJoinProgram) {
        onJoinProgram(program.programID, updatedProgramData);
      }

      // Call the new cancellation callback if provided
      if (onCancelParticipation) {
        onCancelParticipation(program.programID);
      }

      // Fetch the updated program details in the background
      try {
        const updatedData = await fetchProgramDetails(program.programID);
        if (updatedData) {
          setUpdatedProgram(updatedData);
        }
      } catch (error) {
        console.error("Failed to fetch updated program details:", error);
        // Keep the optimistic update if fetch fails
      }
    } catch (error) {
      console.error("Cancellation error:", error);
      message.error(error.message || "Failed to cancel participation");
    } finally {
      setCancelling(false);
    }
  };

  return (
    <Modal
      title={
        <div className="flex items-center gap-3 border-b pb-3">
          <div className="bg-primary-green/10 p-2 rounded-lg">
            <CalendarOutlined className="text-xl text-primary-green" />
          </div>
          <div>
            <h3 className="text-xl font-semibold text-gray-800 m-0">
              Program Details
            </h3>
            <p className="text-sm text-gray-500 m-0">
              View complete program information
            </p>
          </div>
        </div>
      }
      open={isOpen}
      onCancel={onClose}
      width={600}
      className="program-details-modal"
      centered
      destroyOnClose={true}
      footer={
        <div className="flex justify-end gap-3">
          <Button onClick={onClose}>Close</Button>
          {!registered ? (
            <Button
              type="primary"
              className="bg-primary-green hover:bg-primary-green/90"
              onClick={handleJoinProgram}
              loading={registering}
              disabled={
                !user ||
                !(user.studentId || user.studentInfo?.studentId) ||
                registering ||
                (displayProgram && displayProgram.status === "FULL") ||
                (displayProgram && displayProgram.studentStatus === "JOINED")
              }
            >
              {displayProgram && displayProgram.status === "FULL"
                ? "Program Full"
                : displayProgram && displayProgram.studentStatus === "JOINED"
                ? "Already Registered"
                : "Join Program"}
            </Button>
          ) : (
            <div className="flex gap-2">
              {displayProgram &&
                displayProgram.type === "ONLINE" &&
                displayProgram.meetingLink && (
                  <Button
                    type="primary"
                    className="bg-primary-green hover:bg-primary-green/90"
                    icon={<LinkOutlined />}
                    onClick={() =>
                      window.open(displayProgram.meetingLink, "_blank")
                    }
                  >
                    Join Meeting
                  </Button>
                )}
              <Popconfirm
                title="Cancel Program Participation"
                description="Are you sure you want to cancel your participation in this program?"
                onConfirm={handleCancelParticipation}
                okText="Yes, Cancel"
                cancelText="No"
                okButtonProps={{
                  danger: true,
                  loading: cancelling,
                }}
              >
                <Button
                  danger
                  icon={<CloseCircleOutlined />}
                  loading={cancelling}
                >
                  Cancel Participation
                </Button>
              </Popconfirm>
            </div>
          )}
        </div>
      }
    >
      <ModalContent
        program={displayProgram}
        loading={loading}
        registered={registered}
      />
    </Modal>
  );
};

const ModalContent = React.memo(({ program, loading, registered }) => {
  if (loading) {
    return <LoadingSkeleton />;
  }

  if (!program) {
    return (
      <div className="py-8 text-center">
        <p>No program data available</p>
      </div>
    );
  }

  // Show success message if registered
  if (registered) {
    return (
      <div className="py-8 text-center animate-fadeIn">
        <div className="bg-green-50 p-6 rounded-xl mb-6">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-8 w-8 text-green-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-gray-800 mb-2">
            {program.studentStatus === "JOINED"
              ? "Already Registered"
              : "Registration Successful!"}
          </h3>
          <p className="text-gray-600">
            You are registered for <strong>{program.title}</strong>. You can
            access this program from your profile.
          </p>
        </div>

        <div className="bg-blue-50 p-4 rounded-lg text-left">
          <h4 className="text-md font-medium text-gray-800 mb-2">
            Program Schedule
          </h4>
          <ul className="space-y-2 text-sm text-gray-600">
            <li className="flex items-start">
              <span className="mr-2">•</span>
              <span>
                Weekly on {program.weeklySchedule.weeklyAt}s from{" "}
                {program.weeklySchedule.startTime.substring(0, 5)} to{" "}
                {program.weeklySchedule.endTime.substring(0, 5)}
              </span>
            </li>
            <li className="flex items-start">
              <span className="mr-2">•</span>
              <span>
                Starting from {new Date(program.startDate).toLocaleDateString()}
              </span>
            </li>
            {program.type === "ONLINE" && (
              <li className="flex items-start">
                <span className="mr-2">•</span>
                <span>Join via the meeting link in your profile</span>
              </li>
            )}
          </ul>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 animate-fadeIn">
      {/* Program Header */}
      <div className="border-b pb-3">
        <h2 className="text-xl font-bold text-gray-800 mb-2">
          {program.title}
        </h2>
        <p className="text-gray-600 text-sm">{program.description}</p>
      </div>

      {/* Program Details Grid */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-gray-50 p-3 rounded-lg">
          <div className="flex items-center gap-2 mb-1">
            <CalendarOutlined className="text-primary-green" />
            <p className="text-gray-500 text-sm">Start Date</p>
          </div>
          <p className="font-medium text-sm">
            {new Date(program.startDate).toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </p>
        </div>

        <div className="bg-gray-50 p-3 rounded-lg">
          <div className="flex items-center gap-2 mb-1">
            <FieldTimeOutlined className="text-primary-green" />
            <p className="text-gray-500 text-sm">Duration</p>
          </div>
          <p className="font-medium text-sm">{program.duration} weeks</p>
        </div>

        {/* Add Weekly Schedule Card */}
        <div className="bg-gray-50 p-3 rounded-lg col-span-2">
          <div className="flex items-center gap-2 mb-2">
            <CalendarOutlined className="text-primary-green" />
            <p className="text-gray-500 text-sm">Weekly Schedule</p>
          </div>
          <div className="flex flex-col space-y-1">
            <div className="flex items-center">
              <span className="text-sm font-medium text-gray-700 w-20">
                Day:
              </span>
              <span className="text-sm text-gray-600">
                {program.weeklySchedule.weeklyAt}s
              </span>
            </div>
            <div className="flex items-center">
              <span className="text-sm font-medium text-gray-700 w-20">
                Time:
              </span>
              <span className="text-sm text-gray-600">
                {program.weeklySchedule.startTime.substring(0, 5)} -{" "}
                {program.weeklySchedule.endTime.substring(0, 5)}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-gray-50 p-3 rounded-lg">
          <div className="flex items-center gap-2 mb-1">
            <TeamOutlined className="text-primary-green" />
            <p className="text-gray-500 text-sm">Participants</p>
          </div>
          <p className="font-medium text-sm">
            {program.currentParticipants}/{program.maxParticipants} participants
          </p>
          <div className="w-full bg-gray-200 rounded-full h-1.5 mt-2">
            <div
              className="bg-primary-green h-1.5 rounded-full"
              style={{
                width: `${
                  (program.currentParticipants / program.maxParticipants) * 100
                }%`,
              }}
            ></div>
          </div>
        </div>

        <div className="bg-gray-50 p-3 rounded-lg">
          <div className="flex items-center gap-2 mb-1">
            <i className="text-primary-green" />
            <p className="text-gray-500 text-sm">Type</p>
          </div>
          <Tag
            color={program.type === "ONLINE" ? "blue" : "green"}
            className="mt-1"
          >
            {program.type.charAt(0) + program.type.slice(1).toLowerCase()}
          </Tag>
        </div>
      </div>

      {/* Facilitator Info */}
      <div className="bg-gray-50 p-3 rounded-lg">
        <div className="flex items-center">
          <div className="bg-primary-green/10 p-2 rounded-full mr-3">
            <UserOutlined className="text-primary-green" />
          </div>
          <div>
            <p className="text-gray-500 text-sm mb-0">Facilitator</p>
            <p className="font-medium text-sm">{program.facilitatorName}</p>
            <p className="text-xs text-gray-500">{program.departmentName}</p>
          </div>
        </div>
      </div>

      {/* Online Meeting Link */}
      {program.type === "ONLINE" && program.meetingLink && (
        <div className="bg-blue-50 p-3 rounded-lg">
          <p className="text-gray-500 text-sm mb-1">Meeting Link</p>
          <div className="flex items-center gap-2">
            <LinkOutlined className="text-primary-green" />
            <Button
              type="link"
              href={program.meetingLink}
              target="_blank"
              rel="noopener noreferrer"
              className="p-0 h-auto text-primary-green hover:text-primary-green/80"
            >
              Join Meeting
            </Button>
          </div>
        </div>
      )}

      {/* Status */}
      <div className="bg-gray-50 p-3 rounded-lg">
        <p className="text-gray-500 text-sm mb-1">Program Status</p>
        <Tag
          className={`mt-1 ${
            program.status === "ACTIVE"
              ? "bg-green-50 text-green-700 border-green-200"
              : program.status === "FULL"
              ? "bg-orange-50 text-orange-700 border-orange-200"
              : "bg-red-50 text-red-700 border-red-200"
          }`}
        >
          {program.status.charAt(0) + program.status.slice(1).toLowerCase()}
        </Tag>
      </div>

      {/* Tags */}
      {program.tags && program.tags.length > 0 && (
        <div className="pt-2">
          <p className="text-gray-500 text-sm mb-2">Program Tags</p>
          <Space wrap size={[0, 8]}>
            {program.tags.map((tag) => (
              <Tag
                key={tag}
                className="bg-gray-50 border border-gray-200 text-sm"
              >
                {tag}
              </Tag>
            ))}
          </Space>
        </div>
      )}
    </div>
  );
});

export const LoadingSkeleton = () => (
  <div className="space-y-4">
    <Skeleton.Input active block style={{ height: 32 }} />
    <Skeleton active paragraph={{ rows: 2 }} />
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="bg-gray-50 p-3 rounded-lg flex flex-col">
          <Skeleton.Input active size="small" style={{ width: "50%" }} />
          <Skeleton.Input active style={{ width: "100%", marginTop: 8 }} />
        </div>
      ))}
    </div>
  </div>
);

export default React.memo(ProgramDetailsModal);

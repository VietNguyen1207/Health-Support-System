import React from "react";
import { Modal, Button, Tag, Space, Skeleton } from "antd";
import {
  CalendarOutlined,
  TeamOutlined,
  FieldTimeOutlined,
  LinkOutlined,
} from "@ant-design/icons";

const ProgramDetailsModal = ({
  isOpen,
  onClose,
  program,
  loading,
  onJoinProgram,
}) => {
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
          <Button onClick={onClose}>Back</Button>
          <Button
            type="primary"
            className="bg-primary-green hover:bg-primary-green/90"
            onClick={() => program && onJoinProgram(program.programID)}
            disabled={loading}
          >
            Join Program
          </Button>
        </div>
      }
    >
      <ModalContent program={program} loading={loading} />
    </Modal>
  );
};

const ModalContent = React.memo(({ program, loading }) => {
  if (loading) {
    return <LoadingSkeleton />;
  }

  if (!program) return null;

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

        <div className="bg-gray-50 p-3 rounded-lg">
          <div className="flex items-center gap-2 mb-1">
            <TeamOutlined className="text-primary-green" />
            <p className="text-gray-500 text-sm">Capacity</p>
          </div>
          <p className="font-medium text-sm">
            {program.numberParticipants} participants
          </p>
        </div>

        <div className="bg-gray-50 p-3 rounded-lg">
          <div className="flex items-center gap-2 mb-1">
            <i className="text-primary-green" />
            <p className="text-gray-500 text-sm">Type</p>
          </div>
          <Tag
            color={program.type === "Online" ? "blue" : "green"}
            className="mt-1"
          >
            {program.type}
          </Tag>
        </div>
      </div>

      {/* Facilitator Info */}
      <div className="bg-gray-50 p-3 rounded-lg">
        <div className="flex items-center">
          <div className="bg-primary-green/10 p-2 rounded-full mr-3">
            <TeamOutlined className="text-primary-green" />
          </div>
          <div>
            <p className="text-gray-500 text-sm mb-0">Facilitator</p>
            <p className="font-medium text-sm">{program.facilitatorName}</p>
            <p className="text-xs text-gray-500">{program.departmentName}</p>
          </div>
        </div>
      </div>

      {/* Online Meeting Link - Fixed to prevent nested anchors */}
      {program.type === "Online" && program.meetingLink && (
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

      {/* Tags */}
      {program.tags && program.tags.length > 0 && (
        <div className="pt-2">
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

const LoadingSkeleton = () => (
  <div className="space-y-4">
    <Skeleton.Input active block style={{ height: 32 }} />
    <Skeleton active paragraph={{ rows: 2 }} />
    <div className="grid grid-cols-2 gap-4">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="bg-gray-50 p-3 rounded-lg">
          <Skeleton.Input active size="small" style={{ width: 80 }} />
          <Skeleton.Input active style={{ width: 120, marginTop: 8 }} />
        </div>
      ))}
    </div>
  </div>
);

export default React.memo(ProgramDetailsModal);

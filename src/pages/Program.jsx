import React, { useEffect, useState, useCallback } from "react";
import {
  Card,
  Button,
  Tag,
  Space,
  Tooltip,
  Spin,
  Pagination,
  message,
} from "antd";
import {
  CalendarOutlined,
  TeamOutlined,
  FieldTimeOutlined,
  ArrowRightOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { useProgramStore } from "../stores/programStore";
import ProgramDetailsModal from "../components/ProgramDetailsModal";

const Program = () => {
  const {
    programs,
    loading,
    loadingDetails,
    selectedProgram,
    fetchPrograms,
    fetchProgramDetails,
    clearSelectedProgram,
  } = useProgramStore();

  const [currentPage, setCurrentPage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const pageSize = 6;

  useEffect(() => {
    fetchPrograms();
  }, [fetchPrograms]);

  // Calculate current programs to display
  const getCurrentPrograms = () => {
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    return programs.slice(startIndex, endIndex);
  };

  // Handle page change
  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Handle view program details
  const handleViewProgram = useCallback(
    async (programId) => {
      setIsModalOpen(true);
      try {
        await fetchProgramDetails(programId);
      } catch (error) {
        message.error("Failed to load program details");
        setIsModalOpen(false);
      }
    },
    [fetchProgramDetails]
  );

  // Handle modal close
  const handleModalClose = useCallback(() => {
    setIsModalOpen(false);
    setTimeout(clearSelectedProgram, 300);
  }, [clearSelectedProgram]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div className="general-wrapper">
      {/* Hero Section */}
      <div className="hero-section">
        <div className="hero-content">
          <h1 className="hero-title">Available Programs</h1>
          <p className="hero-subtitle">
            Join our mental health and wellness programs designed to support
            your well-being journey
          </p>
        </div>
      </div>

      {/* Programs Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {getCurrentPrograms().map((program) => (
            <Card
              key={program.programID}
              className="group hover:shadow-2xl transition-all duration-300 border-0 rounded-2xl overflow-hidden bg-white"
              bodyStyle={{ padding: 0 }}
            >
              {/* Card Header with Type Badge */}
              <div className="relative p-6 pb-4">
                <div className="absolute top-6 right-6">
                  <Tag
                    color={program.type === "Online" ? "blue" : "green"}
                    className={`px-3 py-1 rounded-full text-sm font-medium ${
                      program.type === "Online"
                        ? "bg-blue-50 text-blue-600 border-blue-100"
                        : "bg-green-50 text-green-600 border-green-100"
                    }`}
                  >
                    {program.type}
                  </Tag>
                </div>
                <h3 className="text-xl font-semibold text-gray-800 mb-3 pr-24">
                  {program.title}
                </h3>
                <p className="text-gray-600 text-sm leading-relaxed line-clamp-2 mb-4">
                  {program.description}
                </p>
              </div>

              {/* Card Content */}
              <div className="px-6 space-y-4">
                {/* Program Details */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-50 rounded-xl p-3">
                    <div className="flex items-center gap-2 mb-1.5">
                      <CalendarOutlined className="text-primary-green text-lg" />
                      <span className="text-gray-500 text-xs font-medium">
                        Start Date
                      </span>
                    </div>
                    <span className="text-sm text-gray-800 font-medium">
                      {new Date(program.startDate).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </span>
                  </div>

                  <div className="bg-gray-50 rounded-xl p-3">
                    <div className="flex items-center gap-2 mb-1.5">
                      <FieldTimeOutlined className="text-primary-green text-lg" />
                      <span className="flex justify-center items-center text-gray-500 text-xs font-medium">
                        Duration
                      </span>
                    </div>
                    <div className="flex items-center justitfy-center">
                      <span className="flex justify-center items-center text-sm text-gray-800 font-medium">
                        {program.duration} weeks
                      </span>
                    </div>
                  </div>
                </div>

                {/* Participants Info */}
                <div className="bg-gray-50 rounded-xl p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="bg-white p-2 rounded-full">
                      <TeamOutlined className="text-primary-green text-lg" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 font-medium mb-0.5">
                        Participants
                      </p>
                      <p className="flex justify-center text-sm text-gray-800 font-medium">
                        {program.numberParticipants}
                      </p>
                    </div>
                  </div>
                  <div className="h-10 w-px bg-gray-200"></div>
                  <div className="text-right min-w-[80px]">
                    <p className="flex justify-center items-center  text-xs text-gray-500 font-medium mb-0.5">
                      Status
                    </p>
                    <span
                      className={`flex justify-center items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        program.status === "Active"
                          ? "bg-green-50 text-green-700"
                          : program.status === "Full"
                          ? "bg-orange-50 text-orange-700"
                          : program.status === "Closed"
                          ? "bg-red-50 text-red-700"
                          : "bg-gray-50 text-gray-700"
                      }`}
                    >
                      {program.status}
                    </span>
                  </div>
                </div>
              </div>

              {/* Card Footer */}
              <div className="p-6 pt-4">
                <Tooltip title="Click to view program details">
                  <Button
                    type="primary"
                    onClick={() => handleViewProgram(program.programID)}
                    className="w-full bg-primary-green hover:bg-primary-green/90 flex items-center justify-center gap-2 group h-11 rounded-xl shadow-sm"
                  >
                    <span className="text-sm font-medium">View Program</span>
                    <ArrowRightOutlined className="transition-transform duration-300 group-hover:translate-x-1" />
                  </Button>
                </Tooltip>
              </div>
            </Card>
          ))}
        </div>

        {/* Pagination */}
        {programs.length > 0 && (
          <div className="flex justify-center mt-12">
            <Pagination
              current={currentPage}
              total={programs.length}
              pageSize={pageSize}
              onChange={handlePageChange}
              showSizeChanger={false}
            />
          </div>
        )}
      </div>

      {/* Program Details Modal */}
      <ProgramDetailsModal
        isOpen={isModalOpen}
        onClose={handleModalClose}
        program={selectedProgram}
        loading={loadingDetails}
      />
    </div>
  );
};

export default Program;

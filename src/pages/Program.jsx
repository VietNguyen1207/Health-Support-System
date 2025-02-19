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
  // Mock data - replace with API call later
  // const programs = [
  //   {
  //     id: 1,
  //     title: "Stress Management Workshop",
  //     description:
  //       "Learn effective techniques to manage academic stress and anxiety.",
  //     category: "Mental Health",
  //     startDate: "2024-04-01",
  //     duration: "6 weeks",
  //     capacity: 20,
  //     enrolled: 12,
  //     status: "Open",
  //     facilitator: "Dr. Sarah Johnson",
  //     tags: ["Stress", "Anxiety", "Self-Care"],
  //   },
  //   {
  //     id: 2,
  //     title: "Peer Support Group",
  //     description:
  //       "Weekly group sessions for students to share experiences and support each other.",
  //     category: "Support Group",
  //     startDate: "2024-04-15",
  //     duration: "8 weeks",
  //     capacity: 15,
  //     enrolled: 8,
  //     status: "Open",
  //     facilitator: "Dr. Michael Chen",
  //     tags: ["Peer Support", "Communication", "Social Skills"],
  //   },
  //   {
  //     id: 3,
  //     title: "Mindfulness and Meditation",
  //     description:
  //       "Introduction to mindfulness practices for better mental well-being.",
  //     category: "Wellness",
  //     startDate: "2024-04-10",
  //     duration: "4 weeks",
  //     capacity: 25,
  //     enrolled: 20,
  //     status: "Open",
  //     facilitator: "Ms. Emily Wong",
  //     tags: ["Mindfulness", "Meditation", "Relaxation"],
  //   },
  //   {
  //     id: 4,
  //     title: "Academic Performance Anxiety Group",
  //     description:
  //       "Learn strategies to cope with test anxiety and academic pressure.",
  //     category: "Academic Support",
  //     startDate: "2024-04-20",
  //     duration: "5 weeks",
  //     capacity: 18,
  //     enrolled: 15,
  //     status: "Open",
  //     facilitator: "Dr. James Wilson",
  //     tags: ["Test Anxiety", "Academic Stress", "Performance"],
  //   },
  //   {
  //     id: 5,
  //     title: "Social Skills Development",
  //     description:
  //       "Build confidence in social situations and improve interpersonal relationships.",
  //     category: "Social Skills",
  //     startDate: "2024-05-01",
  //     duration: "6 weeks",
  //     capacity: 12,
  //     enrolled: 6,
  //     status: "Open",
  //     facilitator: "Ms. Rachel Green",
  //     tags: ["Social Skills", "Communication", "Confidence"],
  //   },
  //   {
  //     id: 6,
  //     title: "Emotional Intelligence Workshop",
  //     description: "Develop better emotional awareness and management skills.",
  //     category: "Personal Development",
  //     startDate: "2024-05-05",
  //     duration: "4 weeks",
  //     capacity: 20,
  //     enrolled: 10,
  //     status: "Open",
  //     facilitator: "Dr. Lisa Thompson",
  //     tags: ["Emotional Intelligence", "Self-Awareness", "Relationships"],
  //   },
  //   {
  //     id: 7,
  //     title: "Resilience Building Program",
  //     description:
  //       "Strengthen your ability to bounce back from challenges and setbacks.",
  //     category: "Mental Health",
  //     startDate: "2024-05-10",
  //     duration: "7 weeks",
  //     capacity: 15,
  //     enrolled: 9,
  //     status: "Open",
  //     facilitator: "Dr. Robert Martinez",
  //     tags: ["Resilience", "Coping Skills", "Personal Growth"],
  //   },
  //   {
  //     id: 8,
  //     title: "Time Management Skills",
  //     description:
  //       "Master effective time management and organizational strategies.",
  //     category: "Academic Support",
  //     startDate: "2024-05-15",
  //     duration: "3 weeks",
  //     capacity: 25,
  //     enrolled: 18,
  //     status: "Open",
  //     facilitator: "Prof. David Brown",
  //     tags: ["Time Management", "Organization", "Productivity"],
  //   },
  //   {
  //     id: 9,
  //     title: "Healthy Relationships Workshop",
  //     description:
  //       "Learn about building and maintaining healthy relationships.",
  //     category: "Relationships",
  //     startDate: "2024-05-20",
  //     duration: "5 weeks",
  //     capacity: 16,
  //     enrolled: 7,
  //     status: "Open",
  //     facilitator: "Dr. Anna Lee",
  //     tags: ["Relationships", "Communication", "Boundaries"],
  //   },
  //   {
  //     id: 10,
  //     title: "Sleep Hygiene and Wellness",
  //     description: "Improve your sleep habits and overall well-being.",
  //     category: "Wellness",
  //     startDate: "2024-06-01",
  //     duration: "4 weeks",
  //     capacity: 20,
  //     enrolled: 11,
  //     status: "Open",
  //     facilitator: "Dr. Mark Stevens",
  //     tags: ["Sleep", "Wellness", "Health"],
  //   },
  //   {
  //     id: 11,
  //     title: "Grief and Loss Support Group",
  //     description:
  //       "Supportive environment for students dealing with loss and grief.",
  //     category: "Support Group",
  //     startDate: "2024-06-05",
  //     duration: "8 weeks",
  //     capacity: 12,
  //     enrolled: 5,
  //     status: "Open",
  //     facilitator: "Dr. Patricia Moore",
  //     tags: ["Grief", "Support", "Healing"],
  //   },
  //   {
  //     id: 12,
  //     title: "Cultural Adjustment Support",
  //     description:
  //       "Help international students adapt to new cultural environments.",
  //     category: "Cultural Support",
  //     startDate: "2024-06-10",
  //     duration: "6 weeks",
  //     capacity: 15,
  //     enrolled: 8,
  //     status: "Open",
  //     facilitator: "Ms. Sofia Rodriguez",
  //     tags: ["Cultural Adjustment", "International", "Support"],
  //   },
  //   {
  //     id: 13,
  //     title: "Body Image and Self-Esteem",
  //     description: "Build a healthy relationship with yourself and your body.",
  //     category: "Mental Health",
  //     startDate: "2024-06-15",
  //     duration: "7 weeks",
  //     capacity: 15,
  //     enrolled: 10,
  //     status: "Open",
  //     facilitator: "Dr. Emma Watson",
  //     tags: ["Self-Esteem", "Body Image", "Mental Health"],
  //   },
  //   {
  //     id: 14,
  //     title: "Mindful Leadership",
  //     description:
  //       "Develop leadership skills with a focus on mindfulness and emotional intelligence.",
  //     category: "Leadership",
  //     startDate: "2024-06-20",
  //     duration: "5 weeks",
  //     capacity: 20,
  //     enrolled: 13,
  //     status: "Open",
  //     facilitator: "Prof. John Anderson",
  //     tags: ["Leadership", "Mindfulness", "Personal Development"],
  //   },
  //   {
  //     id: 15,
  //     title: "Digital Wellness Workshop",
  //     description: "Learn to maintain mental health in the digital age.",
  //     category: "Digital Wellness",
  //     startDate: "2024-07-01",
  //     duration: "4 weeks",
  //     capacity: 25,
  //     enrolled: 15,
  //     status: "Open",
  //     facilitator: "Dr. Tech Smith",
  //     tags: ["Digital Wellness", "Screen Time", "Mental Health"],
  //   },
  // ];

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

  // Handle join program
  const handleJoinProgram = useCallback((programId) => {
    message.info("Join program functionality will be implemented soon!");
  }, []);

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
                      <span className="text-gray-500 text-xs font-medium">
                        Duration
                      </span>
                    </div>
                    <span className="text-sm text-gray-800 font-medium">
                      {program.duration} weeks
                    </span>
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
                      <p className="text-sm text-gray-800 font-medium">
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
        onJoinProgram={handleJoinProgram}
      />
    </div>
  );
};

export default Program;

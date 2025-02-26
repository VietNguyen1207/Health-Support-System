import React, { useState, useEffect } from "react";
import { Card, Progress, Tag, Spin, Empty, Modal } from "antd";
import {
  CalendarOutlined,
  TeamOutlined,
  FieldTimeOutlined,
  LinkOutlined,
} from "@ant-design/icons";
import studentData from "../../data/student-data.json";
import { useProgramStore } from "../../stores/programStore";
import { useAuthStore } from "../../stores/authStore";

const StudentProfile = () => {
  // For demo, using first student - in real app, you'd use student ID from auth/route
  const student = studentData.students[0];

  const { user } = useAuthStore();
  const { fetchEnrolledPrograms, fetchProgramDetails, loading } =
    useProgramStore();
  const [enrolledPrograms, setEnrolledPrograms] = useState([]);
  const [selectedProgram, setSelectedProgram] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [loadingProgram, setLoadingProgram] = useState(false);

  useEffect(() => {
    const getEnrolledPrograms = async () => {
      if (user?.studentId) {
        try {
          const programs = await fetchEnrolledPrograms(user.studentId);
          setEnrolledPrograms(programs);
        } catch (error) {
          console.error("Failed to fetch enrolled programs:", error);
        }
      }
    };

    getEnrolledPrograms();
  }, [fetchEnrolledPrograms, user]);

  const handleProgramClick = async (programId) => {
    try {
      setLoadingProgram(true);
      const programDetails = await fetchProgramDetails(programId);
      setSelectedProgram(programDetails);
      setIsModalVisible(true);
    } catch (error) {
      console.error("Failed to fetch program details:", error);
    } finally {
      setLoadingProgram(false);
    }
  };

  const getIndicatorColor = (score) => {
    if (score <= 3) return "#4a7c59";
    if (score <= 6) return "#fbbf24";
    return "#ef4444";
  };

  const renderAssessmentCard = (title, score, maxScore = 10) => (
    <Card className="assessment-card bg-white rounded-xl shadow-sm">
      <div className="text-center mb-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-1">{title}</h3>
        <Progress
          type="circle"
          percent={(score / maxScore) * 100}
          strokeColor={getIndicatorColor(score)}
          strokeWidth={10}
          width={80}
          format={() => <span className="text-lg">{score}</span>}
        />
      </div>
      <p className="text-sm text-gray-500 text-center">
        Last updated:{" "}
        {new Date(
          student.mental_health_data.last_assessment
        ).toLocaleDateString()}
      </p>
    </Card>
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white pt-24 pb-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Student Basic Info Card */}
        <Card className="shadow-lg rounded-2xl">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
            <div className="w-32 h-32 bg-custom-green/10 rounded-full flex items-center justify-center">
              <span className="text-4xl text-custom-green font-semibold">
                {student.name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")}
              </span>
            </div>
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-gray-900 mb-2 text-center md:text-left">
                {student.name}
              </h1>
              <div className="grid grid-cols-2 gap-4 mt-4">
                <div>
                  <p className="text-sm text-gray-500">Student ID</p>
                  <p className="font-medium text-gray-900">{student.id}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Grade</p>
                  <p className="font-medium text-gray-900">{student.grade}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Age</p>
                  <p className="font-medium text-gray-900">{student.age}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Attendance Rate</p>
                  <p className="font-medium text-gray-900">
                    {student.mental_health_data.attendance_rate}%
                  </p>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Mental Health Assessments */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-gray-900">
            Mental Health Overview
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {renderAssessmentCard(
              "Anxiety Level",
              student.mental_health_data.anxiety_level
            )}
            {renderAssessmentCard(
              "Stress Level",
              student.mental_health_data.stress_level
            )}
            {renderAssessmentCard(
              "Depression Score",
              student.mental_health_data.depression_score
            )}
          </div>
        </div>

        {/* Support Programs */}
        <Card className="shadow-lg rounded-2xl">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Active Support Programs
          </h2>
          {loading ? (
            <Spin />
          ) : enrolledPrograms.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {enrolledPrograms.map((program) => (
                <Tag
                  key={program.programID}
                  className="bg-custom-green/10 text-custom-green px-3 py-1 rounded-full text-sm cursor-pointer hover:bg-custom-green/20 transition-colors"
                  onClick={() => handleProgramClick(program.programID)}
                >
                  {program.title}
                </Tag>
              ))}
            </div>
          ) : (
            <Empty
              description="No active support programs"
              image={Empty.PRESENTED_IMAGE_SIMPLE}
            />
          )}
        </Card>

        {/* Program Details Modal */}
        <Modal
          title={
            <div className="flex items-center gap-3 border-b pb-3">
              <div className="bg-custom-green/10 p-2 rounded-lg">
                <CalendarOutlined className="text-xl text-custom-green" />
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
          open={isModalVisible}
          onCancel={() => setIsModalVisible(false)}
          footer={null}
          width={600}
          centered
        >
          {loadingProgram ? (
            <div className="py-10">
              <Spin size="large" />
            </div>
          ) : selectedProgram ? (
            <div className="space-y-4 py-2">
              <h2 className="text-xl font-semibold">{selectedProgram.title}</h2>
              <p className="text-gray-600">{selectedProgram.description}</p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Program Date */}
                <div className="bg-gray-50 p-3 rounded-lg">
                  <div className="flex items-center">
                    <CalendarOutlined className="text-custom-green mr-2" />
                    <div>
                      <p className="text-gray-500 text-sm mb-0">Start Date</p>
                      <p className="font-medium">{selectedProgram.startDate}</p>
                    </div>
                  </div>
                </div>

                {/* Duration */}
                <div className="bg-gray-50 p-3 rounded-lg">
                  <div className="flex items-center">
                    <FieldTimeOutlined className="text-custom-green mr-2" />
                    <div>
                      <p className="text-gray-500 text-sm mb-0">Duration</p>
                      <p className="font-medium">
                        {selectedProgram.duration} weeks
                      </p>
                    </div>
                  </div>
                </div>

                {/* Type */}
                <div className="bg-gray-50 p-3 rounded-lg">
                  <div className="flex items-center">
                    <div>
                      <p className="text-gray-500 text-sm mb-0">Type</p>
                      <p className="font-medium">{selectedProgram.type}</p>
                    </div>
                  </div>
                </div>

                {/* Status */}
                <div className="bg-gray-50 p-3 rounded-lg">
                  <div className="flex items-center">
                    <div>
                      <p className="text-gray-500 text-sm mb-0">Status</p>
                      <Tag
                        color={
                          selectedProgram.status === "ACTIVE"
                            ? "green"
                            : "orange"
                        }
                      >
                        {selectedProgram.status}
                      </Tag>
                    </div>
                  </div>
                </div>
              </div>

              {/* Facilitator Info */}
              <div className="bg-gray-50 p-3 rounded-lg">
                <div className="flex items-center">
                  <TeamOutlined className="text-custom-green mr-2" />
                  <div>
                    <p className="text-gray-500 text-sm mb-0">Facilitator</p>
                    <p className="font-medium">
                      {selectedProgram.facilitatorName}
                    </p>
                    <p className="text-xs text-gray-500">
                      {selectedProgram.departmentName}
                    </p>
                  </div>
                </div>
              </div>

              {/* Online Meeting Link */}
              {selectedProgram.type === "ONLINE" &&
                selectedProgram.meetingLink && (
                  <div className="bg-blue-50 p-3 rounded-lg">
                    <p className="text-gray-500 text-sm mb-1">Meeting Link</p>
                    <div className="flex items-center gap-2">
                      <LinkOutlined className="text-custom-green" />
                      <a
                        href={selectedProgram.meetingLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-custom-green hover:text-custom-green/80"
                      >
                        Join Meeting
                      </a>
                    </div>
                  </div>
                )}

              {/* Tags */}
              {selectedProgram.tags && selectedProgram.tags.length > 0 && (
                <div className="pt-2">
                  <div className="flex flex-wrap gap-2">
                    {selectedProgram.tags.map((tag) => (
                      <Tag
                        key={tag}
                        className="bg-gray-50 border border-gray-200 text-sm"
                      >
                        {tag}
                      </Tag>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <Empty description="Program details not available" />
          )}
        </Modal>
      </div>
    </div>
  );
};

export default StudentProfile;

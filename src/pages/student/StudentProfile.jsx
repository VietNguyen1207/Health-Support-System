import React from "react";
import { Card, Progress } from "antd";
import studentData from "../../data/student-data.json";

const StudentProfile = () => {
  // For demo, using first student - in real app, you'd use student ID from auth/route
  const student = studentData.students[0];

  const getIndicatorColor = (score) => {
    if (score <= 3) return "#4a7c59"; // custom-green for good
    if (score <= 6) return "#fbbf24"; // yellow for moderate
    return "#ef4444"; // red for concerning
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
          <div className="flex flex-wrap gap-2">
            {student.support_programs.map((program, index) => (
              <span
                key={index}
                className="bg-custom-green/10 text-custom-green px-3 py-1 rounded-full text-sm"
              >
                {program}
              </span>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default StudentProfile;

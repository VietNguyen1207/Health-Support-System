import { useState, useEffect } from "react";
import studentData from "../data/student-data.json";

export default function Dashboard() {
  const [students, setStudents] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedGrade, setSelectedGrade] = useState("all");

  useEffect(() => {
    setStudents(studentData.students);
  }, []);

  const filteredStudents = students.filter((student) => {
    const matchesSearch = student.name
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesGrade =
      selectedGrade === "all" || student.grade === selectedGrade;
    return matchesSearch && matchesGrade;
  });

  const getAverageMetrics = () => {
    if (!filteredStudents.length) return null;

    const totals = filteredStudents.reduce(
      (acc, student) => ({
        anxiety: acc.anxiety + student.mental_health_data.anxiety_level,
        stress: acc.stress + student.mental_health_data.stress_level,
        depression:
          acc.depression + student.mental_health_data.depression_score,
        sleep: acc.sleep + student.mental_health_data.sleep_quality,
        attendance: acc.attendance + student.mental_health_data.attendance_rate,
      }),
      { anxiety: 0, stress: 0, depression: 0, sleep: 0, attendance: 0 }
    );

    const count = filteredStudents.length;
    return {
      averageAnxiety: (totals.anxiety / count).toFixed(1),
      averageStress: (totals.stress / count).toFixed(1),
      averageDepression: (totals.depression / count).toFixed(1),
      averageSleep: (totals.sleep / count).toFixed(1),
      averageAttendance: (totals.attendance / count).toFixed(1),
    };
  };

  const getIndicatorClass = (value) => {
    if (value <= 3) return "indicator-good";
    if (value <= 6) return "indicator-warning";
    return "indicator-danger";
  };

  const metrics = getAverageMetrics();

  return (
    <div className="main-wrapper general-wrapper">
      <div className="hero-section">
        <div className="hero-content">
          <h1 className="hero-title">Student Mental Health Dashboard</h1>
          <p className="hero-subtitle">Monitor and Support Student Wellness</p>
        </div>
      </div>

      <div className="page-content">
        <div className="dashboard-grid">
          {/* Controls Section */}
          <div className="dashboard-controls">
            <input
              type="text"
              placeholder="Search students..."
              className="search-input"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <select
              className="category-filter"
              value={selectedGrade}
              onChange={(e) => setSelectedGrade(e.target.value)}>
              <option value="all">All Grades</option>
              <option value="9th">9th Grade</option>
              <option value="10th">10th Grade</option>
              <option value="11th">11th Grade</option>
            </select>
          </div>

          {/* Metrics Section */}
          {metrics && (
            <div className="metrics-section">
              <h2>Class Averages</h2>
              <div className="metrics-grid">
                <div className="metric-card">
                  <h3>Anxiety Level</h3>
                  <p>{metrics.averageAnxiety}/10</p>
                </div>
                <div className="metric-card">
                  <h3>Stress Level</h3>
                  <p>{metrics.averageStress}/10</p>
                </div>
                <div className="metric-card">
                  <h3>Depression Score</h3>
                  <p>{metrics.averageDepression}/10</p>
                </div>
                <div className="metric-card">
                  <h3>Sleep Quality</h3>
                  <p>{metrics.averageSleep}/10</p>
                </div>
                <div className="metric-card">
                  <h3>Attendance Rate</h3>
                  <p>{metrics.averageAttendance}%</p>
                </div>
              </div>
            </div>
          )}

          {/* Students Section */}
          <div className="students-section">
            <h2>Student Overview</h2>
            <div className="student-list">
              {filteredStudents.map((student) => (
                <div key={student.id} className="student-card">
                  <h3>{student.name}</h3>
                  <p>
                    ID: {student.id} | Grade: {student.grade}
                  </p>
                  <div className="health-indicators">
                    <span
                      className={`health-indicator ${getIndicatorClass(
                        student.mental_health_data.anxiety_level
                      )}`}>
                      Anxiety: {student.mental_health_data.anxiety_level}/10
                    </span>
                    <span
                      className={`health-indicator ${getIndicatorClass(
                        student.mental_health_data.stress_level
                      )}`}>
                      Stress: {student.mental_health_data.stress_level}/10
                    </span>
                    <span
                      className={`health-indicator ${getIndicatorClass(
                        student.mental_health_data.depression_score
                      )}`}>
                      Depression: {student.mental_health_data.depression_score}
                      /10
                    </span>
                  </div>
                  <p>
                    <strong>Last Assessment:</strong>{" "}
                    {new Date(
                      student.mental_health_data.last_assessment
                    ).toLocaleDateString()}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

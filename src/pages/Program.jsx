import React from "react";
import { Card, Button, Tag, Space, Tooltip } from "antd";
import {
  CalendarOutlined,
  TeamOutlined,
  FieldTimeOutlined,
  ArrowRightOutlined,
} from "@ant-design/icons";

const Program = () => {
  // Mock data - replace with API call later
  const programs = [
    {
      id: 1,
      title: "Stress Management Workshop",
      description:
        "Learn effective techniques to manage academic stress and anxiety.",
      category: "Mental Health",
      startDate: "2024-04-01",
      duration: "6 weeks",
      capacity: 20,
      enrolled: 12,
      status: "Open",
      facilitator: "Dr. Sarah Johnson",
      tags: ["Stress", "Anxiety", "Self-Care"],
    },
    {
      id: 2,
      title: "Peer Support Group",
      description:
        "Weekly group sessions for students to share experiences and support each other.",
      category: "Support Group",
      startDate: "2024-04-15",
      duration: "8 weeks",
      capacity: 15,
      enrolled: 8,
      status: "Open",
      facilitator: "Dr. Michael Chen",
      tags: ["Peer Support", "Communication", "Social Skills"],
    },
    {
      id: 3,
      title: "Mindfulness and Meditation",
      description:
        "Introduction to mindfulness practices for better mental well-being.",
      category: "Wellness",
      startDate: "2024-04-10",
      duration: "4 weeks",
      capacity: 25,
      enrolled: 20,
      status: "Open",
      facilitator: "Ms. Emily Wong",
      tags: ["Mindfulness", "Meditation", "Relaxation"],
    },
    {
      id: 4,
      title: "Academic Performance Anxiety Group",
      description:
        "Learn strategies to cope with test anxiety and academic pressure.",
      category: "Academic Support",
      startDate: "2024-04-20",
      duration: "5 weeks",
      capacity: 18,
      enrolled: 15,
      status: "Open",
      facilitator: "Dr. James Wilson",
      tags: ["Test Anxiety", "Academic Stress", "Performance"],
    },
    {
      id: 5,
      title: "Social Skills Development",
      description:
        "Build confidence in social situations and improve interpersonal relationships.",
      category: "Social Skills",
      startDate: "2024-05-01",
      duration: "6 weeks",
      capacity: 12,
      enrolled: 6,
      status: "Open",
      facilitator: "Ms. Rachel Green",
      tags: ["Social Skills", "Communication", "Confidence"],
    },
    {
      id: 6,
      title: "Emotional Intelligence Workshop",
      description: "Develop better emotional awareness and management skills.",
      category: "Personal Development",
      startDate: "2024-05-05",
      duration: "4 weeks",
      capacity: 20,
      enrolled: 10,
      status: "Open",
      facilitator: "Dr. Lisa Thompson",
      tags: ["Emotional Intelligence", "Self-Awareness", "Relationships"],
    },
    {
      id: 7,
      title: "Resilience Building Program",
      description:
        "Strengthen your ability to bounce back from challenges and setbacks.",
      category: "Mental Health",
      startDate: "2024-05-10",
      duration: "7 weeks",
      capacity: 15,
      enrolled: 9,
      status: "Open",
      facilitator: "Dr. Robert Martinez",
      tags: ["Resilience", "Coping Skills", "Personal Growth"],
    },
    {
      id: 8,
      title: "Time Management Skills",
      description:
        "Master effective time management and organizational strategies.",
      category: "Academic Support",
      startDate: "2024-05-15",
      duration: "3 weeks",
      capacity: 25,
      enrolled: 18,
      status: "Open",
      facilitator: "Prof. David Brown",
      tags: ["Time Management", "Organization", "Productivity"],
    },
    {
      id: 9,
      title: "Healthy Relationships Workshop",
      description:
        "Learn about building and maintaining healthy relationships.",
      category: "Relationships",
      startDate: "2024-05-20",
      duration: "5 weeks",
      capacity: 16,
      enrolled: 7,
      status: "Open",
      facilitator: "Dr. Anna Lee",
      tags: ["Relationships", "Communication", "Boundaries"],
    },
    {
      id: 10,
      title: "Sleep Hygiene and Wellness",
      description: "Improve your sleep habits and overall well-being.",
      category: "Wellness",
      startDate: "2024-06-01",
      duration: "4 weeks",
      capacity: 20,
      enrolled: 11,
      status: "Open",
      facilitator: "Dr. Mark Stevens",
      tags: ["Sleep", "Wellness", "Health"],
    },
    {
      id: 11,
      title: "Grief and Loss Support Group",
      description:
        "Supportive environment for students dealing with loss and grief.",
      category: "Support Group",
      startDate: "2024-06-05",
      duration: "8 weeks",
      capacity: 12,
      enrolled: 5,
      status: "Open",
      facilitator: "Dr. Patricia Moore",
      tags: ["Grief", "Support", "Healing"],
    },
    {
      id: 12,
      title: "Cultural Adjustment Support",
      description:
        "Help international students adapt to new cultural environments.",
      category: "Cultural Support",
      startDate: "2024-06-10",
      duration: "6 weeks",
      capacity: 15,
      enrolled: 8,
      status: "Open",
      facilitator: "Ms. Sofia Rodriguez",
      tags: ["Cultural Adjustment", "International", "Support"],
    },
    {
      id: 13,
      title: "Body Image and Self-Esteem",
      description: "Build a healthy relationship with yourself and your body.",
      category: "Mental Health",
      startDate: "2024-06-15",
      duration: "7 weeks",
      capacity: 15,
      enrolled: 10,
      status: "Open",
      facilitator: "Dr. Emma Watson",
      tags: ["Self-Esteem", "Body Image", "Mental Health"],
    },
    {
      id: 14,
      title: "Mindful Leadership",
      description:
        "Develop leadership skills with a focus on mindfulness and emotional intelligence.",
      category: "Leadership",
      startDate: "2024-06-20",
      duration: "5 weeks",
      capacity: 20,
      enrolled: 13,
      status: "Open",
      facilitator: "Prof. John Anderson",
      tags: ["Leadership", "Mindfulness", "Personal Development"],
    },
    {
      id: 15,
      title: "Digital Wellness Workshop",
      description: "Learn to maintain mental health in the digital age.",
      category: "Digital Wellness",
      startDate: "2024-07-01",
      duration: "4 weeks",
      capacity: 25,
      enrolled: 15,
      status: "Open",
      facilitator: "Dr. Tech Smith",
      tags: ["Digital Wellness", "Screen Time", "Mental Health"],
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white pt-24 pb-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Available Programs
          </h1>
          <p className="text-gray-600">
            Join our mental health and wellness programs designed to support
            your well-being
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {programs.map((program) => (
            <Card
              key={program.id}
              className="shadow-md hover transition-shadow duration-300"
              actions={[
                <Tooltip title="">
                  <Button
                    type="primary"
                    className="bg-custom-green hover:bg-custom-green/90 w-[90%] flex items-center justify-center gap-2 mx-auto group"
                    icon={
                      <ArrowRightOutlined className="group-hover:translate-x-1 transition-transform duration-300" />
                    }
                  >
                    <span>Join Program</span>
                  </Button>
                </Tooltip>,
              ]}
            >
              <div className="mb-4">
                <h2 className="text-xl font-semibold text-gray-900 mb-2">
                  {program.title}
                </h2>
                <p className="text-gray-600 mb-4">{program.description}</p>

                <Space className="mb-4" wrap>
                  {program.tags.map((tag) => (
                    <Tag
                      key={tag}
                      className="bg-custom-green/10 text-custom-green border-custom-green"
                    >
                      {tag}
                    </Tag>
                  ))}
                </Space>

                <div className="space-y-2 text-sm text-gray-500">
                  <div className="flex items-center gap-2">
                    <CalendarOutlined className="text-custom-green" />
                    <span>
                      Starts: {new Date(program.startDate).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <FieldTimeOutlined className="text-custom-green" />
                    <span>Duration: {program.duration}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <TeamOutlined className="text-custom-green" />
                    <span>
                      Capacity: {program.enrolled}/{program.capacity} enrolled
                    </span>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-gray-100">
                  <p className="text-sm text-gray-600">
                    Facilitator: {program.facilitator}
                  </p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Program;

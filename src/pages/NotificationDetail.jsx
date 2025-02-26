import { useCallback, useEffect, useState } from "react";
import {
  Layout,
  Card,
  List,
  // Button,
  Typography,
  Badge,
  Tabs,
  Empty,
  Spin,
  Avatar,
  Tag,
  Skeleton,
  Progress,
  Button,
  Space,
} from "antd";
import {
  BellOutlined,
  CheckCircleOutlined,
  CalendarOutlined,
  FormOutlined,
  // FileTextOutlined,
  // MessageOutlined,
  RightOutlined,
  UserOutlined,
  BarChartOutlined,
  TeamOutlined,
  FieldTimeOutlined,
  LinkOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { useNotificationStore } from "../stores/notificationStore";
import { useAuthStore } from "../stores/authStore";
import { useAppointmentStore } from "../stores/appointmentStore";
import PropTypes from "prop-types";
import { useProgramStore } from "../stores/programStore";
import { useParams, useNavigate } from "react-router-dom";

const { Content } = Layout;
const { Text } = Typography;

// Extend dayjs with relative time plugin
dayjs.extend(relativeTime);

const NotificationDetail = () => {
  const [activeTabKey, setActiveTabKey] = useState("all");
  const {
    notifications,
    getNotifications,
    getUnreadNotifications,
    markNotificationAsRead,
  } = useNotificationStore();
  const { user } = useAuthStore();
  const { id } = useParams();
  const navigate = useNavigate();

  const [selectedNotification, setSelectedNotification] = useState(
    notifications[0]
  );
  const [detailContent, setDetailContent] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [notificationList, setNotificationList] = useState([]);
  const [loading, setLoading] = useState(true);
  const { GetDetails } = useAppointmentStore();
  const { fetchProgramDetails } = useProgramStore();

  const getAppointment = useCallback(
    async (id) => {
      try {
        const data = await GetDetails(id);

        setDetailContent(data);
      } catch (error) {
        console.log(error);
      }
    },
    [selectedNotification?.type === "APPOINTMENT"]
  );

  const getProgram = useCallback(
    async (id) => {
      try {
        const data = await fetchProgramDetails(id);

        setDetailContent(data);
      } catch (error) {
        console.log(error);
      }
    },
    [selectedNotification?.type === "PROGRAM"]
  );

  useEffect(() => {
    const findNotification =
      Array.isArray(notifications) &&
      notifications.find((noti) => noti.id === id);
    setSelectedNotification(findNotification);
  }, [id, notifications]);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      if (activeTabKey === "unread") {
        await getUnreadNotifications(user.userId);
      } else {
        await getNotifications(user.userId);
      }

      if (
        Array.isArray(notifications) &&
        notifications.length > 0 &&
        !selectedNotification
      ) {
        setSelectedNotification(notifications[0]);
      }
    } catch (error) {
      console.error("Error fetching notifications:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, [activeTabKey]);

  useEffect(() => {
    // Update notification list when notifications change
    if (Array.isArray(notifications)) {
      setNotificationList(
        activeTabKey === "unread"
          ? notifications.filter((noti) => !noti.isRead)
          : notifications
      );
    }

    renderDetailContent();
  }, [notifications, activeTabKey]);

  const NotificationSkeleton = () => (
    <List.Item className="px-4 py-3 border-b">
      <Skeleton active avatar paragraph={{ rows: 2 }} className="w-full" />
    </List.Item>
  );

  // const loadDetailContent = async (type, id) => {
  //   if (!type || !id) return;

  //   setDetailLoading(true);
  //   try {
  //     let data;
  //     switch (type) {
  //       case "appointment":
  //         // Giả lập dữ liệu nếu chưa có API
  //         data = {
  //           title: "Appointment Details",
  //           status: "Scheduled",
  //           date: new Date().toISOString(),
  //           // thêm thông tin khác tùy loại notification
  //         };
  //         break;
  //       case "survey":
  //         data = {
  //           title: "Survey Details",
  //           status: "Pending",
  //           // thêm thông tin khác
  //         };
  //         break;
  //       default:
  //         data = {
  //           title: `${type.charAt(0).toUpperCase() + type.slice(1)} Details`,
  //           message: "No additional details available",
  //         };
  //         break;
  //     }
  //     setDetailContent(data);
  //   } catch (error) {
  //     console.error(`Error loading ${type} details:`, error);
  //   } finally {
  //     setDetailLoading(false);
  //   }
  // };

  const handleNotificationSelect = async (notification) => {
    setSelectedNotification(notification);
    setDetailLoading(true);

    if (!notification.isRead) {
      await markNotificationAsRead(notification.id);
      fetchNotifications();
    }

    try {
      if (notification.type && notification.idtype) {
        switch (notification.type.toLowerCase()) {
          case "appointment":
            await getAppointment(notification.idtype);
            break;
          case "program":
            await getProgram(notification.idtype);
            break;
          default:
            // Handle other notification types or set default content
            setDetailContent({
              title: `${notification.type} Details`,
              message: "No additional details available",
            });
        }
      }
    } catch (error) {
      console.error("Error loading details:", error);
    } finally {
      setDetailLoading(false);
    }
  };

  const handleTabChange = (key) => {
    setActiveTabKey(key);
    setSelectedNotification(null);
    setDetailContent(null);
  };

  const getNotificationIcon = (type) => {
    const lowerType = type.toLowerCase();
    switch (lowerType) {
      case "appointment":
        return <CalendarOutlined style={{ color: "#1890ff" }} />;
      case "survey":
        return <FormOutlined style={{ color: "#52c41a" }} />;
      default:
        return <BellOutlined style={{ color: "#faad14" }} />;
    }
  };

  const getActionButton = (notification, data) => {
    const lowerType = notification?.type?.toLowerCase();
    switch (lowerType) {
      case "appointment":
        return data.status ? (
          <Button
            type="primary"
            onClick={() => navigate(`/appointment-record`)}>
            View Appointment
          </Button>
        ) : (
          <Button type="primary" onClick={() => navigate(`/calendar`)}>
            View Calendar
          </Button>
        );
      case "survey":
        return (
          <Button type="primary" onClick={() => navigate("/survey")}>
            Go to Survey
          </Button>
        );
      case "program":
        return (
          <Button type="primary" onClick={() => navigate("/test")}>
            Go to Survey
          </Button>
        );
      default:
        return null;
    }
  };

  const renderDetailContent = () => {
    if (!selectedNotification) {
      return (
        <Empty
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description="Select a notification to view details"
        />
      );
    }

    if (detailLoading) {
      return (
        <div className="flex justify-center items-center h-[calc(100vh-280px)]">
          <Spin size="large" />
        </div>
      );
    }

    if (!detailContent) {
      return (
        <Empty
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description="No details available for this notification"
        />
      );
    }

    switch (selectedNotification?.type?.toLowerCase()) {
      case "appointment":
        return (
          <>
            {getActionButton(selectedNotification, detailContent)}
            <AppointmentDetail appointment={detailContent} user={user} />
          </>
        );
      case "program":
        return (
          <>
            <ProgramDetail program={detailContent} user={user} />
            {getActionButton(detailContent)}
          </>
        );
      default:
        return (
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description={`No detail view available for ${selectedNotification.type} notifications`}
          />
        );
    }
  };

  return (
    <Layout className="bg-white general-wrapper min-h-screen">
      <Content className="py-8 px-4 sm:px-6 lg:px-8">
        <Card
          title={
            <div className="flex items-center">
              <BellOutlined className="text-blue-500 mr-2" />
              <span>Notification Center</span>
            </div>
          }
          className="shadow-md"
          styles={{ body: { padding: 0 } }}>
          <div className="flex flex-col md:flex-row">
            {/* Left side - Notification List */}
            <div className="w-full md:w-1/3 border-r">
              <Tabs
                activeKey={activeTabKey}
                onChange={handleTabChange}
                items={[
                  {
                    key: "all",
                    label: "All Notifications",
                  },
                  {
                    key: "unread",
                    label: (
                      <Badge
                        count={
                          Array.isArray(notifications)
                            ? notifications.filter((n) => !n.isRead).length
                            : 0
                        }
                        size="small">
                        Unread
                      </Badge>
                    ),
                  },
                ]}
                className="px-4 pt-2"
              />
              <div className="h-[calc(100vh-200px)] overflow-y-auto">
                {loading ? (
                  <div>
                    {[1, 2, 3].map((item) => (
                      <NotificationSkeleton key={item} />
                    ))}
                  </div>
                ) : notificationList.length > 0 ? (
                  <List
                    dataSource={notificationList}
                    renderItem={(item) => (
                      <List.Item
                        className={`cursor-pointer hover:bg-gray-50 transition-colors px-4 py-3 border-b ${
                          selectedNotification?.id === item.id
                            ? "bg-blue-100 hover:bg-blue-100"
                            : ""
                        } ${!item.isRead ? "bg-blue-50" : ""}`}
                        onClick={() => handleNotificationSelect(item)}>
                        <List.Item.Meta
                          className="px-5"
                          avatar={
                            <Badge dot={!item.isRead} offset={[-2, 1]}>
                              <Avatar
                                className="bg-gray-100"
                                icon={getNotificationIcon(item.type)}
                              />
                            </Badge>
                          }
                          title={
                            <div className="flex justify-between items-center">
                              <Text strong>{item.title}</Text>
                              {item.isRead && (
                                <CheckCircleOutlined className="text-green-500" />
                              )}
                            </div>
                          }
                          description={
                            <div>
                              <Text
                                ellipsis
                                className="text-gray-600 mb-1 block">
                                {item.message}
                              </Text>
                              <div className="flex justify-between items-center mt-1">
                                <Tag
                                  color={
                                    item.type.toLowerCase() === "appointment"
                                      ? "blue"
                                      : item.type.toLowerCase() === "survey"
                                      ? "green"
                                      : "orange"
                                  }>
                                  {item.type}
                                </Tag>
                                <Text type="secondary" className="text-xs">
                                  {dayjs(item.createdAt).fromNow()}
                                </Text>
                              </div>
                            </div>
                          }
                        />
                        <RightOutlined className="text-gray-300" />
                      </List.Item>
                    )}
                  />
                ) : (
                  <Empty
                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                    description="No notifications found"
                    className="py-12"
                  />
                )}
              </div>
            </div>

            {/* Right side - Notification Detail */}
            <div className="w-full md:w-2/3 p-6">{renderDetailContent()}</div>
          </div>
        </Card>
      </Content>
    </Layout>
  );
};

const AppointmentDetail = ({ appointment, user }) => {
  // Determine if appointment is in progress
  const isInProgress = appointment.status === "IN_PROGRESS";
  const calculatePercentage = (score) => (score / 10) * 100;
  const scores = [
    {
      title: "Anxiety Level",
      score: appointment.studentResponse.depressionScore,
    },
    {
      title: "Stress Level",
      score: appointment.studentResponse.stressScore,
    },
    {
      title: "Anxiety Level",
      score: appointment.studentResponse.anxietyScore,
    },
  ];

  const getScoreColor = (score) => {
    if (score <= 3) return "#4a7c59";
    if (score <= 6) return "#fbbf24";
    return "#ef4444";
  };

  return (
    <div className="space-y-4 max-h-[69vh] overflow-auto pr-5">
      {/* Status and Action Section */}
      <div className="flex items-center justify-between mb-4 bg-white p-4 rounded-lg shadow-sm">
        <div>
          <h2 className="text-xl font-bold mb-2">Appointment Details</h2>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500">Status:</span>
            <Tag
              color={
                isInProgress
                  ? "processing"
                  : appointment.status === "COMPLETED"
                  ? "success"
                  : appointment.status === "CANCELLED"
                  ? "volcano"
                  : "default"
              }>
              {isInProgress
                ? "In Progress"
                : appointment.status === "COMPLETED"
                ? "Completed"
                : appointment.status === "CANCELLED"
                ? "Cancelled"
                : "Scheduled"}
            </Tag>
          </div>
        </div>
      </div>

      {/* Psychologist and Student Information Cards */}
      <div className="grid grid-flow-col gap-4">
        {user.role !== "psychologist" && (
          <Card
            title={
              <div className="flex items-center gap-2">
                <UserOutlined className="text-primary-green text-lg" />
                <span className="font-semibold">Psychologist Information</span>
              </div>
            }
            className="bg-white shadow-sm hover:shadow-md transition-shadow duration-200 h-full">
            <div className="space-y-3">
              <div className="flex items-center gap-2 p-2 bg-gray-50 rounded-md">
                <div className="w-28 text-gray-500">Name</div>
                <div className="font-medium">
                  {appointment.psychologistResponse.info.fullName}
                </div>
              </div>

              <div className="flex items-center gap-2 p-2 bg-gray-50 rounded-md">
                <div className="w-28 text-gray-500">Department</div>
                <div className="font-medium">
                  {appointment.psychologistResponse.departmentName}
                </div>
              </div>

              <div className="flex items-center gap-2 p-2 bg-gray-50 rounded-md">
                <div className="w-28 text-gray-500">Experience</div>
                <div className="font-medium">
                  {appointment.psychologistResponse.yearsOfExperience} years
                </div>
              </div>
            </div>
          </Card>
        )}

        {user.role !== "student" && (
          <Card
            title={
              <div className="flex items-center gap-2">
                <TeamOutlined className="text-primary-green text-lg" />
                <span className="font-semibold">Student Information</span>
              </div>
            }
            className="bg-white shadow-sm hover:shadow-md transition-shadow duration-200 h-full">
            <div className="space-y-3">
              <div className="flex items-center gap-2 p-2 bg-gray-50 rounded-md">
                <div className="w-28 text-gray-500">Name</div>
                <div className="font-medium">
                  {appointment.studentResponse.info.fullName}
                </div>
              </div>

              <div className="flex items-center gap-2 p-2 bg-gray-50 rounded-md">
                <div className="w-28 text-gray-500">Grade</div>
                <div className="font-medium">
                  {appointment.studentResponse.grade}
                </div>
              </div>

              <div className="flex items-center gap-2 p-2 bg-gray-50 rounded-md">
                <div className="w-28 text-gray-500">School</div>
                <div className="font-medium">
                  {appointment.studentResponse.schoolName}
                </div>
              </div>
            </div>
          </Card>
        )}
      </div>

      {/* Scores Card */}
      <Card
        title={
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BarChartOutlined className="text-primary-green text-lg" />
              <span>Assessment Scores</span>
            </div>
          </div>
        }
        className="bg-white shadow-sm hover:shadow-md transition-shadow duration-200 h-full">
        <div className="grid grid-cols-3 gap-4">
          {scores.map((score, index) => (
            <div key={index} className="flex flex-col items-center gap-2">
              <h3 className="text-base font-medium text-gray-700">
                {score.title}
              </h3>
              <Progress
                type="circle"
                percent={calculatePercentage(score.score)}
                strokeColor={getScoreColor(score.score)}
                strokeWidth={10}
                width={120}
                format={(percent) => (
                  <span className="text-lg font-medium">
                    {Math.round(percent)}%
                  </span>
                )}
              />
            </div>
          ))}
        </div>
      </Card>

      {/* Session Notes - Only visible when checked in */}
      {/* {user.role === "psychologist" && isInProgress && (
        <Card
          title="Session Notes"
          className="bg-white"
          extra={
            <Tag color="processing" className="mr-0">
              Current Session
            </Tag>
          }></Card>
      )} */}
    </div>
  );
};

const ProgramDetail = ({ program, user }) => {
  return (
    <div className="space-y-4 w-full overflow-auto h-full">
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
            {program?.numberParticipants} participants
          </p>
        </div>

        <div className="bg-gray-50 p-3 rounded-lg">
          <div className="flex items-center gap-2 mb-1">
            <i className="text-primary-green" />
            <p className="text-gray-500 text-sm">Type</p>
          </div>
          <Tag
            color={program.type === "Online" ? "blue" : "green"}
            className="mt-1">
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
              className="p-0 h-auto text-primary-green hover:text-primary-green/80">
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
                className="bg-gray-50 border border-gray-200 text-sm">
                {tag}
              </Tag>
            ))}
          </Space>
        </div>
      )}
    </div>
  );
};

ProgramDetail.propTypes = {
  user: PropTypes.object.isRequired,
  program: PropTypes.shape({
    programID: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    description: PropTypes.string.isRequired,
    startDate: PropTypes.string.isRequired,
    duration: PropTypes.number.isRequired,
    status: PropTypes.string.isRequired,
    facilitatorName: PropTypes.string.isRequired,
    departmentName: PropTypes.string.isRequired,
    numberParticipants: PropTypes.string,
    tags: PropTypes.arrayOf(PropTypes.string).isRequired,
    type: PropTypes.string.isRequired,
    meetingLink: PropTypes.string.isRequired,
  }).isRequired,
};

AppointmentDetail.propTypes = {
  user: PropTypes.object.isRequired,
  appointment: PropTypes.shape({
    appointmentID: PropTypes.string.isRequired,
    timeSlotID: PropTypes.string.isRequired,
    studentResponse: PropTypes.shape({
      studentId: PropTypes.string.isRequired,
      grade: PropTypes.number.isRequired,
      className: PropTypes.string.isRequired,
      schoolName: PropTypes.string.isRequired,
      depressionScore: PropTypes.number.isRequired,
      anxietyScore: PropTypes.number.isRequired,
      stressScore: PropTypes.number.isRequired,
      info: PropTypes.shape({
        userId: PropTypes.string.isRequired,
        fullName: PropTypes.string.isRequired,
        email: PropTypes.string.isRequired,
        phoneNumber: PropTypes.string.isRequired,
        address: PropTypes.string.isRequired,
        gender: PropTypes.string.isRequired,
        role: PropTypes.string.isRequired,
      }).isRequired,
    }).isRequired,
    psychologistResponse: PropTypes.shape({
      psychologistId: PropTypes.string.isRequired,
      departmentName: PropTypes.string.isRequired,
      yearsOfExperience: PropTypes.number.isRequired,
      status: PropTypes.string.isRequired,
      info: PropTypes.shape({
        userId: PropTypes.string.isRequired,
        fullName: PropTypes.string.isRequired,
        email: PropTypes.string.isRequired,
        phoneNumber: PropTypes.string.isRequired,
        address: PropTypes.string.isRequired,
        gender: PropTypes.string.isRequired,
        role: PropTypes.string.isRequired,
      }).isRequired,
    }).isRequired,
    status: PropTypes.oneOf(["SCHEDULED", "IN_PROGRESS", "COMPLETED"])
      .isRequired,
    createdAt: PropTypes.string.isRequired,
    updatedAt: PropTypes.string.isRequired,
  }).isRequired,
};

export default NotificationDetail;

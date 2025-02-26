import { useEffect, useState } from "react";
import {
  Layout,
  Card,
  List,
  Button,
  Typography,
  Badge,
  Tabs,
  Empty,
  Spin,
  Divider,
  Avatar,
  Tag,
  Space,
  Skeleton,
} from "antd";
import {
  BellOutlined,
  CheckCircleOutlined,
  CalendarOutlined,
  FormOutlined,
  FileTextOutlined,
  MessageOutlined,
  RightOutlined,
  ClockCircleOutlined,
  UserOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { useNotificationStore } from "../stores/notificationStore";
import { useAuthStore } from "../stores/authStore";
import { useNavigate, useParams } from "react-router-dom";

const { Content } = Layout;
const { Title, Text, Paragraph } = Typography;

// Extend dayjs with relative time plugin
dayjs.extend(relativeTime);

const NotificationDetail = () => {
  const [selectedNotification, setSelectedNotification] = useState(null);
  const [activeTabKey, setActiveTabKey] = useState("all");
  const {
    notifications,
    loading,
    getNotifications,
    getUnreadNotifications,
    markNotificationAsRead,
  } = useNotificationStore();
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const { id } = useParams();

  // Add state for detail content
  const [detailContent, setDetailContent] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);

  useEffect(() => {
    const findNotification =
      Array(notifications).isArray &&
      Array(notifications).find((noti) => noti.id === id);
    setSelectedNotification(findNotification);
  }, [id]);

  const fetchNotifications = async () => {
    if (activeTabKey === "unread") {
      await getUnreadNotifications(user.userId);
    } else {
      await getNotifications(user.userId);
    }

    if (
      !id &&
      Array.isArray(notifications) &&
      notifications.length > 0 &&
      !selectedNotification
    ) {
      setSelectedNotification(notifications[0]);
    }
  };

  const loadDetailContent = async (type, id) => {
    if (!type || !id) return;

    setDetailLoading(true);
    try {
      let data;
      switch (type) {
        case "appointment":
          // Giả lập dữ liệu nếu chưa có API
          data = {
            title: "Appointment Details",
            status: "Scheduled",
            date: new Date().toISOString(),
            // thêm thông tin khác tùy loại notification
          };
          break;
        case "survey":
          data = {
            title: "Survey Details",
            status: "Pending",
            // thêm thông tin khác
          };
          break;
        default:
          data = {
            title: `${type.charAt(0).toUpperCase() + type.slice(1)} Details`,
            message: "No additional details available",
          };
          break;
      }
      setDetailContent(data);
    } catch (error) {
      console.error(`Error loading ${type} details:`, error);
    } finally {
      setDetailLoading(false);
    }
  };

  const handleNotificationSelect = async (notification) => {
    setSelectedNotification(notification);

    navigate(`/notifications/${notification.id}`, { replace: true });

    if (!notification.isRead) {
      await markNotificationAsRead(notification.id);
      fetchNotifications();
    }

    if (notification.type && notification.idtype) {
      loadDetailContent(notification.type.toLowerCase(), notification.idtype);
    }
  };

  const handleTabChange = (key) => {
    setActiveTabKey(key);
    setSelectedNotification(null);
  };

  const getNotificationIcon = (type) => {
    const lowerType = type.toLowerCase();
    switch (lowerType) {
      case "appointment":
        return <CalendarOutlined style={{ color: "#1890ff" }} />;
      case "survey":
        return <FormOutlined style={{ color: "#52c41a" }} />;
      case "message":
        return <MessageOutlined style={{ color: "#722ed1" }} />;
      case "report":
        return <FileTextOutlined style={{ color: "#fa8c16" }} />;
      default:
        return <BellOutlined style={{ color: "#faad14" }} />;
    }
  };

  const getActionButton = (notification) => {
    const lowerType = notification?.type?.toLowerCase();
    switch (lowerType) {
      case "appointment":
        return (
          <Button
            type="primary"
            onClick={() => navigate(`/appointment/${notification.idtype}`)}>
            View Appointment
          </Button>
        );
      case "survey":
        return (
          <Button type="primary" onClick={() => navigate("/survey")}>
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

    return (
      <div className="notification-detail-content">
        <div className="flex items-center mb-4">
          <Avatar
            size={48}
            icon={getNotificationIcon(selectedNotification.type)}
            className="mr-4"
          />
          <div>
            <Title level={4} className="mb-1">
              {selectedNotification.title}
            </Title>
            <div>
              <Tag color={selectedNotification.isRead ? "default" : "blue"}>
                {selectedNotification.isRead ? "Read" : "Unread"}
              </Tag>
              <Text type="secondary" className="ml-2">
                {dayjs(selectedNotification.createdAt).format(
                  "MMM D, YYYY [at] h:mm A"
                )}
              </Text>
            </div>
          </div>
        </div>

        <Divider />

        <Space direction="vertical" size="large" className="w-full">
          <Card className="border shadow-sm">
            <Paragraph className="text-base">
              {selectedNotification.message}
            </Paragraph>
          </Card>

          <div>
            <Space direction="vertical" size="middle" className="w-full">
              <div className="flex justify-between items-center">
                <div className="flex items-center">
                  <ClockCircleOutlined className="mr-2 text-gray-500" />
                  <Text type="secondary">
                    {dayjs(selectedNotification.createdAt).fromNow()}
                  </Text>
                </div>
                <div className="flex items-center">
                  <UserOutlined className="mr-2 text-gray-500" />
                  <Text type="secondary">
                    ID: {selectedNotification.userID}
                  </Text>
                </div>
              </div>

              {selectedNotification.idtype && (
                <div className="flex items-center">
                  <Text type="secondary">
                    Reference ID: {selectedNotification.idtype}
                  </Text>
                </div>
              )}
            </Space>
          </div>

          {getActionButton(selectedNotification) && (
            <div className="mt-4">{getActionButton(selectedNotification)}</div>
          )}
        </Space>
      </div>
    );
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
              <div className="h-[calc(100vh-280px)] overflow-y-auto">
                {/* {loading ? (
                  <div className="p-4">
                    {[1, 2, 3].map((item) => (
                      <Card key={item} className="mb-3 shadow-sm">
                        <Skeleton active avatar paragraph={{ rows: 2 }} />
                      </Card>
                    ))}
                  </div>
                ) :  ( */}
                {Array.isArray(notifications) && notifications.length > 0 ? (
                  <List
                    dataSource={notifications}
                    renderItem={(item) => (
                      <List.Item
                        className={`cursor-pointer hover:bg-gray-50 transition-colors px-4 py-3 border-b ${
                          selectedNotification?.id === item.id
                            ? "bg-blue-50"
                            : ""
                        } ${!item.isRead ? "bg-blue-50" : ""}`}
                        onClick={() => handleNotificationSelect(item)}>
                        <List.Item.Meta
                          avatar={
                            <Badge dot={!item.isRead} offset={[-2, 1]}>
                              <Avatar icon={getNotificationIcon(item.type)} />
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
            <div className="w-full md:w-2/3 p-6">
              {loading ? (
                <div className="flex justify-center items-center h-[calc(100vh-280px)]">
                  <Spin size="large" />
                </div>
              ) : (
                renderDetailContent()
              )}
            </div>
          </div>
        </Card>
      </Content>
    </Layout>
  );
};

export default NotificationDetail;

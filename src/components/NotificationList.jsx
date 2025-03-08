import { useCallback, useState, useEffect } from "react";
import { useNotificationStore } from "../stores/notificationStore";
import { BellOutlined, CheckOutlined, ReloadOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { Empty, Skeleton, Button, Tooltip, Badge } from "antd";
import { useAuthStore } from "../stores/authStore";
import { useNavigate } from "react-router-dom";
import PropTypes from "prop-types";

dayjs.extend(relativeTime);

const NotificationSkeleton = () => (
  <div className="p-3 border-b">
    <div className="flex items-start gap-3">
      <div className="flex-1">
        <Skeleton.Input active size="small" className="w-1/3 mb-2" />
        <Skeleton.Input active size="small" className="w-2/3 mb-2" block />
        <div className="flex gap-2">
          <Skeleton.Button active size="small" className="w-16" />
          <Skeleton.Input active size="small" className="w-24" />
        </div>
      </div>
    </div>
  </div>
);

const NotificationList = ({ onClose }) => {
  const [activeFilter, setActiveFilter] = useState("all");
  const {
    notifications,
    loading,
    error,
    getNotifications,
    markNotificationAsRead,
  } = useNotificationStore();
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [displayedNotifications, setDisplayedNotifications] = useState([]);

  // Fetch notifications when component mounts
  useEffect(() => {
    if (user?.userId) {
      fetchData();
    }
  }, [user?.userId]);

  // Update displayed notifications when notifications or filter changes
  useEffect(() => {
    handleFilter(activeFilter === "unread");
  }, [notifications, activeFilter]);

  const fetchData = async () => {
    if (!user?.userId) return;

    try {
      await getNotifications(user.userId);
    } catch (error) {
      console.error("Error fetching notifications:", error);
    }
  };

  const handleFilter = useCallback(
    (unreadOnly = false) => {
      setActiveFilter(unreadOnly ? "unread" : "all");

      if (unreadOnly) {
        const unread = notifications.filter((noti) => !noti.isRead);
        setDisplayedNotifications(unread);
      } else {
        setDisplayedNotifications(notifications);
      }
    },
    [notifications]
  );

  const handleNotificationClick = async (notification) => {
    if (!notification.isRead && user?.userId) {
      try {
        await markNotificationAsRead(notification.id, user.userId);
      } catch (error) {
        console.error("Error marking notification as read:", error);
      }
    }

    onClose();

    // Navigate based on notification type
    if (notification.type === "PROGRAM" && notification.idtype) {
      navigate(`/program-details/${notification.idtype}`);
    } else if (notification.type === "APPOINTMENT" && notification.idtype) {
      navigate(`/appointment-record?id=${notification.idtype}`);
    } else if (notification.type === "SURVEY" && notification.idtype) {
      navigate(`/test-result/${notification.idtype}`);
    } else {
      // Default fallback
      navigate(`/notifications/${notification.id}`);
    }
  };

  const getTypeColor = (type) => {
    switch (type) {
      case "PROGRAM":
        return "bg-green-100 text-green-700";
      case "APPOINTMENT":
        return "bg-blue-100 text-blue-700";
      case "SURVEY":
        return "bg-purple-100 text-purple-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <div className="flex flex-col text-xs text-black rounded-lg bg-white border-[1px] shadow-sm min-w-[320px]">
      {/* Header */}
      <div className="flex items-center justify-between border-b p-3">
        <h1 className="text-lg font-semibold flex items-center gap-2">
          <BellOutlined className="text-blue-600" />
          Notifications
          {unreadCount > 0 && <Badge count={unreadCount} size="small" />}
        </h1>
        <div className="flex gap-2 items-center">
          <Tooltip title="Refresh">
            <Button
              type="text"
              icon={<ReloadOutlined spin={loading} />}
              onClick={fetchData}
              loading={loading}
              size="small"
            />
          </Tooltip>
        </div>
      </div>

      {/* Filters */}
      <div className="px-3 py-2 flex gap-2 border-b">
        <button
          className={`px-3 py-1.5 rounded-full font-medium text-xs transition-colors ${
            activeFilter === "all"
              ? "bg-blue-50 text-blue-600 hover:bg-blue-100"
              : "text-gray-600 hover:bg-gray-100"
          }`}
          onClick={() => handleFilter(false)}
        >
          All
        </button>
        <button
          className={`px-3 py-1.5 rounded-full font-medium text-xs transition-colors ${
            activeFilter === "unread"
              ? "bg-blue-50 text-blue-600 hover:bg-blue-100"
              : "text-gray-600 hover:bg-gray-100"
          }`}
          onClick={() => handleFilter(true)}
        >
          Unread
          {unreadCount > 0 && (
            <span className="ml-1 px-1.5 py-0.5 bg-blue-600 text-white text-xs rounded-full">
              {unreadCount}
            </span>
          )}
        </button>
      </div>

      {/* Notification List */}
      <div className="max-h-[400px] overflow-y-auto">
        {loading ? (
          // Loading state
          <>
            <NotificationSkeleton />
            <NotificationSkeleton />
            <NotificationSkeleton />
          </>
        ) : error ? (
          <div className="py-8 text-center">
            <p className="text-red-500 mb-2">{error}</p>
            <Button type="primary" onClick={fetchData} size="small">
              Try again
            </Button>
          </div>
        ) : displayedNotifications?.length > 0 ? (
          displayedNotifications.map((notification) => (
            <div
              key={notification.id}
              className={`p-3 border-b hover:bg-gray-50 cursor-pointer transition-colors ${
                !notification.isRead ? "bg-blue-50" : ""
              }`}
              onClick={() => handleNotificationClick(notification)}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-sm">
                      {notification.title}
                    </span>
                    {notification.isRead && (
                      <CheckOutlined className="text-green-600 text-xs" />
                    )}
                  </div>
                  <p className="text-gray-600 mt-1">{notification.message}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full ${getTypeColor(
                        notification.type
                      )}`}
                    >
                      {notification.type}
                    </span>
                    <span className="text-gray-500 text-xs">
                      {dayjs(notification.createdAt).fromNow()}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="py-8">
            <Empty
              description={`No ${
                activeFilter === "unread" ? "unread " : ""
              }notifications`}
            />
          </div>
        )}
      </div>

      {/* View All Link */}
      {displayedNotifications.length > 0 && (
        <div className="p-3 text-center border-t">
          <Button
            type="link"
            onClick={() => navigate("/notifications")}
            className="text-blue-600 hover:text-blue-800"
          >
            View All Notifications
          </Button>
        </div>
      )}
    </div>
  );
};

NotificationList.propTypes = {
  onClose: PropTypes.func.isRequired,
};

export default NotificationList;

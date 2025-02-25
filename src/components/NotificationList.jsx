import { useEffect } from "react";
import { useNotificationStore } from "../stores/notificationStore";
import { useUserStore } from "../stores/userStore";
import { BellOutlined, CheckOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { Empty, Skeleton } from "antd";

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

const NotificationList = () => {
  const {
    notifications,
    loading,
    error,
    getNotifications,
    markNotificationAsRead,
  } = useNotificationStore();
  const { user } = useUserStore();

  const fetchData = async () => {
    try {
      await getNotifications(user.userId);
    } catch (error) {
      console.error("Error fetching notifications:", error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleMarkAllAsRead = async () => {
    try {
      await markNotificationAsRead(user.userId);
    } catch (error) {
      console.error("Error marking all notifications as read:", error);
    }
  };

  return (
    <div className="flex flex-col text-xs text-black rounded-lg bg-white border-[1px] shadow-sm min-w-[320px]">
      {/* Header */}
      <div className="flex items-center justify-between border-b p-3">
        <h1 className="text-lg font-semibold flex items-center gap-2">
          <BellOutlined className="text-blue-600" />
          Notifications
        </h1>
        <div className="text-xs text-gray-500 hover:text-blue-600 cursor-pointer">
          Mark all as read
        </div>
      </div>

      {/* Filters */}
      <div className="px-3 py-2 flex gap-2 border-b">
        <button className="px-3 py-1.5 rounded-full bg-blue-50 text-blue-600 font-medium text-xs hover:bg-blue-100 transition-colors">
          All
        </button>
        <button className="px-3 py-1.5 rounded-full text-gray-600 font-medium text-xs hover:bg-gray-100 transition-colors">
          Unread
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
        ) : notifications?.length > 0 ? (
          notifications.map((notification) => (
            <div
              key={notification.id}
              className={`p-3 border-b hover:bg-gray-50 cursor-pointer transition-colors ${
                !notification.isRead ? "bg-blue-50" : ""
              }`}>
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
                    <span className="text-xs px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full">
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
            <Empty description="No notifications" />
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationList;

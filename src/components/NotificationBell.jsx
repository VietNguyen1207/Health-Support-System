import { useState, useEffect, useRef, useMemo } from "react";
import NotificationList from "./NotificationList";
import { BellFilled } from "@ant-design/icons";
import { useLocation } from "react-router-dom";
import { useNotificationStore } from "../stores/notificationStore";

const NotificationBell = () => {
  const [isActive, setActive] = useState(false);
  const bellRef = useRef(null);
  const location = useLocation();
  const { notifications } = useNotificationStore();

  const unreadNotification = useMemo(() => {
    return Array.isArray(notifications)
      ? notifications.filter((noti) => noti && !noti.isRead)
      : [];
  }, [notifications]);

  useEffect(() => {
    // Đóng notification khi chuyển trang
    setActive(false);
  }, [location.pathname]);

  useEffect(() => {
    // Xử lý click outside
    const handleClickOutside = (event) => {
      if (bellRef.current && !bellRef.current.contains(event.target)) {
        setActive(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleBellClick = () => {
    setActive(!isActive);
  };

  return (
    <div className="relative" ref={bellRef}>
      <span className="h-full flex items-center justify-center">
        <div
          className={`rounded-full border-[10px] text-[12px] flex justify-center items-center cursor-pointer 
                    transition-all duration-300 ${
                      isActive
                        ? "border-[#EAF5FF] bg-[#EAF5FF] hover:border-[#DDE7F0] hover:bg-[#DDE7F0]"
                        : "border-[#E5E7EB] bg-[#E5E7EB] hover:border-[#D6D9DD] hover:bg-[#D6D9DD]"
                    }`}
          onClick={handleBellClick}
        >
          <BellFilled className="text-lg" />
          {unreadNotification.length > 0 && (
            <div
              className={
                "absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center"
              }
            >
              {unreadNotification.length > 99
                ? "99+"
                : unreadNotification.length}
            </div>
          )}
        </div>
      </span>

      {isActive && (
        <div className="absolute top-16 transform translate-x-[-120px] w-[320px]">
          <NotificationList onClose={() => setActive(false)} />
        </div>
      )}
    </div>
  );
};

export default NotificationBell;

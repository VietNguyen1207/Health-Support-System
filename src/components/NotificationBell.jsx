import { useState } from "react";
import NotificationList from "./NotificationList";
import { BellFilled } from "@ant-design/icons";

const NotificationBell = () => {
  const [isActive, setActive] = useState(false);

  const handleBellClick = () => {
    setActive(!isActive);
  };

  return (
    <div className="relative">
      <span className="h-full flex items-center justify-center">
        <div
          className={`rounded-full border-[10px] text-[12px] flex justify-center items-center cursor-pointer 
                    transition-all duration-300 ${
                      isActive
                        ? "border-[#EAF5FF] bg-[#EAF5FF] hover:border-[#DDE7F0] hover:bg-[#DDE7F0]"
                        : "border-[#E5E7EB] bg-[#E5E7EB] hover:border-[#D6D9DD] hover:bg-[#D6D9DD]"
                    }`}
          onClick={handleBellClick}>
          <BellFilled className="text-lg" />
        </div>
      </span>

      {isActive && (
        <div className="absolute top-16  transform translate-x-[-120px]  w-[320px]">
          <NotificationList />
        </div>
      )}
    </div>
  );
};

export default NotificationBell;

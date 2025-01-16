// DateTimeSelector.jsx
import { useState, useMemo } from "react";
import { Card, Space, Typography } from "antd";
const { Text } = Typography;

const DateTimeSelector = () => {
  const [selectedDate, setSelectedDate] = useState("17/01");
  const [selectedTime, setSelectedTime] = useState(null);

  const dates = [
    { date: "16/01", weekday: "Thứ 5" },
    { date: "17/01", weekday: "Thứ 6" },
    { date: "18/01", weekday: "Thứ 7" },
    { date: "09/02", weekday: "Ngày khác" },
  ];

  const timeSlots = useMemo(() => {
    const slots = [];
    let hour = 8;
    let minute = 0;

    while (hour < 17 || (hour === 17 && minute === 0)) {
      const timeString = `${hour.toString().padStart(2, "0")}:${minute
        .toString()
        .padStart(2, "0")}`;
      slots.push(timeString);

      minute += 30;
      if (minute >= 60) {
        hour += 1;
        minute = 0;
      }
    }
    return slots;
  }, []);

  return (
    <div className="p-5">
      <Text strong className="block text-base mb-4">
        Appointment Time<span className="text-red-500">*</span>
      </Text>

      {/* Date Selection */}
      <Space size={12} className="mb-5 flex flex-wrap">
        {dates.map((item) => (
          <Card
            key={item.date}
            className={`
               cursor-pointer border-none transition-all
              ${
                selectedDate === item.date
                  ? "bg-[#5C8C6B]"
                  : "bg-gray-100 hover:bg-gray-200"
              }
            `}
            onClick={() => setSelectedDate(item.date)}>
            <div className="text-center">
              <div
                className={`text-base font-medium ${
                  selectedDate === item.date ? "text-white" : "text-gray-800"
                }`}>
                {item.date}
              </div>
              <div
                className={`text-sm ${
                  selectedDate === item.date ? "text-white" : "text-gray-500"
                }`}>
                {item.weekday}
              </div>
            </div>
          </Card>
        ))}
      </Space>

      {/* Time Selection */}
      <div className="flex flex-wrap gap-2">
        {timeSlots.map((time) => (
          <Card
            key={time}
            className={`
              w-20 cursor-pointer border-none transition-all
              ${
                selectedTime === time
                  ? "bg-[#5C8C6B] text-white"
                  : "bg-gray-100 hover:bg-gray-200"
              }
            `}
            bodyStyle={{ padding: "8px" }}
            onClick={() => setSelectedTime(time)}>
            <div className="text-center">{time}</div>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default DateTimeSelector;

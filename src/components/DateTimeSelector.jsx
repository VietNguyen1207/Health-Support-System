// DateTimeSelector.jsx
import { useState, useMemo } from "react";
import { Card, Space, Typography } from "antd";
import dayjs from "dayjs";
import PropTypes from "prop-types";
const { Text } = Typography;

const DateTimeSelector = ({ selectedPsychologist = null, ...props }) => {
  const [selectedDate, setSelectedDate] = useState();
  const [selectedTime, setSelectedTime] = useState(null);
  const { setFormData } = props;

  const dates = [
    { date: dayjs().format("DD/MM"), weekday: dayjs().format("dddd") },
    {
      date: dayjs().add(1, "day").format("DD/MM"),
      weekday: dayjs().add(1, "day").format("dddd"),
    },
    {
      date: dayjs().add(2, "day").format("DD/MM"),
      weekday: dayjs().add(2, "day").format("dddd"),
    },
    { date: dayjs().add(3, "day").format("DD/MM"), weekday: "Other date" },
  ];

  // Kiểm tra xem có lịch làm việc hay không và có phải ngày làm việc không
  const hasWorkingHours = useMemo(() => {
    if (!selectedPsychologist?.workingHours) return false;
    const weekday = dayjs(selectedDate || dayjs())
      ?.format("dddd")
      .toLowerCase();
    return selectedPsychologist.workingHours[weekday] !== undefined;
  }, [selectedPsychologist, selectedDate]);

  // Lấy thông tin giờ làm việc của ngày được chọn
  const getWorkingHoursForDate = (date) => {
    if (!selectedPsychologist?.workingHours) return null;
    const weekday = date.format("dddd").toLowerCase();
    return selectedPsychologist.workingHours[weekday] || null;
  };

  // Tạo time slots dựa trên giờ làm việc
  const timeSlots = useMemo(() => {
    if (!selectedDate) return [];

    const workingHours = getWorkingHoursForDate(dayjs(selectedDate));
    if (!workingHours) return []; // Nếu không có lịch làm việc cho ngày này

    const slots = [];
    const startTime = dayjs(`2024-01-01 ${workingHours.start}`);
    const endTime = dayjs(`2024-01-01 ${workingHours.end}`);
    const slotDuration = workingHours.slotDuration || 30;

    let currentTime = startTime;
    while (!currentTime.isAfter(endTime)) {
      // Bỏ qua giờ nghỉ trưa nếu có
      if (workingHours.breakTime) {
        const [breakStart, breakEnd] = workingHours.breakTime.split("-");
        const isBreakTime =
          currentTime.format("HH:mm") >= breakStart &&
          currentTime.format("HH:mm") < breakEnd;
        if (isBreakTime) {
          currentTime = dayjs(`2024-01-01 ${breakEnd}`);
          continue;
        }
      }

      slots.push(currentTime.format("HH:mm"));
      currentTime = currentTime.add(slotDuration, "minute");
    }

    return slots;
  }, [selectedDate, selectedPsychologist]);

  const isSlotAvailable = (date, time) => {
    // Kiểm tra có chuyên viên và có phải ngày làm việc không
    if (!selectedPsychologist) return false;

    const weekday = date.format("dddd").toLowerCase();
    if (!selectedPsychologist.workingHours?.[weekday]) return false;

    // Kiểm tra slot đã được đặt
    const isBooked = selectedPsychologist.bookedSlots?.some((slot) => {
      const slotDate = dayjs(slot.date);
      return slotDate.isSame(date, "day") && slot.time === time;
    });

    return !isBooked;
  };

  //   console.log("workingHours", getWorkingHoursForDate(dayjs(selectedDate)));
  //   console.log("isSlotAvailable", isSlotAvailable(dayjs(selectedDate), "10:00"));

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
              w-24 h-28 cursor-pointer border-none transition-all
              ${
                selectedDate?.format("DD/MM") === item.date
                  ? "bg-[#5C8C6B]"
                  : "bg-gray-100 hover:bg-gray-200"
              }
            `}
            onClick={() => {
              const [day, month] = item.date.split("/");
              setSelectedDate(
                dayjs()
                  .set("date", day)
                  .set("month", month - 1)
              );
              setFormData((prev) => ({
                ...prev,
                appointmentDate: item.date,
              }));
            }}>
            <div className="text-center">
              <div
                className={`text-base font-medium ${
                  selectedDate?.format("DD/MM") === item.date
                    ? "text-white"
                    : "text-gray-800"
                }`}>
                {item.date}
              </div>
              <div
                className={`text-sm ${
                  selectedDate?.format("DD/MM") === item.date
                    ? "text-white"
                    : "text-gray-500"
                }`}>
                {item.weekday}
              </div>
            </div>
          </Card>
        ))}
      </Space>

      {!hasWorkingHours ? (
        <Text className="text-gray-500">There is no available time slots.</Text>
      ) : (
        <>
          {/* Time Selection */}
          {timeSlots.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {timeSlots.map((time) => {
                const available = isSlotAvailable(selectedDate, time);
                return (
                  <Card
                    key={time}
                    className={`
                      cursor-pointer border-none transition-all
                      ${
                        selectedTime === time
                          ? "bg-[#5C8C6B] text-white"
                          : available
                          ? "bg-gray-100 hover:bg-gray-200"
                          : "bg-gray-400 cursor-not-allowed"
                      }
                    `}
                    onClick={() => available && setSelectedTime(time)}>
                    <div className="text-center">{time}</div>
                  </Card>
                );
              })}
            </div>
          ) : (
            <Text className="text-gray-500">
              No available slots for selected date.
            </Text>
          )}
        </>
      )}
    </div>
  );
};

DateTimeSelector.propTypes = {
  selectedPsychologist: PropTypes.shape({
    workingHours: PropTypes.objectOf(
      PropTypes.shape({
        start: PropTypes.string,
        end: PropTypes.string,
        breakTime: PropTypes.string,
        slotDuration: PropTypes.number,
      })
    ),
    bookedSlots: PropTypes.arrayOf(
      PropTypes.shape({
        date: PropTypes.string.isRequired,
        time: PropTypes.string.isRequired,
      })
    ),
  }),
  setFormData: PropTypes.func,
};

export default DateTimeSelector;

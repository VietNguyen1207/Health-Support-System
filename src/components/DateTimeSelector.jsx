// DateTimeSelector.jsx
import { useState, useEffect } from "react";
import {
  Card,
  ConfigProvider,
  Popover,
  Select,
  Space,
  Spin,
  Typography,
  message,
} from "antd";
import dayjs from "dayjs";
import PropTypes from "prop-types";
import { CalendarOutlined } from "@ant-design/icons";
import CustomCalendar from "./CalendarComponent";
import {
  formatAppointmentDate,
  formatRegularDate,
  formatTimeDisplay,
  formatWeekDay,
} from "../utils/Helper";
import { useAppointmentStore } from "../stores/appointmentStore";
import { months } from "../constants/calendar";
const { Text } = Typography;

const dates = [dayjs(), dayjs().add(1, "day"), dayjs().add(2, "day")];

const DateTimeSelector = ({ selectedPsychologist = null, ...props }) => {
  const { setFormData } = props;
  const [selectedDate, setSelectedDate] = useState(dayjs());
  const [isOtherDate, setIsOtherDate] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [otherDate, setOtherDate] = useState(null);
  const [lastSelectedCard, setLastSelectedCard] = useState("RegularDate");
  const [selectedTimeSlot, setSelectedTimeSlot] = useState(null);
  const { GetTimeSlots } = useAppointmentStore();
  const [isLoading, setIsLoading] = useState(false);
  const [availableSlots, setAvailableSlots] = useState([]);

  useEffect(() => {
    setIsOtherDate(false);
    setIsOpen(false);
    setSelectedDate(dayjs());
    setOtherDate(null);
    setLastSelectedCard("RegularDate");
    setSelectedTimeSlot(null);
    setFormData((prev) => ({
      ...prev,
      timeSlotId: null,
    }));
  }, [selectedPsychologist]);

  useEffect(() => {
    const fetchSlots = async () => {
      if (!selectedPsychologist) {
        setAvailableSlots([]);
        return;
      }

      const dateStr = selectedDate
        ? formatAppointmentDate(selectedDate)
        : formatAppointmentDate(otherDate);

      setIsLoading(true);
      try {
        const slots = await GetTimeSlots(selectedPsychologist, dateStr);

        setAvailableSlots(
          slots.map((slot) => ({
            id: slot.timeSlotId,
            isAvailable: slot.status === "Booked" ? false : true,
            startTime: slot.startTime,
          }))
        );
      } catch (error) {
        console.error("Failed to fetch timeslots:", error);
        message.error("Failed to load available time slots. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchSlots();
  }, [selectedDate, otherDate, selectedPsychologist]);

  const handleDateSelection = (date, cardType = "RegularDate") => {
    if (!selectedPsychologist) return;

    try {
      if (cardType === "RegularDate") {
        setSelectedDate(date);
        setIsOtherDate(false);
        setIsOpen(false);
      } else {
        setIsOtherDate(true);
        setIsOpen(false);
        setSelectedDate(null);
      }

      setLastSelectedCard(cardType);
    } catch (error) {
      console.error("Failed to fetch timeslots:", error);
      message.error("Failed to load available time slots. Please try again.");
    }
  };

  const onChange = (value) => {
    if (!value.isBefore(dayjs())) {
      setOtherDate(value);
      handleDateSelection(value, "OtherDate");
    }
  };

  const headerRender = ({ value, onChange }) => {
    return (
      <div className="flex justify-end py-3">
        <Select
          value={value.month()}
          options={months}
          onChange={(newMonth) => {
            const now = value.clone().month(newMonth);
            onChange(now);
          }}
          style={{ width: 100 }}
        />
      </div>
    );
  };

  return (
    <div className="p-5">
      <Text strong className="block text-base mb-4">
        Appointment Time<span className="text-red-500">*</span>
      </Text>

      {/* Date Selection */}
      <ConfigProvider theme={{ components: { Card: { bodyPadding: 20 } } }}>
        <Space size={12} className="mb-5 flex flex-wrap">
          {dates.map((item) => (
            <Card
              key={formatAppointmentDate(item)}
              className={`
                min-w-14 p-0 border-none transition-all
              ${
                !selectedPsychologist
                  ? "bg-gray-100 cursor-not-allowed"
                  : formatAppointmentDate(selectedDate) ===
                    formatAppointmentDate(item)
                  ? "bg-[#5C8C6B]"
                  : "bg-gray-100 hover:bg-gray-200 cursor-pointer"
              }
            `}
              onClick={() => handleDateSelection(item, "RegularDate")}>
              <div className="text-center">
                <div
                  className={`text-base font-medium ${
                    selectedPsychologist &&
                    formatAppointmentDate(selectedDate) ===
                      formatAppointmentDate(item)
                      ? "text-white"
                      : "text-gray-800"
                  }`}>
                  {formatRegularDate(item)}
                </div>
                <div
                  className={`text-sm ${
                    selectedPsychologist &&
                    formatAppointmentDate(selectedDate) ===
                      formatAppointmentDate(item)
                      ? "text-white"
                      : "text-gray-500"
                  }`}>
                  {formatWeekDay(item)}
                </div>
              </div>
            </Card>
          ))}

          {/* Other Date */}
          <Popover
            open={isOpen}
            placement="rightTop"
            content={() => (
              <div className="w-[300px]">
                <CustomCalendar
                  fullscreen={false}
                  onChange={onChange}
                  headerRender={headerRender}
                  disabledDate={(current) => {
                    return current.isBefore(dayjs());
                  }}
                />
              </div>
            )}>
            <Card
              key="other"
              className={`
                min-w-14 cursor-pointer border-none transition-all
                ${
                  isOtherDate
                    ? selectedPsychologist
                      ? "bg-[#5C8C6B]"
                      : "bg-gray-400"
                    : "bg-gray-100 hover:bg-gray-200"
                }
              `}
              onClick={() => {
                if (!selectedPsychologist) return;
                if (otherDate && lastSelectedCard !== "OtherDate") {
                  handleDateSelection(otherDate, "OtherDate");
                } else {
                  setIsOtherDate(true);
                  setIsOpen(!isOpen);
                  setSelectedDate(null);
                  setLastSelectedCard("OtherDate");
                }
              }}>
              <div className="text-center">
                <div
                  className={`text-base font-medium ${
                    isOtherDate ? "text-white" : "text-gray-800"
                  }`}>
                  {!otherDate ? (
                    <CalendarOutlined className="text-xl" />
                  ) : (
                    formatRegularDate(otherDate)
                  )}
                </div>
                <div
                  className={`text-sm ${
                    isOtherDate ? "text-white" : "text-gray-500"
                  }`}>
                  Other Date
                </div>
              </div>
            </Card>
          </Popover>
        </Space>
      </ConfigProvider>

      {/* Time Selection */}
      {!selectedPsychologist ? (
        <Text className="text-gray-500">
          Please select a psychologist first.
        </Text>
      ) : isLoading ? (
        <div className="w-full flex justify-center p-8">
          <Spin size="default" />
        </div>
      ) : availableSlots.length > 0 ? (
        <ConfigProvider theme={{ components: { Card: { bodyPadding: 5 } } }}>
          <div className="max-w-2/3 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-4 gap-2 pr-8">
            {availableSlots.map((slot) => {
              const currentTime = dayjs();
              const startTime = dayjs(slot.startTime, "HH:mm:ss");

              const isSameDate =
                dayjs(selectedDate)
                  .startOf("day")
                  .isSame(currentTime.startOf("day")) ||
                (otherDate &&
                  dayjs(otherDate)
                    .startOf("day")
                    .isSame(currentTime.startOf("day")));

              const checkedTime = isSameDate && startTime.isBefore(currentTime);

              return (
                <Card
                  key={slot.id}
                  disabled={!slot.isAvailable}
                  className={`
                  p-0 border-none transition-all select-none
                  ${
                    selectedTimeSlot === slot.id
                      ? "bg-[#5C8C6B] text-white"
                      : !checkedTime && slot.isAvailable
                      ? "bg-gray-100 hover:bg-gray-200 cursor-pointer"
                      : "cursor-not-allowed bg-gray-50 text-gray-300"
                  }
                `}
                  onClick={() => {
                    if (slot.isAvailable) {
                      console.log(slot);
                      setSelectedTimeSlot(slot.id);
                      setFormData((prev) => ({
                        ...prev,
                        timeSlotId: slot.id,
                      }));
                    }
                  }}>
                  <div className="text-center py-1">
                    {formatTimeDisplay(slot.startTime)}
                  </div>
                </Card>
              );
            })}
          </div>
        </ConfigProvider>
      ) : (
        <Text className="text-gray-500">
          No available slots for selected date.
        </Text>
      )}
    </div>
  );
};

DateTimeSelector.propTypes = {
  selectedPsychologist: PropTypes.string,
  setFormData: PropTypes.func,
};

export default DateTimeSelector;

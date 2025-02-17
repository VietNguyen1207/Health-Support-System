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
    setOtherDate(value);
    handleDateSelection(value, "OtherDate");
  };

  const headerRender = ({ value, onChange }) => {
    const months = [
      { label: "Jan", value: 0 },
      { label: "Feb", value: 1 },
      { label: "Mar", value: 2 },
      { label: "Apr", value: 3 },
      { label: "May", value: 4 },
      { label: "Jun", value: 5 },
      { label: "Jul", value: 6 },
      { label: "Aug", value: 7 },
      { label: "Sep", value: 8 },
      { label: "Oct", value: 9 },
      { label: "Nov", value: 10 },
      { label: "Dec", value: 11 },
    ];

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
                    return (
                      current.isBefore(
                        dayjs().subtract(-dates.length + 1, "day")
                      ) && current.isAfter(dayjs().subtract(1, "year"))
                    );
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
          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2">
            {availableSlots.map((slot) => (
              <Card
                key={slot.id}
                disabled={!slot.isAvailable}
                className={`
                  p-0 border-none transition-all select-none
                  ${
                    selectedTimeSlot === slot.id
                      ? "bg-[#5C8C6B] text-white"
                      : slot.isAvailable
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
                <div className="text-center py-2">
                  {formatTimeDisplay(slot.startTime)}
                </div>
              </Card>
            ))}
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

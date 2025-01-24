// DateTimeSelector.jsx
import { useState, useMemo, useEffect } from "react";
import { Card, ConfigProvider, Popover, Select, Space, Typography } from "antd";
import dayjs from "dayjs";
import PropTypes from "prop-types";
import timeSlots from "../data/timeSlots.json";
import { CalendarOutlined } from "@ant-design/icons";
import CustomCalendar from "./CalendarComponent";
import {
  formatAppointmentDate,
  formatRegularDate,
  formatWeekDay,
} from "../utils/Helper";
const { Text } = Typography;

const DateTimeSelector = ({ selectedPsychologist = null, ...props }) => {
  const { formData, setFormData } = props;
  const [selectedDate, setSelectedDate] = useState(dayjs());
  const [isOtherDate, setIsOtherDate] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [otherDate, setOtherDate] = useState(null);
  const [lastSelectedCard, setLastSelectedCard] = useState("RegularDate");

  useEffect(() => {
    setSelectedDate(dayjs(formData?.appointmentDate));
  }, [formData?.appointmentDate]);

  useEffect(() => {
    setIsOtherDate(false);
    setIsOpen(false);
  }, [selectedPsychologist]);

  const dates = [dayjs(), dayjs().add(1, "day"), dayjs().add(2, "day")];

  // Get available slots based on selected date and psychologist
  const getAvailableSlots = useMemo(() => {
    if (!selectedPsychologist) return [];
    const dateStr = selectedDate
      ? formatAppointmentDate(selectedDate)
      : formatAppointmentDate(otherDate);
    const availableSlots = selectedPsychologist.available[dateStr] || [];
    const bookedSlots = selectedPsychologist.booked[dateStr] || [];
    const workingHours = availableSlots
      .concat(bookedSlots)
      .sort((a, b) => a - b);

    // console.log(workingHours);

    return workingHours.map((slot) => ({
      timeSlots: timeSlots[slot],
      isAvailable: !bookedSlots.includes(slot),
    }));

    // Filter out booked slots and convert to time format
  }, [selectedDate, otherDate, selectedPsychologist]);

  const onChange = (value) => {
    // console.log(value);

    setOtherDate(value);
    setFormData((prev) => ({
      ...prev,
      appointmentDate: formatAppointmentDate(value),
      appointmentTime: null,
    }));
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
               min-w-14 p-0 cursor-pointer border-none transition-all
              ${
                selectedDate &&
                formatAppointmentDate(selectedDate) ===
                  formatAppointmentDate(item)
                  ? selectedPsychologist
                    ? "bg-[#5C8C6B]"
                    : "bg-gray-400"
                  : "bg-gray-100 hover:bg-gray-200"
              }
            `}
              onClick={() => {
                if (!selectedPsychologist) return;
                setSelectedDate(item);
                setIsOtherDate(false);
                setIsOpen(false);

                setFormData((prev) => ({
                  ...prev,
                  appointmentDate: formatAppointmentDate(item),
                  appointmentTime: null, // Reset appointmentTime when switching from "OtherDate".
                }));

                if (lastSelectedCard !== "RegularDate") {
                  setLastSelectedCard("RegularDate");
                }
              }}>
              <div className="text-center">
                <div
                  className={`text-base font-medium ${
                    selectedDate &&
                    formatAppointmentDate(selectedDate) ===
                      formatAppointmentDate(item)
                      ? "text-white"
                      : "text-gray-800"
                  }`}>
                  {formatRegularDate(item)}
                </div>
                <div
                  className={`text-sm ${
                    selectedDate &&
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
              key={"other"}
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

                if (lastSelectedCard !== "OtherDate") {
                  setFormData((prev) => ({
                    ...prev,
                    appointmentDate: formatAppointmentDate(otherDate),
                    appointmentTime: null, // Reset appointmentTime only when switching to "OtherDate".
                  }));
                }
                setIsOtherDate(true);
                setIsOpen(!isOpen);
                setSelectedDate(null);
                setLastSelectedCard("OtherDate");
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
          Please select a date and psychologist first.
        </Text>
      ) : getAvailableSlots.length > 0 ? (
        <ConfigProvider theme={{ components: { Card: { bodyPadding: 5 } } }}>
          <div className="flex flex-wrap gap-2">
            {getAvailableSlots.map((slot) => (
              <Card
                key={slot.timeSlots}
                disabled={!slot.isAvailable}
                className={`
                       w-1/12 min-w-20 p-0 border-none transition-all
                      ${
                        formData?.appointmentTime === slot.timeSlots
                          ? "bg-[#5C8C6B] text-white"
                          : slot.isAvailable
                          ? "bg-gray-100 hover:bg-gray-200  cursor-pointer"
                          : " cursor-not-allowed bg-gray-50 text-gray-300"
                      }
                    `}
                onClick={() => {
                  if (slot.isAvailable) {
                    setFormData((prev) => ({
                      ...prev,
                      appointmentTime: slot.timeSlots,
                    }));
                  }
                }}>
                <div className="text-center">{slot.timeSlots}</div>
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
  formData: PropTypes.object,
  setFormData: PropTypes.func,
};

export default DateTimeSelector;

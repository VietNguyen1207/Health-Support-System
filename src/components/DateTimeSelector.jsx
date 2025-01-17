// DateTimeSelector.jsx
import { useState, useMemo } from "react";
import { Card, Space, Typography } from "antd";
import dayjs from "dayjs";
import PropTypes from "prop-types";
import timeSlots from "../data/timeSlots.json";
const { Text } = Typography;

const DateTimeSelector = ({ selectedPsychologist = null, ...props }) => {
  const { formData, setFormData } = props;
  const [selectedDate, setSelectedDate] = useState(
    dayjs(formData?.appointmentDate)
  );

  // console.log("selectedDate", selectedDate);
  // console.log("formData?.appointmentDate", formData?.appointmentDate);
  // console.log(selectedDate === formData?.appointmentDate);
  // console.log(selectedPsychologist);

  const dates = [
    { date: dayjs(), weekday: dayjs().format("ddd") },
    {
      date: dayjs().add(1, "day"),
      weekday: dayjs().add(1, "day").format("ddd"),
    },
    {
      date: dayjs().add(2, "day"),
      weekday: dayjs().add(2, "day").format("ddd"),
    },
    { date: dayjs().add(3, "day"), weekday: "Other date" },
  ];

  // Get available slots based on selected date and psychologist
  const getAvailableSlots = useMemo(() => {
    if (!selectedPsychologist) return [];
    const dateStr = dayjs(selectedDate).format("YYYY-MM-DD");
    const availableSlots = selectedPsychologist.available[dateStr] || [];
    const bookedSlots = selectedPsychologist.booked[dateStr] || [];
    const workingHours = availableSlots
      .concat(bookedSlots)
      .sort((a, b) => a - b);

    // console.log(workingHours);

    return (
      workingHours
        //   .filter((slot) => !bookedSlots.includes(slot))
        .map((slot) => ({
          timeSlots: timeSlots[slot],
          isAvailable: !bookedSlots.includes(slot),
        }))
    );

    // Filter out booked slots and convert to time format
  }, [selectedDate, selectedPsychologist]);

  // Check if psychologist has any available slots
  const hasAvailableSlots = useMemo(() => {
    if (!selectedPsychologist) return false;
    return Object.keys(selectedPsychologist.available).length > 0;
  }, [selectedPsychologist]);

  return (
    <div className="p-5">
      <Text strong className="block text-base mb-4">
        Appointment Time<span className="text-red-500">*</span>
      </Text>

      {/* Date Selection */}
      <Space size={12} className="mb-5 flex flex-wrap">
        {dates.map((item) => (
          <Card
            key={item.date.format("YYYY-MM-DD")}
            className={`
              w-24 h-28 cursor-pointer border-none transition-all
              ${
                selectedDate &&
                selectedDate?.format("YYYY-MM-DD") ===
                  item.date.format("YYYY-MM-DD")
                  ? "bg-[#5C8C6B]"
                  : "bg-gray-100 hover:bg-gray-200"
              }
            `}
            onClick={() => {
              setSelectedDate(item.date);

              setFormData((prev) => ({
                ...prev,
                appointmentDate: item.date.format("YYYY-MM-DD"),
                appointmentTime: null,
              }));
            }}>
            <div className="text-center">
              <div
                className={`text-base font-medium ${
                  selectedDate &&
                  selectedDate?.format("YYYY-MM-DD") ===
                    item.date.format("YYYY-MM-DD")
                    ? "text-white"
                    : "text-gray-800"
                }`}>
                {item.date.format("DD/MM")}
              </div>
              <div
                className={`text-sm ${
                  selectedDate &&
                  selectedDate?.format("YYYY-MM-DD") ===
                    item.date.format("YYYY-MM-DD")
                    ? "text-white"
                    : "text-gray-500"
                }`}>
                {item.weekday}
              </div>
            </div>
          </Card>
        ))}
      </Space>
      {!hasAvailableSlots ? (
        <Text className="text-gray-500">There is no available time slots.</Text>
      ) : (
        <>
          {/* Time Selection */}
          {selectedDate && selectedPsychologist ? (
            getAvailableSlots.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {getAvailableSlots.map((slot) => (
                  <Card
                    key={slot.timeSlots}
                    disabled={!slot.isAvailable}
                    className={`
                       w-1/6 min-w-20 p-0 cursor-pointer border-none transition-all
                      ${
                        formData?.appointmentTime === slot.timeSlots
                          ? "bg-[#5C8C6B] text-white"
                          : slot.isAvailable
                          ? "bg-gray-100 hover:bg-gray-200"
                          : "bg-gray-300 cursor-not-allowed"
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
            ) : (
              <Text className="text-gray-500">
                No available slots for selected date.
              </Text>
            )
          ) : (
            <Text className="text-gray-500">
              Please select a date and psychologist first.
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
  formData: PropTypes.object,
  setFormData: PropTypes.func,
};

export default DateTimeSelector;

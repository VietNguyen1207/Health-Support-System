// DateTimeSelector.jsx
import { useState, useEffect, useCallback, useMemo, memo } from "react";
import {
  Card,
  ConfigProvider,
  Space,
  Spin,
  Typography,
  Empty,
  Badge,
  Divider,
  Tabs,
  Tag,
} from "antd";
import dayjs from "dayjs";
import PropTypes from "prop-types";
import { ClockCircleOutlined } from "@ant-design/icons";
import {
  formatRegularDate,
  formatTimeDisplay,
  formatWeekDay,
} from "../utils/Helper";
const { Text, Title } = Typography;

// Memoized component for time slot card with availability indicator
const TimeSlotCard = memo(({ slot, isSelected, onSelect }) => {
  // Determine if slot is available
  const isAvailable = slot.status === "AVAILABLE" && !slot.booked;

  // Calculate availability for visual indicator
  const availabilityText = `${slot.currentBookings}/${slot.maxCapacity}`;

  // Determine availability status color
  const availabilityColor = useMemo(() => {
    if (!isAvailable) return "default";
    const availabilityPercentage =
      (slot.currentBookings / slot.maxCapacity) * 100;
    if (availabilityPercentage < 33) return "success";
    if (availabilityPercentage < 66) return "warning";
    return "error";
  }, [slot.currentBookings, slot.maxCapacity, isAvailable]);

  return (
    <Badge.Ribbon text={availabilityText} color={availabilityColor}>
      <Card
        className={`
          p-0 border-none transition-all select-none
          ${
            isSelected
              ? "bg-[#5C8C6B] text-white"
              : isAvailable
              ? "bg-gray-100 hover:bg-gray-200 cursor-pointer"
              : "bg-gray-200 opacity-60 cursor-not-allowed"
          }
        `}
        onClick={() => isAvailable && onSelect(slot.timeSlotId)}>
        <div className="text-center py-2">
          <div className={`font-medium ${isSelected ? "text-white" : ""}`}>
            {formatTimeDisplay(slot.startTime)}
          </div>
          <div
            className={`text-xs ${
              isSelected ? "text-white" : "text-gray-500"
            }`}>
            {formatTimeDisplay(slot.endTime)}
          </div>
          {!isAvailable && (
            <Tag className="mt-1" color="default">
              {slot.booked ? "Booked" : "Unavailable"}
            </Tag>
          )}
        </div>
      </Card>
    </Badge.Ribbon>
  );
});

TimeSlotCard.propTypes = {
  slot: PropTypes.shape({
    timeSlotId: PropTypes.string.isRequired,
    slotDate: PropTypes.string.isRequired,
    startTime: PropTypes.string.isRequired,
    endTime: PropTypes.string.isRequired,
    status: PropTypes.string.isRequired,
    maxCapacity: PropTypes.number.isRequired,
    currentBookings: PropTypes.number.isRequired,
    booked: PropTypes.bool.isRequired,
  }).isRequired,
  isSelected: PropTypes.bool.isRequired,
  onSelect: PropTypes.func.isRequired,
};

TimeSlotCard.displayName = "TimeSlotCard";

// Memoized component for date card
const DateCard = memo(({ date, isSelected, onClick, hasSlots }) => {
  return (
    <Card
      className={`
        min-w-14 p-0 border-none transition-all
        ${
          !hasSlots
            ? "opacity-50 cursor-not-allowed"
            : isSelected
            ? "bg-[#5C8C6B]"
            : "bg-gray-100 hover:bg-gray-200 cursor-pointer"
        }
      `}
      onClick={() => hasSlots && onClick(date)}>
      <div className="text-center">
        <div
          className={`text-base font-medium ${
            isSelected ? "text-white" : "text-gray-800"
          }`}>
          {formatRegularDate(date)}
        </div>
        <div
          className={`text-sm ${isSelected ? "text-white" : "text-gray-500"}`}>
          {formatWeekDay(date)}
        </div>
      </div>
    </Card>
  );
});

DateCard.propTypes = {
  date: PropTypes.object.isRequired,
  isSelected: PropTypes.bool.isRequired,
  onClick: PropTypes.func.isRequired,
  hasSlots: PropTypes.bool.isRequired,
};

DateCard.displayName = "DateCard";

const DateTimeSelector = ({
  timeSlots = [],
  loading = false,
  setFormData,
  formData,
}) => {
  // State management
  const [selectedDate, setSelectedDate] = useState(dayjs());
  const [selectedTimeSlot, setSelectedTimeSlot] = useState(null);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [message, setMessage] = useState(null);
  const [availableDates, setAvailableDates] = useState([]);
  const [activeTabKey, setActiveTabKey] = useState("thisWeek");

  // Update availableSlots when timeSlots prop changes
  useEffect(() => {
    if (timeSlots && timeSlots.length > 0) {
      // Filter out slots with dates before today
      const today = dayjs().startOf("day");
      const futureSlots = timeSlots.filter((slot) => {
        const slotDate = dayjs(slot.slotDate);

        // If it's today, also check if the slot time is in the future
        if (slotDate.isSame(today, "day")) {
          const slotHour = parseInt(slot.startTime.split(":")[0], 10);
          const slotMinute = parseInt(slot.startTime.split(":")[1], 10);
          const currentHour = dayjs().hour();
          const currentMinute = dayjs().minute();

          // Compare hours and minutes to determine if the slot is in the future
          return (
            slotHour > currentHour ||
            (slotHour === currentHour && slotMinute > currentMinute)
          );
        }

        // For future dates, include all slots
        return slotDate.isAfter(today);
      });

      setAvailableSlots(futureSlots);
      setMessage(
        futureSlots.length > 0 ? null : "No future time slots available."
      );
    } else {
      setAvailableSlots([]);
      setMessage("No time slots found.");
    }
  }, [timeSlots]);

  // Group time slots by date and period
  const groupedTimeSlots = useMemo(() => {
    if (!availableSlots.length) return {};

    return availableSlots.reduce((acc, slot) => {
      const date = slot.slotDate;
      if (!acc[date]) acc[date] = { Morning: [], Afternoon: [], Evening: [] };

      const hour = parseInt(slot.startTime.split(":")[0], 10);
      let period;

      if (hour < 12) period = "Morning";
      else if (hour < 17) period = "Afternoon";
      else period = "Evening";

      acc[date][period].push(slot);
      return acc;
    }, {});
  }, [availableSlots]);

  // Organize dates into weeks for tab display
  const datesByWeek = useMemo(() => {
    if (!availableDates.length) return { thisWeek: [], nextWeek: [] };

    const today = dayjs();
    const endOfThisWeek = today.endOf("week");

    return availableDates.reduce(
      (acc, date) => {
        if (date.isBefore(endOfThisWeek) || date.isSame(endOfThisWeek, "day")) {
          acc.thisWeek.push(date);
        } else if (
          date.isAfter(endOfThisWeek) &&
          date.isBefore(endOfThisWeek.add(7, "day"))
        ) {
          acc.nextWeek.push(date);
        }
        return acc;
      },
      { thisWeek: [], nextWeek: [] }
    );
  }, [availableDates]);

  // Extract unique dates from available slots
  useEffect(() => {
    if (availableSlots.length > 0) {
      const uniqueDates = [
        ...new Set(availableSlots.map((slot) => slot.slotDate)),
      ];

      // Sort dates chronologically
      uniqueDates.sort((a, b) => dayjs(a).diff(dayjs(b)));

      const dayJsDates = uniqueDates.map((date) => dayjs(date));
      setAvailableDates(dayJsDates);

      // Set active tab based on available dates
      if (dayJsDates.length > 0) {
        const firstDate = dayJsDates[0];
        const today = dayjs();
        const endOfThisWeek = today.endOf("week");

        if (firstDate.isAfter(endOfThisWeek)) {
          setActiveTabKey("nextWeek");
        } else {
          setActiveTabKey("thisWeek");
        }

        // Set selected date to the first available date
        setSelectedDate(firstDate);
      }
    } else {
      setAvailableDates([]);
    }
  }, [availableSlots]);

  // Reset component when formData is reset
  useEffect(() => {
    if (!formData.psychologist && !formData.timeSlotId) {
      // Reset all internal state
      setSelectedDate(dayjs());
      setSelectedTimeSlot(null);
      setAvailableSlots([]);
      setMessage(null);
      setAvailableDates([]);
      setActiveTabKey("thisWeek");
    }
  }, [formData]);

  // Handle date selection
  const handleDateSelection = useCallback(
    (date) => {
      setSelectedDate(date);
      setSelectedTimeSlot(null);
      setFormData((prev) => ({
        ...prev,
        timeSlotId: null,
      }));
    },
    [setFormData]
  );

  // Handle time slot selection
  const handleTimeSlotSelection = useCallback(
    (slotId) => {
      setSelectedTimeSlot(slotId);
      setFormData((prev) => ({
        ...prev,
        timeSlotId: slotId,
      }));
    },
    [setFormData]
  );

  // Filter slots for the selected date
  const slotsForSelectedDate = useMemo(() => {
    if (!availableSlots.length) return [];

    return availableSlots.filter(
      (slot) =>
        dayjs(slot.slotDate).format("YYYY-MM-DD") ===
        selectedDate.format("YYYY-MM-DD")
    );
  }, [availableSlots, selectedDate]);

  // Check if a date has available slots
  const hasAvailableSlots = useCallback(
    (date) => {
      const formattedDate = date.format("YYYY-MM-DD");
      const dateSlots = availableSlots.filter(
        (slot) => slot.slotDate === formattedDate
      );
      return dateSlots.some((slot) => slot.status === "AVAILABLE");
    },
    [availableSlots]
  );

  // Get periods with slots for selected date
  const periodsWithSlots = useMemo(() => {
    const dateStr = selectedDate.format("YYYY-MM-DD");
    if (!groupedTimeSlots[dateStr]) return [];

    return Object.entries(groupedTimeSlots[dateStr])
      .filter(([_, slots]) => slots.length > 0)
      .map(([period]) => period);
  }, [groupedTimeSlots, selectedDate]);

  // Tab items for date selection
  const tabItems = useMemo(() => {
    const items = [];

    if (datesByWeek.thisWeek.length > 0) {
      items.push({
        key: "thisWeek",
        label: "This Week",
        children: (
          <Space size={12} className="flex flex-wrap">
            {datesByWeek.thisWeek.map((date) => (
              <DateCard
                key={date.format("YYYY-MM-DD")}
                date={date}
                isSelected={
                  selectedDate.format("YYYY-MM-DD") ===
                  date.format("YYYY-MM-DD")
                }
                onClick={handleDateSelection}
                hasSlots={hasAvailableSlots(date)}
              />
            ))}
          </Space>
        ),
      });
    }

    if (datesByWeek.nextWeek.length > 0) {
      items.push({
        key: "nextWeek",
        label: "Next Week",
        children: (
          <Space size={12} className="flex flex-wrap">
            {datesByWeek.nextWeek.map((date) => (
              <DateCard
                key={date.format("YYYY-MM-DD")}
                date={date}
                isSelected={
                  selectedDate.format("YYYY-MM-DD") ===
                  date.format("YYYY-MM-DD")
                }
                onClick={handleDateSelection}
                hasSlots={hasAvailableSlots(date)}
              />
            ))}
          </Space>
        ),
      });
    }

    return items;
  }, [datesByWeek, selectedDate, handleDateSelection, hasAvailableSlots]);

  // Get selected slot details
  const selectedSlotDetails = useMemo(() => {
    if (!selectedTimeSlot) return null;
    return availableSlots.find((slot) => slot.timeSlotId === selectedTimeSlot);
  }, [selectedTimeSlot, availableSlots]);

  // Check if psychologist is selected
  const isPsychologistSelected = useMemo(() => {
    return formData && formData.psychologist !== "";
  }, [formData]);

  return (
    <div className="p-5">
      <Text strong className="block text-base mb-4">
        Appointment Time<span className="text-red-500">*</span>
      </Text>

      {!isPsychologistSelected ? (
        <div className="bg-gray-50 p-6 rounded-lg text-center">
          <Text className="text-gray-500">
            Please select a psychologist first to view available time slots.
          </Text>
        </div>
      ) : loading ? (
        <div className="w-full flex flex-col justify-center items-center p-8">
          <Spin size="large" />
          <Text className="mt-3 text-gray-500">
            Loading available time slots...
          </Text>
        </div>
      ) : availableSlots.length === 0 ? (
        <Empty
          description={message || "No time slots found"}
          className="my-8"
        />
      ) : (
        <>
          {/* Date Selection */}
          <div className="mb-6">
            <ConfigProvider
              theme={{ components: { Card: { bodyPadding: 20 } } }}>
              {tabItems.length > 0 ? (
                <Tabs
                  activeKey={activeTabKey}
                  onChange={setActiveTabKey}
                  items={tabItems}
                />
              ) : (
                <Empty description="No dates available" />
              )}
            </ConfigProvider>
          </div>

          {/* Time Slots for Selected Date */}
          {slotsForSelectedDate.length > 0 ? (
            <div className="bg-gray-50 p-4 rounded-lg">
              <Title level={5} className="mb-4">
                <ClockCircleOutlined className="mr-2" />
                Time Slots for {selectedDate.format("dddd, MMMM D, YYYY")}
              </Title>

              {periodsWithSlots.length > 0 ? (
                periodsWithSlots.map((period) => {
                  const dateStr = selectedDate.format("YYYY-MM-DD");
                  const slots = groupedTimeSlots[dateStr][period];

                  return (
                    <div key={period} className="mb-5">
                      <Divider orientation="left" className="my-3">
                        <Text strong className="text-gray-700">
                          {period}
                        </Text>
                      </Divider>
                      <ConfigProvider
                        theme={{ components: { Card: { bodyPadding: 5 } } }}>
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                          {slots.map((slot) => (
                            <TimeSlotCard
                              key={slot.timeSlotId}
                              slot={slot}
                              isSelected={selectedTimeSlot === slot.timeSlotId}
                              onSelect={handleTimeSlotSelection}
                            />
                          ))}
                        </div>
                      </ConfigProvider>
                    </div>
                  );
                })
              ) : (
                <Empty description="No time slots available for this date" />
              )}

              {/* Legend for availability indicators */}
              <div className="mt-5 bg-white p-3 rounded-md border border-gray-200">
                <Text strong className="block mb-2">
                  Availability Guide:
                </Text>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <div className="flex items-center">
                    <Badge color="success" className="mr-2" />
                    <Text className="text-sm">High Availability</Text>
                  </div>
                  <div className="flex items-center">
                    <Badge color="warning" className="mr-2" />
                    <Text className="text-sm">Medium Availability</Text>
                  </div>
                  <div className="flex items-center">
                    <Badge color="error" className="mr-2" />
                    <Text className="text-sm">Low Availability</Text>
                  </div>
                  <div className="flex items-center">
                    <Badge color="default" className="mr-2" />
                    <Text className="text-sm">Unavailable</Text>
                  </div>
                </div>
                <Text className="text-xs text-gray-500 mt-2 block">
                  <span className="font-medium">Note:</span> The numbers (e.g.,
                  2/3) indicate current bookings out of maximum capacity.
                </Text>
              </div>
            </div>
          ) : (
            <Empty
              description={`No time slots for ${selectedDate.format(
                "MMMM D, YYYY"
              )}`}
              className="my-8"
            />
          )}

          {/* Selected slot summary */}
          {selectedSlotDetails && (
            <div className="mt-4 p-4 bg-blue-50 border border-blue-100 rounded-md">
              <Text strong className="block mb-1">
                Selected Appointment:
              </Text>
              <div>
                <Text className="block">
                  {dayjs(selectedSlotDetails.slotDate).format(
                    "dddd, MMMM D, YYYY"
                  )}
                </Text>
                <Text className="block">
                  {formatTimeDisplay(selectedSlotDetails.startTime)} -{" "}
                  {formatTimeDisplay(selectedSlotDetails.endTime)}
                </Text>
                <Text className="block mt-1">
                  <Badge
                    status={
                      selectedSlotDetails.status === "AVAILABLE"
                        ? "success"
                        : "default"
                    }
                  />
                  Status: {selectedSlotDetails.status}
                </Text>
                <Text className="block">
                  Availability: {selectedSlotDetails.currentBookings}/
                  {selectedSlotDetails.maxCapacity} slots booked
                </Text>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

DateTimeSelector.propTypes = {
  timeSlots: PropTypes.array.isRequired,
  loading: PropTypes.bool.isRequired,
  setFormData: PropTypes.func.isRequired,
  formData: PropTypes.object.isRequired,
};

export default DateTimeSelector;

import { useState, useCallback, useMemo, useEffect, memo } from "react";
import {
  Calendar,
  Card,
  Typography,
  Button,
  Space,
  Checkbox,
  Modal,
  Form,
  DatePicker,
  Divider,
  Empty,
  notification,
  Spin,
  Tabs,
  Table,
  Tag,
  Badge,
} from "antd";
import {
  PlusOutlined,
  CalendarOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import { usePsychologistStore } from "../../stores/psychologistStore";
import { useAuthStore } from "../../stores/authStore";
import PropTypes from "prop-types";

const { Title, Text } = Typography;
// const { TabPane } = Tabs;

// Memoized component for time slot item in selection modal
const TimeSlotItem = memo(
  ({ slot, isSelected, onToggle, isDisabled, date }) => {
    const isOver = useMemo(() => {
      // Get current date and time
      const now = dayjs();

      // Parse the selected date
      const selectedDate = dayjs(date);

      // Check if the selected date is in the past
      if (selectedDate.isBefore(now, "day")) {
        // If the selected date is before today, all slots are in the past
        return true;
      }

      // Check if the selected date is today
      if (selectedDate.isSame(now, "day")) {
        // Extract hours and minutes from startTime
        let slotHour = 0,
          slotMinute = 0;

        try {
          // Handle different time formats (with or without seconds/milliseconds)
          const timeStr = slot.startTime.split(".")[0]; // Remove milliseconds if present
          const timeParts = timeStr.split(":");
          slotHour = parseInt(timeParts[0], 10);
          slotMinute = parseInt(timeParts[1], 10);

          if (isNaN(slotHour) || isNaN(slotMinute)) {
            console.warn("Invalid time format:", slot.startTime);
            return false;
          }
        } catch (error) {
          console.error("Error parsing time:", slot.startTime, error);
          return false;
        }

        // Compare with current time
        const currentHour = now.hour();
        const currentMinute = now.minute();

        // Check if the slot time is in the past
        if (slotHour < currentHour) {
          return true;
        } else if (slotHour === currentHour && slotMinute <= currentMinute) {
          return true;
        }
      }

      // If the selected date is in the future or the slot time is in the future today
      return false;
    }, [date, slot.startTime]);

    return (
      <div
        className={`
        p-3 rounded-md border mb-2 flex justify-between items-center
        ${
          isDisabled || isOver
            ? "opacity-50 cursor-not-allowed"
            : "cursor-pointer"
        }
        ${
          isSelected
            ? "border-primary bg-primary-light"
            : "border-gray-200 hover:border-primary"
        }
      `}
        onClick={() => (!isDisabled || !isOver) && onToggle(slot.slotId)}>
        {/* Add an indicator for past slots */}
        <div>
          <div className="font-medium">
            {dayjs(slot.startTime, "HH:mm:ss").format("HH:mm")} -{" "}
            {dayjs(slot.endTime, "HH:mm:ss").format("HH:mm")}
          </div>
          <div className="text-xs text-gray-500">
            {slot.period}
            {isDisabled ? (
              <span className="text-red-500 ml-2">(Already created)</span>
            ) : (
              isOver && <span className="text-red-500 ml-2">(Expired)</span>
            )}
          </div>
        </div>
        <Checkbox checked={isSelected} disabled={isDisabled || isOver} />
      </div>
    );
  }
);

TimeSlotItem.propTypes = {
  date: PropTypes.string.isRequired,
  slot: PropTypes.shape({
    slotId: PropTypes.string.isRequired,
    startTime: PropTypes.string.isRequired,
    endTime: PropTypes.string.isRequired,
    period: PropTypes.string.isRequired,
  }).isRequired,
  isSelected: PropTypes.bool.isRequired,
  onToggle: PropTypes.func.isRequired,
  isDisabled: PropTypes.bool,
};

TimeSlotItem.displayName = "TimeSlotItem";

// Memoized component for displaying time slots in calendar
const TimeSlotTag = memo(({ slot }) => {
  return (
    <Tag
      color={slot.status === "AVAILABLE" ? "success" : "default"}
      className="mb-1">
      {dayjs(slot.startTime, "HH:mm:ss").format("HH:mm")} -{" "}
      {dayjs(slot.endTime, "HH:mm:ss").format("HH:mm")}
    </Tag>
  );
});

TimeSlotTag.propTypes = {
  slot: PropTypes.shape({
    startTime: PropTypes.string.isRequired,
    endTime: PropTypes.string.isRequired,
    status: PropTypes.string,
  }).isRequired,
};

TimeSlotTag.displayName = "TimeSlotTag";

const WorkSchedule = () => {
  // States
  const [selectedDate, setSelectedDate] = useState(dayjs());
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedSlots, setSelectedSlots] = useState([]);
  const [activeTab, setActiveTab] = useState("morning");
  const [submitting, setSubmitting] = useState(false);
  const [calendarView, setCalendarView] = useState("month");
  const [createdTimeSlots, setCreatedTimeSlots] = useState({});
  const [loadingTimeSlots, setLoadingTimeSlots] = useState(false);
  const [existingSlotIds, setExistingSlotIds] = useState(new Set());

  // Store hooks
  const { user } = useAuthStore();
  const {
    createTimeSlot,
    fetchDefaultTimeSlots,
    getTimeSlots,
    defaultTimeSlots,
    timeSlots,
  } = usePsychologistStore();

  // Fetch default time slots on mount
  useEffect(() => {
    if (user?.userId) {
      fetchDefaultTimeSlots();
      // Lấy time slots cho ngày hiện tại khi component mount
      const today = dayjs();
      fetchCreatedTimeSlots(today);
    }
  }, [user?.userId]);

  // Fetch created time slots
  const fetchCreatedTimeSlots = useCallback(async () => {
    if (!user?.userId) return;

    setLoadingTimeSlots(true);
    try {
      const slots = await getTimeSlots(user.psychologistId);

      // Group slots by date
      const groupedSlots = {};
      if (slots && Array.isArray(slots)) {
        slots.forEach((slot) => {
          if (dayjs(slot.slotDate).isBefore(dayjs().startOf("day"))) return;
          if (!groupedSlots[slot.slotDate]) {
            groupedSlots[slot.slotDate] = [];
          }
          groupedSlots[slot.slotDate].push(slot);
        });
      }

      setCreatedTimeSlots(groupedSlots);
    } catch (error) {
      console.error("Error fetching time slots:", error);
      notification.error({
        message: "Error",
        description: "Failed to fetch created time slots",
      });
    } finally {
      setLoadingTimeSlots(false);
    }
  }, [user?.userId]);

  // Group time slots by period for better rendering
  const slotsByPeriod = useMemo(() => {
    if (!defaultTimeSlots?.length)
      return { morning: [], afternoon: [], evening: [] };

    return defaultTimeSlots.reduce(
      (acc, slot) => {
        const periodLower = slot.period.toLowerCase();
        if (!acc[periodLower]) acc[periodLower] = [];
        acc[periodLower].push(slot);
        return acc;
      },
      { morning: [], afternoon: [], evening: [] }
    );
  }, [defaultTimeSlots]);

  // Handler for date selection in calendar
  const handleCalendarSelect = useCallback(
    async (date) => {
      setSelectedDate(date);
    },
    [user?.userId, timeSlots]
  );

  // Handler for date change in modal
  const handleDateChange = (date) => {
    setSelectedDate(date);
    setSelectedSlots([]); // Reset selected slots when date changes

    // Kiểm tra các slot đã tồn tại cho ngày được chọn
    if (date) {
      const formattedDate = date.format("YYYY-MM-DD");

      // Sử dụng dữ liệu từ state timeSlots thay vì gọi API
      if (timeSlots && Array.isArray(timeSlots)) {
        // Lọc các slot theo ngày được chọn
        const existingSlots = timeSlots.filter(
          (slot) => slot.slotDate === formattedDate
        );

        // Tạo Set chứa ID của các slot đã tồn tại
        const existingIds = new Set();
        existingSlots.forEach((slot) => {
          if (slot.timeSlotId) {
            existingIds.add(slot.timeSlotId);
          }
        });

        // Cập nhật state để vô hiệu hóa các slot đã tồn tại
        setExistingSlotIds(existingIds);

        // Log để debug
        console.log(
          `Found ${existingIds.size} existing slots for ${formattedDate}`
        );
      }
    } else {
      // Reset nếu không có ngày được chọn
      setExistingSlotIds(new Set());
    }
  };

  // Toggle slot selection
  const toggleSlot = useCallback((slotId) => {
    setSelectedSlots((prev) =>
      prev.includes(slotId)
        ? prev.filter((id) => id !== slotId)
        : [...prev, slotId]
    );
  }, []);

  // Select all slots in a period
  const selectAllInPeriod = useCallback(
    (period) => {
      const periodLower = period.toLowerCase();
      const periodSlotIds = slotsByPeriod[periodLower]
        .filter((slot) => !existingSlotIds.has(slot.slotId))
        .map((slot) => slot.slotId);

      // Check if all available slots in this period are already selected
      const allSelected = periodSlotIds.every((id) =>
        selectedSlots.includes(id)
      );

      if (allSelected) {
        // Deselect all slots in this period
        setSelectedSlots((prev) =>
          prev.filter((id) => !periodSlotIds.includes(id))
        );
      } else {
        // Select all available slots in this period
        const newSelectedSlots = [...selectedSlots];
        periodSlotIds.forEach((id) => {
          if (!newSelectedSlots.includes(id)) {
            newSelectedSlots.push(id);
          }
        });
        setSelectedSlots(newSelectedSlots);
      }
    },
    [slotsByPeriod, selectedSlots, existingSlotIds]
  );

  // Submit handler
  const handleSubmit = useCallback(async () => {
    if (!selectedDate || selectedSlots.length === 0) {
      notification.error({
        message: "Validation Error",
        description: "Please select a date and at least one time slot",
      });
      return;
    }

    setSubmitting(true);
    try {
      await createTimeSlot(user.psychologistId, {
        slotDate: selectedDate.format("YYYY-MM-DD"),
        defaultSlotIds: selectedSlots,
      });

      notification.success({
        message: "Success",
        description: "Work schedule created successfully",
      });

      // Refresh created time slots
      fetchCreatedTimeSlots(selectedDate);

      // Reset form
      setSelectedSlots([]);
      setIsModalVisible(false);
    } catch (error) {
      notification.error({
        message: "Error",
        description: error.message || "Failed to create work schedule",
      });
    } finally {
      setSubmitting(false);
    }
  }, [
    selectedDate,
    selectedSlots,
    createTimeSlot,
    user?.userId,
    fetchCreatedTimeSlots,
  ]);

  // Check if all slots in a period are selected
  const isAllPeriodSelected = useCallback(
    (period) => {
      const periodLower = period.toLowerCase();
      // Chỉ xem xét các slot chưa được tạo
      const availableSlots = slotsByPeriod[periodLower]?.filter(
        (slot) => !existingSlotIds.has(slot.slotId)
      );

      if (!availableSlots?.length) return false;

      return availableSlots.every((slot) =>
        selectedSlots.includes(slot.slotId)
      );
    },
    [slotsByPeriod, selectedSlots, existingSlotIds]
  );

  // Reset modal state when opening
  const showModal = useCallback(() => {
    setSelectedSlots([]);
    setSelectedDate(dayjs());
    setActiveTab("morning");
    setExistingSlotIds(new Set()); // Reset existing slot IDs
    setIsModalVisible(true);

    const formattedDate = dayjs().format("YYYY-MM-DD");

    const existingSlots = createdTimeSlots[formattedDate] || [];

    const existingIds = new Set();

    existingSlots.forEach((slot) => {
      if (slot.timeSlotId) {
        existingIds.add(slot.timeSlotId);
      }
    });

    setExistingSlotIds(existingIds);

    console.log(
      `Found ${existingIds.size} existing slots for ${formattedDate} when opening modal`
    );
  }, [createdTimeSlots]); // Thay đổi dependency từ timeSlots sang createdTimeSlots

  // Count of available slots by period (slots that are not already created)
  const availableCountByPeriod = useMemo(() => {
    return Object.entries(slotsByPeriod).reduce((acc, [period, slots]) => {
      if (!slots) {
        acc[period] = 0;
        return acc;
      }

      acc[period] = slots.filter(
        (slot) => !existingSlotIds.has(slot.slotId)
      ).length;
      return acc;
    }, {});
  }, [slotsByPeriod, existingSlotIds]);

  // Calendar date cell renderer
  const dateCellRender = useCallback(
    (date) => {
      const dateStr = date.format("YYYY-MM-DD");
      const slots = createdTimeSlots[dateStr] || [];

      if (slots.length === 0) return null;

      // Đếm tổng số slots
      const totalSlots = slots.length;

      return (
        <div className="calendar-slots text-center">
          <Badge count={totalSlots} overflowCount={99} />
        </div>
      );
    },
    [createdTimeSlots]
  );

  // Handle calendar panel change
  const handlePanelChange = useCallback(
    (date, mode) => {
      setCalendarView(mode);
      fetchCreatedTimeSlots(date);
    },
    [fetchCreatedTimeSlots]
  );

  // Group time slots by period for the selected date
  const selectedDateSlots = useMemo(() => {
    const dateStr = selectedDate.format("YYYY-MM-DD");
    const slots = createdTimeSlots[dateStr] || [];

    return slots.reduce((acc, slot) => {
      const hour = parseInt(slot.startTime.split(":")[0], 10);
      let period;
      if (hour < 12) period = "Morning";
      else if (hour < 17) period = "Afternoon";
      else period = "Evening";

      if (!acc[period]) acc[period] = [];
      acc[period].push(slot);
      return acc;
    }, {});
  }, [selectedDate, createdTimeSlots]);

  // Table columns for time slots
  const columns = useMemo(
    () => [
      {
        title: "Time",
        dataIndex: "time",
        key: "time",
        width: "30%",
        render: (_, record) =>
          `${dayjs(record.startTime, "HH:mm:ss").format("HH:mm")} - ${dayjs(
            record.endTime,
            "HH:mm:ss"
          ).format("HH:mm")}`,
      },
      {
        title: "Status",
        dataIndex: "status",
        key: "status",
        width: "20%",
        render: (status) => (
          <Badge
            status={status === "AVAILABLE" ? "success" : "default"}
            text={status}
          />
        ),
      },
      {
        title: "Bookings",
        dataIndex: "bookings",
        key: "bookings",
        width: "20%",
        render: (_, record) => (
          <Text>
            {record.currentBookings}/{record.maxCapacity}
          </Text>
        ),
      },
    ],
    []
  );

  return (
    <div className="p-6 general-wrapper">
      <Card className="mb-6">
        <div className="flex justify-between items-center mb-4">
          <Title level={4}>
            <CalendarOutlined className="mr-2" />
            Work Schedule Management
          </Title>
          <Button type="primary" icon={<PlusOutlined />} onClick={showModal}>
            Create Schedule
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Calendar */}
          <div className="lg:col-span-1">
            <Card className="h-full">
              <Calendar
                fullscreen={false}
                onSelect={handleCalendarSelect}
                onPanelChange={handlePanelChange}
                cellRender={dateCellRender}
                value={selectedDate}
                mode={calendarView}
                disabledDate={(current) => current.isBefore(dayjs(), "day")}
              />
            </Card>
          </div>

          {/* Time Slots for Selected Date */}
          <div className="lg:col-span-2">
            <Card
              title={
                <Space>
                  <ClockCircleOutlined />
                  <span>
                    Time Slots for {selectedDate.format("MMMM D, YYYY")}
                  </span>
                </Space>
              }
              className="h-full">
              {loadingTimeSlots ? (
                <div className="flex justify-center items-center h-64">
                  <Spin size="large" />
                </div>
              ) : Object.keys(selectedDateSlots).length === 0 ? (
                <Empty description="No time slots created for this date" />
              ) : (
                <Tabs defaultActiveKey="Morning" type="card">
                  {Object.entries(selectedDateSlots).map(([period, slots]) => (
                    <Tabs.TabPane
                      tab={`${period} (${slots.length})`}
                      key={period}>
                      <Table
                        dataSource={slots}
                        columns={columns}
                        rowKey="timeSlotId"
                        pagination={false}
                        size="middle"
                      />
                    </Tabs.TabPane>
                  ))}
                </Tabs>
              )}
            </Card>
          </div>
        </div>
      </Card>

      {/* Create Schedule Modal with optimized UI */}
      <Modal
        title="Create Work Schedule"
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        width={700}
        footer={[
          <Button key="cancel" onClick={() => setIsModalVisible(false)}>
            Cancel
          </Button>,
          <Button
            key="submit"
            type="primary"
            loading={submitting}
            disabled={selectedSlots.length === 0}
            onClick={handleSubmit}>
            Create Schedule
          </Button>,
        ]}>
        <Form layout="vertical">
          <Form.Item label="Select Date" required className="mb-4">
            <DatePicker
              value={selectedDate}
              onChange={handleDateChange}
              className="w-full"
              disabledDate={(date) => date.isBefore(dayjs(), "day")}
            />
          </Form.Item>

          <Divider className="my-4">Select Time Slots</Divider>

          {/* Selected slots summary */}
          <div className="mb-4 bg-gray-50 p-3 rounded-md">
            <div className="flex justify-between items-center">
              <Text strong>Selected:</Text>
              <Text>
                <span className="text-primary font-medium">
                  {selectedSlots.length}
                </span>{" "}
                time slots
              </Text>
            </div>
            <div className="flex mt-2 text-xs">
              {Object.entries(availableCountByPeriod).map(
                ([period, count]) =>
                  slotsByPeriod[period].length > 0 && (
                    <div key={period} className="mr-4">
                      <Text type="secondary">
                        {period.charAt(0).toUpperCase() + period.slice(1)}:
                        <span className="ml-1 text-primary">
                          {count}/{slotsByPeriod[period].length}
                        </span>
                      </Text>
                    </div>
                  )
              )}
            </div>
          </div>

          {/* Tabs for different periods */}
          <Tabs
            activeKey={activeTab}
            onChange={setActiveTab}
            type="card"
            className="time-slots-tabs">
            {Object.entries(slotsByPeriod).map(
              ([period, slots]) =>
                slots.length > 0 && (
                  <Tabs.TabPane
                    tab={`${
                      period.charAt(0).toUpperCase() + period.slice(1)
                    } (${slots.length})`}
                    key={period}>
                    <div className="mb-3 flex justify-between items-center">
                      <Button
                        type="link"
                        onClick={() => selectAllInPeriod(period)}
                        icon={<CheckCircleOutlined />}>
                        {isAllPeriodSelected(period)
                          ? "Deselect All"
                          : "Select All"}
                      </Button>
                      <Text type="secondary">
                        {availableCountByPeriod[period]}/{slots.length} selected
                      </Text>
                    </div>

                    <div className="time-slots-grid">
                      {slots.length > 0 ? (
                        <div className="max-h-60 overflow-y-auto pr-2">
                          {slots.map((slot) => {
                            {
                              /* console.log("Checking slot:", slot.slotId);
                            console.log("ExistingSlotIds:", [
                              ...existingSlotIds,
                            ]); */
                            }

                            let isDisabled = false;
                            existingSlotIds.forEach((id) => {
                              if (id.includes(slot.slotId)) {
                                isDisabled = true;
                              }
                            });

                            return (
                              <TimeSlotItem
                                key={slot.slotId}
                                slot={slot}
                                date={selectedDate.format("YYYY-MM-DD")}
                                isSelected={selectedSlots.includes(slot.slotId)}
                                onToggle={toggleSlot}
                                isDisabled={isDisabled}
                              />
                            );
                          })}
                        </div>
                      ) : (
                        <Empty description={`No ${period} slots available`} />
                      )}
                    </div>
                  </Tabs.TabPane>
                )
            )}
          </Tabs>
        </Form>
      </Modal>
    </div>
  );
};

export default WorkSchedule;

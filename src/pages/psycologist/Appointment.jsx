import { Badge, Button, Flex, message, Popover, Select, Spin, Tag } from "antd";
import { useEffect, useState, useCallback, useMemo, memo } from "react";
import dayjs from "dayjs";
import PropTypes from "prop-types";
import {
  CarryOutOutlined,
  QuestionCircleOutlined,
  UserOutlined,
} from "@ant-design/icons";
import CustomCalendar from "../../components/CalendarComponent";
import { formatAppointmentDate } from "../../utils/Helper";
import DetailCalendar from "../DetailCalendar";
import { months } from "../../constants/calendar";
import { useUserStore } from "../../stores/userStore";
import { useAuthStore } from "../../stores/authStore";
import "../../style/calendar.css";

// Memoized legend content component
const LegendContent = memo(() => (
  <>
    <div className="space-y-3 min-w-[120px]">
      <p className="w-5/6 flex justify-between">
        Program
        <Badge color="blue" />
      </p>
    </div>
    <div className="space-y-3">
      <p className="w-5/6 flex justify-between">
        Appointment
        <Badge color="volcano" />
      </p>
    </div>
  </>
));

LegendContent.displayName = "LegendContent";

// Memoized appointment tag component
const AppointmentTag = memo(({ item }) => (
  <Tag
    key={item.appointmentId}
    color="volcano"
    className="text-sm w-fit"
    icon={<UserOutlined />}>
    {item.startTime + " - " + (item?.psychologistName || item?.studentName)}
  </Tag>
));

AppointmentTag.displayName = "AppointmentTag";
AppointmentTag.propTypes = {
  item: PropTypes.shape({
    appointmentId: PropTypes.string,
    startTime: PropTypes.string.isRequired,
    psychologistName: PropTypes.string,
    studentName: PropTypes.string,
  }).isRequired,
};

// Memoized program tag component
const ProgramTag = memo(({ item }) => (
  <Tag
    key={item.programId}
    color="blue"
    className="text-sm w-fit"
    icon={<CarryOutOutlined />}>
    {item.title + " - " + item.type}
  </Tag>
));

ProgramTag.displayName = "ProgramTag";
ProgramTag.propTypes = {
  item: PropTypes.shape({
    programId: PropTypes.string,
    title: PropTypes.string.isRequired,
    type: PropTypes.string.isRequired,
  }).isRequired,
};

export default function Appointment() {
  const [selectedDate, setSelectedDate] = useState(dayjs());
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedDateDetails, setSelectedDateDetails] = useState(null);
  const [events, setEvents] = useState({});
  const { user } = useAuthStore();
  const { loading, getUserEvents } = useUserStore();

  // Memoize the current date to avoid unnecessary recalculations
  const today = useMemo(() => dayjs(), []);

  // Memoize year options to avoid recalculation on each render
  const yearOptions = useMemo(() => {
    const currentYear = today.year();
    return Array.from({ length: 2 }, (_, index) => ({
      label: String(currentYear + index),
      value: currentYear + index,
    }));
  }, [today]);

  // Memoize the sort function to avoid recreating it on each render
  const sortAppointmentsByTime = useCallback((appointments) => {
    if (!Array.isArray(appointments) || appointments.length === 0) {
      return [];
    }

    // Filter appointments with status Scheduled or In Progress
    return appointments
      .filter(
        (appt) => appt.status === "SCHEDULED" || appt.status === "IN_PROGRESS"
      )
      .sort((a, b) => {
        // Compare start times first
        const timeComparison = a.startTime.localeCompare(b.startTime);
        if (timeComparison !== 0) return timeComparison;

        // If times are the same, sort by appointmentID for consistency
        return a.appointmentID.localeCompare(b.appointmentID);
      });
  }, []);

  // Optimize the fetch data function with useCallback
  const fetchData = useCallback(async () => {
    if (!user?.userId) return;

    try {
      // Pass the user role to the getUserEvents function
      const data = await getUserEvents();
      const eventList = data.event || {};

      // Process events only if there's data to process
      if (Object.keys(eventList).length > 0) {
        // Use a more efficient approach to process the events
        const sortedAppointments = {};

        Object.entries(eventList).forEach(([key, event]) => {
          sortedAppointments[key] = {
            ...event,
            appointment: sortAppointmentsByTime(event.appointment || []),
          };
        });

        setEvents(sortedAppointments);
      }
    } catch (error) {
      console.error("Failed to fetch events:", error);
      message.error("Failed to fetch events. Please try again later.");
    }
  }, [user?.userId, user?.role, getUserEvents, sortAppointmentsByTime]);

  // Add proper dependency array to useEffect
  useEffect(() => {
    fetchData();
    // Include all dependencies that the fetchData function uses
  }, [fetchData]);

  // Optimize the date cell render function with useCallback
  const dateCellRender = useCallback(
    (value) => {
      const dateKey = formatAppointmentDate(value);
      const appointments = events[dateKey]?.appointment || [];
      const programs = events[dateKey]?.program || [];

      // Skip rendering if there are no events for this date
      if (appointments.length === 0 && programs.length === 0) {
        return null;
      }

      return (
        <div
          className="pb-1 w-full max-h-[50px] space-y-1 overflow-y-auto"
          key={dateKey}
          onClick={() => handleDateClick(dateKey)}>
          {appointments.length > 0 &&
            appointments.map((item) => (
              <AppointmentTag key={item.appointmentId} item={item} />
            ))}

          {programs.length > 0 &&
            programs.map((item) => (
              <ProgramTag key={item.programId} item={item} />
            ))}
        </div>
      );
    },
    [events]
  );

  // Optimize event handlers with useCallback
  const handleDateClick = useCallback(
    (date) => {
      const eventList = events[date];
      if (eventList) {
        setSelectedDateDetails(eventList);
        setIsModalVisible(true);
      }
    },
    [events]
  );

  const handleModalClose = useCallback(() => {
    setIsModalVisible(false);
    setSelectedDateDetails(null);
  }, []);

  const onChange = useCallback((value) => {
    setSelectedDate(value);
  }, []);

  const handleDateChange = useCallback(
    (newDate) => {
      if (newDate.isBefore(today, "month")) {
        onChange(today);
        setSelectedDate(today);
      } else {
        onChange(newDate);
        setSelectedDate(newDate);
      }
    },
    [today, onChange]
  );

  // Memoize the header render function
  const headerRender = useCallback(
    ({ value, onChange }) => {
      return (
        <Flex justify="between" align="center" className="p-4">
          <div className="flex-1 justify-start">
            <Popover content={<LegendContent />} placement="leftTop">
              <Button
                variant="outlined"
                icon={<QuestionCircleOutlined />}
                className="border-none shadow-none text-gray-500 hover:text-[#668f0f] hover:bg-[#e8f5e9]"
              />
            </Popover>
          </div>
          <div className="flex flex-row gap-5">
            <Select
              value={value.month()}
              options={months.map((month) => ({
                ...month,
                disabled:
                  value.year() === today.year() && month.value < today.month(),
              }))}
              onChange={(newMonth) => {
                const now = value.clone().month(newMonth);
                handleDateChange(now);
              }}
              style={{ maxWidth: 120 }}
            />
            <Select
              value={value.year()}
              options={yearOptions.map((year) => ({
                ...year,
                disabled: year.value < today.year(),
              }))}
              onChange={(newYear) => {
                const now = value.clone().year(newYear);
                if (
                  now.year() === today.year() &&
                  now.month() < today.month()
                ) {
                  now.month(today.month());
                }
                handleDateChange(now);
              }}
              style={{ maxWidth: 120 }}
            />
            <Button
              onClick={() => {
                const newDate = selectedDate.subtract(1, "month");
                if (!newDate.isBefore(today, "day")) {
                  onChange(newDate);
                } else onChange(today);
              }}
              disabled={selectedDate.isSame(today, "month")}>
              Previous
            </Button>
            <Button
              onClick={() => {
                const newDate = selectedDate.add(1, "month");
                setSelectedDate(newDate);
                onChange(newDate);
              }}
              disabled={selectedDate.isSame(
                today.add(1, "year").endOf("year"),
                "month"
              )}>
              Next
            </Button>
          </div>
        </Flex>
      );
    },
    [selectedDate, today, yearOptions, handleDateChange]
  );

  // Memoize the disabled date function
  const disabledDate = useCallback(
    (current) => {
      return (
        current.isBefore(today.subtract(1, "day")) ||
        current.isAfter(today.add(1, "year").endOf("year"))
      );
    },
    [today]
  );

  return (
    <div className="relative" id="calendar-container">
      {loading && (
        <div className="absolute inset-0 bg-white/70 z-50 flex justify-center items-center">
          <Spin size="large" />
        </div>
      )}
      <div className="general-wrapper pt-16 px-20 min-w-fit">
        <CustomCalendar
          mode="month"
          value={selectedDate}
          onChange={onChange}
          cellRender={dateCellRender}
          headerRender={headerRender}
          disabledDate={disabledDate}
        />
      </div>

      {isModalVisible && (
        <DetailCalendar
          user={user}
          events={selectedDateDetails}
          visible={isModalVisible}
          onClose={handleModalClose}
          fetchData={fetchData}
        />
      )}
    </div>
  );
}

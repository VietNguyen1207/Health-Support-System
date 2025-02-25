import { Badge, Button, Flex, message, Popover, Select, Spin, Tag } from "antd";
import { useEffect, useState } from "react";
import dayjs from "dayjs";
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

export default function Appointment() {
  // const calendarRef = useRef(null);
  const [selectedDate, setSelectedDate] = useState(dayjs());
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedDateDetails, setSelectedDateDetails] = useState(null);
  const { loading, getEvents } = useUserStore();
  const [events, setEvents] = useState([]);
  const { user } = useAuthStore();

  const sortAppointmentsByTime = (appointments) => {
    if (!Array.isArray(appointments)) {
      return []; // Return an empty array if appointments is not an array
    }

    // Sort appointments by start time and status
    return appointments.sort((a, b) => {
      // Compare start times first
      const timeComparison = a.startTime.localeCompare(b.startTime);
      if (timeComparison !== 0) return timeComparison;

      // If start times are equal, prioritize SCHEDULED over COMPLETED
      if (a.status === "SCHEDULED" && b.status === "COMPLETED") return -1;
      if (a.status === "COMPLETED" && b.status === "SCHEDULED") return 1;

      // If both status are the same, sort by appointmentID for consistency
      return a.appointmentID.localeCompare(b.appointmentID);
    });
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getEvents(user.userId);
        const eventList = data.event || {}; // Ensure eventList is an object
        // console.log(eventList);

        // Sort and filter unique appointments by start time
        const sortedAppointments = Object.keys(eventList).reduce((acc, key) => {
          const event = eventList[key];
          acc[key] = {
            ...event,
            appointment: sortAppointmentsByTime(event.appointment || []), // Ensure appointment is an array
          };
          return acc;
        }, {});

        setEvents(sortedAppointments); // Update events with sorted appointments
      } catch (error) {
        console.log("Failed to fetch events: ", error);
        message.error("Failed to fetch events");
      }
    };

    fetchData();
  }, [user.userId]); // Added user.userId as a dependency

  const content = (
    <>
      <div className="space-y-3 min-w-[120px]">
        <p className="w-5/6 flex justify-between">
          Program
          {/* <CarryOutOutlined /> */}
          <Badge color="blue" />
        </p>
        {/* <div className="flex flex-row gap-2 items-center"></div> */}
      </div>
      {/* <Divider className="border-[#668f0f]" /> */}
      <div className="space-y-3">
        <p className="w-5/6 flex justify-between">
          Appointment
          {/* <UserOutlined /> */}
          <Badge color="volcano" />
        </p>
        {/* <div className="w-full h-full flex gap-3 justify-between">
          <Tag color="red">Morning</Tag>
          <Tag color="blue">Afternoon</Tag>
        </div> */}
      </div>
    </>
  );

  const dateCellRender = (value) => {
    const dateKey = formatAppointmentDate(value);
    const appointments = events[dateKey]?.appointment || [];
    const programs = events[dateKey]?.program || [];

    return (
      <div
        className="pb-1 w-full max-h-[50px] space-y-1 overflow-y-auto"
        key={dateKey}
        onClick={() => handleDateClick(dateKey)}>
        {/* <Tag
          // key={item.appointmentId}
          color={"volcano"}
          size="small"
          className="text-xs w-fit"
          icon={<UserOutlined />}>
          13:00 - Dr. John Doe
        </Tag> */}

        {appointments.length ? (
          /* <Badge color={"volcano"} count={appointments.length} /> */
          appointments.map((item) => (
            <>
              <Tag
                key={item.appointmentId}
                color={"volcano"}
                className="text-sm w-fit"
                icon={<UserOutlined />}>
                {item.startTime +
                  " - " +
                  (item?.psychologistName || item?.studentName)}
              </Tag>
            </>
          ))
        ) : (
          <></>
        )}

        {/* <Tag
          color={"blue"}
          className="text-xs w-fit"
          size="small"
          icon={<CarryOutOutlined />}>
          Stresssssssssssssssssssssssssss - Online
        </Tag> */}

        {programs.length ? (
          /* <Badge color="blue" count={programs.length} /> */
          programs.map((item) => (
            <Tag
              key={item.programId}
              color={"blue"}
              className="text-sm w-fit"
              icon={<CarryOutOutlined />}>
              {item.title + " - " + item.type}
            </Tag>
          ))
        ) : (
          <></>
        )}
      </div>
    );
  };

  const handleDateClick = (date) => {
    const eventList = events[date];

    if (eventList) {
      setSelectedDateDetails(eventList);
      setIsModalVisible(true);
    } else {
      console.error("No appointment data available");
    }
  };

  const handleModalClose = () => {
    setIsModalVisible(false);
    setSelectedDateDetails(null);
  };

  const handleDateChange = (newDate) => {
    if (newDate.isBefore(dayjs(), "month")) {
      onChange(dayjs());
      setSelectedDate(dayjs());
    } else {
      onChange(newDate);
      setSelectedDate(newDate);
    }
  };

  const headerRender = ({ value, onChange }) => {
    const currentYear = new Date().getFullYear();
    const years = Array.from({ length: 2 }, (_, index) => ({
      label: String(currentYear + index),
      value: currentYear + index,
    }));

    return (
      <Flex justify="between" align="center" className="p-4">
        <div className="flex-1 justify-start">
          <Popover content={content} placement="leftTop">
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
                value.year() === dayjs().year() &&
                month.value < dayjs().month(),
            }))}
            onChange={(newMonth) => {
              const now = value.clone().month(newMonth);
              handleDateChange(now);
            }}
            style={{ maxWidth: 120 }}
          />
          <Select
            value={value.year()}
            options={years.map((year) => ({
              ...year,
              disabled: year.value < dayjs().year(),
            }))}
            onChange={(newYear) => {
              const now = value.clone().year(newYear);
              if (
                now.year() === dayjs().year() &&
                now.month() < dayjs().month()
              ) {
                now.month(dayjs().month());
              }
              handleDateChange(now);
            }}
            style={{ maxWidth: 120 }}
          />
          <Button
            onClick={() => {
              const newDate = selectedDate.subtract(1, "month");
              if (!newDate.isBefore(dayjs(), "day")) {
                onChange(newDate);
              } else onChange(dayjs());
            }}
            disabled={selectedDate.isSame(dayjs(), "month")}>
            Previous
          </Button>
          <Button
            onClick={() => {
              const newDate = selectedDate.add(1, "month");
              setSelectedDate(newDate);
              onChange(newDate);
            }}
            disabled={selectedDate.isSame(
              dayjs().add(1, "year").endOf("year"),
              "month"
            )}>
            Next
          </Button>
        </div>
      </Flex>
    );
  };

  const onChange = (value) => {
    setSelectedDate(value);
  };

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
          // onSelect={handleDateClick}
          cellRender={dateCellRender}
          headerRender={headerRender}
          disabledDate={(current) => {
            return (
              current.isBefore(dayjs().subtract(1, "day")) ||
              current.isAfter(dayjs().add(1, "year").endOf("year"))
            );
          }}
        />
      </div>

      <DetailCalendar
        events={selectedDateDetails}
        visible={isModalVisible}
        onClose={handleModalClose}
      />
    </div>
  );
}

import {
  Button,
  ConfigProvider,
  Divider,
  Flex,
  message,
  Popover,
  Select,
  Tag,
} from "antd";
import { useMemo, useState } from "react";
import bookingData from "../../data/booking.json";
import dayjs from "dayjs";
import {
  AimOutlined,
  PhoneOutlined,
  QuestionCircleOutlined,
  UserOutlined,
} from "@ant-design/icons";
import CustomCalendar from "../../components/CustomCalendar";
import { formatAppointmentDate } from "../../utils/Helper";

export default function Appointment() {
  // const calendarRef = useRef(null);
  const [selectedDate, setSelectedDate] = useState(dayjs());
  const [indexAppointment, setIndexAppointment] = useState(0);

  const content = (
    <>
      <div className="flex-1 flex gap-3 justify-center">
        <Tag color="red">Morning</Tag>
        <Tag color="blue">Afternoon</Tag>
      </div>
      <Divider className="border-[#668f0f]" />
      <div className="flex-1 flex gap-3 text-base text-gray-600 justify-center pb-4">
        <div className="flex flex-row gap-2 items-center">
          <UserOutlined />
          <span className="text-sm">Offline</span>
        </div>
        <div className="flex flex-row gap-2 items-center">
          <PhoneOutlined />
          <span className="text-sm">Online</span>
        </div>
      </div>
    </>
  );

  const eventData = useMemo(() => {
    const events = {};
    let type;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    bookingData.appointments.forEach((appointment) => {
      const date = new Date(appointment.timeSlot.slotDate);
      if (date >= today) {
        const dateKey = date.toISOString().split("T")[0];
        const appointmentStatus = appointment.status;

        if (!events[dateKey]) {
          events[dateKey] = [];
        }

        const timeHour = parseInt(appointment.timeSlot.time.split(":")[0]);

        if (timeHour >= 7 && timeHour <= 11) {
          type = "red";
        } else if (timeHour >= 13) {
          type = "blue";
        }

        appointmentStatus === "confirmed" &&
          events[dateKey].push({
            type: type,
            content: `${appointment.timeSlot.time} - ${appointment.studentID.name}`,
            appointment,
            timeHour,
          });
      }
    });

    Object.keys(events).forEach((dateKey) => {
      events[dateKey].sort((a, b) => a.timeHour - b.timeHour);
    });

    const sortedEvents = Object.keys(events)
      .sort((a, b) => new Date(a) - new Date(b))
      .reduce((obj, key) => {
        obj[key] = events[key];
        return obj;
      }, {});

    return sortedEvents;
  }, []);

  const getListData = (value) => {
    const dateKey = formatAppointmentDate(value);
    return eventData[dateKey] || [];
  };

  const dateCellRender = (value) => {
    const listData = getListData(value);

    return (
      <ul className="w-full flex flex-col gap-2 justify-start">
        {listData.map((item) => {
          return (
            <li key={item.content}>
              <Tag
                color={item.type}
                className="text-sm"
                icon={
                  item.appointment.appointmentType === "online" ? (
                    <PhoneOutlined />
                  ) : (
                    <UserOutlined />
                  )
                }>
                {item.content}
              </Tag>
            </li>
          );
        })}
      </ul>
    );
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

    const currentYear = new Date().getFullYear();
    const years = Array.from({ length: 3 }, (_, index) => ({
      label: String(currentYear + index),
      value: currentYear + index,
    }));

    return (
      <Flex justify="between" align="center" className="p-4">
        <div className="flex-1 justify-start">
          <Popover content={content} title="Annotation" placement="leftTop">
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
            options={months}
            onChange={(newMonth) => {
              const now = value.clone().month(newMonth);
              onChange(now);
            }}
            style={{ width: 120 }}
          />
          <Select
            value={value.year()}
            options={years}
            onChange={(newYear) => {
              const now = value.clone().year(newYear);
              onChange(now);
            }}
            style={{ width: 120 }}
          />
          <Button
            onClick={findPreviousAppointment}
            disabled={indexAppointment === 0}>
            Previous
          </Button>
          <Button onClick={resetSelectedDate} icon={<AimOutlined />} />
          <Button
            onClick={findNextAppointment}
            disabled={indexAppointment === Object.keys(eventData).length - 1}>
            Next
          </Button>
        </div>
      </Flex>
    );
  };

  const onChange = (value) => {
    const dates = Object.keys(eventData);
    const formatValue = formatAppointmentDate(value);
    const isBefore = dates.some((date) => date > formatValue);
    const isAfter = dates.some((date) => date < formatValue);

    const currentIndex = dates.findIndex((date) => date === formatValue);

    if (currentIndex !== -1) {
      // console.log("currentIndex: ", currentIndex);
      setIndexAppointment(currentIndex);
    } else if (isBefore && isAfter) {
      // console.log("between: ", dates.length);
      setIndexAppointment(dates.length);
    } else if (isBefore) {
      console.log("before:", 0);
      setIndexAppointment(0);
    } else if (isAfter) {
      // console.log("after:", dates.length - 1);
      setIndexAppointment(dates.length - 1);
    }
    setSelectedDate(value);
  };

  const findNextAppointment = () => {
    if (Object.keys(eventData).length === 0) {
      message.info("No appointment found");
      return;
    }

    const dates = Object.keys(eventData);
    const currentDate = formatAppointmentDate(selectedDate);
    const nextIndex = dates.findIndex((date) => date > currentDate);

    if (nextIndex === -1) {
      message.info("No next appointment found");
      return;
    }

    setIndexAppointment(nextIndex);
    setSelectedDate(dayjs(dates[nextIndex]));
  };

  const findPreviousAppointment = () => {
    // console.log(eventData);

    if (Object.keys(eventData).length === 0) {
      message.info("No appointment found");
      return;
    }

    const dates = Object.keys(eventData);
    const currentDate = formatAppointmentDate(selectedDate);
    const prevIndex = dates.findLastIndex((date) => date < currentDate);

    if (prevIndex === -1) {
      message.info("No previous appointment found");
      return;
    }

    setIndexAppointment(prevIndex);
    setSelectedDate(dayjs(dates[prevIndex]));
  };

  const resetSelectedDate = () => {
    setSelectedDate(dayjs());
    setIndexAppointment(0);
  };

  return (
    <ConfigProvider
      theme={{
        components: {
          Calendar: {
            itemActiveBg: "#e8f5e9",
          },
        },
      }}>
      <div className="general-wrapper pt-16 mx-20">
        <CustomCalendar
          mode="month"
          value={selectedDate}
          onChange={onChange}
          cellRender={dateCellRender}
          headerRender={headerRender}
          disabledDate={(current) => {
            return (
              current.isBefore(dayjs().subtract(1, "day")) &&
              current.isAfter(dayjs().subtract(1, "year"))
            );
          }}
        />
      </div>
    </ConfigProvider>
  );
}

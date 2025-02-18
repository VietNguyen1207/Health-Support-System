import { Button, Divider, Flex, Popover, Select, Tag } from "antd";
import { useMemo, useState } from "react";
import AppointmentData from "../../data/appointments.json";
import dayjs from "dayjs";
import {
  AudioOutlined,
  QuestionCircleOutlined,
  UserOutlined,
} from "@ant-design/icons";
import CustomCalendar from "../../components/CalendarComponent";
import { formatAppointmentDate } from "../../utils/Helper";
import DetailCalendar from "../DetailCalendar";
import { months } from "../../constants/calendar";

export default function Appointment() {
  // const calendarRef = useRef(null);
  const [selectedDate, setSelectedDate] = useState(dayjs());
  const [nextDate, setNextDate] = useState(dayjs());
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedDateDetails, setSelectedDateDetails] = useState(null);

  const content = (
    <>
      <div className="space-y-3">
        <p className="font-semibold w-4/5 flex justify-between">
          Appointment
          <UserOutlined />
        </p>
        <div className="w-full flex gap-3 justify-between">
          <Tag color="red">Morning</Tag>
          <Tag color="blue">Afternoon</Tag>
        </div>
      </div>
      <Divider className="border-[#668f0f]" />
      <div className="space-y-3">
        <p className="font-semibold w-4/5 flex justify-between">
          Program
          <AudioOutlined />
        </p>
        <div className="flex flex-row gap-2 items-center"></div>
      </div>
    </>
  );

  const eventData = useMemo(() => {
    const events = {};
    let type;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    AppointmentData.appointments.forEach((appointment) => {
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
      <ul className="w-full h-full flex flex-col gap-2 justify-start">
        {listData.map((item) => {
          return (
            <li key={item.content}>
              <Tag
                color={item.type}
                className="text-sm"
                icon={<UserOutlined />}>
                {item.content}
              </Tag>
            </li>
          );
        })}
      </ul>
    );
  };

  const handleAppointmentClick = (date) => {
    const formattedDate = formatAppointmentDate(date);

    const appointment = formattedDate;

    if (appointment) {
      // setSelectedDateDetails(appointment);
      // setIsModalVisible(true);
    } else {
      console.error("No appointment data available");
    }
  };

  const handleModalClose = () => {
    setIsModalVisible(false);
    setSelectedDateDetails(null);
  };

  const headerRender = ({ value, onChange }) => {
    const currentYear = new Date().getFullYear();
    const years = Array.from({ length: 3 }, (_, index) => ({
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
            onClick={() => {
              const newDate = selectedDate.subtract(1, "month");
              setNextDate(newDate);
              if (!newDate.isBefore(dayjs(), "month")) {
                onChange(newDate);
              }
            }}
            disabled={nextDate.isSame(selectedDate, "month")}>
            Previous
          </Button>
          <Button
            onClick={() => {
              const newDate = selectedDate.add(1, "month");
              setSelectedDate(newDate);
              onChange(newDate);
            }}>
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
    <>
      <div className="general-wrapper pt-16 mx-20">
        <CustomCalendar
          mode="month"
          value={selectedDate}
          onChange={onChange}
          onSelect={(details) => handleAppointmentClick(details)}
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

      <DetailCalendar
        appointment={selectedDateDetails}
        visible={isModalVisible}
        onClose={handleModalClose}
      />
    </>
  );
}

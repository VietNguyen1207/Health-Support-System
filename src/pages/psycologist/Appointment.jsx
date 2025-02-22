import {
  Button,
  Divider,
  Flex,
  message,
  Popover,
  Select,
  Spin,
  Tag,
} from "antd";
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

export default function Appointment() {
  // const calendarRef = useRef(null);
  const [selectedDate, setSelectedDate] = useState(dayjs());
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedDateDetails, setSelectedDateDetails] = useState(null);
  const { loading, getEvents } = useUserStore();
  const [events, setEvents] = useState([]);
  const { user } = useAuthStore();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getEvents(user.userId);
        const eventList = data.event;
        setEvents(eventList);
      } catch (error) {
        console.log("Falied to fetch events: ", error);
        message.error("Failed to fetch events");
      }
    };

    fetchData();
  }, []);

  const content = (
    <>
      <div className="space-y-3">
        <p className="font-semibold w-4/5 flex justify-between">
          Appointment
          <UserOutlined />
        </p>
        <div className="w-full h-full flex gap-3 justify-between">
          <Tag color="red">Morning</Tag>
          <Tag color="blue">Afternoon</Tag>
        </div>
      </div>
      <Divider className="border-[#668f0f]" />
      <div className="space-y-3">
        <p className="font-semibold w-4/5 flex justify-between">
          Program
          <CarryOutOutlined />
        </p>
        <div className="flex flex-row gap-2 items-center"></div>
      </div>
    </>
  );

  const dateCellRender = (value) => {
    const dateKey = formatAppointmentDate(value);

    const appointments = events[dateKey]?.appointment || [];

    const programs = events[dateKey]?.program || [];

    return (
      <div
        className="flex flex-col gap-2 py-2 overflow-y-clip"
        key={dateKey}
        onClick={() => handleDateClick(dateKey)}>
        {appointments.length ? (
          appointments.map((item) => (
            <Tag
              key={item.appointmentId}
              color={"volcano"}
              className="text-sm w-fit"
              icon={<UserOutlined />}>
              {item.startTime + " - " + item.psychologistName}
            </Tag>
          ))
        ) : (
          <></>
        )}

        {programs.length ? (
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
    <div className="relative">
      {loading && (
        <div className="absolute inset-0 bg-white/70 z-50 flex justify-center items-center">
          <Spin size="large" />
        </div>
      )}
      <div className="general-wrapper pt-16 mx-20">
        <CustomCalendar
          mode="month"
          value={selectedDate}
          onChange={onChange}
          // onSelect={handleDateClick}
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
        events={selectedDateDetails}
        visible={isModalVisible}
        onClose={handleModalClose}
      />
    </div>
  );
}

import { Calendar, ConfigProvider, Flex, Select, Tag } from "antd";
import { useMemo } from "react";
import bookingData from "../../data/booking.json";
import moment from "moment";
import { PhoneOutlined, UserOutlined } from "@ant-design/icons";

export default function Appointment() {
  const eventData = useMemo(() => {
    const events = {};
    let type;

    bookingData.appointments.forEach((appointment) => {
      const date = new Date(appointment.timeSlot.slotDate);
      const dateKey = date.toISOString().split("T")[0];

      if (!events[dateKey]) {
        events[dateKey] = [];
      }

      // Chuyển đổi thời gian sang số để so sánh
      const timeHour = parseInt(appointment.timeSlot.time.split(":")[0]);

      // Simplify to only check time, regardless of status
      if (timeHour >= 7 && timeHour <= 11) {
        type = "red"; // yellow for morning appointments
      } else if (timeHour >= 13) {
        type = "blue"; // blue for afternoon appointments
      }

      // Thêm appointment vào mảng của ngày
      events[dateKey].push({
        type: type,
        content: `${appointment.timeSlot.time} - ${appointment.studentID.name}`,
        timeSlotID: appointment.timeSlot.psychologist.psychologistID,
        appointmentID: appointment.appointmentID,
      });
    });

    return events;
  }, []);

  const getListData = (value) => {
    const dateKey = value.format("YYYY-MM-DD");
    return eventData[dateKey] || [];
  };

  const dateCellRender = (value) => {
    const listData = getListData(value);
    return (
      <ul className="w-full flex flex-col gap-2 justify-start">
        {listData.map((item) => (
          <li key={item.content}>
            <Tag
              color={item.type}
              className="text-sm"
              icon={
                item.appointmentType !== "online" ? (
                  <PhoneOutlined />
                ) : (
                  <UserOutlined />
                )
              }>
              {item.content}
            </Tag>
          </li>
        ))}
      </ul>
    );
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
        <Calendar
          mode="month"
          cellRender={dateCellRender}
          className="rounded-lg border-2 px-3"
          disabledDate={(current) => {
            return (
              current.isBefore(moment().subtract(1, "day")) &&
              current.isAfter(moment().subtract(1, "year"))
            );
          }}
          headerRender={({ value, onChange }) => {
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
              <Flex justify="end" gap={10} className="p-4">
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
              </Flex>
            );
          }}
        />
      </div>
    </ConfigProvider>
  );
}

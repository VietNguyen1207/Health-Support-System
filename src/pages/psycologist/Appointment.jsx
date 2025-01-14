import { Badge, Calendar } from "antd";
import { useMemo } from "react";

export default function Appointment() {
  const eventData = useMemo(
    () => ({
      15: [
        {
          type: "success",
          content: "9:00 AM - Available",
          timeSlotID: "TS001",
        },
        {
          type: "warning",
          content: "10:00 AM - Booked",
          timeSlotID: "TS002",
          appointmentID: "APT001",
        },
      ],
      16: [
        {
          type: "processing",
          content: "9:00 AM - Pending",
          timeSlotID: "TS003",
          appointmentID: "APT002",
        },
      ],
    }),
    []
  );

  const getListData = (value) => {
    const date = value.date();
    return eventData[date] || [];
  };

  const getMonthData = (value) => {
    if (value.month() === 8) {
      return 1394;
    }
  };

  const monthCellRender = (value) => {
    console.log(value.date());

    const num = getMonthData(value);
    return num ? (
      <div className={`${value.date() ? "bg-[#2F7A39]" : ""}`}></div>
    ) : null;
  };

  const dateCellRender = (value) => {
    const listData = getListData(value);
    return (
      <ul className="events">
        {listData.map((item) => (
          <li key={item.content}>
            <Badge status={item.type} text={item.content} />
          </li>
        ))}
      </ul>
    );
  };

  const cellRender = (current, info) => {
    if (info.type === "date") return dateCellRender(current);
    if (info.type === "month") return monthCellRender(current);
    return info.originNode;
  };

  return (
    <div className="general-wrapper pt-16 mx-20">
      <Calendar
        cellRender={cellRender}
        className="rounded-lg"
        fullscreen={false}
      />
    </div>
  );
}

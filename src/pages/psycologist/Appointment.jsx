import { Badge, Calendar } from "antd";
import { useMemo } from "react";
import bookingData from "../../data/booking.json";

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
        type = "error"; // yellow for morning appointments
      } else if (timeHour >= 13) {
        type = "processing"; // blue for afternoon appointments
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

  const getMonthData = (value) => {
    if (value.month() === 8) {
      return 1394;
    }
  };

  const monthCellRender = (value) => {
    console.log(value.date());

    const num = getMonthData(value);
    return num ? <div></div> : null;
  };

  const dateCellRender = (value) => {
    const listData = getListData(value);
    return (
      <ul className="events">
        {listData.map((item) => (
          <li key={item.content} className="flex justify-center">
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
        className="rounded-lg border-2 px-3"
        // fullscreen={false}
      />
    </div>
  );
}

import { Calendar } from "antd";
import dayjs from "dayjs";
import PropTypes from "prop-types";

function CustomCalendar({
  mode = "month",
  className = "rounded-lg border-2 px-3",
  onSelect,
  ...props
}) {
  return (
    <Calendar
      {...props}
      defaultValue={dayjs()}
      className={className}
      mode={mode}
      onSelect={onSelect}
    />
  );
}

CustomCalendar.propTypes = {
  mode: PropTypes.oneOf(["month", "year"]), // Specify allowed values for mode
  className: PropTypes.string,
  onSelect: PropTypes.func,
};

export default CustomCalendar;

import { Calendar } from "antd";
import moment from "moment";
import PropTypes from "prop-types";

function CustomCalendar({
  mode = "month",
  className = "rounded-lg border-2 px-3",
  ...props
}) {
  return (
    <Calendar
      {...props}
      className={className}
      mode={mode}
      disabledDate={(current) => {
        return (
          current.isBefore(moment().subtract(1, "day")) &&
          current.isAfter(moment().subtract(1, "year"))
        );
      }}
    />
  );
}

CustomCalendar.propTypes = {
  mode: PropTypes.oneOf(["month", "year"]), // Specify allowed values for mode
  className: PropTypes.string,
};

export default CustomCalendar;

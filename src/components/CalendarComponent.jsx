import { Calendar } from "antd";
import PropTypes from "prop-types";

function CustomCalendar({
  mode = "month",
  className = "rounded-lg border-2 px-3",
  ...props
}) {
  return <Calendar {...props} className={className} mode={mode} />;
}

CustomCalendar.propTypes = {
  mode: PropTypes.oneOf(["month", "year"]), // Specify allowed values for mode
  className: PropTypes.string,
};

export default CustomCalendar;

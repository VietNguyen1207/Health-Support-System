import { Modal, Typography } from "antd";
import PropTypes from "prop-types";

const { Text } = Typography;

function DetailCalendar({ appointment, visible, onClose }) {
  return (
    <Modal
      title="Appointment Details"
      open={visible}
      onCancel={onClose}
      footer={null}>
      {appointment ? (
        <div>
          <Text strong>Student Name:</Text> {appointment.studentID.name}
          <br />
          <Text strong>Appointment Type:</Text> {appointment.appointmentType}
          <br />
          <Text strong>Time:</Text> {appointment.timeSlot.time}
          <br />
          <Text strong>Date:</Text> {appointment.timeSlot.slotDate}
          <br />
          <Text strong>Status:</Text> {appointment.status}
          {/* Thêm các thông tin khác nếu cần */}
        </div>
      ) : (
        <Text>No appointment details available.</Text>
      )}
    </Modal>
  );
}

// Add prop types validation
DetailCalendar.propTypes = {
  appointment: PropTypes.shape({
    studentID: PropTypes.shape({
      name: PropTypes.string.isRequired,
    }).isRequired,
    appointmentType: PropTypes.string.isRequired,
    timeSlot: PropTypes.shape({
      time: PropTypes.string.isRequired,
      slotDate: PropTypes.string.isRequired,
    }).isRequired,
    status: PropTypes.string.isRequired,
  }),
  visible: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
};

export default DetailCalendar;

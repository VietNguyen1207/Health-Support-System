import { Modal, Descriptions, Tag, Card, Row, Col } from "antd";
import dayjs from "dayjs";
import PropTypes from "prop-types";

function AppointmentDetail({ open, onClose, appointmentData }) {
  if (!appointmentData) return null;

  const getStatusColor = (status) => {
    const colors = {
      SCHEDULED: "blue",
      COMPLETED: "green",
      CANCELLED: "red",
      IN_PROGRESS: "orange",
      default: "default",
    };
    return colors[status] || colors.default;
  };

  return (
    <Modal
      title="Appointment Details"
      open={open}
      onCancel={onClose}
      width={800}
      footer={null}>
      <div className="space-y-6">
        {/* Appointment Info */}
        <Card title="Appointment Information">
          <Descriptions column={2}>
            <Descriptions.Item label="Appointment ID">
              {appointmentData.appointmentID}
            </Descriptions.Item>
            <Descriptions.Item label="Status">
              <Tag color={getStatusColor(appointmentData.status)}>
                {appointmentData.status}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Date">
              {dayjs(appointmentData.createdAt).format("YYYY-MM-DD")}
            </Descriptions.Item>
            <Descriptions.Item label="Time">{`${appointmentData.startTime} - ${appointmentData.endTime}`}</Descriptions.Item>
            <Descriptions.Item label="Created At">
              {dayjs(appointmentData.createdAt).format("YYYY-MM-DD HH:mm:ss")}
            </Descriptions.Item>
            <Descriptions.Item label="Last Updated">
              {dayjs(appointmentData.updatedAt).format("YYYY-MM-DD HH:mm:ss")}
            </Descriptions.Item>
          </Descriptions>
        </Card>

        <Row gutter={16}>
          {/* Student Info */}
          <Col span={12}>
            <Card title="Student Information">
              <Descriptions column={1}>
                <Descriptions.Item label="Name">
                  {appointmentData.studentResponse.info.fullName}
                </Descriptions.Item>
                <Descriptions.Item label="ID">
                  {appointmentData.studentResponse.studentId}
                </Descriptions.Item>
                <Descriptions.Item label="Grade">
                  {appointmentData.studentResponse.grade}
                </Descriptions.Item>
                <Descriptions.Item label="Class">
                  {appointmentData.studentResponse.className}
                </Descriptions.Item>
                <Descriptions.Item label="School">
                  {appointmentData.studentResponse.schoolName}
                </Descriptions.Item>
                <Descriptions.Item label="Email">
                  {appointmentData.studentResponse.info.email}
                </Descriptions.Item>
                <Descriptions.Item label="Phone">
                  {appointmentData.studentResponse.info.phoneNumber}
                </Descriptions.Item>
              </Descriptions>
            </Card>
          </Col>

          {/* Psychologist Info */}
          <Col span={12}>
            <Card title="Psychologist Information">
              <Descriptions column={1}>
                <Descriptions.Item label="Name">
                  {appointmentData.psychologistResponse.info.fullName}
                </Descriptions.Item>
                <Descriptions.Item label="ID">
                  {appointmentData.psychologistResponse.psychologistId}
                </Descriptions.Item>
                <Descriptions.Item label="Department">
                  {appointmentData.psychologistResponse.departmentName}
                </Descriptions.Item>
                <Descriptions.Item label="Experience">
                  {appointmentData.psychologistResponse.yearsOfExperience} years
                </Descriptions.Item>
                <Descriptions.Item label="Email">
                  {appointmentData.psychologistResponse.info.email}
                </Descriptions.Item>
                <Descriptions.Item label="Phone">
                  {appointmentData.psychologistResponse.info.phoneNumber}
                </Descriptions.Item>
              </Descriptions>
            </Card>
          </Col>
        </Row>

        {/* Assessment Scores */}
        <Card title="Assessment Scores">
          <Descriptions column={3}>
            <Descriptions.Item label="Depression Score">
              {appointmentData.studentResponse.depressionScore}
            </Descriptions.Item>
            <Descriptions.Item label="Anxiety Score">
              {appointmentData.studentResponse.anxietyScore}
            </Descriptions.Item>
            <Descriptions.Item label="Stress Score">
              {appointmentData.studentResponse.stressScore}
            </Descriptions.Item>
          </Descriptions>
        </Card>
      </div>
    </Modal>
  );
}

AppointmentDetail.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  appointmentData: PropTypes.object.isRequired,
};

export default AppointmentDetail;

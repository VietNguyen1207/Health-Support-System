import { useState, useEffect, useCallback, useMemo } from "react";
import {
  Calendar,
  Badge,
  Spin,
  Typography,
  Card,
  Button,
  Empty,
  Divider,
  Tag,
  message,
  Modal,
  Row,
  Col,
  Alert,
  Select,
  Flex,
  Skeleton,
} from "antd";
import {
  CalendarOutlined,
  ClockCircleOutlined,
  TeamOutlined,
  InfoCircleOutlined,
  LinkOutlined,
  VideoCameraOutlined,
  ReloadOutlined,
} from "@ant-design/icons";
import { useParentStore } from "../../stores/parentStore";
import { useAuthStore } from "../../stores/authStore";
import dayjs from "dayjs";
import { months } from "../../constants/calendar";
// import { useNavigate } from "react-router-dom";

const { Title, Text } = Typography;

const ParentCalendar = () => {
  const { user } = useAuthStore();
  const { fetchParentEvents, events, eventsLoading, eventsError } =
    useParentStore();
  const [selectedDate, setSelectedDate] = useState(dayjs());
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [selectedEventType, setSelectedEventType] = useState(null); // "appointment" or "program"
  // const navigate = useNavigate();
  const today = useMemo(() => dayjs(), []);

  // Fetch events when the component mounts
  useEffect(() => {
    if (user?.userId) {
      fetchParentEvents().catch((error) => {
        console.error("Failed to fetch events:", error);
        message.error(
          "Failed to load calendar events. Please try again later."
        );
      });
    }
  }, [fetchParentEvents, user?.userId]);

  // Helper function to sort appointments by time
  const sortAppointmentsByTime = useCallback((appointments) => {
    return [...(appointments || [])].sort((a, b) => {
      return a.startTime.localeCompare(b.startTime);
    });
  }, []);

  // Function to get date cell content
  const dateCellRender = (value) => {
    const dateStr = value.format("YYYY-MM-DD");
    const dateEvents = events[dateStr];

    if (!dateEvents) return null;

    const appointments = dateEvents.appointment || [];
    const programs = dateEvents.program || [];

    const totalItems = appointments.length + programs.length;
    if (totalItems === 0) return null;

    // Get unique student names from both appointments and programs
    const studentSet = new Set();

    appointments.forEach((appointment) => {
      if (appointment.studentResponse?.fullName) {
        studentSet.add(appointment.studentResponse.fullName);
      }
    });

    programs.forEach((program) => {
      if (program.studentName) {
        studentSet.add(program.studentName);
      }
    });

    const studentNames = Array.from(studentSet);

    return (
      <div className="event-container">
        <div className="event-badges flex flex-wrap gap-1">
          {appointments.length > 0 && (
            <Badge
              count={appointments.length}
              style={{
                backgroundColor: "#4a7c59",
                marginRight: "2px",
              }}
              overflowCount={99}
              title={`${appointments.length} appointment(s)`}
            />
          )}
          {programs.length > 0 && (
            <Badge
              count={programs.length}
              style={{
                backgroundColor: "#1890ff",
              }}
              overflowCount={99}
              title={`${programs.length} program(s)`}
            />
          )}
        </div>

        {studentNames.length > 0 && (
          <div className="student-names text-xs mt-1 truncate">
            {studentNames.map((name, index) => (
              <span
                key={index}
                className="student-badge px-1 mr-1 rounded-sm text-white bg-opacity-90"
                style={{
                  backgroundColor: "rgba(245, 158, 11, 0.85)", // Amber/orange color that complements green and blue
                  display: "inline-block",
                  maxWidth: "100%",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
                title={name}>
                {name.split(" ")[0]}
              </span>
            ))}
          </div>
        )}
      </div>
    );
  };

  // Function to open event details modal
  const openEventDetails = (event, type) => {
    setSelectedEvent(event);
    setSelectedEventType(type);
    setModalVisible(true);
  };

  // Function to render appointment details in modal
  const renderAppointmentDetails = () => {
    if (!selectedEvent) return null;

    const appointment = selectedEvent;
    const appointmentDate = appointment.timeSlotID
      ? dayjs(
          appointment.timeSlotID.split("-")[2] +
            "-" +
            appointment.timeSlotID.split("-")[3] +
            "-" +
            appointment.timeSlotID.split("-")[4]
        )
      : dayjs();

    return (
      <div>
        <div className="flex flex-col space-y-4">
          <div className="flex items-center gap-2">
            <CalendarOutlined className="text-custom-green text-lg" />
            <Title level={4} style={{ margin: 0 }}>
              Appointment Details
            </Title>
          </div>

          <Card bordered className="bg-gray-50">
            <div className="flex flex-col md:flex-row md:items-start gap-4">
              <div className="md:w-1/3">
                <div className="bg-custom-green/10 p-3 rounded-lg mr-3 text-center inline-block">
                  <div className="text-custom-green font-bold text-xl">
                    {appointmentDate.format("DD")}
                  </div>
                  <div className="text-custom-green text-sm">
                    {appointmentDate.format("MMM YYYY")}
                  </div>
                </div>
                <div className="inline-block">
                  <div className="text-gray-900 font-medium">
                    {appointmentDate.format("dddd")}
                  </div>
                  <div className="flex items-center text-gray-500 text-sm">
                    <ClockCircleOutlined className="mr-1" />
                    {appointment.startTime} - {appointment.endTime}
                  </div>
                </div>
              </div>

              <Divider type="vertical" className="hidden md:block h-auto" />

              <div className="md:w-2/3">
                <div className="mb-3">
                  <Text type="secondary">Student:</Text>
                  <div className="font-medium">
                    {appointment.studentResponse?.fullName || "N/A"}
                  </div>
                </div>

                <div className="mb-3">
                  <Text type="secondary">Psychologist:</Text>
                  <div className="font-medium flex items-center gap-2">
                    {appointment.psychologistResponse?.name || "N/A"}
                    <Tag color="green">
                      {appointment.psychologistResponse?.status || "N/A"}
                    </Tag>
                  </div>
                  <div className="text-sm text-gray-500">
                    {appointment.psychologistResponse?.departmentName || "N/A"}{" "}
                    (
                    {appointment.psychologistResponse?.yearsOfExperience ||
                      "N/A"}{" "}
                    years experience)
                  </div>
                </div>

                <div className="mb-3">
                  <Text type="secondary">Status:</Text>
                  <div>
                    <Tag
                      color={
                        appointment.status === "SCHEDULED"
                          ? "blue"
                          : appointment.status === "COMPLETED"
                          ? "green"
                          : appointment.status === "CANCELLED"
                          ? "red"
                          : "default"
                      }>
                      {appointment.status}
                    </Tag>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          {/* <Row className="mt-4" gutter={[16, 16]} justify="end">
            <Col>
              <Button
                type="primary"
                onClick={() =>
                  navigate(`/appointment-details/${appointment.appointmentID}`)
                }
                className="bg-custom-green hover:bg-custom-green/90"
              >
                View Full Details
              </Button>
            </Col>
          </Row> */}
        </div>
      </div>
    );
  };

  // Function to render program details in modal
  const renderProgramDetails = () => {
    if (!selectedEvent) return null;

    const program = selectedEvent;
    const startDate = dayjs(program.startDate);
    const endDate = startDate.add(program.duration, "week");

    return (
      <div>
        <div className="flex flex-col space-y-4">
          <div className="flex items-center gap-2">
            <TeamOutlined className="text-blue-500 text-lg" />
            <Title level={4} style={{ margin: 0 }}>
              Program Details
            </Title>
          </div>

          <Card bordered className="bg-gray-50">
            <div className="flex flex-col space-y-4">
              <div>
                <Text type="secondary">Program:</Text>
                <div className="font-medium text-lg">{program.title}</div>
                <div className="flex gap-2 mt-1">
                  <Tag color="blue">{program.type}</Tag>
                  <Tag color="green">{program.status}</Tag>
                </div>
              </div>

              <Divider style={{ margin: "12px 0" }} />

              <div>
                <Text type="secondary">Student:</Text>
                <div className="font-medium">{program.studentName}</div>
              </div>

              <div>
                <Text type="secondary">Schedule:</Text>
                <div className="font-medium">
                  {program.weeklySchedule.weeklyAt}s,{" "}
                  {program.weeklySchedule.startTime.substring(0, 5)} -{" "}
                  {program.weeklySchedule.endTime.substring(0, 5)}
                </div>
              </div>

              <div>
                <Text type="secondary">Duration:</Text>
                <div className="font-medium">
                  {program.duration} weeks ({startDate.format("MMM DD, YYYY")} -{" "}
                  {endDate.format("MMM DD, YYYY")})
                </div>
              </div>

              {program.type === "ONLINE" && program.meetingLink && (
                <div>
                  <Text type="secondary">Meeting Link:</Text>
                  <div>
                    <Button
                      type="primary"
                      icon={<LinkOutlined />}
                      onClick={() => window.open(program.meetingLink, "_blank")}
                      className="bg-blue-500 hover:bg-blue-600 mt-1">
                      Join Meeting
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </Card>

          {/* <Row className="mt-4" gutter={[16, 16]} justify="end">
            <Col>
              <Button
                type="primary"
                onClick={() =>
                  navigate(`/program-details/${program.programID}`)
                }
                className="bg-blue-500 hover:bg-blue-600"
              >
                View Full Details
              </Button>
            </Col>
          </Row> */}
        </div>
      </div>
    );
  };

  // Memoize the disabled date function
  const disabledDate = useCallback(
    (current) => {
      return (
        current.isBefore(today) ||
        current.isAfter(today.add(1, "year").endOf("year"))
      );
    },
    [today]
  );

  // Function to handle date selection on calendar
  const onDateSelect = (date) => {
    setSelectedDate(date);
  };

  // Memoize the header render function
  const headerRender = useCallback(
    ({ value, onChange }) => {
      return (
        <Flex justify="end" align="center" className="p-4">
          <div className="flex flex-row gap-5">
            <Select
              value={value.month()}
              options={months.map((month) => ({
                ...month,
                disabled:
                  value.year() === today.year() && month.value < today.month(),
              }))}
              onChange={(newMonth) => {
                const now = value.clone().month(newMonth);
                onDateSelect(now);
              }}
              style={{ maxWidth: 120 }}
            />
            <Select
              value={value.year()}
              options={[today.year()].map((year) => ({
                ...year,
                disabled: year.value < today.year(),
              }))}
              onChange={(newYear) => {
                const now = value.clone().year(newYear);
                if (
                  now.year() === today.year() &&
                  now.month() < today.month()
                ) {
                  now.month(today.month());
                }
                onDateSelect(now);
              }}
              style={{ maxWidth: 120 }}
            />
            <Button
              onClick={() => {
                const newDate = selectedDate.subtract(1, "month");
                if (!newDate.isBefore(today, "day")) {
                  onChange(newDate);
                } else onChange(today);
              }}
              disabled={selectedDate.isSame(today, "month")}>
              Previous
            </Button>
            <Button
              onClick={() => {
                fetchParentEvents();
                message.success("Calendar data refreshed");
              }}
              icon={<ReloadOutlined />}
              title="Reload calendar data"
            />
            <Button
              onClick={() => {
                const newDate = selectedDate.add(1, "month");
                setSelectedDate(newDate);
                onChange(newDate);
              }}
              disabled={selectedDate.isSame(
                today.add(1, "year").endOf("year"),
                "month"
              )}>
              Next
            </Button>
          </div>
        </Flex>
      );
    },
    [selectedDate, today]
  );

  // Render events for the selected date
  const renderSelectedDateEvents = () => {
    const dateStr = selectedDate.format("YYYY-MM-DD");
    const dateEvents = events[dateStr];

    if (!dateEvents) {
      return (
        <Empty
          description="No events for this date"
          image={Empty.PRESENTED_IMAGE_SIMPLE}
        />
      );
    }

    const appointments = dateEvents.appointment || [];
    const programs = dateEvents.program || [];

    if (appointments.length === 0 && programs.length === 0) {
      return (
        <Empty
          description="No events for this date"
          image={Empty.PRESENTED_IMAGE_SIMPLE}
        />
      );
    }

    return (
      <div className="space-y-6">
        {appointments.length > 0 && (
          <div>
            <div className="flex items-center mb-3">
              <CalendarOutlined className="text-custom-green mr-2" />
              <Text strong>Appointments ({appointments.length})</Text>
            </div>
            <div className="space-y-3">
              {sortAppointmentsByTime(appointments).map((appointment) => (
                <Card
                  key={appointment.appointmentID}
                  className="hover:shadow-md transition-all cursor-pointer"
                  onClick={() => openEventDetails(appointment, "appointment")}>
                  <div className="flex justify-between">
                    <div>
                      <div className="font-medium">
                        {appointment.startTime} - {appointment.endTime}
                      </div>
                      <div className="text-gray-500">
                        For: {appointment.studentResponse?.fullName}
                      </div>
                      <div className="text-gray-500">
                        With: {appointment.psychologistResponse?.name}
                      </div>
                    </div>
                    <div className="flex flex-col items-end">
                      <Tag
                        color={
                          appointment.status === "SCHEDULED"
                            ? "blue"
                            : appointment.status === "COMPLETED"
                            ? "green"
                            : appointment.status === "CANCELLED"
                            ? "red"
                            : "default"
                        }
                        className="text-xs px-2 py-0.5">
                        {appointment.status}
                      </Tag>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {programs.length > 0 && (
          <div>
            <div className="flex items-center mb-3">
              <TeamOutlined className="text-blue-500 mr-2" />
              <Text strong>Programs ({programs.length})</Text>
            </div>
            <div className="space-y-3">
              {programs.map((program, index) => (
                <Card
                  key={`${program.programID}-${index}-${program.studentName}`}
                  className="hover:shadow-md transition-all cursor-pointer"
                  onClick={() => openEventDetails(program, "program")}>
                  <div className="flex justify-between">
                    <div>
                      <div className="font-medium">{program.title}</div>
                      <div className="text-gray-500">
                        Student: {program.studentName}
                      </div>
                      <div className="text-gray-500">
                        Time: {program.weeklySchedule.startTime.substring(0, 5)}{" "}
                        - {program.weeklySchedule.endTime.substring(0, 5)}
                      </div>
                    </div>
                    <div className="flex flex-col items-end">
                      <Tag color="blue" className="text-xs px-2 py-0.5">
                        {program.type}
                      </Tag>
                      {program.type === "ONLINE" && program.meetingLink && (
                        <Button
                          type="link"
                          size="small"
                          className="p-0 mt-1 text-blue-500"
                          icon={<VideoCameraOutlined />}
                          onClick={(e) => {
                            e.stopPropagation();
                            window.open(program.meetingLink, "_blank");
                          }}>
                          Join
                        </Button>
                      )}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  // Render loading state
  const renderLoading = (isCalendar = false) => {
    return (
      <div
        className={`${
          isCalendar
            ? "h-full w-full flex justify-center items-center p-8"
            : "p-4"
        }`}>
        {isCalendar ? (
          <Spin size="large" />
        ) : (
          <>
            <div className="flex items-center mb-6">
              <Skeleton.Avatar
                active
                size="default"
                shape="circle"
                className="mr-3"
              />
              <Skeleton.Input active style={{ width: 240, height: 28 }} />
            </div>

            <div className="mb-6 space-y-4">
              {Array(3)
                .fill(null)
                .map((_, index) => (
                  <div
                    key={`event-skeleton-${index}`}
                    className="p-4 border border-gray-200 rounded-lg shadow-sm">
                    <div className="flex justify-between items-start mb-3">
                      <div className="w-2/3">
                        <Skeleton.Input
                          active
                          style={{ width: "90%", height: 22 }}
                        />
                      </div>
                      <Skeleton.Button active size="small" shape="round" />
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center">
                        <Skeleton.Avatar
                          active
                          size="small"
                          shape="circle"
                          className="mr-2"
                        />
                        <Skeleton.Input
                          active
                          style={{ width: "60%", height: 16 }}
                        />
                      </div>
                      <div className="flex items-center">
                        <Skeleton.Avatar
                          active
                          size="small"
                          shape="circle"
                          className="mr-2"
                        />
                        <Skeleton.Input
                          active
                          style={{ width: "50%", height: 16 }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
            </div>

            <div className="flex justify-center mt-4">
              <Skeleton.Button
                active
                size="default"
                style={{ width: 120, borderRadius: "20px" }}
              />
            </div>
          </>
        )}
      </div>
    );
  };

  if (eventsError) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <Alert
          message="Error Loading Calendar"
          description={eventsError}
          type="error"
          showIcon
          action={
            <Button onClick={fetchParentEvents} type="primary">
              Try Again
            </Button>
          }
          className="my-4"
        />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <Title level={2} className="text-gray-800 mb-2">
          Family Calendar
        </Title>
        <Text className="text-gray-500">
          Track your children&apos;s appointments and programs
        </Text>
      </div>

      <Row gutter={[24, 24]}>
        <Col xs={24} lg={16}>
          <Card className="shadow-sm calendar-card">
            {eventsLoading ? (
              renderLoading(true)
            ) : (
              <Calendar
                onSelect={onDateSelect}
                cellRender={dateCellRender}
                headerRender={headerRender}
                className="parent-calendar"
                fullscreen={true}
                mode="month"
                disabledDate={disabledDate}
              />
            )}
          </Card>
        </Col>
        <Col xs={24} lg={8}>
          <Card className="shadow-sm h-full">
            {eventsLoading ? (
              renderLoading(false)
            ) : (
              <>
                <div className="flex items-center mb-4">
                  <InfoCircleOutlined className="text-custom-green mr-2" />
                  <Title level={4} style={{ margin: 0 }}>
                    Events on {selectedDate.format("MMM DD, YYYY")}
                  </Title>
                </div>
                <div className="events-list mb-4 max-h-96 overflow-y-auto">
                  {renderSelectedDateEvents()}
                </div>
                <div className="flex justify-end mt-4"></div>
              </>
            )}
          </Card>
        </Col>
      </Row>

      {/* Modal for event details */}
      <Modal
        title={null}
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={null}
        width={700}
        destroyOnClose>
        {selectedEventType === "appointment"
          ? renderAppointmentDetails()
          : renderProgramDetails()}
      </Modal>

      <style>{`
        .ant-picker-calendar-date-content {
          height: auto !important;
          min-height: 40px;
          overflow: visible;
          display: flex;
          flex-direction: column;
        }
        .event-container {
          position: absolute;
          bottom: 2px;
          left: 2px;
          right: 2px;
          display: flex;
          flex-direction: column;
          gap: 2px;
        }
        .event-badges {
          display: flex;
          flex-wrap: wrap;
          gap: 2px;
        }
        .student-names {
          max-width: 100%;
          overflow: hidden;
          text-overflow: ellipsis;
          font-size: 10px;
        }
        .student-badge {
          max-width: 100%;
          display: inline-block;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          font-size: 9px;
        }
        .calendar-card .ant-picker-calendar {
          padding: 0;
        }
      `}</style>
    </div>
  );
};

export default ParentCalendar;

import { Link } from "react-router-dom";
import {
  Typography,
  Button,
  Card,
  Statistic,
  Row,
  Col,
  Avatar,
  Tag,
  Space,
  Carousel,
} from "antd";
import {
  CalendarOutlined,
  SafetyOutlined,
  ClockCircleOutlined,
  EnvironmentOutlined,
} from "@ant-design/icons";

const { Title, Paragraph, Text } = Typography;
const { Meta } = Card;

export default function Home() {
  return (
    <div className="min-h-screen">
      {/* Hero Section - Modern gradient background with overlay */}
      <section className="relative bg-gradient-to-br from-emerald-700 to-emerald-900 text-white overflow-hidden">
        {/* Decorative circles */}
        <div className="absolute -top-24 -right-24 w-80 h-80 rounded-full bg-emerald-600/20 backdrop-blur-sm"></div>
        <div className="absolute -bottom-32 -left-32 w-96 h-96 rounded-full bg-emerald-500/10 backdrop-blur-sm"></div>

        <div className="relative container mx-auto px-4 py-20 md:py-28 flex flex-col items-center">
          <p className="text-5xl text-center text-white font-bold mb-6 leading-tight">
            Empower Your Mental Wellbeing
          </p>
          <Paragraph className="text-lg md:text-xl text-center text-white/90 max-w-3xl mb-10">
            Expert support, evidence-based resources, and a compassionate
            community dedicated to your mental health journey
          </Paragraph>
          <div className="flex flex-col sm:flex-row gap-4">
            <Button
              type="primary"
              size="large"
              className="bg-white text-emerald-700 hover:bg-gray-100 border-none font-medium px-8 h-12 flex items-center">
              <Link to="/book-appointment">Book Consultation</Link>
            </Button>
            <Button
              ghost
              size="large"
              className="border-white text-white hover:text-white hover:border-white hover:bg-white/10 font-medium px-8 h-12 flex items-center">
              <Link to="/about">Learn More</Link>
            </Button>
          </div>
        </div>
      </section>
      {/* Stats Section */}
      <div className="bg-white w-fit py-8 m-auto -mt-6 relative z-10 rounded-t-3xl shadow-lg">
        <div className="container mx-auto px-4 flex gap-5">
          <Card
            className="text-center h-full shadow-none w-52"
            style={{ border: 0 }}>
            <Statistic
              title={<span className="text-gray-500">Students Supported</span>}
              value={2000}
              valueStyle={{
                color: "var(--primary-color)",
                fontSize: "2.5rem",
                fontWeight: "bold",
              }}
              suffix="+"
            />
          </Card>
          <Card
            className="text-center h-full shadow-none w-52"
            style={{ border: 0 }}>
            <Statistic
              title={
                <span className="text-gray-500">Professional Counselors</span>
              }
              value={15}
              valueStyle={{
                color: "var(--primary-color)",
                fontSize: "2.5rem",
                fontWeight: "bold",
              }}
              suffix="+"
            />
          </Card>
          <Card
            className="text-center h-full shadow-none w-52"
            style={{ border: 0 }}>
            <Statistic
              title={<span className="text-gray-500">Support Hours</span>}
              value={24}
              valueStyle={{
                color: "var(--primary-color)",
                fontSize: "2.5rem",
                fontWeight: "bold",
              }}
              suffix="/7"
            />
          </Card>
          <Card
            className="text-center h-full shadow-none w-52"
            style={{ border: 0 }}>
            <Statistic
              title={<span className="text-gray-500">Satisfaction Rate</span>}
              value={95}
              valueStyle={{
                color: "var(--primary-color)",
                fontSize: "2.5rem",
                fontWeight: "bold",
              }}
              suffix="%"
            />
          </Card>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="">
        {/* Quick Actions Section */}
        <div className="my-16 px-4">
          <div className="text-center mb-8">
            <Title level={2} className="text-3xl font-bold text-gray-800 mb-2">
              Quick Actions
            </Title>
            <Paragraph className="text-gray-600 max-w-2xl mx-auto">
              Easy access to important resources and services
            </Paragraph>
          </div>

          <div className="flex justify-evenly">
            <Link to="/book-appointment" className="w-2/6">
              <Card
                hoverable
                className="w-full text-center h-full border-none shadow transition-all duration-300 hover:shadow-md hover:bg-emerald-50">
                <CalendarOutlined className="text-4xl text-emerald-600 mb-3" />
                <Meta title="Book Appointment" className="action-meta" />
              </Card>
            </Link>

            <Link to="/test" className="w-2/6">
              <Card
                hoverable
                className="w-full text-center h-full border-none shadow transition-all duration-300 hover:shadow-md hover:bg-emerald-50">
                <SafetyOutlined className="text-4xl text-emerald-600 mb-3" />
                <Meta title="Take Assessment" className="action-meta" />
              </Card>
            </Link>
          </div>
        </div>

        {/* Upcoming Workshops */}
        <div className="mb-16 px-4">
          <div className="text-center mb-8">
            <Title level={2} className="text-3xl font-bold text-gray-800 mb-2">
              Upcoming Workshops
            </Title>
            <Paragraph className="text-gray-600 max-w-2xl mx-auto">
              Join our interactive sessions designed to enhance your well-being
            </Paragraph>
          </div>

          <Row gutter={[24, 24]}>
            <Col xs={24} md={8}>
              <Card
                className="h-full rounded-lg shadow-md border-none overflow-hidden"
                actions={[
                  <Link to="/events" key="details">
                    Details
                  </Link>,
                  <Link to="/book-appointment" key="register">
                    Register
                  </Link>,
                ]}>
                <div className="mb-4">
                  <Tag color="success" className="mb-3">
                    May 15
                  </Tag>
                  <Meta
                    title="Mindfulness Workshop"
                    description="Learn techniques to stay present and reduce stress in your daily student life."
                  />
                </div>
                <Space className="text-gray-500 text-sm">
                  <ClockCircleOutlined /> 2:00 PM - 4:00 PM
                </Space>
                <br />
                <Space className="text-gray-500 text-sm">
                  <EnvironmentOutlined /> Online (Zoom)
                </Space>
              </Card>
            </Col>

            <Col xs={24} md={8}>
              <Card
                className="h-full rounded-lg shadow-md border-none overflow-hidden"
                actions={[
                  <Link to="/events" key="details">
                    Details
                  </Link>,
                  <Link to="/book-appointment" key="register">
                    Register
                  </Link>,
                ]}>
                <div className="mb-4">
                  <Tag color="success" className="mb-3">
                    May 22
                  </Tag>
                  <Meta
                    title="Exam Stress Management"
                    description="Strategies to handle academic pressure effectively during exam periods."
                  />
                </div>
                <Space className="text-gray-500 text-sm">
                  <ClockCircleOutlined /> 3:00 PM - 5:00 PM
                </Space>
                <br />
                <Space className="text-gray-500 text-sm">
                  <EnvironmentOutlined /> Campus Center, Room 204
                </Space>
              </Card>
            </Col>

            <Col xs={24} md={8}>
              <Card
                className="h-full rounded-lg shadow-md border-none overflow-hidden"
                actions={[
                  <Link to="/events" key="details">
                    Details
                  </Link>,
                  <Link to="/book-appointment" key="register">
                    Register
                  </Link>,
                ]}>
                <div className="mb-4">
                  <Tag color="success" className="mb-3">
                    June 5
                  </Tag>
                  <Meta
                    title="Peer Support Training"
                    description="Learn how to become a mental health advocate and support your peers on campus."
                  />
                </div>
                <Space className="text-gray-500 text-sm">
                  <ClockCircleOutlined /> 1:00 PM - 4:30 PM
                </Space>
                <br />
                <Space className="text-gray-500 text-sm">
                  <EnvironmentOutlined /> Student Union, Conference Room
                </Space>
              </Card>
            </Col>
          </Row>
        </div>

        {/* Featured Counselors */}
        <div className="mb-16">
          <div className="text-center mb-8">
            <Title level={2} className="text-3xl font-bold text-gray-800 mb-2">
              Meet Our Counselors
            </Title>
            <Paragraph className="text-gray-600 max-w-2xl mx-auto">
              Our team of dedicated professionals is here to support you
            </Paragraph>
          </div>

          <div id="counselorsList" className="pb-6">
            <Row gutter={[24, 24]}>
              <Col xs={24} md={8}>
                <Card
                  className="h-full rounded-lg shadow-md border-none overflow-hidden"
                  cover={
                    <div className="bg-emerald-50 h-32 flex items-center justify-center">
                      <Avatar size={80} className="bg-emerald-600 m-3">
                        S
                      </Avatar>
                    </div>
                  }>
                  <Meta
                    title="Dr. Sarah Johnson"
                    description={
                      <div className="mb-5">
                        <p className="mb-2">
                          <strong>Specialties:</strong> Anxiety, Depression,
                          Academic Stress
                        </p>
                        <p>
                          <strong>Available:</strong> Mon-Wed, 9am-4pm
                        </p>
                      </div>
                    }
                    className="mb-4"
                  />
                  <Button type="primary">
                    <Link to="/">View Profile</Link>
                  </Button>
                </Card>
              </Col>

              <Col xs={24} md={8}>
                <Card
                  className="h-full rounded-lg shadow-md border-none overflow-hidden"
                  cover={
                    <div className="bg-emerald-50 h-32 flex items-center justify-center">
                      <Avatar size={80} className="bg-emerald-600 m-3">
                        M
                      </Avatar>
                    </div>
                  }>
                  <Meta
                    title="Michael Chen, LMFT"
                    description={
                      <div className="mb-5">
                        <p className="mb-2">
                          <strong>Specialties:</strong> Relationship Issues,
                          Identity, Trauma
                        </p>
                        <p>
                          <strong>Available:</strong> Tue-Fri, 10am-6pm
                        </p>
                      </div>
                    }
                    className="mb-4"
                  />
                  <Button type="primary">
                    <Link to="/">View Profile</Link>
                  </Button>
                </Card>
              </Col>

              <Col xs={24} md={8}>
                <Card
                  className="h-full rounded-lg shadow-md border-none overflow-hidden"
                  cover={
                    <div className="bg-emerald-50 h-28 flex items-center justify-center">
                      <Avatar size={80} className="bg-emerald-600 m-3">
                        A
                      </Avatar>
                    </div>
                  }>
                  <Meta
                    title="Dr. Amara Patel"
                    description={
                      <div className="mb-5">
                        <p className="mb-2">
                          <strong>Specialties:</strong> Cultural Adjustment,
                          Career Guidance
                        </p>
                        <p>
                          <strong>Available:</strong> Mon, Thu-Fri, 11am-7pm
                        </p>
                      </div>
                    }
                    className="mb-4"
                  />
                  <Button type="primary">
                    <Link to="/">View Profile</Link>
                  </Button>
                </Card>
              </Col>
            </Row>
          </div>
        </div>

        {/* Testimonials */}
        <div className="bg-emerald-50 py-12 px-6 rounded-2xl">
          <div className="text-center mb-8">
            <Title level={2} className="text-3xl font-bold text-gray-800 mb-2">
              Student Experiences
            </Title>
            <Paragraph className="text-gray-600 max-w-2xl mx-auto">
              Hear from students who have benefited from our services
            </Paragraph>
          </div>

          <Carousel autoplay className="pb-12">
            <div className="px-4">
              <div className="bg-white p-8 rounded-xl shadow-md max-w-3xl mx-auto">
                <div className="flex flex-col items-center text-center">
                  <div className="text-emerald-600 text-5xl mb-4">&quot;</div>
                  <Paragraph className="text-gray-700 italic text-lg mb-6">
                    The counseling services helped me navigate a challenging
                    time in my academic journey. I&apos;m grateful for the
                    support that helped me get back on track.
                  </Paragraph>
                  <Avatar size={64} className="bg-emerald-600">
                    J
                  </Avatar>
                  <Text strong className="mt-4 text-gray-800">
                    Jessica T.
                  </Text>
                  <Text type="secondary">Graduate Student, Psychology</Text>
                </div>
              </div>
            </div>

            <div className="px-4">
              <div className="bg-white p-8 rounded-xl shadow-md max-w-3xl mx-auto">
                <div className="flex flex-col items-center text-center">
                  <div className="text-emerald-600 text-5xl mb-4">&quot;</div>
                  <Paragraph className="text-gray-700 italic text-lg mb-6">
                    The wellness workshops gave me practical tools to manage my
                    anxiety and improve my focus during my engineering studies.
                    Highly recommended!
                  </Paragraph>
                  <Avatar size={64} className="bg-emerald-600">
                    M
                  </Avatar>
                  <Text strong className="mt-4 text-gray-800">
                    Michael L.
                  </Text>
                  <Text type="secondary">
                    Undergraduate Student, Engineering
                  </Text>
                </div>
              </div>
            </div>
          </Carousel>
        </div>

        {/* CTA Section */}
        {/* <div className="rounded-xl bg-gradient-to-r from-emerald-700 to-emerald-900 text-white p-10 text-center">
          <Title level={2} className="text-white text-3xl mb-4">
            Ready to prioritize your mental wellbeing?
          </Title>
          <Paragraph className="text-white/90 text-lg max-w-2xl mx-auto mb-6">
            Our team of professional counselors is here to support you through
            your academic journey.
          </Paragraph>
          <Button
            size="large"
            className="bg-white text-emerald-700 hover:bg-gray-100 border-none font-medium h-12 px-8">
            <Link to="/book-appointment" className="flex items-center">
              Get Started <ArrowRightOutlined className="ml-2" />
            </Link>
          </Button>
        </div> */}
      </div>
    </div>
  );
}

import { useEffect, useState, useMemo } from "react";
import {
  Flex,
  Space,
  message,
  Card,
  Avatar,
  Row,
  Col,
  Button,
  Modal,
  Popconfirm,
  Form,
  Input,
  InputNumber,
  Select,
  Tabs,
  Badge,
  Typography,
  Empty,
  Skeleton,
  Table,
  Tag,
} from "antd";
import TagComponent from "../../components/TagComponent";
// import TableData from "../../data/table-data.json";
import { mergeNestedObject, transformString } from "../../utils/Helper";
import { useUserStore } from "../../stores/userStore";
import MaleIcon from "../../assets/male-icon.svg";
import FemaleIcon from "../../assets/female-icon.svg";
import {
  EyeOutlined,
  UserOutlined,
  PhoneOutlined,
  MailOutlined,
  HomeOutlined,
  IdcardOutlined,
  CalendarOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  SearchOutlined,
  ReloadOutlined,
} from "@ant-design/icons";
import { useAuthStore } from "../../stores/authStore";

const { Title, Text } = Typography;

// Updated to include MANAGER role
const ROLE_SET = ["all", "student", "parent", "psychologist", "manager"];

const StatsCardSkeleton = () => (
  <Card>
    <Flex vertical align="center">
      <Skeleton.Input style={{ width: 100 }} size="small" active />
      <Skeleton.Input
        style={{ width: 60, margin: "8px 0" }}
        size="large"
        active
      />
      <Skeleton.Input style={{ width: 80 }} size="small" active />
    </Flex>
  </Card>
);

const TableSkeleton = () => (
  <div>
    {[...Array(5)].map((_, index) => (
      <Card key={index} className="mb-3">
        <Row gutter={16} align="middle">
          <Col span={8}>
            <Flex align="center" gap={12}>
              <Skeleton.Avatar active size={40} />
              <div>
                <Skeleton.Input style={{ width: 150 }} active size="small" />
                <div style={{ marginTop: 4 }}>
                  <Skeleton.Input style={{ width: 120 }} active size="small" />
                </div>
              </div>
            </Flex>
          </Col>
          <Col span={8}>
            <Skeleton.Input style={{ width: "90%" }} active />
          </Col>
          <Col span={4}>
            <Skeleton.Button active style={{ width: 80 }} />
          </Col>
          <Col span={4}>
            <Space>
              <Skeleton.Button active style={{ width: 32 }} size="small" />
              <Skeleton.Button active style={{ width: 32 }} size="small" />
            </Space>
          </Col>
        </Row>
      </Card>
    ))}
  </div>
);

const UserDetailsSkeleton = () => (
  <div className="space-y-4">
    <Card>
      <Flex align="center" gap={24}>
        <Skeleton.Avatar size={80} active />
        <Flex vertical gap={4} flex={1}>
          <Skeleton.Input style={{ width: 200 }} active />
          <Flex gap={8}>
            <Skeleton.Button active style={{ width: 60 }} />
            <Skeleton.Button active style={{ width: 80 }} />
          </Flex>
          <Skeleton.Input style={{ width: 150 }} active size="small" />
        </Flex>
      </Flex>
    </Card>

    <Row gutter={16}>
      <Col xs={24} md={12}>
        <Card>
          <Skeleton active paragraph={{ rows: 3 }} />
        </Card>
      </Col>
      <Col xs={24} md={12}>
        <Card>
          <Skeleton active paragraph={{ rows: 3 }} />
        </Card>
      </Col>
    </Row>
  </div>
);

export default function UserManagement() {
  const [data, setData] = useState([]);
  const { users, getAllUsers, getUserDetails } = useUserStore();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [form] = Form.useForm();
  const [searchTerm, setSearchTerm] = useState("");
  const [childrenList, setChildrenList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuthStore();
  const [searchText, setSearchText] = useState("");

  const handleViewDetail = async (record) => {
    try {
      setIsLoading(true);
      const data = await getUserDetails(record.userId);

      // Check if data exists
      if (!data) {
        message.error("Failed to fetch user details");
        return;
      }

      let filteredData = { ...data }; // Clone data to avoid mutation
      const userRole = transformString(data.role).toLowerCase();

      if (userRole === "parent") {
        // Xử lý dữ liệu phụ huynh và con cái
        if (data.children && Array.isArray(data.children)) {
          // Lưu trữ thông tin con cái để hiển thị
          const childrenInfo = data.children.map((child) => ({
            userId: child.userId,
            fullName: child.fullName,
            gender: normalizeGender(child.gender),
            grade: child.grade,
            className: child.className,
            email: child.email,
            phone: child.phone,
            address: child.address,
          }));

          // Tạo mảng childrenArr để sử dụng trong renderUserDetails
          setChildrenList([
            {
              userId: data.userId,
              children: childrenInfo,
            },
          ]);
        } else {
          setChildrenList([]);
        }
      } else if (userRole === "psychologist") {
        filteredData = mergeNestedObject(data, "psychologistInfo");
      } else if (userRole === "student") {
        filteredData = mergeNestedObject(data, "studentInfo");
      }

      // console.log("Filtered data:", filteredData);
      setSelectedUser(filteredData);
    } catch (error) {
      console.error("Error fetching user details:", error);
      message.error("Failed to load user details");
    } finally {
      setIsLoading(false);
    }
  };

  // Normalize gender values from API (MALE/FEMALE) to display format (Male/Female)
  const normalizeGender = (gender) => {
    if (!gender) return "Unknown";
    return gender.charAt(0).toUpperCase() + gender.slice(1).toLowerCase();
  };

  const normalizeRole = (roleValue) => {
    return roleValue ? roleValue.toUpperCase() : "";
  };

  const columns = useMemo(
    () => [
      {
        title: "User",
        key: "user",
        render: (_, record) => (
          <div>
            <div className="font-medium flex items-center gap-2">
              <Avatar
                size={32}
                icon={<UserOutlined />}
                src={record.gender === "Male" ? MaleIcon : FemaleIcon}
                style={{
                  backgroundColor:
                    record.gender === "Male" ? "#e6f4ff" : "#fff0f6",
                  padding: 4,
                }}
              />
              {record.fullName}
            </div>
            <div className="text-xs text-gray-500 mt-1">
              ID: {record.userId}
            </div>
          </div>
        ),
        width: "25%",
        filteredValue: searchText ? [searchText] : null,
        onFilter: (value, record) => {
          return (
            record.fullName.toLowerCase().includes(value.toLowerCase()) ||
            record.userId.toLowerCase().includes(value.toLowerCase()) ||
            record.email.toLowerCase().includes(value.toLowerCase())
          );
        },
      },
      {
        title: "Contact",
        key: "contact",
        render: (_, record) => (
          <div className="text-sm">
            <div className="flex items-center">
              <MailOutlined className="mr-2 text-gray-400" />
              {record.email}
            </div>
            <div className="flex items-center mt-1">
              <PhoneOutlined className="mr-2 text-gray-400" />
              {record.phone || record.phoneNumber || "N/A"}
            </div>
          </div>
        ),
        width: "30%",
      },
      {
        title: "Role",
        dataIndex: "role",
        render: (value) => (
          <TagComponent
            color={
              transformString(value) === "Student"
                ? "green"
                : transformString(value) === "Parent"
                ? "blue"
                : transformString(value) === "Psychologist"
                ? "purple"
                : "orange"
            }
            tag={transformString(value)}
          />
        ),
        filters: ROLE_SET.filter((r) => r !== "all").map((r) => ({
          text: transformString(r),
          value: r.toUpperCase(),
        })),
        onFilter: (value, record) => record.role.toUpperCase() === value,
        width: "15%",
      },
      {
        title: "Gender",
        dataIndex: "gender",
        render: (value) => {
          const normalizedGender = normalizeGender(value);
          return (
            <TagComponent
              color={normalizedGender === "Male" ? "blue" : "volcano"}
              tag={normalizedGender}
            />
          );
        },
        filters: [
          { text: "Male", value: "Male" },
          { text: "Female", value: "Female" },
        ],
        onFilter: (value, record) => normalizeGender(record.gender) === value,
        width: "10%",
      },
      {
        title: "Status",
        key: "status",
        render: (_, record) => (
          <Tag
            color={record.active ? "green" : "red"}
            icon={
              record.active ? <CheckCircleOutlined /> : <CloseCircleOutlined />
            }
          >
            {record.active ? "Active" : "Inactive"}
          </Tag>
        ),
        filters: [
          { text: "Active", value: true },
          { text: "Inactive", value: false },
        ],
        onFilter: (value, record) => record.active === value,
        width: "10%",
      },
      {
        title: "Actions",
        key: "actions",
        width: "10%",
        render: (_, record) =>
          user.userId !== record.userId && (
            <Button
              type="primary"
              icon={<EyeOutlined />}
              onClick={() => {
                handleViewDetail(record);
                setIsModalVisible(true);
              }}
              className="bg-custom-green hover:bg-custom-green/90"
            >
              View Details
            </Button>
          ),
      },
    ],
    [user.userId, searchText]
  );

  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      try {
        await getAllUsers();
      } catch (error) {
        console.error("Failed to fetch users:", error);
        message.error("Failed to load users data");
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  const filterDataByRole = () => {
    // Kiểm tra nếu users là null hoặc undefined
    if (!users || !Array.isArray(users) || users.length === 0) {
      return [];
    }

    // Normalize gender values for all users
    const normalizedData = users.map((user) => ({
      ...user,
      gender: normalizeGender(user.gender),
      // Map phoneNumber to phone for consistency
      phone: user.phone || user.phoneNumber,
    }));

    return normalizedData;
  };

  const initialData = () => {
    const initialArr = filterDataByRole();
    setData(initialArr);
  };

  // Add a new useEffect to initialize data when users are loaded
  useEffect(() => {
    if (users.length > 0 && !loading) {
      initialData();
    }
  }, [users, loading]);

  const onSelectRowKey = (selectedRowKeys, selectedRows) => {
    console.log(selectedRowKeys, selectedRows);
  };

  const onSearch = (searchTerm) => {
    setSearchTerm(searchTerm);

    if (!searchTerm.trim()) {
      initialData();
      return;
    }

    const normalizedSearch = searchTerm.trim().toLowerCase();

    // More comprehensive search across multiple fields
    const filteredData = filterDataByRole().filter(
      (item) =>
        String(item.fullName).toLowerCase().includes(normalizedSearch) ||
        String(item.email).toLowerCase().includes(normalizedSearch) ||
        (item.phone && String(item.phone).includes(normalizedSearch)) ||
        (item.phoneNumber &&
          String(item.phoneNumber).includes(normalizedSearch))
    );

    setData(filteredData);
  };

  const handleUpdate = () => {
    setIsEditMode(true);
  };

  const handleUpdateSubmit = async () => {
    try {
      // Implement update logic here
      message.success("User updated successfully");
      setIsEditMode(false);
      setIsModalVisible(false);
    } catch (error) {
      message.error("Failed to update user");
      console.log(error);
    }
  };

  // const handleDelete = () => {
  //   // Implement delete logic
  //   message.warning("Delete functionality will be implemented");
  //   setIsModalVisible(false);
  // };

  const renderUserDetails = () => {
    if (!selectedUser) return null;

    if (isLoading) {
      return <UserDetailsSkeleton />;
    }

    // Determine the actual role of the selected user when in "all" mode
    const userRole = transformString(selectedUser.role).toLowerCase();

    const childrenArr = [];

    console.log("====================================");
    console.log(childrenList);
    console.log("====================================");

    if (isEditMode) {
      return isLoading ? (
        <Skeleton active />
      ) : (
        <Form
          form={form}
          layout="vertical"
          onFinish={handleUpdateSubmit}
          initialValues={{
            fullName: selectedUser.fullName,
            email: selectedUser.email,
            phone: selectedUser.phone || selectedUser.phoneNumber,
            gender: selectedUser.gender,
            address: selectedUser.address,
            ...(userRole === "student" && {
              grade: selectedUser.grade,
              className: selectedUser.className,
            }),
            ...(userRole === "psychologist" && {
              yearsOfExperience: selectedUser.yearsOfExperience,
              departmentName: selectedUser.departmentName,
            }),
            ...(userRole === "parent" && {
              children:
                childrenArr
                  .find((item) => item.userId === selectedUser.userId)
                  ?.children?.map((child) => child.userId) || [],
            }),
          }}
        >
          <Tabs defaultActiveKey="basic">
            <Tabs.TabPane tab="Basic Information" key="basic">
              <Card>
                <Row gutter={16}>
                  <Col span={12}>
                    <Form.Item
                      name="fullName"
                      label="Full Name"
                      rules={[
                        { required: true, message: "Please input full name!" },
                      ]}
                    >
                      <Input style={{ borderRadius: "8px" }} />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item
                      name="gender"
                      label="Gender"
                      rules={[
                        { required: true, message: "Please select gender!" },
                      ]}
                    >
                      <Select>
                        <Select.Option value="Male">Male</Select.Option>
                        <Select.Option value="Female">Female</Select.Option>
                      </Select>
                    </Form.Item>
                  </Col>
                </Row>

                <Row gutter={16}>
                  <Col span={12}>
                    <Form.Item
                      name="email"
                      label="Email"
                      rules={[
                        { required: true, message: "Please input email!" },
                        {
                          type: "email",
                          message: "Please enter a valid email!",
                        },
                      ]}
                    >
                      <Input style={{ borderRadius: "8px" }} />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item
                      name="phone"
                      label="Phone"
                      rules={[
                        { required: true, message: "Please input phone!" },
                      ]}
                    >
                      <Input style={{ borderRadius: "8px" }} />
                    </Form.Item>
                  </Col>
                </Row>

                <Form.Item name="address" label="Address">
                  <Input style={{ borderRadius: "8px" }} />
                </Form.Item>
              </Card>
            </Tabs.TabPane>

            <Tabs.TabPane
              tab="Role Specific"
              key="role"
              disabled={userRole === "manager"}
            >
              <Card>
                {userRole === "student" && (
                  <Row gutter={16}>
                    <Col span={12}>
                      <Form.Item
                        name="grade"
                        label="Grade"
                        rules={[
                          { required: true, message: "Please input grade!" },
                        ]}
                      >
                        <InputNumber
                          min={1}
                          max={12}
                          style={{ width: "100%", height: "32px" }}
                        />
                      </Form.Item>
                    </Col>
                    <Col span={12}>
                      <Form.Item
                        name="className"
                        label="Class"
                        rules={[
                          { required: true, message: "Please input class!" },
                        ]}
                      >
                        <Input style={{ borderRadius: "8px" }} />
                      </Form.Item>
                    </Col>
                  </Row>
                )}

                {userRole === "psychologist" && (
                  <>
                    <Form.Item
                      name="departmentName"
                      label="Department"
                      rules={[
                        { required: true, message: "Please input department!" },
                      ]}
                    >
                      <Input style={{ borderRadius: "8px" }} />
                    </Form.Item>
                    <Form.Item
                      name="yearsOfExperience"
                      label="Years of Experience"
                      rules={[
                        {
                          required: true,
                          message: "Please input years of experience!",
                        },
                      ]}
                    >
                      <InputNumber min={0} style={{ width: "100%" }} />
                    </Form.Item>
                  </>
                )}

                {userRole === "parent" && (
                  <Form.Item name="children" label="Children">
                    <Select
                      mode="multiple"
                      placeholder="Select children"
                      style={{ width: "100%" }}
                      options={childrenArr}
                      optionFilterProp="label"
                    />
                  </Form.Item>
                )}
              </Card>
            </Tabs.TabPane>
          </Tabs>

          <Flex gap={12} justify="end" style={{ marginTop: 16 }}>
            <Popconfirm
              title="Cancel editing"
              description="Are you sure you want to cancel? All changes will be lost."
              onConfirm={() => setIsEditMode(false)}
              okText="Yes"
              cancelText="No"
            >
              <Button>Cancel</Button>
            </Popconfirm>
            <Button type="primary" htmlType="submit">
              Save Changes
            </Button>
          </Flex>
        </Form>
      );
    }

    return isLoading ? (
      <Skeleton active />
    ) : (
      <Tabs defaultActiveKey="profile">
        <Tabs.TabPane
          tab={
            <span>
              <UserOutlined /> Profile
            </span>
          }
          key="profile"
        >
          <Flex vertical gap={16}>
            {/* User Profile Card */}
            <Card>
              <Flex align="center" gap={24}>
                <Avatar
                  size={80}
                  src={selectedUser.gender === "Female" ? FemaleIcon : MaleIcon}
                  style={{
                    backgroundColor:
                      selectedUser.gender === "Female" ? "#fff0f6" : "#e6f4ff",
                    padding: 10,
                  }}
                />
                <Flex vertical gap={4} flex={1}>
                  <Title level={4} style={{ margin: 0 }}>
                    {selectedUser.fullName}
                  </Title>
                  <Flex gap={8} align="center">
                    <TagComponent
                      color={
                        selectedUser.gender === "Male" ? "blue" : "volcano"
                      }
                      tag={selectedUser.gender}
                    />
                    <TagComponent
                      color={
                        userRole === "student" ||
                        normalizeRole(selectedUser.role) ===
                          normalizeRole("STUDENT")
                          ? "green"
                          : userRole === "parent" ||
                            normalizeRole(selectedUser.role) ===
                              normalizeRole("PARENT")
                          ? "blue"
                          : userRole === "psychologist" ||
                            normalizeRole(selectedUser.role) ===
                              normalizeRole("PSYCHOLOGIST")
                          ? "purple"
                          : "orange"
                      }
                      tag={transformString(selectedUser.role)}
                    />
                    {selectedUser.active ? (
                      <Badge status="success" text="Active" />
                    ) : (
                      <Badge status="error" text="Inactive" />
                    )}
                  </Flex>
                  <Text type="secondary">
                    <IdcardOutlined className="mr-2" />
                    ID: {selectedUser.userId}
                  </Text>
                </Flex>
              </Flex>
            </Card>

            {/* Contact Information */}
            <Row gutter={16}>
              <Col xs={24} md={12}>
                <Card
                  title={
                    <Flex align="center" gap={8}>
                      <MailOutlined />
                      <span>Contact Information</span>
                    </Flex>
                  }
                  size="small"
                >
                  <Flex vertical gap={12}>
                    <Flex align="center" gap={8}>
                      <MailOutlined style={{ color: "#1890ff" }} />
                      <Text strong>Email:</Text>
                      <Text>{selectedUser.email}</Text>
                    </Flex>
                    <Flex align="center" gap={8}>
                      <PhoneOutlined style={{ color: "#52c41a" }} />
                      <Text strong>Phone:</Text>
                      <Text>
                        {selectedUser.phone ||
                          selectedUser.phoneNumber ||
                          "N/A"}
                      </Text>
                    </Flex>
                    <Flex align="center" gap={8}>
                      <HomeOutlined style={{ color: "#faad14" }} />
                      <Text strong>Address:</Text>
                      <Text>{selectedUser.address || "N/A"}</Text>
                    </Flex>
                    {userRole === "student" && (
                      <Flex align="center" gap={8}>
                        <IdcardOutlined style={{ color: "#722ed1" }} />
                        <Text strong>Class:</Text>
                        <Text>
                          {selectedUser.grade
                            ? String(selectedUser.grade).concat(
                                selectedUser.className || ""
                              )
                            : "N/A"}
                        </Text>
                      </Flex>
                    )}
                  </Flex>
                </Card>
              </Col>

              {/* Role Specific Information */}
              <Col xs={24} md={12}>
                {userRole === "student" && (
                  <Card
                    title={
                      <Flex align="center" gap={8}>
                        <IdcardOutlined />
                        <span>Mental Health Scores</span>
                      </Flex>
                    }
                    size="small"
                  >
                    <Flex vertical gap={12}>
                      <Flex justify="space-between" align="center">
                        <Text strong>Depression:</Text>
                        <div
                          style={{
                            backgroundColor: "#1890ff",
                            color: "white",
                            fontSize: "14px",
                            padding: "2px 8px",
                            borderRadius: "10px",
                            minWidth: "30px",
                            textAlign: "center",
                            display: "inline-block",
                          }}
                        >
                          {selectedUser.depressionScore}
                        </div>
                      </Flex>
                      <Flex
                        justify="space-between"
                        align="center"
                        style={{ marginTop: "8px" }}
                      >
                        <Text strong>Anxiety:</Text>
                        <div
                          style={{
                            backgroundColor: "#52c41a",
                            color: "white",
                            fontSize: "14px",
                            padding: "2px 8px",
                            borderRadius: "10px",
                            minWidth: "30px",
                            textAlign: "center",
                            display: "inline-block",
                          }}
                        >
                          {selectedUser.anxietyScore}
                        </div>
                      </Flex>
                      <Flex
                        justify="space-between"
                        align="center"
                        style={{ marginTop: "8px" }}
                      >
                        <Text strong>Stress:</Text>
                        <div
                          style={{
                            backgroundColor: "#faad14",
                            color: "white",
                            fontSize: "14px",
                            padding: "2px 8px",
                            borderRadius: "10px",
                            minWidth: "30px",
                            textAlign: "center",
                            display: "inline-block",
                          }}
                        >
                          {selectedUser.stressScore}
                        </div>
                      </Flex>
                    </Flex>
                  </Card>
                )}

                {userRole === "psychologist" && (
                  <Card
                    title={
                      <Flex align="center" gap={8}>
                        <IdcardOutlined />
                        <span>Professional Information</span>
                      </Flex>
                    }
                    size="small"
                  >
                    <Flex vertical gap={12}>
                      <Flex align="center" gap={8}>
                        <Text strong>Department:</Text>
                        <Text>{selectedUser.departmentName || "N/A"}</Text>
                      </Flex>
                      <Flex align="center" gap={8}>
                        <Text strong>Experience:</Text>
                        <Text>
                          {selectedUser.yearsOfExperience
                            ? `${selectedUser.yearsOfExperience} years`
                            : "N/A"}
                        </Text>
                      </Flex>
                    </Flex>
                  </Card>
                )}

                {/* System Information for all roles */}
                <Card
                  title={
                    <Flex align="center" gap={8}>
                      <CalendarOutlined />
                      <span>System Information</span>
                    </Flex>
                  }
                  size="small"
                  style={{ marginTop: userRole === "parent" ? 0 : 16 }}
                >
                  <Flex vertical gap={12}>
                    <Flex align="center" gap={8}>
                      <Text strong>Created:</Text>
                      <Text>
                        {selectedUser.createdAt
                          ? new Date(selectedUser.createdAt).toLocaleString()
                          : "N/A"}
                      </Text>
                    </Flex>
                    <Flex align="center" gap={8}>
                      <Text strong>Updated:</Text>
                      <Text>
                        {selectedUser.updatedAt
                          ? new Date(selectedUser.updatedAt).toLocaleString()
                          : "N/A"}
                      </Text>
                    </Flex>
                    <Flex align="center" gap={8}>
                      <Text strong>Verified:</Text>
                      {selectedUser.verified ? (
                        <CheckCircleOutlined style={{ color: "#52c41a" }} />
                      ) : (
                        <CloseCircleOutlined style={{ color: "#f5222d" }} />
                      )}
                    </Flex>
                  </Flex>
                </Card>
              </Col>
            </Row>

            {/* Children Information for Parents */}
            {userRole === "parent" && (
              <Card
                title={
                  <Flex align="center" gap={8}>
                    <UserOutlined />
                    <span>Children Information</span>
                  </Flex>
                }
                size="small"
              >
                {childrenList.length && childrenList[0].children.length > 0 ? (
                  <Row gutter={[16, 16]}>
                    {childrenList[0].children.map((child) => (
                      <Col key={child.userId} xs={24} sm={12} md={8}>
                        <Card
                          hoverable
                          size="small"
                          style={{ borderRadius: 8 }}
                        >
                          <Flex align="center" gap={12}>
                            <Avatar
                              size={48}
                              src={
                                child.gender === "Female"
                                  ? FemaleIcon
                                  : MaleIcon
                              }
                              style={{
                                backgroundColor:
                                  child.gender === "Female"
                                    ? "#fff0f6"
                                    : "#e6f4ff",
                                padding: 5,
                              }}
                            />
                            <Flex vertical gap={2}>
                              <Text strong>{child.fullName}</Text>
                              <Text type="secondary">
                                Class:{" "}
                                {child.grade !== undefined &&
                                child.grade !== null
                                  ? String(child.grade).concat(
                                      child.className || ""
                                    )
                                  : "N/A"}
                              </Text>
                            </Flex>
                          </Flex>
                        </Card>
                      </Col>
                    ))}
                  </Row>
                ) : (
                  <Empty
                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                    description="No children registered"
                  />
                )}
              </Card>
            )}
          </Flex>
        </Tabs.TabPane>
      </Tabs>
    );
  };

  return (
    <div className="">
      <div className="">
        <div>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
            <div>
              <Title level={2} className="m-0">
                User Management
              </Title>
              <Text type="secondary">View and manage user accounts</Text>
            </div>

            <div className="flex gap-3">
              <Input
                placeholder="Search users..."
                prefix={<SearchOutlined className="text-gray-400" />}
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                className="w-64"
              />
            </div>
          </div>

          {/* Filters Row */}
          <div className="mb-4 bg-gray-50 p-3 rounded-lg border border-gray-100">
            <div className="flex flex-wrap justify-between items-center gap-4">
              <div className="flex items-center gap-2">
                <Text type="secondary">Role:</Text>
                <Select
                  defaultValue="all"
                  style={{ width: 120 }}
                  onChange={(value) => {
                    // Implement role filter if needed
                  }}
                  options={ROLE_SET.map((role) => ({
                    value: role,
                    label: transformString(role),
                  }))}
                />
              </div>

              <div className="flex items-center gap-2">
                <Button
                  icon={<ReloadOutlined spin={loading} />}
                  onClick={() => {
                    setLoading(true);
                    getAllUsers().finally(() => setLoading(false));
                  }}
                  className="ml-2"
                >
                  Refresh
                </Button>
              </div>
            </div>
          </div>

          {loading ? (
            <TableSkeleton />
          ) : data.length === 0 ? (
            <Empty
              description="No users found"
              image={Empty.PRESENTED_IMAGE_SIMPLE}
            />
          ) : (
            <Table
              dataSource={data}
              columns={columns}
              rowKey="userId"
              pagination={{ pageSize: 10 }}
              className="border rounded-lg overflow-hidden"
              expandable={{
                expandedRowRender: (record) => (
                  <div className="py-3 px-4 bg-gray-50 rounded-lg">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-4">
                      <div>
                        <p className="text-gray-500 mb-1 text-sm">Address</p>
                        <p className="text-gray-800">
                          {record.address || "N/A"}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-500 mb-1 text-sm">
                          System Info
                        </p>
                        <div className="flex flex-wrap gap-2">
                          <Tag icon={<CalendarOutlined />} color="blue">
                            Created:{" "}
                            {new Date(record.createdAt).toLocaleDateString()}
                          </Tag>
                          <Tag
                            icon={
                              record.verified ? (
                                <CheckCircleOutlined />
                              ) : (
                                <CloseCircleOutlined />
                              )
                            }
                            color={record.verified ? "green" : "red"}
                          >
                            {record.verified ? "Verified" : "Unverified"}
                          </Tag>
                        </div>
                      </div>
                      <div>
                        <p className="text-gray-500 mb-1 text-sm">
                          Last Updated
                        </p>
                        <Tag icon={<CalendarOutlined />} color="cyan">
                          {new Date(record.updatedAt).toLocaleDateString()}
                        </Tag>
                      </div>
                    </div>
                  </div>
                ),
              }}
            />
          )}
        </div>
      </div>

      {/* User details modal */}
      <Modal
        title={
          <div className="flex items-center gap-2">
            <UserOutlined className="text-custom-green" />
            <span>User Details</span>
          </div>
        }
        open={isModalVisible}
        onCancel={() => {
          setIsModalVisible(false);
          setIsEditMode(false);
        }}
        footer={null}
        width={800}
        destroyOnClose
        maskClosable={true}
        className="user-details-modal"
      >
        {renderUserDetails()}
      </Modal>
    </div>
  );
}

import { useEffect, useState, useMemo } from "react";
import {
  Flex,
  Radio,
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
} from "antd";
import TableComponent from "../../components/TableComponent";
import TagComponent from "../../components/TagComponent";
// import TableData from "../../data/table-data.json";
import {
  mergeNestedObject,
  splitParentArrays,
  transformString,
} from "../../utils/Helper";
import SearchInputComponent from "../../components/SearchInputComponent";
import { useUserStore } from "../../stores/userStore";
import MaleIcon from "../../assets/male-icon.svg";
import { DeleteOutlined, EditOutlined, EyeOutlined } from "@ant-design/icons";

const ROLE_SET = ["student", "parent", "psychologist"];

export default function UserManagement() {
  const [data, setData] = useState([]);
  const [role, setRole] = useState("student");
  const [childrenArr, setChildrenArr] = useState([]);
  const [childrenOptions, setChildrenOptions] = useState([]);
  const { users, loading, getAllUsers } = useUserStore();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [form] = Form.useForm();

  const handleViewDetail = (record) => {
    setSelectedUser(record);
    setIsModalVisible(true);
  };

  const columns = useMemo(
    () => [
      {
        title: "Full Name",
        dataIndex: "fullName",
        sorter: {
          compare: (a, b) => a.fullName.localeCompare(b.fullName),
          multiple: 1,
        },
      },
      {
        title: "Email",
        dataIndex: "email",
      },
      // Student
      {
        title: "Class",
        dataIndex: "grade",
        render: (_value, record) => {
          return <>{String(record.grade).concat(record.className)}</>;
        },
        sorter: {
          compare: (a, b) => {
            const valueA = String(a.grade).concat(a.className);
            const valueB = String(b.grade).concat(b.className);

            if (valueA < valueB) {
              return -1;
            }
            if (valueA > valueB) {
              return 1;
            }
            return 0;
          },
          multiple: 1,
        },
        hidden: role !== "student",
      },
      //Parent
      {
        title: "Children",
        dataIndex: "numOfChildren",
        // render: (value) => value?.length || 0,
        hidden: role !== "parent",
        width: "10%",
      },
      //Psychologist
      {
        title: "Department",
        dataIndex: "departmentName",
        hidden: role !== "psychologist",
        width: "20%",
      },
      {
        title: "Year of Experience",
        dataIndex: "yearsOfExperience",
        hidden: role !== "psychologist",
      },
      {
        title: "Gender",
        dataIndex: "gender",
        render: (value) => (
          <TagComponent
            color={value === "Male" ? "blue" : "volcano"}
            tag={value}
          />
        ),
        filters: [
          {
            text: "Male",
            value: "Male",
          },
          {
            text: "Female",
            value: "Female",
          },
        ],
        onFilter: (value, record) => record.gender.includes(value),
        width: "10%",
      },
      // {
      //   title: "Status",
      //   dataIndex: "status",
      //   render: (value) => (
      //     <TagComponent
      //       color={value === "Active" ? "green" : "volcano"}
      //       tag={value}
      //     />
      //   ),
      //   filters: [
      //     {
      //       text: "Active",
      //       value: "Active",
      //     },
      //     {
      //       text: "Inactive",
      //       value: "Inactive",
      //     },
      //   ],
      //   onFilter: (value, record) => record.status.includes(value),
      //   // width: "20%",
      // },
      {
        title: "Actions",
        key: "actions",
        width: "15%",
        render: (_, record) => (
          <Space size="middle">
            <Button
              type="link"
              icon={<EyeOutlined />}
              onClick={() => handleViewDetail(record)}>
              View
            </Button>
          </Space>
        ),
      },
    ],
    [role]
  );

  useEffect(() => {
    getAllUsers().catch((error) => {
      console.error("Failed to fetch users:", error);
      message.error("Failed to load users data");
    });
  }, [getAllUsers]);

  const filterDataByRole = (value) => {
    const filterData = users.filter(
      (user) => transformString(user.role) === transformString(value)
    );

    setChildrenOptions(
      users
        .filter(
          (user) => transformString(user.role) === transformString("student")
        )
        .map((student) => ({
          label: `${student.studentInfo.fullName} - Class ${student.studentInfo.grade}${student.studentInfo.className}`,
          value: student.userId,
        }))
    );

    if (value === "parent") {
      const { parentsWithoutChildren, childrenInfoArray } =
        splitParentArrays(filterData);
      setChildrenArr(childrenInfoArray);
      return parentsWithoutChildren;
    }
    return mergeNestedObject(
      filterData,
      value === "student" ? "studentInfo" : "psychologistInfo"
    );
  };

  const initialData = () => {
    const initialArr = filterDataByRole(role);
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

  const roleChange = (e) => {
    setRole(e.target.value);
    const filteredData = filterDataByRole(e.target.value);
    setData(filteredData);
  };

  const onSearch = (searchTerm) => {
    if (!searchTerm.trim()) {
      initialData();
      return;
    }

    const normalizedSearch = searchTerm.trim().toLowerCase();
    setData(
      data.filter((dt) =>
        String(dt.fullName).toLowerCase().includes(normalizedSearch)
      )
    );
  };

  const expandedRowRender = (record) => {
    const matchParent = childrenArr.find(
      (child) => child.userId === record.userId
    );

    if (!matchParent?.children)
      return (
        <Space direction="horizontal" align="center" style={{ width: "100%" }}>
          No Data
        </Space>
      );

    return (
      <Row gutter={[16, 16]}>
        {matchParent.children.map((child) => (
          <Col key={child.userId} span={8}>
            <Card styles={{ body: { padding: "12px" } }}>
              <Flex align="center" gap={16}>
                <Avatar
                  size={64}
                  src={MaleIcon}
                  style={{ backgroundColor: "#e6f4ff", padding: 7 }}
                />
                <Flex vertical gap={4} flex={1}>
                  <span style={{ fontSize: "16px", fontWeight: "bold" }}>
                    {child.fullName}
                  </span>
                  <span>
                    Class: {String(child.grade).concat(child.className)}
                  </span>
                </Flex>
              </Flex>
            </Card>
          </Col>
        ))}
      </Row>
    );
  };

  // console.log(childrenOptions);

  const handleUpdate = () => {
    setIsEditMode(true);
    const parentChildren = childrenArr.find(
      (item) => item.userId === selectedUser.userId
    );

    form.setFieldsValue({
      fullName: selectedUser.fullName,
      email: selectedUser.email,
      phone: selectedUser.phone,
      gender: selectedUser.gender,
      ...(role === "student" && {
        grade: selectedUser.grade,
        className: selectedUser.className,
      }),
      ...(role === "psychologist" && {
        specialization: selectedUser.specialization,
        yearsOfExperience: selectedUser.yearsOfExperience,
      }),
      ...(role === "parent" && {
        children: parentChildren?.children?.map((child) => child.userId) || [],
      }),
    });
  };

  const handleUpdateSubmit = async () => {
    try {
      // Implement your update logic here
      message.success("User updated successfully");
      setIsEditMode(false);
      setIsModalVisible(false);
    } catch (error) {
      message.error("Failed to update user");
      console.log(error);
    }
  };

  const handleDelete = () => {
    // Implement delete logic
    message.warning("Delete functionality will be implemented");
    setIsModalVisible(false);
  };

  const renderUserDetails = () => {
    if (!selectedUser) return null;

    if (isEditMode) {
      return (
        <Form
          form={form}
          layout="vertical"
          onFinish={handleUpdateSubmit}
          initialValues={{
            fullName: selectedUser.fullName,
            email: selectedUser.email,
            phone: selectedUser.phone,
            gender: selectedUser.gender,
            grade: selectedUser.grade,
            className: selectedUser.className,
          }}>
          <Card>
            <Form.Item
              name="fullName"
              label="Full Name"
              rules={[{ required: true, message: "Please input full name!" }]}>
              <Input style={{ borderColor: "#d9d9d9", borderRadius: "8px" }} />
            </Form.Item>
            <Form.Item
              name="email"
              label="Email"
              rules={[
                { required: true, message: "Please input email!" },
                { type: "email", message: "Please enter a valid email!" },
              ]}>
              <Input style={{ borderColor: "#d9d9d9", borderRadius: "8px" }} />
            </Form.Item>
            <Form.Item
              name="phone"
              label="Phone"
              rules={[{ required: true, message: "Please input phone!" }]}>
              <Input style={{ borderColor: "#d9d9d9", borderRadius: "8px" }} />
            </Form.Item>
            <Form.Item
              name="gender"
              label="Gender"
              rules={[{ required: true, message: "Please select gender!" }]}>
              <Select>
                <Select.Option value="Male">Male</Select.Option>
                <Select.Option value="Female">Female</Select.Option>
              </Select>
            </Form.Item>

            {role === "student" && (
              <Flex gap={16} style={{ width: "100%" }}>
                <Form.Item
                  name="grade"
                  label="Grade"
                  style={{ width: "50%" }}
                  rules={[{ required: true, message: "Please input grade!" }]}>
                  <InputNumber
                    min={1}
                    max={12}
                    style={{ width: "100%", height: "32px" }}
                  />
                </Form.Item>
                <Form.Item
                  name="className"
                  label="Class"
                  style={{ width: "50%" }}
                  rules={[{ required: true, message: "Please input class!" }]}>
                  <Input
                    style={{
                      height: "32px",
                      borderColor: "#d9d9d9",
                      borderRadius: "8px",
                    }}
                  />
                </Form.Item>
              </Flex>
            )}

            {role === "psychologist" && (
              <>
                <Form.Item
                  name="specialization"
                  label="Specialization"
                  rules={[
                    { required: true, message: "Please input specialization!" },
                  ]}>
                  <Input
                    style={{ borderColor: "#d9d9d9", borderRadius: "8px" }}
                  />
                </Form.Item>
                <Form.Item
                  name="yearsOfExperience"
                  label="Years of Experience"
                  rules={[
                    {
                      required: true,
                      message: "Please input years of experience!",
                    },
                  ]}>
                  <InputNumber min={0} />
                </Form.Item>
              </>
            )}

            {role === "parent" && (
              <Form.Item name="children" label="Children">
                <Select
                  mode="multiple"
                  placeholder="Select children"
                  style={{ width: "100%" }}
                  options={childrenOptions}
                  optionFilterProp="label"
                />
              </Form.Item>
            )}
          </Card>

          <Flex gap={12} justify="end">
            <Popconfirm
              title="Cancel editing"
              description="Are you sure you want to cancel? All changes will be lost."
              onConfirm={() => setIsEditMode(false)}
              okText="Yes"
              cancelText="No">
              <Button>Cancel</Button>
            </Popconfirm>
            <Button type="primary" htmlType="submit">
              Save Changes
            </Button>
          </Flex>
        </Form>
      );
    }

    return (
      <Flex vertical gap={12}>
        <Flex gap={16}>
          {/* Left Column */}
          <Flex vertical gap={12} style={{ width: "60%" }}>
            <Card>
              <Flex align="center" gap={16}>
                <Avatar
                  size={64}
                  src={MaleIcon}
                  style={{ backgroundColor: "#e6f4ff", padding: 7 }}
                />
                <Flex vertical gap={4}>
                  <span style={{ fontSize: "18px", fontWeight: "bold" }}>
                    {selectedUser.fullName}
                  </span>
                  <TagComponent
                    color={selectedUser.gender === "Male" ? "blue" : "volcano"}
                    tag={selectedUser.gender}
                  />
                </Flex>
              </Flex>
            </Card>

            <Card title="Contact Information" size="small">
              <Flex vertical gap={8}>
                <Flex justify="space-between">
                  <span style={{ color: "#666" }}>Email:</span>
                  <span>{selectedUser.email}</span>
                </Flex>
                <Flex justify="space-between">
                  <span style={{ color: "#666" }}>Phone:</span>
                  <span>{selectedUser.phone || "N/A"}</span>
                </Flex>
                {role === "student" && (
                  <Flex justify="space-between">
                    <span style={{ color: "#666" }}>Class:</span>
                    <span>
                      {String(selectedUser.grade).concat(
                        selectedUser.className
                      )}
                    </span>
                  </Flex>
                )}
                {role === "psychologist" && (
                  <>
                    <Flex justify="space-between">
                      <span style={{ color: "#666" }}>Specialization:</span>
                      <span>{selectedUser.specialization}</span>
                    </Flex>
                    <Flex justify="space-between">
                      <span style={{ color: "#666" }}>Experience:</span>
                      <span>{selectedUser.yearsOfExperience} years</span>
                    </Flex>
                  </>
                )}
              </Flex>
            </Card>
          </Flex>

          {/* Right Column */}
          <Flex vertical gap={12} style={{ width: "40%" }}>
            {role === "student" && (
              <Card title="Mental Health Scores" size="small">
                <Flex vertical gap={8}>
                  <Flex justify="space-between">
                    <span style={{ color: "#666" }}>Depression:</span>
                    <span>{selectedUser.depressionScore || "N/A"}</span>
                  </Flex>
                  <Flex justify="space-between">
                    <span style={{ color: "#666" }}>Anxiety:</span>
                    <span>{selectedUser.anxietyScore || "N/A"}</span>
                  </Flex>
                  <Flex justify="space-between">
                    <span style={{ color: "#666" }}>Stress:</span>
                    <span>{selectedUser.stressScore || "N/A"}</span>
                  </Flex>
                </Flex>
              </Card>
            )}

            <Card title="System Info" size="small">
              <Flex vertical gap={8}>
                <Flex justify="space-between">
                  <span style={{ color: "#666" }}>Created At:</span>
                  <span>
                    {new Date(selectedUser.createdAt).toLocaleString() || "N/A"}
                  </span>
                </Flex>
                <Flex justify="space-between">
                  <span style={{ color: "#666" }}>Last Updated:</span>
                  <span>
                    {new Date(selectedUser.updatedAt).toLocaleString() || "N/A"}
                  </span>
                </Flex>
              </Flex>
            </Card>

            {role === "parent" && (
              <Card title="Children Information" size="small">
                <Flex vertical gap={8}>
                  {childrenArr.find(
                    (item) => item.userId === selectedUser.userId
                  )?.children?.length > 0 ? (
                    childrenArr
                      .find((item) => item.userId === selectedUser.userId)
                      ?.children.map((child) => (
                        <Card
                          key={child.userId}
                          size="small"
                          style={{ marginBottom: 8 }}>
                          <Flex justify="space-between">
                            <Flex vertical gap={4}>
                              <span style={{ fontWeight: "bold" }}>
                                {child.fullName}
                              </span>
                              <span style={{ color: "#666" }}>
                                Class:{" "}
                                {String(child.grade).concat(child.className)}
                              </span>
                            </Flex>
                            {/* <TagComponent
                              color={
                                child.gender === "Male" ? "blue" : "volcano"
                              }
                              tag={child.gender}
                            /> */}
                            <Avatar
                              size={64}
                              src={MaleIcon}
                              style={{ backgroundColor: "#e6f4ff", padding: 7 }}
                            />
                          </Flex>
                        </Card>
                      ))
                  ) : (
                    <span style={{ color: "#666" }}>
                      No children registered
                    </span>
                  )}
                </Flex>
              </Card>
            )}
          </Flex>
        </Flex>

        <Flex gap={12} justify="end">
          <Button type="primary" icon={<EditOutlined />} onClick={handleUpdate}>
            Update
          </Button>
          <Popconfirm
            title="Delete user"
            description="Are you sure you want to delete this user?"
            onConfirm={handleDelete}
            okText="Yes"
            cancelText="No"
            okButtonProps={{ danger: true }}>
            <Button danger icon={<DeleteOutlined />}>
              Delete
            </Button>
          </Popconfirm>
        </Flex>
      </Flex>
    );
  };

  return (
    <Flex vertical gap={20}>
      <Flex gap={20} justify="end" align="baseline" wrap="wrap">
        <Radio.Group value={role} onChange={roleChange}>
          {ROLE_SET.map((role) => (
            <Radio.Button value={role} key={role}>
              {transformString(role)}
            </Radio.Button>
          ))}
        </Radio.Group>
        <SearchInputComponent
          className="w-2/6"
          placeholder="Search By Name"
          onSearch={onSearch}
          onClear={initialData}
        />
      </Flex>
      <TableComponent
        data={data}
        columns={columns}
        loading={loading}
        setData={setData}
        onSelectRowKey={onSelectRowKey}
        showExpandColumn={role === "parent"}
        expandedRowRender={expandedRowRender}
      />
      <Modal
        title={isEditMode ? "Edit User" : "User Details"}
        open={isModalVisible}
        onCancel={() => {
          setIsModalVisible(false);
          setIsEditMode(false);
        }}
        footer={null}
        width={800}>
        {renderUserDetails()}
      </Modal>
    </Flex>
  );
}

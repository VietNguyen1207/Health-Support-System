import { useEffect, useState, useMemo } from "react";
import { Flex, Radio, Space, message, Card, Avatar, Row, Col } from "antd";
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

const ROLE_SET = ["student", "parent", "psychologist"];

const createColumns = (role) => [
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
    title: "Specialization",
    dataIndex: "specialization",
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
      <TagComponent color={value === "Male" ? "blue" : "volcano"} tag={value} />
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
    title: "",
    dataIndex: "",
    key: "action",
    render: () => <>Delete</>,
    width: "10%",
  },
];

export default function UserManagement() {
  const [data, setData] = useState([]);
  const [role, setRole] = useState("student");
  const [childrenArr, setChildrenArr] = useState([]);
  const { users, loading, getAllUsers } = useUserStore();

  const columns = useMemo(() => createColumns(role), [role]);

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
    </Flex>
  );
}

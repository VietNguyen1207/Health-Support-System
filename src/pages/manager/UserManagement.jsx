import { useEffect, useState } from "react";
import TableComponent from "../../components/TableComponent";
import TagComponent from "../../components/TagComponent";
import TableData from "../../data/table-data.json";
import {
  mergeNestedObject,
  splitParentArrays,
  transformString,
} from "../../utils/Helper";
import { Flex, Radio, Space } from "antd";
import SearchInputComponent from "../../components/SearchInputComponent";

const ROLE_SET = ["student", "parent", "psychologist"];

export default function UserManagement() {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState([]);
  const [role, setRole] = useState("student");
  const [childrenArr, setChildrenArr] = useState([]);

  const columns = [
    {
      title: "Full Name",
      dataIndex: "fullName",
      sorter: {
        compare: (a, b) => {
          if (a.fullName < b.fullName) {
            return -1;
          }
          if (a.fullName > b.fullName) {
            return 1;
          }
          return 0;
        },
        multiple: 1,
      },
      width: "15%",
    },
    {
      title: "Email",
      dataIndex: "email",
      width: "15%",
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
      // width: "20%",
    },
    {
      title: "Status",
      dataIndex: "status",
      render: (value) => (
        <TagComponent
          color={value === "Active" ? "green" : "volcano"}
          tag={value}
        />
      ),
      filters: [
        {
          text: "Active",
          value: "Active",
        },
        {
          text: "Inactive",
          value: "Inactive",
        },
      ],
      onFilter: (value, record) => record.status.includes(value),
      // width: "20%",
    },
    {
      title: "",
      dataIndex: "",
      key: "action",
      render: () => <>Delete</>,
      width: "10%",
    },
  ];

  const filterDataByRole = (value) => {
    const filterData = TableData.users.filter(
      (user) => transformString(user.role) === transformString(value)
    );

    if (value === "parent") {
      const { parentsWithoutChildren, childrenInfoArray } =
        splitParentArrays(filterData);
      setChildrenArr(childrenInfoArray);
      // console.log("parentsWithoutChildren", parentsWithoutChildren);
      // console.log("childrenInfoArray ", childrenInfoArray);

      return parentsWithoutChildren;
    }

    return filterData;
    // switch (user.role) {
    //   case "STUDENT":
    //     return mergeNestedObject(user, "studentInfo");
    //   case "PSYCHOLOGIST":
    //     return mergeNestedObject(user, "psychologistInfo");
    //   default:
    //     break;
    // }
  };

  const initialData = () => {
    const initialArr = filterDataByRole(role);
    setData(initialArr);
    setLoading(false);
  };

  useEffect(initialData, []);

  const onSelectRowKey = (selectedRowKeys, selectedRows) => {
    console.log(selectedRowKeys, selectedRows);
  };

  const roleChange = (e) => {
    setRole(e.target.value);
    const filteredData = filterDataByRole(e.target.value);
    setData(filteredData);
  };

  const onSearch = (e) => {
    setData(
      data.filter((dt) =>
        String(dt.fullName)
          .toLowerCase()
          .includes(String(e).trim().toLowerCase())
      )
    );
  };

  const expandedRowRender = (record) => {
    const matchParent = childrenArr.find(
      (child) => child.userId === record.userId
    );

    return (
      <Space align="center">
        {matchParent.children.length > 0 ? <>Hello</> : <>No Data</>}
      </Space>
    );
  };

  return (
    <Flex vertical gap={20}>
      <Flex gap={20} justify="end" align="baseline" wrap={"wrap"}>
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

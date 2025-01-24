import { useEffect, useState } from "react";
import TableComponent from "../../components/TableComponent";
import TagComponent from "../../components/TagComponent";
import TableData from "../../data/table-data.json";
import { transformString } from "../../utils/Helper";
import { Flex, Radio } from "antd";
import SearchInputComponent from "../../components/SearchInputComponent";

const ROLE_SET = ["student", "parent", "psychologist"];

export default function UserManagement() {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState([]);
  const [role, setRole] = useState("student");

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
      width: "20%",
    },
    {
      title: "Email",
      dataIndex: "email",
    },
    {
      title: "Gender",
      dataIndex: "gender",
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
      width: "20%",
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
      width: "20%",
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
    return TableData.users.filter(
      (user) => transformString(user.role) === transformString(value)
    );
  };

  const initialData = () => {
    const initialArr = filterDataByRole(role);
    setData(initialArr);
    setLoading(false);
  };

  useEffect(initialData, []);

  const onSelectRowKey = (selectedRowKeys, selectedRows) => {};

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
      />
    </Flex>
  );
}

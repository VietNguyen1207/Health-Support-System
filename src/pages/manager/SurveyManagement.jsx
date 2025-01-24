import { useEffect, useState } from "react";
import TableComponent from "../../components/TableComponent";

export default function SurveyManagement() {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState([]);

  const columns = [
    {
      title: "Name",
      dataIndex: "name",
      sorter: true,
      width: "20%",
    },
    {
      title: "Gender",
      dataIndex: "gender",
      filters: [
        {
          text: "Male",
          value: "male",
        },
        {
          text: "Female",
          value: "female",
        },
      ],
      width: "20%",
    },
    {
      title: "Email",
      dataIndex: "email",
    },
    {
      title: "Age",
      dataIndex: "age",
      key: "age",
    },
    {
      title: "Address",
      dataIndex: "address",
      key: "address",
    },
  ];

  const fetchData = async () => {
    setData([
      {
        id: "1",
        name: "John Brown",
        gender: "Male",
        email: "abc",
        age: 32,
        address: "New York No. 1 Lake Park",
      },
      {
        id: "2",
        name: "Jim Green",
        gender: "Male",
        email: "abc",
        age: 42,
        address: "London No. 1 Lake Park",
      },
      {
        id: "3",
        name: "Joe Black",
        gender: "Male",
        email: "abc",
        age: 32,
        address: "Sidney No. 1 Lake Park",
      },
      {
        id: "4",
        name: "Joe Black",
        gender: "Male",
        email: "abc",
        age: 32,
        address: "Sidney No. 1 Lake Park",
      },
      {
        id: "5",
        name: "Joe Black",
        gender: "Male",
        email: "abc",
        age: 32,
        address: "Sidney No. 1 Lake Park",
      },
      {
        id: "6",
        name: "Joe Black",
        gender: "Male",
        email: "abc",
        age: 32,
        address: "Sidney No. 1 Lake Park",
      },
      {
        id: "7",
        name: "Joe Black",
        gender: "Male",
        email: "abc",
        age: 32,
        address: "Sidney No. 1 Lake Park",
      },
      {
        id: "8",
        name: "Joe Black",
        gender: "Female",
        email: "abc",
        age: 32,
        address: "Sidney No. 1 Lake Park",
      },
      {
        id: "9",
        name: "Joe Black",
        gender: "Female",
        email: "abc",
        age: 32,
        address: "Sidney No. 1 Lake Park",
      },
      {
        id: "10",
        name: "Joe Black",
        gender: "Female",
        email: "abc",
        age: 32,
        address: "Sidney No. 1 Lake Park",
      },
      {
        id: "11",
        name: "Joe Black",
        gender: "Female",
        email: "abc",
        age: 32,
        address: "Sidney No. 1 Lake Park",
      },
      {
        id: "12",
        name: "Joe Black",
        gender: "Male",
        email: "abc",
        age: 32,
        address: "Sidney No. 1 Lake Park",
      },
    ]);
    setLoading(false);
  };

  useEffect(() => fetchData, []);

  return (
    <div>
      <TableComponent
        title="User Management"
        columns={columns}
        data={data}
        loading={loading}
        bordered={true}
        setData={setData}
        size="middle"
      />
    </div>
  );
}

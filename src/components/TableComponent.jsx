// src/components/TableComponent.jsx
import { Table } from "antd";
import PropTypes from "prop-types";

const TableComponent = ({
  data,
  columns,
  bordered = true,
  size = "middle",
  loading = false,
  onSelectRowKey = (selectedRowKeys, selectedRows) => {
    console.log(
      `selectedRowKeys: ${selectedRowKeys}`,
      "selectedRows: ",
      selectedRows
    );
  },
  getCheckboxProps = () => {},
  expandedRowRender,
}) => {
  const rowSelection = {
    onChange: onSelectRowKey,
    getCheckboxProps: getCheckboxProps,
  };

  return (
    <>
      <Table
        columns={columns}
        dataSource={data}
        bordered={bordered}
        size={size}
        loading={loading}
        rowSelection={{ type: "checkbox", ...rowSelection }}
        rowKey={(record) => record.id}
        pagination={{
          position: ["bottomCenter"],
        }}
        expandable={{
          expandedRowRender: expandedRowRender,
        }}
      />
    </>
  );
};

TableComponent.propTypes = {
  columns: PropTypes.array.isRequired, // Định nghĩa cột
  data: PropTypes.array.isRequired, // Dữ liệu
  bordered: PropTypes.bool, // Có viền hay không
  size: PropTypes.oneOf(["small", "middle", "large"]), // Kích thước bảng
  loading: PropTypes.bool,
  onSelectRowKey: PropTypes.func,
  getCheckboxProps: PropTypes.func,
  expandedRowRender: PropTypes.func,
};

export default TableComponent;

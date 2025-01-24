import { Input } from "antd";
import PropTypes from "prop-types";

export default function SearchInputComponent({
  placeholder = "",
  className = "w-[200px]",
  onSearch,
  onClear,
  ...props
}) {
  return (
    <>
      <Input.Search
        {...props}
        placeholder={placeholder}
        allowClear
        className={className}
        onSearch={onSearch}
        onClear={onClear}
      />
    </>
  );
}

SearchInputComponent.propTypes = {
  placeholder: PropTypes.string.isRequired,
  className: PropTypes.string,
  onSearch: PropTypes.func,
  onClear: PropTypes.func,
};

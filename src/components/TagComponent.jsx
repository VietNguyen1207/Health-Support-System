import { Tag } from "antd";
import PropTypes from "prop-types";

function TagComponent({ tag = "", color = "" }) {
  return (
    <Tag key={tag} color={color}>
      {tag.toUpperCase()}
    </Tag>
  );
}

TagComponent.propTypes = {
  tag: PropTypes.string.isRequired,
  color: PropTypes.string.isRequired,
};

export default TagComponent;

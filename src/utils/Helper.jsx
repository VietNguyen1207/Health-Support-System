import { Link } from "react-router-dom";

export function formatWeekDay(date) {
  return date && date.format("ddd");
}

export function formatRegularDate(date) {
  return date && date.format("DD/MM");
}

export function formatAppointmentDate(date) {
  return date && date.format("YYYY-MM-DD");
}

export function transformString(str) {
  return String(str)
    .trim()
    .charAt(0)
    .toUpperCase()
    .concat(String(str).slice(1).toLowerCase());
}

export function mergeNestedObject(arr, nestedKey) {
  return arr.map((object) => {
    // Destructure the nested object using the provided key
    const { [nestedKey]: nestedInfo, ...otherAttributes } = object;

    // Merge nested attributes with top-level attributes
    return {
      ...otherAttributes,
      ...nestedInfo,
    };
  });
}

export function splitParentArrays(parentArray) {
  // Initialize two arrays to hold the results
  const parentsWithoutChildren = [];
  const childrenInfoArray = [];

  parentArray.forEach((parent) => {
    // Create an object without the children attribute
    const { children, ...parentWithoutChildren } = parent;

    // Create an object containing userId and the children array
    const childrenObject = {
      userId: parent.userId,
      children: children,
    };

    // Create an object containing parentWithoutChildren and the number of child
    const parentObject = {
      ...parentWithoutChildren,
      numOfChildren: children.length || 0,
    };

    // Push the objects into their respective arrays
    parentsWithoutChildren.push(parentObject);
    childrenInfoArray.push(childrenObject);
  });

  return { parentsWithoutChildren, childrenInfoArray };
}

// Lọc menu dựa trên role, mặc định cho phép truy cập nếu không có roles
export const filterMenuItemsByRole = (items, role) => {
  return items
    .filter((item) => !item.roles || (role && item.roles.includes(role))) // Không có `roles` thì cho phép
    .map((item) => ({
      key: item.key,
      label: (
        <Link
          to={item.key}
          className={`${
            item.special && "px-4 bg-primary rounded-full flex items-center"
          }`}>
          <span className={`${item.special && "text-white font-semibold"}`}>
            {item.label}
          </span>
        </Link>
      ),
      children: item.children
        ? filterMenuItemsByRole(item.children, role)
        : undefined,
    }));
};

export const filterDropdownItemsByRole = (items, role) => {
  return items.filter(
    (item) => !item.roles || (role && item.roles.includes(role.toLowerCase()))
  );
};

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

export const formatTimeDisplay = (timeSlot) => {
  // Assuming timeSlot is in format "HH:mm"
  const [hours, minutes] = timeSlot.split(":");
  return `${parseInt(hours)}:${minutes}`; // This will remove leading zero
};

export function transformString(str) {
  return String(str)
    .trim()
    .charAt(0)
    .toUpperCase()
    .concat(String(str).slice(1).toLowerCase());
}

export function checkRole(currRole, role) {
  return currRole.toLowerCase() === role.toLowerCase();
}

export function mergeNestedArr(arr, nestedKey) {
  if (!arr || !Array.isArray(arr)) {
    return [];
  }
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

export function mergeNestedObject(obj, nestedKey) {
  // Check if obj is null, undefined, or not an object
  if (!obj || typeof obj !== "object") {
    return [];
  }

  // If obj is an array, map through it
  if (Array.isArray(obj)) {
    return obj.map((item) => {
      // Check if the nested key exists in the item
      const nestedInfo = item[nestedKey] || {};

      // Return merged object
      return {
        ...item,
        ...nestedInfo,
      };
    });
  }

  // If obj is a single object (not an array)
  // Extract the nested object using the provided key
  const nestedInfo = obj[nestedKey] || {};

  // Return the merged object
  return {
    ...obj,
    ...nestedInfo,
  };
}

export function splitParentArrays(parentData) {
  // Check if parentData is null, undefined, or not an array
  if (!parentData) {
    return { parentsWithoutChildren: [], childrenInfoArray: [] };
  }

  // If it's a single object, convert to array
  const dataArray = Array.isArray(parentData) ? parentData : [parentData];

  // Process the array safely
  const childrenInfoArray = [];

  // Return the processed data
  return {
    parentsWithoutChildren: dataArray,
    childrenInfoArray,
  };
}

// Lọc menu dựa trên role, mặc định cho phép truy cập nếu không có roles
export const filterMenuItemsByRole = (items, role) => {
  return items
    .filter((item) => !item.roles || (role && item.roles.includes(role))) // Không có `roles` thì cho phép
    .map((item) => ({
      key: item.key,
      label: (
        <Link to={item.key} className={`hover:text-primary-green`}>
          <div
          //  className={"bg-primary rounded-full px-4"}
          >
            <span className={`text-sm`}>{item.label}</span>
          </div>
        </Link>
      ),
      children: item.children
        ? filterMenuItemsByRole(item.children, role)
        : undefined,
      special: item.special,
    }));
};

export const filterDropdownItemsByRole = (items, role) => {
  return items.filter(
    (item) => !item.roles || (role && item.roles.includes(role.toLowerCase()))
  );
};

// Filter Users By Role
export const filterUsersByRole = (arr, role) => {
  const psychologists = arr.filter(
    (user) =>
      !user.role || (role && user.role.toLowerCase() === role.toLowerCase())
  );

  return mergeNestedObject(psychologists, "psychologistInfo");
};

export const getPsychologistSpecializations = (users) => {
  // Lọc users có role là psychologist
  const psychologists = filterUsersByRole(users, "psychologist");

  // Tạo Set để lưu trữ các specialization duy nhất
  const specializationSet = new Set();

  // Lặp qua danh sách psychologists để lấy specialization
  psychologists.forEach((psychologist) => {
    specializationSet.add(psychologist.departmentName);
  });

  // Chuyển Set thành mảng và trả về
  return Array.from(specializationSet);
};

export const getPsychologistsBySpecialization = (users, specialization) => {
  if (!specialization) return [];

  // Lọc users có role là psychologist
  const psychologists = filterUsersByRole(users, "psychologist");

  return psychologists
    .filter(
      (psych) =>
        psych.departmentName &&
        psych.departmentName.toLowerCase() === specialization.toLowerCase()
    )
    .map((psych) => ({
      id: psych.psychologistId,
      name: psych.fullName,
      experience: `${psych.yearsOfExperience} years experience`,
    }));
};

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

export function mergeNestedObject(inputObject, nestedKey) {
  // Check if the nested key exists in the input object
  if (!inputObject[nestedKey]) {
    throw new Error(`Key "${nestedKey}" does not exist in the input object.`);
  }

  // Destructure the nested object using the provided key
  const { [nestedKey]: nestedInfo, ...otherAttributes } = inputObject;

  // Merge nested attributes with top-level attributes
  return {
    ...otherAttributes,
    ...nestedInfo,
  };
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

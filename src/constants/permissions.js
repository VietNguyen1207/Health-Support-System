// Định nghĩa các role
export const ROLES = {
  STUDENT: "student",
  PARENT: "parent",
  PSYCHOLOGIST: "psychologist",
  MANAGER: "manager",
};

// Định nghĩa các permission cho từng chức năng
export const PERMISSIONS = {
  PROFILE: {
    READ: "read_profile",
    UPDATE: "update_profile",
  },

  APPOINTMENT: {
    READ: "read_appointment",
    CREATE: "create_appointment",
    UPDATE: "update_appointment",
    DELETE: "delete_appointment",
  },

  SURVEY: {
    READ: "read_survey",
    CREATE: "create_survey",
    UPDATE: "update_survey",
    DELETE: "delete_survey",
  },

  USER: {
    READ: "read_user",
    CREATE: "create_user",
    UPDATE: "update_user",
    DELETE: "delete_user",
  },
};

// Định nghĩa permission map cho từng role
export const ROLE_PERMISSIONS = {
  [ROLES.STUDENT]: [
    PERMISSIONS.PROFILE.READ,
    PERMISSIONS.PROFILE.UPDATE,
    PERMISSIONS.APPOINTMENT.READ,
    PERMISSIONS.APPOINTMENT.CREATE,
    PERMISSIONS.SURVEY.READ,
    PERMISSIONS.SURVEY.UPDATE,
  ],

  [ROLES.PARENT]: [
    PERMISSIONS.PROFILE.READ,
    PERMISSIONS.PROFILE.UPDATE,
    PERMISSIONS.APPOINTMENT.READ,
    PERMISSIONS.SURVEY.READ,
  ],

  [ROLES.PSYCHOLOGIST]: [
    PERMISSIONS.PROFILE.READ,
    PERMISSIONS.PROFILE.UPDATE,
    PERMISSIONS.APPOINTMENT.READ,
    PERMISSIONS.APPOINTMENT.CREATE,
    PERMISSIONS.APPOINTMENT.UPDATE,
    PERMISSIONS.APPOINTMENT.DELETE,
    PERMISSIONS.SURVEY.READ,
    PERMISSIONS.SURVEY.CREATE,
    PERMISSIONS.SURVEY.UPDATE,
    PERMISSIONS.SURVEY.DELETE,
  ],

  [ROLES.MANAGER]: [
    ...Object.values(PERMISSIONS), // Manager có tất cả permissions
  ],
};

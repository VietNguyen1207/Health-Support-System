export function formatWeekDay(date) {
  return date && date.format("ddd");
}

export function formatRegularDate(date) {
  return date && date.format("DD/MM");
}

export function formatAppointmentDate(date) {
  return date && date.format("YYYY-MM-DD");
}

import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";

dayjs.extend(relativeTime);

export const formatDate = (dateString) =>
  dayjs(dateString).format("DD/MM/YYYY");

export const TimeFromNow = (timestamp) => dayjs(timestamp).fromNow();

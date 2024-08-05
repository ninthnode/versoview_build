import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";

dayjs.extend(relativeTime);

export const formatDate = (dateString) =>
  dayjs(dateString).format("MMM DD YYYY");

export const TimeFromNow = (timestamp) => dayjs(timestamp).fromNow();

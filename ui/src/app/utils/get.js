export default (endpoint, protectedRoute = false, options = {}) =>
  fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/${endpoint}`, {
    headers: {
      authorization:
        `Bearer ${localStorage.getItem("token").replaceAll('"', "")}`,
    },
    ...options,
  }).then((r) => r.json());

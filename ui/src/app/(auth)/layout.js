import PrivateRoute from "../utils/PrivateRoute";

export default function AuthLayout({ children }) {
  if (!Promise.withResolvers) {
    Promise.withResolvers = function () {
      let resolve, reject;
      const promise = new Promise((res, rej) => {
        resolve = res;
        reject = rej;
      });
      return { promise, resolve, reject };
    };
  }
  return (
    <>
    <PrivateRoute>
      {children}
      </PrivateRoute>
    </>
  );
}

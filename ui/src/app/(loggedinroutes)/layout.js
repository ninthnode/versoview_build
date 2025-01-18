
import Navbar from "@/components/Navbar";

export default function DashboardLayout({ children }) {
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
    <Navbar>
      {children}
    </Navbar>
    <div id="dialog-root"></div>
    </>
  );
}

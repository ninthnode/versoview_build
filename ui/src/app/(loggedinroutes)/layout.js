"use client";

import Navbar from "@/components/Navbar";
import { usePathname } from "next/navigation";
import { RoutesList } from "@/routes/index";

export default function DashboardLayout({ children }) {
  const pathname = usePathname();
  const getRouteName = (path) => {
    for (const route of RoutesList) {
      if (route.url === path || path.startsWith(route.url)) {
        return route.name;
      }
    }
    return null;
  };
  console.log(getRouteName(pathname));
  return <Navbar routeName={getRouteName(pathname)}>{children}</Navbar>;
}

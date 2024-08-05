"use client";

import Navbar from "@/components/Navbar";
import { usePathname } from "next/navigation";
import { RoutesList } from "@/routes/index";


export default function DashboardLayout({ children }) {
  const pathname = usePathname();
  const getRouteName = (path) => {
    for (const route of RoutesList) {
      // Check If Includes Path In Routes
      // if (route.url === path || path.startsWith(route.url)) {
      //   return route.name;
      // }
      if (route.url === path) {
        return route.name;
      }
    }
    return null;
  };
  return (
    <Navbar routeName={getRouteName(pathname)}>
      {children}
    </Navbar>
  );
}

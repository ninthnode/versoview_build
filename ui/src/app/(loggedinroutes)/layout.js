"use client";

import { useSelector } from "react-redux";
import Navbar from "@/components/Navbar";

export default function DashboardLayout({ children }) {

  return (
    <>
    <Navbar>
      {children}
    </Navbar>
    <div id="dialog-root"></div>
    </>
  );
}

"use client";

import Navbar from "@/components/Navbar";
import { useSelector } from "react-redux";

export default function DashboardLayout({ children }) {
  const userVerified = useSelector((s) => s.auth.userVerified);

  return (
    <Navbar>
      {userVerified&&children}
    </Navbar>
  );
}

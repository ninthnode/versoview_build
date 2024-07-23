import SidebarRoutes from "@/routes/SidebarRoutes";

const AuthRoutes = [
  {
    name: "Login",
    icon: "",
    isprivate: false,
    url: "/login",
  },
  {
    name: "Signup",
    icon: "",
    isprivate: false,
    url: "/signup",
  },
  {
    name: "PasswordReset",
    icon: "",
    isprivate: false,
    url: "/password-reset",
  },
  {
    name: "ForgotPassword",
    icon: "",
    isprivate: false,
    url: "/forgot-password",
  },
  {
    name: "VerifyCode",
    icon: "",
    isprivate: false,
    url: "/verify-code",
  },
];
const OtherRoutes = [
  {
    name: "Post",
    icon: "",
    isprivate: true,
    url: "/post",
  },
  {
    name: "Comments",
    icon: "",
    isprivate: true,
    url: "/comment",
  },
  {
    name: "Bookmarks",
    icon: "",
    isprivate: true,
    url: "/bookmarks",
  },
]

const DashboardRoutes = [...SidebarRoutes];
const RoutesList = [...DashboardRoutes, ...AuthRoutes,...OtherRoutes];
export { DashboardRoutes, AuthRoutes, RoutesList };

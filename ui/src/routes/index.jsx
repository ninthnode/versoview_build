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
  {
    name: "Channel",
    icon: "",
    isprivate: true,
    url: "/channel",
  },
  {
    name: "Choose Genre",
    icon: "",
    isprivate: true,
    url: "/choose-topics",
  }
]

const ProtectedRoutes = [...SidebarRoutes,...OtherRoutes];
const RoutesList = [...ProtectedRoutes, ...AuthRoutes,...OtherRoutes];
export { ProtectedRoutes, AuthRoutes, RoutesList };

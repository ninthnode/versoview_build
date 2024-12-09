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
  {
    name: "GoogleAuthProfile",
    icon: "",
    isprivate: false,
    url: "/google-auth",
  },
];
const OtherRoutes = [
  {
    name: "Post",
    icon: "",
    isprivate: true,
    showTitle: false,
    url: "/post",
  },
  {
    name: "Comments",
    icon: "",
    isprivate: true,
    showTitle: true,
    url: "/comment",
  },
  {
    name: "Bookmarks",
    icon: "",
    isprivate: true,
    showTitle: true,
    url: "/bookmarks",
  },
  {
    name: "Channel",
    icon: "",
    isprivate: true,
    showTitle: false,
    url: "/channel",
  },
  {
    name: "Choose Genre",
    icon: "",
    isprivate: true,
    showTitle: true,
    url: "/choose-topics",
  },
  {
    name: "Edition",
    icon: "",
    isprivate: true,
    showTitle: true,
    url: "/edition",
  },
]
const PublicRoutes = [
  {
    name: "Home",
    icon: "",
    isprivate: true,
    showTitle: false,
    url: "/home",
  },
  {
    name: "Post",
    icon: "",
    isprivate: true,
    showTitle: false,
    url: "/post",
  },
  {
    name: "Edition",
    icon: "",
    isprivate: true,
    showTitle: true,
    url: "/edition",
  },
  {
    name: "Channel",
    icon: "",
    isprivate: true,
    showTitle: false,
    url: "/channel",
  },
]



const RightSidebarRoutes = ['/home']

const ProtectedRoutes = [...SidebarRoutes,...OtherRoutes];
const RoutesList = [...ProtectedRoutes, ...AuthRoutes,...OtherRoutes];
export { ProtectedRoutes, AuthRoutes, RoutesList,PublicRoutes,RightSidebarRoutes };

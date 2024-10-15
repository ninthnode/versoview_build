import { IoHomeOutline,IoAddCircle } from "react-icons/io5";
import { CiSearch,CiBookmark,CiUser } from "react-icons/ci";

const SidebarRoutes = [
    { name: "Home", icon: IoHomeOutline,isprivate:true,url:'/home',showTitle:true },
    { name: "Explore", icon: CiSearch,isprivate:true,url:'/explore',showTitle:true },
    { name: "My Lists", icon: CiBookmark,isprivate:true,url:'/bookmarks',showTitle:true},
    { name: "Publish", icon: IoAddCircle,isprivate:true,url:'/publish',showTitle:true},
    { name: "Profile", icon: CiUser,isprivate:true,url:'/profile',showTitle:true}
  ];
  
  
export default SidebarRoutes;
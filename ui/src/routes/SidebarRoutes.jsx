import { IoHomeOutline,IoAddCircle } from "react-icons/io5";
import { CiSearch,CiBookmark,CiUser } from "react-icons/ci";

const SidebarRoutes = [
    { name: "Home", icon: IoHomeOutline,isprivate:true,url:'/home' },
    { name: "Explore", icon: CiSearch,isprivate:true,url:'/explore' },
    { name: "My Lists", icon: CiBookmark,isprivate:true,url:'/bookmarks'},
    { name: "Publish", icon: IoAddCircle,isprivate:true,url:'/publish'},
    { name: "Profile", icon: CiUser,isprivate:true,url:'/profile'}
  ];
  
  
export default SidebarRoutes;
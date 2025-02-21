"use client";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { verifyUser } from "@/redux/auth/authActions";
import { useRouter, usePathname } from "next/navigation";
import { ProtectedRoutes, AuthRoutes, RoutesList,PublicRoutes } from "@/routes/index";
import Loader from "@/components/Loader";
import { setPostEdit } from "@/redux/posts/postActions";
import {Image,Flex, Heading} from '@chakra-ui/react'
const PrivateRoute = ({ children }) => {
  const [userVerified, setUserVerified] = useState(false);
  const [userRedirecting, setUserRedirecting] = useState(false);
  const [showSplash, setShowSplash] = useState(true);
  const [loading, setLoading] = useState(true);
  const stateUser = useSelector((state) => state.auth.user?.user);
  const dispatch = useDispatch();
  const router = useRouter();
  const path = usePathname();

  useEffect(() => {
    const fetchData = async () => {
      let user =stateUser;
      try {
        if (path == "/publish") {
          await dispatch(setPostEdit(false, ""));
        } 
        if (!user) {
          const response = await dispatch(verifyUser());
          user = response?.user;
        }

        if (user) {
          if (
            AuthRoutes.find((route) => path == route.url) &&
            user &&
            !ProtectedRoutes.find((route) => path.startsWith(route.url))
          ) {
            router.push("/home");
            setUserRedirecting(true);
          }
        } else {
          if (
            !PublicRoutes.find((route) => path.startsWith(route.url))&&
            ProtectedRoutes.find((route) => path.startsWith(route.url))
          )
            router.push("/login");
        }
        setUserVerified(true);
      } catch (error) {
        console.log(error);
        router.push("/login");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [path]);


  const verifyExeceptionRoutes = ["/home", "/channel"];

  const RenderScreen = () => {
    const [delay, setDelay] = useState(true);
    useEffect(() => {
    const timer = setTimeout(() => {
      setShowSplash(false)
      setDelay(false);
    
    }, 3000); // Adjust timeout as needed

    return () => clearTimeout(timer); // Cleanup timeout on unmount
  }, []);
    if (verifyExeceptionRoutes.find((route) => path.startsWith(route)&&!showSplash)) {
      return children;
    }

      return userVerified&&!loading&&!userRedirecting &&!delay ? (
        children
      ) : (
        showSplash?
        <Flex h="100vh" z-index="9999" pos='fixed' top={0} left={0} border={0} right={0} justifyContent="center" alignItems="center" bg='#0D1627' flexDir="column">
        <Image src={"/assets/loader.png"} alt="preloaderLogo" height='80px' width='100px'/>
        <Heading size='md' color='#e5e5e5' mt='2'>VersoView</Heading>
        </Flex>
        :
       <Loader messages={null} showtext={false} />
    );
  };

  return (
      <RenderScreen messages={null} showtext={false} />
  );
};

export default PrivateRoute;

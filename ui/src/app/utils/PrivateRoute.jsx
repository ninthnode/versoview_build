'use client';
import React, { useEffect, useState } from 'react';
import { useDispatch,useSelector } from 'react-redux';
import { verifyUser } from '@/redux/auth/authActions';
import { useRouter, usePathname } from 'next/navigation';
import { DashboardRoutes, AuthRoutes, RoutesList } from '@/routes/index';
import Loader from '@/components/Loader';

const PrivateRoute = ({ children }) => {
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const dispatch = useDispatch();
  const router = useRouter();
  const path = usePathname();
  
  const [isVerified, setIsVerified] = useState(false);
  useEffect(() => {
    const fetchData = async () => {
      let user 
      try {
        if(!user&&!isVerified){
          user = await dispatch(verifyUser());
          setIsVerified(true);
        }
        if (user) {
          setIsAuthenticated(true);
          if(AuthRoutes.find((route) => path == route.url) &&user&& !path.startsWith('/choose-topics'))
            router.push('/home');
        }else{
          if(!AuthRoutes.find((route) => path.startsWith(route.url))&& !path.startsWith('/home')&& !path.startsWith('/post')&&!user)
            router.push('/login');
        }
      } catch (error) {
        router.push('/login');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [dispatch, router,path]);

  if (loading) {
    return <Loader messages={null} showtext={false} />;
  }

  if (AuthRoutes.find((route) => path.startsWith(route.url)) && isAuthenticated) {
    return <Loader messages={null} showtext={false} />;
  }
  return children;
};

export default PrivateRoute;

import { useState, useEffect } from "react";

const useDeviceType = () => {
  const [deviceType, setDeviceType] = useState(() => {
    return typeof window !== "undefined" && window.innerWidth < 600
      ? "mobile"
      : "desktop";
  });

  useEffect(() => {
    const detectDeviceType = () => {
      const width = window.innerWidth;
      if (width < 600) {
        setDeviceType("mobile");
      } else {
        setDeviceType("desktop");
      }
    };

    const handleResize = () => {
      detectDeviceType();
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return deviceType;
};

export default useDeviceType;

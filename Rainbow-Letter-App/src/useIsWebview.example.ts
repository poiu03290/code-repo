import { useEffect, useState } from "react";

const checkWebview = (windowObject: Window | string) => {
  if (!windowObject || typeof windowObject === "string") return false;

  const navigator = windowObject.navigator;
  const userAgent = navigator.userAgent;
  const normalizedUserAgent = userAgent.toLowerCase();
  const isIos =
    /ip(ad|hone|od)/.test(normalizedUserAgent) ||
    (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
  const isAndroid = /android/.test(normalizedUserAgent);
  const isSafari = /safari/.test(normalizedUserAgent);
  const isWebview =
    (isAndroid && /; wv\)/.test(normalizedUserAgent)) || (isIos && !isSafari);

  return isWebview;
};

const useIsWebview = (propsValue = false) => {
  const [isWebview, setIsWebview] = useState(
    propsValue || checkWebview(typeof window !== "undefined" ? window : "")
  );

  useEffect(() => {
    if (isWebview) return;
    const timeoutId = setTimeout(() => {
      if (typeof window !== "undefined" && window.ReactNativeWebView) {
        setIsWebview(true);
      }
    }, 100);

    return () => clearTimeout(timeoutId);
  }, []);

  return isWebview;
};

export default useIsWebview;

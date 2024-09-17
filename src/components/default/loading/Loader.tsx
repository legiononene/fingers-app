"use client";

import { useLayoutEffect, useState } from "react";
import { IoFingerPrintSharp } from "react-icons/io5";

import "./style.scss";

const Loader = () => {
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useLayoutEffect(() => {
    setTimeout(() => {
      setIsLoading(false);
      window.scrollTo(0, 0);
    }, 4500);
  }, []);

  return (
    <>
      {isLoading && (
        <section id="pageLoader">
          <IoFingerPrintSharp />
          <h1>Fingers App</h1>
          <p>connecting...</p>
        </section>
      )}
    </>
  );
};

export default Loader;

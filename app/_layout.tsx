import Layout from "@/components/Layout";
import React from "react";
import { StatusBar } from "react-native";
import "../global.css";

const _layout = () => {
  return (
    <>
      <Layout />
      <StatusBar
        barStyle={"light-content"}
        backgroundColor="transparent"
        translucent={true}
      />
    </>
  );
};

export default _layout;

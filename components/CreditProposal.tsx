import React from "react";
import { useWindowDimensions } from "react-native";
import RenderHtml from "react-native-render-html";

type Props = {
  terms?: string;
};

export default function CreditProposalScreen({ terms = "" }: Props) {
  const { width } = useWindowDimensions();
  return <RenderHtml contentWidth={width} source={{ html: terms }} />;
}

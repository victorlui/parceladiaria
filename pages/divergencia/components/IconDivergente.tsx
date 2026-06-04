import {
  FontAwesome5,
  FontAwesome6,
  Ionicons,
  MaterialCommunityIcons,
} from "@expo/vector-icons";
import React, { JSX } from "react";
type IconInfo = {
  icon: JSX.Element;
  bg: string;
};

const ICONS: Record<string, IconInfo> = {
  face: {
    icon: (
      <MaterialCommunityIcons
        name="face-recognition"
        size={24}
        color="#10B981"
      />
    ),
    bg: "#ECFDF5",
  },
  video: {
    icon: <Ionicons name="videocam" size={24} color="#3B82F6" />,
    bg: "#EFF6FF",
  },
  ganhos_app: {
    icon: <Ionicons name="videocam" size={24} color="#3B82F6" />,
    bg: "#EFF6FF",
  },
  palenca: {
    icon: <FontAwesome5 name="plug" size={24} color="black" />,
    bg: "#EFF6FF",
  },
  default: {
    icon: <FontAwesome6 name="camera" size={22} color="#A855F7" />,
    bg: "#FAF5FF",
  },
};

const getIconInfo = (item: string): IconInfo => {
  if (item === "face") return ICONS.face;
  if (item === "ganhos_app" || item.includes("video")) return ICONS.video;
  if (item === "palenca") return ICONS.palenca;
  return ICONS.default;
};

export default getIconInfo;

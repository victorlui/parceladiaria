import React, { memo, useMemo } from "react";
import { StyleSheet, Text, useWindowDimensions, View } from "react-native";
import RenderHTML, { MixedStyleDeclaration } from "react-native-render-html";

interface Props {
  termos: string;
}

const RenderTermos: React.FC<Props> = ({ termos }) => {
  const { width } = useWindowDimensions();
  const isSmallDevice = width < 360;
  const isMediumDevice = width >= 360 && width < 430;

  const cleanHtml = useMemo(() => {
    if (!termos) return "";

    return termos
      .replace(/<span[^>]*>/g, "")
      .replace(/<\/span>/g, "")
      .replace(/style="[^"]*"/g, "");
  }, [termos]);

  const renderers = {
    li: ({ TDefaultRenderer, ...props }: any) => (
      <View style={styles.li}>
        <Text style={styles.bullet}>•</Text>
        <View>
          <TDefaultRenderer {...props} />
        </View>
      </View>
    ),

    table: ({ TDefaultRenderer, ...props }: any) => (
      <View style={styles.table}>
        <TDefaultRenderer {...props} />
      </View>
    ),
    tr: ({ TDefaultRenderer, ...props }: any) => (
      <View style={styles.tr}>
        <TDefaultRenderer {...props} />
      </View>
    ),
    td: ({ TDefaultRenderer, ...props }: any) => (
      <View style={styles.td}>
        <TDefaultRenderer {...props} />
      </View>
    ),
    th: ({ TDefaultRenderer, ...props }: any) => (
      <View style={styles.th}>
        <TDefaultRenderer {...props} />
      </View>
    ),
  };

  const tagsStyles = {
    h2: {
      fontWeight: "bold",
      fontSize: isSmallDevice ? 15 : isMediumDevice ? 16 : 17,
      lineHeight: isSmallDevice ? 22 : isMediumDevice ? 24 : 26,
      marginTop: isSmallDevice ? 16 : 18,
      marginBottom: 8,
      color: "#233047",
    },
    p: {
      fontSize: isSmallDevice ? 13 : isMediumDevice ? 14 : 15,
      marginBottom: isSmallDevice ? 10 : 12,
      lineHeight: isSmallDevice ? 22 : isMediumDevice ? 24 : 26,
      color: "#334155",
    },
    strong: {
      fontWeight: "bold",
      color: "#0F172A",
    },
    ul: {
      paddingLeft: 0,
      marginVertical: isSmallDevice ? 10 : 12,
    },
  };

  return (
    <RenderHTML
      contentWidth={width}
      source={{ html: cleanHtml }}
      renderers={renderers}
      tagsStyles={tagsStyles as Record<string, MixedStyleDeclaration>}
    />
  );
};

const styles = StyleSheet.create({
  table: {
    borderWidth: 0,
    marginVertical: 12,
  },
  tr: {
    flexDirection: "row",
  },
  td: {
    flex: 1,
    padding: 8,
  },
  th: {
    flex: 1,
    padding: 8,
    flexDirection: "row",
  },
  li: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 10,
  },
  bullet: {
    marginRight: 8,
    fontSize: 18,
    lineHeight: 24,
    color: "#233047",
  },
});

export default memo(RenderTermos);

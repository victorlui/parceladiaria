import React, { memo, useMemo } from "react";
import { StyleSheet, Text, useWindowDimensions, View } from "react-native";
import RenderHTML, { MixedStyleDeclaration } from "react-native-render-html";

interface Props {
  termos: string;
}

const RenderTermos: React.FC<Props> = ({ termos }) => {
  const { width } = useWindowDimensions();

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
      fontSize: 14,
      marginTop: 12,
      marginBottom: 6,
      color: "#0F172A",
    },
    p: {
      fontSize: 13,
      marginBottom: 8,
      lineHeight: 18,
    },
    strong: {
      fontWeight: "bold",
    },
    ul: {
      paddingLeft: 0,
      marginVertical: 8,
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
  webviewContainer: {
    flex: 2,
    height: 300,
  },

  // 🔥 tabela
  table: {
    borderWidth: 0,

    marginVertical: 10,
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
    marginBottom: 8,
  },
  bullet: {
    marginRight: 8,
    fontSize: 28,
    lineHeight: 20,
  },
});

export default memo(RenderTermos);

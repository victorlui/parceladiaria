import React from "react";
import {
  ScrollView,
  StyleSheet,
  useWindowDimensions,
  View,
} from "react-native";
import RenderTermos from "./render-termos";

export const TermosBody = React.memo(function TermosBody({
  termos,
}: {
  termos: string;
}) {
  const { width } = useWindowDimensions();
  const styles = getStyles(width);

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          nestedScrollEnabled
        >
          <RenderTermos termos={termos} />
        </ScrollView>
      </View>
    </View>
  );
});

const getStyles = (width: number) => {
  const isSmallDevice = width < 360;
  const isMediumDevice = width >= 360 && width < 430;

  return StyleSheet.create({
    container: {
      flex: 1,
      paddingTop: isSmallDevice ? 16 : 20,
    },
    title: {
      fontSize: isSmallDevice ? 17 : isMediumDevice ? 18 : 20,
      lineHeight: isSmallDevice ? 24 : isMediumDevice ? 27 : 30,
      fontWeight: "700",
      color: "#233047",
      marginBottom: isSmallDevice ? 14 : 16,
    },
    content: {
      flex: 1,
      minHeight: 0,
    },
    scrollView: {
      flex: 1,
    },
    scrollContent: {
      paddingBottom: 24,
    },
  });
};

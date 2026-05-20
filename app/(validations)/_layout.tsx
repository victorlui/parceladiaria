import { Stack } from "expo-router";
import React, { Component } from "react";

export default class ValidationLayout extends Component {
  render() {
    return (
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="phone_email" />
      </Stack>
    );
  }
}

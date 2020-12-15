import React, { useState, useCallback, useEffect } from 'react'
import Chat from'./src/Chat'
import Room from'./src/Room'
import Login from'./src/Login'
import Register from'./src/Register'
import RoomList from'./src/RoomList'
import { createAppContainer, createSwitchNavigator } from "react-navigation"

const AppSwitchNavigator = createSwitchNavigator({
  Register: { screen: Register },
  // Room: { screen: Room },
  RoomList: { screen: RoomList },
  Chat: { screen: Chat }
});

const App = createAppContainer(AppSwitchNavigator);

export default App;
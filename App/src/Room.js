import React, { useState, useEffect } from 'react';
import { Text, TextInput, View, Button } from 'react-native';
import io from 'socket.io-client';
import axios from 'axios';
import { GoogleSignin, GoogleSigninButton, statusCodes } from "react-native-google-signin";
import {SERVER_URL} from '@env';

const socket = io(SERVER_URL);

const CreateRoom = ({navigation}) => {
  const [text, setText] = useState('');
  const [user, setUser] = useState('');

  useEffect(() => {
    async function getUser() {
      const currentUser = await GoogleSignin.getCurrentUser();
      setUser(currentUser);
      await axios
        .post(process.env.serverUrl + '/login/', {
                name: currentUser.user.name,
                id: currentUser.user.id,
                photo: currentUser.user.photo,
        })
        .catch(function(error) {
                console.log("Hell");
                console.log(error);
        });
      }
      getUser()
  },[]);
  return (
    // Flatlist aaegi iski jagah
    <View style={{padding: 10}}>
      <TextInput
        style={{height: 40}}
        placeholder="Type here to translate!"
        onChangeText={text => setText(text)}
        defaultValue={text}
      />
      <Button
        title="Create Room"
        onPress={() => {
          socket.emit('new-user', "Hello", "John")
          console.log("Create")
          navigation.navigate('Chat')
          axios
          .post(process.env.serverUrl + '/chats/', {
              sender: user.user.id, //sender_id
              reciever: "recieveridbyflatlist",
              messages:[]
          })
          .catch(function(error) {
                  console.log("Hell");
                  console.log(error);
           });
          }
        }
      />
    </View>
  );
}

export default CreateRoom;
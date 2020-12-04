import React, { useState, useEffect } from 'react';
import { Text, TextInput, View, Button } from 'react-native';
import io from 'socket.io-client';
import axios from 'axios';
import { GoogleSignin, GoogleSigninButton, statusCodes } from "react-native-google-signin";

const socket = io('http://192.168.43.119:3000');

const CreateRoom = ({navigation}) => {
  const [text, setText] = useState('');
  const [user,setUser] = useState('');

  getCurrentUser = async () => {
    const currentUser = await GoogleSignin.getCurrentUser();
    setUser(currentUser);
    console.log(user);
  };

  useEffect(() => {
    getCurrentUser()
    axios
      .post('http://192.168.43.119:8000' + '/login/', {
              name: "userhook",
              id: "_id",
              photo: "photo",
      })
      .catch(function(error) {
              console.log("Hell");
              console.log(error);
       });
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
          .post('http://192.168.43.119:8000' + '/chats/', {
              sender: "userhookid", //sender_id
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
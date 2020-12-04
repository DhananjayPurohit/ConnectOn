import React, { useState } from 'react';
import { Text, TextInput, View, Button } from 'react-native';
import io from 'socket.io-client';
import axios from 'axios';

const socket = io('http://192.168.43.119:8000');

const CreateRoom = ({navigation}) => {
  const [username, setUsername] = useState('');
  return (
    <View style={{padding: 10}}>
      <TextInput
        style={{height: 40}}
        placeholder="Type Username"
        onChangeText={username => setUsername(username)}
        defaultValue={username}
      />
      <Button
        title="Create User"
        onPress={() => {
          axios
            .post('http://192.168.43.119:8000' + '/login/', {
              name: username,
              id: "ABCDID",
              photo: 'https://placeimg.com/140/140/any',
            })
            .catch(function(error) {
              console.log("Hell");
              console.log(error);
            });
            navigation.navigate('Room')
          }}
      />
    </View>
  );
}

export default CreateRoom;
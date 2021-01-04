import React, { useState, useCallback, useEffect } from 'react'
import { GiftedChat } from 'react-native-gifted-chat'
import io from 'socket.io-client'
import axios from 'axios';
import {SERVER_URL} from '@env';

var socket = io(SERVER_URL);

const Chat = ({navigation}) =>  {
  const [messages, setMessages] = useState([]);
  const sender=navigation.getParam('sender',null);
  const receiver=navigation.getParam('receiver',null);
  useEffect(() => {
    const url=`${SERVER_URL}/chats/${sender.id}/${receiver.id}`;
    fetch(url)
      .then((res) => res.json())
      .then((res) => {
        console.log("R"+res);
        setMessages(res);
      })
      .catch((error) => {
        console.log(error);
      });
    setMessages([
      {
        _id: 1,
        text: 'Hello developer',
        createdAt: new Date(),
        user: {
          _id: 2,
          name: 'React Native',
          avatar: 'https://placeimg.com/140/140/any',
        },
      },
    ])
    socket.on("chat message", msg => {
      setMessages([...messages, msg]);
    });
  }, [])
 
  const onSend = useCallback((messages = []) => {
    setMessages(previousMessages => GiftedChat.append(previousMessages, messages))
    socket.emit('newMessage', messages)
    axios
        .post(SERVER_URL + '/chats', {
                sender: sender.id,
                receiver: receiver.id,
                messages: messages
        })
        .catch(function(error) {
                console.log("Hell");
                console.log(error);
        });
    console.log(sender.id+" "+receiver.id)
  }, [])

  // const onSend = async (message = []) => { const newMessages = await GiftedChat.append(messages, message) 
  //   socket.on('send-chat-message', newMessages => { setMessages(newMessages) }); socket.emit('chat-message', newMessages); }
 
  return (
    <GiftedChat
      messages={messages}
      onSend={messages => onSend(messages)}
      user={{
        _id: 1,
      }}
    />
  )
}
export default Chat;
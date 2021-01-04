import React, {Component} from 'react';
import {View, Text, FlatList, ActivityIndicator} from 'react-native';
import {ListItem, SearchBar, Avatar} from 'react-native-elements';
import { TouchableHighlight } from 'react-native-gesture-handler';
import { GoogleSignin, GoogleSigninButton, statusCodes } from "react-native-google-signin";
import axios from 'axios';
import io from 'socket.io-client';
import {SERVER_URL} from '@env';

const socket = io(SERVER_URL);

console.log(SERVER_URL);

class FlatListDemo extends Component {
  constructor(props) {
    super(props);

    this.state = {
      user: null,
      loading: false,
      data: [],
      error: null,
    };

    this.arrayholder = [];
  }

  componentDidMount() {
    this.makeRemoteRequest();
    const getUser = async() => {
      const currentUser = await GoogleSignin.getCurrentUser();
      await axios
        .post(SERVER_URL + '/login/', {
                name: currentUser.user.name,
                id: currentUser.user.id,
                photo: currentUser.user.photo,
        })
        .catch(function(error) {
                console.log("Hell");
                console.log(error);
        });
        this.setState({user: currentUser});
      }
      getUser()
  }

  makeRemoteRequest = () => {
    const url = `${SERVER_URL}/find/all`;
    this.setState({loading: true});

    fetch(url)
      .then((res) => res.json())
      .then((res) => {
        this.setState({
          data: res,
          error: res.error || null,
          loading: false,
        });
        this.arrayholder = res.results;
      })
      .catch((error) => {
        this.setState({error, loading: false});
      });
  };

  renderSeparator = () => {
    return (
      <View
        style={{
          height: 1,
          width: '86%',
          backgroundColor: '#CED0CE',
          marginLeft: '14%',
        }}
      />
    );
  };

  searchFilterFunction = (text) => {
    this.setState({
      value: text,
    });

    const newData = this.arrayholder.filter((item) => {
      const itemData = `${item.name.title.toUpperCase()} ${item.name.first.toUpperCase()} ${item.name.last.toUpperCase()}`;
      const textData = text.toUpperCase();

      return itemData.indexOf(textData) > -1;
    });
    this.setState({
      data: newData,
    });
  };

  renderHeader = () => {
    return (
      <SearchBar
        placeholder="Type Here..."
        lightTheme
        round
        onChangeText={(text) => this.searchFilterFunction(text)}
        autoCorrect={false}
        value={this.state.value}
      />
    );
  };

  render() {
    if (this.state.loading) {
      return (
        <View style={{flex: 1, alignItems: 'center', justifyContent: 'center'}}>
          <ActivityIndicator />
          <Text>Hello</Text>
        </View>
      );
    }
    return (
      <View style={{flex: 1}}>
        <FlatList
          data={this.state.data}
          renderItem={({item}) => (
            <ListItem onPress={() => {
              axios
                .post(SERVER_URL + '/chats/', {
                  sender: this.state.user.user.id, //sender_id
                  reciever: item.id,
                  messages: [],
                })
                .catch(function (error) {
                  console.log('Hell');
                  console.log(error);
                });
              socket.emit('storeClientInfo', this.state.user);
              console.log('Create');
              this.props.navigation.navigate('Chat',{
                sender: this.state.user.user,
                receiver: item
              });
            }}
              bottomDivider>
              <Avatar source={{uri: item.photo}} />
              <ListItem.Content>
                <ListItem.Title>{item.name}</ListItem.Title>
                {/* <ListItem.Subtitle>{item.subtitle}</ListItem.Subtitle> */}
              </ListItem.Content>
              <ListItem.Chevron />
            </ListItem>
          )}
          keyExtractor={(item) => item._id}
          ItemSeparatorComponent={this.renderSeparator}
          ListHeaderComponent={this.renderHeader}
        />
      </View>
    );
  }
}

export default FlatListDemo;

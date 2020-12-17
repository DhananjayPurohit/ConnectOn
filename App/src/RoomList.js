import React, {Component} from 'react';
import {View, Text, FlatList, ActivityIndicator} from 'react-native';
import {ListItem, SearchBar, Avatar} from 'react-native-elements';
import { TouchableHighlight } from 'react-native-gesture-handler';
import { GoogleSignin, GoogleSigninButton, statusCodes } from "react-native-google-signin";
import axios from 'axios';
import io from 'socket.io-client';

const socket = io(process.env.serverUrl);

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
        .post(process.env.serverUrl + '/login/', {
                name: currentUser.user.name,
                id: currentUser.user.id,
                photo: currentUser.user.photo,
        })
        .catch(function(error) {
                console.log("Hell");
                console.log(error);
        });
        this.setState({user: currentUser});
        console.log("H"+this.state.user)
      }
      getUser()
  }

  makeRemoteRequest = () => {
    const url = `${process.env.serverUrl}/find/all`;
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
        console.log('Hey' + this.state.data);
        console.log('Hey' + this.arrayholder);
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
                .post(process.env.serverUrl + '/chats/', {
                  sender: this.state.user._id, //sender_id
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
                sender: this.state.user,
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

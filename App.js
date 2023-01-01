import { StatusBar } from 'expo-status-bar';
import { Component } from 'react';
import { SafeAreaView, StyleSheet, Text, View, Image, Alert, Modal } from 'react-native';
import { Pressable, Button, TextInput } from "@react-native-material/core";
import ImageViewer from 'react-native-image-zoom-viewer';
import * as ImagePicker from 'expo-image-picker';

class App extends Component {
  default_state = {
    modalVisible: false,
    connDialogVis: false,
    imageURL: null,
    responseImg: null,
    imageURL: null,
    imageEnc: null,
    uploaded: false,
  };

  state = {
    modalVisible: false,
    appName: null,
    connection: null,
    connectURL: null,
    connDialogVis: false,
    imageURL: null,
    responseImg: null,
    imageURL: null,
    imageEnc: null,
    uploaded: false,
  }

  // An helper function to save submitted URL
  connOnTextChange = (text) => {
    this.setState({ connectURL: text });
  }

  // Custom Modal to trigger a dialog box where can the user enter the API endpoint
  ModalInput = ({ onTextChange, onSubmit, visible, value, toggle }) => {

    return (
    <Modal visible={visible} transparent={true} style={{justifyContent:'center'}}>
      <View
        style={{
          width:"100%",
          position:"absolute",
          bottom:0,
          backgroundColor: "white",
          borderTopLeftRadius: 20,
          borderTopRightRadius: 20,
       
          shadowColor: "#000",
          shadowOffset: {
            width: 0,
            height: 2
          },
          shadowOpacity: 0.25,
          shadowRadius: 4,
          elevation: 5
          }}>
          <Text style={{alignSelf: 'center'}}> Enter the API link </Text>
        <TextInput
          value={value}
          onChangeText={(text) => {onTextChange(text)}}
          placeholder={'Enter text'}
        />
        <View style={{ flexDirection: 'row', alignSelf: 'center' }}>
          <Button title="close" onPress={toggle} />
          <Button title="ok" onPress={onSubmit} />
        </View>
      </View>
    </Modal>
    );

  };

  // This function picks an image from the phone gallery
  pickImage = async() => {
    // No permissions request is necessary for launching the image library
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,    // Only images listed
      allowsEditing: true,                                // User can edit the image
      base64: true,                                       // Image will be stored as base64
      aspect: [4, 3],                                     // The image will be (4, 3) ratio
      quality: 1,                                         // Save with 100% quality
    });

    // Save image to the current state
    if (!result.canceled){
      this.setState({
        'imageURL': result.assets[0].uri,
        'imageEnc': result.assets[0].base64,
        'uploaded': true,
      });
    };
  };

  // An helper function to switch a pane's visibility
  setModalVisible = (visible) => {
    this.setState({ modalVisible: visible });
  }

  setConnDialogVis = (visible) => {
    this.setState({ connDialogVis: visible });
  }

  // Captures an image by using the phone camera
  captureImage = async () => {
    const permissionResult = await ImagePicker.requestCameraPermissionsAsync();

    // Check permission
    if (permissionResult.granted === false){
      alert("No permission");
      return;
    }

    // Launch and capture photo
    let result = await ImagePicker.launchCameraAsync({
      base64: true,
      quality: 1,
    });

    // Log the first 10 char for debugging purposes
    let imageAsset = result.assets[0]
    console.log(imageAsset.base64.slice(0, 10));

    // Save the picture to the current state
    if (!result.canceled) {
      this.setState({
        'imageURL': imageAsset.uri,
        'imageEnc': imageAsset.base64,
        'uploaded': true,
      }
      );
      //this.calc_imdimensions(this.state.imageEnc);
    }
  }


  // Reset the app to the initial state
  resetApp = () => {
    
    this.setState({
      ...this.default_state
    });

    console.log("App is restarted!");
  }

  // This function checks the connection to the API
  // If there is no connection show a alert box to the user
  checkConnection(){
    const connStyle = StyleSheet.create({
      textDiv: {
        flex: 1,
        backgroundColor: "white",
        alignItems: "center",
        justifyContent: "center"
      }
    });

    // If the connection is successful show App Name on top
    // Else "No Connection"
    if(this.state.connection)
      return (
        <View style={connStyle.textDiv}>
        <Text style={{ color: "green" }}>Connected:{this.state.appName}</Text>
      </View>
      );
    return (
      <View style={connStyle.textDiv}>
        <Text style={{ color: "red" }}>No Connection!</Text>
      </View>
    );  
  }

  // Helper function to handle API endpoint url submit button
  apiURLSubmit = (setVis, visibility) => {
    setVis(!visibility);
    this.connect();
  }

  // Handles the inital connection to the API and retrieves app name
  connect = () => {
    fetch(this.state.connectURL).then((res) =>
      res.json().then((data => {
        console.log(data);
        console.log(data.message);
        this.setState({ appName: data.message, connection: true });
      })
      ));
    if (this.state.Name === null || this.state.Name === null){
      console.log("Connection lost!");
    } else {
      return true;
    }
  };


  // This function sends the input image to the API and retrives the processed
  // image. Processed image is saved on the session memory and shown on the screen
  sendImage = (ev) => {
    ev.preventDefault();
    const data = new FormData();
    data.append('img_enc', this.state.imageEnc);
    fetch(this.state.connectURL + "/image", {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data),
    }).then(response => {
      response.json().then(data => 
        {
          this.setState({
            responseImg: data.response,
            runtime: data.runtime
          });
          console.log(this.state.responseImg.slice(0, 10))
          console.log("Image read from server");
          console.log(this.state.runtime);
        });
    })
    .catch(error => console.log(error));
    //TODO

  };

  // Custom Text model to display the runtime of the API to process the image
  CustomText = (props) => {
    const text = props.text.split(' ');
    return <Text>{text.map(text => {
      if (text.startsWith('@')) {
        return <Text style={{ color: 'green' }} key="coloredtext">{this.state.runtime} </Text>;
      }
      return `${text} `;
    })}</Text>;
  };

  render() {

    let images;
    if (this.state.responseImg) {
      images = [{ url: 'data:image/jpeg;base64,' + this.state.responseImg}]
    } else {
      images = [{ url: '', props: {source: require('./assets/logo.jpg')}}]
    }
    const { modalVisible } = this.state;

    return (
      <SafeAreaView style={styles.container}>
        {this.checkConnection()}

        {/* 
          Input image Container.
          Placeholder image in default. After touch there is an option box
          where you can upload/capture image from the phone. And the input
          image is shown.  
        */}
        <View style={styles.inputImageContainer}>
          <Pressable style={styles.imageTouch} onPress={() => {
            if (this.state.uploaded){

            } else {
              Alert.alert("Upload", "Upload an image", [
                {text: "Use Camera", onPress: this.captureImage},
                {text: "Choose from Gallery", onPress: this.pickImage},
                {text: "Cancel", style: "Cancel"}
              ]);
            }
            }}>
            <Image source={(this.state.imageURL) ? {uri:this.state.imageURL} : require('./assets/logo.jpg')} style={styles.imageContain} />
          </Pressable>
        </View>

        {/* 
          Button Container.
          There is a row of buttons which responsible for main operations.
          Connect button: Opens a popup to insert API endpoint URL.
          Load button: Sends image to the server.
          Reset: Resets the app to the initial conditions.  
        */}
        <View style={styles.middleContainer}>
          <View style={styles.mainButtonContainer}>
            <View style={styles.buttonContainer}>
              <this.ModalInput 
                visible={this.state.connDialogVis} 
                value={this.state.connectURL} 
                onTextChange={this.connOnTextChange} 
                toggle={()=>this.setConnDialogVis(!this.state.connDialogVis)}
                onSubmit={() => this.apiURLSubmit(this.setConnDialogVis, this.state.connDialogVis)}
                />

              <Button title="Connect" compact onPress={() => this.setConnDialogVis(!this.state.connDialogVis)} />

            </View>
            <View style={styles.buttonContainer}>
              <Button title='Load' onPress={this.sendImage} compact="True"/>
            </View>
            <View style={styles.buttonContainer}>
              <Button title='Reset' onPress={this.resetApp} compact="True"/>
            </View>
          </View>
          {this.state.responseImg && 
            <View style={styles.textContainer}>
              <this.CustomText text="The runtime is @ seconds"/>
            </View>
          }
        </View>
        {/* 
          Output Image Container.
          This container display the processed image by the API.
          When the user press on the image, can view on full screen.
        */}
        <View style={styles.outputImageContainer}>
          <Pressable style={styles.imageTouch} onPress={() => {
            this.setModalVisible(!modalVisible);
          }}>
            <Modal visible={modalVisible} transparent={true} onRequestClose={() => {
                //Alert.alert("Close");
                this.setModalVisible(!modalVisible);
            }}>
              <ImageViewer imageUrls={images}/>
            </Modal>
            <Image source={(this.state.responseImg) ? { uri: 'data:image/jpeg;base64,' + this.state.responseImg } : require('./assets/logo.jpg')} style={styles.imageContain} />
          </Pressable>
        </View>

      </SafeAreaView>
    )
  }

}


const styles = StyleSheet.create({
  container: {
    backgroundColor: "#fff",
    flex: 1,
    top: Platform.OS === "android" ?  StatusBar.currentHeight : 0,
  },

  imageContain: {
    width: "100%",
    height: "100%",
    resizeMode: "contain",
  },

  imageTouch: {
    //justifyContent: "center",
    //alignContent: "center",
  },

  inputImageContainer: {
    flex: 9,
    backgroundColor: "tomato"
  },

  middleContainer: {
    flex: 2,
    backgroundColor: "darkblue"
  },

  textContainer: {
    flex: 1,
    backgroundColor: "white",
    alignItems: "center",
    justifyContent: "center"
  },

  mainButtonContainer: {
    flex: 2,
    backgroundColor: "green",
    flexDirection: "row",
    justifyContent: "space-around"
  },

  buttonContainer: {
    flex: .25, 
    backgroundColor: "red",
    justifyContent: "center",
  },

  outputImageContainer: {
    flex: 9,
    backgroundColor: "violet",
    justifyContent: "center",
  },
})

export default App;
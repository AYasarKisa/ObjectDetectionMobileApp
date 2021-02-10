import React from 'react';
import {
  SafeAreaView,
  StyleSheet,
  Text,
  View,
  Image,
  Platform,
  PermissionsAndroid,
  ScrollView,
  Alert,
} from 'react-native';

import {
  launchCamera,
  launchImageLibrary
} from 'react-native-image-picker';

import Header from './src/Header';
import Buton from './src/Buton';
import firebase from './src/Firebase';
import { nanoid } from 'nanoid/non-secure';
import ImgToBase64 from 'react-native-image-base64';





export default class App extends React.Component {


  state = {
    GoogleApiKey: '****',
    secilenResim: '',
    resimSecildiMi: 'false',
    resimUploadEdildiMi: 'false',
    buluttakiResimUri: '',


    apiyeYuklendiMi: false,
    apininVerileri: false,
    apiDonusu: false,

    resimbase64: '',
    localizedObjects: '',

  };


  /*
    ImagePicker kullanilirken kaynaktaki site kullanildi:
    https://aboutreact.com/example-of-image-picker-in-react-native/
  */
  kameraIzinIstegi = async () => {
    if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.CAMERA,
          {
            title: 'Kamera İzini',
            message: 'Uygulamanin kamera kullanım iznine ihtiyacı var',
          },
        );

        return granted === PermissionsAndroid.RESULTS.GRANTED;
      } catch (err) {
        console.warn(err);
        return false;
      }
    } else return true;
  };

  dosyaYazmakIcinIzinIstegi = async () => {
    if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
          {
            title: 'Harici Depolama Yazma İzni',
            message: 'Uygulamanın yazma iznine ihtiyacı var',
          },
        );
        // Eger yazma izni verildiyse
        return granted === PermissionsAndroid.RESULTS.GRANTED;
      } catch (err) {
        console.warn(err);
        alert('Yazma izini hatasi', err);
      }
      return false;
    } else return true;
  };

  goruntuYakalama = async () => {
    let options = {
      mediaType: 'photo',
      maxWidth: 300,
      maxHeight: 550,
      quality: 1,
      videoQuality: 'low',
      durationLimit: 30,
      saveToPhotos: true,
      base64: true,

    };
    let isCameraPermitted = await this.kameraIzinIstegi();
    let isStoragePermitted = await this.dosyaYazmakIcinIzinIstegi();
    if (isCameraPermitted && isStoragePermitted) {
      launchCamera(options, (response) => {
        console.log('Response = ', response);

        if (response.didCancel) {
          alert('Kullanici kameradan Çıktı');
          return;
        } else if (response.errorCode == 'camera_unavailable') {
          alert('Cihazda kamera yok');
          return;
        } else if (response.errorCode == 'permission') {
          alert('Kamera İzni Verilmedi');
          return;
        } else if (response.errorCode == 'others') {
          alert(response.errorMessage);
          return;
        }
        console.log('base64 -> ', response.base64);
        console.log('uri -> ', response.uri);
        console.log('width -> ', response.width);
        console.log('height -> ', response.height);
        console.log('fileSize -> ', response.fileSize);
        console.log('type -> ', response.type);
        console.log('fileName -> ', response.fileName);
        this.setState({ secilenResim: response });
        this.setState({ resimSecildiMi: 'true' });
      });
    }
  };

  resimSec = () => {
    let options = {
      mediaType: 'photo',
      maxWidth: 300,
      maxHeight: 550,
      quality: 1,

    };
    launchImageLibrary(options, (response) => {
      console.log('Response = ', response);

      if (response.didCancel) {
        alert('Kullanici resim seciminden');
        return;
      } else if (response.errorCode == 'camera_unavailable') {
        alert('Resimlere Erişilemiyor(Cihazda yok)');
        return;
      } else if (response.errorCode == 'permission') {
        alert('Erişim İzni Verilmedi');
        return;
      } else if (response.errorCode == 'others') {
        alert(response.errorMessage);
        return;
      }
      console.log('base64 -> ', response.base64);
      console.log('uri -> ', response.uri);
      console.log('width -> ', response.width);
      console.log('height -> ', response.height);
      console.log('fileSize -> ', response.fileSize);
      console.log('type -> ', response.type);
      console.log('fileName -> ', response.fileName);
      this.setState({ secilenResim: response });
      this.setState({ resimSecildiMi: 'true' });

    });
  };

  resimSecilmediHatasi = () => {

    console.log('Resim secilmedi. ilk once resim secilmesi lazim')
    Alert.alert("Uyarı", 'Resim Seçmediniz! İlk önce resim seçmeniz gerekyor.');
    return;


  };

  resimUploadHatasi = () => {

    console.log('Resim Daha Upload Edilmedi !!!')
    Alert.alert("Uyarı", 'Resim Upload Ediliyor Lütfen Bekleyiniz');
    return;


  };



  resmiUploadEt = async (resim) => {

    resminVeriTabanindakiKonumu = await resmiFirebaseGonder(resim);
    this.setState({ buluttakiResimUri: resminVeriTabanindakiKonumu });
    this.setState({ resimUploadEdildiMi: 'true' });

    ImgToBase64.getBase64String(this.state.secilenResim.uri)
      .then(base64String => this.setState({ resimbase64: base64String }))
      .catch(err => console.log(err));
  };


  /*
    Google Vision Api de kullanilan site: 
    https://medium.com/@mlapeter/using-google-cloud-vision-with-expo-and-react-native-7d18991da1dd
  */
  googleApiyeGonder = async () => {
    try {
      this.setState({ apiyeYuklendiMi: true });
      let { buluttakiResimUri } = this.state;
      let body = JSON.stringify({
        requests: [
          {
            features: [
              { type: 'OBJECT_LOCALIZATION', maxResults: 10 },

            ],
            image: {
              content: this.state.resimbase64
            }
          }
        ]
      });
      let response = await fetch(
        'https://vision.googleapis.com/v1/images:annotate?key=' +
        this.state.GoogleApiKey,
        {
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json'
          },
          method: 'POST',
          body: body
        }
      );


      let googleYaniti = await response.json();



      this.setState({
        apininVerileri: googleYaniti,
        apiyeYuklendiMi: false,
        localizedObjects: googleYaniti.responses[0].localizedObjectAnnotations,
        apiDonusu: true,
      });
    } catch (error) {
      console.log(error);
    }
  };


  render() {
    return (
      <SafeAreaView style={{ flex: 1 }}>
        <ScrollView>

          <Header>Obje Bulma Uygulama</Header>
          <View style={styles.container}>



            <Image
              source={{ uri: this.state.secilenResim.uri }}
              style={styles.imageStyle}
            />

            <Text style={styles.textStyle, { marginBottom: 15, fontSize: 13 }}>Seçilen Resim</Text>

            <Buton
              onPress={() => this.goruntuYakalama()}>
              Resim Çek
            </Buton>
            <Buton
              onPress={() => this.resimSec()}>
              Galeriden Resim Seç
            </Buton>

            <Buton
              //burada eger true ya giriyorsa resmi gonderiyoruz false ise resim secimi icin hata basiyoruz ekrana
              onPress={() => {

                if (this.state.resimSecildiMi === 'true') {
                  console.log('Resim Veritabanina Upload Ediliyor');
                  this.resmiUploadEt(this.state.secilenResim.uri);


                }
                else if (this.state.resimSecildiMi === 'false') {
                  this.resimSecilmediHatasi();
                }
              }}>
              Resmi Upload Et
            </Buton>

            <Buton
              onPress={() => {

                if (this.state.resimUploadEdildiMi === 'true') {
                  console.log('Resim Google Vision Api ye Gonderiliyor');
                  this.googleApiyeGonder();

                }
                else if (this.state.resimUploadEdildiMi === 'false') {
                  this.resimUploadHatasi();
                }
              }}>
              Resmi Analiz Et
      </Buton>


          </View>

          <View style={styles.container2}>
            <Text>Sonuç</Text>
            {this.state.secilenResim && this.state.secilenResim.uri && this.state.apiDonusu ? ( // dikdörtgenleri ve image i çizer

              <View >
                {this.state.localizedObjects
                  ? this.state.localizedObjects.map((nesne, key) => {
                    let point1 = nesne.boundingPoly.normalizedVertices[0];
                    let point2 = nesne.boundingPoly.normalizedVertices[1];
                    let point3 = nesne.boundingPoly.normalizedVertices[2];
                    let point4 = nesne.boundingPoly.normalizedVertices[3];
                    console.log('Nesne:  \n');
                    console.log(nesne.name);
                    console.log(point1);
                    console.log(point2);
                    console.log(point3);
                    console.log(point4);
                    console.log('Resmin Ozellikleri:\n');
                    console.log(this.state.secilenResim.width);
                    console.log(this.state.secilenResim.height);
                    console.log(key);
                    return (
                      <View key={key}>
                        <Text
                          style={{
                            fontSize: 9,
                            color: 'red',
                            zIndex: key + 1,
                            top: point1.y * this.state.secilenResim.height,
                            left: point1.x * this.state.secilenResim.width,
                            position: 'absolute',

                          }}>
                          {nesne.name}
                        </Text>
                        <View
                          style={{
                            height: (point4.y - point1.y) * this.state.secilenResim.height,
                            width: (point2.x - point1.x) * this.state.secilenResim.width,
                            borderColor: 'yellow',
                            position: 'absolute',
                            borderWidth: 1,
                            zIndex: key + 1,
                            top: point1.y * this.state.secilenResim.height,
                            left: point1.x * this.state.secilenResim.width,

                          }}
                        />
                      </View>
                    );
                  })
                  : null}
                <Image
                  resizeMode={'contain'}
                  style={{
                    width: this.state.secilenResim.width,
                    height: this.state.secilenResim.height,
                    flex: 1,
                    alignItems: 'center',

                  }}
                  source={{
                    uri: this.state.secilenResim.uri,
                  }}
                />
              </View>
            ) : null}

          </View>


        </ScrollView>

      </SafeAreaView>
    );
  }




}


/*
  Firebase i kullanmak icin faydanilan site:
  https://blog.jscrambler.com/create-a-react-native-image-recognition-app-with-google-vision-api/
*/
async function resmiFirebaseGonder(uri) {
  const blob = await new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.onload = function () {
      resolve(xhr.response);
    };
    xhr.onerror = function (e) {
      console.log(e);
      reject(new TypeError('Network request failed'));
    };
    xhr.responseType = 'blob';
    xhr.open('GET', uri, true);
    xhr.send(null);
  });

  const ref = firebase
    .storage()
    .ref()
    .child(nanoid());
  const snapshot = await ref.put(blob);

  blob.close();

  return await snapshot.ref.getDownloadURL();
}




const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
    backgroundColor: '#fff',
    alignItems: 'center',

  },
  textStyle: {
    padding: 10,
    color: 'black',
    textAlign: 'center',
  },

  imageStyle: {
    width: 200,
    height: 200,
    marginTop: 10,
    marginBottom: 10,
    backgroundColor: '#DDDDDD',
    justifyContent: 'center',
    alignItems: 'center',
  },

  container2: {
    flex: 1,
    padding: 10,
    backgroundColor: '#fff',
    alignItems: 'center',
    position: 'relative',
  },

});
import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, Linking, Alert, TouchableOpacity, ImageBackground, Image, Platform, Share, ActivityIndicator } from 'react-native';
import { AntDesign, Entypo, FontAwesome } from '@expo/vector-icons';
import { Audio, InterruptionModeAndroid, InterruptionModeIOS } from 'expo-av';
import VersionCheck from 'react-native-version-check-expo';
import * as WebBrowser from 'expo-web-browser';
import Slider from '@react-native-community/slider';
import { Menu, Provider } from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';
import logo from './assets/playlogo.png';

export default function App() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [sound, setSound] = useState(null);
  const [volume, setVolume] = useState(1.0);
  const [menuVisible, setMenuVisible] = useState(false);

  // Load volume from persistent storage
  useEffect(() => {
    const loadVolume = async () => {
      const savedVolume = await AsyncStorage.getItem('volume');
      if (savedVolume !== null) {
        setVolume(parseFloat(savedVolume));
      }
    };
    loadVolume();
  }, []);

  // Save volume to persistent storage
  useEffect(() => {
    AsyncStorage.setItem('volume', volume.toString());
  }, [volume]);

  // Check for app updates
  useEffect(() => {
    VersionCheck.needUpdate().then(async res => {
      if (res.isNeeded) {
        Alert.alert(
          'Actualizar App',
          'Por favor actualice para continuar usando la app...',
          [
            {
              text: 'Actualizar', onPress: () => {
                if (Platform.OS === 'android') {
                  Linking.openURL(res.storeUrl); // Open Play Store for Android
                } else {
                  Linking.openURL('your-ios-app-url-in-app-store'); // Open App Store for iOS
                }
              }
            },
            {
              text: 'Luego', onPress: () => {
                // You can do some action here if needed
              }
            }
          ]
        );
      }
    });
  }, []);

  // Open URL in default browser
  const handlePressButtonAsync = async (web) => {
    await WebBrowser.openBrowserAsync(web);
  };

  const url = "https://backend.sib-2000.com.ar/rbo";

  async function playSound() {
    setIsLoading(true); // Show loader
    try {
      await Audio.setAudioModeAsync({
        staysActiveInBackground: true,
        playsInSilentModeIOS: true,
        interruptionModeIOS: InterruptionModeIOS.DuckOthers,
        interruptionModeAndroid: InterruptionModeAndroid.DuckOthers,
        shouldDuckAndroid: true,
        playThroughEarpieceAndroid: false,
      });
      const { sound } = await Audio.Sound.createAsync({ uri: url });
      await sound.setVolumeAsync(volume);
      setSound(sound);
      await sound.playAsync();
      setIsPlaying(true); // Activate playing state
    } catch (error) {
      Alert.alert('Error', 'Hubo un problema al reproducir el audio. Inténtalo de nuevo.');
    } finally {
      setIsLoading(false); // Hide loader
    }
  }

  async function stopSound() {
    setIsPlaying(false);
    await sound.stopAsync();
    setSound(null);
  }

  async function pauseSound() {
    setIsPlaying(false);
    await sound.pauseAsync();
  }

  async function resumeSound() {
    setIsPlaying(true);
    await sound.playAsync();
  }

  useEffect(() => {
    if (sound) {
      sound.setVolumeAsync(volume);
    }
  }, [volume, sound]);

  useEffect(() => {
    return () => {
      if (sound) {
        sound.unloadAsync();
      }
    };
  }, [sound]);

  const openMenu = () => setMenuVisible(true);
  const closeMenu = () => setMenuVisible(false);

  const onShare = async () => {
    try {
      const result = await Share.share({
        message: ('Compartir Nuestra App:  \n' + url)
      })
      result();
    }
    catch (error) {
      alert(error.message);
    }
  }

  const handleOpenEmail = () => {
    Linking.openURL('mailto:guillermorubenfanucce@hotmail.com')
  }

  return (
    <Provider>
      <ImageBackground source={logo} style={styles.backgroundImage}>
        <View style={styles.overlay}>
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Radio Ciudad</Text>
            <Menu
              visible={menuVisible}
              onDismiss={closeMenu}
              anchor={
                <TouchableOpacity onPress={openMenu}>
                  <Entypo name="dots-three-vertical" size={24} color="#FFFFFF" />
                </TouchableOpacity>
              }>
              <Menu.Item onPress={() => { }} title="Calificar ahora" />
              <Menu.Item onPress={() => handlePressButtonAsync('https://www.facebook.com/cmmbragado/?ref=embed_page')} title="Visite nuestro Facebook" />
              <Menu.Item onPress={() => handlePressButtonAsync('https://www.instagram.com/cmmbragado/')} title="Visite nuestro Instagram" />
              <Menu.Item onPress={() => handlePressButtonAsync('https://rbobragado.com.ar/')} title="Visite nuestra web" />
              <Menu.Item onPress={onShare} title="Dile a un amigo" />
              <Menu.Item onPress={handleOpenEmail} title="Contáctenos" />
              {/* <Menu.Item onPress={() => handlePressButtonAsync('https://www.radioCiudad.com/politicas-de-privacidad')} title="Política de privacidad" />
              <Menu.Item onPress={() => handlePressButtonAsync('https://www.radioCiudad.com/terminos-de-uso')} title="Términos de uso" /> */}
            </Menu>
          </View>
          <View style={styles.logoContainer}>
            <Image source={logo} style={styles.logo} />
          </View>
          <View style={styles.controlsContainer}>
            <View style={styles.radioInfo}>
              <Text style={styles.radioName}>Radio Ciudad</Text>
              <Text style={styles.radioLocation}>Lo mejor esta por venir</Text>
            </View>
            <View style={styles.socialIcons}>
              <TouchableOpacity onPress={() => handlePressButtonAsync('https://www.facebook.com/cmmbragado/?ref=embed_page')}>
                <FontAwesome name="facebook" size={24} color="#FFFFFF" />
              </TouchableOpacity>
              <TouchableOpacity onPress={() => handlePressButtonAsync('https://wa.me/542352440625')}>
                <FontAwesome name="whatsapp" size={24} color="#FFFFFF" />
              </TouchableOpacity>
              <TouchableOpacity onPress={() => handlePressButtonAsync('https://www.instagram.com/cmmbragado/')}>
                <FontAwesome name="instagram" size={24} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
            <View style={styles.volumeControl}>
              <Text style={styles.volumeText}>Volumen</Text>
              <Slider
                style={styles.slider}
                minimumValue={0}
                maximumValue={1}
                value={volume}
                onValueChange={value => setVolume(value)}
                minimumTrackTintColor="#FFFFFF"
                maximumTrackTintColor="#000000"
                thumbTintColor="#3F51B5"
              />
            </View>
            <View style={styles.radioControls}>
              {isLoading ? (
                <ActivityIndicator size="large" color="#FFFFFF" />
              ) : (
                <>
                  {!isPlaying ? (
                    <TouchableOpacity style={styles.controlButton} onPress={playSound}>
                      <AntDesign name="play" size={24} color="#FFFFFF" />
                    </TouchableOpacity>
                  ) : (
                    <TouchableOpacity style={styles.controlButton} onPress={pauseSound}>
                      <AntDesign name="pause" size={24} color="#FFFFFF" />
                    </TouchableOpacity>
                  )}
                </>
              )}
            </View>
          </View>
          <View style={styles.footer}>
            <Text style={styles.footerText}>Versión: X.X.X - Potenciado por SIB 2000</Text>
          </View>
        </View>
      </ImageBackground>
    </Provider >
  );
}

const styles = StyleSheet.create({
  backgroundImage: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)', // Overlay semi-transparente
    width: '100%',
    padding: 20,
    justifyContent: 'space-between',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 20,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: "#FFFFFF",
    fontFamily: 'Arial',
  },
  logoContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 50,
    marginBottom: -10
  },
  logo: {
    width: 120,
    height: 120,
    borderRadius: 60,
  },
  controlsContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioInfo: {
    alignItems: 'center',
    marginBottom: 10,
  },
  radioName: {
    fontSize: 28,
    fontWeight: 'bold',
    color: "#FFFFFF",
  },
  radioLocation: {
    fontSize: 18,
    color: "#FFFFFF",
  },
  socialIcons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '60%',
    marginVertical: 15,
    marginBottom: 40
  },
  volumeControl: {
    alignItems: 'center',
    marginVertical: 10,
  },
  volumeText: {
    color: "#FFFFFF",
    marginBottom: 10,
  },
  slider: {
    width: 200,
    height: 40,
  },
  radioControls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 10,
  },
  controlButton: {
    marginHorizontal: 10,
    backgroundColor: "#3F51B5",
    borderRadius: 50,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  footer: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 40,
  },
  footerText: {
    fontSize: 14,
    color: "#FFFFFF",
    fontFamily: 'Helvetica Neue',
  },
});


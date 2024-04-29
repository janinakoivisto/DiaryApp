import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';


function DetailsScreen({ route }) {
    const { entry, temperature, weatherIcon } = route.params;
  
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.date}>{entry.date}</Text>
          <View style={styles.weatherContainer}>
            {weatherIcon && (
              <Image source={weatherIcon} style={styles.weatherIcon} />)}
            <Text style={styles.temperature}>
              Temperature: {temperature !== undefined ? `${temperature}°C` : 'N/A'}
            </Text>
          </View>
        </View>
        <View style={styles.content}>
          <Text style={styles.entryText}>{entry.text}</Text>
        </View>
      </View>
    );
  }
  
  const styles = StyleSheet.create({
    container: {
      flex: 1,
      paddingHorizontal: 20,
      paddingVertical: 30,
      backgroundColor: '#fff',
    },
    header: {
      marginBottom: 20,
      borderBottomWidth: 1,
      borderBottomColor: '#ccc',
      paddingBottom: 10,
    },
    date: {
      fontSize: 18,
      fontWeight: 'bold',
      marginBottom: 5,
    },
    weatherContainer: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    weatherIcon: {
      width: 35,
      height: 35,
      marginRight: 10,
    },
    temperature: {
      fontSize: 16,
    },
    content: {
      flex: 1,
    },
    entryText: {
      fontSize: 16,
      lineHeight: 24,
    },
  });
  
  
  export default DetailsScreen;
  
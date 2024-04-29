
import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, FlatList, TouchableOpacity, Alert, StyleSheet } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios'; 
import { Image } from 'react-native';
import { format } from 'date-fns';

function HomeScreen({ navigation }) {
  const [entryText, setEntryText] = useState('');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [entries, setEntries] = useState([]);


  // ikonit säätä varten. Koodit löytyvät täältä: https://open-meteo.com/en/docs.

const WeatherIcons = {
  0: require('./assets/sun.png'),
  1: require('./assets/halfcloudy.png'),
  2: require('./assets/halfcloudy.png'),
  3: require('./assets/halfcloudy.png'),
  45: require('./assets/fog.png'),
  48: require('./assets/fog.png'),
  51: require('./assets/rainy.png'),
  53: require('./assets/rainy.png'),
  55: require('./assets/rainy.png'),
  56: require('./assets/rainy.png'),
  57: require('./assets/rainy.png'),
  61: require('./assets/rainy.png'),
  63: require('./assets/rainy.png'),
  65: require('./assets/rainy.png'),
  66: require('./assets/rainy.png'),
  67: require('./assets/rainy.png'),
  71: require('./assets/snowy.png'),
  73: require('./assets/snowy.png'),
  75: require('./assets/snowy.png'),
  77: require('./assets/snowy.png'),
  80: require('./assets/rainy.png'),
  81: require('./assets/rainy.png'),
  82: require('./assets/rainy.png'),
  85: require('./assets/snowy.png'),
  86: require('./assets/snowy.png'),
  95: require('./assets/thunder.png'),
  96: require('./assets/thunder.png'),
  99: require('./assets/thunder.png'),
};

  
  useEffect(() => {
    const loadEntries = async () => {
      try {
        const storedEntries = await AsyncStorage.getItem('diaryEntries');    // Haetaan vanhat merkinnät
        if (storedEntries !== null) {
          setEntries(JSON.parse(storedEntries));
        }
      } catch (error) {
        console.error('Error loading entries:', error);
      }
    };
    loadEntries();
  }, []);

  const saveEntries = async (entries) => {
    try {
      await AsyncStorage.setItem('diaryEntries', JSON.stringify(entries));    // Tallennetaan merkinnät AsyncStorageen. Tiedot tallentuvat laitteelle
    } catch (error) {
      console.error('Error saving entries:', error);
    }
  };

  const fetchWeatherForDate = async (date) => {
    try {
      const formattedDate = format(date, 'yyyy-MM-dd');     // Päivämäärä oikeaan muotoon API-kutsua varten
      const apiUrl = `https://api.open-meteo.com/v1/forecast?latitude=60.1695&longitude=24.9354&daily=weather_code,temperature_2m_max,temperature_2m_min&timezone=auto&start_date=${formattedDate}&end_date=${formattedDate}`;
      const response = await axios.get(apiUrl);
      console.log('Response data:', response.data); 
  
      const { daily } = response.data;                     
      if (daily.time.length > 0) {                                   // Tarkistetaan, että säädataa on saatavilla kyseiselle päivälle
        const weatherCode = daily.weather_code[0];                   // Tallennetaan säästä kertova koodi  
        const maxTemperature = daily.temperature_2m_max[0];          // Päivän suurin lämpötila
        const minTemperature = daily.temperature_2m_min[0];          // Päivän alin lämpötila
        const temperature = (maxTemperature + minTemperature) / 2;   // Lasketaan päivän keskimääräinen lämpötila
  
        const weatherIcon = WeatherIcons[weatherCode];               // Haetaan sääkoodia vastaava ikoni
  
        return { temperature: temperature.toFixed(1), weatherCode, weatherIcon };
      }
      return null;
    } catch (error) {
      console.error('Error fetching weather for date:', error);
      return null;
    }
  };
  
  
  const handleInputChange = (text) => {
    setEntryText(text);
  };

  const handleAddEntry = async () => {                                        // funktio käsittelee päiväkirjamerkinnän lisäämisen
    try {
      const weatherData = await fetchWeatherForDate(selectedDate);            // haetaan säätiedot (lämpötila, ikoni)
      let temperature = null;
      if (weatherData !== null) {
        temperature = weatherData;                  // Jos säätiedot eivät ole tyhjät, lämpötila asetetaan 'temperature' muuttujaan
      }
      const newEntry = {
        id: String(Date.now()),
        date: selectedDate.toLocaleDateString('en-GB'),
        text: entryText,
        weather: temperature !== null ? temperature : null 
      };
      const updatedEntries = [newEntry, ...entries];
      setEntries(updatedEntries);                   // Päivitetään komponentin tila
      saveEntries(updatedEntries);                  // Tallennetaan
      setEntryText('');                             // Tyhjennetään tekstikenttä lopuksi
    } catch (error) {
      console.error('Error adding entry:', error);
    }
  };

  const handleDeleteEntry = (id) => {               // Merkinnän poisto
    Alert.alert(
      'Confirm Delete',                                              // Varmistetaan, että käyttäjä haluaa varmasti poistaa merkinnän
      'Are you sure you want to delete this entry?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', onPress: () => confirmDelete(id) }
      ]
    );
  };
  
  const confirmDelete = (id) => {
    const updatedEntries = entries.filter(entry => entry.id !== id);          // Luodaan päivitetty lista jäljelle jäävistä merkinnöistä
    setEntries(updatedEntries);                                           
    saveEntries(updatedEntries);                                              // Tallennetaan päivitetty lista
  };
  

  const renderDiaryEntry = ({ item }) => {
    const truncatedText = item.text.length > 100 ? item.text.substring(0, 100) + '...' : item.text;     // Tekstin lyhennys tarvittaessa
    return (
      <View style={styles.entryContainer}>
        <TouchableOpacity
           onPress={() => navigation.navigate('Details', { entry: item, temperature: item.weather.temperature, weatherIcon: item.weather.weatherIcon })}                    // Välitetään säätiedot Details-sivulle
           style={styles.entryContent}
        >
          <Text style={styles.entryDate}>{item.date}</Text>
          <Text style={styles.entryText}>{truncatedText}</Text>
        </TouchableOpacity>
        <View style={styles.weatherContainer}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            {item.weather !== null && (
              <Image source={item.weather.weatherIcon} style={{ width: 35, height: 35, marginRight: 20 }} />
            )}
            <Text style={styles.temperatureText}>{item.weather !== null ? `${item.weather.temperature}°C` : 'N/A'}</Text>
          </View>
          <TouchableOpacity onPress={() => handleDeleteEntry(item.id)}>
            <Image source={{ uri: 'https://i.fbcd.co/products/resized/resized-750-500/de18ae7d25cea00a569f391100ae56d990105791a99a2d42f35d84477a869d68.webp' }}  style={styles.deleteIcon} />
          </TouchableOpacity>
        </View>
      </View>
    );
  };
  
  return (
    <View style={styles.container}>
      <Text style={styles.title}>My Diary</Text>
      <TextInput
        value={entryText}
        onChangeText={handleInputChange}
        placeholder="What's on your mind?"
        multiline={true}
        numberOfLines={5}
        style={styles.input}
      />
       <TouchableOpacity onPress={() => setShowDatePicker(true)} style={styles.button}>
        <Text style={styles.buttonText}>Select Date</Text>
      </TouchableOpacity>
      {showDatePicker && (
        <DateTimePicker
          value={selectedDate}
          mode="date"
          is24Hour={true}
          display="default"
          onChange={(event, date) => {
            setShowDatePicker(false);
            if (date) {
              setSelectedDate(date);
            }
          }}
        />
      )}
    <TouchableOpacity onPress={handleAddEntry} style={styles.button}>
        <Text style={styles.buttonText}>Add</Text>
      </TouchableOpacity>
      <FlatList
        data={entries.sort((a, b) => new Date(b.date) - new Date(a.date))}
        renderItem={renderDiaryEntry}
        keyExtractor={(item) => item.id}
        style={styles.entryList}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
    backgroundColor: '#ffffff',
  },
  title: {
    fontSize: 30,
    fontWeight: 'bold',
    marginBottom: 10,
    
  },
  input: {
    borderWidth: 1,
    borderColor: 'gray',
    padding: 10,
    marginTop: 30,
    marginBottom: 30,
  },
  entryContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    marginBottom: 10,
  },
  entryContent: {
    flex: 1,
  },
  entryDate: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  entryText: {
    fontSize: 16,
    paddingTop: 15,
    paddingBottom: 15,
    paddingRight: 40,
    
  },
  weatherContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  temperatureText: {
    fontWeight: 'bold',
    fontSize: 18,
    marginRight: 10,
  },
  deleteIcon: {
    width: 30,
    height: 30,
  },
  entryList: {
    marginTop: 20,
  },
  button: {
    marginVertical: 10,
    padding: 10,
    backgroundColor: '#000000',
    borderRadius: 30,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
  },
});

export default HomeScreen;
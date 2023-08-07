import {
  View,
  Text,
  Image,
  TextInput,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import React, { useCallback, useEffect, useState, useRoute } from "react";
import { StatusBar } from "expo-status-bar";
import { SafeAreaView } from "react-native-safe-area-context";
import { theme } from "../theme";
import {
  CalendarDaysIcon,
  MagnifyingGlassIcon,
} from "react-native-heroicons/outline";
import { MapPinIcon } from "react-native-heroicons/solid";
import { debounce } from "lodash";
import { fetchLocations, fetchWeatherForecast } from "../api/weather";
import { weatherImage } from "../constants";
import * as Progress from "react-native-progress";
import { getData, storeData } from "../utils/asyncStorage";
import { useNavigation } from "@react-navigation/native";

export default function HomeScreen({ route }) {
  const [showSearch, toggleSearch] = useState(false);
  const [location, setlocation] = useState([]);
  const [weather, setWeather] = useState({});

  const HandleLocation = (loc) => {
    console.log("Location: ", loc);
    setlocation([]);
    toggleSearch(false);
    setLoading(true);
    fetchWeatherForecast({
      cityName: loc.name,
      days: "7",
    }).then((data) => {
      setWeather(data);
      setLoading(false);
      storeData("city", loc.name);
    });
  };

  const handleSearch = (search) => {
    // console.log('value: ',search);
    if (search && search.length > 2)
      fetchLocations({ cityName: search }).then((data) => {
        // console.log('got locations: ',data);
        setlocation(data);
      });
  };

  useEffect(() => {
    fetchMyWeatherData();
  }, []);

  const fetchMyWeatherData = async () => {
    let myCity = await getData("city");
    let cityName = "Ha Noi";
    if (myCity) cityName = myCity;

    fetchWeatherForecast({
      cityName,
      days: "7",
    }).then((data) => {
      setWeather(data);
      setLoading(false);
    });

    const { weatherData } = route.params;

    // When the component mounts, set the weather data from the passed parameter
    if (weatherData) {
      setWeather(weatherData);
    }

    {
      //const { weatherData } = route.params;
      /*useEffect(() => {
        // When the component mounts, set the weather data from the passed parameter
        setWeather(weatherData);
      }, [weatherData]);*/
    }
  };

  const [loading, setLoading] = useState(true);

  const handleTextDebounce = useCallback(debounce(handleSearch, 1200), []);

  const navigation = useNavigation();

  return (
    <View className="flex-1 relative">
      <StatusBar style="light" />
      <Image
        blurRadius={70}
        source={require("../assets/images/bg.png")}
        className="absolute h-full w-full"
      />
      {loading ? (
        <View className="flex-1 flex-row justify-center items-center">
          <Progress.CircleSnail thickness={10} size={140} color="#0bb3b2" />
        </View>
      ) : (
        <SafeAreaView className="flex flex-1">
          {
            /*search section*/
            <View style={{ height: "7%" }} className="mx-4 relative z-50">
              <View
                className="flex-row justify-end item-center rounded-full"
                style={{
                  backgroundColor: showSearch
                    ? theme.bgWhite(0.2)
                    : "transparent",
                }}
              >
                {showSearch ? (
                  <TextInput
                    onChangeText={handleTextDebounce}
                    placeholder="Search city"
                    placeholderTextColor={"lightgray"}
                    className="pl-6 h-10 flex-1 pt-4  text-base   text-white"
                  />
                ) : null}

                <TouchableOpacity
                  style={{ backgroundColor: theme.bgWhite(0.3) }}
                  className="rounded-full p-3 m-1"
                  onPress={() => navigation.navigate("Search")}
                  //onPress={() => toggleSearch(!showSearch)}
                >
                  <MagnifyingGlassIcon
                    size="25"
                    color="white"
                  ></MagnifyingGlassIcon>
                </TouchableOpacity>
              </View>
              {location.length > 0 && showSearch ? (
                <View className="absolute w-full bg-gray-300 top-16 rounded-3xl">
                  {location.map((loc, index) => {
                    let showBorder = index + 1 != location.length;
                    let borderClass = showBorder
                      ? "border-b-2 border-b-gray-400"
                      : "";
                    return (
                      <TouchableOpacity
                        onPress={() => HandleLocation(loc)}
                        key={index}
                        className={
                          "flex-row items-center border-0 p-3 px-4 mb-1 " +
                          borderClass
                        }
                      >
                        <MapPinIcon size="20" color="gray"></MapPinIcon>
                        <Text className="text-black text-lg ml-2">
                          {loc?.name},{loc?.country}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              ) : null}
            </View>
          }
          {/* Weather section*/}
          <View className="mx-4 flex justify-around flex-1 mb-2">
            {/*location*/}
            <Text className="text-white text-center text-2xl font-bold">
              {weather.location?.name},
              <Text className="text-lg font-semibold text-gray-300">
                {weather.location?.country}
              </Text>
            </Text>
            <View className="flex-row justify-center">
              <Image
                source={weatherImage[weather.current?.condition?.text]}
                className="h-52 w-52"
              />
            </View>
            {/*Degree celsius*/}
            <View className="space-y-2">
              <Text className="text-center font-bold text-white text-6xl ml-5">
                {weather.current?.temp_c}&#176;
              </Text>
              <Text className="text-center  text-white text-xl tracking-widest ">
                {weather.current?.condition?.text};
              </Text>
            </View>
            {/*Other stats*/}
            <View className="flex-row justify-between mx-4">
              <View className="flex-row space-x-2 items-center  ">
                <Image
                  source={require("../assets/icons/wind.png")}
                  className="h-6 w-6"
                />
                <Text className="text-white font-semibold text-base">
                  {weather.current?.wind_kph}km
                </Text>
              </View>
              <View className="flex-row space-x-2 items-center  ">
                <Image
                  source={require("../assets/icons/drop.png")}
                  className="h-6 w-6"
                />
                <Text className="text-white font-semibold text-base">
                  {weather.current?.humidity}%
                </Text>
              </View>
              <View className="flex-row space-x-2 items-center  ">
                <Image
                  source={require("../assets/icons/sun.png")}
                  className="h-6 w-6"
                />
                <Text className="text-white font-semibold text-base">
                  {weather?.forecast?.forecastday[0].astro?.sunrise}
                </Text>
              </View>
            </View>
            {/*Forecast*/}
          </View>
          {/*Forecast sction*/}
          <View className="mb-2 space-y-3">
            <View className="flex-row items-center mx-5 space-x-2">
              <CalendarDaysIcon size="22" color="white" />
              <Text className="text-white text-base">Daily Forecast</Text>
            </View>
            <ScrollView
              horizontal
              contentContainerStyle={{ paddingHorizontal: 15 }}
              showsHorizontalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
            >
              {weather?.forecast?.forecastday?.map((item, index) => {
                let date = new Date(item.date);
                let options = { weekday: "long" };
                let dayName = date.toLocaleDateString("vi-VN", options);
                dayName = dayName.split(",")[0];
                return (
                  <View
                    key={index}
                    className="flex justify-center items-center w-24 rounded-3xl py-3 space-y-1 mr-4"
                    style={{ backgroundColor: theme.bgWhite(0.15) }}
                  >
                    <Image
                      source={weatherImage[item?.day?.condition?.text]}
                      className="h-11 w-11"
                    />
                    <Text className="text-white ">{dayName}</Text>
                    <Text className="text-white text-xl font-semibold">
                      {item?.day?.avgtemp_c}&#176;
                    </Text>
                  </View>
                );
              })}
            </ScrollView>
          </View>
        </SafeAreaView>
      )}
    </View>
  );
}

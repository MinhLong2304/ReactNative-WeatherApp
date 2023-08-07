import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  ScrollView,
  TouchableWithoutFeedback,
  Dimensions,
  StatusBar,
} from "react-native";
import React, { useCallback, useEffect, useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { XMarkIcon } from "react-native-heroicons/outline";
import { MapPinIcon } from "react-native-heroicons/solid";
import { debounce } from "lodash";
import { fetchLocations, fetchWeatherForecast } from "../api/weather";
import { getData, storeData } from "../utils/asyncStorage";
import {} from "./HomeScreen";

export default function SearchScreen() {
  const navigation = useNavigation();
  const [location, setlocation] = useState([]);
  const [weather, setWeather] = useState({});

  const handleSearch = (search) => {
    // console.log('value: ',search);
    if (search && search.length > 2)
      fetchLocations({ cityName: search }).then((data) => {
        // console.log('got locations: ',data);
        setlocation(data);
      });
  };

  const HandleLocation = (loc) => {
    console.log("Location: ", loc);
    setlocation([]);
    //navigation.navigate("Home",{weather});
    fetchWeatherForecast({
      cityName: loc.name,
      days: "7",
    }).then((data) => {
      setWeather(data);
      storeData("city", loc.name);
      navigation.navigate("Home", { weatherData: data });
    });
    /*setLoading(true);
    fetchWeatherForecast({
      cityName: loc.name,
      days: "7",
    }).then((data) => {
      setWeather(data);
      setLoading(false);
      storeData("city", loc.name);
    });*/
  };

  const handleTextDebounce = useCallback(debounce(handleSearch, 1200), []);

  return (
    <View className="flex-1 relative">
      <StatusBar style="light" />
      <Image
        blurRadius={70}
        source={require("../assets/images/bg.png")}
        className="absolute h-full w-full"
      />
      <SafeAreaView className=" flex flex-1">
        <View className="mx-4 mb-3 flex-row justify-between items-center border border-neutral-500 rounded-full">
          <TextInput
            onChangeText={handleTextDebounce}
            placeholder="Search City"
            placeholderTextColor={"lightgray"}
            className="pb-1 pl-6 flex-1 text-base font-semibold text-white tracking-wider"
          />
          <TouchableOpacity
            onPress={() => navigation.navigate("Home")}
            className="rounded-full p-3 m-1 bg-neutral-500"
          >
            <XMarkIcon size="25" color="white" />
          </TouchableOpacity>
        </View>

        {location.length > 0 ? (
          <View className="mx-4 mb-3  justify-between  border-transparent ">
            {location.map((loc, index) => {
              return (
                <TouchableOpacity
                  onPress={() => HandleLocation(loc)}
                  className={"flex-row items-center border-0 p-3 px-4 mb-1 "}
                  key={index}
                >
                  <MapPinIcon size="20" color="gray"></MapPinIcon>
                  <Text className="text-white text-lg ml-2">
                    {loc?.name},{loc?.country}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        ) : null}
      </SafeAreaView>
    </View>
  );
}

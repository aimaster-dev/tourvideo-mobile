import { View, Text, TouchableOpacity, FlatList, Platform } from 'react-native';
import React, { useEffect, useState } from 'react';
import { PaymentOptions, PaymentPlans } from '../../constants/data';
import { styles } from './styles';
import PaymentPlan from './Plan';
import Transaction from './Transaction';
import * as RNIap from "react-native-iap"
import { PickerIOS } from '@react-native-picker/picker';

const skus = ['com.standard.emmy'];

const PaymentScreen = ({ navigation, route }) => {
  const { params } = route?.params ?? {};
  const [availablePurchase, setAvailablePurchase] = useState([])
  const [selectedPaymentOption, setSelectedPaymentOption] = useState(
    params ?? PaymentOptions[0].name,
  );

  useEffect(() => {
    initilizeIAPConnection();
    return () => {
      RNIap.endConnection()
    }
  }, []);

  const initilizeIAPConnection = async () => {
    try {
      const result = await RNIap.initConnection()
      console.log('IAP result', result);
      if (result) {
        await RNIap.flushFailedPurchasesCachedAsPendingAndroid()
        const subscriptions = await RNIap.getProducts({
          skus,
        });
        console.log(subscriptions, "available purchase")
        setAvailablePurchase(subscriptions)
      }
    } catch (e) {
      console.log(e)
    }
  };

  const handlePurchase = async (productId) => {
    try {
      const response = await RNIap.requestPurchase({ skus: [productId] })
      console.log(response)
      const transaction = await RNIap.finishTransaction({purchase: response[0], isConsumable: true, developerPayloadAndroid: undefined})
      console.log(transaction, "transaction ....")
    } catch (error) {
      Alert.alert('Error occurred while making purchase')
    }
  }

  return (
    <View style={styles.container}>
      <View style={styles.menuContainer}>
        {PaymentOptions.map(item => (
          <TouchableOpacity
            activeOpacity={0.8}
            key={item.id}
            onPress={() => setSelectedPaymentOption(item.name)}
            style={[
              styles.menu,
              {
                backgroundColor:
                  item.name === selectedPaymentOption ? '#0075FFE5' : null,
              },
            ]}>
            <Text style={styles.menuOptions}>{item.name}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {selectedPaymentOption === 'Pricing Plans' && (
        <FlatList
          style={styles.list}
          data={PaymentPlans}
          renderItem={({ item }) => (
            <PaymentPlan item={item} navigation={navigation} handlePurchase={handlePurchase} />
          )}
        />
      )}

      {selectedPaymentOption === 'Transaction History' && (
        <FlatList
          style={styles.list}
          data={PaymentPlans}
          ListHeaderComponent={() => <Text style={styles.recent}>Recent</Text>}
          renderItem={({ }) => <Transaction />}
        />
      )}
    </View>
  );
};

export default PaymentScreen;

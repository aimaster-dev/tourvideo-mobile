import { View, Text, TouchableOpacity, FlatList, Platform } from 'react-native';
import React, { useEffect, useState } from 'react';
import { PaymentOptions } from '../../constants/data';
import { styles } from './styles';
import PaymentPlan from './Plan';
import Transaction from './Transaction';
import * as RNIap from "react-native-iap"
import { PickerIOS } from '@react-native-picker/picker';
import { useAPI } from '../../hooks/useAPI';
import AsyncStorage from '@react-native-async-storage/async-storage';

// const skus = ['com.standard.emmy'];

const PaymentScreen = ({ navigation, route }) => {
  const { params } = route?.params ?? {};
  const [selectedPaymentOption, setSelectedPaymentOption] = useState(
    params ?? PaymentOptions[0].name,
  );
  const [paymentPlan, setPaymentPlan] = useState([])
  const [transaction, setTransaction] = useState([])

  const api = useAPI()

  const getPrice = async() => {
    try {
      const accessToken = await AsyncStorage.getItem('access_token');
      if (!accessToken) {
        console.error('No access token found');
        return;
      }

      const response = await api.get('price/getprice', {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      if (response.data && response.data.status) {
        console.log(response.data.data)
        setPaymentPlan(response.data.data)
      }
    }
    catch(e){
      console.log(e, "error")
    }
  }

  const getTransaction = async() => {
    try {
      const accessToken = await AsyncStorage.getItem('access_token');
      if (!accessToken) {
        console.error('No access token found');
        return;
      }

      const response = await api.get('invoice/transactions', {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      if (response.data && response.data.status) {
        console.log(response.data.data)
        setTransaction(response.data.data.transactions)
      }
    }
    catch(e){
      console.log(e, "error")
    }
  }

  useEffect(() => {
    getPrice()
    getTransaction()
  },[])

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
          data={paymentPlan}
          renderItem={({ item }) => (
            <PaymentPlan item={item} navigation={navigation} />
          )}
        />
      )}

      {selectedPaymentOption === 'Transaction History' && (
        <FlatList
          style={styles.list}
          data={transaction}
          ListHeaderComponent={() => <Text style={styles.recent}>Recent</Text>}
          renderItem={({ item }) => <Transaction item={item} />}
        />
      )}
    </View>
  );
};

export default PaymentScreen;

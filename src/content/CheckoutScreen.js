import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
} from 'react-native';
import React, {useEffect, useState} from 'react';
import {Medium, Regular, Semibold} from '../constants/font';
import Check from '../../asset/svg/Check.svg';
import axios from 'axios';
import {useAPI} from '../hooks/useAPI';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  endConnection,
  finishTransaction,
  flushFailedPurchasesCachedAsPendingAndroid,
  getProducts,
  initConnection,
  requestPurchase,
} from 'react-native-iap';

const skus = ['com.standard.emmy', 'com.advanced.emmy'];

const CheckoutScreen = ({route, navigation}) => {
  const [availablePurchase, setAvailablePurchase] = useState([]);
  const {plan} = route.params ?? {};

  const api = useAPI();

  const initilizeIAPConnection = async () => {
    try {
      const result = await initConnection();
      if (result) {
        await flushFailedPurchasesCachedAsPendingAndroid();
        const subscriptions = await getProducts({
          skus,
        });
        // console.log(subscriptions, 'available purchase');
        setAvailablePurchase(subscriptions);
      }
    } catch (e) {
      console.log(e);
    }
  };

  const handlePurchase = async productId => {
    try {
      const response = await requestPurchase({skus: [productId]});
      console.log(response, 'response of purchase');
      const transaction = await finishTransaction({
        purchase: response[0],
        isConsumable: true,
        developerPayloadAndroid: undefined,
      });
      console.log(transaction, 'transaction ....');
      const result = await uploadTransaction(response);
      if (result) {
        navigation.navigate('Dashboard');
      }
    } catch (error) {
      console.log('Error occurred while making purchase');
    }
  };

  const uploadTransaction = async response => {
    try {
      const accessToken = await AsyncStorage.getItem('access_token');
      if (!accessToken) {
        console.error('No access token found');
        return;
      }
      const {data} = await api.post(`/invoice/in-app-purchase`, response, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
      });
      return data;
    } catch (e) {
      throw e;
    }
  };

  useEffect(() => {
    initilizeIAPConnection();
    return () => {
      endConnection();
    };
  }, []);

  return (
    <View style={styles.container}>
      <FlatList
        ListHeaderComponent={() => (
          <View>
            <View style={styles.card}>
              <Text style={styles.summaryText}>Summary</Text>
              <View style={styles.planDetails}>
                <Text style={styles.planName}>{plan.title}</Text>
                <Text style={styles.planPrice}>${plan.price}</Text>
              </View>
              <View style={styles.services}>
                <Text style={styles.servicesText}>Add on services</Text>
                <View style={styles.featureListContainer}>
                  <View style={styles.featureList}>
                    <Check width={28} height={28} />
                     <Text style={styles.featureName}>Record up to {plan?.record_time} seconds per session.</Text>
                  </View>
                  <View style={styles.featureList}>
                    <Check width={28} height={28} />
                    <Text style={styles.featureName}>Save up to {plan?.record_limit} recordings for quick access and review</Text>
                  </View>
                  <View style={styles.featureList}>
                    <Check width={28} height={28} />
                     <Text style={styles.featureName}>Capture up to {plan?.snapshot_limit} snapshots to preserve key moments</Text>
                  </View>
                </View>
              </View>
            </View>
            <TouchableOpacity
              activeOpacity={0.8}
              style={styles.button}
              onPress={() => {
                handlePurchase(plan.product_id);
              }}>
              <Text style={styles.buttonText}>Confirm Payment</Text>
            </TouchableOpacity>
          </View>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0B1541',
    padding: 20,
  },
  featureList: {
    flexDirection: 'row',
    marginBottom: 6,
  },
  services: {marginTop: 15},
  buttonText: {
    fontFamily: Medium,
    fontSize: 20,
    textAlign: 'center',
    color: 'white',
    lineHeight: 30,
  },
  planPrice: {
    fontFamily: Semibold,
    fontSize: 18,
    color: '#B7B9C2',
  },
  featureName: {
    fontFamily: Regular,
    fontSize: 16,
    color: '#B7B9C2',
    marginLeft: 10,
  },
  featureListContainer: {marginVertical: 12},
  servicesText: {fontSize: 16, fontFamily: Medium, color: '#0075FF'},
  button: {
    padding: 10,
    backgroundColor: '#0075FFE5',
    marginTop: 20,
    borderRadius: 100,
  },
  card: {
    marginTop: 10,
    paddingHorizontal: 20,
    backgroundColor: '#575B721A',
    borderRadius: 16,
  },
  summaryText: {
    fontFamily: Semibold,
    marginTop: 20,
    fontSize: 20,
    color: '#B7B9C2',
  },
  planName: {
    fontFamily: Semibold,
    fontSize: 18,
    color: '#B7B9C2',
  },
  planDetails: {
    marginTop: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
});

export default CheckoutScreen;

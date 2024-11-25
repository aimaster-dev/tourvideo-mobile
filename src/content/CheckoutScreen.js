import {View, Text, StyleSheet, FlatList, TouchableOpacity} from 'react-native';
import React from 'react';
import {Medium, Regular, Semibold} from '../constants/font';
import Check from '../../asset/svg/Check.svg';

const CheckoutScreen = ({route}) => {
  const {plan} = route.params ?? {};
  return (
    <View style={styles.container}>
      <FlatList
        ListHeaderComponent={() => (
          <View>
            <View style={styles.card}>
              <Text style={styles.summaryText}>Summary</Text>
              <View style={styles.planDetails}>
                <Text style={styles.planName}>{plan.name}</Text>
                <Text style={styles.planPrice}>{plan.price}</Text>
              </View>
              <View style={styles.services}>
                <Text style={styles.servicesText}>Add on services</Text>
                <FlatList
                  style={styles.featureListContainer}
                  data={plan.features}
                  renderItem={({item}) => (
                    <View style={styles.featureList}>
                      <Check width={28} height={28} />
                      <Text style={styles.featureName}>{item.name}</Text>
                    </View>
                  )}
                />
              </View>
            </View>
            <TouchableOpacity
              activeOpacity={0.8}
              style={styles.button}
              onPress={() => {}}>
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

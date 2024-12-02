import {View, Text, TouchableOpacity, FlatList} from 'react-native';
import React, {useState} from 'react';
import {PaymentOptions, PaymentPlans} from '../../constants/data';
import {styles} from './styles';
import PaymentPlan from './Plan';
import Transaction from './Transaction';

const PaymentScreen = ({navigation, route}) => {
  const {params} = route?.params ?? {};
  const [selectedPaymentOption, setSelectedPaymentOption] = useState(
    params ?? PaymentOptions[0].name,
  );
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
          renderItem={({item}) => (
            <PaymentPlan item={item} navigation={navigation} />
          )}
        />
      )}

      {selectedPaymentOption === 'Transaction History' && (
        <FlatList
          style={styles.list}
          data={PaymentPlans}
          ListHeaderComponent={() => <Text style={styles.recent}>Recent</Text>}
          renderItem={({}) => <Transaction />}
        />
      )}
    </View>
  );
};

export default PaymentScreen;

import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, FlatList } from 'react-native';
// import Icon from 'react-native-vector-icons/MaterialIcons';

const PaymentScreen = ({navigation}) => {
  const [activeTab, setActiveTab] = useState('Pricing Plans');

  const plans = [
    {
      id: '1',
      name: 'Free Plan',
      price: '$0.00',
      features: ['Camera View', 'Recording Limits', '10s Recording Time Limits'],
    },
    {
      id: '2',
      name: 'Starter',
      price: '$20.00',
      features: ['Camera View', '3 Recording Limits', '20s Recording Time Limits'],
    },
    {
      id: '3',
      name: 'Premium',
      price: '$50.00',
      features: ['Camera View', '3 Recording Limits', '30s Recording Time Limits'],
    },
  ];

  const transactions = [
    {
      id: '1',
      name: 'Monthly Subscription',
      price: '$49.99',
      date: '25.09.2024',
      day: 'Wednesday',
      status: 'Completed',
    },
    {
      id: '2',
      name: 'Camera Cloud Storage',
      price: '$15.00',
      date: '25.09.2024',
      day: 'Wednesday',
      status: 'Completed',
    },
    {
      id: '3',
      name: 'Premium Streaming Service',
      price: '$29.99',
      date: '25.09.2024',
      day: 'Wednesday',
      status: 'Completed',
    },
    {
      id: '4',
      name: 'Video Recording Upgrade',
      price: '$79.99',
      date: '25.09.2024',
      day: 'Wednesday',
      status: 'Completed',
    },
    {
      id: '5',
      name: 'Additional Camera License',
      price: '$9.99',
      date: '25.09.2024',
      day: 'Wednesday',
      status: 'Completed',
    },
  ];

  const renderPlan = ({ item }) => (
    <View style={styles.planContainer}>
      <Text style={styles.planName}>{item.name}</Text>
      <Text style={styles.planPrice}>{item.price}</Text>
      <View style={styles.featuresList}>
        {item.features.map((feature, index) => (
          <View key={index} style={styles.featureItem}>
            {/* <Icon name="check" size={18} color="#00C853" /> */}
            <Text style={styles.featureText}>{feature}</Text>
          </View>
        ))}
      </View>
      <TouchableOpacity style={styles.buyButton} onPress={() => navigation.navigate('CheckoutScreen', { plan: item })}>
        <Text style={styles.buyButtonText}>Buy Now</Text>
      </TouchableOpacity>
    </View>
  );

  const renderTransaction = ({ item }) => (
    <View style={styles.transactionContainer}>
      <View style={styles.transactionDetails}>
        <Text style={styles.transactionName}>{item.name}</Text>
        <Text style={styles.transactionDate}>
          {item.day} / {item.date}
        </Text>
      </View>
      <View style={styles.transactionStatus}>
        <Text style={styles.transactionPrice}>{item.price}</Text>
        <Text style={styles.transactionCompleted}>{item.status}</Text>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Header Tabs */}
      <View style={styles.header}>
        <TouchableOpacity
          style={activeTab === 'Pricing Plans' ? styles.tabActive : styles.tabInactive}
          onPress={() => setActiveTab('Pricing Plans')}
        >
          <Text
            style={
              activeTab === 'Pricing Plans' ? styles.tabTextActive : styles.tabTextInactive
            }
          >
            Pricing Plans
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={activeTab === 'Transaction History' ? styles.tabActive : styles.tabInactive}
          onPress={() => setActiveTab('Transaction History')}
        >
          <Text
            style={
              activeTab === 'Transaction History' ? styles.tabTextActive : styles.tabTextInactive
            }
          >
            Transaction History
          </Text>
        </TouchableOpacity>
      </View>

      {/* Active Content */}
      {activeTab === 'Pricing Plans' ? (
        <FlatList
          data={plans}
          renderItem={renderPlan}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.plansList}
          showsVerticalScrollIndicator={false}
        />
      ) : (
        <FlatList
          data={transactions}
          renderItem={renderTransaction}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.transactionsList}
          showsVerticalScrollIndicator={false}
        />
      )}

      {/* Footer */}
      <Text style={styles.footer}>© 2024 Jerry Durgin - All Rights Reserved</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0E1320',
    paddingHorizontal: 16,
  },
  header: {
    flexDirection: 'row',
    marginVertical: 16,
    backgroundColor: '#1C2331',
    borderRadius: 8,
    overflow: 'hidden',
  },
  tabActive: {
    flex: 1,
    padding: 12,
    backgroundColor: '#1A73E8',
    alignItems: 'center',
  },
  tabInactive: {
    flex: 1,
    padding: 12,
    backgroundColor: '#1C2331',
    alignItems: 'center',
  },
  tabTextActive: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  tabTextInactive: {
    color: '#6C757D',
    fontSize: 14,
    fontWeight: '600',
  },
  plansList: {
    paddingBottom: 20,
  },
  transactionsList: {
    paddingBottom: 20,
  },
  planContainer: {
    backgroundColor: '#1C2331',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
  },
  planName: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  planPrice: {
    color: '#1A73E8',
    fontSize: 24,
    fontWeight: '700',
    marginVertical: 8,
  },
  featuresList: {
    marginBottom: 16,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  featureText: {
    color: '#FFFFFF',
    marginLeft: 8,
    fontSize: 14,
  },
  buyButton: {
    backgroundColor: '#1A73E8',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  buyButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  transactionContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#1C2331',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
  },
  transactionDetails: {
    flex: 1,
  },
  transactionName: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  transactionDate: {
    color: '#6C757D',
    fontSize: 14,
    marginTop: 4,
  },
  transactionStatus: {
    alignItems: 'flex-end',
  },
  transactionPrice: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  transactionCompleted: {
    color: '#00C853',
    fontSize: 14,
    marginTop: 4,
  },
  footer: {
    color: '#6C757D',
    fontSize: 12,
    textAlign: 'center',
    marginTop: 16,
  },
});

export default PaymentScreen;

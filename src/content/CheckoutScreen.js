import React from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
// import Icon from 'react-native-vector-icons/MaterialIcons';

const CheckoutScreen = ({ route }) => {
  const { plan } = route.params;

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Summary</Text>
      <View style={styles.planSummary}>
        <Text style={styles.planName}>{plan.name}</Text>
        <Text style={styles.planPrice}>{plan.price}</Text>
        <Text style={styles.addOnLabel}>Add on services</Text>
        {plan.features.map((feature, index) => (
          <View key={index} style={styles.featureItem}>
            {/* <Icon name="check" size={18} color="#00C853" /> */}
            <Text style={styles.featureText}>{feature}</Text>
          </View>
        ))}
      </View>

      <Text style={styles.inputLabel}>Card Number</Text>
      <TextInput style={styles.input} placeholder="1234 5678 9012 1234" placeholderTextColor="#6C757D" />

      <View style={styles.cardDetails}>
        <View>
          <Text style={styles.inputLabel}>Exp. Date</Text>
          <TextInput style={styles.input} placeholder="MM/YY" placeholderTextColor="#6C757D" />
        </View>
        <View>
          <Text style={styles.inputLabel}>CVV</Text>
          <TextInput style={styles.input} placeholder="123" placeholderTextColor="#6C757D" secureTextEntry />
        </View>
      </View>

      <TouchableOpacity style={styles.confirmButton}>
        <Text style={styles.confirmButtonText}>Confirm Payment</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0E1320',
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  header: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 16,
  },
  planSummary: {
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
  addOnLabel: {
    color: '#FFFFFF',
    fontSize: 14,
    marginBottom: 8,
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
  inputLabel: {
    color: '#FFFFFF',
    fontSize: 14,
    marginVertical: 8,
  },
  input: {
    backgroundColor: '#1C2331',
    borderRadius: 8,
    padding: 12,
    color: '#FFFFFF',
    marginBottom: 16,
  },
  cardDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  confirmButton: {
    backgroundColor: '#1A73E8',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 16,
  },
  confirmButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default CheckoutScreen;

import {FlatList, Text, TouchableOpacity, View} from 'react-native';
import Check from '../../../asset/svg/Check.svg';
import { styles } from './styles';

const PaymentPlan = ({item, navigation}) => {
  return (
    <TouchableOpacity
      disabled={item.is_free}
      style={styles.card}
      onPress={() => navigation.navigate('Checkout', {plan: item})}>
      <View style={styles.planDetails}>
        <Text style={styles.planName}>{item.name}</Text>
        <Text style={styles.planPrice}>{item.price}</Text>
      </View>
      <FlatList
        style={styles.featureContainer}
        data={item.features}
        renderItem={({item}) => (
          <View style={styles.featureList}>
            <Check width={28} height={28} />
            <Text style={styles.featureName}>{item.name}</Text>
          </View>
        )}
      />
      {!item.is_free && (
        <TouchableOpacity
          style={styles.button}
          disabled={item.is_free}
          onPress={() => navigation.navigate('Checkout', {plan: item})}>
          <Text style={styles.buttonText}>Buy Now</Text>
        </TouchableOpacity>
      )}
    </TouchableOpacity>
  );
};
export default PaymentPlan;

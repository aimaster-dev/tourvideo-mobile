import {FlatList, Text, TouchableOpacity, View} from 'react-native';
import Check from '../../../asset/svg/Check.svg';
import {styles} from './styles';
import {Features} from '../../constants/data';

const PaymentPlan = ({item, navigation, handlePurchase}) => {
  return (
    <TouchableOpacity
      disabled={item.is_free}
      style={styles.card}
      onPress={() => {
        navigation.navigate('Checkout', {plan: item});
      }}>
      <View style={styles.planDetails}>
        <Text style={styles.planName}>{item.title}</Text>
        <Text style={styles.planPrice}>${item.price}</Text>
      </View>

      <View style={styles.featureContainer}>
        {/* {item?.features?.map(item => ( */}
          <View style={styles.featureList}>
            <Check width={28} height={28} />
            <Text style={styles.featureName}>Record up to {item?.record_time} seconds per session.</Text>
          </View>
           <View style={styles.featureList}>
            <Check width={28} height={28} />
            <Text style={styles.featureName}>Save up to {item?.record_limit} recordings for quick access and review</Text>
          </View>
           <View style={styles.featureList}>
            <Check width={28} height={28} />
            <Text style={styles.featureName}>Capture up to {item?.snapshot_limit} snapshots to preserve key moments</Text>
          </View>
        {/* ))} */}
      </View>

      <TouchableOpacity
        style={styles.button}
        disabled={item.is_free}
        onPress={() => navigation.navigate('Checkout', {plan: item})}>
        <Text style={styles.buttonText}>Buy Now</Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );
};
export default PaymentPlan;

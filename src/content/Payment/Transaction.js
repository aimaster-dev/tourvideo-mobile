import moment from "moment";
import { Text, TouchableOpacity, View } from "react-native";
import DoubleTick from '../../../asset/svg/DoubleTick.svg';
import { styles } from "./styles";

const Transaction = ({item}) => {
  return (
    <TouchableOpacity style={styles.transactionCard}>
      <View style={styles.transactionPlan}>
        <Text style={styles.transactionPlanName}>{item.plan_name}</Text>
        <Text style={styles.transactionPlanPrice}>${item.amount}</Text>
      </View>
      <View style={styles.transactionDetails}>
        <Text style={styles.transactionTime}>
          {moment(item.created_at).format('dddd')} / {moment(item.created_at).format('DD.MM.YYYY')}{' '}
        </Text>
        <View style={styles.transactionStatusContainer}>
          <DoubleTick />
          <Text style={styles.transactionStatus}>{item.status}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

export default Transaction;

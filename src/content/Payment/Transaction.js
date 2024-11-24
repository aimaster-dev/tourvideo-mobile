import moment from "moment";
import { Text, TouchableOpacity, View } from "react-native";
import DoubleTick from '../../../asset/svg/DoubleTick.svg';
import { styles } from "./styles";

const Transaction = () => {
  return (
    <TouchableOpacity style={styles.transactionCard}>
      <View style={styles.transactionPlan}>
        <Text style={styles.transactionPlanName}>Monthly Subscription</Text>
        <Text style={styles.transactionPlanPrice}>$49.99</Text>
      </View>
      <View style={styles.transactionDetails}>
        <Text style={styles.transactionTime}>
          {moment().format('dddd')} / {moment().format('DD.MM.YYYY')}{' '}
        </Text>
        <View style={styles.transactionStatusContainer}>
          <DoubleTick />
          <Text style={styles.transactionStatus}>Completed</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

export default Transaction;

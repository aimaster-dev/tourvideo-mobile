import { StyleSheet } from "react-native";
import { Medium, Regular, Semibold } from "../../constants/font";

export const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: '#0B1541',
      paddingHorizontal: 20,
    },
    featureContainer: {marginTop: 20},
    menu: {
      flex: 1,
      padding: 8,
      borderRadius: 100,
    },
    list: {marginTop: 24},
    planDetails: {
      borderBottomWidth: 1,
      borderColor: '#B7B9C2',
      alignItems: 'center',
    },
    transactionStatus: {
      fontFamily: Semibold,
      fontSize: 16,
      color: '#00FF7F',
      marginLeft: 4,
      textTransform: "capitalize"
    },
    planName: {
      fontFamily: Semibold,
      fontSize: 20,
      color: 'white',
      marginBottom: 4,
    },
    button: {
      padding: 10,
      backgroundColor: '#0075FFE5',
      marginHorizontal: 32,
      marginTop: 20,
      borderRadius: 100,
    },
    menuContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      backgroundColor: '#575B721A',
      padding: 8,
      borderRadius: 100,
      marginTop: 20
    },
    transactionDetails: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginTop: 12,
    },
    transactionPlan: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    transactionStatusContainer: {flexDirection: 'row', alignItems: 'center'},
    recent: {
      fontFamily: Medium,
      fontSize: 18,
      color: '#B7B9C2',
      marginBottom: 20,
    },
    transactionTime: {
      fontSize: 14,
      fontFamily: Regular,
      color: '#B7B9C2',
    },
    featureName: {
      fontFamily: Regular,
      fontSize: 16,
      color: '#B7B9C2',
      marginBottom: 12,
      marginLeft: 10,
    },
    planPrice: {
      marginVertical: 20,
      fontFamily: Semibold,
      fontSize: 24,
      color: '#B7B9C2',
    },
    card: {
      backgroundColor: '#575B721A',
      paddingVertical: 24,
      marginBottom: 24,
      borderRadius: 12,
    },
    transactionPlanName: {
      fontSize: 18,
      fontFamily: Semibold,
      color: '#B7B9C2',
    },
    tabTitle: {
      fontFamily: Semibold,
      fontSize: 15,
      color: 'white',
      textAlign: 'center',
    },
    menuOptions: {textAlign: 'center', color: 'white', fontFamily: Medium},
    box: {
      backgroundColor: '#575B721A',
      padding: 8,
      borderRadius: 100,
      marginTop: 24,
      width: '100%',
    },
    transactionPlanPrice: {
      fontSize: 18,
      fontFamily: Semibold,
      color: '#B7B9C2',
    },
    featureList: {
      flexDirection: 'row',
      marginHorizontal: 20,
    },
    transactionCard: {
      backgroundColor: '#575B721A',
      borderRadius: 12,
      marginBottom: 24,
      padding: 16,
    },
    tab: {
      flex: 1,
      backgroundColor: '#0075FFE5',
      padding: 10,
      borderRadius: 100,
      justifyContent: 'center',
      alignItems: 'center',
    },
    buttonText: {
      fontFamily: Medium,
      fontSize: 20,
      textAlign: 'center',
      color: 'white',
      lineHeight: 30,
    },
    row: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    tabsContainer: {
      width: '100%',
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
  });
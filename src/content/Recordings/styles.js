import {StyleSheet} from 'react-native';
import {Medium, Regular, Semibold} from '../../constants/font';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0B1541',
    padding: 20,
  },
  featureContainer: {marginTop: 20},
  menu: {
    flex: 1,
    padding: 8,
    borderRadius: 100,
  },
  menuContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#575B721A',
    padding: 8,
    borderRadius: 100,
  },
  menuOptions: {textAlign: 'center', color: 'white', fontFamily: Medium},
});

import {Dimensions, StyleSheet} from 'react-native';
import {Medium, Regular, Semibold} from '../../constants/font';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0B1541',
    padding: 20,
  },
  center: {flex: 1, justifyContent: 'center', alignItems: 'center'},
  featureContainer: {marginTop: 20},
  menu: {
    flex: 1,
    padding: 8,
    borderRadius: 100,
  },
  list: {marginTop: 30},
  modalContent: {marginHorizontal: 16},
  menuContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#575B721A',
    padding: 8,
    borderRadius: 100,
  },
  menuOptions: {textAlign: 'center', color: 'white', fontFamily: Medium},
  cardContainer: {
    width: (Dimensions.get('screen').width - 50) / 2,
    backgroundColor: 'white',
    marginBottom: 16,
    padding: 10,
    borderRadius: 10,
  },
  thumbnailContainer: {
    height: 150,
    borderRadius: 10,
  },
  image: {width: '100%', height: '100%'},
  contentContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  fileName: {
    fontSize: 16,
    fontFamily: Semibold,
    textTransform: 'capitalize',
    marginVertical: 10,
  },
  innerContainer: {paddingHorizontal: 16, paddingBottom: 10},
  modalContainer: {
    flex: 1,
    position: 'absolute',
    bottom: 0,
    backgroundColor: 'white',
    width: '100%',
    borderRadius: 16,
  },borderLine:{borderWidth: 0.2, borderColor: 'lightgrey'},
  row:{
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 10,
  },
  title:{fontSize: 18, fontFamily: Semibold},
  description: {fontSize: 14, fontFamily: Regular}
});

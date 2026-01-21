import React, { useState } from "react";
import {
  View,
  Text,
  Pressable,
  Modal,
  FlatList,
  StyleSheet,
  Platform,
} from "react-native";

const Dropdown = ({
  data = [],
  value,
  onChange,
  placeholder = "Select",
  labelKey = "label",
  valueKey = "id",
}) => {
  const [visible, setVisible] = useState(false);

  const handleSelect = (item) => {
    onChange(item);
    setVisible(false);
  };

  return (
    <>
      {/* Dropdown Input */}
      <Pressable style={styles.input} onPress={() => setVisible(true)}>
        <Text style={value ? styles.text : styles.placeholder}>
          {value ? value[labelKey] : placeholder}
        </Text>
        <Text style={styles.arrow}>⌄</Text>
      </Pressable>

      {/* Dropdown Modal */}
      <Modal transparent visible={visible} animationType="fade">
        <Pressable style={styles.overlay} onPress={() => setVisible(false)}>
          <View style={styles.dropdown}>
            <FlatList
              data={data}
              keyExtractor={(item) => String(item[valueKey])}
              renderItem={({ item }) => (
                <Pressable
                  style={styles.item}
                  onPress={() => handleSelect(item)}
                >
                  <Text style={styles.itemText}>{item[labelKey]}</Text>
                </Pressable>
              )}
            />
          </View>
        </Pressable>
      </Modal>
    </>
  );
};

export default Dropdown;

const styles = StyleSheet.create({
  input: {
    height: 52,
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  placeholder: {
    color: "#999",
    fontSize: 16,
  },
  text: {
    color: "#FFFFFF",
    fontSize: 16,
  },
  arrow: {
    fontSize: 18,
    color: "#999",
  },
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.25)",
    justifyContent: "center",
    paddingHorizontal: 20,
  },
  dropdown: {
    backgroundColor: "#FFF",
    borderRadius: 14,
    maxHeight: "60%",
    paddingVertical: 8,

    // iOS shadow
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },

    // Android shadow
    elevation: 8,
  },
  item: {
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: 0.5,
    borderBottomColor: "lightgray",
  },
  itemText: {
    fontSize: 16,
    color: "#000000",
  },
});

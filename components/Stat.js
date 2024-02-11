import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Switch, Modal, Text, TouchableOpacity } from 'react-native';
import { SelectList } from 'react-native-dropdown-select-list';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { db, ref, onValue, set } from '../firebase';

const Chart = (props) => {
  const [selected, setSelected] = useState("");
  const [relayStatus, setRelayStatus] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [confirmationText, setConfirmationText] = useState("");

  const relayStatusRef = ref(db, 'Relay/status');

  useEffect(() => {
    const unsubscribeRelay = onValue(relayStatusRef, (snapshot) => {
      const relayData = snapshot.val();
      setRelayStatus(relayData);
    });

    // Load the initial value of the selected appliance from AsyncStorage
    const loadSelected = async () => {
      try {
        const value = await AsyncStorage.getItem('selectedAppliance');
        if (value !== null) {
          setSelected(value);
        }
      } catch (error) {
        console.error(error);
      }
    };

    loadSelected();

    return () => {
      unsubscribeRelay();
    };
  }, []);

  const toggleSwitch = () => {
    setConfirmationText(relayStatus ? "Are you sure you want to turn off the appliance?" : "Are you sure you want to turn on the appliance?");
    setModalVisible(true);
  };

  const handleToggleConfirm = (value) => {
    setModalVisible(false);
    set(relayStatusRef, value)
      .then(() => {
        console.log('Switch toggled successfully');
      })
      .catch(error => console.error(error));
  };

  const handleSelect = async (val) => {
    setSelected(val);
    try {
      // Store the selected appliance in AsyncStorage
      await AsyncStorage.setItem('selectedAppliance', val);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <View style={styles.footerContainer}>
      <View style={styles.dropdown}>
        <SelectList
          isSearchable={false}
          setSelected={(val) => handleSelect(val)}
          data={data}
          save="value"
          placeholder="Select an appliance"         
          dropdownStyles={{ position: 'absolute', top: -150, backgroundColor: '#f8fcfb' }}
        />
      </View>
      <View style={styles.switchContainer}>
        <Switch
          trackColor={{ false: '#767577', true: '#f8fcfb' }}
          thumbColor={relayStatus ? '#9ae5c9' : '#f4f3f4'}
          onValueChange={toggleSwitch}
          value={relayStatus}
        />
      </View>
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => {
          setModalVisible(!modalVisible);
        }}
      >
        <View style={styles.centeredView}>
          <View style={styles.modalView}>
            <Text style={styles.modalText}>{confirmationText}</Text>
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.button, styles.confirmButton]}
                onPress={() => handleToggleConfirm(!relayStatus)}
              >
                <Text style={styles.textStyle}>Confirm</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.button, styles.cancelButton]}
                onPress={() => setModalVisible(!modalVisible)}
              >
                <Text style={styles.textStyleCancel}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const data = [
  { key: '1', value: 'Fan' },
  { key: '2', value: 'Charger' },
  { key: '3', value: 'Television' },
];

const styles = StyleSheet.create({
  footerContainer: {
    alignItems: 'center',
    justifyContent: 'space-around',
    flexDirection: 'row',
  },
  dropdown: {
    backgroundColor: '#9ae5c9',
    width: 200,
    borderRadius: 8,
  },
  switchContainer: {
    // Add your styles here
  },
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalView: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 35,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalText: {
    marginBottom: 15,
    textAlign: 'center',
  },
  modalButtons: {
    flexDirection: 'row',
  },
  button: {
    borderRadius: 10,
    padding: 10,
    elevation: 2,
    marginHorizontal: 10,
  },
  confirmButton: {
    backgroundColor: '#4ac998',
  },
  cancelButton: {
    backgroundColor: '#f8fcfb',
  },
  textStyle: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  textStyleCancel: {
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#07130f'
  }
});

export default Chart;

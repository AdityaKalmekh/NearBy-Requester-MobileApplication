import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  ScrollView,
  Dimensions,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export interface AvailabilitySlot {
  date: Date;
  timeSlot: string;
  displayText: string;
}

interface AvailabilityPickerProps {
  selectedAvailability: AvailabilitySlot | null;
  onSelect: (availability: AvailabilitySlot) => void;
  placeholder?: string;
  disabled?: boolean;
}

const { width: screenWidth } = Dimensions.get('window');

const AvailabilityPicker: React.FC<AvailabilityPickerProps> = ({
  selectedAvailability,
  onSelect,
  placeholder = "Select date & time",
  disabled = false,
}) => {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  
  // Ref to track if we should call onSelect
  const shouldCallOnSelect = useRef(false);

  // Generate 15-minute time slots from 9 AM to 7 PM
  const generateTimeSlots = (): string[] => {
    const slots: string[] = [];
    
    // From 9 AM to 11:45 AM
    for (let hour = 9; hour < 12; hour++) {
      for (let minute = 0; minute < 60; minute += 15) {
        const timeString = `${hour}:${minute.toString().padStart(2, '0')} AM`;
        slots.push(timeString);
      }
    }
    
    // 12:00 PM to 12:45 PM
    for (let minute = 0; minute < 60; minute += 15) {
      const timeString = `12:${minute.toString().padStart(2, '0')} PM`;
      slots.push(timeString);
    }
    
    // 1 PM to 7 PM
    for (let hour = 1; hour <= 7; hour++) {
      for (let minute = 0; minute < 60; minute += 15) {
        const timeString = `${hour}:${minute.toString().padStart(2, '0')} PM`;
        slots.push(timeString);
      }
    }
    
    return slots;
  };

  const timeSlots = generateTimeSlots();

  // Initialize with current time or next available slot - only once
  useEffect(() => {
    if (!isInitialized) {
      if (selectedAvailability) {
        // If we have a pre-selected availability, use it
        setSelectedDate(selectedAvailability.date);
        setSelectedTime(selectedAvailability.timeSlot);
        shouldCallOnSelect.current = true;
      } 
    //   else {
    //     // Initialize with next available slot
    //     const now = new Date();
    //     const currentHour = now.getHours();
    //     const currentMinute = now.getMinutes();
        
    //     // Find next available time slot
    //     let nextSlot = timeSlots.find(slot => {
    //       const [time, period] = slot.split(' ');
    //       const [hourStr, minuteStr] = time.split(':');
    //       let slotHour = parseInt(hourStr);
    //       const slotMinute = parseInt(minuteStr);
          
    //       if (period === 'PM' && slotHour !== 12) {
    //         slotHour += 12;
    //       } else if (period === 'AM' && slotHour === 12) {
    //         slotHour = 0;
    //       }
          
    //       return slotHour > currentHour || (slotHour === currentHour && slotMinute > currentMinute);
    //     });

    //     // If no slots available today, start from first slot tomorrow
    //     if (!nextSlot) {
    //       nextSlot = timeSlots[0];
    //       const tomorrow = new Date(now);
    //       tomorrow.setDate(tomorrow.getDate() + 1);
    //       setSelectedDate(tomorrow);
    //     }

    //     setSelectedTime(nextSlot || timeSlots[0]);
    //     shouldCallOnSelect.current = true; // Mark that we should call onSelect for initial setup
    //   }
      setIsInitialized(true);
    }
  }, [selectedAvailability, timeSlots, isInitialized]);

  // Call onSelect only when we should (after user interaction or initial setup)
  useEffect(() => {
    if (isInitialized && selectedDate && selectedTime && shouldCallOnSelect.current) {
      const availability: AvailabilitySlot = {
        date: selectedDate,
        timeSlot: selectedTime,
        displayText: formatDisplayText(selectedDate, selectedTime)
      };
      onSelect(availability);
      shouldCallOnSelect.current = false; // Reset the flag
    }
  }, [selectedDate, selectedTime, isInitialized]); // Removed onSelect from dependency array

  // Generate next 14 days (excluding past dates)
  const generateDateOptions = (): Date[] => {
    const dates: Date[] = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (let i = 0; i < 14; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      dates.push(date);
    }
    return dates;
  };

  const dateOptions = generateDateOptions();

  const formatDate = (date: Date): string => {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);
    
    today.setHours(0, 0, 0, 0);
    tomorrow.setHours(0, 0, 0, 0);
    const targetDate = new Date(date);
    targetDate.setHours(0, 0, 0, 0);

    if (targetDate.getTime() === today.getTime()) {
      return 'Today';
    } else if (targetDate.getTime() === tomorrow.getTime()) {
      return 'Tomorrow';
    } else {
      return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric' 
      });
    }
  };

  const formatDisplayText = (date: Date, timeSlot: string): string => {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);
    
    today.setHours(0, 0, 0, 0);
    tomorrow.setHours(0, 0, 0, 0);
    const targetDate = new Date(date);
    targetDate.setHours(0, 0, 0, 0);

    let dateText = '';
    if (targetDate.getTime() === today.getTime()) {
      dateText = 'Today';
    } else if (targetDate.getTime() === tomorrow.getTime()) {
      dateText = 'Tomorrow';
    } else {
      dateText = date.toLocaleDateString('en-US', { 
        weekday: 'long', 
        month: 'long', 
        day: 'numeric' 
      });
    }

    return `${dateText} at ${timeSlot}`;
  };

  const isTimeSlotAvailable = (date: Date, timeSlot: string): boolean => {
    const now = new Date();
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const targetDate = new Date(date);
    targetDate.setHours(0, 0, 0, 0);

    // If it's today, check if the time slot is in the future
    if (targetDate.getTime() === today.getTime()) {
      const currentHour = now.getHours();
      const currentMinute = now.getMinutes();
      
      const [time, period] = timeSlot.split(' ');
      const [hourStr, minuteStr] = time.split(':');
      let slotHour = parseInt(hourStr);
      const slotMinute = parseInt(minuteStr);
      
      if (period === 'PM' && slotHour !== 12) {
        slotHour += 12;
      } else if (period === 'AM' && slotHour === 12) {
        slotHour = 0;
      }
      
      return slotHour > currentHour || (slotHour === currentHour && slotMinute > currentMinute);
    }

    // Future dates - all slots available
    return true;
  };

  const getAvailableTimeSlots = () => {
    return timeSlots.filter(slot => isTimeSlotAvailable(selectedDate, slot));
  };

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
    // When date changes, we might need to update the time to the first available slot
    const availableSlots = timeSlots.filter(slot => isTimeSlotAvailable(date, slot));
    if (availableSlots.length > 0 && !availableSlots.includes(selectedTime)) {
      setSelectedTime(availableSlots[0]);
    }
    shouldCallOnSelect.current = true; // Mark that we should call onSelect
    setShowDatePicker(false);
  };

  const handleTimeSelect = (timeSlot: string) => {
    setSelectedTime(timeSlot);
    shouldCallOnSelect.current = true; // Mark that we should call onSelect
    setShowTimePicker(false);
  };

  return (
    <View style={styles.container}>
      <View style={styles.pickerRow}>
        {/* Date Picker */}
        <TouchableOpacity
          style={[styles.datePickerContainer, disabled && styles.disabledPicker]}
          onPress={() => !disabled && setShowDatePicker(true)}
          disabled={disabled}
          activeOpacity={0.7}
        >
          <View style={styles.pickerContent}>
            <Ionicons
              name="calendar-outline"
              size={20}
              color="#666666"
              style={styles.pickerIcon}
            />
            <Text style={styles.pickerText}>
              {formatDate(selectedDate)}
            </Text>
          </View>
        </TouchableOpacity>

        {/* Time Picker */}
        <TouchableOpacity
          style={[styles.timePickerContainer, disabled && styles.disabledPicker]}
          onPress={() => !disabled && setShowTimePicker(true)}
          disabled={disabled}
          activeOpacity={0.7}
        >
          <View style={styles.pickerContent}>
            <Ionicons
              name="time-outline"
              size={20}
              color="#666666"
              style={styles.pickerIcon}
            />
            <Text style={styles.pickerText}>
              {selectedTime || 'Select time'}
            </Text>
            <Ionicons
              name="chevron-down"
              size={20}
              color="#666666"
            />
          </View>
        </TouchableOpacity>
      </View>

      {/* Date Selection Modal */}
      <Modal
        visible={showDatePicker}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowDatePicker(false)}
      >
        <View style={styles.modalOverlay}>
          <TouchableOpacity
            style={styles.modalBackground}
            activeOpacity={1}
            onPress={() => setShowDatePicker(false)}
          />
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Date</Text>
              <TouchableOpacity
                onPress={() => setShowDatePicker(false)}
                style={styles.closeButton}
              >
                <Ionicons name="close" size={24} color="#666666" />
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.optionsList}>
              {dateOptions.map((date, index) => {
                const isSelected = selectedDate?.toDateString() === date.toDateString();
                return (
                  <TouchableOpacity
                    key={index}
                    style={[styles.optionItem, isSelected && styles.selectedOptionItem]}
                    onPress={() => handleDateSelect(date)}
                  >
                    <Text style={[styles.optionText, isSelected && styles.selectedOptionText]}>
                      {formatDate(date)}
                    </Text>
                    <Text style={[styles.optionSubText, isSelected && styles.selectedOptionText]}>
                      {date.toLocaleDateString('en-US', { 
                        weekday: 'long', 
                        month: 'long', 
                        day: 'numeric' 
                      })}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Time Selection Modal */}
      <Modal
        visible={showTimePicker}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowTimePicker(false)}
      >
        <View style={styles.modalOverlay}>
          <TouchableOpacity
            style={styles.modalBackground}
            activeOpacity={1}
            onPress={() => setShowTimePicker(false)}
          />
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Time</Text>
              <TouchableOpacity
                onPress={() => setShowTimePicker(false)}
                style={styles.closeButton}
              >
                <Ionicons name="close" size={24} color="#666666" />
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.optionsList}>
              {getAvailableTimeSlots().map((timeSlot, index) => {
                const isSelected = selectedTime === timeSlot;
                return (
                  <TouchableOpacity
                    key={index}
                    style={[styles.optionItem, isSelected && styles.selectedOptionItem]}
                    onPress={() => handleTimeSelect(timeSlot)}
                  >
                    <Text style={[styles.optionText, isSelected && styles.selectedOptionText]}>
                      {timeSlot}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  pickerRow: {
    flexDirection: 'row',
    gap: 12,
  },
  datePickerContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    height: 48,
    justifyContent: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
      },
      android: {
        elevation: 1,
      },
    }),
  },
  timePickerContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    height: 48,
    justifyContent: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
      },
      android: {
        elevation: 1,
      },
    }),
  },
  disabledPicker: {
    opacity: 0.5,
  },
  pickerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  pickerIcon: {
    marginRight: 8,
  },
  pickerText: {
    flex: 1,
    fontSize: 15,
    color: '#000000',
    fontWeight: '500',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    width: '85%',
    maxWidth: 350,
    maxHeight: '70%',
    ...Platform.select({
      ios: {
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.25,
        shadowRadius: 16,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000000',
  },
  closeButton: {
    padding: 4,
  },
  optionsList: {
    maxHeight: 300,
  },
  optionItem: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F8F9FA',
  },
  selectedOptionItem: {
    backgroundColor: '#F0F8FF',
  },
  optionText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 2,
  },
  selectedOptionText: {
    color: '#2196F3',
  },
  optionSubText: {
    fontSize: 14,
    color: '#666666',
  },
});

export default AvailabilityPicker;
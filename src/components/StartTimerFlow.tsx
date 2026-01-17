import React, { useState } from 'react';
import MainActionButton from './MainActionButton';
import TimerModal from './TimerModal';

interface StartTimerFlowProps {
  /**
   * Called when the timer is started from the modal.
   * @param minutes Number of minutes for the timer
   * @param seconds Number of seconds for the timer
   * @param goal The goal description for the timer
   */
  onTimerStart?: (minutes: number, seconds: number, goal: string) => void;
  /**
   * Optional: Override the label of the main action button (default: "Start")
   */
  buttonLabel?: string;
  /**
   * Optional: Style for the main action button
   */
  buttonStyle?: object;
}

/**
 * Encapsulates the logic for opening a timer/goal modal from a main action button.
 * Handles modal state and passes timer/goal data to parent via onTimerStart.
 */
const StartTimerFlow: React.FC<StartTimerFlowProps> = ({
  onTimerStart,
  buttonLabel = 'Start',
  buttonStyle,
}) => {
  const [modalVisible, setModalVisible] = useState(false);

  const handleButtonPress = () => {
    setModalVisible(true);
  };

  const handleModalStart = (minutes: number, seconds: number, goal: string) => {
    setModalVisible(false);
    if (onTimerStart) {
      onTimerStart(minutes, seconds, goal);
    }
  };

  const handleModalCancel = () => {
    setModalVisible(false);
  };

  return (
    <>
      <MainActionButton
        onPress={handleButtonPress}
        label={buttonLabel}
        style={buttonStyle}
      />
      <TimerModal
        visible={modalVisible}
        onStart={handleModalStart}
        onCancel={handleModalCancel}
      />
    </>
  );
};

export default StartTimerFlow;

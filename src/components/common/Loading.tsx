import React, { useEffect, useRef } from 'react';
import {
  View,
  StyleSheet,
  Animated,
  Modal,
  StatusBar,
} from 'react-native';

interface LoadingProps {
  visible: boolean;
  backgroundColor?: string;
  dotColor?: string;
  size?: 'small' | 'medium' | 'large';
}

const Loading: React.FC<LoadingProps> = ({
  visible,
  backgroundColor = 'rgba(255, 255, 255, 0.9)',
  dotColor = '#000000',
  size = 'medium'
}) => {
  const dot1Anim = useRef(new Animated.Value(0)).current;
  const dot2Anim = useRef(new Animated.Value(0)).current;
  const dot3Anim = useRef(new Animated.Value(0)).current;

  const getDotSize = () => {
    switch (size) {
      case 'small':
        return 9;
      case 'large':
        return 16;
      default:
        return 12;
    }
  };

  const getContainerSize = () => {
    switch (size) {
      case 'small':
        return 70;
      case 'large':
        return 120;
      default:
        return 100;
    }
  };

  useEffect(() => {
    if (visible) {
      const animateDots = () => {
        const createDotAnimation = (animatedValue: Animated.Value, delay: number) => {
          return Animated.loop(
            Animated.sequence([
              Animated.delay(delay),
              Animated.timing(animatedValue, {
                toValue: 1,
                duration: 600,
                useNativeDriver: true,
              }),
              Animated.timing(animatedValue, {
                toValue: 0,
                duration: 600,
                useNativeDriver: true,
              }),
            ])
          );
        };

        Animated.parallel([
          createDotAnimation(dot1Anim, 0),
          createDotAnimation(dot2Anim, 200),
          createDotAnimation(dot3Anim, 400),
        ]).start();
      };

      animateDots();
    } else {
      // Reset animations when not visible
      dot1Anim.setValue(0);
      dot2Anim.setValue(0);
      dot3Anim.setValue(0);
    }
  }, [visible, dot1Anim, dot2Anim, dot3Anim]);

  const getDotStyle = (animatedValue: Animated.Value) => {
    const dotSize = getDotSize();
    
    return {
      width: dotSize,
      height: dotSize,
      borderRadius: dotSize / 2,
      backgroundColor: dotColor,
      marginHorizontal: 4,
      opacity: animatedValue.interpolate({
        inputRange: [0, 1],
        outputRange: [0.3, 1],
      }),
      transform: [
        {
          scale: animatedValue.interpolate({
            inputRange: [0, 1],
            outputRange: [0.8, 1.2],
          }),
        },
      ],
    };
  };

  if (!visible) return null;

  return (
    <Modal
      transparent={true}
      animationType="fade"
      visible={visible}
      statusBarTranslucent={true}
    >
      <StatusBar backgroundColor="rgba(0,0,0,0.1)" barStyle="dark-content" />
      <View style={[styles.overlay, { backgroundColor }]}>
        <View style={[styles.container, { 
          width: getContainerSize(), 
          height: getContainerSize() 
        }]}>
          <View style={styles.dotsContainer}>
            <Animated.View style={getDotStyle(dot1Anim)} />
            <Animated.View style={getDotStyle(dot2Anim)} />
            <Animated.View style={getDotStyle(dot3Anim)} />
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ECECEC',
    borderRadius: 5,
    marginTop: 40,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  dotsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default Loading;
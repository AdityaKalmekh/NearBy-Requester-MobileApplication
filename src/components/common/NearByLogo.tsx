import React from 'react';
import { View } from 'react-native';
import Svg, { 
  Rect, 
  Text as SvgText,
  SvgProps 
} from 'react-native-svg';

interface NearByLogoProps extends SvgProps {
  width?: number;
  height?: number;
}

const NearByLogo: React.FC<NearByLogoProps> = ({ 
  width = 300, 
  height = 300,
  ...props
}) => {
  return (
    <View style={{ width, height }}>
      <Svg
        width="100%"
        height="100%"
        viewBox="0 0 1024 1024"
        {...props}
      >
        {/* Background */}
        <Rect width="1024" height="1024" fill="#000000" />
        
        {/* NearBy Text - Bold, Clean and Centered */}
        <SvgText
          x="512"
          y="512"
          fontSize="130"
          fontWeight="900"
          textAnchor="middle"
          fill="#FFFFFF"
          alignmentBaseline="middle"
        >
          NearBy
        </SvgText>
      </Svg>
    </View>
  );
};

export default NearByLogo;
import React from 'react';
import { Svg, Rect, Circle, G, Line, Use, Defs, ClipPath } from 'react-native-svg';

interface IndiaFlagProps {
  width?: number;
  height?: number;
  borderRadius?: number;
}

export const IndiaFlag: React.FC<IndiaFlagProps> = ({ 
  width = 24, 
  height = 18, 
  borderRadius = 3  // Default border radius for subtle rounding
}) => (
  <Svg width={width} height={height} viewBox="0 0 900 600">
    {/* Add rounded corners using a clip path */}
    <Defs>
      <ClipPath id="rounded-corners">
        <Rect width="900" height="600" rx={borderRadius * 15} ry={borderRadius * 15} />
      </ClipPath>
    </Defs>
    
    {/* Apply the clip path to the entire flag */}
    <G clipPath="url(#rounded-corners)">
      {/* Flag stripes */}
      <Rect width="900" height="200" fill="#FF9933" />
      <Rect width="900" height="200" y="200" fill="#FFFFFF" />
      <Rect width="900" height="200" y="400" fill="#138808" />
      
      {/* Ashoka Chakra */}
      <Circle cx="450" cy="300" r="80" fill="#000080" />
      <Circle cx="450" cy="300" r="70" fill="#FFFFFF" />
      <Circle cx="450" cy="300" r="11" fill="#000080" />
      
      {/* Spokes */}
      <G id="spokes">
        <Line x1="450" y1="230" x2="450" y2="370" stroke="#000080" strokeWidth="2" />
        <Line x1="380" y1="300" x2="520" y2="300" stroke="#000080" strokeWidth="2" />
      </G>
      
      {/* Generate all 24 spokes of the Ashoka Chakra */}
      {Array.from({ length: 12 }, (_, i) => i * 15).map((angle) => (
        <Use key={angle} href="#spokes" rotation={angle} origin="450, 300" />
      ))}
    </G>
    
    {/* Add a subtle border to make the rounded corners more visible */}
    <Rect 
      width="900" 
      height="600" 
      rx={borderRadius * 15} 
      ry={borderRadius * 15} 
      fill="none" 
      stroke="#DDDDDD" 
      strokeWidth="1" 
    />
  </Svg>
);

export default IndiaFlag;
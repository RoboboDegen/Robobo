// AttributeBars.tsx

import React from 'react';
import { AttributeBar } from './attribute-bar'; 

interface Attribute {
  name: string;
  value: number | string;
  color: string;
}

interface AttributeBarsProps {    
  attack: number;
  energy: number;
  speed: number;
  personality: number;
  width?: number;
} 






const AttributeBars: React.FC<AttributeBarsProps> = ({ attack, energy, speed, personality, width }) => {


  const attributes: Attribute[] = [] 
  attributes.push({ name: "Attack", value: attack || 0, color: "bg-red-500" })
  attributes.push({ name: "Energy", value: energy || 0, color: "bg-cyan-400" })
  attributes.push({ name: "Speed", value: speed || 0, color: "bg-yellow-400" })
  attributes.push({ name: "Personality", value: personality || 0, color: "bg-orange-400" })

  return (
    <div >
      <div className="flex flex-col gap-2">
        {attributes?.map((attr) => (
          <AttributeBar
            key={attr.name}
            name={attr.name}
            value={attr.value}
            color={attr.color}
            width={width ? width : 280}
          />
        ))}
      </div>
      </div>
  );
}

export default AttributeBars;

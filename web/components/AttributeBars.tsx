// AttributeBars.tsx

import React from 'react';
import { AttributeBar } from './attribute-bar'; 

interface Attribute {
  name: string;
  value: number | string;
  color: string;
}

interface AttributeBarsProps {
  attributes: Attribute[]; // 接受一个包含 Attribute 类型的数组
}

const AttributeBars: React.FC<AttributeBarsProps> = ({ attributes }) => {
  return (
    <div >
      <div className="flex flex-col gap-2 w-[280px]">
        {attributes?.map((attr) => (
          <AttributeBar
            key={attr.name}
            name={attr.name}
            value={attr.value}
            color={attr.color}
          />
        ))}
      </div>
      </div>
  );
}

export default AttributeBars;

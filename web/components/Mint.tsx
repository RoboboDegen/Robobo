import { RoButton } from "./ro_button";
import Image from 'next/image';

export function Mint() {
  return (
    <div className="fixed inset-0 w-screen h-screen overflow-hidden flex items-center justify-center">
      {/* Background Scene */}
      <Image 
        src="/gameui/mint/background_scene.png" 
        alt="Background Scene"
        width={402}
        height={874}
        priority
        className="object-cover"
      />

      
      {/* Main Content Container */}
      <div className="absolute w-[402px] h-[874px] flex flex-col items-center">
        {/* Top Trash Counter */}
        <div className="absolute top-20 left-2 flex items-center gap-2">
          <Image src="/gameui/mint/top_value_display.png" alt="Trash Counter Background" width={210} height={60} />
          <span className="absolute left-12 text-white font-tiny5 text-[28px]">Trash: 10000</span>
        </div>

        {/* Robot Character */}
          <Image
            src="/gameui/mint/robot_test.png"
            alt="Robot Character"
            width={100}
            height={120}
            className="pixel-art"
          />

        {/* Input Field for User Name */}
        <div className="flex items-center gap-2 px-8 py-2 mb-8">
        <div 
          contentEditable="true" 
          className="text-white font-tiny5 w-full" 
          style={{
            backgroundImage: `url("/gameui/mint/attribute_bar_bg.png")`,
            backgroundRepeat: 'no-repeat',
            backgroundPosition: 'right center', // 图标将放在右侧
            backgroundSize: '16px 16px', // 设置背景图片大小
          }} 
          onInput={(e) => console.log(e.currentTarget.textContent)}
        >
          rename
        </div>
        {/* Icon */}
        <Image 
          src="/gameui/mint/attribute_edit_icon.png" // 图标路径
          alt="Edit Icon" 
          width={16} 
          height={16} 
          className="text-white"
          />
        </div>


        {/* Attribute Bars */}
        <div className="space-y-6 w-[280px]">
          {[
            { name: "Attack", value: 60, color: "bg-red-500" },
            { name: "Energy", value: 63, color: "bg-cyan-400" },
            { name: "Speed", value: 43, color: "bg-yellow-400" },
            { name: "Personality", value: 83, color: "bg-orange-400" },
          ].map((attr) => (
            <div key={attr.name} className="relative">
              {/* Attribute Name above the bar */}
              <div className="absolute top-[-20px] left-8 w-full flex">
                <span className="text-white font-tiny5 text-sm">
                  {attr.name}: {attr.value}
                </span>
              </div>

              <Image
                src="/gameui/mint/attribute_bar_bg.png"
                alt={`${attr.name} Bar Background`}
                width={280}
                height={24}
              />
              <div 
                className={`absolute top-0 left-0 h-full ${attr.color}`} 
                style={{ width: `${attr.value}%` }} 
              />

              <div className="absolute top-[-30px] left-0 w-full h-full flex items-center px-3">
                <Image
                  src={`/gameui/mint/attribute_${attr.name.toLowerCase()}_icon.png`}
                  alt={attr.name}
                  width={16}
                  height={16}
                  className="mr-2"
                />
              </div>
            </div>
          ))}
        </div>

        {/* Bottom Action Bar */}
        <div className="absolute bottom-20 left-1/2 -translate-x-1/2 px-6 font-tiny5">
         <RoButton variant="mint_bottom"> mint </RoButton>
        </div>
      </div>
    </div>
  )
}

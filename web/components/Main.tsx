"use client"

import Image from "next/image"
import { RoButton } from "./ro_button"
import { useState } from "react"

export function Home() {
  const [currentPage, setCurrentPage] = useState(0)
  const totalPages = 3

  return (
    <div className="fixed inset-0 w-screen h-screen overflow-hidden flex items-center justify-center">
      {/* Background Scene */}
      <Image
        src="/gameui/home/background_scene.png"
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
          <Image src="/gameui/home/top_value_display.png" alt="Trash Counter Background" width={210} height={60} />
          <span className="absolute left-12 text-white font-tiny5 text-[28px]">Trash: 10000</span>
        </div>

        {/* Main Panel with Character */}
        <div className="relative mt-32 mb-40 ">
          <Image src="/gameui/home/main_panel.png" alt="Main Panel" width={260} height={400} />

          {/* Robot Character */}
          <div className="absolute top-8 left-1/2 -translate-x-1/2">
            <Image
              src="/gameui/mint/robot_test.png"
              alt="Robot Character"
              width={200}
              height={150}
              className="pixel-art"
            />
          </div>

          {/* Character Name with Edit Icon */}
          <div className="absolute top-[280px] left-1/2 -translate-x-1/2 flex items-center gap-2 px-8 py-2 mb-8">
                <div 
                    contentEditable="true" 
                    className="text-white font-tiny5 w-full" 
                    style={{
                        backgroundImage: `url("/gameui/home/attribute_bar_bg.png")`,
                        backgroundRepeat: 'no-repeat',
                        backgroundSize: '100% 40px', // 设置背景图片大小可控
                        backgroundPosition: 'center', // 设置背景图片位置为中心以显示完整
                        width: '140px', // 设置宽度为100%
                        height: '26px', // 设置高度为40px
                        textAlign: 'center', // 文字在背景图中居中显示
                    }} 
                onInput={(e) => console.log(e.currentTarget.textContent)}
                >
              rename
        </div>
        
        <Image 
          src="/gameui/mint/attribute_edit_icon.png" // 图标路径
          alt="Edit Icon" 
          width={16} 
          height={16} 
          className="text-white"
          />

        </div>

          {/* Attribute Bars */}
          <div className="absolute top-[314px] left-1/2 -translate-x-1/2 space-y-5 w-[230px] ">
            {[
              { name: "Attack", value: 60, color: "bg-[#ff4444]", fontcolor:"#ff4444" },
              { name: "Energy", value: 65, color: "bg-[#00ffcc]" ,fontcolor:"#00ffcc"},
              { name: "Speed", value: 45, color: "bg-[#ffcc00]", fontcolor:"#ffcc00" },
              { name: "Personality", value: 85, color: "bg-[#ff9933]" , fontcolor:"#ff9933" },
            ].map((attr) => (
              <div key={attr.name} className="relative">
                <div className="flex items-center gap-2 mb-1">
                  <Image
                    src={`/gameui/home/attribute_${attr.name.toLowerCase()}_icon.png`}
                    alt={attr.name}
                    width={16}
                    height={16}
                  />
                  <span className={`font-tiny5 text-sm `} style={{ color: attr.fontcolor }}>
                    {attr.name}: {attr.value}
                  </span>
                </div>

                <div className="relative h-4">
                  <Image
                    src="/gameui/home/attribute_bar_bg.png"
                    alt={`${attr.name} Bar Background`}
                    width={280}
                    height={24}
                  />
                  <div className={`absolute top-0 left-0 h-full ${attr.color}`} style={{ width: `${attr.value}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Navigation Arrows */}
        <div className="absolute top-[45%] w-full flex justify-between px-4">
          <RoButton variant="left_arrow_btn" onClick={() => setCurrentPage(Math.max(0, currentPage - 1))} />
          <RoButton
            variant="right_arrow_btn"
            onClick={() => setCurrentPage(Math.min(totalPages - 1, currentPage + 1))}
          />
        </div>

        {/* Page Indicators */}
        <div className="absolute bottom-44 flex gap-2">
          {Array.from({ length: totalPages }).map((_, index) => (
            <Image
              key={index}
              src={`/gameui/home/page_indicator_dot_${index === currentPage ? "active" : "inactive"}.png`}
              alt={`Page ${index + 1}`}
              width={12}
              height={12}
            />
          ))}
        </div>

        {/* Bottom Action Buttons */}
        <div className="absolute bottom-16 left-[204px] -translate-x-1/2 flex gap-4">
        {["Inventory", "Chat", "Fight"].map((action) => (
            <RoButton key={action} variant="home_bottom" className="flex justify-center items-center text-center text-lg">
            {action}
            </RoButton>
        ))}
        </div>

      </div>
    </div>
  )
}


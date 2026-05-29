'use client'

import React from 'react'

interface PhoneFrameProps {
  children: React.ReactNode
  title?: string
}

export function PhoneFrame({ children, title = 'UjianKu' }: PhoneFrameProps) {
  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-80px)] p-4">
      <div className="relative">
        {/* Phone outer frame */}
        <div
          className="relative bg-gray-900 rounded-[3rem] p-3 shadow-2xl"
          style={{ width: '393px', height: '852px' }}
        >
          {/* Side buttons */}
          <div className="absolute -left-[3px] top-[120px] w-[3px] h-[40px] bg-gray-800 rounded-l-sm" />
          <div className="absolute -left-[3px] top-[180px] w-[3px] h-[64px] bg-gray-800 rounded-l-sm" />
          <div className="absolute -left-[3px] top-[260px] w-[3px] h-[64px] bg-gray-800 rounded-l-sm" />
          <div className="absolute -right-[3px] top-[180px] w-[3px] h-[80px] bg-gray-800 rounded-r-sm" />

          {/* Screen */}
          <div className="relative w-full h-full bg-white rounded-[2.25rem] overflow-hidden">
            {/* Status bar */}
            <div className="relative z-50 flex items-center justify-between px-8 pt-3 pb-1 bg-white/90 backdrop-blur-sm">
              <span className="text-xs font-semibold text-gray-900">9:41</span>
              <div className="absolute left-1/2 -translate-x-1/2 top-2 w-[120px] h-[28px] bg-black rounded-full" />
              <div className="flex items-center gap-1">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M1 9l2 2c4.97-4.97 13.03-4.97 18 0l2-2C16.93 2.93 7.08 2.93 1 9zm8 8l3 3 3-3c-1.65-1.66-4.34-1.66-6 0zm-4-4l2 2c2.76-2.76 7.24-2.76 10 0l2-2C15.14 9.14 8.87 9.14 5 13z" />
                </svg>
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M15.67 4H14V2h-4v2H8.33C7.6 4 7 4.6 7 5.33v15.33C7 21.4 7.6 22 8.33 22h7.33c.74 0 1.34-.6 1.34-1.33V5.33C17 4.6 16.4 4 15.67 4z" />
                </svg>
              </div>
            </div>

            {/* App title bar */}
            <div className="flex items-center justify-center px-4 py-2 bg-white border-b border-gray-100">
              <span className="text-sm font-bold text-emerald-600">{title}</span>
            </div>

            {/* Content area */}
            <div className="h-[calc(100%-80px)] overflow-y-auto" style={{ scrollbarWidth: 'none' }}>
              {children}
            </div>

            {/* Bottom indicator bar */}
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-[134px] h-[5px] bg-gray-900 rounded-full" />
          </div>
        </div>
      </div>
    </div>
  )
}

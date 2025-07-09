import { useState, useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'

export function ContextMenu({ 
  children, 
  items = [], 
  className = "" 
}) {
  const [isVisible, setIsVisible] = useState(false)
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const menuRef = useRef(null)
  const targetRef = useRef(null)

  const handleContextMenu = (e) => {
    e.preventDefault()
    e.stopPropagation()
    
    // Calculate position to ensure menu stays within viewport
    const viewportWidth = window.innerWidth
    const viewportHeight = window.innerHeight
    const menuWidth = 200 // Approximate menu width
    const menuHeight = items.length * 40 // Approximate height per item
    
    let x = e.clientX
    let y = e.clientY
    
    // Adjust if menu would go off-screen
    if (x + menuWidth > viewportWidth) {
      x = viewportWidth - menuWidth - 10
    }
    if (y + menuHeight > viewportHeight) {
      y = viewportHeight - menuHeight - 10
    }
    
    setPosition({ x, y })
    setIsVisible(true)
  }

  const handleClick = () => {
    setIsVisible(false)
  }

  const handleMenuItemClick = (item) => {
    setIsVisible(false)
    if (item.onClick) {
      item.onClick()
    }
  }

  // Close menu when clicking outside or pressing Escape
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setIsVisible(false)
      }
    }

    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        setIsVisible(false)
      }
    }

    if (isVisible) {
      document.addEventListener('click', handleClickOutside)
      document.addEventListener('keydown', handleEscape)
      
      return () => {
        document.removeEventListener('click', handleClickOutside)
        document.removeEventListener('keydown', handleEscape)
      }
    }
  }, [isVisible])

  const menu = isVisible && (
    <div
      ref={menuRef}
      className="fixed z-50 min-w-[200px] bg-white rounded-lg shadow-lg border border-gray-200 py-1"
      style={{
        left: position.x,
        top: position.y,
      }}
    >
      {items.map((item, index) => (
        <button
          key={index}
          onClick={() => handleMenuItemClick(item)}
          disabled={item.disabled}
          className={`
            w-full px-4 py-2 text-left text-sm hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed
            flex items-center gap-2
            ${item.destructive ? 'text-red-600 hover:bg-red-50' : 'text-gray-700'}
            ${item.className || ''}
          `}
        >
          {item.icon && <span className="w-4 h-4">{item.icon}</span>}
          {item.label}
        </button>
      ))}
    </div>
  )

  return (
    <>
      <div
        ref={targetRef}
        onContextMenu={handleContextMenu}
        onClick={handleClick}
        className={className}
      >
        {children}
      </div>
      {createPortal(menu, document.body)}
    </>
  )
} 
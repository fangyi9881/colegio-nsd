import { useEffect, useState, useRef } from 'react';

export default function CustomCursor() {
  const [isHovering, setIsHovering] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [isTouchDevice, setIsTouchDevice] = useState(false);

  const mouse = useRef({ x: 0, y: 0 });
  
  const dotRef = useRef<HTMLDivElement>(null);
  const headRef = useRef<HTMLDivElement>(null);
  const requestRef = useRef<number>(0);

  useEffect(() => {
    const checkTouch = () => {
      setIsTouchDevice(
        'ontouchstart' in window ||
        navigator.maxTouchPoints > 0 ||
        window.matchMedia('(pointer: coarse)').matches
      );
    };
    checkTouch();
    window.addEventListener('resize', checkTouch);
    return () => window.removeEventListener('resize', checkTouch);
  }, []);

  useEffect(() => {
    if (isTouchDevice) return;

    const updateMousePosition = (e: MouseEvent) => {
      mouse.current = { x: e.clientX, y: e.clientY };
      if (!isVisible) setIsVisible(true);
    };

    const handleMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const isClickable = 
        target.tagName.toLowerCase() === 'button' ||
        target.tagName.toLowerCase() === 'a' ||
        target.closest('button') ||
        target.closest('a') ||
        target.classList.contains('cursor-pointer') ||
        window.getComputedStyle(target).cursor === 'pointer';
        
      setIsHovering(!!isClickable);
    };

    const handleMouseLeave = () => setIsVisible(false);
    const handleMouseEnter = () => setIsVisible(true);

    window.addEventListener('mousemove', updateMousePosition);
    window.addEventListener('mouseover', handleMouseOver);
    document.addEventListener('mouseleave', handleMouseLeave);
    document.addEventListener('mouseenter', handleMouseEnter);

    return () => {
      window.removeEventListener('mousemove', updateMousePosition);
      window.removeEventListener('mouseover', handleMouseOver);
      document.removeEventListener('mouseleave', handleMouseLeave);
      document.removeEventListener('mouseenter', handleMouseEnter);
    };
  }, [isVisible, isTouchDevice]);

  // Animation Loop
  useEffect(() => {
    if (isTouchDevice) return;

    let headPos = { x: mouse.current.x, y: mouse.current.y };

    const render = () => {
      // 1. Exact Dot
      if (dotRef.current) {
        dotRef.current.style.transform = `translate(${mouse.current.x - 3}px, ${mouse.current.y - 3}px)`;
      }

      // 2. Head (Dragon Logo)
      headPos.x += (mouse.current.x - headPos.x) * 0.3;
      headPos.y += (mouse.current.y - headPos.y) * 0.3;
      
      if (headRef.current) {
        headRef.current.style.transform = `translate(${headPos.x}px, ${headPos.y}px)`;
      }

      requestRef.current = requestAnimationFrame(render);
    };

    requestRef.current = requestAnimationFrame(render);

    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [isTouchDevice]);

  // Hide default cursor globally
  useEffect(() => {
    if (isTouchDevice) return;
    const style = document.createElement('style');
    style.innerHTML = `* { cursor: none !important; }`;
    document.head.appendChild(style);
    return () => { document.head.removeChild(style); };
  }, [isTouchDevice]);

  if (isTouchDevice || !isVisible) return null;

  return (
    <>
      {/* Golden Dragon Head (Triangle + Logo) */}
      <div
        ref={headRef}
        className="fixed top-0 left-0 pointer-events-none z-[999999] text-primary"
        style={{ willChange: 'transform' }}
      >
        <div 
          className={`absolute -top-1 -left-1 w-3 h-3 bg-primary transition-all duration-300 ${
            isHovering 
              ? 'scale-125 drop-shadow-[0_0_15px_rgba(212,175,55,1)] brightness-125' 
              : 'scale-100 drop-shadow-[0_0_5px_rgba(212,175,55,0.6)]'
          }`}
          style={{
            clipPath: 'polygon(0% 0%, 100% 0%, 0% 100%)'
          }}
        />
        <img 
          src="/images/dragon-logo.png" 
          alt="Dragon Cursor" 
          className={`w-12 h-12 object-contain transition-all duration-300 ${
            isHovering 
              ? 'scale-125 drop-shadow-[0_0_15px_rgba(212,175,55,1)] brightness-125' 
              : 'scale-100 drop-shadow-[0_0_5px_rgba(212,175,55,0.6)]'
          }`}
          referrerPolicy="no-referrer"
        />
      </div>

      {/* Central exact dot */}
      <div
        ref={dotRef}
        className={`fixed top-0 left-0 w-1.5 h-1.5 bg-primary rounded-full pointer-events-none z-[999999] transition-opacity duration-300 ${isHovering ? 'opacity-0' : 'opacity-100'}`}
        style={{
          boxShadow: '0 0 8px 2px rgba(212, 175, 55, 0.6)',
          willChange: 'transform'
        }}
      />
    </>
  );
}

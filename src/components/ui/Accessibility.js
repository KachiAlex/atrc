import React, { useEffect, useRef } from 'react';

// Skip to content link for keyboard navigation
export const SkipToContent = ({ targetId = 'main-content' }) => (
  <a
    href={`#${targetId}`}
    className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-primary-600 text-white px-4 py-2 rounded-md z-50 focus:outline-none focus:ring-2 focus:ring-primary-500"
  >
    Skip to main content
  </a>
);

// Focus trap for modals and dropdowns
export const FocusTrap = ({ children, isActive = true }) => {
  const containerRef = useRef(null);

  useEffect(() => {
    if (!isActive) return;

    const container = containerRef.current;
    if (!container) return;

    const focusableElements = container.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    
    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    const handleTabKey = (e) => {
      if (e.key !== 'Tab') return;

      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          lastElement?.focus();
          e.preventDefault();
        }
      } else {
        if (document.activeElement === lastElement) {
          firstElement?.focus();
          e.preventDefault();
        }
      }
    };

    container.addEventListener('keydown', handleTabKey);
    firstElement?.focus();

    return () => {
      container.removeEventListener('keydown', handleTabKey);
    };
  }, [isActive]);

  return <div ref={containerRef}>{children}</div>;
};

// Screen reader only text
export const ScreenReaderOnly = ({ children, className = '' }) => (
  <span className={`sr-only ${className}`}>
    {children}
  </span>
);

// Accessible button with proper ARIA attributes
export const AccessibleButton = ({ 
  children, 
  onClick, 
  disabled = false,
  ariaLabel,
  ariaDescribedBy,
  className = '',
  ...props 
}) => (
  <button
    onClick={onClick}
    disabled={disabled}
    aria-label={ariaLabel}
    aria-describedby={ariaDescribedBy}
    className={`focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 ${className}`}
    {...props}
  >
    {children}
  </button>
);

// High contrast mode toggle
export const HighContrastToggle = () => {
  const [isHighContrast, setIsHighContrast] = React.useState(() => {
    return localStorage.getItem('atrc-high-contrast') === 'true';
  });

  useEffect(() => {
    if (isHighContrast) {
      document.documentElement.classList.add('high-contrast');
    } else {
      document.documentElement.classList.remove('high-contrast');
    }
    localStorage.setItem('atrc-high-contrast', isHighContrast);
  }, [isHighContrast]);

  return (
    <button
      onClick={() => setIsHighContrast(!isHighContrast)}
      className="p-2 rounded-md hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
      aria-label={isHighContrast ? 'Disable high contrast mode' : 'Enable high contrast mode'}
    >
      {isHighContrast ? '🔍' : '👁️'}
    </button>
  );
};

// Font size controls
export const FontSizeControls = () => {
  const [fontSize, setFontSize] = React.useState(() => {
    return localStorage.getItem('atrc-font-size') || 'medium';
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-font-size', fontSize);
    localStorage.setItem('atrc-font-size', fontSize);
  }, [fontSize]);

  const fontSizes = [
    { value: 'small', label: 'Small', icon: 'A' },
    { value: 'medium', label: 'Medium', icon: 'A' },
    { value: 'large', label: 'Large', icon: 'A' }
  ];

  return (
    <div className="flex items-center space-x-2">
      <span className="text-sm text-gray-600">Font Size:</span>
      {fontSizes.map((size) => (
        <button
          key={size.value}
          onClick={() => setFontSize(size.value)}
          className={`p-1 rounded text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 ${
            fontSize === size.value 
              ? 'bg-primary-100 text-primary-700' 
              : 'text-gray-600 hover:bg-gray-100'
          }`}
          aria-label={`Set font size to ${size.label}`}
        >
          <span className={size.value === 'small' ? 'text-xs' : size.value === 'large' ? 'text-lg' : 'text-base'}>
            {size.icon}
          </span>
        </button>
      ))}
    </div>
  );
};

export default {
  SkipToContent,
  FocusTrap,
  ScreenReaderOnly,
  AccessibleButton,
  HighContrastToggle,
  FontSizeControls
};

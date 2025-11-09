# UI System Design Document

## Overview

The UI System is a comprehensive component library built with React, TypeScript, Tailwind CSS, and Framer Motion. It provides dark-themed components, visual effects, animations, and a design system that ensures consistency across NecroDev and NecroPlay. The system is designed as a shared package that both applications import.

## Architecture

### Component Structure

```
packages/ui/
├── src/
│   ├── components/
│   │   ├── Button/
│   │   ├── Input/
│   │   ├── Card/
│   │   ├── Modal/
│   │   ├── Toast/
│   │   ├── SoulCounter/
│   │   └── ...
│   ├── effects/
│   │   ├── GlitchText/
│   │   ├── CRTOverlay/
│   │   ├── GlowEffect/
│   │   └── DataVeins/
│   ├── animations/
│   │   ├── presets.ts
│   │   └── utils.ts
│   ├── theme/
│   │   ├── colors.ts
│   │   ├── fonts.ts
│   │   └── tailwind.config.ts
│   └── index.ts
```

## Components and Interfaces

### Theme System

```typescript
export const necroTheme = {
  colors: {
    void: '#0a0612',
    arcane: '#a855f7',
    aqua: '#00fff7',
    blood: '#ff006e',
    ghost: '#19ff90',
    text: {
      primary: '#f5f5f5',
      secondary: '#b0b0b0',
      muted: '#6b6b6b',
    }
  },
  effects: {
    glow: (color: string) => `drop-shadow(0 0 10px ${color})`,
    glitch: 'glitch 2s infinite',
    pulse: 'pulse 2s ease-in-out infinite',
  },
  spacing: {
    xs: '0.25rem',
    sm: '0.5rem',
    md: '1rem',
    lg: '1.5rem',
    xl: '2rem',
  }
};
```

### Button Component

```typescript
interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  icon?: React.ReactNode;
  loading?: boolean;
  disabled?: boolean;
  onClick?: () => void;
  children: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  icon,
  loading,
  disabled,
  onClick,
  children
}) => {
  const variants = {
    primary: 'bg-arcane hover:shadow-arcane',
    secondary: 'bg-void border-arcane',
    danger: 'bg-blood hover:shadow-blood',
    ghost: 'bg-transparent border-ghost'
  };
  
  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className={`${variants[variant]} ${sizeClasses[size]}`}
      onClick={onClick}
      disabled={disabled || loading}
    >
      {loading ? <Spinner /> : icon}
      {children}
    </motion.button>
  );
};
```


### Input Components

```typescript
interface InputProps {
  type?: 'text' | 'email' | 'password' | 'number';
  placeholder?: string;
  value?: string;
  onChange?: (value: string) => void;
  error?: string;
  icon?: React.ReactNode;
  disabled?: boolean;
}

export const Input: React.FC<InputProps> = ({
  type = 'text',
  placeholder,
  value,
  onChange,
  error,
  icon,
  disabled
}) => {
  return (
    <div className="relative">
      {icon && <div className="absolute left-3 top-3">{icon}</div>}
      <input
        type={type}
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        className={`
          bg-void border-2 border-arcane/30 
          focus:border-arcane focus:shadow-arcane
          text-text-primary placeholder-text-muted
          px-4 py-2 rounded-lg w-full
          transition-all duration-300
          ${icon ? 'pl-10' : ''}
          ${error ? 'border-blood' : ''}
        `}
      />
      {error && (
        <p className="text-blood text-sm mt-1 flex items-center gap-1">
          <WarningIcon size="sm" />
          {error}
        </p>
      )}
    </div>
  );
};
```

### Card Component

```typescript
interface CardProps {
  variant?: 'default' | 'interactive' | 'highlighted';
  hover?: boolean;
  children: React.ReactNode;
  onClick?: () => void;
}

export const Card: React.FC<CardProps> = ({
  variant = 'default',
  hover = false,
  children,
  onClick
}) => {
  return (
    <motion.div
      whileHover={hover ? { y: -5, boxShadow: '0 0 20px rgba(168, 85, 247, 0.5)' } : {}}
      className={`
        bg-void/80 backdrop-blur-sm
        border border-arcane/20 rounded-lg
        p-6 transition-all duration-300
        ${variant === 'highlighted' ? 'border-arcane' : ''}
        ${onClick ? 'cursor-pointer' : ''}
      `}
      onClick={onClick}
    >
      {children}
    </motion.div>
  );
};

export const CardHeader: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="border-b border-arcane/20 pb-4 mb-4">{children}</div>
);

export const CardBody: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="py-2">{children}</div>
);

export const CardFooter: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="border-t border-arcane/20 pt-4 mt-4">{children}</div>
);
```

### Modal Component

```typescript
interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  size = 'md'
}) => {
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.addEventListener('keydown', handleEsc);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleEsc);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center"
      >
        <div 
          className="absolute inset-0 bg-void/80 backdrop-blur-md"
          onClick={onClose}
        />
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className={`
            relative bg-void border-2 border-arcane rounded-lg
            shadow-2xl shadow-arcane/50 p-6
            ${sizeClasses[size]}
          `}
        >
          {title && (
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-arcane">{title}</h2>
              <button onClick={onClose} className="text-text-secondary hover:text-blood">
                ✕
              </button>
            </div>
          )}
          {children}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
```

### Toast System

```typescript
interface Toast {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  message: string;
  duration?: number;
}

export const useToast = () => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = (toast: Omit<Toast, 'id'>) => {
    const id = Math.random().toString(36);
    setToasts(prev => [...prev, { ...toast, id }]);
    
    setTimeout(() => {
      removeToast(id);
    }, toast.duration || 5000);
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  return { toasts, addToast, removeToast };
};

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useToast();

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      <AnimatePresence>
        {toasts.map(toast => (
          <motion.div
            key={toast.id}
            initial={{ x: 400, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 400, opacity: 0 }}
            className={`
              p-4 rounded-lg border-2 backdrop-blur-sm
              ${toastStyles[toast.type]}
            `}
          >
            <div className="flex items-center gap-3">
              <ToastIcon type={toast.type} />
              <p>{toast.message}</p>
              <button onClick={() => removeToast(toast.id)}>✕</button>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};
```

### Soul Counter Component

```typescript
interface SoulCounterProps {
  count: number;
  animated?: boolean;
}

export const SoulCounter: React.FC<SoulCounterProps> = ({
  count,
  animated = true
}) => {
  const [displayCount, setDisplayCount] = useState(count);

  useEffect(() => {
    if (!animated) {
      setDisplayCount(count);
      return;
    }

    const duration = 1000;
    const steps = 60;
    const increment = (count - displayCount) / steps;
    let current = displayCount;

    const timer = setInterval(() => {
      current += increment;
      if (Math.abs(current - count) < Math.abs(increment)) {
        setDisplayCount(count);
        clearInterval(timer);
      } else {
        setDisplayCount(Math.floor(current));
      }
    }, duration / steps);

    return () => clearInterval(timer);
  }, [count, animated]);

  return (
    <motion.div
      animate={{ scale: count !== displayCount ? [1, 1.2, 1] : 1 }}
      className="flex items-center gap-2 text-ghost"
    >
      <SkullIcon className="animate-pulse" />
      <span className="text-2xl font-bold font-mono">
        {displayCount.toLocaleString()}
      </span>
      <span className="text-sm text-text-secondary">souls</span>
    </motion.div>
  );
};
```

## Visual Effects

### Glitch Text Effect

```typescript
export const GlitchText: React.FC<{ children: string }> = ({ children }) => {
  return (
    <div className="relative inline-block">
      <span className="relative z-10">{children}</span>
      <span 
        className="absolute top-0 left-0 text-arcane opacity-70 animate-glitch-1"
        aria-hidden
      >
        {children}
      </span>
      <span 
        className="absolute top-0 left-0 text-aqua opacity-70 animate-glitch-2"
        aria-hidden
      >
        {children}
      </span>
    </div>
  );
};
```

### CRT Overlay

```typescript
export const CRTOverlay: React.FC = () => {
  return (
    <div className="pointer-events-none fixed inset-0 z-50">
      <div className="absolute inset-0 bg-scanlines opacity-10" />
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-arcane/5 to-transparent animate-scan" />
    </div>
  );
};
```

### Glow Effect Wrapper

```typescript
export const GlowEffect: React.FC<{ 
  color?: string;
  intensity?: 'low' | 'medium' | 'high';
  children: React.ReactNode;
}> = ({ color = 'arcane', intensity = 'medium', children }) => {
  const glowIntensity = {
    low: '0 0 10px',
    medium: '0 0 20px',
    high: '0 0 40px'
  };

  return (
    <div style={{ filter: `drop-shadow(${glowIntensity[intensity]} var(--${color}))` }}>
      {children}
    </div>
  );
};
```

## Animation Presets

```typescript
export const animationPresets = {
  fadeIn: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 }
  },
  slideInFromRight: {
    initial: { x: 100, opacity: 0 },
    animate: { x: 0, opacity: 1 },
    exit: { x: 100, opacity: 0 }
  },
  scaleIn: {
    initial: { scale: 0.8, opacity: 0 },
    animate: { scale: 1, opacity: 1 },
    exit: { scale: 0.8, opacity: 0 }
  },
  glitchIn: {
    initial: { x: -10, opacity: 0, filter: 'blur(4px)' },
    animate: { 
      x: [0, -5, 5, 0],
      opacity: 1,
      filter: 'blur(0px)'
    },
    exit: { x: 10, opacity: 0, filter: 'blur(4px)' }
  }
};

export const staggerChildren = {
  animate: {
    transition: {
      staggerChildren: 0.1
    }
  }
};
```

## Tailwind Configuration

```javascript
module.exports = {
  theme: {
    extend: {
      colors: {
        void: '#0a0612',
        arcane: '#a855f7',
        aqua: '#00fff7',
        blood: '#ff006e',
        ghost: '#19ff90',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Orbitron', 'sans-serif'],
        mono: ['Fira Code', 'monospace'],
      },
      animation: {
        glitch: 'glitch 2s infinite',
        'glitch-1': 'glitch-1 0.5s infinite',
        'glitch-2': 'glitch-2 0.5s infinite',
        pulse: 'pulse 2s ease-in-out infinite',
        scan: 'scan 8s linear infinite',
      },
      keyframes: {
        glitch: {
          '0%, 100%': { transform: 'translate(0)' },
          '20%': { transform: 'translate(-2px, 2px)' },
          '40%': { transform: 'translate(-2px, -2px)' },
          '60%': { transform: 'translate(2px, 2px)' },
          '80%': { transform: 'translate(2px, -2px)' },
        },
        scan: {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(100%)' },
        }
      },
      boxShadow: {
        arcane: '0 0 20px rgba(168, 85, 247, 0.5)',
        blood: '0 0 20px rgba(255, 0, 110, 0.5)',
        ghost: '0 0 20px rgba(25, 255, 144, 0.5)',
      }
    }
  }
};
```

## Testing Strategy

- Unit tests for all components using Vitest and React Testing Library
- Visual regression tests using Chromatic or Percy
- Accessibility tests with axe-core
- Storybook for component documentation and visual testing
- Test dark theme rendering and animations
- Test keyboard navigation and focus management

## Performance Considerations

- Lazy load heavy animation components
- Use CSS transforms for animations (GPU-accelerated)
- Memoize expensive calculations
- Debounce input handlers
- Use virtual scrolling for long lists
- Optimize SVG icons (inline critical, lazy load others)

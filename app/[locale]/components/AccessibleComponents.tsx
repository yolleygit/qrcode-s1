'use client';

import { forwardRef, useId, useState, useRef, useEffect } from 'react';
import { Check, ChevronDown, X, AlertCircle, Info } from 'lucide-react';
import { useFocusManagement, useKeyboardNavigation, useScreenReaderAnnouncement } from '../hooks/useAccessibility';
import { motion, AnimatePresence } from 'framer-motion';

// 可访问的按钮组件
interface AccessibleButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  loadingText?: string;
  children: React.ReactNode;
}

export const AccessibleButton = forwardRef<HTMLButtonElement, AccessibleButtonProps>(
  ({ 
    variant = 'primary', 
    size = 'md', 
    loading = false, 
    loadingText = '加载中',
    children, 
    disabled,
    className = '',
    ...props 
  }, ref) => {
    const baseClasses = 'inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';
    
    const variantClasses = {
      primary: 'bg-blue-600 hover:bg-blue-700 text-white focus:ring-blue-500',
      secondary: 'bg-gray-200 hover:bg-gray-300 text-gray-900 focus:ring-gray-500',
      danger: 'bg-red-600 hover:bg-red-700 text-white focus:ring-red-500',
      ghost: 'bg-transparent hover:bg-gray-100 text-gray-700 focus:ring-gray-500'
    };

    const sizeClasses = {
      sm: 'px-3 py-2 text-sm min-h-[36px]',
      md: 'px-4 py-2 text-base min-h-[44px]',
      lg: 'px-6 py-3 text-lg min-h-[48px]'
    };

    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        aria-disabled={disabled || loading}
        aria-describedby={loading ? `${props.id}-loading` : undefined}
        className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
        {...props}
      >
        {loading ? (
          <>
            <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />
            <span>{loadingText}</span>
            <span id={`${props.id}-loading`} className="sr-only">
              正在处理您的请求
            </span>
          </>
        ) : (
          children
        )}
      </button>
    );
  }
);

AccessibleButton.displayName = 'AccessibleButton';

// 可访问的输入框组件
interface AccessibleInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  hint?: string;
  required?: boolean;
}

export const AccessibleInput = forwardRef<HTMLInputElement, AccessibleInputProps>(
  ({ label, error, hint, required, className = '', ...props }, ref) => {
    const id = useId();
    const errorId = `${id}-error`;
    const hintId = `${id}-hint`;

    return (
      <div className="space-y-2">
        <label 
          htmlFor={id}
          className="block text-sm font-medium text-gray-700 dark:text-gray-300"
        >
          {label}
          {required && (
            <span className="text-red-500 ml-1" aria-label="必填">*</span>
          )}
        </label>
        
        {hint && (
          <p id={hintId} className="text-sm text-gray-500 dark:text-gray-400">
            {hint}
          </p>
        )}
        
        <input
          ref={ref}
          id={id}
          aria-required={required}
          aria-invalid={!!error}
          aria-describedby={`${hint ? hintId : ''} ${error ? errorId : ''}`.trim()}
          className={`
            block w-full px-3 py-2 border rounded-lg shadow-sm
            focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
            disabled:bg-gray-50 disabled:text-gray-500
            min-h-[44px] text-base
            ${error 
              ? 'border-red-300 text-red-900 placeholder-red-300 focus:ring-red-500 focus:border-red-500' 
              : 'border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white'
            }
            ${className}
          `}
          {...props}
        />
        
        {error && (
          <div id={errorId} className="flex items-center gap-2 text-sm text-red-600 dark:text-red-400" role="alert">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}
      </div>
    );
  }
);

AccessibleInput.displayName = 'AccessibleInput';

// 可访问的选择框组件
interface AccessibleSelectProps {
  label: string;
  options: Array<{ value: string; label: string; disabled?: boolean }>;
  value?: string;
  onChange: (value: string) => void;
  error?: string;
  hint?: string;
  required?: boolean;
  placeholder?: string;
}

export function AccessibleSelect({
  label,
  options,
  value,
  onChange,
  error,
  hint,
  required,
  placeholder = '请选择...'
}: AccessibleSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const id = useId();
  const buttonRef = useRef<HTMLButtonElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const { announce } = useScreenReaderAnnouncement();
  const { trapFocus, updateFocusableElements } = useFocusManagement();

  const selectedOption = options.find(opt => opt.value === value);

  useKeyboardNavigation(
    () => setIsOpen(false), // Escape
    () => {
      if (isOpen && focusedIndex >= 0) {
        const option = options[focusedIndex];
        if (!option.disabled) {
          onChange(option.value);
          setIsOpen(false);
          announce(`已选择 ${option.label}`);
        }
      }
    }, // Enter
    (direction) => {
      if (!isOpen) return;
      
      let newIndex = focusedIndex;
      if (direction === 'down') {
        newIndex = Math.min(focusedIndex + 1, options.length - 1);
      } else if (direction === 'up') {
        newIndex = Math.max(focusedIndex - 1, 0);
      }
      
      // 跳过禁用选项
      while (newIndex >= 0 && newIndex < options.length && options[newIndex].disabled) {
        newIndex += direction === 'down' ? 1 : -1;
      }
      
      if (newIndex >= 0 && newIndex < options.length) {
        setFocusedIndex(newIndex);
      }
    }
  );

  useEffect(() => {
    if (isOpen) {
      updateFocusableElements(listRef.current || undefined);
    }
  }, [isOpen, updateFocusableElements]);

  const errorId = `${id}-error`;
  const hintId = `${id}-hint`;

  return (
    <div className="space-y-2">
      <label 
        htmlFor={id}
        className="block text-sm font-medium text-gray-700 dark:text-gray-300"
      >
        {label}
        {required && (
          <span className="text-red-500 ml-1" aria-label="必填">*</span>
        )}
      </label>
      
      {hint && (
        <p id={hintId} className="text-sm text-gray-500 dark:text-gray-400">
          {hint}
        </p>
      )}
      
      <div className="relative">
        <button
          ref={buttonRef}
          id={id}
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          aria-haspopup="listbox"
          aria-expanded={isOpen}
          aria-required={required}
          aria-invalid={!!error}
          aria-describedby={`${hint ? hintId : ''} ${error ? errorId : ''}`.trim()}
          className={`
            relative w-full bg-white dark:bg-gray-700 border rounded-lg shadow-sm pl-3 pr-10 py-2 text-left
            focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
            min-h-[44px] text-base
            ${error 
              ? 'border-red-300 focus:ring-red-500 focus:border-red-500' 
              : 'border-gray-300 dark:border-gray-600'
            }
          `}
        >
          <span className={selectedOption ? 'text-gray-900 dark:text-white' : 'text-gray-500 dark:text-gray-400'}>
            {selectedOption ? selectedOption.label : placeholder}
          </span>
          <span className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
            <ChevronDown className="w-5 h-5 text-gray-400" />
          </span>
        </button>

        <AnimatePresence>
          {isOpen && (
            <motion.ul
              ref={listRef}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              role="listbox"
              aria-labelledby={id}
              className="absolute z-10 mt-1 w-full bg-white dark:bg-gray-700 shadow-lg max-h-60 rounded-md py-1 text-base ring-1 ring-black ring-opacity-5 overflow-auto focus:outline-none"
            >
              {options.map((option, index) => (
                <li
                  key={option.value}
                  role="option"
                  aria-selected={value === option.value}
                  aria-disabled={option.disabled}
                  className={`
                    cursor-pointer select-none relative py-2 pl-3 pr-9 transition-colors
                    ${option.disabled 
                      ? 'text-gray-400 cursor-not-allowed' 
                      : focusedIndex === index
                      ? 'text-white bg-blue-600'
                      : value === option.value
                      ? 'text-blue-900 bg-blue-100 dark:text-blue-100 dark:bg-blue-900'
                      : 'text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-600'
                    }
                  `}
                  onClick={() => {
                    if (!option.disabled) {
                      onChange(option.value);
                      setIsOpen(false);
                      announce(`已选择 ${option.label}`);
                    }
                  }}
                  onMouseEnter={() => !option.disabled && setFocusedIndex(index)}
                >
                  <span className="block truncate">
                    {option.label}
                  </span>
                  {value === option.value && (
                    <span className="absolute inset-y-0 right-0 flex items-center pr-4">
                      <Check className="w-5 h-5" />
                    </span>
                  )}
                </li>
              ))}
            </motion.ul>
          )}
        </AnimatePresence>
      </div>
      
      {error && (
        <div id={errorId} className="flex items-center gap-2 text-sm text-red-600 dark:text-red-400" role="alert">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
}

// 可访问的模态框组件
interface AccessibleModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export function AccessibleModal({ 
  isOpen, 
  onClose, 
  title, 
  children, 
  size = 'md' 
}: AccessibleModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);
  const { trapFocus, updateFocusableElements, focusFirst } = useFocusManagement();
  const titleId = useId();

  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl'
  };

  useEffect(() => {
    if (isOpen) {
      updateFocusableElements(modalRef.current || undefined);
      setTimeout(() => focusFirst(), 100);
      
      // 阻止背景滚动
      document.body.style.overflow = 'hidden';
      
      return () => {
        document.body.style.overflow = '';
      };
    }
  }, [isOpen, updateFocusableElements, focusFirst]);

  useKeyboardNavigation(() => onClose()); // Escape关闭

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 overflow-y-auto"
      aria-labelledby={titleId}
      aria-modal="true"
      role="dialog"
    >
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        {/* 背景遮罩 */}
        <div 
          className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
          onClick={onClose}
          aria-hidden="true"
        />

        {/* 模态框内容 */}
        <div
          ref={modalRef}
          className={`
            inline-block align-bottom bg-white dark:bg-gray-800 rounded-lg text-left overflow-hidden shadow-xl transform transition-all
            sm:my-8 sm:align-middle sm:w-full ${sizeClasses[size]}
          `}
          onKeyDown={(e) => trapFocus(e.nativeEvent)}
        >
          {/* 头部 */}
          <div className="bg-white dark:bg-gray-800 px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div className="flex items-center justify-between mb-4">
              <h3 id={titleId} className="text-lg font-medium text-gray-900 dark:text-white">
                {title}
              </h3>
              <button
                onClick={onClose}
                className="rounded-md text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 p-2"
                aria-label="关闭对话框"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            {/* 内容 */}
            <div>
              {children}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// 可访问的提示信息组件
interface AccessibleAlertProps {
  type: 'info' | 'success' | 'warning' | 'error';
  title?: string;
  children: React.ReactNode;
  onDismiss?: () => void;
}

export function AccessibleAlert({ 
  type, 
  title, 
  children, 
  onDismiss 
}: AccessibleAlertProps) {
  const icons = {
    info: Info,
    success: Check,
    warning: AlertCircle,
    error: AlertCircle
  };

  const styles = {
    info: 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 text-blue-800 dark:text-blue-200',
    success: 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 text-green-800 dark:text-green-200',
    warning: 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800 text-yellow-800 dark:text-yellow-200',
    error: 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-800 dark:text-red-200'
  };

  const Icon = icons[type];

  return (
    <div 
      className={`border rounded-lg p-4 ${styles[type]}`}
      role={type === 'error' ? 'alert' : 'status'}
      aria-live={type === 'error' ? 'assertive' : 'polite'}
    >
      <div className="flex">
        <div className="flex-shrink-0">
          <Icon className="w-5 h-5" />
        </div>
        <div className="ml-3 flex-1">
          {title && (
            <h3 className="text-sm font-medium mb-1">
              {title}
            </h3>
          )}
          <div className="text-sm">
            {children}
          </div>
        </div>
        {onDismiss && (
          <div className="ml-auto pl-3">
            <button
              onClick={onDismiss}
              className="inline-flex rounded-md p-1.5 hover:bg-black/10 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-current"
              aria-label="关闭提示"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
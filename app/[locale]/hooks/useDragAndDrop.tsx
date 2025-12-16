'use client';

import React, { useState, useCallback, useRef, DragEvent } from 'react';

export interface DragAndDropOptions {
  onDrop: (files: File[]) => void;
  onDragEnter?: () => void;
  onDragLeave?: () => void;
  onDragOver?: (event: DragEvent) => void;
  acceptedTypes?: string[];
  maxFiles?: number;
  maxSize?: number; // in bytes
  multiple?: boolean;
}

export function useDragAndDrop(options: DragAndDropOptions) {
  const [isDragging, setIsDragging] = useState(false);
  const [dragCounter, setDragCounter] = useState(0);
  const dropRef = useRef<HTMLElement>(null);

  const {
    onDrop,
    onDragEnter,
    onDragLeave,
    onDragOver,
    acceptedTypes,
    maxFiles = 10,
    maxSize = 10 * 1024 * 1024, // 10MB default
    multiple = true
  } = options;

  // 验证文件类型
  const isValidFileType = useCallback((file: File): boolean => {
    if (!acceptedTypes || acceptedTypes.length === 0) return true;
    
    return acceptedTypes.some(type => {
      if (type.endsWith('/*')) {
        const baseType = type.slice(0, -2);
        return file.type.startsWith(baseType);
      }
      return file.type === type || file.name.toLowerCase().endsWith(type.toLowerCase());
    });
  }, [acceptedTypes]);

  // 验证文件大小
  const isValidFileSize = useCallback((file: File): boolean => {
    return file.size <= maxSize;
  }, [maxSize]);

  // 过滤和验证文件
  const filterFiles = useCallback((files: FileList): File[] => {
    const fileArray = Array.from(files);
    const validFiles: File[] = [];

    for (const file of fileArray) {
      if (!isValidFileType(file)) {
        console.warn(`File type not accepted: ${file.type}`);
        continue;
      }
      
      if (!isValidFileSize(file)) {
        console.warn(`File too large: ${file.name} (${file.size} bytes)`);
        continue;
      }
      
      validFiles.push(file);
      
      if (!multiple) break;
      if (validFiles.length >= maxFiles) break;
    }

    return validFiles;
  }, [isValidFileType, isValidFileSize, multiple, maxFiles]);

  const handleDragEnter = useCallback((event: DragEvent) => {
    event.preventDefault();
    event.stopPropagation();
    
    setDragCounter(prev => prev + 1);
    
    if (dragCounter === 0) {
      setIsDragging(true);
      onDragEnter?.();
    }
  }, [dragCounter, onDragEnter]);

  const handleDragLeave = useCallback((event: DragEvent) => {
    event.preventDefault();
    event.stopPropagation();
    
    setDragCounter(prev => {
      const newCounter = prev - 1;
      if (newCounter === 0) {
        setIsDragging(false);
        onDragLeave?.();
      }
      return newCounter;
    });
  }, [onDragLeave]);

  const handleDragOver = useCallback((event: DragEvent) => {
    event.preventDefault();
    event.stopPropagation();
    
    // 设置拖拽效果
    if (event.dataTransfer) {
      event.dataTransfer.dropEffect = 'copy';
    }
    
    onDragOver?.(event);
  }, [onDragOver]);

  const handleDrop = useCallback((event: DragEvent) => {
    event.preventDefault();
    event.stopPropagation();
    
    setIsDragging(false);
    setDragCounter(0);
    
    const { files } = event.dataTransfer || {};
    if (!files || files.length === 0) return;
    
    const validFiles = filterFiles(files);
    if (validFiles.length > 0) {
      onDrop(validFiles);
    }
  }, [filterFiles, onDrop]);

  // 返回拖拽处理器和状态
  return {
    isDragging,
    dragHandlers: {
      onDragEnter: handleDragEnter,
      onDragLeave: handleDragLeave,
      onDragOver: handleDragOver,
      onDrop: handleDrop
    },
    dropRef
  };
}

// 拖拽区域组件
export function DropZone({
  children,
  onDrop,
  acceptedTypes,
  maxFiles,
  maxSize,
  multiple = true,
  className = "",
  activeClassName = "",
  disabled = false
}: {
  children: React.ReactNode;
  onDrop: (files: File[]) => void;
  acceptedTypes?: string[];
  maxFiles?: number;
  maxSize?: number;
  multiple?: boolean;
  className?: string;
  activeClassName?: string;
  disabled?: boolean;
}) {
  const { isDragging, dragHandlers } = useDragAndDrop({
    onDrop,
    acceptedTypes,
    maxFiles,
    maxSize,
    multiple
  });

  if (disabled) {
    return <div className={className}>{children}</div>;
  }

  return (
    <div
      className={`${className} ${isDragging ? activeClassName : ''}`}
      {...dragHandlers}
    >
      {children}
    </div>
  );
}

// 文件上传区域组件
export function FileUploadZone({
  onFileSelect,
  acceptedTypes,
  maxFiles,
  maxSize,
  multiple = true,
  disabled = false,
  className = ""
}: {
  onFileSelect: (files: File[]) => void;
  acceptedTypes?: string[];
  maxFiles?: number;
  maxSize?: number;
  multiple?: boolean;
  disabled?: boolean;
  className?: string;
}) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const { isDragging, dragHandlers } = useDragAndDrop({
    onDrop: onFileSelect,
    acceptedTypes,
    maxFiles,
    maxSize,
    multiple
  });

  const handleClick = () => {
    if (!disabled) {
      fileInputRef.current?.click();
    }
  };

  const handleFileInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      const fileArray = Array.from(files);
      onFileSelect(fileArray);
    }
    // 清空input值，允许重复选择同一文件
    event.target.value = '';
  };

  const acceptString = acceptedTypes?.join(',') || '';

  return (
    <div
      className={`
        relative border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-all duration-200
        ${isDragging 
          ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20' 
          : 'border-slate-300 dark:border-slate-700 hover:border-indigo-400 hover:bg-slate-50 dark:hover:bg-slate-800'
        }
        ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
        ${className}
      `}
      onClick={handleClick}
      {...(disabled ? {} : dragHandlers)}
    >
      <input
        ref={fileInputRef}
        type="file"
        className="hidden"
        accept={acceptString}
        multiple={multiple}
        onChange={handleFileInputChange}
        disabled={disabled}
      />
      
      <div className="space-y-2">
        <div className="text-4xl">
          {isDragging ? '📁' : '📄'}
        </div>
        <div className="text-sm font-medium text-slate-900 dark:text-white">
          {isDragging ? '释放文件以上传' : '点击或拖拽文件到此处'}
        </div>
        <div className="text-xs text-slate-500 dark:text-slate-400">
          {acceptedTypes && acceptedTypes.length > 0 && (
            <div>支持格式: {acceptedTypes.join(', ')}</div>
          )}
          {maxSize && (
            <div>最大文件大小: {(maxSize / 1024 / 1024).toFixed(1)}MB</div>
          )}
          {maxFiles && maxFiles > 1 && (
            <div>最多 {maxFiles} 个文件</div>
          )}
        </div>
      </div>
    </div>
  );
}
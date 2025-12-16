import '@testing-library/jest-dom'

// Mock crypto for Node.js environment
Object.defineProperty(global, 'crypto', {
  value: {
    getRandomValues: (arr: Uint8Array) => {
      for (let i = 0; i < arr.length; i++) {
        arr[i] = Math.floor(Math.random() * 256);
      }
      return arr;
    },
    subtle: {
      importKey: async (format: string, keyData: ArrayBuffer, algorithm: any, extractable: boolean, keyUsages: string[]) => {
        return { type: 'secret', algorithm, extractable, usages: keyUsages };
      },
      deriveBits: async (algorithm: any, baseKey: any, length: number) => {
        // 简单模拟：返回固定长度的随机字节
        const bytes = new Uint8Array(length / 8);
        for (let i = 0; i < bytes.length; i++) {
          bytes[i] = Math.floor(Math.random() * 256);
        }
        return bytes.buffer;
      },
      encrypt: async (algorithm: any, key: any, data: ArrayBuffer) => {
        // 模拟加密：将密钥信息编码到数据中以便解密时验证
        const original = new Uint8Array(data);
        const keyInfo = JSON.stringify(key);
        const keyBytes = new TextEncoder().encode(keyInfo);
        
        const encrypted = new Uint8Array(original.length + keyBytes.length + 20);
        encrypted.set(original, 0);
        encrypted.set(keyBytes, original.length);
        
        // 添加长度信息和认证标签
        const lengthBytes = new Uint32Array([original.length, keyBytes.length]);
        encrypted.set(new Uint8Array(lengthBytes.buffer), original.length + keyBytes.length);
        
        // 添加随机认证标签
        for (let i = original.length + keyBytes.length + 8; i < encrypted.length; i++) {
          encrypted[i] = Math.floor(Math.random() * 256);
        }
        
        return encrypted.buffer;
      },
      decrypt: async (algorithm: any, key: any, data: ArrayBuffer) => {
        // 模拟解密：验证密钥信息
        const encrypted = new Uint8Array(data);
        
        if (encrypted.length < 20) {
          throw new Error('Invalid encrypted data');
        }
        
        // 读取长度信息
        const lengthBytes = encrypted.slice(-12, -4);
        const lengths = new Uint32Array(lengthBytes.buffer);
        const originalLength = lengths[0];
        const keyLength = lengths[1];
        
        if (originalLength + keyLength + 20 !== encrypted.length) {
          throw new Error('Data corruption detected');
        }
        
        // 提取密钥信息并验证
        const storedKeyBytes = encrypted.slice(originalLength, originalLength + keyLength);
        const storedKeyInfo = new TextDecoder().decode(storedKeyBytes);
        const currentKeyInfo = JSON.stringify(key);
        
        if (storedKeyInfo !== currentKeyInfo) {
          throw new Error('Authentication failed');
        }
        
        // 返回原始数据
        const decrypted = encrypted.slice(0, originalLength);
        return decrypted.buffer;
      }
    }
  },
});

// Mock requestAnimationFrame
global.requestAnimationFrame = (callback: FrameRequestCallback) => {
  return setTimeout(callback, 16);
};

global.cancelAnimationFrame = (id: number) => {
  clearTimeout(id);
};
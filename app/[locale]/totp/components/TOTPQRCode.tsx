'use client';

import React, { useEffect, useRef, forwardRef, useImperativeHandle } from 'react';
import QRCodeStyling from 'qr-code-styling';

interface TOTPQRCodeProps {
  /** OTPAuth URI to encode in the QR code */
  otpauthUri: string;
  /** QR code size in pixels */
  size?: number;
  /** Foreground color */
  fgColor?: string;
  /** Background color */
  bgColor?: string;
  /** Error correction level */
  errorCorrectionLevel?: 'L' | 'M' | 'Q' | 'H';
  /** CSS class name */
  className?: string;
}

export interface TOTPQRCodeRef {
  downloadPNG: () => Promise<void>;
  downloadSVG: () => Promise<void>;
}

/**
 * TOTP QR Code Component
 * Renders a QR code for TOTP configuration using qr-code-styling
 */
const TOTPQRCode = forwardRef<TOTPQRCodeRef, TOTPQRCodeProps>(({
  otpauthUri,
  size = 256,
  fgColor = '#000000',
  bgColor = '#ffffff',
  errorCorrectionLevel = 'M',
  className = ''
}, ref) => {
  const qrRef = useRef<HTMLDivElement>(null);
  const qrCodeInstance = useRef<QRCodeStyling | null>(null);

  // Expose download methods to parent component
  useImperativeHandle(ref, () => ({
    downloadPNG: async () => {
      if (!qrCodeInstance.current) return;
      
      try {
        await qrCodeInstance.current.download({
          name: `totp-qr-${Date.now()}`,
          extension: 'png'
        });
      } catch (error) {
        console.error('Failed to download QR code as PNG:', error);
      }
    },
    downloadSVG: async () => {
      if (!qrCodeInstance.current) return;
      
      try {
        await qrCodeInstance.current.download({
          name: `totp-qr-${Date.now()}`,
          extension: 'svg'
        });
      } catch (error) {
        console.error('Failed to download QR code as SVG:', error);
      }
    }
  }));

  // Initialize QR code instance
  useEffect(() => {
    if (typeof window !== 'undefined' && !qrCodeInstance.current) {
      qrCodeInstance.current = new QRCodeStyling({
        width: size,
        height: size,
        type: 'svg',
        data: otpauthUri,
        dotsOptions: {
          color: fgColor,
          type: 'square'
        },
        backgroundOptions: {
          color: bgColor,
        },
        cornersSquareOptions: {
          type: 'square',
          color: fgColor
        },
        cornersDotOptions: {
          type: 'square',
          color: fgColor
        },
        qrOptions: {
          errorCorrectionLevel: errorCorrectionLevel
        },
        imageOptions: {
          crossOrigin: 'anonymous',
          margin: 0
        }
      });
    }
  }, []);

  // Update QR code when props change
  useEffect(() => {
    if (!qrCodeInstance.current || !otpauthUri) return;

    qrCodeInstance.current.update({
      width: size,
      height: size,
      data: otpauthUri,
      dotsOptions: {
        color: fgColor,
        type: 'square'
      },
      backgroundOptions: {
        color: bgColor,
      },
      cornersSquareOptions: {
        type: 'square',
        color: fgColor
      },
      cornersDotOptions: {
        type: 'square',
        color: fgColor
      },
      qrOptions: {
        errorCorrectionLevel: errorCorrectionLevel
      }
    });

    if (qrRef.current) {
      qrRef.current.innerHTML = '';
      qrCodeInstance.current.append(qrRef.current);
    }
  }, [otpauthUri, size, fgColor, bgColor, errorCorrectionLevel]);

  return (
    <div className={`totp-qr-code ${className}`}>
      <div 
        ref={qrRef} 
        className="w-full h-full flex items-center justify-center [&>svg]:w-full [&>svg]:h-full [&>svg]:max-w-full [&>svg]:max-h-full"
        style={{ minHeight: size, minWidth: size }}
      />
    </div>
  );
});

TOTPQRCode.displayName = 'TOTPQRCode';

export default TOTPQRCode;
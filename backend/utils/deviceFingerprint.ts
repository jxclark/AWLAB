import crypto from 'crypto';
import { UAParser } from 'ua-parser-js';

export interface DeviceInfo {
  fingerprint: string;
  deviceName: string;
  deviceType: string;
  browser: string;
  browserVersion: string;
  os: string;
  osVersion: string;
  ipAddress: string;
}

/**
 * Generate device fingerprint from user agent and IP
 */
export const generateDeviceFingerprint = (userAgent: string, ipAddress: string): string => {
  const data = `${userAgent}-${ipAddress}`;
  return crypto.createHash('sha256').update(data).digest('hex');
};

/**
 * Parse device information from user agent
 */
export const parseDeviceInfo = (userAgent: string | undefined, ipAddress: string | undefined): DeviceInfo => {
  const ua = userAgent || 'Unknown';
  const ip = ipAddress || 'Unknown';
  
  const parser = new UAParser(ua);
  const result = parser.getResult();

  const browser = result.browser.name || 'Unknown Browser';
  const browserVersion = result.browser.version || '';
  const os = result.os.name || 'Unknown OS';
  const osVersion = result.os.version || '';
  const deviceType = result.device.type || 'desktop';

  // Generate device name
  const deviceName = `${browser} on ${os}${osVersion ? ' ' + osVersion : ''}`;

  // Generate fingerprint
  const fingerprint = generateDeviceFingerprint(ua, ip);

  return {
    fingerprint,
    deviceName,
    deviceType: deviceType.charAt(0).toUpperCase() + deviceType.slice(1),
    browser,
    browserVersion,
    os,
    osVersion,
    ipAddress: ip,
  };
};

/**
 * Check if device info has changed significantly
 */
export const hasDeviceChanged = (
  oldDevice: DeviceInfo,
  newDevice: DeviceInfo
): boolean => {
  return (
    oldDevice.browser !== newDevice.browser ||
    oldDevice.os !== newDevice.os ||
    oldDevice.ipAddress !== newDevice.ipAddress
  );
};

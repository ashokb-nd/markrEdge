/**
 * Header Banner Visualizer - Displays header information including speed, time, and alerts
 * 
 * Expected data structure extracted from metadata:
 * - Session info, device info, speed data, time data, alerts
 */
import { BaseVisualizer } from './base-visualizer.js';

// Modular component for Speed Badge
class SpeedBadge {
  constructor() {
    this.group = new Konva.Group({
      draggable: true
    });
  }

  create(data, x, y) {
    const badgeWidth = 60;  // Reduced from 80
    const badgeHeight = 60; // Reduced from 80
    const cornerRadius = 8; // Increased from 6 for more modern look
    
    // Determine speed status for color coding
    const isOverLimit = data.currentSpeed > data.speedLimit;
    const speedRatio = data.currentSpeed / data.speedLimit;
    
    // Dynamic background color based on speed
    let bgColor = '#2C2C2C'; // Default gray
    if (isOverLimit) {
      bgColor = speedRatio > 1.2 ? '#DC3545' : '#FF6B35'; // Red or orange for speeding
    } else if (speedRatio > 0.9) {
      bgColor = '#FFC107'; // Yellow for approaching limit
    } else {
      bgColor = '#28A745'; // Green for safe speed
    }
    
    // Set initial position
    this.group.position({ x: x, y: y });
    
    // Add drag bounds function to keep within layer bounds
    this.group.dragBoundFunc(function(pos) {
      const stage = this.getStage();
      if (!stage) return pos;
      
      const stageWidth = stage.width();
      const stageHeight = stage.height();
      
      // Calculate bounds considering badge dimensions
      const minX = 0;
      const maxX = stageWidth - badgeWidth;
      const minY = 0;
      const maxY = stageHeight - badgeHeight;
      
      return {
        x: Math.max(minX, Math.min(pos.x, maxX)),
        y: Math.max(minY, Math.min(pos.y, maxY))
      };
    });
    
    // Create badge background with subtle gradient effect
    const background = new Konva.Rect({
      x: 0, // Relative to group position
      y: 0, // Relative to group position
      width: badgeWidth,
      height: badgeHeight,
      fill: bgColor,
      cornerRadius: cornerRadius,
      opacity: 0.75, // Much more transparent for overlay
      shadowColor: 'rgba(0, 0, 0, 0.2)',
      shadowBlur: 3,
      shadowOffset: { x: 0, y: 1 }
    });
    
    // Create subtle inner border for depth
    const innerBorder = new Konva.Rect({
      x: 1, // Relative to group position
      y: 1, // Relative to group position
      width: badgeWidth - 2,
      height: badgeHeight - 2,
      stroke: 'rgba(255, 255, 255, 0.15)', // More transparent
      strokeWidth: 1,
      cornerRadius: cornerRadius - 1
    });
    
    // Create divider line with better styling
    const dividerY = badgeHeight * 0.58;
    const dividerLine = new Konva.Line({
      points: [8, dividerY, badgeWidth - 8, dividerY], // Relative to group position
      stroke: 'rgba(255, 255, 255, 0.3)', // More transparent
      strokeWidth: 1
    });
    
    // Create speed text with better typography
    const speedText = new Konva.Text({
      x: 0, // Relative to group position
      y: badgeHeight * 0.12, // Relative to group position
      width: badgeWidth,
      height: badgeHeight * 0.35,
      text: data.currentSpeed.toString(),
      fontSize: 18, // Increased from 16 for better readability
      fontFamily: 'Arial Black', // Bolder font
      fontStyle: 'bold',
      fill: '#ffffff',
      align: 'center',
      verticalAlign: 'middle',
      shadowColor: 'rgba(0, 0, 0, 0.7)', // Stronger text shadow for better visibility
      shadowBlur: 3,
      shadowOffset: { x: 0, y: 1 }
    });
    
    // Create "mph" text with refined styling
    const mphText = new Konva.Text({
      x: 0, // Relative to group position
      y: badgeHeight * 0.42, // Relative to group position
      width: badgeWidth,
      height: badgeHeight * 0.15,
      text: 'mph',
      fontSize: 9, // Slightly smaller
      fontFamily: 'Arial',
      fontStyle: 'normal',
      fill: 'rgba(255, 255, 255, 0.8)', // Slightly transparent
      align: 'center',
      verticalAlign: 'middle'
    });
    
    // Create speed limit text as single line
    const limitText = new Konva.Text({
      x: 0, // Relative to group position
      y: badgeHeight * 0.68, // Relative to group position
      width: badgeWidth,
      height: badgeWidth * 0.25,
      text: `LIMIT ${data.speedLimit}`,
      fontSize: 10,
      fontFamily: 'Arial',
      fontStyle: 'bold',
      fill: isOverLimit ? '#FFE6E6' : 'rgba(255, 255, 255, 0.9)',
      align: 'center',
      verticalAlign: 'middle'
    });
    
    this.group.add(background);
    this.group.add(innerBorder);
    this.group.add(dividerLine);
    this.group.add(speedText);
    this.group.add(mphText);
    this.group.add(limitText);
    
    return this.group;
  }
}

// Modular component for individual message notification
class MessageNotification {
  constructor() {
    this.group = new Konva.Group();
  }

  create(message, x, y, width) {
    const cardHeight = 20;  // Even more compact
    const cardCornerRadius = 6; // Increased for modern look
    
    // Create sleek card background
    const background = new Konva.Rect({
      x: x,
      y: y,
      width: width,
      height: cardHeight,
      fill: '#000000', // Pure black for modern look
      stroke: 'rgba(255, 193, 7, 0.3)', // Subtle yellow border
      strokeWidth: 1,
      cornerRadius: cardCornerRadius,
      opacity: 0.65, // Much more transparent
      shadowColor: 'rgba(0, 0, 0, 0.4)',
      shadowBlur: 4,
      shadowOffset: { x: 0, y: 2 }
    });
    
    // Create modern alert text
    const text = new Konva.Text({
      x: x + 8, // Add padding
      y: y,
      width: width - 16, // Account for padding
      height: cardHeight,
      text: message,
      fontSize: 10, // Smaller, sleeker text
      fontFamily: 'Arial',
      fontStyle: 'bold',
      fill: '#FFFFFF', // White text for better contrast
      align: 'center',
      verticalAlign: 'middle',
      shadowColor: 'rgba(0, 0, 0, 0.8)',
      shadowBlur: 2,
      shadowOffset: { x: 0, y: 1 }
    });
    
    this.group.add(background);
    this.group.add(text);
    
    return this.group;
  }
}

// Container for all message notifications
class NotificationContainer {
  constructor() {
    this.group = new Konva.Group();
    this.notifications = [];
  }

  create(messages, centerX, startY) {
    if (messages.length === 0) return this.group;

    const cardPadding = 6;  // More compact padding
    const cardSpacing = 3;  // Tighter spacing between cards
    
    // Calculate card width based on longest message with more refined sizing
    const maxTextWidth = Math.max(...messages.map(message => message.length * 6.5)); // More precise calculation
    const cardWidth = Math.min(maxTextWidth + (cardPadding * 2), 200); // Cap maximum width
    
    const startX = centerX - (cardWidth / 2);
    let currentY = startY;

    messages.forEach((message, index) => {
      const notification = new MessageNotification();
      const notificationGroup = notification.create(message, startX, currentY, cardWidth);
      
      this.notifications.push(notification);
      this.group.add(notificationGroup);
      
      currentY += 20 + cardSpacing; // Updated to match new cardHeight
    });
    
    return this.group;
  }

  clear() {
    this.notifications.forEach(notification => {
      notification.group.destroy();
    });
    this.notifications = [];
    this.group.removeChildren();
  }
}

// Modular component for Timestamp
class Timestamp {
  constructor() {
    this.textNode = null;
  }

  create(epochTime, data, x, y, width) {
    // Remove existing timestamp if any
    if (this.textNode) {
      this.textNode.destroy();
    }
    
    // Format date and time separately for better layout
    const date = new Date(epochTime);
    
    // Create a cleaner, more modern format
    const timeFormatter = new Intl.DateTimeFormat('en-US', {
      timeZone: data.timeZone,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false // 24-hour format is more professional
    });
    
    const dateFormatter = new Intl.DateTimeFormat('en-US', {
      timeZone: data.timeZone,
      month: '2-digit',
      day: '2-digit',
      year: '2-digit'
    });
    
    // Get timezone abbreviation
    const timezoneFormatter = new Intl.DateTimeFormat('en-US', {
      timeZone: data.timeZone,
      timeZoneName: 'short'
    });
    const timezoneParts = timezoneFormatter.formatToParts(date);
    const timezone = timezoneParts.find(part => part.type === 'timeZoneName')?.value || 'UTC';
    
    const timeString = timeFormatter.format(date);
    const dateString = dateFormatter.format(date);
    const formattedDateTime = `${dateString} ${timeString} ${timezone}`;
    
    // Create modern, clean datetime text
    this.textNode = new Konva.Text({
      x: x,
      y: y,
      width: width,
      text: formattedDateTime,
      fontSize: 11, // Reduced from 14 - much smaller
      fontFamily: 'monospace', // Monospace for better time readability
      fontStyle: 'normal',
      fill: '#ffffff',
      stroke: 'rgba(0, 0, 0, 0.3)', // Subtle stroke
      strokeWidth: 0.5, // Very thin stroke
      align: 'right',
      letterSpacing: 0.5, // Slight letter spacing for clarity
      name: 'datetime-text'
    });
    
    return this.textNode;
  }

  update(epochTime, data) {
    if (!this.textNode) return;
    
    // Format date and time with same modern format
    const date = new Date(epochTime);
    
    const timeFormatter = new Intl.DateTimeFormat('en-US', {
      timeZone: data.timeZone,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    });
    
    const dateFormatter = new Intl.DateTimeFormat('en-US', {
      timeZone: data.timeZone,
      month: '2-digit',
      day: '2-digit',
      year: '2-digit'
    });
    
    // Get timezone abbreviation
    const timezoneFormatter = new Intl.DateTimeFormat('en-US', {
      timeZone: data.timeZone,
      timeZoneName: 'short'
    });
    const timezoneParts = timezoneFormatter.formatToParts(date);
    const timezone = timezoneParts.find(part => part.type === 'timeZoneName')?.value || 'UTC';
    
    const timeString = timeFormatter.format(date);
    const dateString = dateFormatter.format(date);
    const formattedDateTime = `${dateString} ${timeString} ${timezone}`;
    
    this.textNode.text(formattedDateTime);
  }
}

class Header extends BaseVisualizer {
  constructor(staticLayer, dynamicLayer, metadata = {}) {
    super(staticLayer, dynamicLayer, metadata);
    this.headerGroup = null;
    this.speedBadge = new SpeedBadge();
    this.notificationContainer = new NotificationContainer();
    this.timestamp = new Timestamp();
  }

  processMetadata(metadata = {}) {
    // Extract session and device information from metadata with fallbacks to dummy data
    const sessionInfo = metadata?.session_info || {};
    const deviceInfo = metadata?.device_info || {};
    const inferenceData = metadata?.inference_data || {};
    
    // Extract header banner data with comprehensive fallbacks
    return {
      // Session details - fallback to dummy data
      sessionId: sessionInfo.session_id || 'TEST-SESSION-001',
      timestamp: sessionInfo.start_time || new Date().toISOString(),
      duration: sessionInfo.duration_ms || 120000, // 2 minutes default
      
      // Device information - fallback to dummy data
      deviceModel: deviceInfo.model || 'DashCam Pro X1',
      firmwareVersion: deviceInfo.firmware_version || 'v2.1.3',
      
      // Alert/inference information - fallback to dummy data
      alertId: metadata?.alertId || 'ALERT-SPD-001',
      alertType: metadata?.alert_type || 'speeding',
      confidenceLevel: inferenceData?.confidence || 0.85,
      
      // Speed and location data - dummy data for testing
      currentSpeed: metadata?.currentSpeed || 42,
      speedLimit: metadata?.speedLimit || 35,
      location: metadata?.location || 'Highway 101',
      
      // Alert messages - dummy data for testing
      alertMessages: metadata?.alertMessages || ["SPEED LIMIT EXCEEDED", "DRIVER ATTENTION"],
      
      // Time zone - fallback to dummy data
      timeZone: metadata?.timeZone || 'America/Los_Angeles',
      
      // Additional dummy data for richer testing
      driverName: metadata?.driverName || 'John Doe',
      vehicleId: metadata?.vehicleId || 'VH-12345',
      tripId: metadata?.tripId || 'TRIP-2024-001',
      gpsCoords: metadata?.gpsCoords || { lat: 37.7749, lng: -122.4194 }
    };
  }

  display(epochTime, videoRect) {
    const L = videoRect.height;
    const W = videoRect.width;
    const padding = 10;

    // Create header group only once
    if (!this.headerGroup) {
      this.headerGroup = new Konva.Group();

      // Create speed badge (top-left)
      const speedBadgeGroup = this.speedBadge.create(this.data, padding, padding);
      this.headerGroup.add(speedBadgeGroup);
      
      // Create notification cards (top-center)
      const notificationGroup = this.notificationContainer.create(
        this.data.alertMessages, 
        W / 2, // center X
        padding // start Y
      );
      this.headerGroup.add(notificationGroup);
      
      // Create timestamp (top-right)
      const timestampNode = this.timestamp.create(
        epochTime,
        this.data,
        W - 200, // Increased from W - 180 to accommodate timezone
        padding, // y position
        180 // Increased width from 160 to fit timezone
      );
      this.headerGroup.add(timestampNode);
      
      this.staticLayer.add(this.headerGroup);
    } else {
      // Update timestamp (this changes frequently)
      this.timestamp.update(epochTime, this.data);
      this.staticLayer.batchDraw();
    }
  }

}

export { Header };

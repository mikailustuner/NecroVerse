/**
 * DOM Event Mapper
 * Maps DOM events to Java AWT events
 */

import { Component } from "./component";
import { MouseEvent, KeyEvent, ActionEvent } from "./events";

/**
 * Map DOM mouse event to Java MouseEvent
 */
export function mapMouseEvent(domEvent: globalThis.MouseEvent, component: Component): MouseEvent {
  const rect = (domEvent.target as HTMLElement)?.getBoundingClientRect();
  const x = domEvent.clientX - (rect?.left || 0);
  const y = domEvent.clientY - (rect?.top || 0);
  
  let button = 0; // NOBUTTON
  if (domEvent.button === 0) button = 1; // BUTTON1
  else if (domEvent.button === 1) button = 2; // BUTTON2
  else if (domEvent.button === 2) button = 3; // BUTTON3
  
  let modifiers = 0;
  if (domEvent.shiftKey) modifiers |= 1; // SHIFT_MASK
  if (domEvent.ctrlKey) modifiers |= 2; // CTRL_MASK
  if (domEvent.metaKey) modifiers |= 4; // META_MASK
  if (domEvent.altKey) modifiers |= 8; // ALT_MASK
  
  let eventId = MouseEvent.MOUSE_CLICKED;
  if (domEvent.type === 'mousedown') eventId = MouseEvent.MOUSE_PRESSED;
  else if (domEvent.type === 'mouseup') eventId = MouseEvent.MOUSE_RELEASED;
  else if (domEvent.type === 'mouseenter') eventId = MouseEvent.MOUSE_ENTERED;
  else if (domEvent.type === 'mouseleave') eventId = MouseEvent.MOUSE_EXITED;
  else if (domEvent.type === 'mousemove') eventId = MouseEvent.MOUSE_MOVED;
  else if (domEvent.type === 'mousedrag') eventId = MouseEvent.MOUSE_DRAGGED;
  
  return new MouseEvent(
    component,
    eventId,
    domEvent.timeStamp,
    modifiers,
    x,
    y,
    domEvent.detail || 1,
    false,
    button
  );
}

/**
 * Map DOM keyboard event to Java KeyEvent
 */
export function mapKeyEvent(domEvent: globalThis.KeyboardEvent, component: Component): KeyEvent {
  let modifiers = 0;
  if (domEvent.shiftKey) modifiers |= 1; // SHIFT_MASK
  if (domEvent.ctrlKey) modifiers |= 2; // CTRL_MASK
  if (domEvent.metaKey) modifiers |= 4; // META_MASK
  if (domEvent.altKey) modifiers |= 8; // ALT_MASK
  
  let eventId = KeyEvent.KEY_TYPED;
  if (domEvent.type === 'keydown') eventId = KeyEvent.KEY_PRESSED;
  else if (domEvent.type === 'keyup') eventId = KeyEvent.KEY_RELEASED;
  
  const keyCode = domEvent.keyCode || domEvent.which || 0;
  const keyChar = domEvent.key.length === 1 ? domEvent.key : String.fromCharCode(keyCode);
  
  return new KeyEvent(
    component,
    eventId,
    domEvent.timeStamp,
    modifiers,
    keyCode,
    keyChar,
    0 // KEY_LOCATION_UNKNOWN
  );
}

/**
 * Attach DOM event listeners to component's canvas
 */
export function attachDOMEventListeners(canvas: HTMLCanvasElement, component: Component): void {
  // Mouse events
  canvas.addEventListener('mousedown', (e) => {
    const mouseEvent = mapMouseEvent(e, component);
    component.listeners.fireMouseEvent(mouseEvent);
  });
  
  canvas.addEventListener('mouseup', (e) => {
    const mouseEvent = mapMouseEvent(e, component);
    component.listeners.fireMouseEvent(mouseEvent);
  });
  
  canvas.addEventListener('click', (e) => {
    const mouseEvent = mapMouseEvent(e, component);
    component.listeners.fireMouseEvent(mouseEvent);
  });
  
  canvas.addEventListener('mousemove', (e) => {
    const mouseEvent = mapMouseEvent(e, component);
    component.listeners.fireMouseEvent(mouseEvent);
  });
  
  canvas.addEventListener('mouseenter', (e) => {
    const mouseEvent = mapMouseEvent(e, component);
    component.listeners.fireMouseEvent(mouseEvent);
  });
  
  canvas.addEventListener('mouseleave', (e) => {
    const mouseEvent = mapMouseEvent(e, component);
    component.listeners.fireMouseEvent(mouseEvent);
  });
  
  // Keyboard events
  canvas.addEventListener('keydown', (e) => {
    const keyEvent = mapKeyEvent(e, component);
    component.listeners.fireKeyEvent(keyEvent);
  });
  
  canvas.addEventListener('keyup', (e) => {
    const keyEvent = mapKeyEvent(e, component);
    component.listeners.fireKeyEvent(keyEvent);
  });
  
  canvas.addEventListener('keypress', (e) => {
    const keyEvent = mapKeyEvent(e, component);
    component.listeners.fireKeyEvent(keyEvent);
  });
  
  // Make canvas focusable for keyboard events
  canvas.setAttribute('tabindex', '0');
}


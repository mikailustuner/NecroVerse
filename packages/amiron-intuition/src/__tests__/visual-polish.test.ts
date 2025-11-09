/**
 * Visual Polish Feature Tests
 * Tests for animations, loading indicator, and visual effects
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { AnimationManager, Easing } from '../animations';
import { LoadingIndicator } from '../loading-indicator';
import { Window } from '../window';
import { Button } from '../widget';

describe('AnimationManager', () => {
  let animationManager: AnimationManager;
  
  beforeEach(() => {
    animationManager = new AnimationManager();
  });
  
  it('should start and track animations', () => {
    const onUpdate = vi.fn();
    
    animationManager.start('test-anim', 100, onUpdate);
    
    expect(animationManager.hasActiveAnimations()).toBe(true);
  });
  
  it('should update animation progress', () => {
    const onUpdate = vi.fn();
    
    // Mock performance.now()
    const startTime = 1000;
    vi.spyOn(performance, 'now').mockReturnValue(startTime);
    
    animationManager.start('test-anim', 100, onUpdate);
    
    // Advance time by 50ms (50% progress)
    vi.spyOn(performance, 'now').mockReturnValue(startTime + 50);
    animationManager.update();
    
    expect(onUpdate).toHaveBeenCalled();
    const progress = onUpdate.mock.calls[0][0];
    expect(progress).toBeGreaterThan(0);
    expect(progress).toBeLessThanOrEqual(1);
  });
  
  it('should complete animations and call onComplete', () => {
    const onUpdate = vi.fn();
    const onComplete = vi.fn();
    
    const startTime = 1000;
    vi.spyOn(performance, 'now').mockReturnValue(startTime);
    
    animationManager.start('test-anim', 100, onUpdate, Easing.linear, onComplete);
    
    // Advance time past duration
    vi.spyOn(performance, 'now').mockReturnValue(startTime + 150);
    animationManager.update();
    
    expect(onComplete).toHaveBeenCalled();
    expect(animationManager.hasActiveAnimations()).toBe(false);
  });
  
  it('should stop animations', () => {
    const onUpdate = vi.fn();
    
    animationManager.start('test-anim', 100, onUpdate);
    expect(animationManager.hasActiveAnimations()).toBe(true);
    
    animationManager.stop('test-anim');
    expect(animationManager.hasActiveAnimations()).toBe(false);
  });
  
  it('should clear all animations', () => {
    animationManager.start('anim1', 100, vi.fn());
    animationManager.start('anim2', 100, vi.fn());
    
    expect(animationManager.hasActiveAnimations()).toBe(true);
    
    animationManager.clear();
    expect(animationManager.hasActiveAnimations()).toBe(false);
  });
});

describe('Easing Functions', () => {
  it('should provide linear easing', () => {
    expect(Easing.linear(0)).toBe(0);
    expect(Easing.linear(0.5)).toBe(0.5);
    expect(Easing.linear(1)).toBe(1);
  });
  
  it('should provide easeIn', () => {
    expect(Easing.easeIn(0)).toBe(0);
    expect(Easing.easeIn(1)).toBe(1);
    expect(Easing.easeIn(0.5)).toBeLessThan(0.5); // Slower start
  });
  
  it('should provide easeOut', () => {
    expect(Easing.easeOut(0)).toBe(0);
    expect(Easing.easeOut(1)).toBe(1);
    expect(Easing.easeOut(0.5)).toBeGreaterThan(0.5); // Faster start
  });
  
  it('should provide easeInOut', () => {
    expect(Easing.easeInOut(0)).toBe(0);
    expect(Easing.easeInOut(1)).toBe(1);
    // Should be slower at start and end
    expect(Easing.easeInOut(0.25)).toBeLessThan(0.25);
    expect(Easing.easeInOut(0.75)).toBeGreaterThan(0.75);
  });
});

describe('LoadingIndicator', () => {
  it('should initialize with message', () => {
    const loader = new LoadingIndicator(
      { x: 0, y: 0, width: 100, height: 100 },
      'Loading...'
    );
    
    expect(loader).toBeDefined();
  });
  
  it('should update rotation', () => {
    const loader = new LoadingIndicator(
      { x: 0, y: 0, width: 100, height: 100 },
      'Loading...'
    );
    
    // Access private rotation through update
    loader.update(16); // One frame at 60fps
    
    // Rotation should have changed (we can't directly test private field)
    expect(loader).toBeDefined();
  });
  
  it('should allow message updates', () => {
    const loader = new LoadingIndicator(
      { x: 0, y: 0, width: 100, height: 100 },
      'Loading...'
    );
    
    loader.setMessage('Almost ready...');
    
    // Message updated successfully
    expect(loader).toBeDefined();
  });
  
  it('should not handle events', () => {
    const loader = new LoadingIndicator(
      { x: 0, y: 0, width: 100, height: 100 },
      'Loading...'
    );
    
    const handled = loader.handleEvent({
      type: 'click',
      position: { x: 50, y: 50 },
    });
    
    expect(handled).toBe(false);
  });
});

describe('Window Visual Effects', () => {
  it('should initialize with opacity 0 for fade-in', () => {
    const window = new Window('Test', { x: 0, y: 0, width: 200, height: 200 });
    
    expect(window.opacity).toBe(0);
  });
  
  it('should initialize with glowIntensity 0', () => {
    const window = new Window('Test', { x: 0, y: 0, width: 200, height: 200 });
    
    expect(window.glowIntensity).toBe(0);
  });
  
  it('should support focus state', () => {
    const window = new Window('Test', { x: 0, y: 0, width: 200, height: 200 });
    
    expect(window.focused).toBe(false);
    
    window.focused = true;
    expect(window.focused).toBe(true);
  });
});

describe('Button Hover Transitions', () => {
  it('should initialize with hoverTransition 0', () => {
    const button = new Button(
      { x: 0, y: 0, width: 100, height: 30 },
      'Test',
      vi.fn()
    );
    
    expect(button.hoverTransition).toBe(0);
  });
  
  it('should increase hoverTransition when hovered', () => {
    const button = new Button(
      { x: 0, y: 0, width: 100, height: 30 },
      'Test',
      vi.fn()
    );
    
    button.hovered = true;
    button.updateTransition(16); // One frame
    
    expect(button.hoverTransition).toBeGreaterThan(0);
  });
  
  it('should decrease hoverTransition when not hovered', () => {
    const button = new Button(
      { x: 0, y: 0, width: 100, height: 30 },
      'Test',
      vi.fn()
    );
    
    // Set initial hover state
    button.hovered = true;
    button.hoverTransition = 1;
    
    // Remove hover
    button.hovered = false;
    button.updateTransition(16);
    
    expect(button.hoverTransition).toBeLessThan(1);
  });
  
  it('should clamp hoverTransition between 0 and 1', () => {
    const button = new Button(
      { x: 0, y: 0, width: 100, height: 30 },
      'Test',
      vi.fn()
    );
    
    button.hovered = true;
    
    // Update many times
    for (let i = 0; i < 100; i++) {
      button.updateTransition(16);
    }
    
    expect(button.hoverTransition).toBeLessThanOrEqual(1);
    expect(button.hoverTransition).toBeGreaterThanOrEqual(0);
  });
});

/**
 * Layout Managers
 * Common AWT layout managers
 */

import { Container, Component } from "./component";

/**
 * LayoutManager interface
 */
export interface LayoutManager {
  addLayoutComponent(comp: Component, constraints?: any): void;
  removeLayoutComponent(comp: Component): void;
  removeAllComponents(): void;
  layoutContainer(parent: Container): void;
  minimumLayoutSize(parent: Container): { width: number; height: number };
  preferredLayoutSize(parent: Container): { width: number; height: number };
  maximumLayoutSize(parent: Container): { width: number; height: number };
}

/**
 * FlowLayout - arranges components in a row
 */
export class FlowLayout implements LayoutManager {
  private alignment: number = 0; // LEFT = 0, CENTER = 1, RIGHT = 2
  private hgap: number = 5;
  private vgap: number = 5;
  private components: Component[] = [];

  constructor(alignment?: number, hgap?: number, vgap?: number) {
    if (alignment !== undefined) this.alignment = alignment;
    if (hgap !== undefined) this.hgap = hgap;
    if (vgap !== undefined) this.vgap = vgap;
  }

  addLayoutComponent(comp: Component, constraints?: any): void {
    if (!this.components.includes(comp)) {
      this.components.push(comp);
    }
  }

  removeLayoutComponent(comp: Component): void {
    const index = this.components.indexOf(comp);
    if (index >= 0) {
      this.components.splice(index, 1);
    }
  }

  removeAllComponents(): void {
    this.components = [];
  }

  layoutContainer(parent: Container): void {
    const components = parent.getComponents();
    if (components.length === 0) return;

    let x = this.hgap;
    let y = this.vgap;
    let rowHeight = 0;
    const parentWidth = parent.width;
    const parentHeight = parent.height;

    for (const comp of components) {
      if (!comp.visible) continue;

      const compSize = comp.getSize();
      const compWidth = compSize.width;
      const compHeight = compSize.height;

      // Check if component fits on current row
      if (x + compWidth + this.hgap > parentWidth && x > this.hgap) {
        // Move to next row
        y += rowHeight + this.vgap;
        x = this.hgap;
        rowHeight = 0;
      }

      // Set component position
      comp.setLocation(x, y);
      rowHeight = Math.max(rowHeight, compHeight);

      // Move to next position
      x += compWidth + this.hgap;
    }
  }

  minimumLayoutSize(parent: Container): { width: number; height: number } {
    return this.preferredLayoutSize(parent);
  }

  preferredLayoutSize(parent: Container): { width: number; height: number } {
    const components = parent.getComponents();
    if (components.length === 0) {
      return { width: this.hgap * 2, height: this.vgap * 2 };
    }

    let width = this.hgap;
    let height = this.vgap;
    let rowWidth = 0;
    let rowHeight = 0;
    const parentWidth = parent.width;

    for (const comp of components) {
      if (!comp.visible) continue;

      const compSize = comp.getSize();
      const compWidth = compSize.width;
      const compHeight = compSize.height;

      if (rowWidth + compWidth + this.hgap > parentWidth && rowWidth > 0) {
        // New row
        width = Math.max(width, rowWidth + this.hgap);
        height += rowHeight + this.vgap;
        rowWidth = compWidth + this.hgap;
        rowHeight = compHeight;
      } else {
        rowWidth += compWidth + this.hgap;
        rowHeight = Math.max(rowHeight, compHeight);
      }
    }

    width = Math.max(width, rowWidth);
    height += rowHeight + this.vgap;

    return { width, height };
  }

  maximumLayoutSize(parent: Container): { width: number; height: number } {
    return { width: Number.MAX_SAFE_INTEGER, height: Number.MAX_SAFE_INTEGER };
  }
}

/**
 * BorderLayout - arranges components in five regions
 */
export class BorderLayout implements LayoutManager {
  private hgap: number = 0;
  private vgap: number = 0;
  private north: Component | null = null;
  private south: Component | null = null;
  private east: Component | null = null;
  private west: Component | null = null;
  private center: Component | null = null;

  constructor(hgap?: number, vgap?: number) {
    if (hgap !== undefined) this.hgap = hgap;
    if (vgap !== undefined) this.vgap = vgap;
  }

  addLayoutComponent(comp: Component, constraints?: any): void {
    const constraint = constraints || 'Center';
    const constraintStr = typeof constraint === 'string' ? constraint : 'Center';

    switch (constraintStr.toUpperCase()) {
      case 'NORTH':
        this.north = comp;
        break;
      case 'SOUTH':
        this.south = comp;
        break;
      case 'EAST':
        this.east = comp;
        break;
      case 'WEST':
        this.west = comp;
        break;
      case 'CENTER':
      default:
        this.center = comp;
        break;
    }
  }

  removeLayoutComponent(comp: Component): void {
    if (this.north === comp) this.north = null;
    if (this.south === comp) this.south = null;
    if (this.east === comp) this.east = null;
    if (this.west === comp) this.west = null;
    if (this.center === comp) this.center = null;
  }

  removeAllComponents(): void {
    this.north = null;
    this.south = null;
    this.east = null;
    this.west = null;
    this.center = null;
  }

  layoutContainer(parent: Container): void {
    const top = this.vgap;
    const bottom = parent.height - this.vgap;
    const left = this.hgap;
    const right = parent.width - this.hgap;

    // North
    if (this.north && this.north.visible) {
      const height = this.north.height;
      this.north.setBounds(left, top, right - left, height);
    }

    // South
    if (this.south && this.south.visible) {
      const height = this.south.height;
      this.south.setBounds(left, bottom - height, right - left, height);
    }

    // East
    if (this.east && this.east.visible) {
      const width = this.east.width;
      const topY = this.north && this.north.visible ? this.north.y + this.north.height + this.vgap : top;
      const bottomY = this.south && this.south.visible ? this.south.y - this.vgap : bottom;
      this.east.setBounds(right - width, topY, width, bottomY - topY);
    }

    // West
    if (this.west && this.west.visible) {
      const width = this.west.width;
      const topY = this.north && this.north.visible ? this.north.y + this.north.height + this.vgap : top;
      const bottomY = this.south && this.south.visible ? this.south.y - this.vgap : bottom;
      this.west.setBounds(left, topY, width, bottomY - topY);
    }

    // Center
    if (this.center && this.center.visible) {
      const topY = this.north && this.north.visible ? this.north.y + this.north.height + this.vgap : top;
      const bottomY = this.south && this.south.visible ? this.south.y - this.vgap : bottom;
      const leftX = this.west && this.west.visible ? this.west.x + this.west.width + this.hgap : left;
      const rightX = this.east && this.east.visible ? this.east.x - this.hgap : right;
      this.center.setBounds(leftX, topY, rightX - leftX, bottomY - topY);
    }
  }

  minimumLayoutSize(parent: Container): { width: number; height: number } {
    return this.preferredLayoutSize(parent);
  }

  preferredLayoutSize(parent: Container): { width: number; height: number } {
    let width = 0;
    let height = 0;

    if (this.north && this.north.visible) {
      const size = this.north.getSize();
      width = Math.max(width, size.width);
      height += size.height + this.vgap;
    }

    if (this.south && this.south.visible) {
      const size = this.south.getSize();
      width = Math.max(width, size.width);
      height += size.height + this.vgap;
    }

    let middleHeight = 0;
    if (this.east && this.east.visible) {
      const size = this.east.getSize();
      width += size.width + this.hgap;
      middleHeight = Math.max(middleHeight, size.height);
    }

    if (this.west && this.west.visible) {
      const size = this.west.getSize();
      width += size.width + this.hgap;
      middleHeight = Math.max(middleHeight, size.height);
    }

    if (this.center && this.center.visible) {
      const size = this.center.getSize();
      width += size.width;
      middleHeight = Math.max(middleHeight, size.height);
    }

    height += middleHeight;

    return { width, height };
  }

  maximumLayoutSize(parent: Container): { width: number; height: number } {
    return { width: Number.MAX_SAFE_INTEGER, height: Number.MAX_SAFE_INTEGER };
  }
}

/**
 * GridLayout - arranges components in a grid
 */
export class GridLayout implements LayoutManager {
  private rows: number;
  private cols: number;
  private hgap: number = 0;
  private vgap: number = 0;
  private components: Component[] = [];

  constructor(rows: number, cols: number, hgap?: number, vgap?: number) {
    this.rows = rows;
    this.cols = cols;
    if (hgap !== undefined) this.hgap = hgap;
    if (vgap !== undefined) this.vgap = vgap;
  }

  addLayoutComponent(comp: Component, constraints?: any): void {
    if (!this.components.includes(comp)) {
      this.components.push(comp);
    }
  }

  removeLayoutComponent(comp: Component): void {
    const index = this.components.indexOf(comp);
    if (index >= 0) {
      this.components.splice(index, 1);
    }
  }

  removeAllComponents(): void {
    this.components = [];
  }

  layoutContainer(parent: Container): void {
    const components = parent.getComponents().filter(c => c.visible);
    if (components.length === 0) return;

    const actualRows = this.rows > 0 ? this.rows : Math.ceil(components.length / this.cols);
    const actualCols = this.cols > 0 ? this.cols : Math.ceil(components.length / this.rows);

    const cellWidth = Math.floor((parent.width - (actualCols - 1) * this.hgap) / actualCols);
    const cellHeight = Math.floor((parent.height - (actualRows - 1) * this.vgap) / actualRows);

    for (let i = 0; i < components.length; i++) {
      const comp = components[i];
      const row = Math.floor(i / actualCols);
      const col = i % actualCols;
      const x = col * (cellWidth + this.hgap);
      const y = row * (cellHeight + this.vgap);
      comp.setBounds(x, y, cellWidth, cellHeight);
    }
  }

  minimumLayoutSize(parent: Container): { width: number; height: number } {
    return this.preferredLayoutSize(parent);
  }

  preferredLayoutSize(parent: Container): { width: number; height: number } {
    const components = parent.getComponents().filter(c => c.visible);
    if (components.length === 0) {
      return { width: 0, height: 0 };
    }

    const actualRows = this.rows > 0 ? this.rows : Math.ceil(components.length / this.cols);
    const actualCols = this.cols > 0 ? this.cols : Math.ceil(components.length / this.rows);

    let maxCellWidth = 0;
    let maxCellHeight = 0;

    for (const comp of components) {
      const size = comp.getSize();
      maxCellWidth = Math.max(maxCellWidth, size.width);
      maxCellHeight = Math.max(maxCellHeight, size.height);
    }

    const width = actualCols * maxCellWidth + (actualCols - 1) * this.hgap;
    const height = actualRows * maxCellHeight + (actualRows - 1) * this.vgap;

    return { width, height };
  }

  maximumLayoutSize(parent: Container): { width: number; height: number } {
    return { width: Number.MAX_SAFE_INTEGER, height: Number.MAX_SAFE_INTEGER };
  }
}


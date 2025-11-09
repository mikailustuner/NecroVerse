/**
 * Swing Components
 * Common Swing components
 */

import { JComponent } from "./jcomponent";
import { Container } from "../awt/component";
import { Graphics, Color, ColorConstants } from "../awt/graphics";

/**
 * JButton - Swing button component
 */
export class JButton extends JComponent {
  private text: string = "";
  private pressed: boolean = false;

  constructor(text?: string) {
    super();
    if (text !== undefined) {
      this.text = text;
    }
    this.setSize(100, 30);
  }

  protected paintComponent(g: Graphics): void {
    // Paint button background
    if (this.pressed) {
      g.setColor({ r: 200, g: 200, b: 200, a: 1 });
    } else if (this.background) {
      g.setColor(this.background);
    } else {
      g.setColor({ r: 240, g: 240, b: 240, a: 1 });
    }
    g.fillRect(0, 0, this.width, this.height);

    // Paint button text
    if (this.text) {
      g.setColor(this.foreground || ColorConstants.BLACK);
      const metrics = g.getFontMetrics();
      const textWidth = g.measureText(this.text);
      const textX = (this.width - textWidth) / 2;
      const textY = (this.height + metrics.ascent) / 2;
      g.drawString(this.text, textX, textY);
    }
  }

  /**
   * Set text
   */
  setText(text: string): void {
    this.text = text;
    this.repaint();
  }

  /**
   * Get text
   */
  getText(): string {
    return this.text;
  }

  /**
   * Set pressed state
   */
  setPressed(pressed: boolean): void {
    this.pressed = pressed;
    this.repaint();
  }

  /**
   * Is pressed
   */
  isPressed(): boolean {
    return this.pressed;
  }
}

/**
 * JLabel - Swing label component
 */
export class JLabel extends JComponent {
  private text: string = "";
  private horizontalAlignment: number = 0; // LEFT = 0, CENTER = 1, RIGHT = 2

  constructor(text?: string, horizontalAlignment?: number) {
    super();
    if (text !== undefined) {
      this.text = text;
    }
    if (horizontalAlignment !== undefined) {
      this.horizontalAlignment = horizontalAlignment;
    }
    this.setSize(100, 20);
  }

  protected paintComponent(g: Graphics): void {
    // Paint label text
    if (this.text) {
      g.setColor(this.foreground || ColorConstants.BLACK);
      const metrics = g.getFontMetrics();
      let textX = 0;
      const textWidth = g.measureText(this.text);
      
      if (this.horizontalAlignment === 1) { // CENTER
        textX = (this.width - textWidth) / 2;
      } else if (this.horizontalAlignment === 2) { // RIGHT
        textX = this.width - textWidth;
      }
      
      const textY = (this.height + metrics.ascent) / 2;
      g.drawString(this.text, textX, textY);
    }
  }

  /**
   * Set text
   */
  setText(text: string): void {
    this.text = text;
    this.repaint();
  }

  /**
   * Get text
   */
  getText(): string {
    return this.text;
  }

  /**
   * Set horizontal alignment
   */
  setHorizontalAlignment(alignment: number): void {
    this.horizontalAlignment = alignment;
    this.repaint();
  }

  /**
   * Get horizontal alignment
   */
  getHorizontalAlignment(): number {
    return this.horizontalAlignment;
  }
}

/**
 * JPanel - Swing panel component
 */
export class JPanel extends Container {
  private layout: any = null;

  constructor(layout?: any) {
    super();
    if (layout !== undefined) {
      this.layout = layout;
      this.setLayout(layout);
    }
  }

  paint(g: Graphics): void {
    // Paint background
    if (this.background) {
      g.setColor(this.background);
      g.fillRect(0, 0, this.width, this.height);
    }

    // Paint children
    super.paint(g);
  }
}

/**
 * JTextField - Swing text field component
 */
export class JTextField extends JComponent {
  private text: string = "";
  private columns: number = 10;
  private editable: boolean = true;
  private focused: boolean = false;

  constructor(text?: string, columns?: number) {
    super();
    if (text !== undefined) {
      this.text = text;
    }
    if (columns !== undefined) {
      this.columns = columns;
    }
    this.setSize(columns * 8, 25);
  }

  protected paintComponent(g: Graphics): void {
    // Paint text field background
    if (this.background) {
      g.setColor(this.background);
    } else {
      g.setColor(ColorConstants.WHITE);
    }
    g.fillRect(0, 0, this.width, this.height);

    // Paint text
    if (this.text) {
      g.setColor(this.foreground || ColorConstants.BLACK);
      const metrics = g.getFontMetrics();
      const textY = (this.height + metrics.ascent) / 2;
      g.drawString(this.text, 5, textY);
    }

    // Paint cursor if focused
    if (this.focused) {
      g.setColor(ColorConstants.BLACK);
      const metrics = g.getFontMetrics();
      const textWidth = g.measureText(this.text);
      const cursorX = 5 + textWidth;
      const cursorY = (this.height - metrics.height) / 2;
      g.drawLine(cursorX, cursorY, cursorX, cursorY + metrics.height);
    }
  }

  /**
   * Set text
   */
  setText(text: string): void {
    this.text = text;
    this.repaint();
  }

  /**
   * Get text
   */
  getText(): string {
    return this.text;
  }

  /**
   * Set columns
   */
  setColumns(columns: number): void {
    this.columns = columns;
    this.setSize(columns * 8, 25);
    this.repaint();
  }

  /**
   * Get columns
   */
  getColumns(): number {
    return this.columns;
  }

  /**
   * Set editable
   */
  setEditable(editable: boolean): void {
    this.editable = editable;
  }

  /**
   * Is editable
   */
  isEditable(): boolean {
    return this.editable;
  }

  /**
   * Set focused
   */
  setFocused(focused: boolean): void {
    this.focused = focused;
    this.repaint();
  }

  /**
   * Is focused
   */
  isFocused(): boolean {
    return this.focused;
  }
}

/**
 * JTextArea - Swing text area component
 */
export class JTextArea extends JComponent {
  private text: string = "";
  private rows: number = 5;
  private columns: number = 20;
  private editable: boolean = true;
  private lineWrap: boolean = false;
  private wrapStyleWord: boolean = false;

  constructor(text?: string, rows?: number, columns?: number) {
    super();
    if (text !== undefined) {
      this.text = text;
    }
    if (rows !== undefined) {
      this.rows = rows;
    }
    if (columns !== undefined) {
      this.columns = columns;
    }
    this.setSize(columns * 8, rows * 20);
  }

  protected paintComponent(g: Graphics): void {
    // Paint text area background
    if (this.background) {
      g.setColor(this.background);
    } else {
      g.setColor(ColorConstants.WHITE);
    }
    g.fillRect(0, 0, this.width, this.height);

    // Paint text
    if (this.text) {
      g.setColor(this.foreground || ColorConstants.BLACK);
      const lines = this.text.split('\n');
      const metrics = g.getFontMetrics();
      const lineHeight = metrics.height;
      
      for (let i = 0; i < lines.length && i < this.rows; i++) {
        g.drawString(lines[i], 5, 5 + (i + 1) * lineHeight);
      }
    }
  }

  /**
   * Set text
   */
  setText(text: string): void {
    this.text = text;
    this.repaint();
  }

  /**
   * Get text
   */
  getText(): string {
    return this.text;
  }

  /**
   * Append text
   */
  append(text: string): void {
    this.text += text;
    this.repaint();
  }

  /**
   * Set rows
   */
  setRows(rows: number): void {
    this.rows = rows;
    this.setSize(this.columns * 8, rows * 20);
    this.repaint();
  }

  /**
   * Get rows
   */
  getRows(): number {
    return this.rows;
  }

  /**
   * Set columns
   */
  setColumns(columns: number): void {
    this.columns = columns;
    this.setSize(columns * 8, this.rows * 20);
    this.repaint();
  }

  /**
   * Get columns
   */
  getColumns(): number {
    return this.columns;
  }

  /**
   * Set editable
   */
  setEditable(editable: boolean): void {
    this.editable = editable;
  }

  /**
   * Is editable
   */
  isEditable(): boolean {
    return this.editable;
  }

  /**
   * Set line wrap
   */
  setLineWrap(wrap: boolean): void {
    this.lineWrap = wrap;
    this.repaint();
  }

  /**
   * Get line wrap
   */
  getLineWrap(): boolean {
    return this.lineWrap;
  }

  /**
   * Set wrap style word
   */
  setWrapStyleWord(wrap: boolean): void {
    this.wrapStyleWord = wrap;
    this.repaint();
  }

  /**
   * Get wrap style word
   */
  getWrapStyleWord(): boolean {
    return this.wrapStyleWord;
  }
}


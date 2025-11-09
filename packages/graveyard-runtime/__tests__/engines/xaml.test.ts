import { describe, it, expect } from "vitest";
import { XAMLParser } from "../../src/engines/xap-engine";

describe("XAMLParser", () => {
  it("should parse simple XAML", () => {
    const xaml = '<Canvas><Rectangle Width="100" Height="100" Fill="Red"/></Canvas>';
    const parser = new XAMLParser();
    expect(() => parser.parse(xaml)).not.toThrow();
  });

  it("should parse XAML with namespaces", () => {
    const xaml = '<Canvas xmlns="http://schemas.microsoft.com/winfx/2006/xaml/presentation"><Rectangle Width="100" Height="100"/></Canvas>';
    const parser = new XAMLParser();
    expect(() => parser.parse(xaml)).not.toThrow();
  });

  it("should parse XAML with attached properties", () => {
    const xaml = '<Canvas><Rectangle Canvas.Left="10" Canvas.Top="20" Width="100" Height="100"/></Canvas>';
    const parser = new XAMLParser();
    expect(() => parser.parse(xaml)).not.toThrow();
  });

  it("should parse XAML with brushes", () => {
    const xaml = `
      <Canvas>
        <Rectangle Width="100" Height="100">
          <Rectangle.Fill>
            <SolidColorBrush Color="Red"/>
          </Rectangle.Fill>
        </Rectangle>
      </Canvas>
    `;
    const parser = new XAMLParser();
    expect(() => parser.parse(xaml)).not.toThrow();
  });
});


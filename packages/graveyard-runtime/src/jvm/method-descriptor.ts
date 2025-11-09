/**
 * Method Descriptor Parser
 * Parses Java method descriptors to extract parameter types and return type
 * 
 * Examples:
 * "()V" -> no parameters, returns void
 * "(I)V" -> takes int, returns void
 * "(Ljava/lang/String;)V" -> takes String, returns void
 * "(II)I" -> takes two ints, returns int
 * "([I)V" -> takes int array, returns void
 */

export interface MethodDescriptor {
  parameters: JavaType[];
  returnType: JavaType | null;
}

export interface JavaType {
  type: 'void' | 'boolean' | 'byte' | 'char' | 'short' | 'int' | 'long' | 'float' | 'double' | 'object' | 'array';
  className?: string; // For object types
  arrayDimensions?: number; // For array types
  componentType?: JavaType; // For array types
}

/**
 * Parse Java method descriptor
 */
export function parseMethodDescriptor(descriptor: string): MethodDescriptor {
  let index = 0;
  
  // Must start with '('
  if (descriptor[index] !== '(') {
    throw new Error(`Invalid method descriptor: expected '(', got '${descriptor[index]}'`);
  }
  index++;
  
  // Parse parameters
  const parameters: JavaType[] = [];
  while (index < descriptor.length && descriptor[index] !== ')') {
    const { type, nextIndex } = parseType(descriptor, index);
    parameters.push(type);
    index = nextIndex;
  }
  
  // Must have ')'
  if (index >= descriptor.length || descriptor[index] !== ')') {
    throw new Error(`Invalid method descriptor: expected ')', got '${descriptor[index]}'`);
  }
  index++;
  
  // Parse return type
  let returnType: JavaType | null = null;
  if (index < descriptor.length) {
    if (descriptor[index] === 'V') {
      returnType = { type: 'void' };
      index++;
    } else {
      const { type, nextIndex } = parseType(descriptor, index);
      returnType = type;
      index = nextIndex;
    }
  }
  
  if (index !== descriptor.length) {
    throw new Error(`Invalid method descriptor: unexpected characters after return type`);
  }
  
  return { parameters, returnType };
}

/**
 * Parse a single type from descriptor
 */
function parseType(descriptor: string, startIndex: number): { type: JavaType; nextIndex: number } {
  let index = startIndex;
  let arrayDimensions = 0;
  
  // Parse array dimensions
  while (index < descriptor.length && descriptor[index] === '[') {
    arrayDimensions++;
    index++;
  }
  
  if (arrayDimensions > 0) {
    // Parse component type
    const { type: componentType, nextIndex } = parseBaseType(descriptor, index);
    return {
      type: {
        type: 'array',
        arrayDimensions,
        componentType,
      },
      nextIndex,
    };
  }
  
  return parseBaseType(descriptor, index);
}

/**
 * Parse base type (non-array)
 */
function parseBaseType(descriptor: string, startIndex: number): { type: JavaType; nextIndex: number } {
  if (startIndex >= descriptor.length) {
    throw new Error(`Invalid type descriptor: unexpected end of string`);
  }
  
  const char = descriptor[startIndex];
  
  switch (char) {
    case 'V':
      return { type: { type: 'void' }, nextIndex: startIndex + 1 };
    case 'Z':
      return { type: { type: 'boolean' }, nextIndex: startIndex + 1 };
    case 'B':
      return { type: { type: 'byte' }, nextIndex: startIndex + 1 };
    case 'C':
      return { type: { type: 'char' }, nextIndex: startIndex + 1 };
    case 'S':
      return { type: { type: 'short' }, nextIndex: startIndex + 1 };
    case 'I':
      return { type: { type: 'int' }, nextIndex: startIndex + 1 };
    case 'J':
      return { type: { type: 'long' }, nextIndex: startIndex + 1 };
    case 'F':
      return { type: { type: 'float' }, nextIndex: startIndex + 1 };
    case 'D':
      return { type: { type: 'double' }, nextIndex: startIndex + 1 };
    case 'L':
      // Object type: Lpackage/name/ClassName;
      let index = startIndex + 1;
      let className = '';
      while (index < descriptor.length && descriptor[index] !== ';') {
        className += descriptor[index];
        index++;
      }
      if (index >= descriptor.length || descriptor[index] !== ';') {
        throw new Error(`Invalid object type descriptor: missing ';'`);
      }
      // Convert slashes to dots
      className = className.replace(/\//g, '.');
      return {
        type: {
          type: 'object',
          className,
        },
        nextIndex: index + 1,
      };
    default:
      throw new Error(`Invalid type descriptor: unknown type '${char}'`);
  }
}

/**
 * Convert Java type to JavaScript type name
 */
export function javaTypeToJS(type: JavaType): string {
  switch (type.type) {
    case 'void':
      return 'void';
    case 'boolean':
      return 'boolean';
    case 'byte':
    case 'char':
    case 'short':
    case 'int':
      return 'number';
    case 'long':
      return 'bigint';
    case 'float':
    case 'double':
      return 'number';
    case 'object':
      return 'object';
    case 'array':
      return 'array';
    default:
      return 'any';
  }
}

/**
 * Get size of Java type on stack (in words)
 * long and double take 2 words, everything else takes 1
 */
export function getTypeSize(type: JavaType): number {
  if (type.type === 'long' || type.type === 'double') {
    return 2;
  }
  return 1;
}


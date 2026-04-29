export interface ComponentDefinition {
  type: string;
  label: string;
  description?: string;
}

class ComponentRegistry {
  private fieldTypes: Map<string, ComponentDefinition> = new Map();
  private widgetTypes: Map<string, ComponentDefinition> = new Map();

  constructor() {
    this.registerDefaultFieldTypes();
    this.registerDefaultWidgetTypes();
  }

  private registerDefaultFieldTypes() {
    const fieldTypes: ComponentDefinition[] = [
      { type: 'text', label: 'Text Input', description: 'Single line text input' },
      { type: 'textarea', label: 'Text Area', description: 'Multi-line text input' },
      { type: 'select', label: 'Select', description: 'Dropdown select with predefined options' },
      { type: 'checkbox', label: 'Checkbox', description: 'Boolean toggle checkbox' },
      { type: 'email', label: 'Email', description: 'Email input with validation' },
      { type: 'number', label: 'Number', description: 'Numeric input' },
      { type: 'date', label: 'Date', description: 'Date picker input' },
      { type: 'url', label: 'URL', description: 'URL input with validation' },
      { type: 'phone', label: 'Phone', description: 'Phone number input' },
    ];

    fieldTypes.forEach(def => this.registerFieldType(def));
  }

  private registerDefaultWidgetTypes() {
    const widgetTypes: ComponentDefinition[] = [
      { type: 'stat', label: 'Stat Card', description: 'Display metric/KPI card' },
      { type: 'chart', label: 'Chart', description: 'Visual data chart' },
      { type: 'recent', label: 'Recent Records', description: 'Show recently added records' },
    ];

    widgetTypes.forEach(def => this.registerWidgetType(def));
  }

  registerFieldType(definition: ComponentDefinition): void {
    this.fieldTypes.set(definition.type, definition);
  }

  registerWidgetType(definition: ComponentDefinition): void {
    this.widgetTypes.set(definition.type, definition);
  }

  getFieldType(type: string): ComponentDefinition | undefined {
    return this.fieldTypes.get(type);
  }

  getWidgetType(type: string): ComponentDefinition | undefined {
    return this.widgetTypes.get(type);
  }

  getAllFieldTypes(): ComponentDefinition[] {
    return Array.from(this.fieldTypes.values());
  }

  getAllWidgetTypes(): ComponentDefinition[] {
    return Array.from(this.widgetTypes.values());
  }

  isValidFieldType(type: string): boolean {
    return this.fieldTypes.has(type);
  }

  isValidWidgetType(type: string): boolean {
    return this.widgetTypes.has(type);
  }

  getFieldTypeList(): string[] {
    return Array.from(this.fieldTypes.keys());
  }

  getWidgetTypeList(): string[] {
    return Array.from(this.widgetTypes.keys());
  }
}

// Singleton instance
export const componentRegistry = new ComponentRegistry();

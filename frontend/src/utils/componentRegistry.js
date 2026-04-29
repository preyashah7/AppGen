// Field types registry - extensible list of supported input field types
export const FIELD_TYPES = {
  text: { type: 'text', label: 'Text Input', description: 'Single line text input' },
  textarea: { type: 'textarea', label: 'Text Area', description: 'Multi-line text input' },
  select: { type: 'select', label: 'Select', description: 'Dropdown select with predefined options' },
  checkbox: { type: 'checkbox', label: 'Checkbox', description: 'Boolean toggle checkbox' },
  email: { type: 'email', label: 'Email', description: 'Email input with validation' },
  number: { type: 'number', label: 'Number', description: 'Numeric input' },
  date: { type: 'date', label: 'Date', description: 'Date picker input' },
  url: { type: 'url', label: 'URL', description: 'URL input with validation' },
  phone: { type: 'phone', label: 'Phone', description: 'Phone number input' },
};

// Widget types registry - extensible list of supported dashboard widget types
export const WIDGET_TYPES = {
  stat: { type: 'stat', label: 'Stat Card', description: 'Display metric/KPI card' },
  chart: { type: 'chart', label: 'Chart', description: 'Visual data chart (bar, pie, etc)' },
  recent: { type: 'recent', label: 'Recent Records', description: 'Show recently added records' },
};

// Page types registry - extensible list of supported page types
export const PAGE_TYPES = {
  table: { type: 'table', label: 'Table', description: 'Entity records table view' },
};

// Get all available field types as array
export const getFieldTypesList = () => Object.values(FIELD_TYPES);

// Get all available widget types as array
export const getWidgetTypesList = () => Object.values(WIDGET_TYPES);

// Get all available page types as array
export const getPageTypesList = () => Object.values(PAGE_TYPES);

// Check if a field type is registered
export const isValidFieldType = (type) => type in FIELD_TYPES;

// Check if a widget type is registered
export const isValidWidgetType = (type) => type in WIDGET_TYPES;

// Check if a page type is registered
export const isValidPageType = (type) => type in PAGE_TYPES;

// Register a custom field type (for extensions)
const customFieldTypes = {};
export const registerFieldType = (typeKey, definition) => {
  customFieldTypes[typeKey] = definition;
};

export const getCustomFieldTypes = () => customFieldTypes;

// Register a custom widget type (for extensions)
const customWidgetTypes = {};
export const registerWidgetType = (typeKey, definition) => {
  customWidgetTypes[typeKey] = definition;
};

export const getCustomWidgetTypes = () => customWidgetTypes;

// Get field type definition
export const getFieldType = (type) => FIELD_TYPES[type] || customFieldTypes[type];

// Get widget type definition
export const getWidgetType = (type) => WIDGET_TYPES[type] || customWidgetTypes[type];

// Get page type definition
export const getPageType = (type) => PAGE_TYPES[type];

const VALID_FIELD_TYPES = ['text', 'textarea', 'select', 'checkbox', 'email', 'number', 'date', 'url', 'phone'];
const VALID_WIDGET_TYPES = ['stat', 'chart', 'recent'];
const VALID_PAGE_TYPES = ['table'];

export interface ValidationError {
  field: string;
  message: string;
}

export const validateConfig = (config: any): ValidationError[] => {
  const errors: ValidationError[] = [];

  if (!config || typeof config !== 'object') {
    return [{ field: 'config', message: 'Config must be a valid object' }];
  }

  // Validate settings
  if (config.settings && typeof config.settings !== 'object') {
    errors.push({ field: 'settings', message: 'Settings must be an object' });
  }

  // Validate localization
  if (config.localization && typeof config.localization !== 'object') {
    errors.push({ field: 'localization', message: 'Localization must be an object' });
  }

  // Validate entities
  if (!Array.isArray(config.entities)) {
    errors.push({ field: 'entities', message: 'Entities must be an array' });
  } else {
    config.entities.forEach((entity: any, index: number) => {
      const prefix = `entities[${index}]`;
      if (!entity.name || typeof entity.name !== 'string') {
        errors.push({ field: `${prefix}.name`, message: 'Entity name is required and must be a string' });
      }
      if (!entity.display_name || typeof entity.display_name !== 'string') {
        errors.push({ field: `${prefix}.display_name`, message: 'Entity display_name is required and must be a string' });
      }
      if (!Array.isArray(entity.fields)) {
        errors.push({ field: `${prefix}.fields`, message: 'Entity fields must be an array' });
      } else {
        entity.fields.forEach((field: any, fieldIndex: number) => {
          const fieldPrefix = `${prefix}.fields[${fieldIndex}]`;
          if (!field.name || typeof field.name !== 'string') {
            errors.push({ field: `${fieldPrefix}.name`, message: 'Field name is required and must be a string' });
          }
          if (!field.label || typeof field.label !== 'string') {
            errors.push({ field: `${fieldPrefix}.label`, message: 'Field label is required and must be a string' });
          }
          if (!field.type || !VALID_FIELD_TYPES.includes(field.type)) {
            errors.push({
              field: `${fieldPrefix}.type`,
              message: `Field type must be one of: ${VALID_FIELD_TYPES.join(', ')}`,
            });
          }
          if (field.type === 'select' && !Array.isArray(field.options)) {
            errors.push({ field: `${fieldPrefix}.options`, message: 'Select field must have options array' });
          }
        });
      }
      if (entity.permissions && typeof entity.permissions !== 'object') {
        errors.push({ field: `${prefix}.permissions`, message: 'Entity permissions must be an object' });
      }
    });
  }

  // Validate pages
  if (config.pages && !Array.isArray(config.pages)) {
    errors.push({ field: 'pages', message: 'Pages must be an array' });
  } else if (config.pages) {
    config.pages.forEach((page: any, index: number) => {
      const prefix = `pages[${index}]`;
      if (!page.type || !VALID_PAGE_TYPES.includes(page.type)) {
        errors.push({
          field: `${prefix}.type`,
          message: `Page type must be one of: ${VALID_PAGE_TYPES.join(', ')}`,
        });
      }
      if (!page.entity || typeof page.entity !== 'string') {
        errors.push({ field: `${prefix}.entity`, message: 'Page entity is required and must be a string' });
      }
    });
  }

  // Validate dashboard
  if (config.dashboard && !Array.isArray(config.dashboard)) {
    errors.push({ field: 'dashboard', message: 'Dashboard must be an array' });
  } else if (config.dashboard) {
    config.dashboard.forEach((widget: any, index: number) => {
      const prefix = `dashboard[${index}]`;
      if (!widget.type || !VALID_WIDGET_TYPES.includes(widget.type)) {
        errors.push({
          field: `${prefix}.type`,
          message: `Widget type must be one of: ${VALID_WIDGET_TYPES.join(', ')}`,
        });
      }
      if (!widget.entity || typeof widget.entity !== 'string') {
        errors.push({ field: `${prefix}.entity`, message: 'Widget entity is required and must be a string' });
      }
    });
  }

  return errors;
};

export const detectMigrations = (oldConfig: any, newConfig: any): string[] => {
  const migrations: string[] = [];
  const oldEntities = new Set((oldConfig?.entities || []).map((e: any) => e.name));
  const newEntities = new Set((newConfig?.entities || []).map((e: any) => e.name));

  // Detect removed entities
  oldEntities.forEach((name) => {
    if (!newEntities.has(name)) {
      migrations.push(`Entity '${name}' removed - orphaned records will remain in database`);
    }
  });

  // Detect added entities
  newEntities.forEach((name) => {
    if (!oldEntities.has(name)) {
      migrations.push(`Entity '${name}' added`);
    }
  });

  // Detect field changes
  (newConfig?.entities || []).forEach((newEntity: any) => {
    const oldEntity = (oldConfig?.entities || []).find((e: any) => e.name === newEntity.name);
    if (oldEntity) {
      const oldFields = new Set((oldEntity.fields || []).map((f: any) => f.name));
      const newFields = new Set((newEntity.fields || []).map((f: any) => f.name));

      oldFields.forEach((fieldName) => {
        if (!newFields.has(fieldName)) {
          migrations.push(`Entity '${newEntity.name}': field '${fieldName}' removed - orphaned data remains`);
        }
      });

      newFields.forEach((fieldName) => {
        if (!oldFields.has(fieldName)) {
          migrations.push(`Entity '${newEntity.name}': field '${fieldName}' added`);
        }
      });
    }
  });

  return migrations;
};

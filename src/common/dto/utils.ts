export function isFieldType(model, field, type) {
  const schema = model.schema.paths;
  return schema[field] && schema[field].instance === type;
}

export function getPopulateFields(model, userPopulateFields) {
  const modelSchema = model.schema.paths;
  const allPopulateFields = Object.keys(modelSchema).filter(
    (field) => modelSchema[field].options && modelSchema[field].options.ref
  );
  if (userPopulateFields.includes('all')) {
    return allPopulateFields;
  }
  return userPopulateFields;
}



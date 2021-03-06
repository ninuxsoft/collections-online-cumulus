const config = require('collections-online/lib/config');
const cip = require('../services/cip');

const CROWD_TAGS = '{73be3a90-a8ef-4a42-aa8f-d16ca4f55e0a}';

function saveToCip(catalog, id, values) {
  return cip.setFieldValues(catalog, id, 'web', values)
  .then(function(response) {
    if (response.statusCode !== 200) {
      throw new Error('Failed to set the field values');
    }
  });
}

module.exports.save = (metadata) => {
  // Save it using the CIP
  var values = {};
  values[CROWD_TAGS] = metadata.tags.join(',');
  return saveToCip(metadata.collection, metadata.id, values).then(function() {
    return metadata;
  });
}

module.exports.updateIndex = (metadata) => {
  const es = require('collections-online/lib/services/elasticsearch');
  // TODO: Consider that elasticsearch might not be the only way to update the
  // document index.
  var indexingState = {
    es: es,
    index: config.types.asset.index
  };
  var transformations = [
    require('../indexing/transformations/tag-hierarchy')
  ];
  // The CIP specific indexing code requires a catalog instead of collection
  metadata.catalog = metadata.collection;

  const indexAsset = require('../indexing/processing/asset');
  return indexAsset(indexingState, metadata, transformations);
}

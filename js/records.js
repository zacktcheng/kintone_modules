/**
 * Get specified field values of all records in bulk in the whole app.
 */

const MAX_RECORDS_SEARCH_LIMIT = 500;

const getFieldsOnRecords = (appId, queryCondition, fields, limit, offset) => {
  let query = `order by $id asc limit ${limit} offset ${offset}`;
  if (queryCondition && queryCondition.trim() != '') query = queryCondition + query;
  const body = {
    app: appId,
    query: query,
    fields: fields
  };
  return new Promise((resolve) => {
    kintone.api(kintone.api.url('/k/v1/records', true), 'GET', body, (resp) => {
      resolve(resp.records);
    }, (error) => {
      throw new Error(`Failed to get ${[...fields]} on records from ${offset + 1} to ${offset + limit}.`);
    });
  });
}

const getFieldsOnAllRecords = (appId, queryCondition, fields) => {
  try {
    if (!(appId && appId.indexOf(',') == -1 && /^\+?(0|[1-9]\d*)$/.test(appId))) {
      throw new Error('Invalid input for appId.');
    }
    if (!(queryCondition && typeof queryCondition === 'string')) {
      throw new Error('Invalid input for queryCondition.');
    }
    if (!(fields && fields instanceof Array && fields.length > 0)) {
      throw new Error('Invalid input for fields.');
    }
    return new Promise((resolve) => {
      let offset = 0;
      const fieldsOnAllRecords = [];
      do {
        fieldsOnAllRecords.concat(await getFieldsOnRecords(appId, queryCondition, fields, MAX_RECORDS_SEARCH_LIMIT, offset));
        offset += MAX_RECORDS_SEARCH_LIMIT;
      } while (offset <= 10000); // The maximum offset value that can be specified is 10000.
      resolve(fieldsOnAllRecords);
    });
  } catch (e) {
    throw e;
  }
}
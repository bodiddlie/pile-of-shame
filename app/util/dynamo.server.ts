import aws, { AWSError } from 'aws-sdk';
aws.config.update({ region: 'us-east-1' });
const dynamo = new aws.DynamoDB.DocumentClient();

const TableName = 'pile-of-shame-focus-dev';

export async function getUser(email: string) {
  const params = {
    TableName,
    Key: {
      PK: `USER#${email}`,
      SK: `PROFILE#${email}`,
    },
  };

  try {
    const result = await dynamo.get(params).promise();
    return result.Item;
  } catch (err) {
    console.error(err);
    return null;
  }
}

export async function saveUser(email: string) {
  const timestamp = new Date().toISOString();
  const params = {
    TableName,
    Item: {
      PK: `USER#${email}`,
      SK: `PROFILE#${email}`,
      createdAt: timestamp,
      updatedAt: timestamp,
      isSorted: false,
    },
  };

  await dynamo.put(params).promise();
  return params.Item;
}

export async function saveUserSession(email: string, sessionId: string) {
  const timestamp = new Date().toISOString();
  const params = {
    TableName,
    Item: {
      PK: `USER#${email}`,
      SK: `SESSION#${sessionId}`,
      createdAt: timestamp,
      updatedAt: timestamp,
    },
  };
  await dynamo.put(params).promise();
}

export async function getUserSession(email: string, sessionId: string) {
  const params = {
    TableName,
    Key: {
      PK: `USER#${email}`,
      SK: `SESSION#${sessionId}`,
    },
  };

  try {
    const result = await dynamo.get(params).promise();
    return result.Item;
  } catch (err) {
    console.error(err);
    return null;
  }
}

export async function getPile(email: string) {
  const params = {
    TableName,
    KeyConditionExpression: 'PK = :userId and begins_with(SK, :game)',
    FilterExpression: 'completed = :completed',
    ExpressionAttributeValues: {
      ':userId': `USER#${email}`,
      ':game': 'GAME#',
      ':completed': false,
    },
  };

  try {
    const result = await dynamo.query(params).promise();
    return result.Items;
  } catch (err: any) {
    console.error(`Error while querying for game list: ${err.message}`);
    throw err;
  }
}

export async function removeGame(email: string, id: string) {
  const params = {
    TableName,
    Key: {
      PK: `USER#${email}`,
      SK: `GAME#${id}`,
    },
  };

  try {
    await dynamo.delete(params).promise();
    return;
  } catch (err) {
    console.error(`Failure while deleting game id: ${id}`);
    throw err;
  }
}

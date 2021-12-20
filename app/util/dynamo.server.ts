import aws from 'aws-sdk';
aws.config.update({
  region: 'us-east-1',
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
});
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
      isSorted: 'list',
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

export async function addGame(
  email: string,
  id: string,
  title: string,
  boxArt: string,
  description: string,
) {
  let user = await getUser(email);
  let sortOrder = null;
  if (user && user.isSorted === 'focus') {
    let pile = (await getPile(email)) || [];
    let sorted = pile
      .filter((p) => typeof p.sortOrder === 'number' && p.sortOrder !== 1)
      .sort((first, second) => first.sortOrder - second.sortOrder)
      .reverse();
    if (sorted.length > 0) {
      sortOrder = sorted[0].sortOrder + 1;
    }
  }
  const timestamp = new Date().getTime();

  const params = {
    TableName,
    Item: {
      PK: `USER#${email}`,
      SK: `GAME#${id}`,
      id,
      createdAt: timestamp,
      updatedAt: timestamp,
      title,
      completed: false,
      sortOrder,
      boxArt,
      description,
    },
  };

  try {
    await dynamo.put(params).promise();
    const { PK, SK, createdAt, updatedAt, ...game } = params.Item;
    return game;
  } catch (err: any) {
    console.error(`Failure: ${err.message}`);
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

export async function updateSortOrder(
  email: string,
  id: string,
  sortOrder: string | number | null,
) {
  const params = {
    TableName,
    Key: {
      PK: `USER#${email}`,
      SK: `GAME#${id}`,
    },
    UpdateExpression: 'SET sortOrder = :sortOrder',
    ExpressionAttributeValues: {
      ':sortOrder': sortOrder,
    },
    ReturnValues: 'ALL_NEW',
  };

  try {
    await dynamo.update(params).promise();
    return;
  } catch (err) {
    console.error(`Failure while updating sort order for game id: ${id}`);
    throw err;
  }
}

export async function getNextGameInList(email: string) {
  try {
    const result = (await getPile(email)) || [];
    const sorted = result.sort((a, b) => a.sortOrder - b.sortOrder);
    if (sorted.length > 0) {
      return sorted[0];
    }
  } catch (err: any) {
    console.error(`Error while querying for top game: ${err.message}`);
    throw err;
  }
  return null;
}

export async function completeGame(email: string, id: string) {
  const params = {
    TableName,
    Key: {
      PK: `USER#${email}`,
      SK: `GAME#${id}`,
    },
    UpdateExpression: 'SET completed = :completed',
    ExpressionAttributeValues: {
      ':completed': true,
    },
    ReturnValues: 'ALL_NEW',
  };

  try {
    await dynamo.update(params).promise();
    return;
  } catch (err: any) {
    console.error(`Failure while completing game ${id}: ${err}`);
    throw err;
  }
}

export async function updateProfile(email: string, isSorted: string) {
  const params = {
    TableName,
    Key: {
      PK: `USER#${email}`,
      SK: `PROFILE#${email}`,
    },
    UpdateExpression: 'SET isSorted = :isSorted',
    ExpressionAttributeValues: {
      ':isSorted': isSorted,
    },
  };
  await dynamo.update(params).promise();
}

export async function resetSortOrder(email: string) {
  let pile = (await getPile(email)) || [];

  for (let game of pile) {
    await updateSortOrder(email, game.id, null);
  }
}

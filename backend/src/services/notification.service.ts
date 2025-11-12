import redisClient from '../config/redis';

/**
 * Publish notification to Redis channel
 */
export const publishNotification = async (channel: string, message: any): Promise<void> => {
  try {
    await redisClient.publish(channel, JSON.stringify(message));
  } catch (error) {
    console.error('Failed to publish notification:', error);
  }
};

/**
 * Subscribe to notifications
 */
export const subscribeToNotifications = async (
  channel: string,
  callback: (message: any) => void
): Promise<void> => {
  const subscriber = redisClient.duplicate();
  await subscriber.connect();

  await subscriber.subscribe(channel, (message) => {
    try {
      const parsed = JSON.parse(message);
      callback(parsed);
    } catch (error) {
      console.error('Failed to parse notification:', error);
    }
  });
};

/**
 * Store user session in Redis
 */
export const storeUserSession = async (
  userId: string,
  sessionData: any,
  expiresIn: number = 86400
): Promise<void> => {
  const key = `session:${userId}`;
  await redisClient.setEx(key, expiresIn, JSON.stringify(sessionData));
};

/**
 * Get user session from Redis
 */
export const getUserSession = async (userId: string): Promise<any | null> => {
  const key = `session:${userId}`;
  const data = await redisClient.get(key);
  return data ? JSON.parse(data) : null;
};

/**
 * Delete user session from Redis
 */
export const deleteUserSession = async (userId: string): Promise<void> => {
  const key = `session:${userId}`;
  await redisClient.del(key);
};

/**
 * Store user online status
 */
export const setUserOnlineStatus = async (userId: string, isOnline: boolean): Promise<void> => {
  const key = `online:${userId}`;
  if (isOnline) {
    await redisClient.setEx(key, 300, 'true'); // 5 minutes TTL
  } else {
    await redisClient.del(key);
  }
};

/**
 * Get user online status
 */
export const getUserOnlineStatus = async (userId: string): Promise<boolean> => {
  const key = `online:${userId}`;
  const status = await redisClient.get(key);
  return status === 'true';
};

/**
 * Cache data in Redis
 */
export const cacheData = async (
  key: string,
  data: any,
  expiresIn: number = 3600
): Promise<void> => {
  await redisClient.setEx(key, expiresIn, JSON.stringify(data));
};

/**
 * Get cached data from Redis
 */
export const getCachedData = async (key: string): Promise<any | null> => {
  const data = await redisClient.get(key);
  return data ? JSON.parse(data) : null;
};

/**
 * Delete cached data
 */
export const deleteCachedData = async (key: string): Promise<void> => {
  await redisClient.del(key);
};

/**
 * Clear all cache with pattern
 */
export const clearCachePattern = async (pattern: string): Promise<void> => {
  const keys = await redisClient.keys(pattern);
  if (keys.length > 0) {
    await redisClient.del(keys);
  }
};


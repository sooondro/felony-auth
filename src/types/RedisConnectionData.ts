type RedisConnectionData = {
  socket: {
    host: string,
    port: number,
  },
  password?: string,
};

export default RedisConnectionData;
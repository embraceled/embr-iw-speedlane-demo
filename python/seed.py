#!/usr/bin/env python

import json
import redis
from pprint import pprint

# Setup Redis connection pool
POOL = redis.ConnectionPool(host='127.0.0.1', port=6379, db=0)

redisUsersKey = 'embr:sl:users'
redisScoresKey = 'embr:sl:scores'
r = redis.Redis(connection_pool=POOL)

# truncate current
r.delete(redisUsersKey)
r.delete(redisScoresKey)

with open('./data/users.json') as json_data:
    d = json.load(json_data)
    json_data.close()
    # pprint(d)
    # dump entire json string into redis
    r.set(redisUsersKey, json.dumps(d))

with open('./data/scores.json') as json_data:
    d = json.load(json_data)
    json_data.close()
    for i in d:
        # pprint(i)
        r.zadd(redisScoresKey, json.dumps(i), float(i['time']))

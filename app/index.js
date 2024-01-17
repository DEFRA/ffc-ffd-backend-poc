require('./insights').setup()
const { MessageReceiver } = require('ffc-messaging')
const { Client } = require('pg')
const { createClient } = require('redis')

const saveToRedis = async (message) => {
  const client = await createClient({
    url: 'redis://ffc-ffd-backend-poc-redis'
  })
    .on('error', (err) => console.log(`Redis error: ${err}`))
    .on('reconnecting', () => console.log('Redis reconnecting...'))
    .on('ready', () => console.log('Redis connected'))
    .connect()

  await client.set('key', JSON.stringify(message.body))
  await client.disconnect()
  console.log('Message saved to cache: ', message.body)
}

const saveToPostgres = async (message) => {
  const client = new Client({
    user: process.env.POSTGRES_USERNAME,
    password: process.env.POSTGRES_PASSWORD,
    host: 'ffc-ffd-backend-poc-postgres',
    database: 'ffc_ffd_backend_poc',
    port: 5432
  })

  await client.connect()
  const insertQuery = `INSERT INTO users (name, email) VALUES ('${message.body.name}', '${message.body.email}')`
  await client.query(insertQuery)
  await client.end()
  console.log('Message saved to database: ', message.body)
}

const handleMessage = async (message) => {
  await saveToPostgres(message)
  await saveToRedis(message)
}

const init = async () => {
  const receiver = new MessageReceiver({
    useCredentialChain: false,
    host: process.env.MESSAGE_HOST,
    username: process.env.MESSAGE_USER,
    password: process.env.MESSAGE_PASSWORD,
    address: 'ffc-ffd-backend-poc',
    topic: 'ffc-ffd-data',
    type: 'subscription'
  }, handleMessage)

  await receiver.subscribe()
}

process.on('unhandledRejection', (err) => {
  console.log(err)
  process.exit(1)
})

init()

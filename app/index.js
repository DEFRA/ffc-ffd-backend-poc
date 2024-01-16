require('./insights').setup()
const { MessageReceiver } = require('ffc-messaging')

const handleMessage = async (message) => {
  console.log(message)
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

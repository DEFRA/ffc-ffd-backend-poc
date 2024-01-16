require('./insights').setup()

const init = async () => {
  console.log('hello world')
}

process.on('unhandledRejection', (err) => {
  console.log(err)
  process.exit(1)
})

init()

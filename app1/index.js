const express = require('express')
const kafka = require('kafka-node')
const sequelize = require('sequelize')

const app = express()

app.use(express.json())

const dbsAreRunning = () => {

  const db = new sequelize(process.env.POSTGRES_URL)
  const User = db.define('user', {
    name: sequelize.STRING,
    email: sequelize.STRING,
    password: sequelize.STRING,
  })

  const client = new kafka.KafkaClient({ kafkaHost: process.env.KAFKA_BOOTSTRAP_SERVERS })
  const producer = new kafka.Producer(client)

  producer.on('ready', () => {
    app.post('/', (req, res) => {
      producer.send([{
        topic: process.env.KAFKA_TOPIC,
        messages: JSON.stringify(req.body),
      }], async (err, data) => {
        if (err) console.log(err)
        else {
          await User.create(req.body)
          res.send(req.body)
        }
      })
    })
  })
}

setTimeout(dbsAreRunning, 10_000)

app.listen(process.env.PORT)

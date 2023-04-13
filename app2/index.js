const express = require('express')
const kafka = require('kafka-node')
const mongoose = require('mongoose')

const app = express()

app.use(express.json())

const dbsAreRunning = async () => {

  await mongoose.connect(process.env.MONGO_URL)

  const User = new mongoose.model('user', {
    name: String,
    email: String,
    password: String,
  })

  const client = new kafka.KafkaClient({ kafkaHost: process.env.KAFKA_BOOTSTRAP_SERVERS })
  const consumer = new kafka.Consumer(client, [{
    topic: process.env.KAFKA_TOPIC,
  }], {
    autoCommit: false,
  })

  consumer.on('message' , async (message) => {
    const user = await new User(JSON.parse(message.value))
    await user.save()
  })

  consumer.on('error', (err) => {
    console.log("🚀 ~ file: index.js:32 ~ consumer.on ~ err:", err)
  })
}

setTimeout(dbsAreRunning, 10_000)

app.listen(process.env.PORT)

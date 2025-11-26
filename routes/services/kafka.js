const os = require("os");
const moment = require("moment");
const { Kafka, CompressionTypes, logLevel } = require("kafkajs");
const cluster = require("cluster");

const kafkaConfig = require("../config/kafka-config.json");

const broker = "10.35.73.166:9092";

const producerError = {
    REQUEST_TIMEOUT: "KAFKA PRODUCER REQUEST TIMEOUT",
};
const consumerError = {
    STOP: "KAFKA CONSUMER STOP",
    DISCONNECT: "KAFKA CONSUMER DISCONNECT",
    CRASH: "KAFKA CONSUMER CRASH",
    REQUEST_TIMEOUT: "KAFKA CONSUMER REQUEST TIMEOUT",
};
const consumerEvents = ["CONNECT", "GROUP_JOIN", "REBALANCING"];

const kafka = new Kafka({
    clientId: "admin-api",
    brokers: broker?.split(","),
    connectionTimeout: 60000,
    requestTimeout: 60000,
    retry: { initialRetryTime: 10000, retries: 5 },
    logLevel: logLevel.ERROR,
    // sasl: {
    //     mechanism: "plain", // scram-sha-256 or scram-sha-512
    //     username: "my-username",
    //     password: "my-password",
    // },
});
const admin = kafka.admin();
broker &&
    admin.listTopics().then(async (list) => {
        const topics = [];
        Object.values(kafkaConfig).forEach((config) => {
            if (!list.includes(config.topic))
                topics.push({
                    topic: config.topic,
                });
        });
        await admin.createTopics({
            validateOnly: false,
            waitForLeaders: true,
            timeout: 30000,
            topics,
        });
    });
const producer =
    broker &&
    (() => {
        const producer = kafka.producer({
            allowAutoTopicCreation: true,
            transactionTimeout: 30000,
            maxInFlightRequests: 3, // the maximum number of unacknowledged requests that the Kafka client can have in flight at any given time.
        });

        producer
            .connect()
            .then(() => console.log(`Kafka Producer Connected - ${broker}`))
            .catch(async (error) => {
                console.log(error);
            });
        // producer.disconnect();
        Object.keys(producerError).forEach((type) => {
            producer.on(
                producer.events[type],
                async (doc) => console.log(doc)
            );
        });
        return producer;
    })();

// services/kafka.js → producer function को ऐसे बदलो
exports.producer = async ({ headers = {}, topic = "default-topic", key, value, generateLog = true }) => {
  try {
    console.log("Producing to Kafka:", { topic, key, value: typeof value === "object" ? JSON.stringify(value) : value });

    if (!value) throw new Error("Data not Provided");

    const messages = Array.isArray(value)
      ? value.map((el) => ({
          key: key,                              // key बाहर
          value: JSON.stringify(el),
          headers,
        }))
      : [{
          key: key,                              // key बाहर (सबसे जरूरी)
          value: JSON.stringify(value),
          headers,
        }];

    await producer.send({
      topic,
      messages,
      acks: -1,
      timeout: 30000,
      compression: CompressionTypes.GZIP,
    });

    console.log(`Message produced to topic: ${topic}`);
  } catch (error) {
    console.error("Kafka Producer Error:", error.message);
    if (!generateLog) throw error;
  }
};

// services/kafka.js → सिर्फ यह हिस्सा replace करो

exports.consumer = async ({
  groupId,
  topic,
  callBackFunction,
  returnToLastOffset = false,
}) => {
  const consumer = kafka.consumer({
    groupId,
    sessionTimeout: 30000,
    heartbeatInterval: 3000,
    allowAutoTopicCreation: true,
    retry: { retries: 5 },
  });

  // यहाँ cluster condition हटाओ — हमेशा connect करो!
  try {
    console.log(`Starting Kafka Consumer → Group: ${groupId} | Topic: ${topic}`);
    
    // सीधे consumerConnect call करो (तुम्हारा powerful function)
    await consumerConnect({ 
      consumer, 
      groupId, 
      topic, 
      callBackFunction 
    });

  } catch (error) {
    console.error("Consumer startup failed:", error);
  }
};

function convertBufferObjToJSON(data) {
    if (typeof data == "object") {
        Object.keys(data).map((k) => (data[k] = data[k].toString()));
        return data;
    }
    return data.toString();
}

const returnToOffset = async ({ returnToLastOffset, topic, consumer, groupId }) => {
    try {
        let lastOffset = null;
        if (returnToLastOffset) {
            lastOffset = await admin.fetchOffsets({ groupId, topics: [topic] });
            lastOffset = lastOffset.find((el) => el.topic === topic).partitions[0].offset - 1;
        }
        if (lastOffset && returnToLastOffset) {
            consumer.seek({
                topic,
                partition: 0,
                offset: lastOffset,
            });
        }
    } catch (error) {
        console.log(error);
    }
};
const consumerConnect = async ({ consumer, groupId, topic, callBackFunction }) => {
    try {
        await consumer.connect();
        console.log(`Kafka Consumer Connected - ${broker} - ${groupId} - ${topic}`);
        await consumer.subscribe({ topic, fromBeginning: true });
        await consumer.run({
            eachBatchAutoResolve: true,
            // autoCommitInterval: 5000,
            // autoCommitThreshold: 100,
            // partitionsConsumedConcurrently: 3
            eachBatch: async ({ batch, heartbeat, resolveOffset }) => {
                try {
                    console.log("=======>>>>>", batch.messages.length);
                    const setHeartBeat = setInterval(async () => {
                        console.log(" Kafka Heart Beat");
                        await heartbeat();
                    }, 1000);
                    await Promise.all(
                        batch.messages.map((message) => {
                            heartbeat();
                            message.headers = convertBufferObjToJSON(message.headers);
                            return callBackFunction({
                                topic,
                                headers: message.headers,
                                key: message.key.toString(),
                                value: JSON.parse(message.value),
                            });
                        })
                    );
                    if (setHeartBeat) {
                        console.log("Destroy Kafka Heart Beat");
                        clearInterval(setHeartBeat);
                    }
                    // await resolveOffset(batch.lastOffset());
                } catch (e) {
                    if (e.message.includes("TooManyRequest")) {
                        console.log("TooManyRequest");
                        consumer.pause([{ topic }]);
                        setTimeout(() => consumer.resume([{ topic }]), e.retryAfter * 10000);
                    }
                    throw e;
                }
            },
        });
    } catch (error) {
        if (error.name === "KafkaJSNumberOfRetriesExceeded" || error.message.includes("connect ECONNREFUSED")) {
            try {
                await consumer.disconnect();
            } finally {
                setTimeout(async () => {
                    await consumerConnect({ consumer, groupId, topic, callBackFunction });
                }, 900000);
            }
        }
        await createErrorlog("Consumer", error.message, error.stack);
        console.log(`🚀 --------------------------------------------------------🚀`);
        console.log(`🚀 ~ file: index.js:275 ~ kafka createErrorlog ~ error:`, error);
        console.log(`🚀 --------------------------------------------------------🚀`);
    }
};

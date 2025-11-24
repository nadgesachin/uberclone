const os = require("os");
const moment = require("moment");
const { Kafka, CompressionTypes, logLevel } = require("kafkajs");
const cluster = require("cluster");

const kafkaConfig = require("../config/kafka-config.json");

const broker = "10.111.80.166:9092";

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

exports.producer = async ({ headers = {}, topic = "default-topic", key, value, generateLog = true }) => {
    try {
        if (!value) {
            throw new Error("Data not Provided");
        }
        if (!broker) {
            throw new Error("Kafka Broker not provided");
        }
        let messages = Array.isArray(value)
            ? value.map((el) => ({ headers, key, value: JSON.stringify(el) }))
            : [{ headers, key, value: JSON.stringify(value) }];
        await producer.connect();
        await producer.send({
            topic,
            messages,
            acks: -1,
            timeout: 30000,
            retry: { initialRetryTime: 1000, retries: 3 },
            compression: CompressionTypes.GZIP,
        });
        // await producer.disconnect();
    } catch (error) {
        if (generateLog) {
            console.log(error);
        } else {
            throw error;
        }
    }
};

exports.consumer = async ({
    groupId,
    topic = "default-topic",
    minBytes = 1048,
    maxBytes = 10000,
    callBackFunction,
    returnToLastOffset = false,
}) => {
    const consumer = kafka.consumer({
        groupId,
        sessionTimeout: 30000,
        heartbeatInterval: 1000,
        allowAutoTopicCreation: true,
        retry: { retries: 3 },
        maxInFlightRequests: 5,
        minBytes,
        maxBytes,
        // rebalanceTimeout: 60000, // In case of multiple consumer in group present It is max time tp rejoin the
        // maxBytesPerPartition:1048576
    });
    try {
        if (cluster.worker?.id == 1) {
            //Events to return to last offset
            consumerEvents.forEach((el) => {
                consumer.on(consumer.events[el], async () => {
                    await returnToOffset({ returnToLastOffset, topic, consumer, groupId });
                });
            });
            Object.keys(consumerError).forEach((type) => {
                consumer.on(consumer.events[type], async (doc) => {
                    if (type.toString() == "CRASH") {
                        try {
                            await consumer.disconnect();
                        } finally {
                            setTimeout(async () => {
                                await consumerConnect({ consumer, groupId, topic, callBackFunction });
                            }, 900000);
                        }
                    }
                    console.log(doc);
                });
            });
            await consumerConnect({ consumer, groupId, topic, callBackFunction });
        }
    } catch (error) {
        console.log(`🚀 --------------------------------------------------🚀`);
        console.log(`🚀 ~ file: kafka.js:127 ~ consumer ~ error:`, error);
        console.log(`🚀 --------------------------------------------------🚀`);
        console.log(error);
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

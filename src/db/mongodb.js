"use strict";
exports.__esModule = true;
var env = require("env-var");
var mongodb_1 = require("mongodb");
var uri = env.get('MONGODB_URI').required().asString(); // your mongodb connection string
var options = {
    // useNewUrlParser: true,
    useNewUrlParser: true,
    useUnifiedTopology: true,
    serverApi: mongodb_1.ServerApiVersion.v1
};
var client;
var clientPromise;
if (env.get('NODE_ENV').asString() === 'development') {
    // In development mode, use a global variable so that the value
    // is preserved across module reloads caused by HMR (Hot Module Replacement).
    if (!global._mongoClientPromise) {
        client = new mongodb_1.MongoClient(uri, options);
        global._mongoClientPromise = client.connect();
    }
    clientPromise = global._mongoClientPromise;
}
else {
    // In production mode, it's best to not use a global variable.
    client = new mongodb_1.MongoClient(uri, options);
    clientPromise = client.connect();
}
// Export a module-scoped MongoClient promise. By doing this in a
// separate module, the client can be shared across functions.
exports["default"] = clientPromise;

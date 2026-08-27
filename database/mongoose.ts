import mongoose from "mongoose";
import dns from 'node:dns';
dns.setServers(['8.8.8.8', '1.1.1.1']);

const MONGODB_URI = process.env.MONGODB_URI;

if(!MONGODB_URI) throw new Error('Please define the MONGODB_URI environment variable');

declare global{
    var mongooseCache:{
        conn:typeof mongoose|null
        promise: Promise<typeof mongoose>| null
    }
}

let cached = global.mongooseCache || (global.mongooseCache = {conn:null, promise:null});

export const connectToDatabase = async () => {
    if(cached.conn) return cached.conn; //check if we have a connection, if so return it

    // if we don't have a connection, create a new one
    if(!cached.promise){
        cached.promise = mongoose.connect(MONGODB_URI,{
           bufferCommands: false // allow mongoodb not to queue commands if the connection is slow
        });
    }
        try{
            cached.conn = await cached.promise;
        }catch(err){
            cached.promise = null;
            console.error('Error connecting to database', err);
            throw err;
        }

        console.log('Connected to database');
        return cached.conn;
    
}
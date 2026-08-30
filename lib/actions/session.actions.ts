'use server';

import { StartSessionResult, EndSessionResult } from "@/types";
import { connectToDatabase } from "@/database/mongoose";
import  VoiceSession  from "@/database/models/voice-session.model";
import { getCurrentBillingPeriodStart } from "@/lib/subscription-constants";

export const startVoiceSession = async (clerkId:string,bookId:string) : Promise<StartSessionResult> => {
    try{
        await connectToDatabase();
        
        const session = await VoiceSession.create({
            clerkId,
            bookId,
            startedAt: new Date(),
            billingPeriodStart: getCurrentBillingPeriodStart(),
            durationSeconds: 0,
        });
        
        return {success:true,sessionId:session._id.toString()}; 
    }
    catch(err){
        console.error("Error starting voice session:", err);
        return {success:false,error:"An error occurred while starting the voice session."};
    }
}

export const endVoiceSession = async (sessionId:string,durationSeconds:number) : Promise<EndSessionResult> => {
    try{
        await connectToDatabase();
        const result= await VoiceSession.findByIdAndUpdate(sessionId,{
            endedAt: new Date(),
            durationSeconds,
        });

        if(!result){
            return {success:false,error:"Voice session not found."};
        }
        
        return {success:true};
    }
    catch(err){
        console.error("Error ending voice session:", err);
        return {success:false,error:"Failed to end the voice session. Please try again later."};
    }
}
"use server";

import { CreateBook, TextSegment } from '@/types';
import {connectToDatabase} from "@/database/mongoose";
import {escapeRegex, generateSlug, serializeData} from "@/lib/utils";
import Book from "@/database/models/book.model";
import BookSegment from "@/database/models/book-segment.model";

//server actions/functions (which means they are going to be run on server) for book management

export const getAllBooks = async (search?: string) => {
    try {
        await connectToDatabase();

        const books = await Book.find().sort({ createdAt: -1 }).lean();

        return {
            success: true,
            data: serializeData(books)
        }
    } catch (e) {
        console.error('Error connecting to database', e);
        return {
            success: false, error: e
        }
    }
}

export const checkBookExists = async (title: string) => {
    try{
        await connectToDatabase();
        const slug = generateSlug(title);
        const existingBook = await Book.findOne({slug}).lean();
        if(existingBook){
            return {success:true, 
                book: serializeData(existingBook),
                exists:true,
            }
        }
        return {
            exists:false,
        }
    }
    catch(err){
        console.error('Error checking book existence', err);
        return {success:false, error:err}
    }
}

export const createBook = async (data: CreateBook) => {
   
    try{
        await connectToDatabase();

        const slug =generateSlug(data.title);
        const existingBook = await Book.findOne({slug});

        if(existingBook){
            return {success:true, 
                data: serializeData(existingBook),
                alreadyExists:true,
            }
        }

        const { auth } = await import("@clerk/nextjs/server");
        const { userId } = await auth();

        if (!userId || userId !== data.clerkId) {
            return { success: false, error: "Unauthorized" };
        }

        //Todo: Check subscription and limits before creating a book

         const book =await Book.create({ ...data,clerkId: userId, slug});
         return {success:true, data: serializeData(book),}


    }catch(err){
        console.error('Error creating a book', err);

        return {success:false, error:err}
    }
}

export const saveBookSegments = async (bookId: string, clerkId:string,segments: TextSegment[]) => {
    try{
        await connectToDatabase();
        console.log('Saving book sengments ...');

        const segmentsToInsert = segments.map(({text, segmentIndex, pageNumber, wordCount}) => ({
            clerkId, bookId, content: text, segmentIndex, pageNumber, wordCount
        }));

        await BookSegment.insertMany(segmentsToInsert);
        await Book.findByIdAndUpdate(bookId, {totalSegments: segments.length});

        console.log('Book segments saved successfully');

        return {
            success:true,
            data: {
                segmentCreated:segments.length
            }
        }

    }catch(err){
        console.error('Error saving book segments', err);
        await BookSegment.deleteMany({bookId});
        await Book.findByIdAndDelete(bookId);
        console.log('Deleted book segments and book due to failure in saving segments');
        return {success:false, error:err}
    }

}
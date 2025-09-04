// MongoDB initialization script for FLEARN
// This script runs automatically when MongoDB container starts for the first time

// Switch to the flearn database
db = db.getSiblingDB('flearn_mongo_db');

// Create collections and insert sample data
db.createCollection('courses');
db.createCollection('lessons');
db.createCollection('user_progress');

// Insert sample courses
db.courses.insertMany([
    {
        _id: ObjectId(),
        title: "Introduction to JavaScript",
        description: "Learn the basics of JavaScript programming",
        instructor: "instructor1",
        category: "programming",
        level: "beginner",
        duration: 120, // minutes
        lessons: [],
        createdAt: new Date(),
        updatedAt: new Date()
    },
    {
        _id: ObjectId(),
        title: "Advanced Node.js",
        description: "Deep dive into Node.js backend development",
        instructor: "instructor1",
        category: "programming",
        level: "advanced",
        duration: 300,
        lessons: [],
        createdAt: new Date(),
        updatedAt: new Date()
    }
]);

// Insert sample lessons
db.lessons.insertMany([
    {
        _id: ObjectId(),
        courseId: db.courses.findOne({title: "Introduction to JavaScript"})._id,
        title: "Variables and Data Types",
        content: "Learn about JavaScript variables and data types",
        order: 1,
        duration: 15,
        type: "video",
        createdAt: new Date()
    },
    {
        _id: ObjectId(),
        courseId: db.courses.findOne({title: "Introduction to JavaScript"})._id,
        title: "Functions and Scope",
        content: "Understanding JavaScript functions and scope",
        order: 2,
        duration: 20,
        type: "video",
        createdAt: new Date()
    }
]);

// Create indexes for better performance
db.courses.createIndex({ "instructor": 1 });
db.courses.createIndex({ "category": 1 });
db.courses.createIndex({ "level": 1 });
db.lessons.createIndex({ "courseId": 1 });
db.lessons.createIndex({ "order": 1 });
db.user_progress.createIndex({ "userId": 1, "courseId": 1 });

print("MongoDB initialization completed for FLEARN database");

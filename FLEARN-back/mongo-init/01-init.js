// MongoDB initialization script for FLEARN
// This script runs automatically when MongoDB container starts for the first time

// Switch to the flearn database (matches MONGO_INITDB_DATABASE in .env)
db = db.getSiblingDB('flearn_db');

// Create collections and insert sample data
db.createCollection('courses');
db.createCollection('lessons');
db.createCollection('user_progress');

// Create question_contents collection with validation
db.createCollection('question_contents', {
    validator: {
        $jsonSchema: {
            bsonType: "object",
            required: ["question_type", "question_text"],
            properties: {
                question_type: {
                    enum: ["multiple_choice", "true_false", "multi_select", "essay", "fill_blank", "matching"],
                    description: "must be a valid question type"
                },
                question_text: {
                    bsonType: "string",
                    description: "must be a string and is required"
                }
            }
        }
    }
});

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

// Insert sample questions with different types
db.question_contents.insertMany([
    // 1. MULTIPLE CHOICE - Biology
    {
        question_type: "multiple_choice",
        question_text: "What is the powerhouse of the cell?",
        question_html: "<p>What is the <strong>powerhouse</strong> of the cell?</p>",
        options: [
            { id: "a", text: "Nucleus", is_correct: false },
            { id: "b", text: "Mitochondria", is_correct: true },
            { id: "c", text: "Ribosome", is_correct: false },
            { id: "d", text: "Chloroplast", is_correct: false }
        ],
        explanation: "The mitochondria is the powerhouse of the cell, responsible for ATP production through cellular respiration.",
        media: [],
        subject_data: {
            biology: { topic: "cell_biology", subtopic: "organelles" }
        },
        created_at: new Date(),
        updated_at: new Date()
    },

    // 2. MULTIPLE CHOICE with 6 options - Physics
    {
        question_type: "multiple_choice",
        question_text: "Which planet is known as the Red Planet?",
        question_html: "<p>Which planet is known as the <em>Red Planet</em>?</p>",
        options: [
            { id: "a", text: "Venus", is_correct: false },
            { id: "b", text: "Mars", is_correct: true },
            { id: "c", text: "Jupiter", is_correct: false },
            { id: "d", text: "Saturn", is_correct: false },
            { id: "e", text: "Mercury", is_correct: false },
            { id: "f", text: "Neptune", is_correct: false }
        ],
        explanation: "Mars is called the Red Planet due to iron oxide (rust) on its surface, giving it a reddish appearance.",
        media: [],
        subject_data: {
            physics: { topic: "astronomy", subtopic: "planets" }
        },
        created_at: new Date(),
        updated_at: new Date()
    },

    // 3. TRUE/FALSE - Chemistry
    {
        question_type: "true_false",
        question_text: "Water boils at 100°C at sea level.",
        options: [
            { id: "true", text: "True", is_correct: true },
            { id: "false", text: "False", is_correct: false }
        ],
        explanation: "At standard atmospheric pressure (sea level), water boils at exactly 100°C or 212°F.",
        media: [],
        subject_data: {
            chemistry: { topic: "states_of_matter", subtopic: "phase_changes" }
        },
        created_at: new Date(),
        updated_at: new Date()
    },

    // 4. MULTI-SELECT - Mathematics
    {
        question_type: "multi_select",
        question_text: "Which of the following are prime numbers? (Select all that apply)",
        options: [
            { id: "a", text: "2", is_correct: true },
            { id: "b", text: "4", is_correct: false },
            { id: "c", text: "7", is_correct: true },
            { id: "d", text: "9", is_correct: false },
            { id: "e", text: "11", is_correct: true },
            { id: "f", text: "15", is_correct: false }
        ],
        correct_count: 3,
        partial_credit: true,
        explanation: "Prime numbers are natural numbers greater than 1 that have no positive divisors other than 1 and themselves. 2, 7, and 11 are prime numbers.",
        media: [],
        subject_data: {
            math: { topic: "number_theory", subtopic: "prime_numbers" }
        },
        created_at: new Date(),
        updated_at: new Date()
    },

    // 5. FILL IN THE BLANK - Biology
    {
        question_type: "fill_blank",
        question_text: "The formula for photosynthesis is: 6CO₂ + 6H₂O + light → _____ + 6O₂",
        blanks: [
            {
                id: 1,
                position: 0,
                correct_answers: ["C6H12O6", "glucose", "C₆H₁₂O₆"],
                case_sensitive: false
            }
        ],
        explanation: "Photosynthesis produces glucose (C₆H₁₂O₆) and oxygen from carbon dioxide and water using light energy.",
        media: [],
        subject_data: {
            biology: { topic: "photosynthesis", subtopic: "light_reactions" }
        },
        created_at: new Date(),
        updated_at: new Date()
    },

    // 6. ESSAY - Physics
    {
        question_type: "essay",
        question_text: "Explain Newton's First Law of Motion and provide a real-world example.",
        word_limit: { min: 50, max: 200 },
        grading_rubric: [
            { criterion: "Definition", points: 3 },
            { criterion: "Example", points: 4 },
            { criterion: "Clarity", points: 3 }
        ],
        sample_answer: "Newton's First Law states that an object at rest stays at rest and an object in motion stays in motion with the same speed and direction unless acted upon by an unbalanced force. For example, a hockey puck sliding on ice continues moving until friction and air resistance slow it down.",
        keywords: ["inertia", "motion", "force", "rest"],
        requires_manual_grading: true,
        media: [],
        subject_data: {
            physics: { topic: "mechanics", subtopic: "newtons_laws" }
        },
        created_at: new Date(),
        updated_at: new Date()
    },

    // 7. MATCHING - Chemistry
    {
        question_type: "matching",
        question_text: "Match the chemical elements with their symbols:",
        left_items: [
            { id: "1", text: "Gold" },
            { id: "2", text: "Silver" },
            { id: "3", text: "Iron" },
            { id: "4", text: "Copper" }
        ],
        right_items: [
            { id: "a", text: "Fe" },
            { id: "b", text: "Au" },
            { id: "c", text: "Ag" },
            { id: "d", text: "Cu" }
        ],
        correct_matches: [
            { left: "1", right: "b" },
            { left: "2", right: "c" },
            { left: "3", right: "a" },
            { left: "4", right: "d" }
        ],
        explanation: "Gold (Au), Silver (Ag), Iron (Fe), and Copper (Cu) are their respective chemical symbols from the periodic table.",
        media: [],
        subject_data: {
            chemistry: { topic: "periodic_table", subtopic: "elements" }
        },
        created_at: new Date(),
        updated_at: new Date()
    }
]);

// Create indexes for better performance
db.courses.createIndex({ "instructor": 1 });
db.courses.createIndex({ "category": 1 });
db.courses.createIndex({ "level": 1 });
db.lessons.createIndex({ "courseId": 1 });
db.lessons.createIndex({ "order": 1 });
db.user_progress.createIndex({ "userId": 1, "courseId": 1 });

// Question content indexes
db.question_contents.createIndex({ "question_type": 1 });
db.question_contents.createIndex({ "created_at": -1 });

print("MongoDB initialization completed for FLEARN database");
print("Created collections: courses, lessons, user_progress, question_contents");
print("Inserted sample questions: " + db.question_contents.countDocuments() + " questions");


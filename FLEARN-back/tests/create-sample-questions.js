/**
 * Script to create sample questions from MongoDB content
 * Links MongoDB question_contents with PostgreSQL question metadata
 */

const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });

const mongoose = require('mongoose');
const { Pool } = require('pg');

// PostgreSQL connection pool with explicit configuration
const pgPool = new Pool({
    user: process.env.POSTGRES_USER,
    host: process.env.POSTGRES_HOST || 'localhost',
    database: process.env.POSTGRES_DB,
    password: process.env.POSTGRES_PASSWORD,
    port: process.env.POSTGRES_PORT || 5432,
});

// Database connections
const mongoUrl = process.env.MONGO_URL || 'mongodb://admin:Ispbanana_22@localhost:27017/flearn_db?authSource=admin';

// Map MongoDB subject names to PostgreSQL subject IDs
const subjectMap = {
    'biology': 3,
    'chemistry': 4,
    'math': 1,
    'physics': 2
};

// Map MongoDB question types to PostgreSQL type IDs
const typeMap = {
    'essay': 1,
    'fill_blank': 2,
    'matching': 3,
    'multiple_choice': 4,
    'multi_select': 5,
    'true_false': 6
};

async function createSampleQuestions() {
    try {
        console.log('🔄 Connecting to databases...');
        
        // Connect to MongoDB
        await mongoose.connect(mongoUrl);
        const mongoDb = mongoose.connection.db;
        console.log('✅ Connected to MongoDB');

        // Connect to PostgreSQL
        const pgClient = await pgPool.connect();
        console.log('✅ Connected to PostgreSQL');

        // Get all MongoDB questions
        const mongoQuestions = await mongoDb.collection('question_contents').find({}).toArray();
        console.log(`📊 Found ${mongoQuestions.length} questions in MongoDB`);

        let created = 0;
        let skipped = 0;

        for (const mongoQuestion of mongoQuestions) {
            const questionType = mongoQuestion.question_type;
            const mongoId = mongoQuestion._id.toString();

            // Determine subject_id from subject_data
            let subjectId = 1; // Default to Mathematics
            if (mongoQuestion.subject_data) {
                const subjectKey = Object.keys(mongoQuestion.subject_data)[0];
                subjectId = subjectMap[subjectKey] || 1;
            }

            // Get type_id
            const typeId = typeMap[questionType];
            if (!typeId) {
                console.log(`⚠️  Unknown question type: ${questionType}, skipping...`);
                skipped++;
                continue;
            }

            // Check if question already exists
            const existingCheck = await pgClient.query(
                'SELECT question_id FROM question WHERE mongo_content_id = $1',
                [mongoId]
            );

            if (existingCheck.rows.length > 0) {
                console.log(`⏭️  Question already exists for MongoDB ID: ${mongoId}`);
                skipped++;
                continue;
            }

            // Determine base points based on question type
            const basePoints = {
                'true_false': 10,
                'multiple_choice': 15,
                'multi_select': 20,
                'fill_blank': 15,
                'essay': 30,
                'matching': 25
            };

            const points = basePoints[questionType] || 15;
            const timeLimit = questionType === 'essay' ? 600 : 120; // 10 mins for essay, 2 mins for others
            const difficulty = 3; // Default to medium difficulty (1-5 scale)

            // Insert into PostgreSQL
            const insertQuery = `
                INSERT INTO question (
                    subject_id, 
                    type_id, 
                    difficulty, 
                    points, 
                    time_limit, 
                    mongo_content_id,
                    is_active
                ) VALUES ($1, $2, $3, $4, $5, $6, $7)
                RETURNING question_id
            `;

            const result = await pgClient.query(insertQuery, [
                subjectId,
                typeId,
                difficulty,
                points,
                timeLimit,
                mongoId,
                true
            ]);

            const questionId = result.rows[0].question_id;
            console.log(`✅ Created question ${questionId}: "${mongoQuestion.question_text.substring(0, 50)}..."`);
            created++;
        }

        pgClient.release();

        console.log('\n==============================================');
        console.log('  Sample Questions Creation Summary');
        console.log('==============================================');
        console.log(`✅ Created: ${created}`);
        console.log(`⏭️  Skipped: ${skipped}`);
        console.log(`📊 Total: ${mongoQuestions.length}`);
        console.log('==============================================\n');

    } catch (error) {
        console.error('❌ Error:', error.message);
        console.error(error);
        process.exit(1);
    } finally {
        await mongoose.connection.close();
        await pgPool.end();
    }
}

// Run the script
createSampleQuestions()
    .then(() => {
        console.log('✅ Script completed successfully');
        process.exit(0);
    })
    .catch((error) => {
        console.error('❌ Script failed:', error);
        process.exit(1);
    });

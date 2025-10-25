#!/usr/bin/env node

/**
 * FLEARN Questions API Test Script
 * 
 * This script tests all the question API endpoints
 * Run: node test-questions-api.js
 * 
 * Make sure the backend is running first:
 * docker-compose up -d
 */

const http = require('http');

const BASE_URL = 'localhost';
const PORT = 8099;

// ANSI color codes for pretty output
const colors = {
    reset: '\x1b[0m',
    green: '\x1b[32m',
    red: '\x1b[31m',
    yellow: '\x1b[33m',
    blue: '\x1b[36m',
    bold: '\x1b[1m'
};

function makeRequest(method, path, data = null) {
    return new Promise((resolve, reject) => {
        const options = {
            hostname: BASE_URL,
            port: PORT,
            path: path,
            method: method,
            headers: {
                'Content-Type': 'application/json'
            }
        };

        if (data) {
            const jsonData = JSON.stringify(data);
            options.headers['Content-Length'] = Buffer.byteLength(jsonData);
        }

        const req = http.request(options, (res) => {
            let body = '';
            res.on('data', (chunk) => body += chunk);
            res.on('end', () => {
                try {
                    const response = JSON.parse(body);
                    resolve({ statusCode: res.statusCode, data: response });
                } catch (e) {
                    resolve({ statusCode: res.statusCode, data: body });
                }
            });
        });

        req.on('error', reject);

        if (data) {
            req.write(JSON.stringify(data));
        }

        req.end();
    });
}

function log(message, color = 'reset') {
    console.log(`${colors[color]}${message}${colors.reset}`);
}

function logTest(testName) {
    console.log(`\n${colors.blue}${colors.bold}▶ ${testName}${colors.reset}`);
}

function logSuccess(message) {
    log(`  ✓ ${message}`, 'green');
}

function logError(message) {
    log(`  ✗ ${message}`, 'red');
}

function logInfo(message) {
    log(`  ℹ ${message}`, 'yellow');
}

async function runTests() {
    log('\n==============================================', 'bold');
    log('  FLEARN Questions API Test Suite', 'bold');
    log('==============================================\n', 'bold');

    let passedTests = 0;
    let failedTests = 0;

    try {
        // Test 1: Health Check
        logTest('Test 1: Health Check');
        const health = await makeRequest('GET', '/health');
        if (health.statusCode === 200) {
            logSuccess('Server is running');
            passedTests++;
        } else {
            logError('Server is not responding correctly');
            failedTests++;
        }

        // Test 2: Get All Subjects
        logTest('Test 2: Get All Subjects');
        const subjects = await makeRequest('GET', '/api/questions/subjects');
        if (subjects.statusCode === 200 && subjects.data.success && subjects.data.data.length > 0) {
            logSuccess(`Retrieved ${subjects.data.data.length} subjects`);
            subjects.data.data.forEach(s => logInfo(`  - ${s.name} (ID: ${s.subject_id})`));
            passedTests++;
        } else {
            logError('Failed to retrieve subjects');
            failedTests++;
        }

        // Test 3: Get All Question Types
        logTest('Test 3: Get All Question Types');
        const types = await makeRequest('GET', '/api/questions/types');
        if (types.statusCode === 200 && types.data.success && types.data.data.length > 0) {
            logSuccess(`Retrieved ${types.data.data.length} question types`);
            types.data.data.forEach(t => logInfo(`  - ${t.type_name}: ${t.description}`));
            passedTests++;
        } else {
            logError('Failed to retrieve question types');
            failedTests++;
        }

        // Test 4: Get All Questions
        logTest('Test 4: Get All Questions');
        const questions = await makeRequest('GET', '/api/questions');
        if (questions.statusCode === 200 && questions.data.success) {
            logSuccess(`Retrieved ${questions.data.count} questions`);
            passedTests++;
        } else {
            logError('Failed to retrieve questions');
            failedTests++;
        }

        // Test 5: Get Questions with Filters
        logTest('Test 5: Get Questions with Filters (subject_id=1, limit=3)');
        const filtered = await makeRequest('GET', '/api/questions?subject_id=1&limit=3');
        if (filtered.statusCode === 200 && filtered.data.success) {
            logSuccess(`Retrieved ${filtered.data.count} filtered questions`);
            passedTests++;
        } else {
            logError('Failed to retrieve filtered questions');
            failedTests++;
        }

        // Test 6: Get Questions by Type
        logTest('Test 6: Get Questions by Type (multiple_choice)');
        const byType = await makeRequest('GET', '/api/questions?type=multiple_choice');
        if (byType.statusCode === 200 && byType.data.success) {
            logSuccess(`Retrieved ${byType.data.count} multiple choice questions`);
            passedTests++;
        } else {
            logError('Failed to retrieve questions by type');
            failedTests++;
        }

        // Get a question ID for validation tests
        let testQuestionId = null;
        if (questions.data.data && questions.data.data.length > 0) {
            testQuestionId = questions.data.data[0].question_id;
        }

        if (testQuestionId) {
            // Test 7: Get Single Question
            logTest('Test 7: Get Single Question');
            const singleQ = await makeRequest('GET', `/api/questions/${testQuestionId}`);
            if (singleQ.statusCode === 200 && singleQ.data.success) {
                logSuccess(`Retrieved question: "${singleQ.data.data.question_text}"`);
                logInfo(`Type: ${singleQ.data.data.type}`);
                logInfo(`Subject: ${singleQ.data.data.subject}`);
                logInfo(`Difficulty: ${singleQ.data.data.difficulty}/5`);
                logInfo(`Points: ${singleQ.data.data.points}`);
                
                // Check if correct answers are sanitized
                if (singleQ.data.data.options) {
                    const hasCorrectFlag = singleQ.data.data.options.some(opt => 'is_correct' in opt);
                    if (!hasCorrectFlag) {
                        logSuccess('Correct answers properly sanitized (not exposed)');
                    } else {
                        logError('WARNING: Correct answers are exposed!');
                    }
                }
                passedTests++;
            } else {
                logError('Failed to retrieve single question');
                failedTests++;
            }

            // Test 8: Validate Answer (will vary based on question type)
            logTest('Test 8: Validate Answer');
            const validationData = {
                answer: "test_answer",
                time_taken: 30
            };
            const validation = await makeRequest('POST', `/api/questions/${testQuestionId}/validate`, validationData);
            if (validation.statusCode === 200 && validation.data.success) {
                logSuccess('Answer validation endpoint working');
                logInfo(`Result: ${validation.data.data.isCorrect ? 'Correct' : 'Incorrect'}`);
                logInfo(`Points earned: ${validation.data.data.pointsEarned}/${validation.data.data.pointsPossible}`);
                if (validation.data.data.timeBonus) {
                    logInfo(`Time bonus: +${validation.data.data.timeBonus} points`);
                }
                passedTests++;
            } else {
                logError('Failed to validate answer');
                failedTests++;
            }
        } else {
            logInfo('Skipping single question tests - no questions found');
        }

        // Test 9: Get Non-existent Question (Should return 404)
        logTest('Test 9: Get Non-existent Question (Error Handling)');
        const notFound = await makeRequest('GET', '/api/questions/00000000-0000-0000-0000-000000000000');
        if (notFound.statusCode === 404) {
            logSuccess('Correctly returns 404 for non-existent question');
            passedTests++;
        } else {
            logError('Should return 404 for non-existent question');
            failedTests++;
        }

        // Test 10: Validate Answer without Required Field (Should fail)
        logTest('Test 10: Validate Answer without Answer Field (Error Handling)');
        if (testQuestionId) {
            const badValidation = await makeRequest('POST', `/api/questions/${testQuestionId}/validate`, { time_taken: 30 });
            if (badValidation.statusCode === 400) {
                logSuccess('Correctly validates required fields');
                passedTests++;
            } else {
                logError('Should return 400 for missing answer field');
                failedTests++;
            }
        } else {
            logInfo('Skipping - no test question available');
        }

    } catch (error) {
        logError(`Test suite failed with error: ${error.message}`);
        console.error(error);
    }

    // Summary
    log('\n==============================================', 'bold');
    log('  Test Summary', 'bold');
    log('==============================================', 'bold');
    logSuccess(`Passed: ${passedTests}`);
    if (failedTests > 0) {
        logError(`Failed: ${failedTests}`);
    }
    log(`Total: ${passedTests + failedTests}`, 'bold');
    
    const percentage = Math.round((passedTests / (passedTests + failedTests)) * 100);
    if (percentage === 100) {
        log(`\n🎉 All tests passed! (${percentage}%)`, 'green');
    } else if (percentage >= 80) {
        log(`\n✓ Most tests passed (${percentage}%)`, 'yellow');
    } else {
        log(`\n✗ Many tests failed (${percentage}%)`, 'red');
    }
    
    log('==============================================\n', 'bold');
}

// Run the tests
log(`\nTesting API at ${BASE_URL}:${PORT}...`, 'blue');
runTests().catch(error => {
    logError(`\nFatal error running tests: ${error.message}`);
    console.error(error);
    process.exit(1);
});

const { ipcRenderer } = require('electron');
const AIGrader = require('./ai/grader');
const FeedbackGenerator = require('./ai/feedback');

const grader = new AIGrader();
const feedbackGen = new FeedbackGenerator();

function processFile() {
    const fileInput = document.getElementById('assignmentFile');
    const file = fileInput.files[0];
    if (!file) {
        alert('Please select a file to submit!');
        return;
    }

    ipcRenderer.send('process-file', file.path);
}

ipcRenderer.on('file-processed', (event, text) => {
    document.getElementById('assignmentInput').value = text;
});

ipcRenderer.on('file-error', (event, error) => {
    alert(`Error processing file: ${error}`);
});

function gradeAssignment() {
    const text = document.getElementById('assignmentInput').value;
    if (!text) {
        alert('Please submit a file first!');
        return;
    }

    // Automated Grading
    const score = grader.evaluateAssignment(text);
    document.getElementById('gradeOutput').innerHTML = `<strong>Score:</strong> ${score.toFixed(1)}/100`;

    // Personalized Feedback
    const feedback = feedbackGen.generateFeedback(text, score);
    document.getElementById('feedbackOutput').innerHTML = `
        <strong>Feedback:</strong>
        <ul>${feedback.map(f => `<li>${f}</li>`).join('')}</ul>
    `;

    // Originality Check
    const isOriginal = grader.checkOriginality(text);
    document.getElementById('originalityOutput').innerHTML = `
        <strong>Originality:</strong> ${isOriginal ? 'Content appears original' : 'Potential plagiarism detected'}
    `;

    // Progress Tracking
    const studentId = 'student1'; // Demo purposes
    const scores = grader.pastScores.get(studentId)?.scores || [];
    document.getElementById('progressChart').innerHTML = `
        <strong>Progress:</strong> ${feedbackGen.getProgressInsight(scores)}
        <br>Score History: ${scores.join(', ')}
    `;
}
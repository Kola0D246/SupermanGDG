// Sample data - This would be replaced by actual data from a database or API
const assignments = {
    math: [
      {
        id: 1,
        title: 'Calculus Problem Set',
        dateAllotted: '2025-02-15',
        dueDate: '2025-02-28',
        submitted: false
      },
      {
        id: 2,
        title: 'Algebra Quiz',
        dateAllotted: '2025-02-10',
        dueDate: '2025-02-20',
        submitted: true
      }
    ],
    science: [
      {
        id: 3,
        title: 'Lab Report: Chemical Reactions',
        dateAllotted: '2025-02-18',
        dueDate: '2025-03-01',
        submitted: false
      }
    ],
    english: [
      {
        id: 4,
        title: 'Essay: Modern Literature',
        dateAllotted: '2025-02-12',
        dueDate: '2025-02-26',
        submitted: false
      }
    ],
    history: []
  };
  
  // Format date for display
  function formatDate(dateString) {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  }
  
  // Render assignments for a subject
  function renderAssignments(subject) {
    const container = document.getElementById('assignments-container');
    container.innerHTML = '';
    
    const subjectAssignments = assignments[subject] || [];
    
    if (subjectAssignments.length === 0) {
      container.innerHTML = '<p>No assignments for this subject yet.</p>';
      return;
    }
    
    subjectAssignments.forEach(assignment => {
      const card = document.createElement('div');
      card.className = 'assignment-card';
      
      const title = document.createElement('div');
      title.className = 'assignment-title';
      title.textContent = assignment.title;
      
      const dates = document.createElement('div');
      dates.className = 'assignment-dates';
      
      const allotted = document.createElement('span');
      allotted.textContent = `Allotted: ${formatDate(assignment.dateAllotted)}`;
      
      const due = document.createElement('span');
      due.textContent = `Due: ${formatDate(assignment.dueDate)}`;
      
      dates.appendChild(allotted);
      dates.appendChild(due);
      
      const button = document.createElement('button');
      button.className = 'submission-btn';
      button.textContent = assignment.submitted ? 'Submitted' : 'Submit PDF';
      button.disabled = assignment.submitted;
      
      if (!assignment.submitted) {
        button.addEventListener('click', () => handleSubmission(assignment.id));
      }
      
      card.appendChild(title);
      card.appendChild(dates);
      card.appendChild(button);
      
      container.appendChild(card);
    });
  }
  
  // Handle assignment submission
  async function handleSubmission(assignmentId) {
    try {
      const filePath = await window.electronAPI.openFileDialog();
      
      if (!filePath) return; // User canceled
      
      const result = await window.electronAPI.uploadPDF(filePath, assignmentId);
      
      if (result.success) {
        alert(`Assignment submitted successfully!`);
        // Update UI to show submitted state
        // This would update the UI and possibly sync with a backend in the real app
      }
    } catch (error) {
      console.error('Error submitting assignment:', error);
      alert('Failed to submit assignment. Please try again.');
    }
  }
  
  // Initialize the app
  document.addEventListener('DOMContentLoaded', () => {
    // Set initial subject
    let currentSubject = 'math';
    renderAssignments(currentSubject);
    
    // Add subject navigation handlers
    const subjectButtons = document.querySelectorAll('.subject-btn');
    subjectButtons.forEach(button => {
      button.addEventListener('click', () => {
        // Update active button
        subjectButtons.forEach(btn => btn.classList.remove('active'));
        button.classList.add('active');
        
        // Render assignments for selected subject
        currentSubject = button.getAttribute('data-subject');
        renderAssignments(currentSubject);
      });
    });
  });
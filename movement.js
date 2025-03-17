// Initialize data structure
let attendanceData = JSON.parse(localStorage.getItem('attendanceData')) || {};
let students = JSON.parse(localStorage.getItem('students')) || [];
let currentDate = localStorage.getItem('currentDate') || new Date().toISOString().split('T')[0];

// DOM elements
const studentNameInput = document.getElementById('studentName');
const addStudentBtn = document.getElementById('addStudent');
const studentListEl = document.getElementById('studentList');
const currentDateEl = document.getElementById('currentDate');
const summaryEl = document.getElementById('summary');
const prevDateBtn = document.getElementById('prevDate');
const nextDateBtn = document.getElementById('nextDate');
const todayDateBtn = document.getElementById('todayDate');
const clearDataBtn = document.getElementById('clearData');

// Initialize application
function init() {
    updateDateDisplay();
    renderStudentList();
    updateSummary();
}

// Date navigation functions
function updateDateDisplay() {
    const dateObj = new Date(currentDate);
    currentDateEl.textContent = dateObj.toLocaleDateString('en-US', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
    });
    localStorage.setItem('currentDate', currentDate);
}

prevDateBtn.addEventListener('click', () => {
    const dateObj = new Date(currentDate);
    dateObj.setDate(dateObj.getDate() - 1);
    currentDate = dateObj.toISOString().split('T')[0];
    updateDateDisplay();
    renderStudentList();
    updateSummary();
});

nextDateBtn.addEventListener('click', () => {
    const dateObj = new Date(currentDate);
    dateObj.setDate(dateObj.getDate() + 1);
    currentDate = dateObj.toISOString().split('T')[0];
    updateDateDisplay();
    renderStudentList();
    updateSummary();
});

todayDateBtn.addEventListener('click', () => {
    currentDate = new Date().toISOString().split('T')[0];
    updateDateDisplay();
    renderStudentList();
    updateSummary();
});

// Student management
addStudentBtn.addEventListener('click', addStudent);

function addStudent() {
    const name = studentNameInput.value.trim();
    if (name && !students.includes(name)) {
        students.push(name);
        localStorage.setItem('students', JSON.stringify(students));
        studentNameInput.value = '';
        renderStudentList();
        updateSummary();
    }
}

function removeStudent(name) {
    students = students.filter(student => student !== name);
    
    // Remove student from all attendance records
    for (const date in attendanceData) {
        if (attendanceData[date][name]) {
            delete attendanceData[date][name];
        }
    }
    
    localStorage.setItem('students', JSON.stringify(students));
    localStorage.setItem('attendanceData', JSON.stringify(attendanceData));
    renderStudentList();
    updateSummary();
}

// Attendance tracking
function markAttendance(student, status) {
    if (!attendanceData[currentDate]) {
        attendanceData[currentDate] = {};
    }
    
    attendanceData[currentDate][student] = status;
    localStorage.setItem('attendanceData', JSON.stringify(attendanceData));
    renderStudentList();
    updateSummary();
}

// Rendering functions
function renderStudentList() {
    studentListEl.innerHTML = '';
    
    students.forEach(student => {
        const row = document.createElement('tr');
        row.className = 'student-row';
        
        const status = attendanceData[currentDate]?.[student] || 'unknown';
        if (status === 'present') {
            row.classList.add('present');
        } else if (status === 'absent') {
            row.classList.add('absent');
        }
        
        row.innerHTML = `
            <td>${student}</td>
            <td>${status.charAt(0).toUpperCase() + status.slice(1)}</td>
            <td>
                <button onclick="markAttendance('${student}', 'present')">Present</button>
                <button onclick="markAttendance('${student}', 'absent')">Absent</button>
                <button onclick="removeStudent('${student}')">Remove</button>
            </td>
        `;
        
        studentListEl.appendChild(row);
    });
    
    if (students.length === 0) {
        studentListEl.innerHTML = '<tr><td colspan="3" style="text-align: center;">No students added yet</td></tr>';
    }
}

function updateSummary() {
    const total = students.length;
    let present = 0;
    let absent = 0;
    let unknown = 0;
    
    students.forEach(student => {
        const status = attendanceData[currentDate]?.[student] || 'unknown';
        if (status === 'present') present++;
        else if (status === 'absent') absent++;
        else unknown++;
    });
    
    const presentPercentage = total > 0 ? ((present / total) * 100).toFixed(1) : 0;
    const absentPercentage = total > 0 ? ((absent / total) * 100).toFixed(1) : 0;
    
    summaryEl.innerHTML = `
        <h3>Attendance Summary</h3>
        <p>Total Students: ${total}</p>
        
        <div class="attendance-stats">
            <div class="stat-box stat-present">
                <h4>Present</h4>
                <div class="number">${present}</div>
                <div>${presentPercentage}%</div>
                <div class="progress-bar">
                    <div class="progress-fill" style="width: ${presentPercentage}%"></div>
                </div>
            </div>
            
            <div class="stat-box stat-absent">
                <h4>Absent</h4>
                <div class="number">${absent}</div>
                <div>${absentPercentage}%</div>
                <div class="progress-bar">
                    <div class="progress-fill-absent" style="width: ${absentPercentage}%"></div>
                </div>
            </div>
            
            <div class="stat-box stat-total">
                <h4>Not Marked</h4>
                <div class="number">${unknown}</div>
                <div>${total > 0 ? ((unknown / total) * 100).toFixed(1) : 0}%</div>
            </div>
        </div>
    `;
}

// Clear all data
clearDataBtn.addEventListener('click', () => {
    if (confirm('Are you sure you want to clear all attendance data? This cannot be undone.')) {
        localStorage.removeItem('attendanceData');
        localStorage.removeItem('students');
        attendanceData = {};
        students = [];
        renderStudentList();
        updateSummary();
    }
});

// Make functions globally available
window.markAttendance = markAttendance;
window.removeStudent = removeStudent;

// Initialize the app
init();
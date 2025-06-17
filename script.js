// Global variables
let tasks = [
    {
        id: 1,
        title: "تفقد بلاط الأرضيات",
        assignee: "محمد أحمد",
        startDate: "2025-06-15",
        endDate: "2025-06-18",
        reminder: "2025-06-17T09:00",
        status: "open",
        priority: "high",
        progress: 33,
        details: "تفاصيل حول تفقد بلاط الأرضيات",
        attachment: "",
        attachmentName: "",
        notes: [
            {text:"تأكد من النوعية",id:1},
            {text:"احضر الأدوات",id:2}
        ]
    },
    {
        id: 2,
        title: "فحص عدد البلاط",
        assignee: "سارة علي",
        startDate: "2025-06-13",
        endDate: "2025-06-16",
        reminder: "",
        status: "progress",
        priority: "high",
        progress: 65,
        details: "تفاصيل حول فحص عدد البلاط",
        attachment: "",
        attachmentName: "",
        notes: []
    }
];

let noteEditId = null;

// Page Navigation Functions
function showPage(pageId) {
    // Hide all pages
    const pages = document.querySelectorAll('.page-content');
    pages.forEach(page => page.style.display = 'none');
    
    // Show selected page
    const targetPage = document.getElementById(pageId + 'Page');
    if (targetPage) {
        targetPage.style.display = 'block';
    }
    
    // Update navbar active state
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => link.classList.remove('active'));
    
    // Load page-specific content
    switch(pageId) {
        case 'home':
            loadTasks();
            break;
        case 'reports':
            loadReports();
            break;
        case 'about':
            // About page is static
            break;
        case 'program':
            // Program page is static
            break;
        case 'settings':
            loadSettings();
            break;
    }
}

// Task Management Functions (from original code)
function getReminderBadge(reminder) {
    if (!reminder) return '';
    let date = new Date(reminder);
    let options = { year: '2-digit', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' };
    return `<span class="reminder-badge" title="تذكير">${date.toLocaleString('ar-EG', options)}</span>`;
}

function getStatusBadge(status) {
    const statusMap = {
        'open': { class: 'status-open', text: 'مفتوحة' },
        'progress': { class: 'status-progress', text: 'قيد التنفيذ' },
        'discuss': { class: 'status-discuss', text: 'نقاش' },
        'done': { class: 'status-done', text: 'منجزة' }
    };
    const s = statusMap[status] || statusMap['open'];
    return `<span class="${s.class}">${s.text}</span>`;
}

function getPriorityText(priority) {
    return priority === 'high' ? 
        '<span class="priority-high">مرتفعة</span>' : 
        '<span class="priority-low">منخفضة</span>';
}

function getProgressBar(progress) {
    return `<div class="progress-bar-bg">
                <div class="progress-bar-fill" style="width: ${progress}%"></div>
            </div>
            <small>${progress}%</small>`;
}

function loadTasks() {
    const tbody = document.getElementById('tasksBody');
    tbody.innerHTML = '';
    
    tasks.forEach((task, index) => {
        const row = document.createElement('tr');
        if (task.status === 'done') {
            row.classList.add('completed-row');
        }
        
        const attachmentDisplay = task.attachmentName ? 
            `<a href="#" class="attachment-link" onclick="viewAttachment(${task.id})">${task.attachmentName}</a>` : 
            'لا يوجد';
        
        row.innerHTML = `
            <td>${index + 1}</td>
            <td onclick="showTaskDetails(${task.id})" style="cursor: pointer; color: #1976d2; font-weight: bold;">${task.title}</td>
            <td><span class="assignee-name">${task.assignee}</span></td>
            <td>${task.startDate}</td>
            <td>${task.endDate}</td>
            <td>${getReminderBadge(task.reminder)}</td>
            <td>${attachmentDisplay}</td>
            <td>${getStatusBadge(task.status)}</td>
            <td>${getPriorityText(task.priority)}</td>
            <td>${getProgressBar(task.progress)}</td>
            <td>
                <input type="checkbox" ${task.status === 'done' ? 'checked' : ''} 
                       onchange="toggleTaskCompletion(${task.id})" 
                       style="transform: scale(1.5);">
            </td>
            <td class="actions">
                <button class="edit" onclick="editTask(${task.id})" title="تعديل">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="delete" onclick="deleteTask(${task.id})" title="حذف">
                    <i class="fas fa-trash"></i>
                </button>
                <button class="check" onclick="showTaskDetails(${task.id})" title="عرض التفاصيل">
                    <i class="fas fa-eye"></i>
                </button>
            </td>
        `;
        tbody.appendChild(row);
    });
    
    checkReminders();
}

function openTaskModal(taskId = null) {
    const modal = new bootstrap.Modal(document.getElementById('taskModal'));
    const form = document.getElementById('taskForm');
    const title = document.getElementById('modalTitle');
    
    if (taskId) {
        const task = tasks.find(t => t.id === taskId);
        if (task) {
            title.textContent = 'تعديل مهمة';
            document.getElementById('taskId').value = task.id;
            document.getElementById('taskTitle').value = task.title;
            document.getElementById('taskAssignee').value = task.assignee;
            document.getElementById('taskStartDate').value = task.startDate;
            document.getElementById('taskEndDate').value = task.endDate;
            document.getElementById('taskReminder').value = task.reminder;
            document.getElementById('taskStatus').value = task.status;
            document.getElementById('taskPriority').value = task.priority;
            document.getElementById('taskProgress').value = task.progress;
            document.getElementById('taskDetails').value = task.details;
        }
    } else {
        title.textContent = 'إضافة مهمة جديدة';
        form.reset();
        document.getElementById('taskId').value = '';
    }
    
    modal.show();
}

function closeTaskModal() {
    const modal = bootstrap.Modal.getInstance(document.getElementById('taskModal'));
    modal.hide();
}

function saveTask(event) {
    event.preventDefault();
    
    const taskId = document.getElementById('taskId').value;
    const title = document.getElementById('taskTitle').value;
    const assignee = document.getElementById('taskAssignee').value;
    const startDate = document.getElementById('taskStartDate').value;
    const endDate = document.getElementById('taskEndDate').value;
    const reminder = document.getElementById('taskReminder').value;
    const status = document.getElementById('taskStatus').value;
    const priority = document.getElementById('taskPriority').value;
    const progress = parseInt(document.getElementById('taskProgress').value);
    const details = document.getElementById('taskDetails').value;
    const attachmentFile = document.getElementById('taskAttachment').files[0];
    
    const taskData = {
        title, assignee, startDate, endDate, reminder, status, priority, progress, details,
        attachment: attachmentFile ? URL.createObjectURL(attachmentFile) : '',
        attachmentName: attachmentFile ? attachmentFile.name : '',
        notes: []
    };
    
    if (taskId) {
        const taskIndex = tasks.findIndex(t => t.id == taskId);
        if (taskIndex !== -1) {
            tasks[taskIndex] = { ...tasks[taskIndex], ...taskData };
        }
    } else {
        const newId = Math.max(...tasks.map(t => t.id), 0) + 1;
        tasks.push({ id: newId, ...taskData });
    }
    
    loadTasks();
    closeTaskModal();
}

function editTask(taskId) {
    openTaskModal(taskId);
}

function deleteTask(taskId) {
    if (confirm('هل أنت متأكد من حذف هذه المهمة؟')) {
        tasks = tasks.filter(t => t.id !== taskId);
        loadTasks();
    }
}

function toggleTaskCompletion(taskId) {
    const task = tasks.find(t => t.id === taskId);
    if (task) {
        task.status = task.status === 'done' ? 'open' : 'done';
        task.progress = task.status === 'done' ? 100 : task.progress;
        loadTasks();
    }
}

function showTaskDetails(taskId) {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;
    
    const modal = new bootstrap.Modal(document.getElementById('detailsModal'));
    document.getElementById('detailsTitle').textContent = task.title;
    document.getElementById('noteTaskId').value = taskId;
    
    const detailsInfo = document.getElementById('detailsInfo');
    detailsInfo.innerHTML = `
        <p><strong>المُسند إليه:</strong> ${task.assignee}</p>
        <p><strong>تاريخ البداية:</strong> ${task.startDate}</p>
        <p><strong>تاريخ النهاية:</strong> ${task.endDate}</p>
        <p><strong>الحالة:</strong> ${getStatusBadge(task.status)}</p>
        <p><strong>الأولوية:</strong> ${getPriorityText(task.priority)}</p>
        <p><strong>نسبة الإنجاز:</strong> ${task.progress}%</p>
        <p><strong>التفاصيل:</strong> ${task.details || 'لا توجد تفاصيل'}</p>
    `;
    
    const attachmentDiv = document.getElementById('detailsAttachment');
    if (task.attachmentName) {
        attachmentDiv.innerHTML = `<p><strong>المرفق:</strong> <a href="${task.attachment}" target="_blank">${task.attachmentName}</a></p>`;
    } else {
        attachmentDiv.innerHTML = '';
    }
    
    loadNotes(taskId);
    modal.show();
}

function closeDetailsModal() {
    const modal = bootstrap.Modal.getInstance(document.getElementById('detailsModal'));
    modal.hide();
}

function loadNotes(taskId) {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;
    
    const notesList = document.getElementById('notesList');
    notesList.innerHTML = '';
    
    task.notes.forEach(note => {
        const noteDiv = document.createElement('div');
        noteDiv.className = 'note-item';
        noteDiv.innerHTML = `
            <span>${note.text}</span>
            <div class="note-actions">
                <button onclick="editNote(${taskId}, ${note.id})" title="تعديل">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="delete" onclick="deleteNote(${taskId}, ${note.id})" title="حذف">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `;
        notesList.appendChild(noteDiv);
    });
}

function addNote(event) {
    event.preventDefault();
    
    const taskId = parseInt(document.getElementById('noteTaskId').value);
    const noteText = document.getElementById('noteInput').value.trim();
    
    if (!noteText) return;
    
    const task = tasks.find(t => t.id === taskId);
    if (task) {
        const newNoteId = Math.max(...task.notes.map(n => n.id), 0) + 1;
        task.notes.push({ id: newNoteId, text: noteText });
        document.getElementById('noteInput').value = '';
        loadNotes(taskId);
    }
}

function editNote(taskId, noteId) {
    const task = tasks.find(t => t.id === taskId);
    const note = task.notes.find(n => n.id === noteId);
    if (!note) return;
    
    const noteItem = event.target.closest('.note-item');
    const noteSpan = noteItem.querySelector('span');
    
    const input = document.createElement('input');
    input.type = 'text';
    input.value = note.text;
    input.className = 'note-edit-input';
    
    const saveBtn = document.createElement('button');
    saveBtn.innerHTML = '<i class="fas fa-save"></i>';
    saveBtn.onclick = () => saveNoteEdit(taskId, noteId, input.value);
    
    noteSpan.replaceWith(input);
    noteItem.querySelector('.note-actions').prepend(saveBtn);
    input.focus();
}

function saveNoteEdit(taskId, noteId, newText) {
    if (!newText.trim()) return;
    
    const task = tasks.find(t => t.id === taskId);
    const note = task.notes.find(n => n.id === noteId);
    if (note) {
        note.text = newText.trim();
        loadNotes(taskId);
    }
}

function deleteNote(taskId, noteId) {
    if (confirm('هل أنت متأكد من حذف هذه الملاحظة؟')) {
        const task = tasks.find(t => t.id === taskId);
        if (task) {
            task.notes = task.notes.filter(n => n.id !== noteId);
            loadNotes(taskId);
        }
    }
}

function checkReminders() {
    const now = new Date();
    const reminderAlert = document.getElementById('reminderAlert');
    const reminderMsg = document.getElementById('reminderAlertMsg');
    
    let hasReminder = false;
    
    tasks.forEach(task => {
        if (task.reminder && task.status !== 'done') {
            const reminderTime = new Date(task.reminder);
            const timeDiff = reminderTime - now;
            
            if (timeDiff > 0 && timeDiff <= 30 * 60 * 1000) { // 30 minutes
                hasReminder = true;
                reminderMsg.textContent = `تذكير: ${task.title}`;
            }
        }
    });
    
    reminderAlert.style.display = hasReminder ? 'flex' : 'none';
}

// Reports Page Functions
function loadReports() {
    updateReportsStatistics();
    loadReportsTable();
}

function updateReportsStatistics() {
    const total = tasks.length;
    const completed = tasks.filter(t => t.status === 'done').length;
    const pending = tasks.filter(t => t.status !== 'done').length;
    const urgent = tasks.filter(t => t.priority === 'high').length;
    
    document.getElementById('totalReports').textContent = total;
    document.getElementById('completedReports').textContent = completed;
    document.getElementById('pendingReports').textContent = pending;
    document.getElementById('urgentReports').textContent = urgent;
}

function loadReportsTable() {
    const tbody = document.getElementById('reportsTableBody');
    tbody.innerHTML = '';
    
    let filteredTasks = [...tasks];
    
    // Apply filters
    const searchTerm = document.getElementById('searchReports')?.value.toLowerCase() || '';
    const statusFilter = document.getElementById('filterStatus')?.value || '';
    const priorityFilter = document.getElementById('filterPriority')?.value || '';
    
    if (searchTerm) {
        filteredTasks = filteredTasks.filter(task => 
            task.title.toLowerCase().includes(searchTerm) ||
            task.assignee.toLowerCase().includes(searchTerm)
        );
    }
    
    if (statusFilter) {
        filteredTasks = filteredTasks.filter(task => task.status === statusFilter);
    }
    
    if (priorityFilter) {
        filteredTasks = filteredTasks.filter(task => task.priority === priorityFilter);
    }
    
    filteredTasks.forEach(task => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${task.id}</td>
            <td>${task.title}</td>
            <td>${task.assignee}</td>
            <td>${task.startDate}</td>
            <td>${task.endDate}</td>
            <td>${getStatusBadge(task.status)}</td>
            <td>${getPriorityText(task.priority)}</td>
            <td>
                <div class="progress" style="height: 20px;">
                    <div class="progress-bar" role="progressbar" style="width: ${task.progress}%">
                        ${task.progress}%
                    </div>
                </div>
            </td>
        `;
        tbody.appendChild(row);
    });
}

function printReports() {
    window.print();
}

function clearFilters() {
    document.getElementById('searchReports').value = '';
    document.getElementById('filterStatus').value = '';
    document.getElementById('filterPriority').value = '';
    loadReportsTable();
}

// Settings Page Functions
function loadSettings() {
    // Load settings from localStorage or use defaults
    const settings = JSON.parse(localStorage.getItem('taskSettings') || '{}');
    
    document.getElementById('companyName').value = settings.companyName || 'إدارة المهام الذكية';
    document.getElementById('notificationEmail').value = settings.notificationEmail || 'admin@taskmanagement.com';
    document.getElementById('timezone').value = settings.timezone || 'Asia/Riyadh';
    document.getElementById('emailNotifications').checked = settings.emailNotifications !== false;
    document.getElementById('browserNotifications').checked = settings.browserNotifications !== false;
    document.getElementById('reminderTime').value = settings.reminderTime || 30;
    document.getElementById('tasksPerPage').value = settings.tasksPerPage || 25;
    document.getElementById('displayMode').value = settings.displayMode || 'light';
    document.getElementById('autoBackup').checked = settings.autoBackup !== false;
    document.getElementById('backupFrequency').value = settings.backupFrequency || 'daily';
}

function saveSettings() {
    const settings = {
        companyName: document.getElementById('companyName').value,
        notificationEmail: document.getElementById('notificationEmail').value,
        timezone: document.getElementById('timezone').value,
        emailNotifications: document.getElementById('emailNotifications').checked,
        browserNotifications: document.getElementById('browserNotifications').checked,
        reminderTime: parseInt(document.getElementById('reminderTime').value),
        tasksPerPage: parseInt(document.getElementById('tasksPerPage').value),
        displayMode: document.getElementById('displayMode').value,
        autoBackup: document.getElementById('autoBackup').checked,
        backupFrequency: document.getElementById('backupFrequency').value
    };
    
    localStorage.setItem('taskSettings', JSON.stringify(settings));
    alert('تم حفظ الإعدادات بنجاح!');
}

function resetSettings() {
    if (confirm('هل أنت متأكد من استعادة الإعدادات الافتراضية؟')) {
        localStorage.removeItem('taskSettings');
        loadSettings();
        alert('تم استعادة الإعدادات الافتراضية!');
    }
}

function exportSettings() {
    const settings = localStorage.getItem('taskSettings') || '{}';
    const blob = new Blob([settings], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'task_settings.json';
    a.click();
    URL.revokeObjectURL(url);
}

function importSettings() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = function(e) {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(e) {
                try {
                    const settings = JSON.parse(e.target.result);
                    localStorage.setItem('taskSettings', JSON.stringify(settings));
                    loadSettings();
                    alert('تم استيراد الإعدادات بنجاح!');
                } catch (error) {
                    alert('خطأ في قراءة ملف الإعدادات!');
                }
            };
            reader.readAsText(file);
        }
    };
    input.click();
}

// Event Listeners
document.addEventListener('DOMContentLoaded', function() {
    // Show home page by default
    showPage('home');
    
    // Add event listeners for reports filters
    if (document.getElementById('searchReports')) {
        document.getElementById('searchReports').addEventListener('input', loadReportsTable);
        document.getElementById('filterStatus').addEventListener('change', loadReportsTable);
        document.getElementById('filterPriority').addEventListener('change', loadReportsTable);
    }
    
    // Check reminders every minute
    setInterval(checkReminders, 60000);
});

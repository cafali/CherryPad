document.addEventListener('DOMContentLoaded', function() {
    const saveButton = document.getElementById('saveButton');
    const saveTxtButton = document.getElementById('saveTxtButton');
    const clearButton = document.getElementById('clearButton');
    const noteInput = document.getElementById('noteInput');
    const cherryIcon = document.querySelector('.cherry-icon');
    const fullscreenLink = document.getElementById('Fullscreen');

    // cherry icon blink
    function blinkCherryIcon() {
        cherryIcon.style.filter = 'brightness(1.6)';
        setTimeout(function() {
            cherryIcon.style.filter = 'brightness(1)';
        }, 500);
    }

    // spinning animation cherry
    function spinCherryIconOnce() {
        cherryIcon.classList.add('spin-once');
        setTimeout(function() {
            cherryIcon.classList.remove('spin-once');
        }, 1000); // duration
    }

    // save content Save button
    saveButton.addEventListener('click', function() {
        localStorage.setItem('note', noteInput.value);
        blinkCherryIcon();
        spinCherryIconOnce(); // spinning effect
    });

    // download .txt file button
    saveTxtButton.addEventListener('click', function() {
        const blob = new Blob([noteInput.value], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        const today = new Date();
        const yyyy = today.getFullYear();
        const mm = String(today.getMonth() + 1).padStart(2, '0');
        const dd = String(today.getDate()).padStart(2, '0');
        a.download = 'CherryNote ' + dd + '-' + mm + '-' + yyyy + '.txt';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    });

    // --- Two-step clear button confirmation ---
    let clearConfirmed = false;
    let clearTimeoutId;
    const buttonLabel = clearButton.querySelector('b');
    const originalText = buttonLabel.textContent;

    // Set your warning color here:
    const warningColor = '#FF4C4C'; // bright red, adjust as needed

    clearButton.addEventListener('click', function() {
        if (!clearConfirmed) {
         // First click → show warning
            clearConfirmed = true;
            clearButton.style.backgroundColor = warningColor;
            buttonLabel.textContent = ' Confirm to delete';

            // Reset if user doesn't confirm within 2 seconds
            clearTimeoutId = setTimeout(() => {
            clearConfirmed = false;
            clearButton.style.backgroundColor = '';
            buttonLabel.textContent = originalText;
        }, 2000);
        } else {
        // Second click → clear AND save immediately
        clearConfirmed = false;
        clearButton.style.backgroundColor = '';
        buttonLabel.textContent = originalText;
        clearTimeout(clearTimeoutId);

        // Clear note input
        noteInput.value = '';

        // Save cleared state to all storage keys
        localStorage.setItem('note', '');
        localStorage.setItem('noteInput', '');

        // Visual feedback
        blinkCherryIcon();
        spinCherryIconOnce();
        }
    });

    // load saved note from local storage when the popup is opened
    const savedNote = localStorage.getItem('note');
    if (savedNote) {
        noteInput.value = savedNote;
    }

    // add click event to cherry icon only if on popup.html
    if (window.location.pathname.includes("popup.html")) {
        cherryIcon.addEventListener("click", function() {
            noteInput.value += "🍒 Click! 🍒";
        });

        // add click event to Fullscreen.png to save content and redirect to fullscreen
        fullscreenLink.addEventListener('click', function(event) {
            event.preventDefault(); 
            saveButton.click();
            setTimeout(function() {
                window.open("CherryPad.html", '_blank');
            }, 150);
        });
    }
});

// AutoSave and other handlers
document.addEventListener('DOMContentLoaded', function() {
    const noteInput = document.getElementById('noteInput');
    if (localStorage.getItem('noteInput')) {
        noteInput.value = localStorage.getItem('noteInput');
    }
    noteInput.addEventListener('input', function() {
        localStorage.setItem('noteInput', noteInput.value);
    });
});

// Undo Ctrl+Z
document.getElementById('noteInput').addEventListener('keydown', (e) => {
    if (e.ctrlKey && e.key === 'z') {
        const textarea = document.getElementById('noteInput');
        const pastedContent = JSON.parse(textarea.dataset.lastPastedContent || '{}');
        if (pastedContent.text) {
            const endPos = pastedContent.startPos + pastedContent.text.length;
            textarea.setRangeText('', pastedContent.startPos, endPos, 'end');
            e.preventDefault();
        }
    }
});

// Shortcuts
document.addEventListener('keydown', function(event) {
    if (event.ctrlKey && (event.key === 's' || event.key === 'S')) {
        event.preventDefault(); 
        document.getElementById('saveButton').click(); 
    }
    if (event.ctrlKey && (event.key === 'd' || event.key === 'D')) {
        event.preventDefault(); 
        document.getElementById('downloadButton').click(); 
    }
});
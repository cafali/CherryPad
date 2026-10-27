function updateNoteStats() {
    const noteInputs = [
        document.getElementById('noteInput'),
        document.getElementById('noteInput2')
    ];
    const noteStats = document.getElementById('noteStats');
    const showingSecondField = document.querySelector('.popup-container').dataset.noteField === 'second';
    const text = noteInputs[showingSecondField ? 1 : 0].value;
    const lineCount = text.length > 0 ? text.split(/\r\n|\r|\n/).length : 0;
    const characterCount = Array.from(text).length;
    const wordCount = text.trim().match(/\S+/g)?.length || 0;
    noteStats.textContent = `${lineCount} ${lineCount === 1 ? 'line' : 'lines'} · ${characterCount} ${characterCount === 1 ? 'character' : 'characters'} · ${wordCount} ${wordCount === 1 ? 'word' : 'words'}`;
}

document.addEventListener('DOMContentLoaded', function() {
    const saveButton = document.getElementById('saveButton');
    const saveTxtButton = document.getElementById('saveTxtButton');
    const clearButton = document.getElementById('clearButton');
    const noteInputs = [
        document.getElementById('noteInput'),
        document.getElementById('noteInput2')
    ];
    const noteFieldViewButton = document.getElementById('noteFieldViewButton');
    const cherryIcon = document.querySelector('.cherry-icon');
    const fullscreenLink = document.getElementById('Fullscreen');
    let activeNoteFieldIndex = 0;
    const activeNoteInput = () => noteInputs[activeNoteFieldIndex];

    const savedFirstNote = localStorage.getItem('noteInput');
    noteInputs[0].value = savedFirstNote !== null ? savedFirstNote : (localStorage.getItem('note') || '');
    noteInputs[1].value = localStorage.getItem('noteInput2') || '';

    noteFieldViewButton.addEventListener('click', function() {
        activeNoteFieldIndex = activeNoteFieldIndex === 0 ? 1 : 0;
        const showingSecondField = activeNoteFieldIndex === 1;
        document.querySelector('.popup-container').dataset.noteField = showingSecondField ? 'second' : 'first';
        noteFieldViewButton.title = showingSecondField ? '' : '';
        updateNoteStats();
    });

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
        localStorage.setItem('note', noteInputs[0].value);
        localStorage.setItem('noteInput', noteInputs[0].value);
        localStorage.setItem('noteInput2', noteInputs[1].value);
        blinkCherryIcon();
        spinCherryIconOnce(); // spinning effect
    });

    // download .txt file button
    saveTxtButton.addEventListener('click', function() {
        const blob = new Blob([activeNoteInput().value], { type: 'text/plain' });
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
    const warningColor = '#dc5858'; // bright red, adjust as needed

    clearButton.addEventListener('click', function() {
        if (!clearConfirmed) {
         // First click → show warning
            clearConfirmed = true;
            clearButton.style.backgroundColor = warningColor;
            buttonLabel.textContent = ' CONFIRM FIELD DELETION';

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

        const noteInput = activeNoteInput();
        noteInput.value = '';
        noteInput.dispatchEvent(new Event('input'));

        // Visual feedback
        blinkCherryIcon();
        spinCherryIconOnce();
        }
    });

    // add click event to cherry icon only if on popup.html
    if (window.location.pathname.includes("popup.html")) {
        cherryIcon.addEventListener("click", function() {
            const noteInput = activeNoteInput();
            noteInput.value += "🍒 Click! 🍒";
            noteInput.dispatchEvent(new Event('input'));
        });

        // add click event to Fullscreen.png to save content and redirect to fullscreen
        fullscreenLink.addEventListener('click', function(event) {
            event.preventDefault(); 
            saveButton.click();
            setTimeout(function() {
                window.open("cherrypad.html", '_blank');
            }, 150);
        });
    }
});

// AutoSave and other handlers
document.addEventListener('DOMContentLoaded', function() {
    const noteInputs = [
        document.getElementById('noteInput'),
        document.getElementById('noteInput2')
    ];
    updateNoteStats();
    noteInputs.forEach((noteInput, index) => {
        noteInput.addEventListener('input', function() {
            localStorage.setItem(index === 0 ? 'noteInput' : 'noteInput2', noteInput.value);
            if (index === 0) {
                localStorage.setItem('note', noteInput.value);
            }
            updateNoteStats();
        });
    });
});

// Undo Ctrl+Z
document.querySelectorAll('#noteInput, #noteInput2').forEach((textarea) => {
    textarea.addEventListener('keydown', (e) => {
        if (e.ctrlKey && e.key === 'z') {
            const pastedContent = JSON.parse(textarea.dataset.lastPastedContent || '{}');
            if (pastedContent.text) {
                const endPos = pastedContent.startPos + pastedContent.text.length;
                textarea.setRangeText('', pastedContent.startPos, endPos, 'end');
                e.preventDefault();
            }
        }
    });
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
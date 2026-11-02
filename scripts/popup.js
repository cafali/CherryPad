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
    const fieldLabel = showingSecondField ? 'Field 2' : 'Field 1';
    noteStats.textContent = `${lineCount} ${lineCount === 1 ? 'line' : 'lines'} · ${characterCount} ${characterCount === 1 ? 'character' : 'characters'} · ${wordCount} ${wordCount === 1 ? 'word' : 'words'} · ${fieldLabel}`;
}

function formatDownloadTimestamp(date) {
    return [date.getHours(), date.getMinutes(), date.getSeconds()]
        .map((part) => String(part).padStart(2, '0'))
        .join('-');
}

document.addEventListener('DOMContentLoaded', function() {
    const pendingSelectionKey = 'pendingSelection';
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
    const selectionMenu = document.getElementById('popupSelectionMenu');
    const clearSelectionButton = selectionMenu.querySelector('[data-selection-action="clear"]');
    let activeNoteFieldIndex = 0;
    const activeNoteInput = () => noteInputs[activeNoteFieldIndex];
    let selectedNoteRange = null;
    let isSelectionActionInProgress = false;
    let pointerSelectionBefore = null;
    const keyboardSelectionBefore = new WeakMap();

    const savedFirstNote = localStorage.getItem('noteInput');
    noteInputs[0].value = savedFirstNote !== null ? savedFirstNote : (localStorage.getItem('note') || '');
    noteInputs[1].value = localStorage.getItem('noteInput2') || '';

    function resetClearConfirmation() {
        clearSelectionButton.innerHTML = '<i class="fas fa-eraser" aria-hidden="true"></i>';
        clearSelectionButton.setAttribute('aria-label', '');
        clearSelectionButton.title = '';
        clearSelectionButton.removeAttribute('data-confirming');
    }

    function hideSelectionMenu() {
        selectionMenu.hidden = true;
        selectedNoteRange = null;
        resetClearConfirmation();
    }

    function showSelectionMenu(textarea, clientX, clientY) {
        if (isSelectionActionInProgress) return;

        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        if (start === end) {
            hideSelectionMenu();
            return;
        }

        resetClearConfirmation();
        selectedNoteRange = { textarea, start, end, text: textarea.value.slice(start, end) };
        selectionMenu.hidden = false;

        const textareaRect = textarea.getBoundingClientRect();
        const menuRect = selectionMenu.getBoundingClientRect();
        const anchorX = Number.isFinite(clientX) ? clientX : textareaRect.left + textareaRect.width / 2;
        const anchorY = Number.isFinite(clientY) ? clientY : textareaRect.top + 44;
        const menuGap = window.innerHeight * 0.05;
        const left = Math.max(8, Math.min(anchorX - menuRect.width / 2, window.innerWidth - menuRect.width - 8));
        const top = anchorY - menuRect.height - menuGap >= 8
            ? anchorY - menuRect.height - menuGap
            : Math.min(anchorY + 10, window.innerHeight - menuRect.height - 8);

        selectionMenu.style.left = `${left}px`;
        selectionMenu.style.top = `${Math.max(8, top)}px`;
    }

    noteInputs.forEach((textarea) => {
        textarea.addEventListener('keydown', () => {
            keyboardSelectionBefore.set(textarea, {
                start: textarea.selectionStart,
                end: textarea.selectionEnd
            });
        });
        textarea.addEventListener('mouseup', (event) => {
            const { clientX, clientY } = event;
            const selectionBefore = pointerSelectionBefore;
            pointerSelectionBefore = null;
            requestAnimationFrame(() => {
                const selectionChanged = selectionBefore?.textarea === textarea &&
                    (textarea.selectionStart !== selectionBefore.start || textarea.selectionEnd !== selectionBefore.end);
                const pointerDragged = selectionBefore?.textarea === textarea &&
                    Math.hypot(clientX - selectionBefore.clientX, clientY - selectionBefore.clientY) > 3;
                if (document.activeElement === textarea && (selectionChanged || pointerDragged)) {
                    showSelectionMenu(textarea, clientX, clientY);
                } else {
                    hideSelectionMenu();
                }
            });
        });
        textarea.addEventListener('keyup', () => {
            const selectionBefore = keyboardSelectionBefore.get(textarea);
            keyboardSelectionBefore.delete(textarea);
            requestAnimationFrame(() => {
                const selectionChanged = selectionBefore &&
                    (textarea.selectionStart !== selectionBefore.start || textarea.selectionEnd !== selectionBefore.end);
                if (document.activeElement === textarea && selectionChanged) {
                    showSelectionMenu(textarea);
                }
            });
        });
    });

    selectionMenu.addEventListener('mousedown', (event) => event.preventDefault());
    selectionMenu.addEventListener('click', (event) => {
        if (!(event.target instanceof Element)) return;
        const action = event.target.closest('[data-selection-action]');
        if (!action || !selectedNoteRange) return;

        const { textarea, start, end, text } = selectedNoteRange;
        isSelectionActionInProgress = true;

        if (action.dataset.selectionAction === 'copy') {
            textarea.focus({ preventScroll: true });
            textarea.setSelectionRange(start, end);
            if (!document.execCommand('copy')) {
                console.error('Failed to copy selected popup note text to clipboard.');
            }
        } else if (action.dataset.selectionAction === 'clear' && !action.hasAttribute('data-confirming')) {
            action.setAttribute('aria-label', 'Confirm clearing selected text');
            action.title = 'Confirm clearing selected text';
            action.setAttribute('data-confirming', '');
            isSelectionActionInProgress = false;
            return;
        } else if (action.dataset.selectionAction === 'clear') {
            textarea.focus({ preventScroll: true });
            textarea.setRangeText('', start, end, 'start');
            textarea.dispatchEvent(new Event('input', { bubbles: true }));
        } else if (action.dataset.selectionAction === 'download') {
            const blob = new Blob([text], { type: 'text/plain' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            const today = new Date();
            const date = [
                String(today.getDate()).padStart(2, '0'),
                String(today.getMonth() + 1).padStart(2, '0'),
                today.getFullYear()
            ].join('-');

            link.href = url;
            link.download = `CherrySelection ${date} ${formatDownloadTimestamp(today)}.txt`;
            document.body.appendChild(link);
            link.click();
            link.remove();
            setTimeout(() => URL.revokeObjectURL(url), 1000);
        } else if (action.dataset.selectionAction === 'search') {
            const searchUrl = new URL('https://www.google.com/search');
            searchUrl.searchParams.set('q', text);
            window.open(searchUrl.toString(), '_blank', 'noopener,noreferrer');
        }

        hideSelectionMenu();
        setTimeout(() => {
            isSelectionActionInProgress = false;
        }, 0);
    });

    document.addEventListener('pointerdown', (event) => {
        if (selectionMenu.contains(event.target)) return;
        const textarea = noteInputs.find((field) => field === event.target);
        pointerSelectionBefore = textarea
            ? {
                textarea,
                start: textarea.selectionStart,
                end: textarea.selectionEnd,
                clientX: event.clientX,
                clientY: event.clientY
            }
            : null;
        hideSelectionMenu();
    });
    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape' && !selectionMenu.hidden) hideSelectionMenu();
    });
    window.addEventListener('resize', hideSelectionMenu);
    window.addEventListener('scroll', hideSelectionMenu, true);

    if (globalThis.chrome?.storage?.local) {
        chrome.storage.local.get(pendingSelectionKey)
            .then(async (storedSelection) => {
                const selectedText = storedSelection[pendingSelectionKey];
                if (typeof selectedText !== 'string' || !selectedText.trim()) return;

                const selectionBlock = `---------------------\n${selectedText}\n---------------------`;
                noteInputs[0].value = noteInputs[0].value
                    ? `${selectionBlock}\n\n${noteInputs[0].value}`
                    : selectionBlock;
                noteInputs[0].dispatchEvent(new Event('input', { bubbles: true }));
                noteInputs[0].focus();
                noteInputs[0].setSelectionRange(0, 0);
                noteInputs[0].scrollTop = 0;
                await chrome.storage.local.remove(pendingSelectionKey);
            })
            .catch((error) => {
                console.error('Could not send the selected text to the CherryPad popup:', error);
            });
    }

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
        a.download = `CherryNote ${dd}-${mm}-${yyyy} ${formatDownloadTimestamp(today)}.txt`;
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
            const version = chrome.runtime.getManifest().version;
            const message = `🍒 CherryPad (${version}) 🍒\n`;
            if (noteInput.value.startsWith(message)) {
                noteInput.value = noteInput.value.slice(message.length).replace(/^\r?\n/, '');
            } else {
                noteInput.value = noteInput.value ? `${message}\n${noteInput.value}` : message;
            }
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
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

let lineNumberMirror;

function updateLineNumbers(textarea) {
    const lineNumberList = document.querySelector('.line-number-list');
    if (!lineNumberMirror) {
        lineNumberMirror = document.createElement('div');
        lineNumberMirror.setAttribute('aria-hidden', 'true');
        Object.assign(lineNumberMirror.style, {
            position: 'fixed',
            top: '0',
            left: '-10000px',
            visibility: 'hidden',
            overflow: 'hidden',
            whiteSpace: 'pre-wrap',
            overflowWrap: 'break-word',
            boxSizing: 'content-box',
            margin: '0',
            padding: '0',
            border: '0'
        });
        document.body.appendChild(lineNumberMirror);
    }

    const styles = getComputedStyle(textarea);
    const lineHeight = parseFloat(styles.lineHeight);
    const contentWidth = textarea.clientWidth -
        parseFloat(styles.paddingLeft) - parseFloat(styles.paddingRight);
    Object.assign(lineNumberMirror.style, {
        width: `${contentWidth}px`,
        font: styles.font,
        lineHeight: styles.lineHeight,
        letterSpacing: styles.letterSpacing,
        tabSize: styles.tabSize
    });

    const lines = textarea.value.split(/\r\n|\r|\n/);
    const lineElements = lines.map((line) => {
        const element = document.createElement('div');
        element.textContent = line || ' ';
        lineNumberMirror.appendChild(element);
        return element;
    });
    const labels = [];
    lineElements.forEach((element, index) => {
        const wrappedRows = Math.max(1, Math.ceil(element.getBoundingClientRect().height / lineHeight - 0.01));
        labels.push(String(index + 1));
        for (let row = 1; row < wrappedRows; row++) labels.push('');
    });
    lineNumberList.textContent = labels.join('\n');
    lineNumberMirror.replaceChildren();
    lineNumberList.style.transform = `translateY(-${textarea.scrollTop}px)`;
}

function refreshVisibleLineNumbers() {
    const visibleTextarea = document.querySelector('.popup-container[data-note-field="second"] #noteInput2') ||
        document.querySelector('.popup-container:not([data-note-field="second"]) #noteInput') ||
        document.getElementById('noteInput');
    if (visibleTextarea) {
        updateLineNumbers(visibleTextarea);
    }
}

function formatDownloadTimestamp(date) {
    return [date.getHours(), date.getMinutes(), date.getSeconds()]
        .map((part) => String(part).padStart(2, '0'))
        .join('-');
}

function syncVisibleFieldNumbers(noteInputs) {
    noteInputs.forEach((textarea) => updateLineNumbers(textarea));
    refreshVisibleLineNumbers();
}

document.addEventListener('DOMContentLoaded', function() {
    const pendingSelectionKey = 'pendingSelection';
    const saveButton = document.getElementById('saveButton');
    const saveTxtButton = document.getElementById('saveTxtButton');
    const clearFieldButton = document.getElementById('clearFieldButton');
    const privacyButton = document.getElementById('privacyButton');
    const editor = document.querySelector('.editor');
    const lineNumbers = document.querySelector('.line-numbers');
    const noteInputs = [
        document.getElementById('noteInput'),
        document.getElementById('noteInput2')
    ];
    const noteFieldViewButton = document.getElementById('noteFieldViewButton');
    const cherryIcon = document.querySelector('.cherry-icon');
    const destinationLinks = [
        document.getElementById('Fullscreen'),
        document.getElementById('stickyButton'),
        document.getElementById('About')
    ];
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
    updateLineNumbers(noteInputs[0]);

    noteInputs.forEach((textarea) => {
        textarea.addEventListener('mouseenter', () => {
            if (editor.classList.contains('privacy-mode')) {
                editor.classList.add('privacy-revealed');
            }
        });
        textarea.addEventListener('mouseleave', () => {
            editor.classList.remove('privacy-revealed');
        });
    });

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
        textarea.addEventListener('input', () => updateLineNumbers(textarea));
        textarea.addEventListener('scroll', () => {
            lineNumbers.querySelector('.line-number-list').style.transform =
                `translateY(-${textarea.scrollTop}px)`;
        });
        textarea.addEventListener('keydown', () => {
            keyboardSelectionBefore.set(textarea, {
                start: textarea.selectionStart,
                end: textarea.selectionEnd
            });
        });
        const lineNumberResizeObserver = new ResizeObserver((entries) => {
            entries.forEach((entry) => updateLineNumbers(entry.target));
        });
        noteInputs.forEach((textarea) => lineNumberResizeObserver.observe(textarea));
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
            const copied = document.execCommand('copy');
            if (!copied) {
                console.error('Failed to copy selected note text to clipboard.');
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
                console.error('Could not send the selected text to the CherryPad side panel:', error);
            });
    }

    noteFieldViewButton.addEventListener('click', function() {
        activeNoteFieldIndex = activeNoteFieldIndex === 0 ? 1 : 0;
        const showingSecondField = activeNoteFieldIndex === 1;
        document.querySelector('.popup-container').dataset.noteField = showingSecondField ? 'second' : 'first';
        const activeTextarea = noteInputs[activeNoteFieldIndex];
        activeTextarea.focus({ preventScroll: true });
        activeTextarea.scrollTop = 0;
        updateLineNumbers(activeTextarea);
        noteFieldViewButton.title = `Switch note field (currently Field ${activeNoteFieldIndex + 1})`;
        updateNoteStats();
    });

    privacyButton.addEventListener('click', () => {
        const isPrivate = editor.classList.toggle('privacy-mode');
        editor.classList.remove('privacy-revealed');
        noteInputs.forEach((textarea) => {
            textarea.spellcheck = !isPrivate;
        });
        privacyButton.setAttribute('aria-pressed', String(isPrivate));
        privacyButton.querySelector('i').className = isPrivate
            ? 'fa-solid fa-eye-slash'
            : 'fa-solid fa-eye';
    });

    let clearFieldConfirmed = false;
    let clearFieldTimeout;
    clearFieldButton.addEventListener('click', () => {
        if (!clearFieldConfirmed) {
            clearFieldConfirmed = true;
            clearFieldButton.dataset.confirming = '';
            clearFieldButton.setAttribute('aria-label', 'Confirm clearing current field');
            clearFieldButton.title = 'Click again to confirm';
            clearFieldTimeout = setTimeout(() => {
                clearFieldConfirmed = false;
                delete clearFieldButton.dataset.confirming;
                clearFieldButton.removeAttribute('aria-label');
                clearFieldButton.title = 'Clear current field';
            }, 2000);
            return;
        }

        clearFieldConfirmed = false;
        clearTimeout(clearFieldTimeout);
        delete clearFieldButton.dataset.confirming;
        clearFieldButton.removeAttribute('aria-label');
        clearFieldButton.title = 'Clear current field';
        const textarea = activeNoteInput();
        textarea.value = '';
        textarea.dispatchEvent(new Event('input', { bubbles: true }));
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

        destinationLinks.forEach((link) => {
            link.addEventListener('click', () => {
                if (link.id === 'Fullscreen') saveButton.click();

                chrome.windows.getCurrent()
                    .then(({ id: windowId }) => chrome.sidePanel.close({ windowId }))
                    .catch((error) => {
                        console.error(`Could not close the CherryPad side panel after opening ${link.href}:`, error);
                    });
            });
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

// Shortcuts
document.addEventListener('keydown', function(event) {
    if (event.ctrlKey && (event.key === 's' || event.key === 'S')) {
        event.preventDefault(); 
        document.getElementById('saveButton').click(); 
    }
    if (event.ctrlKey && (event.key === 'd' || event.key === 'D')) {
        event.preventDefault(); 
        document.getElementById('saveTxtButton').click();
    }
});

document.addEventListener('DOMContentLoaded', function() {
    // load saved values from local storage
    if (localStorage.getItem('noteInput')) {
        document.getElementById('noteInput').value = localStorage.getItem('noteInput');
    }
    if (localStorage.getItem('noteInput2')) {
        document.getElementById('noteInput2').value = localStorage.getItem('noteInput2');
    }

});

function showStatusMessage(message, type) {
    const statusMessage = document.getElementById('statusMessage');
    statusMessage.textContent = message;
    statusMessage.className = `status-message status-${type}`;
}

// SAVE button click message
document.getElementById('saveButton').addEventListener('click', function() {
    
    // get current date and time
    var now = new Date();
    var formattedTime = now.toLocaleString();

    showStatusMessage('Last saved: ' + formattedTime, 'save');

    // get values
    var noteInputValue = document.getElementById('noteInput').value;
    var noteInput2Value = document.getElementById('noteInput2').value;

    // save notes
    localStorage.setItem('noteInput', noteInputValue);
    localStorage.setItem('noteInput2', noteInput2Value);
});

// COPY button click message
document.getElementById('copyButton').addEventListener('click', function() {

    // get current date and time
    var now = new Date();
    var formattedTime = now.toLocaleString();

    showStatusMessage('Copied to clipboard - ' + formattedTime, 'copy');
});

// DOWNLOAD button click message
document.getElementById('DownloadButton').addEventListener('click', function() {

    // get current date and time
    var now = new Date();
    var formattedTime = now.toLocaleString();

    showStatusMessage('Last attempted download: ' + formattedTime, 'download');
});

// PASTE button click message
document.getElementById('pasteButton').addEventListener('click', function() {

    // get current date and time
    var now = new Date();
    var formattedTime = now.toLocaleString();

    showStatusMessage('Last pasted: ' + formattedTime, 'paste');
});

document.getElementById('dashboardButton').addEventListener('click', function() {
    window.location.assign('dashboard.html');
});


// AutoSave both fields
document.addEventListener('DOMContentLoaded', function() {
    const noteInput1 = document.getElementById('noteInput');
    const noteInput2 = document.getElementById('noteInput2');

    // Load saved values from localStorage
    if (localStorage.getItem('noteInput')) {
        noteInput1.value = localStorage.getItem('noteInput');
    }
    if (localStorage.getItem('noteInput2')) {
        noteInput2.value = localStorage.getItem('noteInput2');
    }

    const lineNumberMirror = document.createElement('div');
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

    function updateLineNumbers(textarea) {
        const lineNumbers = textarea.parentElement.querySelector('.line-numbers');
        const lineNumberList = lineNumbers.querySelector('.line-number-list');
        const styles = getComputedStyle(textarea);
        const lineHeight = parseFloat(styles.lineHeight);
        const contentWidth = textarea.clientWidth - parseFloat(styles.paddingLeft) - parseFloat(styles.paddingRight);

        Object.assign(lineNumberMirror.style, {
            width: `${contentWidth}px`,
            font: styles.font,
            lineHeight: styles.lineHeight,
            letterSpacing: styles.letterSpacing,
            tabSize: styles.tabSize
        });

        const measurementFragment = document.createDocumentFragment();
        const measuredLines = textarea.value.split(/\r\n|\r|\n/).map((line) => {
            const measuredLine = document.createElement('div');
            measuredLine.textContent = line || ' ';
            measuredLine.style.whiteSpace = 'pre-wrap';
            measurementFragment.appendChild(measuredLine);
            return measuredLine;
        });
        lineNumberMirror.replaceChildren(measurementFragment);

        const wrappedRows = measuredLines.map((line) =>
            Math.max(1, Math.ceil(line.getBoundingClientRect().height / lineHeight - 0.01))
        );
        const labels = [];
        wrappedRows.forEach((rowCount, index) => {
            labels.push(String(index + 1));
            for (let row = 1; row < rowCount; row++) {
                labels.push('');
            }
        });

        lineNumberList.textContent = labels.join('\n');
        lineNumberList.style.transform = `translateY(-${textarea.scrollTop}px)`;
        lineNumberMirror.replaceChildren();
    }

    [noteInput1, noteInput2].forEach(textarea => {
        textarea.addEventListener('input', () => updateLineNumbers(textarea));
        textarea.addEventListener('scroll', () => {
            textarea.parentElement.querySelector('.line-number-list').style.transform =
                `translateY(-${textarea.scrollTop}px)`;
        });
        updateLineNumbers(textarea);
    });
    const lineNumberResizeObserver = new ResizeObserver(entries => {
        entries.forEach(entry => updateLineNumbers(entry.target));
    });
    lineNumberResizeObserver.observe(noteInput1);
    lineNumberResizeObserver.observe(noteInput2);

    // Save to localStorage on input
    function saveInput(key, element) {
        localStorage.setItem(key, element.value);
    }

    noteInput1.addEventListener('input', function() {
        saveInput('noteInput', noteInput1);
    });

    noteInput2.addEventListener('input', function() {
        saveInput('noteInput2', noteInput2);
        updateNoteStats();
    });

    let currentNoteView = 'both';

    function updateNoteStats() {
        const countedNotes = currentNoteView === 'first'
            ? [noteInput1.value]
            : currentNoteView === 'second'
                ? [noteInput2.value]
                : [noteInput1.value, noteInput2.value];
        const lineCount = countedNotes.reduce((count, value) => count + (value.length > 0 ? value.split(/\r\n|\r|\n/).length : 0), 0);
        const characterCount = countedNotes.reduce((count, value) => count + Array.from(value).length, 0);
        const wordCount = countedNotes
            .reduce((count, value) => count + (value.trim().match(/\S+/g)?.length || 0), 0);
        const currentDate = new Intl.DateTimeFormat('en-GB', {
            day: 'numeric',
            month: 'short',
            year: 'numeric'
        }).format(new Date());
        document.getElementById('fullNoteStats').textContent =
            `${lineCount} ${lineCount === 1 ? 'line' : 'lines'} · ${characterCount} ${characterCount === 1 ? 'character' : 'characters'} · ${wordCount} ${wordCount === 1 ? 'word' : 'words'} · ${currentDate}`;
    }

    noteInput1.addEventListener('input', updateNoteStats);
    updateNoteStats();

    const noteFieldViews = ['both', 'first', 'second'];
    const viewButton = document.getElementById('noteFieldViewButton');
    const viewTitles = {
        both: '',
        first: '',
        second: ''
    };
    const viewMessages = {
        both: 'Defaut View',
        first: 'Showing Note Field 1',
        second: 'Showing Note Field 2'
    };
    let currentViewIndex = 0;
    viewButton.addEventListener('click', function() {
        currentViewIndex = (currentViewIndex + 1) % noteFieldViews.length;
        const view = noteFieldViews[currentViewIndex];
        currentNoteView = view;
        document.querySelector('.container').dataset.noteView = view;
        viewButton.title = viewTitles[view];
        showStatusMessage(viewMessages[view], 'note-view');
        updateNoteStats();
    });
});

//blink logo Cherry when saving (fullscreen)
const cherryIcon = document.getElementById('logo-image');
const saveButton = document.getElementById('saveButton');

function blinkCherryIcon() {
    cherryIcon.style.filter = 'brightness(1.5)';

    setTimeout(function() {
        cherryIcon.style.filter = 'brightness(1)';
    }, 500);
}

saveButton.addEventListener('click', function() {
    blinkCherryIcon();
});

// Download .txt file button based on active window (noteInput/noteInput2)
let lastActiveTextarea = null;

document.getElementById('noteInput').addEventListener('focus', () => {
    lastActiveTextarea = document.getElementById('noteInput');
});

document.getElementById('noteInput2').addEventListener('focus', () => {
    lastActiveTextarea = document.getElementById('noteInput2');
});

document.getElementById('DownloadButton').addEventListener('click', function() {
    if (!lastActiveTextarea) return;

    const content = lastActiveTextarea.value;
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');

    a.href = url;
    const today = new Date(); // get current date for filename
    const yyyy = today.getFullYear(); // get current date for filename
    const mm = String(today.getMonth() + 1).padStart(2, '0'); // get current date for filename
    const dd = String(today.getDate()).padStart(2, '0'); // get current date for filename
    a.download = 'CherryNote ' + dd + '-' + mm + '-' + yyyy + '.txt'; // filename with date
    
    document.body.appendChild(a);
    a.click();
    
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
});

// Copy button Fullscreen
document.getElementById('noteInput').addEventListener('focus', () => {
    lastActiveTextarea = document.getElementById('noteInput');
});

document.getElementById('noteInput2').addEventListener('focus', () => {
    lastActiveTextarea = document.getElementById('noteInput2');
});

// Copy button functionality
document.addEventListener("DOMContentLoaded", function() {
    var copyButton = document.getElementById("copyButton");

    copyButton.addEventListener("click", function() {
        if (!lastActiveTextarea) return;

        lastActiveTextarea.focus();
        lastActiveTextarea.setSelectionRange(0, lastActiveTextarea.value.length);

        document.execCommand("copy");

        console.log("Text copied: " + lastActiveTextarea.value);
    });
});

// paste content on active field (Input 1&2)
document.getElementById('noteInput').addEventListener('focus', () => {
    lastActiveTextarea = document.getElementById('noteInput');
});

document.getElementById('noteInput2').addEventListener('focus', () => {
    lastActiveTextarea = document.getElementById('noteInput2');
});

document.getElementById('pasteButton').addEventListener('click', async () => {
    try {
        if (!lastActiveTextarea) return;

        const text = await navigator.clipboard.readText();
        const startPos = lastActiveTextarea.selectionStart;

        // insert the text at the cursor position
        lastActiveTextarea.setRangeText(text, startPos, startPos, 'end');
        lastActiveTextarea.dispatchEvent(new Event('input'));
        lastActiveTextarea.focus(); // ensure the textarea is focused
        lastActiveTextarea.selectionStart = startPos + text.length; // move cursor to end of pasted text
        lastActiveTextarea.selectionEnd = startPos + text.length;

        // save the updated content to localStorage
        if (lastActiveTextarea.id === 'noteInput') {
            localStorage.setItem('noteInput', lastActiveTextarea.value);
        } else if (lastActiveTextarea.id === 'noteInput2') {
            localStorage.setItem('noteInput2', lastActiveTextarea.value);
        }
    } catch (err) {
        console.error('Failed to read clipboard contents: ', err);
    }
});

document.getElementById('noteInput').addEventListener('keydown', (e) => {
    if (e.ctrlKey && e.key === 'z') {
        const textarea = document.getElementById('noteInput');
        const pastedContent = JSON.parse(textarea.dataset.lastPastedContent || '{}');

        if (pastedContent.text) {
            // calculate the end position of the pasted content
            const endPos = pastedContent.startPos + pastedContent.text.length;

            // remove the pasted content
            textarea.setRangeText('', pastedContent.startPos, endPos, 'end');

            // prevent the default undo behavior
            e.preventDefault();
        }
    }
});

//version buttton

// when you click the version button - a message should appear (noteinput 2)
document.addEventListener('DOMContentLoaded', function() {   //1.5.0 fix
    const versionButton = document.getElementById('versionButton');
    const noteInput = document.getElementById('noteInput2');

    if (versionButton && noteInput) {
        versionButton.addEventListener('click', function() {
            const textToToggle = " 🍒 Something interesting is happening... Keep going! 🍒 ";
            const textWithNewline = textToToggle + '\n\n';
            const currentValue = noteInput.value;

            if (currentValue.startsWith(textWithNewline)) {
                // Remove the text and its newline if it's already at the top
                noteInput.value = currentValue.replace(textWithNewline, '');
            } else {
                // Add the text to the top with a newline
                noteInput.value = textWithNewline + currentValue;
            }
            noteInput.dispatchEvent(new Event('input'));
        });
    }
});

// versionButton eastereggclick -> redirect
let clickCount = 0;

document.addEventListener('DOMContentLoaded', function() {
    const versionButton = document.getElementById('versionButton');

    versionButton.addEventListener('click', function() {
        clickCount++;

        if (clickCount === 5) {
            window.location.href = 'hidden.html';
        }
    });
});

// emoji panel

// emoji panel display on hover 1.5.2
document.addEventListener('DOMContentLoaded', function() {
    const emojiButton = document.getElementById('emojiButton');
    const emojiPanel = document.getElementById('emojiPanel');
    const buttonsToClose = document.querySelectorAll('.button:not(#emojiButton)');

    // open emoji panel when hovering over emoji button
    emojiButton.addEventListener('mouseenter', function() {
        emojiPanel.style.display = 'block';
    });

    // close emoji panel when hovering over other buttons
    buttonsToClose.forEach(function(button) {
        button.addEventListener('mouseenter', function() {
            emojiPanel.style.display = 'none';
        });
    });

    // no collapsing when hovering overpanel
    emojiPanel.addEventListener('mouseenter', function() {
        emojiPanel.style.display = 'block';
    });
});

// prevent notefield focus flashing when pressing a emoji   
document.querySelectorAll(".emoji").forEach(button => {
    button.addEventListener("mousedown", e => {
        e.preventDefault();
    });
});

// emoji panel functionality
document.addEventListener('DOMContentLoaded', function() {
    const emojiButton = document.getElementById('emojiButton');
    const emojiPanel = document.getElementById('emojiPanel');
    const noteInput1 = document.getElementById('noteInput');
    const noteInput2 = document.getElementById('noteInput2');
    let activeInput = null; // track the currently active input

    // Focusing on the input fields
    noteInput1.addEventListener('focus', function() {
        activeInput = noteInput1;
    });

    noteInput2.addEventListener('focus', function() {
        activeInput = noteInput2;
    });

    emojiButton.addEventListener('click', function(event) {
        // Prevent the click from propagating to the document event listener
        event.stopPropagation();
        emojiPanel.style.display = emojiPanel.style.display === 'block' ? 'none' : 'block';
    });

    emojiPanel.addEventListener('click', function(event) {
        if (event.target.classList.contains('emoji')) {
            // Ensure that an active input is selected
            if (activeInput) {
                insertAtCursor(activeInput, event.target.textContent);
                // Save to localStorage after inserting emoji
                if (activeInput === noteInput1) {
                    localStorage.setItem('noteInput', activeInput.value);
                } else if (activeInput === noteInput2) {
                    localStorage.setItem('noteInput2', activeInput.value);
                }
            }
        }
    });

    document.addEventListener('click', function(event) {
        if (!emojiButton.contains(event.target) && !emojiPanel.contains(event.target)) {
            emojiPanel.style.display = 'none';
        }
    });

    function insertAtCursor(input, textToInsert) {
        const startPos = input.selectionStart;
        const endPos = input.selectionEnd;
        const beforeValue = input.value.substring(0, startPos);
        const afterValue = input.value.substring(endPos, input.value.length);
        input.value = beforeValue + textToInsert + afterValue;
        // Move the cursor to the end
        input.selectionStart = input.selectionEnd = startPos + textToInsert.length;
        // Refocus the textarea after inserting
        input.focus();
    }
});



        //Bottom Buttons CherryPad.html
        document.addEventListener('DOMContentLoaded', function() { 
            // go to WebStore
            document.getElementById('WebStoreButton').addEventListener('click', function() {
                window.open('https://chromewebstore.google.com/detail/cherrypad/fhneekooapbagkckacdlemielahijgfd', '_blank');
            });
            // go to Github 
            document.getElementById('GithubButton').addEventListener('click', function() {
                window.open('https://github.com/cafali/CherryPad', '_blank');
            });
            // go to About
            document.getElementById('AboutButton').addEventListener('click', function() {
                window.location.href = 'about.html';
            });
        });
        
        //Clear Notes + Ask user (browser popup)
        clearButton2.addEventListener('click', function() {
            if (confirm("This action will erase your note. Are you sure you want to proceed?")) {
                noteInput2.value = '';
                noteInput2.dispatchEvent(new Event('input'));
                localStorage.setItem('note2', '');
                document.getElementById('saveButton').click(); 
            }
        });
        
        clearButton.addEventListener('click', function() {
            if (confirm("This action will erase your note. Are you sure you want to proceed?")) {
                noteInput.value = '';
                noteInput.dispatchEvent(new Event('input'));
                localStorage.setItem('note', '');
                document.getElementById('saveButton').click(); 
            }
        });
        
//CherryLogo message fullscreen when click
const logoImage = document.getElementById('logo-image');

logoImage.addEventListener('click', function () {
    window.location.href = "hidden.html";
});

//keyboard shortcuts fullscreen

//CTRL+E for Emoji Panel
document.addEventListener('keydown', function(event) {
    if (event.ctrlKey && (event.key === 'e' || event.key === 'E')) {
        event.preventDefault(); 
        document.getElementById('emojiButton').click(); 
    }
});

//Ctrl+S for SAVE
document.addEventListener('keydown', function(event) {
    if (event.ctrlKey && (event.key === 's' || event.key === 'S')) {
        event.preventDefault(); 
        document.getElementById('saveButton').click();
    }
});

//CTRL+D Download 
document.addEventListener('keydown', function(event) {
    if (event.ctrlKey && (event.key === 'd' || event.key === 'D')) {
        event.preventDefault(); 
        document.getElementById('DownloadButton').click(); 
    }
});


// version button hover and click message 1.5.9
const versionButton = document.getElementById("versionButton");

const emojis = [
  "../icon/cherrypad.png",
];

function spawnEmojiParticles() {
  const rect = versionButton.getBoundingClientRect();
  const centerX = rect.left + rect.width / 2;
  const centerY = rect.top + rect.height / 2;

  for (let i = 0; i < 10; i++) {
    const img = document.createElement("img");
    img.className = "emoji-particle";

    img.src = emojis[Math.floor(Math.random() * emojis.length)];
    img.style.width = "25px";
    img.style.height = "25px";

    const angle = Math.random() * Math.PI * 2;
    const distance = 90 + Math.random() * 120;

    img.style.left = centerX + "px";
    img.style.top = centerY + "px";

    img.style.setProperty("--dx", Math.cos(angle) * distance + "px");
    img.style.setProperty("--dy", Math.sin(angle) * distance + "px");

    // random spin
    const rotation = (Math.random() * 720 - 360) + "deg";
    img.style.setProperty("--rot", rotation);

    document.body.appendChild(img);

    setTimeout(() => img.remove(), 900);
  }
}

versionButton.addEventListener("mouseenter", spawnEmojiParticles);
versionButton.addEventListener("click", spawnEmojiParticles);

// Privacy Mode 1.5.9

const privacyButton = document.getElementById("privacyButton");
let privacyEnabled = false;

const wrappers = document.querySelectorAll(".textarea-wrapper");

wrappers.forEach(wrapper => {

    const textarea = wrapper.querySelector("textarea");
    const overlay = wrapper.querySelector(".privacy-overlay");

    textarea.addEventListener("mouseenter", () => {
        if (privacyEnabled) {
            textarea.style.color = "white";
            textarea.style.textShadow = "none";
            overlay.style.opacity = "0";
        }
    });

    textarea.addEventListener("mouseleave", () => {
        if (privacyEnabled) {
            textarea.style.color = "transparent";
            textarea.style.textShadow = "0 0 10px #ffffff69";
            overlay.style.opacity = "1";
        }
    });

});

privacyButton.addEventListener("click", () => {

    privacyEnabled = !privacyEnabled;

    wrappers.forEach(wrapper => {

        const textarea = wrapper.querySelector("textarea");
        const overlay = wrapper.querySelector(".privacy-overlay");

if (privacyEnabled) {
    textarea.style.color = "transparent";
    textarea.style.textShadow = "0 0 10px #ffffff69";
    textarea.style.caretColor = "white";
    textarea.style.transition = "text-shadow 0.2s ease";

    textarea.classList.add("privacy-lock");
    overlay.style.opacity = "1";

    // disable spellcheck while privacy is on
    textarea.spellcheck = false;

    // clear any existing selection
    textarea.blur();
    textarea.setSelectionRange(0, 0);
    window.getSelection().removeAllRanges();
} else {
    textarea.style.color = "";
    textarea.style.textShadow = "";
    textarea.style.caretColor = "";

    textarea.classList.remove("privacy-lock");
    overlay.style.opacity = "0";

    // re-enable spellcheck when privacy is off
    textarea.spellcheck = true;
}

    });

    const icon = privacyButton.querySelector("i");

    if (privacyEnabled) {
        icon.classList.remove("fa-eye");
        icon.classList.add("fa-eye-slash");
    } else {
        icon.classList.remove("fa-eye-slash");
        icon.classList.add("fa-eye");
    }

    showStatusMessage(`Privacy Mode ${privacyEnabled ? "ON" : "OFF"}`, 'privacy');

});


/* Block CTRL+A while privacy mode is active */

document.addEventListener("keydown", (e) => {

    if (!privacyEnabled) return;

    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "a") {
        e.preventDefault();
    }

});


// Temporarily disable privacy mode to allow copying when COPY button is clicked

const copyButton = document.getElementById("copyButton");

copyButton.addEventListener("click", (e) => {
    if (privacyEnabled) {
        // temporarily disable privacy
        privacyButton.click();
        // delay to let styles update before copying
        setTimeout(() => {
            copyButton.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
        }, 10);
        e.stopImmediatePropagation(); 
    }
});

// logo fadeout on button overlap

const logo = document.querySelector('.logo-container');
const buttons = document.querySelectorAll('.buttons-container .button');

function isOverlapping(a, b) {
    const r1 = a.getBoundingClientRect();
    const r2 = b.getBoundingClientRect();

    return !(
        r1.right < r2.left ||
        r1.left > r2.right ||
        r1.bottom < r2.top ||
        r1.top > r2.bottom
    );
}

function checkOverlap() {
    let overlap = false;

    buttons.forEach(btn => {
        if (isOverlapping(logo, btn)) {
            overlap = true;
        }
    });

    logo.style.opacity = overlap ? "0" : "1";
}

window.addEventListener("resize", checkOverlap);
window.addEventListener("load", checkOverlap);


// symbol panel

// symbol panel display on hover 1.6.2
document.addEventListener('DOMContentLoaded', function() {
    const symbolButton = document.getElementById('symbolButton');
    const symbolPanel = document.getElementById('symbolPanel');
    const buttonsToClose = document.querySelectorAll('.button:not(#symbolButton)');

    // open symbol panel when hovering over symbol button
    symbolButton.addEventListener('mouseenter', function() {
        symbolPanel.style.display = 'block';
    });

    // close symbol panel when hovering over other buttons
    buttonsToClose.forEach(function(button) {
        button.addEventListener('mouseenter', function() {
            symbolPanel.style.display = 'none';
        });
    });

    // no collapsing when hovering overpanel
    symbolPanel.addEventListener('mouseenter', function() {
        symbolPanel.style.display = 'block';
    });
});

// prevent notefield focus flashing when pressing a symbol 
document.querySelectorAll(".symbol").forEach(button => {
    button.addEventListener("mousedown", e => {
        e.preventDefault();
    });
});

// symbol panel functionality 1.6.2
document.addEventListener('DOMContentLoaded', function() {
    const symbolButton = document.getElementById('symbolButton');
    const symbolPanel = document.getElementById('symbolPanel');
    const noteInput1 = document.getElementById('noteInput');
    const noteInput2 = document.getElementById('noteInput2');
    let activeInput = null; // track the currently active input

    // Focusing on the input fields
    noteInput1.addEventListener('focus', function() {
        activeInput = noteInput1;
    });

    noteInput2.addEventListener('focus', function() {
        activeInput = noteInput2;
    });

    symbolButton.addEventListener('click', function(event) {
        // Prevent the click from propagating to the document event listener
        event.stopPropagation();
        symbolPanel.style.display = symbolPanel.style.display === 'block' ? 'none' : 'block';
    });

    symbolPanel.addEventListener('click', function(event) {
        if (event.target.classList.contains('symbol')) {
            // Ensure that an active input is selected
            if (activeInput) {
                insertAtCursor(activeInput, event.target.textContent);
                // Save to localStorage after inserting symbol
                if (activeInput === noteInput1) {
                    localStorage.setItem('noteInput', activeInput.value);
                } else if (activeInput === noteInput2) {
                    localStorage.setItem('noteInput2', activeInput.value);
                }
            }
        }
    });

    document.addEventListener('click', function(event) {
        if (!symbolButton.contains(event.target) && !symbolPanel.contains(event.target)) {
            symbolPanel.style.display = 'none';
        }
    });

    function insertAtCursor(input, textToInsert) {
        const startPos = input.selectionStart;
        const endPos = input.selectionEnd;
        const beforeValue = input.value.substring(0, startPos);
        const afterValue = input.value.substring(endPos, input.value.length);
        input.value = beforeValue + textToInsert + afterValue;
        input.dispatchEvent(new Event('input'));
        // Move the cursor to the end
        input.selectionStart = input.selectionEnd = startPos + textToInsert.length;
        // Refocus the textarea after inserting
        input.focus();
    }
});


// Virtual Keyboard 1.6.2

// Virtual keyboard panel controls
document.addEventListener('DOMContentLoaded', function() {
    const vkeyButton = document.getElementById('vkeyButton');
    const vkeyPanel = document.getElementById('vkeyPanel');
    const pinButton = document.getElementById('vkeyPinButton');
    const pinLabel = document.getElementById('vkeyPinLabel');
    const closeButton = document.getElementById('vkeyCloseButton');
    const buttonsToClose = document.querySelectorAll('.button:not(#vkeyButton)');
    let isPinned = false;

    closeButton.addEventListener('click', function(event) {
        event.stopPropagation();
        vkeyPanel.style.display = 'none';
    });

    pinButton.addEventListener('click', function(event) {
        event.stopPropagation();
        isPinned = !isPinned;
        pinLabel.textContent = isPinned ? 'UNPIN' : 'PIN';
        pinButton.setAttribute('aria-pressed', String(isPinned));
        pinButton.setAttribute('aria-label', isPinned ? 'Unpin virtual keyboard' : 'Pin virtual keyboard');
        pinButton.title = isPinned ? 'Unpin virtual keyboard' : 'Pin virtual keyboard';
    });

    // close virtual keyboard panel when hovering over other buttons
    buttonsToClose.forEach(function(button) {
        button.addEventListener('mouseenter', function() {
            if (!isPinned) {
                vkeyPanel.style.display = 'none';
            }
        });
    });

});

// vkey panel functionality 1.6.2
document.addEventListener('DOMContentLoaded', function() {
    const vkeyButton = document.getElementById('vkeyButton');
    const vkeyPanel = document.getElementById('vkeyPanel');
    const noteInput1 = document.getElementById('noteInput');
    const noteInput2 = document.getElementById('noteInput2');
    let activeInput = null; // track the currently active input
    let capsLockEnabled = true;
    const graphemeSegmenter = new Intl.Segmenter(undefined, { granularity: 'grapheme' });

    // Focusing on the input fields
    noteInput1.addEventListener('focus', function() {
        activeInput = noteInput1;
    });

    noteInput2.addEventListener('focus', function() {
        activeInput = noteInput2;
    });

    vkeyButton.addEventListener('click', function(event) {
        // Prevent the click from propagating to the document event listener
        event.stopPropagation();
        vkeyPanel.style.display = vkeyPanel.style.display === 'block' ? 'none' : 'block';
    });

    vkeyPanel.addEventListener('click', function(event) {
        const key = event.target.closest('.vkey');
        if (!key) return;

        const action = key.dataset.action;
        if (action === 'capslock') {
            capsLockEnabled = !capsLockEnabled;
            vkeyPanel.querySelectorAll('.letter-key').forEach(letterKey => {
                const letter = letterKey.dataset.letter;
                letterKey.textContent = capsLockEnabled ? letter.toUpperCase() : letter;
            });
            key.setAttribute('aria-pressed', String(capsLockEnabled));
            return;
        }

        if (!activeInput) return;

        if (action) {
            applyEditingAction(activeInput, action);
        } else {
            insertAtCursor(activeInput, key.textContent);
        }

        if (activeInput === noteInput1) {
            localStorage.setItem('noteInput', activeInput.value);
        } else if (activeInput === noteInput2) {
            localStorage.setItem('noteInput2', activeInput.value);
        }
    });

    document.addEventListener('click', function(event) {
        if (!symbolButton.contains(event.target) && !symbolPanel.contains(event.target)) {
            symbolPanel.style.display = 'none';
        }
    });

    function insertAtCursor(input, textToInsert) {
        const startPos = input.selectionStart;
        const endPos = input.selectionEnd;
        const beforeValue = input.value.substring(0, startPos);
        const afterValue = input.value.substring(endPos, input.value.length);
        input.value = beforeValue + textToInsert + afterValue;
        // Move the cursor to the end
        input.selectionStart = input.selectionEnd = startPos + textToInsert.length;
        // Refocus the textarea after inserting
        input.focus();
    }

    function applyEditingAction(input, action) {
        const start = input.selectionStart;
        const end = input.selectionEnd;

        if (action === 'left' || action === 'right') {
            const position = start !== end
                ? (action === 'left' ? start : end)
                : (action === 'left'
                    ? getPreviousGraphemeBoundary(input.value, start)
                    : getNextGraphemeBoundary(input.value, end));
            input.setSelectionRange(position, position);
        } else if (action === 'space') {
            input.setRangeText(' ', start, end, 'end');
        } else if (action === 'enter') {
            input.setRangeText('\n', start, end, 'end');
        } else if (action === 'backspace') {
            const deleteStart = start === end
                ? getPreviousGraphemeBoundary(input.value, start)
                : start;
            input.setRangeText('', deleteStart, end, 'end');
        }

        input.focus();
    }

    function getPreviousGraphemeBoundary(value, position) {
        let boundary = 0;
        for (const { index } of graphemeSegmenter.segment(value)) {
            if (index >= position) break;
            boundary = index;
        }
        return boundary;
    }

    function getNextGraphemeBoundary(value, position) {
        for (const { index, segment } of graphemeSegmenter.segment(value)) {
            const boundary = index + segment.length;
            if (boundary > position) return boundary;
        }
        return value.length;
    }
});


// drag vkey panel 1.6.2
const panel = document.querySelector('.vkeyPanel');

let isDragging = false;
let offsetX, offsetY;

panel.addEventListener('mousedown', (e) => {
    if (e.target.closest('button')) return;

    isDragging = true;

    offsetX = e.clientX - panel.offsetLeft;
    offsetY = e.clientY - panel.offsetTop;

    document.body.style.userSelect = 'none';
});

document.addEventListener('mousemove', (e) => {
    if (!isDragging) return;

    panel.style.left = (e.clientX - offsetX) + 'px';
    panel.style.top = (e.clientY - offsetY) + 'px';
});

document.addEventListener('mouseup', () => {
    isDragging = false;
    document.body.style.userSelect = '';
});

// prevent notefield focus flashing when pressing a vkey
document.querySelectorAll(".vkey").forEach(button => {
    button.addEventListener("mousedown", e => {
        e.preventDefault();
    });
});

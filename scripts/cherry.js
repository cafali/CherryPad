document.addEventListener('DOMContentLoaded', function() {
    // load saved values from local storage
    if (localStorage.getItem('noteInput')) {
        document.getElementById('noteInput').value = localStorage.getItem('noteInput');
    }
    if (localStorage.getItem('noteInput2')) {
        document.getElementById('noteInput2').value = localStorage.getItem('noteInput2');
    }

});

// SAVE button click message
document.getElementById('saveButton').addEventListener('click', function() {
    
    // get current date and time
    var now = new Date();
    var formattedTime = now.toLocaleString();

    // hide copy & download message
    document.getElementById('lastCopied').textContent = '';
    document.getElementById('lastDownload').textContent = '';
    document.getElementById('lastPasted').textContent = '';

    // show save message
    document.getElementById('lastSaved').textContent = 'Last saved: ' + formattedTime;

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

    // hide save & download message
    document.getElementById('lastSaved').textContent = '';
    document.getElementById('lastDownload').textContent = '';
    document.getElementById('lastPasted').textContent = '';

    // show copy message
    document.getElementById('lastCopied').textContent = 'Copied to clipboard - '  + formattedTime;
});

// DOWNLOAD button click message
document.getElementById('DownloadButton').addEventListener('click', function() {

    // get current date and time
    var now = new Date();
    var formattedTime = now.toLocaleString();

    // hide save & copy message
    document.getElementById('lastSaved').textContent = '';
    document.getElementById('lastCopied').textContent = '';
    document.getElementById('lastPasted').textContent = '';

    // show download message
    document.getElementById('lastDownload').textContent = 'Last attempted download: ' + formattedTime;
});

// PASTE button click message
document.getElementById('pasteButton').addEventListener('click', function() {

    // get current date and time
    var now = new Date();
    var formattedTime = now.toLocaleString();

    // hide save & copy message
    document.getElementById('lastSaved').textContent = '';
    document.getElementById('lastCopied').textContent = '';
    document.getElementById('lastDownload').textContent = '';

    // show paste message
    document.getElementById('lastPasted').textContent = 'Last pasted: ' + formattedTime;
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

    // Save to localStorage on input
    function saveInput(key, element) {
        localStorage.setItem(key, element.value);
    }

    noteInput1.addEventListener('input', function() {
        saveInput('noteInput', noteInput1);
    });

    noteInput2.addEventListener('input', function() {
        saveInput('noteInput2', noteInput2);
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
                localStorage.setItem('note2', '');
                document.getElementById('saveButton').click(); 
            }
        });
        
        clearButton.addEventListener('click', function() {
            if (confirm("This action will erase your note. Are you sure you want to proceed?")) {
                noteInput.value = '';
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

//Ctrl+S for SAVE
document.addEventListener('keydown', function(event) {
    if (event.ctrlKey && (event.key === 's' || event.key === 'S')) {
        event.preventDefault(); 
        document.getElementById('saveButton').click();
    }
});

//CTRL+E for Emoji Panel
document.addEventListener('keydown', function(event) {
    if (event.ctrlKey && (event.key === 'e' || event.key === 'E')) {
        event.preventDefault(); 
        document.getElementById('emojiButton').click(); 
    }
});

//CTRL+D Download 
document.addEventListener('keydown', function(event) {
    if (event.ctrlKey && (event.key === 'd' || event.key === 'D')) {
        event.preventDefault(); 
        document.getElementById('DownloadButton').click(); 
    }
});

/*
  CHERRY.JS
  Manages CherryPad's core features including note saving/loading, autosave, emoji panel, 
  copy/paste functionality, version control easter egg, and keyboard shortcuts (save, emoji, download).
*/


// search bar functionality test

const searchButton = document.getElementById("searchButton");
const searchBar = document.getElementById("searchBar");
const searchInput = document.getElementById("searchInput");
const nextBtn = document.getElementById("nextResult");
const prevBtn = document.getElementById("prevResult");
const closeBtn = document.getElementById("closeSearch");
const resultCount = document.getElementById("resultCount");

const fields = [
    { textarea: document.getElementById("noteInput"), overlay: document.getElementById("overlay1") },
    { textarea: document.getElementById("noteInput2"), overlay: document.getElementById("overlay2") }
];

let matches = [];
let currentIndex = -1;

searchButton.onclick = () => {
    searchBar.style.display = "flex";
    searchInput.focus();
};

closeBtn.onclick = () => {
    searchBar.style.display = "none";
    clearHighlights();
};

function clearHighlights() {
    matches = [];
    currentIndex = -1;
    fields.forEach(f => f.overlay.innerHTML = f.textarea.value);
    resultCount.textContent = "";
}

function escapeHTML(str) {
    return str.replace(/&/g, "&amp;")
              .replace(/</g, "&lt;")
              .replace(/>/g, "&gt;");
}

function performSearch() {
    clearHighlights();
    const query = searchInput.value;
    if (!query) return;

    const regex = new RegExp(query, "gi");

    matches = [];

    fields.forEach(f => {
        const text = f.textarea.value;
        let html = escapeHTML(text).replace(regex, match => {
            matches.push({ overlay: f.overlay, matchText: match });
            return `<span class="highlight">${match}</span>`;
        });
        f.overlay.innerHTML = html;
    });

    if (matches.length > 0) {
        currentIndex = 0;
        updateActive();
    }

    resultCount.textContent = matches.length > 0 ? `${currentIndex + 1} / ${matches.length}` : "0 results";
}

function updateActive() {
    document.querySelectorAll(".highlight").forEach(el => el.classList.remove("active"));
    if (matches[currentIndex]) {
        const overlays = matches[currentIndex].overlay.querySelectorAll(".highlight");
        overlays[0].classList.add("active");
        overlays[0].scrollIntoView({ behavior: "smooth", block: "center" });
        resultCount.textContent = `${currentIndex + 1} / ${matches.length}`;
    }
}

function nextResult() {
    if (!matches.length) return;
    currentIndex++;
    if (currentIndex >= matches.length) currentIndex = 0;
    updateActive();
}

function prevResult() {
    if (!matches.length) return;
    currentIndex--;
    if (currentIndex < 0) currentIndex = matches.length - 1;
    updateActive();
}

searchInput.addEventListener("input", performSearch);
searchInput.addEventListener("keydown", e => { if (e.key === "Enter") nextResult(); });
nextBtn.onclick = nextResult;
prevBtn.onclick = prevResult;
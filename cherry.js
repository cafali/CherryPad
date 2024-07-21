document.addEventListener('DOMContentLoaded', function() {
    // Load saved values from local storage
    if (localStorage.getItem('noteInput')) {
        document.getElementById('noteInput').value = localStorage.getItem('noteInput');
    }
    if (localStorage.getItem('noteInput2')) {
        document.getElementById('noteInput2').value = localStorage.getItem('noteInput2');
    }

    // Save button click
    document.getElementById('saveButton').addEventListener('click', function() {
        // Get current date and time
        var now = new Date();
        var formattedTime = now.toLocaleString();

        // Update last saved time in the footer
        document.getElementById('lastSaved').textContent = 'Last saved: ' + formattedTime;

        // Get values from noteInput and noteInput2
        var noteInputValue = document.getElementById('noteInput').value;
        var noteInput2Value = document.getElementById('noteInput2').value;

        // Save values to local storage
        localStorage.setItem('noteInput', noteInputValue);
        localStorage.setItem('noteInput2', noteInput2Value);
    });
});



 
// Copy Button
document.addEventListener("DOMContentLoaded", function() {
    // Get the copy button
    var copyButton = document.getElementById("copyButton");

    // Get the textarea containing the text to copy
    var noteInput = document.getElementById("noteInput");

    // Add click event listener to the copy button
    copyButton.addEventListener("click", function() {
        // Select the text inside the textarea
        noteInput.focus(); // Ensure textarea is focused
        noteInput.setSelectionRange(0, noteInput.value.length); // Select all text

        // Copy the selected text to the clipboard
        document.execCommand("copy");

        // Log a message to indicate the text has been copied (optional)
        console.log("Text copied: " + noteInput.value);
    });
});


document.getElementById('pasteButton').addEventListener('click', async () => {
    try {
        const text = await navigator.clipboard.readText();
        const textarea = document.getElementById('noteInput');
        
        // Track the current value and selection start position
        const previousValue = textarea.value;
        const startPos = textarea.selectionStart;
        
        // Insert the pasted text at the cursor position
        textarea.setRangeText(text, startPos, startPos, 'end');

        // Store the pasted content and its position for undo
        const pastedContent = {
            text: text,
            startPos: startPos
        };
        textarea.dataset.lastPastedContent = JSON.stringify(pastedContent);

    } catch (err) {
        console.error('Failed to read clipboard contents: ', err);
    }
});

document.getElementById('noteInput').addEventListener('keydown', (e) => {
    if (e.ctrlKey && e.key === 'z') {
        const textarea = document.getElementById('noteInput');
        const pastedContent = JSON.parse(textarea.dataset.lastPastedContent || '{}');

        if (pastedContent.text) {
            // Calculate the end position of the pasted content
            const endPos = pastedContent.startPos + pastedContent.text.length;

            // Remove the pasted content
            textarea.setRangeText('', pastedContent.startPos, endPos, 'end');

            // Prevent the default undo behavior
            e.preventDefault();
        }
    }
});


document.addEventListener('DOMContentLoaded', function() {
    const versionButton = document.getElementById('versionButton');
    const noteInput = document.getElementById('noteInput');

    if (versionButton && noteInput) {
        versionButton.addEventListener('click', function() {
            if (!noteInput.value.includes('🍒 Hi')) {
                noteInput.value += '🍒 Hi';
            }
        });
    }
});

        // Emoji panel functionality
        document.addEventListener('DOMContentLoaded', function() {
            const emojiButton = document.getElementById('emojiButton');
            const emojiPanel = document.getElementById('emojiPanel');
            const noteInput = document.getElementById('noteInput');

            emojiButton.addEventListener('click', function(event) {
                // Prevent the click from propagating to the document event listener
                event.stopPropagation();
                emojiPanel.style.display = emojiPanel.style.display === 'block' ? 'none' : 'block';
            });

            emojiPanel.addEventListener('click', function(event) {
                if (event.target.classList.contains('emoji')) {
                    insertAtCursor(noteInput, event.target.textContent);
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
                // Move the cursor to the end of the inserted text
                input.selectionStart = input.selectionEnd = startPos + textToInsert.length;
                // Refocus the textarea after inserting
                input.focus();
            }
        });




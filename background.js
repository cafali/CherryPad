const SEND_TO_CHERRYPAD_MENU_ID = "send-to-cherrypad";
const PENDING_SELECTION_KEY = "pendingSelection";

chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.removeAll(() => {
    if (chrome.runtime.lastError) {
      console.error("Could not reset CherryPad context menus:", chrome.runtime.lastError.message);
      return;
    }

    chrome.contextMenus.create({
      id: SEND_TO_CHERRYPAD_MENU_ID,
      title: "Send to CherryPad",
      contexts: ["selection"]
    }, () => {
      if (chrome.runtime.lastError) {
        console.error("Could not create the CherryPad context menu:", chrome.runtime.lastError.message);
      }
    });
  });
});

chrome.contextMenus.onClicked.addListener((info) => {
  if (info.menuItemId !== SEND_TO_CHERRYPAD_MENU_ID) return;

  const selectedText = info.selectionText;
  if (typeof selectedText !== "string" || !selectedText.trim()) return;

  chrome.storage.local.set({ [PENDING_SELECTION_KEY]: selectedText })
    .then(() => chrome.action.openPopup())
    .catch((error) => {
      console.error("Could not open the CherryPad popup with the selected text:", error);
      chrome.storage.local.remove(PENDING_SELECTION_KEY).catch((cleanupError) => {
        console.error("Could not clear the pending CherryPad selection:", cleanupError);
      });
    });
});

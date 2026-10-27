(function () {
  'use strict';

  const STORAGE_KEY = 'cherrypad.board.v1';
  const BOARD_WIDTH = 6400;
  const BOARD_HEIGHT = 4400;
  const MIN_ZOOM = 0.4;
  const MAX_ZOOM = 1.6;
  const NOTE_COLORS = ['#f8df85', '#f4b8b8', '#b9dfc2', '#b9d6f1', '#ddc3ed', '#f3c89e'];
  const boardViewport = document.getElementById('boardViewport');
  const boardWorld = document.getElementById('boardWorld');
  const SVG_NS = 'http://www.w3.org/2000/svg';
  const connectionLayer = document.createElementNS(SVG_NS, 'svg');
  connectionLayer.classList.add('connection-layer');
  boardWorld.appendChild(connectionLayer);
  const noteCount = document.getElementById('noteCount');
  const saveStatus = document.getElementById('saveStatus');
  const importInput = document.getElementById('importInput');
  const model = { notes: [], connections: [], x: 0, y: 0, zoom: 1, currentNoteId: null, selectedNoteId: null, saveTimer: null, statusTimer: null, drag: null, pendingNoteDrag: null };

  function setStatus(message, isError) {
    window.clearTimeout(model.statusTimer);
    saveStatus.textContent = message;
    saveStatus.classList.toggle('has-error', Boolean(isError));
    if (!isError && message !== 'All changes saved') {
      model.statusTimer = window.setTimeout(function () {
        saveStatus.textContent = 'All changes saved';
      }, 1800);
    }
  }

  function selectNote(noteId) {
    model.selectedNoteId = noteId;
    boardWorld.querySelectorAll('.sticky-note').forEach(function (card) {
      card.classList.toggle('is-selected', card.dataset.noteId === noteId);
    });
    updateConnectionPorts();
  }

  function updateView() {
    boardWorld.style.transform = `translate(${model.x}px, ${model.y}px) scale(${model.zoom})`;
  }

  function centerBoard() {
    const rect = boardViewport.getBoundingClientRect();
    model.x = (rect.width - BOARD_WIDTH * model.zoom) / 2;
    model.y = (rect.height - BOARD_HEIGHT * model.zoom) / 2;
    updateView();
  }

  function saveBoard() {
    window.clearTimeout(model.saveTimer);
    model.saveTimer = window.setTimeout(function () {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify({
          version: 1,
          notes: model.notes,
          connections: model.connections,
          camera: { x: model.x, y: model.y, zoom: model.zoom }
        }));
        setStatus('All changes saved');
      } catch (error) {
        console.error('Unable to save the CherryPad board.', error);
        setStatus('Could not save changes', true);
      }
    }, 250);
  }

  function updateCount() {
    const count = model.notes.length;
    noteCount.textContent = `${count} ${count === 1 ? 'note' : 'notes'}`;
  }

  function formatDate(timestamp) {
    return new Intl.DateTimeFormat(undefined, { month: 'short', day: 'numeric' }).format(new Date(timestamp));
  }

  function getPortPosition(note, side) {
    if (side === 'top') return { x: note.x + note.width / 2, y: note.y };
    if (side === 'right') return { x: note.x + note.width, y: note.y + note.height / 2 };
    if (side === 'bottom') return { x: note.x + note.width / 2, y: note.y + note.height };
    return { x: note.x, y: note.y + note.height / 2 };
  }

  function getConnectionGeometry(from, fromSide, to, toSide) {
    const start = getPortPosition(from, fromSide);
    const end = getPortPosition(to, toSide);
    const curve = Math.max(50, Math.hypot(end.x - start.x, end.y - start.y) * 0.4);
    const direction = {
      top: { x: 0, y: -1 },
      right: { x: 1, y: 0 },
      bottom: { x: 0, y: 1 },
      left: { x: -1, y: 0 }
    };
    const startDirection = direction[fromSide];
    const endDirection = direction[toSide];
    const control1 = { x: start.x + startDirection.x * curve, y: start.y + startDirection.y * curve };
    const control2 = { x: end.x + endDirection.x * curve, y: end.y + endDirection.y * curve };
    const midpoint = {
      x: (start.x + 3 * control1.x + 3 * control2.x + end.x) / 8,
      y: (start.y + 3 * control1.y + 3 * control2.y + end.y) / 8
    };
    return {
      path: `M ${start.x} ${start.y} C ${control1.x} ${control1.y}, ${control2.x} ${control2.y}, ${end.x} ${end.y}`,
      start: start,
      end: end,
      midpoint: midpoint
    };
  }

  function updateConnectionPorts() {
    const connectedPorts = new Set();
    model.connections.forEach(function (connection) {
      connectedPorts.add(`${connection.from.noteId}:${connection.from.side}`);
      connectedPorts.add(`${connection.to.noteId}:${connection.to.side}`);
    });

    boardWorld.querySelectorAll('.connection-port').forEach(function (port) {
      const card = port.closest('.sticky-note');
      const visible = card && (
        model.drag && model.drag.type === 'connection'
        || card.dataset.noteId === model.selectedNoteId
        || connectedPorts.has(`${card.dataset.noteId}:${port.dataset.side}`)
      );
      port.classList.toggle('is-visible', Boolean(visible));
      port.tabIndex = visible ? 0 : -1;
    });
  }

  function removeConnection(connectionId) {
    model.connections = model.connections.filter(function (connection) { return connection.id !== connectionId; });
    renderConnections();
    saveBoard();
    setStatus('Connection removed');
  }

  function renderConnections() {
    connectionLayer.replaceChildren();
    model.connections.forEach(function (connection) {
      const from = model.notes.find(function (note) { return note.id === connection.from.noteId; });
      const to = model.notes.find(function (note) { return note.id === connection.to.noteId; });
      if (!from || !to) return;

      const geometry = getConnectionGeometry(from, connection.from.side, to, connection.to.side);
      const group = document.createElementNS(SVG_NS, 'g');
      group.classList.add('connection-group');
      group.dataset.connectionId = connection.id;

      const path = document.createElementNS(SVG_NS, 'path');
      path.classList.add('note-connection');
      path.setAttribute('d', geometry.path);
      path.setAttribute('tabindex', '0');
      path.setAttribute('role', 'button');
      path.setAttribute('aria-label', 'Select connection to remove');
      path.setAttribute('title', 'Select this line to show its remove button');
      path.addEventListener('click', function () {
        const isSelected = group.classList.toggle('is-selected');
        removeButton.setAttribute('tabindex', isSelected ? '0' : '-1');
        setStatus(group.classList.contains('is-selected') ? 'Click the × on the line to remove it' : 'Connection deselected');
      });
      path.addEventListener('keydown', function (event) {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          group.classList.add('is-selected');
          removeButton.setAttribute('tabindex', '0');
          removeButton.focus();
        }
      });
      group.appendChild(path);

      [geometry.start, geometry.end].forEach(function (point) {
        const endpoint = document.createElementNS(SVG_NS, 'circle');
        endpoint.classList.add('connection-endpoint');
        endpoint.setAttribute('cx', point.x);
        endpoint.setAttribute('cy', point.y);
        endpoint.setAttribute('r', 4);
        group.appendChild(endpoint);
      });

      const removeButton = document.createElementNS(SVG_NS, 'g');
      removeButton.classList.add('connection-remove');
      removeButton.setAttribute('role', 'button');
      removeButton.setAttribute('tabindex', '-1');
      removeButton.setAttribute('aria-label', 'Remove connection');
      removeButton.setAttribute('title', 'Remove connection');
      const removeBackground = document.createElementNS(SVG_NS, 'circle');
      removeBackground.setAttribute('cx', geometry.midpoint.x);
      removeBackground.setAttribute('cy', geometry.midpoint.y);
      removeBackground.setAttribute('r', 12);
      const removeLabel = document.createElementNS(SVG_NS, 'text');
      removeLabel.setAttribute('x', geometry.midpoint.x);
      removeLabel.setAttribute('y', geometry.midpoint.y + 1);
      removeLabel.textContent = '×';
      removeButton.append(removeBackground, removeLabel);
      removeButton.addEventListener('click', function (event) {
        event.stopPropagation();
        removeConnection(connection.id);
      });
      removeButton.addEventListener('keydown', function (event) {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          removeConnection(connection.id);
        }
      });
      group.appendChild(removeButton);
      connectionLayer.appendChild(group);
    });
    updateConnectionPorts();
  }

  function makeId() {
    return window.crypto && crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(16).slice(2)}`;
  }

  function startConnection(event, note, side) {
    if (event.button !== 0) return;
    event.preventDefault();
    event.stopPropagation();
    const preview = document.createElementNS(SVG_NS, 'path');
    preview.classList.add('connection-preview');
    connectionLayer.appendChild(preview);
    event.currentTarget.setPointerCapture(event.pointerId);
    model.drag = {
      type: 'connection',
      pointerId: event.pointerId,
      from: { noteId: note.id, side: side },
      start: getPortPosition(note, side),
      preview: preview
    };
    updateConnectionPorts();
  }

  function createNoteElement(note) {
    const card = document.createElement('article');
    card.className = 'sticky-note';
    card.dataset.noteId = note.id;
    card.style.left = `${note.x}px`;
    card.style.top = `${note.y}px`;
    card.style.width = `${note.width}px`;
    card.style.height = `${note.height}px`;
    card.style.setProperty('--note-color', note.color);
    card.setAttribute('aria-label', 'Sticky note');

    const header = document.createElement('div');
    header.className = 'note-header';

    const title = document.createElement('input');
    title.className = 'note-title';
    title.type = 'text';
    title.maxLength = 100;
    title.placeholder = 'Untitled note';
    title.value = note.title;
    title.setAttribute('aria-label', 'Note title');

    const dragHandle = document.createElement('span');
    dragHandle.className = 'note-drag-handle';
    dragHandle.textContent = '⠿';
    dragHandle.title = 'Drag to move note';
    dragHandle.setAttribute('aria-label', 'Drag to move note');

    const colorPicker = document.createElement('input');
    colorPicker.className = 'note-color-picker';
    colorPicker.type = 'color';
    colorPicker.value = note.color;
    colorPicker.title = 'Change note color';
    colorPicker.setAttribute('aria-label', 'Change note color');

    const duplicateButton = document.createElement('button');
    duplicateButton.className = 'note-action duplicate-note';
    duplicateButton.type = 'button';
    const duplicateIcon = document.createElement('i');
    duplicateIcon.className = 'fa-regular fa-copy';
    duplicateIcon.setAttribute('aria-hidden', 'true');
    duplicateButton.appendChild(duplicateIcon);
    duplicateButton.title = 'Duplicate note';
    duplicateButton.setAttribute('aria-label', 'Duplicate note');

    const deleteButton = document.createElement('button');
    deleteButton.className = 'note-action delete-note';
    deleteButton.type = 'button';
    const deleteIcon = document.createElement('i');
    deleteIcon.className = 'fa-regular fa-trash-can';
    deleteIcon.setAttribute('aria-hidden', 'true');
    deleteButton.appendChild(deleteIcon);
    deleteButton.title = 'Delete note';
    deleteButton.setAttribute('aria-label', 'Delete note');

    header.append(title, dragHandle, colorPicker, duplicateButton, deleteButton);

    const content = document.createElement('textarea');
    content.className = 'note-content';
    content.maxLength = 10000;
    content.placeholder = 'Write something...';
    content.value = note.content;
    content.setAttribute('aria-label', 'Note content');

    const date = document.createElement('div');
    date.className = 'note-date';
    date.textContent = formatDate(note.updatedAt);

    const ports = ['top', 'right', 'bottom', 'left'].map(function (side) {
      const port = document.createElement('button');
      port.className = `connection-port port-${side}`;
      port.type = 'button';
      port.dataset.side = side;
      port.title = `Connect from ${side}`;
      port.setAttribute('aria-label', `Connect ${side} side of note`);
      port.addEventListener('pointerdown', function (event) {
        selectNote(note.id);
        startConnection(event, note, side);
      });
      return port;
    });

    const resizeHandle = document.createElement('button');
    resizeHandle.className = 'note-resize-handle';
    resizeHandle.type = 'button';
    resizeHandle.title = 'Resize note up to 30% larger';
    resizeHandle.setAttribute('aria-label', 'Resize note');
    resizeHandle.addEventListener('pointerdown', function (event) {
      if (event.button !== 0) return;
      event.preventDefault();
      event.stopPropagation();
      resizeHandle.setPointerCapture(event.pointerId);
      model.drag = {
        type: 'resize',
        id: note.id,
        pointerId: event.pointerId,
        startX: event.clientX,
        startY: event.clientY,
        width: note.width,
        height: note.height
      };
    });

    card.append(header, content, date, resizeHandle);
    card.append(...ports);
    boardWorld.appendChild(card);
    card.classList.toggle('is-selected', note.id === model.selectedNoteId);
    card.addEventListener('pointerdown', function (event) {
      if (!event.target.closest('.connection-port')) selectNote(note.id);
    });
    card.addEventListener('focusin', function () { selectNote(note.id); });

    title.addEventListener('input', function () {
      note.title = title.value;
      saveBoard();
    });

    content.addEventListener('input', function () {
      note.content = content.value;
      note.updatedAt = Date.now();
      date.textContent = formatDate(note.updatedAt);
      saveBoard();
    });

    colorPicker.addEventListener('input', function () {
      note.color = colorPicker.value;
      card.style.setProperty('--note-color', note.color);
      saveBoard();
    });

    duplicateButton.addEventListener('click', function () {
      addNote({ ...note, id: undefined, x: note.x + 32, y: note.y + 32, title: note.title ? `${note.title} copy` : '' });
    });

    let deleteConfirmationTimer;
    deleteButton.addEventListener('click', function () {
      if (!deleteButton.classList.contains('is-confirming')) {
        deleteButton.classList.add('is-confirming');
        deleteButton.setAttribute('aria-label', 'Confirm delete note');
        deleteButton.title = 'Click again to delete this note';
        const label = document.createElement('span');
        label.textContent = 'Delete?';
        deleteButton.appendChild(label);
        deleteConfirmationTimer = window.setTimeout(function () {
          deleteButton.classList.remove('is-confirming');
          deleteButton.setAttribute('aria-label', 'Delete note');
          deleteButton.title = 'Delete note';
          label.remove();
        }, 3000);
        return;
      }

      window.clearTimeout(deleteConfirmationTimer);
      model.notes = model.notes.filter(function (item) { return item.id !== note.id; });
      model.connections = model.connections.filter(function (connection) {
        return connection.from.noteId !== note.id && connection.to.noteId !== note.id;
      });
      if (model.selectedNoteId === note.id) model.selectedNoteId = null;
      if (model.currentNoteId === note.id) model.currentNoteId = null;
      card.remove();
      renderConnections();
      updateCount();
      saveBoard();
    });

    dragHandle.addEventListener('pointerdown', function (event) {
      if (event.button !== 0) return;
      event.preventDefault();
      card.classList.add('is-dragging');
      dragHandle.setPointerCapture(event.pointerId);
      model.drag = { type: 'note', id: note.id, pointerId: event.pointerId, startX: event.clientX, startY: event.clientY, x: note.x, y: note.y };
    });

    content.addEventListener('pointerdown', function (event) {
      if (event.button !== 0 || event.target !== content) return;
      model.pendingNoteDrag = {
        id: note.id,
        pointerId: event.pointerId,
        startX: event.clientX,
        startY: event.clientY,
        x: note.x,
        y: note.y,
        content: content,
        card: card
      };
    });

    return card;
  }

  function addNote(values) {
    const rect = boardViewport.getBoundingClientRect();
    const column = model.notes.length % 4;
    const row = Math.floor(model.notes.length / 4);
    const offsetX = (column - 1.5) * 272;
    const offsetY = (row - 0.5) * 276;
    const width = values && Number.isFinite(values.width) ? clamp(values.width, 248, 248 * 1.3) : 248;
    const height = values && Number.isFinite(values.height) ? clamp(values.height, 252, 252 * 1.3) : 252;
    const note = {
      id: values && values.id ? values.id : (window.crypto && crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(16).slice(2)}`),
      title: values && typeof values.title === 'string' ? values.title : '',
      content: values && typeof values.content === 'string' ? values.content : '',
      color: values && isValidColor(values.color) ? values.color : NOTE_COLORS[model.notes.length % NOTE_COLORS.length],
      width: width,
      height: height,
      x: values && Number.isFinite(values.x) ? clamp(values.x, 0, BOARD_WIDTH - width) : clamp((rect.width / 2 - model.x) / model.zoom - width / 2 + offsetX, 0, BOARD_WIDTH - width),
      y: values && Number.isFinite(values.y) ? clamp(values.y, 0, BOARD_HEIGHT - height) : clamp((rect.height / 2 - model.y) / model.zoom - height / 2 + offsetY, 0, BOARD_HEIGHT - height),
      updatedAt: values && Number.isFinite(values.updatedAt) ? values.updatedAt : Date.now()
    };
    model.notes.push(note);
    model.selectedNoteId = note.id;
    createNoteElement(note);
    renderConnections();
    updateCount();
    saveBoard();
    const newCard = boardWorld.querySelector(`[data-note-id="${CSS.escape(note.id)}"]`);
    if (newCard) newCard.querySelector('.note-content').focus();
    return note;
  }

  function isValidColor(value) {
    return typeof value === 'string' && /^#[0-9a-f]{6}$/i.test(value);
  }

  function clamp(value, min, max) {
    return Math.min(max, Math.max(min, value));
  }

  function normalizeNote(value, index, seenIds) {
    if (!value || typeof value !== 'object') return null;
    const id = typeof value.id === 'string' && value.id && !seenIds.has(value.id) ? value.id : `import-${Date.now()}-${index}`;
    const width = Number.isFinite(value.width) ? clamp(value.width, 248, 248 * 1.3) : 248;
    const height = Number.isFinite(value.height) ? clamp(value.height, 252, 252 * 1.3) : 252;
    seenIds.add(id);
    return {
      id,
      title: typeof value.title === 'string' ? value.title.slice(0, 100) : '',
      content: typeof value.content === 'string' ? value.content.slice(0, 10000) : '',
      color: isValidColor(value.color) ? value.color : NOTE_COLORS[index % NOTE_COLORS.length],
      width: width,
      height: height,
      x: Number.isFinite(value.x) ? clamp(value.x, 0, BOARD_WIDTH - width) : 120 + index * 24,
      y: Number.isFinite(value.y) ? clamp(value.y, 0, BOARD_HEIGHT - height) : 120 + index * 24,
      updatedAt: Number.isFinite(value.updatedAt) ? value.updatedAt : Date.now()
    };
  }

  function normalizeConnections(values, notes) {
    if (!Array.isArray(values)) return [];
    const noteIds = new Set(notes.map(function (note) { return note.id; }));
    const seen = new Set();
    return values.filter(function (connection) {
      if (!connection || !connection.from || !connection.to) return false;
      const validSides = ['top', 'right', 'bottom', 'left'];
      if (!noteIds.has(connection.from.noteId) || !noteIds.has(connection.to.noteId)
        || !validSides.includes(connection.from.side) || !validSides.includes(connection.to.side)
        || connection.from.noteId === connection.to.noteId) return false;
      const ends = [`${connection.from.noteId}:${connection.from.side}`, `${connection.to.noteId}:${connection.to.side}`].sort();
      const key = ends.join('|');
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    }).map(function (connection) {
      return {
        id: typeof connection.id === 'string' ? connection.id : makeId(),
        from: { noteId: connection.from.noteId, side: connection.from.side },
        to: { noteId: connection.to.noteId, side: connection.to.side }
      };
    });
  }

  function loadBoard() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (!parsed || parsed.version !== 1 || !Array.isArray(parsed.notes)) throw new Error('Unsupported board data.');
        const seenIds = new Set();
        model.notes = parsed.notes.map(function (note, index) {
          return normalizeNote(note, index, seenIds);
        }).filter(Boolean);
        model.connections = normalizeConnections(parsed.connections, model.notes);
        if (parsed.camera && Number.isFinite(parsed.camera.x) && Number.isFinite(parsed.camera.y)) {
          model.x = parsed.camera.x;
          model.y = parsed.camera.y;
          model.zoom = Number.isFinite(parsed.camera.zoom) ? clamp(parsed.camera.zoom, MIN_ZOOM, MAX_ZOOM) : 1;
        } else {
          centerBoard();
        }
      } else {
        centerBoard();
      }
    } catch (error) {
      console.error('Unable to load the CherryPad board.', error);
      model.notes = [];
      centerBoard();
      setStatus('Could not load saved board', true);
    }
    model.notes.forEach(createNoteElement);
    renderConnections();
    updateCount();
    updateView();
  }

  function setZoom(nextZoom, clientX, clientY) {
    const oldZoom = model.zoom;
    const newZoom = clamp(nextZoom, MIN_ZOOM, MAX_ZOOM);
    if (newZoom === oldZoom) return;
    const rect = boardViewport.getBoundingClientRect();
    const pointerX = Number.isFinite(clientX) ? clientX - rect.left : rect.width / 2;
    const pointerY = Number.isFinite(clientY) ? clientY - rect.top : rect.height / 2;
    const worldX = (pointerX - model.x) / oldZoom;
    const worldY = (pointerY - model.y) / oldZoom;
    model.zoom = newZoom;
    model.x = pointerX - worldX * newZoom;
    model.y = pointerY - worldY * newZoom;
    updateView();
    saveBoard();
  }

  function exportBoard() {
    const data = JSON.stringify({ version: 1, notes: model.notes, connections: model.connections, camera: { x: model.x, y: model.y, zoom: model.zoom } }, null, 2);
    const url = URL.createObjectURL(new Blob([data], { type: 'application/json' }));
    const link = document.createElement('a');
    link.href = url;
    link.download = `CherryPad-board-${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
    URL.revokeObjectURL(url);
    setStatus('Board exported');
  }

  async function importBoard(file) {
    try {
      const parsed = JSON.parse(await file.text());
      if (!parsed || parsed.version !== 1 || !Array.isArray(parsed.notes)) {
        throw new Error('This file is not a supported CherryPad board backup.');
      }
      const seenIds = new Set();
      const importedNotes = parsed.notes.map(function (note, index) {
        return normalizeNote(note, index, seenIds);
      }).filter(Boolean);
      model.notes = importedNotes;
      model.connections = normalizeConnections(parsed.connections, model.notes);
      model.selectedNoteId = null;
      model.currentNoteId = null;
      boardWorld.replaceChildren();
      boardWorld.appendChild(connectionLayer);
      model.notes.forEach(createNoteElement);
      renderConnections();
      if (parsed.camera && Number.isFinite(parsed.camera.x) && Number.isFinite(parsed.camera.y)) {
        model.x = parsed.camera.x;
        model.y = parsed.camera.y;
        model.zoom = Number.isFinite(parsed.camera.zoom) ? clamp(parsed.camera.zoom, MIN_ZOOM, MAX_ZOOM) : 1;
      } else {
        centerBoard();
      }
      updateView();
      updateCount();
      saveBoard();
      setStatus('Board imported');
    } catch (error) {
      console.error('Unable to import the CherryPad board.', error);
      setStatus(error instanceof SyntaxError ? 'Import file is not valid JSON' : error.message, true);
    } finally {
      importInput.value = '';
    }
  }

  document.getElementById('addNoteButton').addEventListener('click', function () { addNote(); });
  document.getElementById('returnToCherryPadButton').addEventListener('click', function () {
    window.location.assign('cherrypad.html');
  });
  document.getElementById('resetViewButton').addEventListener('click', function () {
    model.zoom = 1;
    model.currentNoteId = null;
    boardWorld.querySelectorAll('.sticky-note.is-current').forEach(function (card) {
      card.classList.remove('is-current');
    });
    centerBoard();
    saveBoard();
  });
  document.getElementById('nextNoteButton').addEventListener('click', function () {
    if (model.notes.length === 0) {
      setStatus('No notes to show');
      return;
    }

    const currentIndex = model.notes.findIndex(function (note) { return note.id === model.currentNoteId; });
    const note = model.notes[(currentIndex + 1) % model.notes.length];
    selectNote(note.id);
    const rect = boardViewport.getBoundingClientRect();
    const card = boardWorld.querySelector(`[data-note-id="${CSS.escape(note.id)}"]`);
    boardWorld.querySelectorAll('.sticky-note.is-current').forEach(function (item) {
      item.classList.remove('is-current');
    });
    model.currentNoteId = note.id;
    if (card) card.classList.add('is-current');
    model.x = rect.width / 2 - (note.x + 124) * model.zoom;
    model.y = rect.height / 2 - (note.y + 126) * model.zoom;
    updateView();
    saveBoard();
  });
  document.getElementById('exportButton').addEventListener('click', exportBoard);
  importInput.addEventListener('change', function () {
    if (importInput.files && importInput.files[0]) importBoard(importInput.files[0]);
  });
  boardViewport.addEventListener('pointerdown', function (event) {
    if (event.button !== 0 || event.target.closest('.sticky-note, .connection-group')) return;
    selectNote(null);
    boardViewport.classList.add('is-panning');
    boardViewport.setPointerCapture(event.pointerId);
    model.drag = { type: 'board', pointerId: event.pointerId, startX: event.clientX, startY: event.clientY, x: model.x, y: model.y };
  });

  document.addEventListener('pointermove', function (event) {
    const pendingDrag = model.pendingNoteDrag;
    if (pendingDrag && pendingDrag.pointerId === event.pointerId && !model.drag) {
      const deltaX = event.clientX - pendingDrag.startX;
      const deltaY = event.clientY - pendingDrag.startY;
      if (Math.hypot(deltaX, deltaY) >= 6) {
        event.preventDefault();
        pendingDrag.content.setSelectionRange(pendingDrag.content.selectionEnd, pendingDrag.content.selectionEnd);
        pendingDrag.card.setPointerCapture(event.pointerId);
        pendingDrag.card.classList.add('is-dragging');
        model.drag = {
          type: 'note',
          id: pendingDrag.id,
          pointerId: pendingDrag.pointerId,
          startX: pendingDrag.startX,
          startY: pendingDrag.startY,
          x: pendingDrag.x,
          y: pendingDrag.y
        };
        model.pendingNoteDrag = null;
      }
    }

    const drag = model.drag;
    if (!drag || drag.pointerId !== event.pointerId) return;
    if (drag.type === 'connection') {
      const viewportRect = boardViewport.getBoundingClientRect();
      const end = {
        x: (event.clientX - viewportRect.left - model.x) / model.zoom,
        y: (event.clientY - viewportRect.top - model.y) / model.zoom
      };
      drag.preview.setAttribute('d', `M ${drag.start.x} ${drag.start.y} L ${end.x} ${end.y}`);
    } else if (drag.type === 'board') {
      model.x = drag.x + event.clientX - drag.startX;
      model.y = drag.y + event.clientY - drag.startY;
    } else if (drag.type === 'resize') {
      const note = model.notes.find(function (item) { return item.id === drag.id; });
      const card = boardWorld.querySelector(`[data-note-id="${CSS.escape(drag.id)}"]`);
      if (!note || !card) return;
      const scale = clamp(
        1 + Math.max((event.clientX - drag.startX) / (248 * model.zoom), (event.clientY - drag.startY) / (252 * model.zoom)),
        1,
        1.3
      );
      note.width = 248 * scale;
      note.height = 252 * scale;
      card.style.width = `${note.width}px`;
      card.style.height = `${note.height}px`;
      renderConnections();
    } else {
      const note = model.notes.find(function (item) { return item.id === drag.id; });
      const card = boardWorld.querySelector(`[data-note-id="${CSS.escape(drag.id)}"]`);
      if (!note || !card) return;
      note.x = clamp(drag.x + (event.clientX - drag.startX) / model.zoom, 0, BOARD_WIDTH - note.width);
      note.y = clamp(drag.y + (event.clientY - drag.startY) / model.zoom, 0, BOARD_HEIGHT - note.height);
      card.style.left = `${note.x}px`;
      card.style.top = `${note.y}px`;
      renderConnections();
    }
    updateView();
  });

  document.addEventListener('pointerup', function (event) {
    if (model.pendingNoteDrag && model.pendingNoteDrag.pointerId === event.pointerId) {
      model.pendingNoteDrag = null;
    }
    if (!model.drag || model.drag.pointerId !== event.pointerId) return;
    if (model.drag.type === 'connection') {
      const drag = model.drag;
      model.drag = null;
      const target = document.elementFromPoint(event.clientX, event.clientY);
      const targetPort = target && target.closest('.connection-port');
      const targetCard = targetPort && targetPort.closest('.sticky-note');
      const targetNote = targetCard && model.notes.find(function (note) { return note.id === targetCard.dataset.noteId; });
      if (targetNote && targetNote.id !== drag.from.noteId) {
        const connection = { id: makeId(), from: drag.from, to: { noteId: targetNote.id, side: targetPort.dataset.side } };
        const exists = model.connections.some(function (item) {
          return (item.from.noteId === connection.from.noteId && item.from.side === connection.from.side && item.to.noteId === connection.to.noteId && item.to.side === connection.to.side)
            || (item.to.noteId === connection.from.noteId && item.to.side === connection.from.side && item.from.noteId === connection.to.noteId && item.from.side === connection.to.side);
        });
        if (!exists) model.connections.push(connection);
      }
      selectNote(null);
      renderConnections();
    } else if (model.drag.type === 'board') {
      boardViewport.classList.remove('is-panning');
    } else if (model.drag.type === 'note') {
      const card = boardWorld.querySelector(`[data-note-id="${CSS.escape(model.drag.id)}"]`);
      if (card) card.classList.remove('is-dragging');
    }
    model.drag = null;
    saveBoard();
  });

  document.addEventListener('pointercancel', function (event) {
    if (model.pendingNoteDrag && model.pendingNoteDrag.pointerId === event.pointerId) {
      model.pendingNoteDrag = null;
    }
    if (model.drag && model.drag.pointerId === event.pointerId) {
      if (model.drag.type === 'connection') renderConnections();
      if (model.drag.type === 'board') boardViewport.classList.remove('is-panning');
      if (model.drag.type === 'note') {
        const card = boardWorld.querySelector(`[data-note-id="${CSS.escape(model.drag.id)}"]`);
        if (card) card.classList.remove('is-dragging');
      }
      model.drag = null;
    }
  });

  boardViewport.addEventListener('wheel', function (event) {
    if (event.target.closest('textarea, input, button') && !event.ctrlKey && !event.metaKey) return;
    event.preventDefault();
    setZoom(model.zoom * (event.deltaY < 0 ? 1.08 : 1 / 1.08), event.clientX, event.clientY);
  }, { passive: false });

  document.addEventListener('keydown', function (event) {
    if (event.key.toLowerCase() === 'n' && !event.ctrlKey && !event.metaKey && !event.altKey && !event.target.matches('input, textarea')) {
      event.preventDefault();
      addNote();
    }
  });

  window.addEventListener('resize', function () {
    if (model.notes.length === 0 && !localStorage.getItem(STORAGE_KEY)) centerBoard();
  });

  loadBoard();
}());
(function () {
  'use strict';

  const STORAGE_KEY = 'cherrypad.board.v1';
  const BOARD_WIDTH = 6400;
  const BOARD_HEIGHT = 4400;
  const MIN_ZOOM = 0.4;
  const MAX_ZOOM = 1.6;
  const NOTE_COLORS = ['#f8df85', '#f4b8b8', '#b9dfc2', '#b9d6f1', '#ddc3ed', '#f3c89e'];
  const NOTE_COLOR_NAMES = ['Yellow', 'Pink', 'Green', 'Blue', 'Purple', 'Orange'];
  const DRAW_COLOR_ROWS = [
    { name: 'Red shades', colors: [
      { name: 'Dark red', value: '#7f1d1d' }, { name: 'Red', value: '#b91c1c' },
      { name: 'Bright red', value: '#ef4444' }, { name: 'Light red', value: '#ff4040' },
      { name: 'Soft red', value: '#f87171' }, { name: 'Pale red', value: '#fecaca' }
    ] },
    { name: 'Orange shades', colors: [
      { name: 'Dark orange', value: '#7c2d12' }, { name: 'Burnt orange', value: '#c2410c' },
      { name: 'Orange', value: '#f97316' }, { name: 'Light orange', value: '#fb923c' },
      { name: 'Soft orange', value: '#fdba74' }, { name: 'Pale orange', value: '#ffedd5' }
    ] },
    { name: 'Yellow shades', colors: [
      { name: 'Dark yellow', value: '#854d0e' }, { name: 'Golden yellow', value: '#ca8a04' },
      { name: 'Yellow', value: '#eab308' }, { name: 'Bright yellow', value: '#ffe34d' },
      { name: 'Soft yellow', value: '#fde047' }, { name: 'Pale yellow', value: '#fef9c3' }
    ] },
    { name: 'Green shades', colors: [
      { name: 'Dark green', value: '#14532d' }, { name: 'Green', value: '#15803d' },
      { name: 'Bright green', value: '#22c55e' }, { name: 'Light green', value: '#35d46a' },
      { name: 'Soft green', value: '#86efac' }, { name: 'Pale green', value: '#dcfce7' }
    ] },
    { name: 'Cyan shades', colors: [
      { name: 'Dark cyan', value: '#164e63' }, { name: 'Deep cyan', value: '#0e7490' },
      { name: 'Cyan', value: '#06b6d4' }, { name: 'Light cyan', value: '#35d5e5' },
      { name: 'Soft cyan', value: '#67e8f9' }, { name: 'Pale cyan', value: '#cffafe' }
    ] },
    { name: 'Blue shades', colors: [
      { name: 'Dark blue', value: '#1e3a8a' }, { name: 'Blue', value: '#1d4ed8' },
      { name: 'Bright blue', value: '#3b82f6' }, { name: 'Light blue', value: '#438aff' },
      { name: 'Soft blue', value: '#93c5fd' }, { name: 'Pale blue', value: '#dbeafe' }
    ] },
    { name: 'Violet shades', colors: [
      { name: 'Dark violet', value: '#4c1d95' }, { name: 'Violet', value: '#6d28d9' },
      { name: 'Bright violet', value: '#8b5cf6' }, { name: 'Light violet', value: '#9b59d0' },
      { name: 'Soft violet', value: '#c4b5fd' }, { name: 'Pale violet', value: '#ede9fe' }
    ] },
    { name: 'Pink shades', colors: [
      { name: 'Dark pink', value: '#831843' }, { name: 'Pink', value: '#be185d' },
      { name: 'Bright pink', value: '#ec4899' }, { name: 'Light pink', value: '#ff69b4' },
      { name: 'Soft pink', value: '#f9a8d4' }, { name: 'Pale pink', value: '#fce7f3' }
    ] },
    { name: 'Gray and white shades', colors: [
      { name: 'Dark gray', value: '#262626' }, { name: 'Gray', value: '#525252' },
      { name: 'Medium gray', value: '#737373' }, { name: 'Light gray', value: '#a3a3a3' },
      { name: 'Pale gray', value: '#d4d4d4' }, { name: 'White', value: '#ffffff' }
    ] }
  ];
  const DRAW_COLORS = DRAW_COLOR_ROWS.reduce(function (colors, row) {
    return colors.concat(row.colors);
  }, []);
  const boardViewport = document.getElementById('boardViewport');
  const boardWorld = document.getElementById('boardWorld');
  document.addEventListener('pointerdown', function (event) {
    if (!event.target.closest('.toolbar-dropdown')) {
      document.querySelectorAll('.toolbar-dropdown-menu:not([hidden])').forEach(function (menu) {
        menu.hidden = true;
        menu.parentElement.querySelectorAll('[aria-expanded="true"]').forEach(function (button) {
          button.setAttribute('aria-expanded', 'false');
        });
      });
    }
    if (!event.target.closest('.draw-tool')) drawColorMenu.hidden = true;
    if (!event.target.closest('.note-color-picker')) {
      boardWorld.querySelectorAll('.note-color-menu:not([hidden])').forEach(function (menu) {
        menu.hidden = true;
        menu.parentElement.querySelector('.note-color-trigger').setAttribute('aria-expanded', 'false');
      });
    }
  });
  const boardCenterMarker = document.createElement('span');
  boardCenterMarker.className = 'board-center-marker';
  boardCenterMarker.setAttribute('aria-hidden', 'true');
  boardWorld.appendChild(boardCenterMarker);
  const SVG_NS = 'http://www.w3.org/2000/svg';
  const connectionLayer = document.createElementNS(SVG_NS, 'svg');
  connectionLayer.classList.add('connection-layer');
  boardWorld.appendChild(connectionLayer);
  const drawingLayer = document.createElementNS(SVG_NS, 'svg');
  drawingLayer.classList.add('drawing-layer');
  boardWorld.appendChild(drawingLayer);
  const noteCount = document.getElementById('noteCount');
  const saveStatus = document.getElementById('saveStatus');
  const importInput = document.getElementById('importInput');
  const drawButton = document.getElementById('drawButton');
  const drawMenuToggle = document.getElementById('drawMenuToggle');
  const drawColorMenu = document.getElementById('drawColorMenu');
  const drawThicknessControl = document.getElementById('drawThicknessControl');
  const drawThicknessSlider = document.getElementById('drawThicknessSlider');
  const drawThicknessValue = document.getElementById('drawThicknessValue');
  const drawColorIndicator = document.getElementById('drawColorIndicator');
  const model = { notes: [], connections: [], strokes: [], x: 0, y: 0, zoom: 1, currentNoteId: null, selectedNoteId: null, selectedStrokeId: null, drawColor: '#ffffff', drawWidth: 6, drawingActive: false, saveTimer: null, statusTimer: null, drag: null, pendingNoteDrag: null };

  function updateDrawColorIndicator() {
    const red = parseInt(model.drawColor.slice(1, 3), 16) / 255;
    const green = parseInt(model.drawColor.slice(3, 5), 16) / 255;
    const blue = parseInt(model.drawColor.slice(5, 7), 16) / 255;
    const luminance = [red, green, blue].map(function (channel) {
      return channel <= 0.04045 ? channel / 12.92 : Math.pow((channel + 0.055) / 1.055, 2.4);
    }).reduce(function (total, channel, index) {
      return total + channel * [0.2126, 0.7152, 0.0722][index];
    }, 0);
    const blackContrast = (luminance + 0.05) / 0.05;
    const whiteContrast = 1.05 / (luminance + 0.05);
    drawColorIndicator.style.setProperty('--draw-color', model.drawColor);
    drawColorIndicator.style.setProperty('--draw-color-text', whiteContrast > blackContrast ? '#fff' : '#111');
  }

  updateDrawColorIndicator();

  function setToolbarMenuOpen(menu, isOpen) {
    if (isOpen) {
      document.querySelectorAll('.toolbar-dropdown-menu:not([hidden])').forEach(function (openMenu) {
        if (openMenu !== menu) setToolbarMenuOpen(openMenu, false);
      });
    }
    menu.hidden = !isOpen;
    menu.parentElement.querySelectorAll('[aria-controls="' + menu.id + '"]').forEach(function (button) {
      button.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    });
    if (isOpen && window.matchMedia('(max-width: 900px)').matches) {
      const toggle = menu.parentElement.querySelector('.dropdown-toggle');
      const buttonRect = toggle.getBoundingClientRect();
      const maxLeft = Math.max(8, window.innerWidth - menu.offsetWidth - 8);
      const maxTop = Math.max(8, window.innerHeight - menu.offsetHeight - 8);
      menu.style.left = `${clamp(buttonRect.left, 8, maxLeft)}px`;
      menu.style.top = `${clamp(buttonRect.bottom + 8, 8, maxTop)}px`;
    } else {
      menu.style.left = '';
      menu.style.top = '';
    }
  }

  document.querySelectorAll('.toolbar-dropdown').forEach(function (dropdown) {
    const menu = dropdown.querySelector('.toolbar-dropdown-menu');
    dropdown.querySelectorAll('[aria-controls="' + menu.id + '"]').forEach(function (button) {
      button.addEventListener('click', function () {
        setToolbarMenuOpen(menu, menu.hidden);
      });
    });
  });

  function setDrawMenuOpen(isOpen) {
    drawColorMenu.hidden = !isOpen;
    drawMenuToggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    if (isOpen && window.matchMedia('(max-width: 900px)').matches) {
      const buttonRect = drawMenuToggle.getBoundingClientRect();
      const maxLeft = Math.max(8, window.innerWidth - drawColorMenu.offsetWidth - 8);
      const maxTop = Math.max(8, window.innerHeight - drawColorMenu.offsetHeight - 8);
      drawColorMenu.style.left = `${clamp(buttonRect.left, 8, maxLeft)}px`;
      drawColorMenu.style.top = `${clamp(buttonRect.bottom + 8, 8, maxTop)}px`;
    } else {
      drawColorMenu.style.left = '';
      drawColorMenu.style.top = '';
    }
  }

  function setDrawingMode(isActive) {
    model.drawingActive = isActive;
    drawButton.classList.toggle('is-active', isActive);
    drawButton.setAttribute('aria-pressed', isActive ? 'true' : 'false');
    boardViewport.classList.toggle('is-drawing', isActive);
    drawThicknessControl.hidden = !isActive;
    setStatus(isActive ? 'Drawing mode on · select a line to remove it' : 'Drawing mode off');
  }

  DRAW_COLOR_ROWS.forEach(function (row) {
    const colorRow = document.createElement('div');
    colorRow.className = 'draw-color-row';
    colorRow.setAttribute('role', 'group');
    colorRow.setAttribute('aria-label', row.name);
    row.colors.forEach(function (color) {
      const option = document.createElement('button');
      option.className = 'draw-color-option';
      option.type = 'button';
      option.setAttribute('aria-label', color.name);
      option.title = color.name;
      option.setAttribute('aria-pressed', color.value === model.drawColor ? 'true' : 'false');
      option.style.setProperty('--draw-color', color.value);
      option.addEventListener('click', function () {
        model.drawColor = color.value;
        updateDrawColorIndicator();
        drawColorMenu.querySelectorAll('.draw-color-option').forEach(function (item) {
          item.setAttribute('aria-pressed', item === option ? 'true' : 'false');
        });
        setDrawingMode(true);
        setDrawMenuOpen(false);
      });
      colorRow.appendChild(option);
    });
    drawColorMenu.appendChild(colorRow);
  });

  drawThicknessSlider.addEventListener('input', function () {
    model.drawWidth = Number(drawThicknessSlider.value);
    drawThicknessValue.value = `${model.drawWidth}px`;
  });

  drawButton.addEventListener('click', function () {
    setDrawingMode(!model.drawingActive);
  });
  drawMenuToggle.addEventListener('click', function () {
    setDrawMenuOpen(drawColorMenu.hidden);
  });
  drawColorIndicator.addEventListener('click', function () {
    setDrawMenuOpen(true);
  });

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
          strokes: model.strokes,
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
    const noteTotal = model.notes.length;
    const strokeTotal = model.strokes.length;
    noteCount.textContent = `${noteTotal} ${noteTotal === 1 ? 'note' : 'notes'} · ${strokeTotal} ${strokeTotal === 1 ? 'drawing' : 'drawings'}`;
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

  function getStrokeRemovePoint(path) {
    const totalLength = path.getTotalLength();
    let bestPoint = path.getPointAtLength(totalLength / 2);
    let bestClearance = -1;
    for (let index = 0; index <= 40; index++) {
      const point = path.getPointAtLength(totalLength * index / 40);
      const clearance = model.notes.reduce(function (nearest, note) {
        const dx = Math.max(note.x - point.x, 0, point.x - (note.x + note.width));
        const dy = Math.max(note.y - point.y, 0, point.y - (note.y + note.height));
        return Math.min(nearest, Math.hypot(dx, dy));
      }, Infinity);
      if (clearance > bestClearance) {
        bestPoint = point;
        bestClearance = clearance;
      }
      if (clearance >= 16) return point;
    }
    return bestPoint;
  }

  function renderStrokes() {
    drawingLayer.replaceChildren();
    model.strokes.forEach(function (stroke) {
      const group = document.createElementNS(SVG_NS, 'g');
      group.classList.add('drawing-group');
      if (stroke.id === model.selectedStrokeId) group.classList.add('is-selected');
      group.dataset.strokeId = stroke.id;

      const path = document.createElementNS(SVG_NS, 'path');
      path.classList.add('drawing-stroke');
      path.setAttribute('d', stroke.points.map(function (point, index) {
        return `${index === 0 ? 'M' : 'L'} ${point.x} ${point.y}`;
      }).join(' '));
      path.setAttribute('stroke', stroke.color);
      path.style.setProperty('--stroke-width', `${stroke.width}px`);
      path.setAttribute('tabindex', '0');
      path.setAttribute('role', 'button');
      path.setAttribute('aria-label', `Select ${DRAW_COLORS.find(function (color) { return color.value === stroke.color; }).name} drawing to remove`);
      path.setAttribute('title', 'Select drawing to remove');
      path.addEventListener('click', function () {
        model.selectedStrokeId = model.selectedStrokeId === stroke.id ? null : stroke.id;
        renderStrokes();
        if (model.selectedStrokeId) {
          const selectedPath = drawingLayer.querySelector(`[data-stroke-id="${CSS.escape(stroke.id)}"] .drawing-stroke`);
          if (selectedPath) selectedPath.focus();
          setStatus('Drawing selected · press Delete or use × to remove');
        } else {
          setStatus('Drawing deselected');
        }
      });
      path.addEventListener('keydown', function (event) {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          model.selectedStrokeId = stroke.id;
          renderStrokes();
          const selectedPath = drawingLayer.querySelector(`[data-stroke-id="${CSS.escape(stroke.id)}"] .drawing-stroke`);
          if (selectedPath) selectedPath.focus();
          setStatus('Drawing selected · press Delete or use × to remove');
        }
      });
      group.appendChild(path);
      drawingLayer.appendChild(group);

      const removePoint = getStrokeRemovePoint(path);
      const removeButton = document.createElementNS(SVG_NS, 'g');
      removeButton.classList.add('drawing-remove');
      removeButton.setAttribute('role', 'button');
      removeButton.setAttribute('tabindex', stroke.id === model.selectedStrokeId ? '0' : '-1');
      removeButton.setAttribute('aria-label', 'Remove drawing');
      removeButton.setAttribute('title', 'Remove drawing');
      const removeBackground = document.createElementNS(SVG_NS, 'circle');
      removeBackground.setAttribute('cx', removePoint.x);
      removeBackground.setAttribute('cy', removePoint.y);
      removeBackground.setAttribute('r', 11);
      const removeLabel = document.createElementNS(SVG_NS, 'text');
      removeLabel.setAttribute('x', removePoint.x);
      removeLabel.setAttribute('y', removePoint.y + 1);
      removeLabel.textContent = '×';
      removeButton.append(removeBackground, removeLabel);
      removeButton.addEventListener('click', function (event) {
        event.stopPropagation();
        removeStroke(stroke.id);
      });
      removeButton.addEventListener('keydown', function (event) {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          removeStroke(stroke.id);
        }
      });
      group.appendChild(removeButton);
    });
  }

  function removeStroke(strokeId) {
    model.strokes = model.strokes.filter(function (stroke) { return stroke.id !== strokeId; });
    model.selectedStrokeId = null;
    renderStrokes();
    updateCount();
    saveBoard();
    setStatus('Drawing removed');
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

    const colorPicker = document.createElement('div');
    colorPicker.className = 'note-color-picker';
    const colorTrigger = document.createElement('button');
    colorTrigger.className = 'note-color-trigger';
    colorTrigger.type = 'button';
    colorTrigger.title = 'Change note color';
    colorTrigger.setAttribute('aria-label', 'Change note color');
    colorTrigger.setAttribute('aria-haspopup', 'listbox');
    colorTrigger.setAttribute('aria-expanded', 'false');
    colorTrigger.style.backgroundColor = note.color;

    const colorMenu = document.createElement('div');
    colorMenu.className = 'note-color-menu';
    colorMenu.setAttribute('role', 'listbox');
    colorMenu.setAttribute('aria-label', 'Note colors');
    colorMenu.hidden = true;
    const colorOptions = NOTE_COLORS.map(function (color, index) {
      const option = document.createElement('button');
      option.className = 'note-color-option';
      option.type = 'button';
      option.setAttribute('role', 'option');
      option.setAttribute('aria-label', NOTE_COLOR_NAMES[index]);
      option.setAttribute('title', NOTE_COLOR_NAMES[index]);
      option.setAttribute('aria-selected', color === note.color ? 'true' : 'false');
      option.tabIndex = color === note.color ? 0 : -1;
      option.style.setProperty('--swatch-color', color);
      option.addEventListener('click', function () {
        note.color = color;
        colorTrigger.style.backgroundColor = color;
        card.style.setProperty('--note-color', color);
        colorOptions.forEach(function (colorOption) {
          const isSelected = colorOption === option;
          colorOption.setAttribute('aria-selected', isSelected ? 'true' : 'false');
          colorOption.tabIndex = isSelected ? 0 : -1;
        });
        closeColorMenu(true);
        saveBoard();
      });
      colorMenu.appendChild(option);
      return option;
    });
    colorPicker.append(colorTrigger, colorMenu);

    function closeColorMenu(returnFocus) {
      colorMenu.hidden = true;
      colorTrigger.setAttribute('aria-expanded', 'false');
      if (returnFocus) colorTrigger.focus();
    }

    function openColorMenu() {
      colorMenu.hidden = false;
      colorTrigger.setAttribute('aria-expanded', 'true');
      const selectedOption = colorOptions.find(function (option) {
        return option.getAttribute('aria-selected') === 'true';
      });
      if (selectedOption) selectedOption.focus();
    }

    colorTrigger.addEventListener('click', function () {
      if (colorMenu.hidden) openColorMenu();
      else closeColorMenu(false);
    });

    colorMenu.addEventListener('keydown', function (event) {
      const currentIndex = colorOptions.indexOf(document.activeElement);
      let nextIndex = currentIndex;
      if (event.key === 'ArrowDown') nextIndex = (currentIndex + 1) % colorOptions.length;
      else if (event.key === 'ArrowUp') nextIndex = (currentIndex - 1 + colorOptions.length) % colorOptions.length;
      else if (event.key === 'Home') nextIndex = 0;
      else if (event.key === 'End') nextIndex = colorOptions.length - 1;
      else if (event.key === 'Escape') {
        event.preventDefault();
        closeColorMenu(true);
        return;
      } else {
        return;
      }
      event.preventDefault();
      colorOptions[nextIndex].focus();
    });

    colorPicker.addEventListener('pointerdown', function (event) {
      event.stopPropagation();
    });

    colorPicker.addEventListener('focusout', function (event) {
      if (!colorPicker.contains(event.relatedTarget)) closeColorMenu(false);
    });

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

    duplicateButton.addEventListener('click', function () {
      addNote({ ...note, id: undefined, x: note.x + 32, y: note.y + 32, title: note.title ? `${note.title} copy` : '' });
    });

    let deleteConfirmationTimer;
    deleteButton.addEventListener('click', function () {
      if (!deleteButton.classList.contains('is-confirming')) {
        deleteButton.classList.add('is-confirming');
        deleteButton.setAttribute('aria-label', 'Confirm delete note');
        deleteButton.title = 'Click again to delete this note';
        deleteConfirmationTimer = window.setTimeout(function () {
          deleteButton.classList.remove('is-confirming');
          deleteButton.setAttribute('aria-label', 'Delete note');
          deleteButton.title = 'Delete note';
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
      color: values && isDefaultNoteColor(values.color) ? values.color : NOTE_COLORS[model.notes.length % NOTE_COLORS.length],
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

  function isDefaultNoteColor(value) {
    return NOTE_COLORS.includes(value);
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
      color: isDefaultNoteColor(value.color) ? value.color : NOTE_COLORS[index % NOTE_COLORS.length],
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

  function normalizeStrokes(values) {
    if (!Array.isArray(values)) return [];
    const seenIds = new Set();
    return values.filter(function (stroke) {
      if (!stroke || typeof stroke.id !== 'string' || seenIds.has(stroke.id)
        || !DRAW_COLORS.some(function (color) { return color.value === stroke.color; })
        || (stroke.width !== undefined && (!Number.isInteger(stroke.width) || stroke.width < 1 || stroke.width > 15))
        || !Array.isArray(stroke.points) || stroke.points.length === 0
        || !stroke.points.every(function (point) {
          return point && Number.isFinite(point.x) && Number.isFinite(point.y);
        })) return false;
      seenIds.add(stroke.id);
      return true;
    }).map(function (stroke) {
      return {
        id: stroke.id,
        color: stroke.color,
        width: stroke.width === undefined ? 5 : stroke.width,
        points: stroke.points.map(function (point) {
          return { x: clamp(point.x, 0, BOARD_WIDTH), y: clamp(point.y, 0, BOARD_HEIGHT) };
        })
      };
    });
  }

  function loadBoard() {
    let isFirstLaunch = false;
    let updatedWelcomeNote = false;
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved !== null) {
        const parsed = JSON.parse(saved);
        if (!parsed || parsed.version !== 1 || !Array.isArray(parsed.notes)) throw new Error('Unsupported board data.');
        const seenIds = new Set();
        model.notes = parsed.notes.map(function (note, index) {
          return normalizeNote(note, index, seenIds);
        }).filter(Boolean);
        model.notes.forEach(function (note) {
          if (note.title === 'Welcome to CherryPad'
            && note.content === 'This is your sticky-note board. Edit, move, resize, recolor, duplicate, or delete these starter notes to explore.') {
            note.title = 'Welcome';
            updatedWelcomeNote = true;
          }
        });
        model.connections = normalizeConnections(parsed.connections, model.notes);
        model.strokes = normalizeStrokes(parsed.strokes);
        if (parsed.camera && Number.isFinite(parsed.camera.x) && Number.isFinite(parsed.camera.y)) {
          model.x = parsed.camera.x;
          model.y = parsed.camera.y;
          model.zoom = Number.isFinite(parsed.camera.zoom) ? clamp(parsed.camera.zoom, MIN_ZOOM, MAX_ZOOM) : 1;
        } else {
          centerBoard();
        }
      } else {
        isFirstLaunch = true;
        centerBoard();
        const welcomeNote = {
          id: makeId(),
          title: 'Welcome',
          content: 'This is your sticky-note board. Edit, move, resize, recolor, duplicate, or delete these starter notes to explore.',
          color: '#f8df85',
          width: 248,
          height: 252,
          x: BOARD_WIDTH / 2 - 124,
          y: BOARD_HEIGHT / 2 - 390,
          updatedAt: Date.now()
        };
        const organizeNote = {
          id: makeId(),
          title: 'Make it yours',
          content: 'Drag notes around the board and use the corner handle to resize them by up to 30%. Your changes save automatically.',
          color: '#b9dfc2',
          width: 248,
          height: 252,
          x: BOARD_WIDTH / 2 - 420,
          y: BOARD_HEIGHT / 2 - 30,
          updatedAt: Date.now()
        };
        const connectNote = {
          id: makeId(),
          title: 'Connect ideas',
          content: 'Select a note to reveal its connection points, then drag from one point to another note. Select a line to remove it.',
          color: '#b9d6f1',
          width: 248,
          height: 252,
          x: BOARD_WIDTH / 2 + 172,
          y: BOARD_HEIGHT / 2 - 30,
          updatedAt: Date.now()
        };
        model.notes = [welcomeNote, organizeNote, connectNote];
        model.connections = [
          { id: makeId(), from: { noteId: welcomeNote.id, side: 'bottom' }, to: { noteId: organizeNote.id, side: 'top' } },
          { id: makeId(), from: { noteId: welcomeNote.id, side: 'bottom' }, to: { noteId: connectNote.id, side: 'top' } }
        ];
      }
    } catch (error) {
      console.error('Unable to load the CherryPad board.', error);
      model.notes = [];
      centerBoard();
      setStatus('Could not load saved board', true);
    }
    model.notes.forEach(createNoteElement);
    renderConnections();
    renderStrokes();
    updateCount();
    updateView();
    if (isFirstLaunch || updatedWelcomeNote) saveBoard();
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

  function downloadJson(data, filename, statusMessage) {
    const url = URL.createObjectURL(new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' }));
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
    setStatus(statusMessage);
  }

  function exportBoard() {
    const date = new Date().toISOString().slice(0, 10);
    downloadJson(
      { version: 1, notes: model.notes, connections: model.connections, strokes: model.strokes, camera: { x: model.x, y: model.y, zoom: model.zoom } },
      `CherryPad-board-${date}.json`,
      'Board exported'
    );
  }

  async function importBoard(file) {
    try {
      const parsed = JSON.parse(await file.text());
      if (!parsed || parsed.version !== 1 || !Array.isArray(parsed.notes)) {
        throw new Error('This file is not a supported CherryPad backup.');
      }

      const seenIds = new Set();
      const importedNotes = parsed.notes.map(function (note, index) {
        return normalizeNote(note, index, seenIds);
      }).filter(Boolean);
      const importedConnections = normalizeConnections(parsed.connections, importedNotes);
      const importedStrokes = normalizeStrokes(parsed.strokes === undefined ? [] : parsed.strokes);
      if (parsed.strokes !== undefined && !Array.isArray(parsed.strokes)) {
        throw new Error('This file contains invalid CherryPad drawings.');
      }

      model.notes = importedNotes;
      model.connections = importedConnections;
      model.strokes = importedStrokes;
      model.selectedNoteId = null;
      model.currentNoteId = null;
      model.selectedStrokeId = null;
      boardWorld.replaceChildren();
      boardWorld.appendChild(boardCenterMarker);
      boardWorld.appendChild(connectionLayer);
      boardWorld.appendChild(drawingLayer);
      model.notes.forEach(createNoteElement);
      renderConnections();
      renderStrokes();
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
  const clearMenu = document.getElementById('clearMenu');
  let clearConfirmationTimer;
  let pendingClearType = null;
  const clearActions = {
    notes: {
      label: 'Notes',
      status: 'Notes cleared',
      run: function () {
        model.notes = [];
        model.connections = [];
        model.selectedNoteId = null;
        model.currentNoteId = null;
        boardWorld.querySelectorAll('.sticky-note').forEach(function (card) {
          card.remove();
        });
        renderConnections();
        updateCount();
        saveBoard();
      }
    },
    drawings: {
      label: 'Drawing',
      status: 'Drawings cleared',
      run: function () {
        model.strokes = [];
        model.selectedStrokeId = null;
        renderStrokes();
        updateCount();
        saveBoard();
      }
    },
    all: {
      label: 'All',
      status: 'Board cleared',
      run: function () {
        model.notes = [];
        model.connections = [];
        model.strokes = [];
        model.selectedNoteId = null;
        model.currentNoteId = null;
        model.selectedStrokeId = null;
        boardWorld.querySelectorAll('.sticky-note').forEach(function (card) {
          card.remove();
        });
        renderConnections();
        renderStrokes();
        updateCount();
        saveBoard();
      }
    }
  };
  clearMenu.querySelectorAll('[data-clear-type]').forEach(function (button) {
    const type = button.dataset.clearType;
    const action = clearActions[type];
    button.addEventListener('click', function () {
      if (pendingClearType !== type) {
        window.clearTimeout(clearConfirmationTimer);
        clearMenu.querySelectorAll('[data-clear-type]').forEach(function (item) {
          item.querySelector('span').textContent = clearActions[item.dataset.clearType].label;
        });
        pendingClearType = type;
        button.querySelector('span').textContent = 'Confirm';
        clearConfirmationTimer = window.setTimeout(function () {
          pendingClearType = null;
          button.querySelector('span').textContent = action.label;
        }, 3000);
        return;
      }

      window.clearTimeout(clearConfirmationTimer);
      pendingClearType = null;
      button.querySelector('span').textContent = action.label;
      setToolbarMenuOpen(clearMenu, false);
      action.run();
      setStatus(action.status);
    });
  });
  document.querySelectorAll('[data-backup-action]').forEach(function (button) {
    button.addEventListener('click', function () {
      setToolbarMenuOpen(document.getElementById('backupMenu'), false);
      if (button.dataset.backupAction === 'export') exportBoard();
      else importInput.click();
    });
  });
  importInput.addEventListener('change', function () {
    if (importInput.files && importInput.files[0]) importBoard(importInput.files[0]);
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
  boardViewport.addEventListener('pointerdown', function (event) {
    if (model.drawingActive && event.button === 0
      && !event.target.closest('.sticky-note, .drawing-group')) {
      event.preventDefault();
      selectNote(null);
      model.selectedStrokeId = null;
      renderStrokes();
      const rect = boardViewport.getBoundingClientRect();
      const point = {
        x: clamp((event.clientX - rect.left - model.x) / model.zoom, 0, BOARD_WIDTH),
        y: clamp((event.clientY - rect.top - model.y) / model.zoom, 0, BOARD_HEIGHT)
      };
      const preview = document.createElementNS(SVG_NS, 'path');
      preview.classList.add('drawing-stroke', 'drawing-preview');
      preview.setAttribute('stroke', model.drawColor);
      preview.style.setProperty('--stroke-width', `${model.drawWidth}px`);
      preview.setAttribute('d', `M ${point.x} ${point.y} L ${point.x} ${point.y}`);
      drawingLayer.appendChild(preview);
      boardViewport.setPointerCapture(event.pointerId);
      model.drag = {
        type: 'draw',
        pointerId: event.pointerId,
        stroke: { id: makeId(), color: model.drawColor, width: model.drawWidth, points: [point] },
        preview: preview
      };
      return;
    }
    if (event.button !== 0 || event.target.closest('.sticky-note, .connection-group, .drawing-group')) return;
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
    if (drag.type === 'draw') {
      const viewportRect = boardViewport.getBoundingClientRect();
      const point = {
        x: clamp((event.clientX - viewportRect.left - model.x) / model.zoom, 0, BOARD_WIDTH),
        y: clamp((event.clientY - viewportRect.top - model.y) / model.zoom, 0, BOARD_HEIGHT)
      };
      const previousPoint = drag.stroke.points[drag.stroke.points.length - 1];
      if (Math.hypot(point.x - previousPoint.x, point.y - previousPoint.y) >= 1) {
        drag.stroke.points.push(point);
        drag.preview.setAttribute('d', drag.stroke.points.map(function (item, index) {
          return `${index === 0 ? 'M' : 'L'} ${item.x} ${item.y}`;
        }).join(' '));
      }
    } else if (drag.type === 'connection') {
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
    if (model.drag.type === 'draw') {
      const drag = model.drag;
      const viewportRect = boardViewport.getBoundingClientRect();
      const endPoint = {
        x: clamp((event.clientX - viewportRect.left - model.x) / model.zoom, 0, BOARD_WIDTH),
        y: clamp((event.clientY - viewportRect.top - model.y) / model.zoom, 0, BOARD_HEIGHT)
      };
      const lastPoint = drag.stroke.points[drag.stroke.points.length - 1];
      if (Math.hypot(endPoint.x - lastPoint.x, endPoint.y - lastPoint.y) >= 1) {
        drag.stroke.points.push(endPoint);
      }
      model.strokes.push(drag.stroke);
      model.drag = null;
      renderStrokes();
      updateCount();
      saveBoard();
      setStatus('Drawing saved');
      return;
    }
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
      if (model.drag.type === 'draw') model.drag.preview.remove();
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
    if ((event.key === 'Delete' || event.key === 'Backspace')
      && model.selectedStrokeId
      && !event.target.matches('input, textarea, [contenteditable="true"]')) {
      event.preventDefault();
      removeStroke(model.selectedStrokeId);
      return;
    }
    if (event.key.toLowerCase() === 'n' && !event.ctrlKey && !event.metaKey && !event.altKey && !event.target.matches('input, textarea')) {
      event.preventDefault();
      addNote();
    }
  });

  window.addEventListener('resize', function () {
    if (!drawColorMenu.hidden) setDrawMenuOpen(true);
    if (model.notes.length === 0 && !localStorage.getItem(STORAGE_KEY)) centerBoard();
  });

  loadBoard();
}());
// Custom Tables Script - Multi-Stage Prototype

// State object for Custom Table Prototype
const orderState = {
  shape: null,
  dimensions: {
    length: '',
    width: '',
    height: ''
  },
  materials: {
    tableTop: { material: '', style: '' },
    legs: { material: '', style: '' }
  },
  finishes: {
    tableTopColour: '',
    legsColour: ''
  }
};

document.addEventListener('DOMContentLoaded', () => {
  fetchDataAndInitialize();
  setupNavigationTabs();
});

async function fetchDataAndInitialize() {
  try {
    const response = await fetch('data/content.json');
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    
    // Set title if provided
    if (data.appTitle) {
      document.getElementById('app-title').textContent = data.appTitle;
    }

    // Initialize Stage 1 (Size) controls
    if (data.sizeStep) {
      renderShapeSegmentedControl(data.sizeStep.shapes);
      renderDimensionsControls(data.sizeStep.dimensions);
      validateStage1();
    }

    // Initialize Stage 2 (Material) controls
    if (data.materialStep) {
      renderMaterialControls(data.materialStep.sections);
      validateStage2();
    }

    // Initialize Stage 3 (Finish) controls
    if (data.finishStep) {
      renderFinishControls(data.finishStep.sections);
    }

    setupStageNavigation();

  } catch (error) {
    console.error('Error loading content.json:', error);
  }
}

// -------------------------------------------------------------
// STAGE 1: SIZE
// -------------------------------------------------------------

function renderShapeSegmentedControl(shapes) {
  const container = document.getElementById('shape-segmented');
  container.innerHTML = '';

  shapes.forEach((shape, index) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'segmented-option';
    button.textContent = shape;
    button.dataset.shape = shape;

    if (index === 0) {
      button.classList.add('selected');
      orderState.shape = shape;
    }

    button.addEventListener('click', () => {
      container.querySelectorAll('.segmented-option').forEach(btn => btn.classList.remove('selected'));
      button.classList.add('selected');
      orderState.shape = shape;
      validateStage1();
    });

    container.appendChild(button);
  });
}

function renderDimensionsControls(dimensions) {
  const container = document.getElementById('dimensions-container');
  container.innerHTML = '';

  dimensions.forEach(dim => {
    const row = document.createElement('div');
    row.className = 'dimension-row';

    const label = document.createElement('label');
    label.className = 'dimension-label';
    label.htmlFor = `input-${dim.key}`;
    label.textContent = dim.label;

    const input = document.createElement('input');
    input.type = 'text';
    input.id = `input-${dim.key}`;
    input.className = 'dimension-input';
    input.placeholder = `e.g. 4${dim.unit}`;

    const presetsContainer = document.createElement('div');
    presetsContainer.className = 'dimension-presets';

    const defaultPreset = dim.presets[0] || '';

    dim.presets.forEach((preset, index) => {
      const presetBtn = document.createElement('button');
      presetBtn.type = 'button';
      presetBtn.className = 'preset-pill';
      presetBtn.textContent = preset;
      presetBtn.dataset.value = preset;

      if (index === 0) {
        presetBtn.classList.add('selected');
      }

      presetBtn.addEventListener('click', () => {
        presetsContainer.querySelectorAll('.preset-pill').forEach(btn => btn.classList.remove('selected'));
        presetBtn.classList.add('selected');
        input.value = preset;
        orderState.dimensions[dim.key] = preset;
        validateStage1();
      });

      presetsContainer.appendChild(presetBtn);
    });

    if (defaultPreset) {
      input.value = defaultPreset;
      orderState.dimensions[dim.key] = defaultPreset;
    }

    input.addEventListener('input', () => {
      const val = input.value.trim();
      orderState.dimensions[dim.key] = val;

      const presets = presetsContainer.querySelectorAll('.preset-pill');
      presets.forEach(btn => {
        if (btn.dataset.value.toLowerCase() === val.toLowerCase()) {
          btn.classList.add('selected');
        } else {
          btn.classList.remove('selected');
        }
      });

      validateStage1();
    });

    row.appendChild(label);
    row.appendChild(input);
    row.appendChild(presetsContainer);
    container.appendChild(row);
  });
}

function validateStage1() {
  const nextBtn = document.getElementById('next-btn-size');
  
  const isShapeSelected = Boolean(orderState.shape);
  const isLengthDefined = Boolean(orderState.dimensions.length && orderState.dimensions.length.trim() !== '');
  const isWidthDefined = Boolean(orderState.dimensions.width && orderState.dimensions.width.trim() !== '');
  const isHeightDefined = Boolean(orderState.dimensions.height && orderState.dimensions.height.trim() !== '');

  const isFormValid = isShapeSelected && isLengthDefined && isWidthDefined && isHeightDefined;

  if (nextBtn) {
    nextBtn.disabled = !isFormValid;
  }
}

// -------------------------------------------------------------
// STAGE 2: MATERIAL (step2.jpeg)
// -------------------------------------------------------------

function renderMaterialControls(sections) {
  const container = document.getElementById('material-sections-container');
  if (!container) return;
  container.innerHTML = '';

  sections.forEach(sec => {
    const secEl = document.createElement('div');
    secEl.className = 'material-section';

    const title = document.createElement('h2');
    title.className = 'section-title';
    title.textContent = sec.label;
    secEl.appendChild(title);

    const materialSegmented = document.createElement('div');
    materialSegmented.className = 'segmented-control';

    sec.materials.forEach((mat, index) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'segmented-option';
      btn.textContent = mat;

      if (index === 0) {
        btn.classList.add('selected');
        orderState.materials[sec.key].material = mat;
      }

      btn.addEventListener('click', () => {
        materialSegmented.querySelectorAll('.segmented-option').forEach(b => b.classList.remove('selected'));
        btn.classList.add('selected');
        orderState.materials[sec.key].material = mat;
        validateStage2();
      });

      materialSegmented.appendChild(btn);
    });

    secEl.appendChild(materialSegmented);

    const styleRow = document.createElement('div');
    styleRow.className = 'style-row';

    const styleLabel = document.createElement('span');
    styleLabel.className = 'style-label';
    styleLabel.textContent = 'STYLE';

    const styleSegmented = document.createElement('div');
    styleSegmented.className = 'segmented-control style-segmented';
    styleSegmented.style.flex = '1';

    sec.styles.forEach((styleOpt, index) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'segmented-option';
      btn.textContent = styleOpt;

      if (index === 0) {
        btn.classList.add('selected');
        orderState.materials[sec.key].style = styleOpt;
      }

      btn.addEventListener('click', () => {
        styleSegmented.querySelectorAll('.segmented-option').forEach(b => b.classList.remove('selected'));
        btn.classList.add('selected');
        orderState.materials[sec.key].style = styleOpt;
        validateStage2();
      });

      styleSegmented.appendChild(btn);
    });

    styleRow.appendChild(styleLabel);
    styleRow.appendChild(styleSegmented);
    secEl.appendChild(styleRow);

    container.appendChild(secEl);
  });
}

function validateStage2() {
  const nextBtn = document.getElementById('next-btn-material');
  const tt = orderState.materials.tableTop;
  const legs = orderState.materials.legs;

  const isComplete = Boolean(tt.material && tt.style && legs.material && legs.style);
  if (nextBtn) {
    nextBtn.disabled = !isComplete;
  }
}

// -------------------------------------------------------------
// STAGE 3: FINISH (step3.jpeg)
// -------------------------------------------------------------

function renderFinishControls(sections) {
  const container = document.getElementById('finish-sections-container');
  if (!container) return;
  container.innerHTML = '';

  sections.forEach(sec => {
    const secEl = document.createElement('div');
    secEl.className = 'material-section';

    const title = document.createElement('h2');
    title.className = 'section-title';
    title.textContent = sec.label;
    secEl.appendChild(title);

    const finishSegmented = document.createElement('div');
    finishSegmented.className = 'segmented-control';

    sec.options.forEach((opt, index) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'segmented-option';
      btn.textContent = opt;

      if (index === 0) {
        btn.classList.add('selected');
        orderState.finishes[sec.key] = opt;
      }

      btn.addEventListener('click', () => {
        finishSegmented.querySelectorAll('.segmented-option').forEach(b => b.classList.remove('selected'));
        btn.classList.add('selected');
        orderState.finishes[sec.key] = opt;
      });

      finishSegmented.appendChild(btn);
    });

    secEl.appendChild(finishSegmented);
    container.appendChild(secEl);
  });
}

// -------------------------------------------------------------
// NAVIGATION & STEP SWITCHING LOGIC
// -------------------------------------------------------------

function setupStageNavigation() {
  // Stage 1 -> Stage 2
  const nextBtnSize = document.getElementById('next-btn-size');
  if (nextBtnSize) {
    nextBtnSize.addEventListener('click', () => {
      const materialTab = document.querySelector('.nav-tab[data-step="material"]');
      if (materialTab) materialTab.disabled = false;
      switchStage('material');
    });
  }

  // Stage 2 -> Stage 3
  const nextBtnMaterial = document.getElementById('next-btn-material');
  if (nextBtnMaterial) {
    nextBtnMaterial.addEventListener('click', () => {
      const finishTab = document.querySelector('.nav-tab[data-step="finish"]');
      if (finishTab) finishTab.disabled = false;
      switchStage('finish');
    });
  }

  // Stage 3 -> SEND Order
  const sendBtn = document.getElementById('send-btn');
  if (sendBtn) {
    sendBtn.addEventListener('click', () => {
      showOrderConfirmation();
    });
  }

  // Reset Button
  const resetBtn = document.getElementById('reset-btn');
  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      switchStage('size');
    });
  }
}

function setupNavigationTabs() {
  const tabs = document.querySelectorAll('.step-nav .nav-tab');
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      if (!tab.disabled) {
        const step = tab.dataset.step;
        switchStage(step);
      }
    });
  });
}

function switchStage(stageId) {
  document.querySelectorAll('.stage-container').forEach(stage => {
    stage.style.display = 'none';
  });

  const targetStage = document.getElementById(`stage-${stageId}`);
  if (targetStage) {
    targetStage.style.display = 'flex';
  }

  document.querySelectorAll('.step-nav .nav-tab').forEach(tab => {
    if (tab.dataset.step === stageId) {
      tab.classList.add('active');
    } else {
      tab.classList.remove('active');
    }
  });
}

function showOrderConfirmation() {
  const summaryContainer = document.getElementById('order-summary-details');
  if (summaryContainer) {
    summaryContainer.innerHTML = `
      <div class="summary-item"><span class="summary-label">Shape:</span> <span class="summary-value">${orderState.shape}</span></div>
      <div class="summary-item"><span class="summary-label">Dimensions:</span> <span class="summary-value">${orderState.dimensions.length} L × ${orderState.dimensions.width} W × ${orderState.dimensions.height} H</span></div>
      <div class="summary-item"><span class="summary-label">Table Top Material:</span> <span class="summary-value">${orderState.materials.tableTop.material} (${orderState.materials.tableTop.style})</span></div>
      <div class="summary-item"><span class="summary-label">Table Top Finish:</span> <span class="summary-value">${orderState.finishes.tableTopColour}</span></div>
      <div class="summary-item"><span class="summary-label">Legs Material:</span> <span class="summary-value">${orderState.materials.legs.material} (${orderState.materials.legs.style})</span></div>
      <div class="summary-item"><span class="summary-label">Legs Finish:</span> <span class="summary-value">${orderState.finishes.legsColour}</span></div>
    `;
  }
  switchStage('confirmation');
}

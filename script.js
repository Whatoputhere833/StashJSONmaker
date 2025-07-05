const createItem = () => ({
  itemID: '',
  colorHue: 0,
  colorSaturation: 0,
  scaleModifier: 0,
  children: []
});

let rootItem = createItem();

function renderEditor(container, item, onUpdate) {
  const block = document.createElement('div');
  block.className = 'item-block';

  const createInput = (labelText, field, type = 'text', min = null, max = null, placeholder = '') => {
    const label = document.createElement('label');
    label.className = 'itemCl';
    label.textContent = labelText;

    const container = document.createElement('div');
    container.style.display = 'flex';
    container.style.alignItems = 'center';
    container.style.gap = '8px';
    container.style.marginBottom = '10px';

    const input = document.createElement('input');
    input.type = type;
    if (min !== null) input.min = min;
    if (max !== null) input.max = max;
    if (placeholder) input.placeholder = placeholder;
    input.value = item[field];
    input.style.flex = '1';

    if (type === 'range') {
      const numberBox = document.createElement('input');
      numberBox.type = 'number';
      numberBox.min = min;
      numberBox.max = max;
      numberBox.value = item[field];
      numberBox.style.width = '70px';

      input.oninput = () => {
        item[field] = parseInt(input.value);
        numberBox.value = input.value;
        updateJSON();
      };

      numberBox.oninput = () => {
        let value = parseInt(numberBox.value);
        if (!isNaN(value)) {
          value = Math.min(max, Math.max(min, value));
          item[field] = value;
          input.value = value;
          updateJSON();
        }
      };

      const randomBtn = document.createElement('button');
      randomBtn.textContent = '🎲';
      randomBtn.title = 'Randomize value';
      randomBtn.style.width = '40px';
      randomBtn.onclick = () => {
        const random = Math.floor(Math.random() * (max - min + 1)) + min;
        item[field] = random;
        input.value = random;
        numberBox.value = random;
        updateJSON();
      };

      container.appendChild(input);
      container.appendChild(numberBox);
      container.appendChild(randomBtn);
    } else {
      input.oninput = () => {
        item[field] = input.value;
        updateJSON();
      };
      input.placeholder = placeholder;
      container.appendChild(input);
    }

    label.appendChild(container);
    block.appendChild(label);
  };

  createInput('Item ID:', 'itemID', 'text', null, null, 'type item id here...');
  createInput('Hue:', 'colorHue', 'range', 0, 240);
  createInput('Saturation:', 'colorSaturation', 'range', -124, 124);
  createInput('Scale Modifier:', 'scaleModifier', 'range', -128, 128);

  const childrenContainer = document.createElement('div');
  block.appendChild(childrenContainer);

  const addChildBtn = document.createElement('button');
  addChildBtn.textContent = 'Add Child';
  addChildBtn.onclick = () => {
    item.children.push(createItem());
    updateJSON();
    renderAll();
  };
  block.appendChild(addChildBtn);

  if (onUpdate) {
    const removeBtn = document.createElement('button');
    removeBtn.textContent = 'Remove Item';
    removeBtn.onclick = () => {
      onUpdate();
      updateJSON();
      renderAll();
    };
    block.appendChild(removeBtn);
  }

  item.children.forEach((child, i) => {
    renderEditor(childrenContainer, child, () => {
      item.children.splice(i, 1);
    });
  });

  container.appendChild(block);
}

function renderAll() {
  const container = document.getElementById('editor');
  container.innerHTML = '';
  renderEditor(container, rootItem);
  updateJSON();
}

function updateJSON() {
  const clean = (item) => {
    const base = {
      itemID: item.itemID,
      colorHue: item.colorHue,
      colorSaturation: item.colorSaturation,
      scaleModifier: item.scaleModifier
    };
    if (item.children.length > 0) {
      base.children = item.children.map(clean);
    }
    return base;
  };

  const output = document.getElementById('json-output');
  output.textContent = JSON.stringify(clean(rootItem), null, 4);
}

function downloadJSON() {
  const json = document.getElementById('json-output').textContent;
  const filenameInput = document.getElementById('filename');
  let filename = filenameInput.value.trim() || 'stash';

  if (!filename.toLowerCase().endsWith('.json')) {
    filename += '.json';
  }

  const blob = new Blob([json], { type: 'application/json' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = filename;
  a.click();
}

renderAll();

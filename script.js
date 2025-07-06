const colorTemplates = [
  { name: 'Galaxy 1', colorHue: 180, colorSaturation: 117 },
  { name: 'Galaxy 2', colorHue: 159, colorSaturation: 120 },
  { name: 'Gold 1',   colorHue: 45,  colorSaturation: 120 },
  { name: 'Diamond 1', colorHue: 120, colorSaturation: 120 },
  { name: 'Diamond 2', colorHue: 90,  colorSaturation: 120 },
  { name: 'Ruby 1',    colorHue: 0,   colorSaturation: 120 }
];

const createItem = () => ({
  itemID: '',
  colorHue: 0,
  colorSaturation: 0,
  scaleModifier: 0,
  children: []
});

let rootItem = createItem();

function renderEditor(container, item, onRemove) {
  const block = document.createElement('div');
  block.className = 'item-block';

  const createDropdown = (labelText, field) => {
    const label = document.createElement('label');
    label.textContent = labelText;

    const select = document.createElement('select');
    const datalist = document.getElementById('item-options');
    const options = datalist.querySelectorAll('option');

    options.forEach(opt => {
      const option = document.createElement('option');
      option.value = opt.value;
      option.textContent = opt.value;
      select.appendChild(option);
    });

    select.value = item[field] || '';
    item[field] = select.value;

    select.onchange = () => {
      item[field] = select.value;
      updateJSON();
    };

    label.appendChild(select);
    block.appendChild(label);
  };

  const createInput = (labelText, field, type = 'text', min = null, max = null, placeholder = '') => {
    const label = document.createElement('label');
    label.className = 'itemCl';
    label.textContent = labelText;

    const fieldContainer = document.createElement('div');
    fieldContainer.style.display = 'flex';
    fieldContainer.style.alignItems = 'center';
    fieldContainer.style.gap = '8px';
    fieldContainer.style.marginBottom = '10px';

    const input = document.createElement('input');
    input.type = type;
    if (min !== null) input.min = min;
    if (max !== null) input.max = max;
    input.placeholder = placeholder || '';
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

      fieldContainer.appendChild(input);
      fieldContainer.appendChild(numberBox);
      fieldContainer.appendChild(randomBtn);
    } else {
      input.oninput = () => {
        item[field] = input.value;
        updateJSON();
      };
      fieldContainer.appendChild(input);
    }

    label.appendChild(fieldContainer);
    block.appendChild(label);
  };

  createDropdown('Item ID:', 'itemID');
  createInput('Hue:', 'colorHue', 'range', 0, 240);
  createInput('Saturation:', 'colorSaturation', 'range', -124, 124);
  createInput('Scale Modifier:', 'scaleModifier', 'range', -128, 128);

  const templateContainer = document.createElement('div');
  templateContainer.className = 'template-buttons';

  colorTemplates.forEach(template => {
    const btn = document.createElement('button');
    btn.style.display = 'flex';
    btn.style.alignItems = 'center';
    btn.style.gap = '8px';

    const swatch = document.createElement('span');
    swatch.style.width = '20px';
    swatch.style.height = '20px';
    swatch.style.borderRadius = '50%';
    swatch.style.border = '1px solid white';

    const hue = Math.round((template.colorHue / 240) * 355);
    const sat = Math.round(((template.colorSaturation + 124) / 248) * 100);
    swatch.style.background = `hsl(${hue}, ${sat}%, 50%)`;

    const label = document.createElement('span');
    label.textContent = template.name;

    btn.appendChild(swatch);
    btn.appendChild(label);

    btn.onclick = () => {
      item.colorHue = template.colorHue;
      item.colorSaturation = template.colorSaturation;
      updateJSON();
      renderAll();
    };

    templateContainer.appendChild(btn);
  });

  block.appendChild(templateContainer);

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

  if (onRemove) {
    const removeBtn = document.createElement('button');
    removeBtn.textContent = 'Remove Item';
    removeBtn.onclick = () => {
      onRemove();
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

// Style toggle
document.getElementById('styleSelect').addEventListener('change', (e) => {
  const value = e.target.value;
  const link = document.getElementById('theme-style');

  if (value === 'ac') {
    link.href = 'animal-company.css';
  } else {
    link.href = 'default.css';
  }
});


renderAll();

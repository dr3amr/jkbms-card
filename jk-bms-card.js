/**
 * JK-BMS Custom Lovelace Card with Full Visual UI Editor
 * Replicates JK-BMS Android App UI with customizable alignment & column spacing
 */

// --- MAIN CARD CLASS ---
class JkBmsCard extends HTMLElement {
  set hass(hass) {
    this._hass = hass;
    if (!this.content) {
      this.innerHTML = `
        <style>
          ha-card {
            background-color: var(--card-background-color, #1a1a1a);
            color: #ffffff;
            font-family: var(--paper-font-body1_-_font-family, Roboto, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif);
            padding: 12px;
            border-radius: 12px;
          }
          .section {
            background: #121212;
            border-radius: 8px;
            padding: 12px;
            margin-bottom: 10px;
          }
          .section:last-child {
            margin-bottom: 0;
          }
          /* Section 1 */
          .s1-header {
            text-align: center;
            font-size: 14px;
            margin-bottom: 8px;
            font-weight: 500;
          }
          .s1-time {
            color: var(--time-color, #2196f3);
            font-weight: bold;
          }
          .s1-status-row {
            display: flex;
            justify-content: space-around;
            font-size: 13px;
          }
          .s1-status-val {
            color: var(--primary-green-color, #2e7d32);
            font-weight: bold;
          }
          /* Section 2 */
          .s2-main-vals {
            display: flex;
            justify-content: space-around;
            font-size: 26px;
            font-weight: bold;
            color: var(--primary-green-color, #2e7d32);
            margin-bottom: 8px;
          }
          .s2-columns {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 0 24px;
            font-size: 12px;
          }
          .s2-col {
            display: flex;
            flex-direction: column;
            gap: 5px;
          }
          .s2-item {
            display: flex;
            gap: 6px;
          }
          .s2-item.align-center {
            justify-content: center;
          }
          .s2-item.align-space-between {
            justify-content: space-between;
          }
          .s2-item.align-flex-start {
            justify-content: flex-start;
          }
          .s2-item.align-flex-end {
            justify-content: flex-end;
          }
          .s2-label { color: #ffffff; }
          .s2-val {
            color: var(--sec2-value-color, #ffffff);
            font-weight: 500;
          }
          /* Section 3 */
          .s3-title {
            text-align: center;
            font-weight: bold;
            font-size: 14px;
            margin-bottom: 8px;
            color: #ffffff;
          }
          .cells-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            column-gap: 28px;
            row-gap: 4px;
            font-family: monospace;
            font-size: 12px;
          }
          .cell-row {
            display: flex;
            justify-content: space-between;
          }
          .cell-num { color: #ffffff; }
          .cell-v { color: #ffffff; }
          .cell-v.max-v { color: var(--max-cell-color, #2196f3) !important; font-weight: bold; }
          .cell-v.min-v { color: var(--min-cell-color, #f44336) !important; font-weight: bold; }
          .cell-r { color: #ffffff; }
          /* Section 4 */
          .s4-row {
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 6px 0;
          }
          .s4-left {
            display: flex;
            align-items: center;
            gap: 10px;
          }
          .clickable { cursor: pointer; }
        </style>
        <ha-card id="card-content"></ha-card>
      `;
      this.content = this.querySelector("#card-content");
    }

    this.render();
  }

  static getConfigElement() {
    return document.createElement("jk-bms-card-editor");
  }

  static getStubConfig() {
    return {
      prefix: "jk-bms",
      cell_count: 16,
      show_section_1: true,
      show_section_2: true,
      show_section_3: true,
      show_section_4: true,
      show_cells_title: true,
      sec2_align: "center",
      primary_green_color: "#2e7d32",
      time_color: "#2196f3",
      max_cell_color: "#2196f3",
      min_cell_color: "#f44336",
      sec2_value_color: "#ffffff"
    };
  }

  setConfig(config) {
    this._config = Object.assign({}, config);
    this._prefix = this._config.prefix || 'jk-bms';
    
    // Colors
    this._greenColor = this._config.primary_green_color || '#2e7d32';
    this._timeColor = this._config.time_color || '#2196f3';
    this._maxCellColor = this._config.max_cell_color || '#2196f3';
    this._minCellColor = this._config.min_cell_color || '#f44336';
    this._sec2ValColor = this._config.sec2_value_color || '#ffffff';

    // Alignment for Section 2 items (default: center)
    this._sec2Align = this._config.sec2_align || 'center';

    // Visibility
    this._showS1 = this._config.show_section_1 !== false;
    this._showS2 = this._config.show_section_2 !== false;
    this._showS3 = this._config.show_section_3 !== false;
    this._showS4 = this._config.show_section_4 !== false;
    this._showCellsTitle = this._config.show_cells_title !== false;
    
    this._cellCount = parseInt(this._config.cell_count || 16, 10);

    // Section 2 Items
    this._sec2Items = this._config.sec2_items || [
      { label: 'Battery Power:', entity_suffix: 'power', unit: 'W', column: 1 },
      { label: 'Remain Battery:', entity_suffix: 'capacity_remaining_percentage', unit: '%', column: 2 },
      { label: 'Battery Capacity:', entity_suffix: 'total_capacity', unit: 'Ah', column: 1 },
      { label: 'Remain Capacity:', entity_suffix: 'capacity_remaining', unit: 'Ah', column: 2 },
      { label: 'Cycle Capacity:', entity_suffix: 'charging_cycles_capacity', unit: 'Ah', column: 1 },
      { label: 'Cycle Count:', entity_suffix: 'charging_cycles', unit: '', column: 2 },
      { label: 'Ave. Cell Vol.:', entity_suffix: 'average_cell_voltage', unit: 'V', column: 1 },
      { label: 'Delta Cell Vol.:', entity_suffix: 'delta_cell_voltage', unit: 'V', column: 2 },
      { label: 'Balance Cur.:', entity_suffix: 'balancing_current', unit: 'A', column: 1 },
      { label: 'MOS Temp.:', entity_suffix: 'mosfet_temperature', unit: '°C', column: 2 },
      { label: 'Battery T1:', entity_suffix: 'temperature_sensor_1', unit: '°C', column: 1 },
      { label: 'Battery T2:', entity_suffix: 'temperature_sensor_2', unit: '°C', column: 2 }
    ];
  }

  getEntity(suffix, override) {
    if (override) return override;
    return `sensor.${this._prefix}_${suffix}`;
  }

  getSwitchEntity(suffix, override) {
    if (override) return override;
    return `switch.${this._prefix}_${suffix}`;
  }

  getVal(entityId, defaultVal = '--') {
    const stateObj = this._hass ? this._hass.states[entityId] : null;
    return stateObj ? stateObj.state : defaultVal;
  }

  fireMoreInfo(entityId) {
    if (!entityId || !this._hass.states[entityId]) return;
    const event = new Event('hass-more-info', { bubbles: true, composed: true });
    event.detail = { entityId };
    this.dispatchEvent(event);
  }

  toggleSwitch(entityId, currentStatus) {
    if (!entityId || !this._hass.states[entityId]) return;
    const service = currentStatus === 'on' ? 'turn_off' : 'turn_on';
    this._hass.callService('switch', service, { entity_id: entityId });
  }

  render() {
    if (!this._hass) return;

    this.style.setProperty('--primary-green-color', this._greenColor);
    this.style.setProperty('--time-color', this._timeColor);
    this.style.setProperty('--max-cell-color', this._maxCellColor);
    this.style.setProperty('--min-cell-color', this._minCellColor);
    this.style.setProperty('--sec2-value-color', this._sec2ValColor);

    const entTime = this.getEntity('uptime', this._config.entity_uptime);
    const entChargeState = this.getEntity('charging', this._config.entity_charging_state);
    const entDischargeState = this.getEntity('discharging', this._config.entity_discharging_state);
    const entBalancingState = this.getEntity('balancing', this._config.entity_balancing_state);

    const entTotalV = this.getEntity('total_voltage', this._config.entity_total_voltage);
    const entCurrent = this.getEntity('current', this._config.entity_current);

    const entMaxCellNum = this.getEntity('max_voltage_cell', this._config.entity_max_voltage_cell);
    const entMinCellNum = this.getEntity('min_voltage_cell', this._config.entity_min_voltage_cell);

    const entSwBalancer = this.getSwitchEntity('balancer', this._config.entity_switch_balancer);
    const entSwCharge = this.getSwitchEntity('charging', this._config.entity_switch_charging);
    const entSwDischarge = this.getSwitchEntity('discharging', this._config.entity_switch_discharging);

    const maxCellNum = parseInt(this.getVal(entMaxCellNum, '0'), 10);
    const minCellNum = parseInt(this.getVal(entMinCellNum, '0'), 10);

    let html = '';

    // --- SECTION 1 ---
    if (this._showS1) {
      html += `
        <div class="section">
          <div class="s1-header clickable" data-entity="${entTime}">
            Time: <span class="s1-time">${this.getVal(entTime)}</span>
          </div>
          <div class="s1-status-row">
            <div class="clickable" data-entity="${entChargeState}">Charge: <span class="s1-status-val">${this.getVal(entChargeState).toUpperCase()}</span></div>
            <div class="clickable" data-entity="${entDischargeState}">Discharge: <span class="s1-status-val">${this.getVal(entDischargeState).toUpperCase()}</span></div>
            <div class="clickable" data-entity="${entBalancingState}">Balance: <span class="s1-status-val">${this.getVal(entBalancingState).toUpperCase()}</span></div>
          </div>
        </div>
      `;
    }

    // --- SECTION 2 ---
    if (this._showS2) {
      let col1Html = '';
      let col2Html = '';

      this._sec2Items.forEach((item, index) => {
        const entId = item.entity || this.getEntity(item.entity_suffix);
        const val = this.getVal(entId);
        const unitStr = item.unit ? ` ${item.unit}` : '';

        const itemHtml = `
          <div class="s2-item align-${this._sec2Align} clickable" data-entity="${entId}">
            <span class="s2-label">${item.label}</span>
            <span class="s2-val">${val}${unitStr}</span>
          </div>
        `;

        const targetCol = item.column ? parseInt(item.column, 10) : (index % 2 === 0 ? 1 : 2);
        if (targetCol === 1) col1Html += itemHtml;
        else col2Html += itemHtml;
      });

      html += `
        <div class="section">
          <div class="s2-main-vals">
            <span class="clickable" data-entity="${entTotalV}">${this.getVal(entTotalV)} V</span>
            <span class="clickable" data-entity="${entCurrent}">${this.getVal(entCurrent)} A</span>
          </div>
          <div class="s2-columns">
            <div class="s2-col">${col1Html}</div>
            <div class="s2-col">${col2Html}</div>
          </div>
        </div>
      `;
    }

    // --- SECTION 3 ---
    if (this._showS3) {
      const half = Math.ceil(this._cellCount / 2);
      let leftCellsHtml = '';
      let rightCellsHtml = '';

      for (let i = 1; i <= this._cellCount; i++) {
        const cellIdStr = i.toString().padStart(2, '0');
        const entCellV = this.getEntity(`cell_${i}_voltage`, this._config[`entity_cell_${i}_voltage`]);
        const entCellR = this.getEntity(`cell_${i}_resistance`, this._config[`entity_cell_${i}_resistance`]);

        const valV = this.getVal(entCellV, '0.000');
        const valR = this.getVal(entCellR, '0.000');

        let colorClass = '';
        if (i === maxCellNum) colorClass = 'max-v';
        else if (i === minCellNum) colorClass = 'min-v';

        const rowHtml = `
          <div class="cell-row">
            <span class="cell-num">${cellIdStr}.</span>
            <span class="cell-v ${colorClass} clickable" data-entity="${entCellV}">${valV} V</span>
            <span style="color: #666;">/</span>
            <span class="cell-r clickable" data-entity="${entCellR}">${valR} Ω</span>
          </div>
        `;

        if (i <= half) leftCellsHtml += rowHtml;
        else rightCellsHtml += rowHtml;
      }

      html += `
        <div class="section">
          ${this._showCellsTitle ? '<div class="s3-title">Cells</div>' : ''}
          <div class="cells-grid">
            <div>${leftCellsHtml}</div>
            <div>${rightCellsHtml}</div>
          </div>
        </div>
      `;
    }

    // --- SECTION 4 ---
    if (this._showS4) {
      const balState = this._hass.states[entSwBalancer];
      const chgState = this._hass.states[entSwCharge];
      const disState = this._hass.states[entSwDischarge];

      html += `
        <div class="section">
          <div class="s4-row">
            <div class="s4-left clickable" data-entity="${entSwBalancer}">
              <ha-icon icon="mdi:scale-balance"></ha-icon>
              <span>Balancer</span>
            </div>
            <ha-switch 
              .checked=${balState ? balState.state === 'on' : false} 
              data-switch-entity="${entSwBalancer}"
              data-status="${balState ? balState.state : 'off'}">
            </ha-switch>
          </div>
          <div class="s4-row">
            <div class="s4-left clickable" data-entity="${entSwCharge}">
              <ha-icon icon="mdi:battery-charging"></ha-icon>
              <span>Charging</span>
            </div>
            <ha-switch 
              .checked=${chgState ? chgState.state === 'on' : false} 
              data-switch-entity="${entSwCharge}"
              data-status="${chgState ? chgState.state : 'off'}">
            </ha-switch>
          </div>
          <div class="s4-row">
            <div class="s4-left clickable" data-entity="${entSwDischarge}">
              <ha-icon icon="mdi:battery-charging"></ha-icon>
              <span>Discharging</span>
            </div>
            <ha-switch 
              .checked=${disState ? disState.state === 'on' : false} 
              data-switch-entity="${entSwDischarge}"
              data-status="${disState ? disState.state : 'off'}">
            </ha-switch>
          </div>
        </div>
      `;
    }

    this.content.innerHTML = html;

    this.content.querySelectorAll('.clickable').forEach(el => {
      el.addEventListener('click', (e) => {
        e.stopPropagation();
        const entity = el.getAttribute('data-entity');
        if (entity) this.fireMoreInfo(entity);
      });
    });

    this.content.querySelectorAll('ha-switch').forEach(sw => {
      sw.addEventListener('change', (e) => {
        e.stopPropagation();
        const entity = sw.getAttribute('data-switch-entity');
        const status = sw.getAttribute('data-status');
        this.toggleSwitch(entity, status);
      });
    });
  }

  getCardSize() {
    return 6;
  }
}

// --- VISUAL UI CARD EDITOR ---
class JkBmsCardEditor extends HTMLElement {
  setConfig(config) {
    this._config = Object.assign({}, config);
    this.render();
  }

  set hass(hass) {
    this._hass = hass;
  }

  render() {
    if (!this._config) return;

    const sec2Items = this._config.sec2_items || [
      { label: 'Battery Power:', entity_suffix: 'power', unit: 'W', column: 1 },
      { label: 'Remain Battery:', entity_suffix: 'capacity_remaining_percentage', unit: '%', column: 2 },
      { label: 'Battery Capacity:', entity_suffix: 'total_capacity', unit: 'Ah', column: 1 },
      { label: 'Remain Capacity:', entity_suffix: 'capacity_remaining', unit: 'Ah', column: 2 },
      { label: 'Cycle Capacity:', entity_suffix: 'charging_cycles_capacity', unit: 'Ah', column: 1 },
      { label: 'Cycle Count:', entity_suffix: 'charging_cycles', unit: '', column: 2 },
      { label: 'Ave. Cell Vol.:', entity_suffix: 'average_cell_voltage', unit: 'V', column: 1 },
      { label: 'Delta Cell Vol.:', entity_suffix: 'delta_cell_voltage', unit: 'V', column: 2 },
      { label: 'Balance Cur.:', entity_suffix: 'balancing_current', unit: 'A', column: 1 },
      { label: 'MOS Temp.:', entity_suffix: 'mosfet_temperature', unit: '°C', column: 2 },
      { label: 'Battery T1:', entity_suffix: 'temperature_sensor_1', unit: '°C', column: 1 },
      { label: 'Battery T2:', entity_suffix: 'temperature_sensor_2', unit: '°C', column: 2 }
    ];

    let itemsHtml = '';
    sec2Items.forEach((item, idx) => {
      itemsHtml += `
        <div style="border: 1px solid #444; border-radius: 6px; padding: 8px; margin-bottom: 8px; background: #222;">
          <div style="display: flex; gap: 8px; margin-bottom: 6px;">
            <input type="text" placeholder="Label" value="${item.label || ''}" data-idx="${idx}" data-field="label" style="flex:2; padding:4px;">
            <input type="text" placeholder="Suffix" value="${item.entity_suffix || ''}" data-idx="${idx}" data-field="entity_suffix" style="flex:2; padding:4px;">
            <input type="text" placeholder="Unit" value="${item.unit || ''}" data-idx="${idx}" data-field="unit" style="flex:1; padding:4px;">
            <select data-idx="${idx}" data-field="column" style="flex:1; padding:4px;">
              <option value="1" ${item.column == 1 ? 'selected' : ''}>Col 1</option>
              <option value="2" ${item.column == 2 ? 'selected' : ''}>Col 2</option>
            </select>
            <button class="btn-del" data-idx="${idx}" style="background:#f44336; color:#fff; border:none; border-radius:4px; padding:0 8px; cursor:pointer;">X</button>
          </div>
          <input type="text" placeholder="Full Entity (Optional override)" value="${item.entity || ''}" data-idx="${idx}" data-field="entity" style="width: 96%; padding:4px;">
        </div>
      `;
    });

    const alignVal = this._config.sec2_align || 'center';

    this.innerHTML = `
      <style>
        .editor-row { display: flex; align-items: center; justify-content: space-between; margin-bottom: 10px; }
        .editor-row label { font-weight: bold; }
        .editor-row input, .editor-row select { padding: 6px; border-radius: 4px; border: 1px solid #555; background: #111; color: #fff; }
        .sec-title { font-size: 15px; font-weight: bold; margin: 16px 0 8px 0; border-bottom: 1px solid #444; padding-bottom: 4px; }
      </style>
      <div>
        <div class="sec-title">General Settings</div>
        <div class="editor-row"><label>Device Prefix:</label><input type="text" id="prefix" value="${this._config.prefix || 'jk-bms'}"></div>
        <div class="editor-row"><label>Cell Count:</label><input type="number" id="cell_count" value="${this._config.cell_count || 16}"></div>

        <div class="sec-title">Section Visibility</div>
        <div class="editor-row"><label>Show Section 1 (Header Status):</label><input type="checkbox" id="show_section_1" ${this._config.show_section_1 !== false ? 'checked' : ''}></div>
        <div class="editor-row"><label>Show Section 2 (Grid Data):</label><input type="checkbox" id="show_section_2" ${this._config.show_section_2 !== false ? 'checked' : ''}></div>
        <div class="editor-row"><label>Show Section 3 (Cell Voltages):</label><input type="checkbox" id="show_section_3" ${this._config.show_section_3 !== false ? 'checked' : ''}></div>
        <div class="editor-row"><label>Show Section 4 (Switches):</label><input type="checkbox" id="show_section_4" ${this._config.show_section_4 !== false ? 'checked' : ''}></div>
        <div class="editor-row"><label>Show "Cells" Title in Sec 3:</label><input type="checkbox" id="show_cells_title" ${this._config.show_cells_title !== false ? 'checked' : ''}></div>

        <div class="sec-title">Section 2 Layout & Text Alignment</div>
        <div class="editor-row">
          <label>Sec 2 Text Alignment:</label>
          <select id="sec2_align">
            <option value="center" ${alignVal === 'center' ? 'selected' : ''}>Centered (Default)</option>
            <option value="space-between" ${alignVal === 'space-between' ? 'selected' : ''}>Spread (Left & Right Ends)</option>
            <option value="flex-start" ${alignVal === 'flex-start' ? 'selected' : ''}>Align Left</option>
            <option value="flex-end" ${alignVal === 'flex-end' ? 'selected' : ''}>Align Right</option>
          </select>
        </div>

        <div class="sec-title">Color Customization</div>
        <div class="editor-row"><label>Primary Green Color:</label><input type="color" id="primary_green_color" value="${this._config.primary_green_color || '#2e7d32'}"></div>
        <div class="editor-row"><label>Time Color:</label><input type="color" id="time_color" value="${this._config.time_color || '#2196f3'}"></div>
        <div class="editor-row"><label>Highest Cell Color (Blue):</label><input type="color" id="max_cell_color" value="${this._config.max_cell_color || '#2196f3'}"></div>
        <div class="editor-row"><label>Lowest Cell Color (Red):</label><input type="color" id="min_cell_color" value="${this._config.min_cell_color || '#f44336'}"></div>
        <div class="editor-row"><label>Section 2 Values Color:</label><input type="color" id="sec2_value_color" value="${this._config.sec2_value_color || '#ffffff'}"></div>

        <div class="sec-title">Section 2 Items & Column Placement</div>
        <div id="sec2-items-container">${itemsHtml}</div>
        <button id="btn-add-item" style="background:#2e7d32; color:#fff; border:none; border-radius:4px; padding:6px 12px; cursor:pointer; margin-top:4px;">+ Add Item</button>
      </div>
    `;

    // Bind inputs
    this.querySelectorAll('input[type="text"], input[type="number"], input[type="color"], select#sec2_align').forEach(el => {
      if (el.id) el.addEventListener('change', this._valueChanged.bind(this));
    });

    this.querySelectorAll('input[type="checkbox"]').forEach(el => {
      el.addEventListener('change', this._checkboxChanged.bind(this));
    });

    // Bind Section 2 item dynamic updates
    this.querySelectorAll('#sec2-items-container input, #sec2-items-container select').forEach(el => {
      el.addEventListener('change', (e) => {
        const idx = e.target.getAttribute('data-idx');
        const field = e.target.getAttribute('data-field');
        const currentItems = [...sec2Items];
        currentItems[idx][field] = e.target.value;
        this._updateConfig('sec2_items', currentItems);
      });
    });

    // Delete item
    this.querySelectorAll('.btn-del').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const idx = parseInt(e.target.getAttribute('data-idx'), 10);
        const currentItems = [...sec2Items];
        currentItems.splice(idx, 1);
        this._updateConfig('sec2_items', currentItems);
      });
    });

    // Add item
    const btnAdd = this.querySelector('#btn-add-item');
    if (btnAdd) {
      btnAdd.addEventListener('click', () => {
        const currentItems = [...sec2Items];
        currentItems.push({ label: 'New Label:', entity_suffix: '', unit: '', column: 1 });
        this._updateConfig('sec2_items', currentItems);
      });
    }
  }

  _valueChanged(e) {
    if (!this._config || !e.target.id) return;
    this._updateConfig(e.target.id, e.target.value);
  }

  _checkboxChanged(e) {
    if (!this._config || !e.target.id) return;
    this._updateConfig(e.target.id, e.target.checked);
  }

  _updateConfig(key, value) {
    this._config = {
      ...this._config,
      [key]: value
    };
    const event = new Event("config-changed", { bubbles: true, composed: true });
    event.detail = { config: this._config };
    this.dispatchEvent(event);
  }
}

customElements.define('jk-bms-card', JkBmsCard);
customElements.define('jk-bms-card-editor', JkBmsCardEditor);

// HACS Custom Card Picker Registration
window.customCards = window.customCards || [];
window.customCards.push({
  type: "jk-bms-card",
  name: "JK-BMS Android App UI Card",
  description: "A custom card replicating the official JK-BMS Android application interface with visual UI editing."
});

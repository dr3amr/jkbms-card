/**
 * JK-BMS Custom Lovelace Card (v1.0.0)
 */

function formatNumber(val, decimals = 1) {
  const num = parseFloat(val);
  if (isNaN(num)) return val;
  return num.toFixed(decimals);
}

class JkBmsCard extends HTMLElement {
  set hass(hass) {
    const oldHass = this._hass;
    this._hass = hass;

    if (!this.content) {
      this.innerHTML = `
        <style>
          ha-card {
            background-color: var(--card-background-color, #1a1a1a);
            color: var(--primary-text-color, #ffffff);
            font-family: var(--paper-font-body1_-_font-family, Roboto, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif);
            padding: 12px;
            border-radius: 12px;
          }
          .section {
            background: var(--sec-bg-color, #121212);
            border-radius: 8px;
            padding: 12px;
            margin-bottom: 10px;
          }
          .section.transparent-bg {
            background: transparent !important;
            padding-left: 0;
            padding-right: 0;
          }
          .section:last-child { margin-bottom: 0; }

          /* Section 1 */
          .s1-container { font-size: calc(14.5px * var(--s1-scale, 1)); }
          .s1-header { text-align: center; margin-bottom: 8px; font-weight: 500; }
          .s1-time { color: var(--time-color, #2196f3); font-weight: bold; }
          .s1-status-row { display: flex; justify-content: space-around; }
          .s1-status-val { color: var(--primary-green-color, #2e7d32); font-weight: bold; }

          /* Section 2 */
          .s2-container { font-size: calc(14.5px * var(--s2-scale, 1)); }
          .s2-main-vals {
            display: flex;
            justify-content: space-around;
            font-size: calc(28.8px * var(--s2-scale, 1));
            font-weight: bold;
            color: var(--primary-green-color, #2e7d32);
            margin-bottom: 4px;
          }
          .s2-columns { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
          .s2-col { display: flex; flex-direction: column; gap: 4px; }
          .s2-item { display: flex; line-height: 1; margin: 0;}
          .s2-item.align-center { justify-content: center; gap: 6px; }
          .s2-item.align-space-between { justify-content: space-between; }
          .s2-item.align-flex-start { justify-content: flex-start; gap: 6px; } 
          .s2-item.align-flex-end { justify-content: flex-end; gap: 6px; }
          .s2-label { color: var(--primary-text-color, #ffffff); }
          .s2-val { color: var(--sec2-val-final-color, #ffffff); font-weight: 500; }

          /* Section 3 */
          .s3-container { font-size: calc(14.5px * var(--s3-scale, 1)); }
          .s3-title { text-align: center; font-weight: bold; font-size: calc(16.8px * var(--s3-scale, 1)); margin-bottom: 8px; }
          .cells-grid { display: grid; grid-template-columns: 1fr 1fr; column-gap: 14px; row-gap: 4px; }
          .cell-row { display: flex; justify-content: center; gap: 6px; }
          .cell-num { color: var(--primary-text-color, #ffffff); }
          .cell-v { color: var(--primary-text-color, #ffffff); }
          .cell-v.max-v { color: var(--max-cell-color, #2196f3) !important; font-weight: bold; }
          .cell-v.min-v { color: var(--min-cell-color, #f44336) !important; font-weight: bold; }
          .cell-r { color: var(--primary-text-color, #ffffff); }

          /* Section 4 */
          .s4-container { font-size: calc(14.5px * var(--s4-scale, 1)); }
          .s4-row { display: flex; align-items: center; justify-content: space-between; padding: 6px 0; }
          .s4-left { display: flex; align-items: center; gap: 10px; }

          .clickable-val { cursor: pointer; user-select: none; }
        </style>
        <ha-card id="card-content"></ha-card>
      `;
      this.content = this.querySelector("#card-content");
      this.buildDOM();
    } else {
      this.updateValues();
    }
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
      use_mohm_res: false,
      sec2_align: "center",
      sec3_decimals: 1,
      s1_scale: 1.0,
      s2_scale: 1.0,
      s3_scale: 1.0,
      s4_scale: 1.0,
      use_primary_color_sec2: false,
      remove_section_bg: false,
      section_bg_color: "#121212",
      primary_green_color: "#2e7d32",
      time_color: "#2196f3",
      max_cell_color: "#2196f3",
      min_cell_color: "#f44336"
    };
  }

  setConfig(config) {
    this._config = Object.assign({}, config);
    this._prefix = this._config.prefix || 'jk-bms';
    
    this._sec3Decimals = this._config.sec3_decimals !== undefined ? parseInt(this._config.sec3_decimals, 10) : 1;
    this._useMohmRes = this._config.use_mohm_res === true;
    this._s1Scale = this._config.s1_scale || 1.0;
    this._s2Scale = this._config.s2_scale || 1.0;
    this._s3Scale = this._config.s3_scale || 1.0;
    this._s4Scale = this._config.s4_scale || 1.0;

    this._removeBg = this._config.remove_section_bg === true;
    this._secBgColor = this._config.section_bg_color || '#121212';
    this._usePrimaryColorSec2 = this._config.use_primary_color_sec2 === true;

    this._greenColor = this._config.primary_green_color || '#2e7d32';
    this._timeColor = this._config.time_color || '#2196f3';
    this._maxCellColor = this._config.max_cell_color || '#2196f3';
    this._minCellColor = this._config.min_cell_color || '#f44336';

    this._sec2Align = this._config.sec2_align || 'center';

    this._showS1 = this._config.show_section_1 !== false;
    this._showS2 = this._config.show_section_2 !== false;
    this._showS3 = this._config.show_section_3 !== false;
    this._showS4 = this._config.show_section_4 !== false;
    this._showCellsTitle = this._config.show_cells_title !== false;
    
    this._cellCount = parseInt(this._config.cell_count || 16, 10);

    this._sec2Items = this._config.sec2_items || [
      { label: 'Battery Power:', entity_suffix: 'power', unit: 'W', decimals: 1, column: 1 },
      { label: 'Remain Battery:', entity_suffix: 'state_of_charge', unit: '%', decimals: 1, column: 2 },
      { label: 'Battery Capacity:', entity_suffix: 'full_charge_capacity', unit: 'Ah', decimals: 1, column: 1 },
      { label: 'Remain Capacity:', entity_suffix: 'capacity_remaining', unit: 'Ah', decimals: 1, column: 2 },
      { label: 'Cycle Capacity:', entity_suffix: 'total_charging_cycle_capacity', unit: 'Ah', decimals: 1, column: 1 },
      { label: 'Cycle Count:', entity_suffix: 'charging_cycles', unit: '', decimals: 0, column: 2 },
      { label: 'Ave. Cell Vol.:', entity_suffix: 'average_cell_voltage', unit: 'V', decimals: 3, column: 1 },
      { label: 'Delta Cell Vol.:', entity_suffix: 'delta_cell_voltage', unit: 'V', decimals: 3, column: 2 },
      { label: 'Balance Cur.:', entity_suffix: 'balancing_current', unit: 'A', decimals: 2, column: 1 },
      { label: 'MOS Temp.:', entity_suffix: 'mosfet_temperature', unit: '°C', decimals: 1, column: 2 },
      { label: 'Battery T1:', entity_suffix: 'temperature_sensor_1', unit: '°C', decimals: 1, column: 1 },
      { label: 'Battery T2:', entity_suffix: 'temperature_sensor_2', unit: '°C', decimals: 1, column: 2 }
    ];

    if (this.content) {
      this.buildDOM();
    }
  }

  getEntity(suffix, override, type = 'sensor') {
    if (override) return override;
    return `${type}.${this._prefix}_${suffix}`;
  }

  getVal(entityId, defaultVal = '--') {
    const stateObj = this._hass ? this._hass.states[entityId] : null;
    return stateObj ? stateObj.state : defaultVal;
  }

  getFormattedState(entityId) {
    const rawState = this.getVal(entityId, '--');
    if (rawState === 'on') return 'ON';
    if (rawState === 'off') return 'OFF';
    return rawState.toUpperCase();
  }

  fireMoreInfo(entityId) {
    if (!entityId || !this._hass || !this._hass.states[entityId]) return;
    const event = new Event('hass-more-info', { bubbles: true, composed: true });
    event.detail = { entityId };
    this.dispatchEvent(event);
  }

  toggleSwitch(entityId, requestedState) {
    if (!entityId || !this._hass) return;
    const service = requestedState ? 'turn_on' : 'turn_off';
    this._hass.callService('switch', service, { entity_id: entityId });
  }

  buildDOM() {
    this.style.setProperty('--primary-green-color', this._greenColor);
    this.style.setProperty('--time-color', this._timeColor);
    this.style.setProperty('--max-cell-color', this._maxCellColor);
    this.style.setProperty('--min-cell-color', this._minCellColor);
    this.style.setProperty('--sec-bg-color', this._secBgColor);
    this.style.setProperty('--s1-scale', this._s1Scale);
    this.style.setProperty('--s2-scale', this._s2Scale);
    this.style.setProperty('--s3-scale', this._s3Scale);
    this.style.setProperty('--s4-scale', this._s4Scale);

    const valColorSec2 = this._usePrimaryColorSec2 ? 'var(--primary-green-color)' : 'var(--primary-text-color, #ffffff)';
    this.style.setProperty('--sec2-val-final-color', valColorSec2);

    const bgClass = this._removeBg ? 'transparent-bg' : '';

    const entTime = this.getEntity('total_runtime_formatted', this._config.entity_total_runtime_formatted, 'sensor');
    const entChargeState = this.getEntity('charging', this._config.entity_charging_state, 'binary_sensor');
    const entDischargeState = this.getEntity('discharging', this._config.entity_discharging_state, 'binary_sensor');
    const entBalancingState = this.getEntity('balancing', this._config.entity_balancing_state, 'binary_sensor');

    const entTotalV = this.getEntity('total_voltage', this._config.entity_total_voltage, 'sensor');
    const entCurrent = this.getEntity('current', this._config.entity_current, 'sensor');

    const entSwBalancer = this.getEntity('balancer', this._config.entity_switch_balancer, 'switch');
    const entSwCharge = this.getEntity('charging', this._config.entity_switch_charging, 'switch');
    const entSwDischarge = this.getEntity('discharging', this._config.entity_switch_discharging, 'switch');

    let html = '';

    // SECTION 1
    if (this._showS1) {
      html += `
        <div class="section ${bgClass} s1-container">
          <div class="s1-header">
            Time: <span class="s1-time clickable-val" id="s1-time" data-entity="${entTime}">--</span>
          </div>
          <div class="s1-status-row">
            <div>Charge: <span class="s1-status-val clickable-val" id="s1-chg" data-entity="${entChargeState}">--</span></div>
            <div>Discharge: <span class="s1-status-val clickable-val" id="s1-dis" data-entity="${entDischargeState}">--</span></div>
            <div>Balance: <span class="s1-status-val clickable-val" id="s1-bal" data-entity="${entBalancingState}">--</span></div>
          </div>
        </div>
      `;
    }

    // SECTION 2
    if (this._showS2) {
      let col1Html = '';
      let col2Html = '';

      this._sec2Items.forEach((item, index) => {
        const entId = item.entity || this.getEntity(item.entity_suffix, null, 'sensor');
        const itemHtml = `
          <div class="s2-item align-${this._sec2Align}">
            <span class="s2-label">${item.label}</span>
            <span class="s2-val clickable-val" id="s2-item-${index}" data-entity="${entId}">--</span>
          </div>
        `;

        const targetCol = item.column ? parseInt(item.column, 10) : (index % 2 === 0 ? 1 : 2);
        if (targetCol === 1) col1Html += itemHtml;
        else col2Html += itemHtml;
      });

      html += `
        <div class="section ${bgClass} s2-container">
          <div class="s2-main-vals">
            <span class="clickable-val" id="s2-total-v" data-entity="${entTotalV}">-- V</span>
            <span class="clickable-val" id="s2-current" data-entity="${entCurrent}">-- A</span>
          </div>
          <div class="s2-columns">
            <div class="s2-col">${col1Html}</div>
            <div class="s2-col">${col2Html}</div>
          </div>
        </div>
      `;
    }

    // SECTION 3
    if (this._showS3) {
      const half = Math.ceil(this._cellCount / 2);
      let leftCellsHtml = '';
      let rightCellsHtml = '';

      for (let i = 1; i <= this._cellCount; i++) {
        const cellIdStr = i.toString().padStart(2, '0');
        const entCellV = this.getEntity(`cell_voltage_${i}`, this._config[`entity_cell_voltage_${i}`], 'sensor');
        const entCellR = this.getEntity(`cell_resistance_${i}`, this._config[`entity_cell_resistance_${i}`], 'sensor');

        const rowHtml = `
          <div class="cell-row">
            <span class="cell-num">${cellIdStr}.</span>
            <span class="cell-v clickable-val" id="cell-v-${i}" data-entity="${entCellV}">-- V</span>
            <span style="color: var(--primary-text-color, #ffffff);">/</span>
            <span class="cell-r clickable-val" id="cell-r-${i}" data-entity="${entCellR}">--</span>
          </div>
        `;

        if (i <= half) leftCellsHtml += rowHtml;
        else rightCellsHtml += rowHtml;
      }

      html += `
        <div class="section ${bgClass} s3-container">
          ${this._showCellsTitle ? '<div class="s3-title">Cells</div>' : ''}
          <div class="cells-grid">
            <div>${leftCellsHtml}</div>
            <div>${rightCellsHtml}</div>
          </div>
        </div>
      `;
    }

    // SECTION 4
    if (this._showS4) {
      html += `
        <div class="section ${bgClass} s4-container">
          <div class="s4-row">
            <div class="s4-left">
              <ha-icon icon="mdi:scale-balance"></ha-icon>
              <span>Balancer</span>
            </div>
            <ha-switch id="sw-balancer" data-entity="${entSwBalancer}"></ha-switch>
          </div>
          <div class="s4-row">
            <div class="s4-left">
              <ha-icon icon="mdi:battery-charging"></ha-icon>
              <span>Charging</span>
            </div>
            <ha-switch id="sw-charging" data-entity="${entSwCharge}"></ha-switch>
          </div>
          <div class="s4-row">
            <div class="s4-left">
              <ha-icon icon="mdi:battery-charging"></ha-icon>
              <span>Discharging</span>
            </div>
            <ha-switch id="sw-discharging" data-entity="${entSwDischarge}"></ha-switch>
          </div>
        </div>
      `;
    }

    this.content.innerHTML = html;

    // Attach Click Events
    this.content.querySelectorAll('.clickable-val').forEach(el => {
      el.addEventListener('click', (e) => {
        e.stopPropagation();
        const entity = el.getAttribute('data-entity');
        if (entity) this.fireMoreInfo(entity);
      });
    });

    // Attach Switch Event Handlers
    this.content.querySelectorAll('ha-switch').forEach(sw => {
      sw.addEventListener('change', (e) => {
        e.stopPropagation();
        const entity = sw.getAttribute('data-entity');
        if (entity) this.toggleSwitch(entity, sw.checked);
      });
    });

    this.updateValues();
  }

  updateValues() {
    if (!this._hass) return;

    // SECTION 1 Updates
    if (this._showS1) {
      const entTime = this.getEntity('total_runtime_formatted', this._config.entity_total_runtime_formatted, 'sensor');
      const entChargeState = this.getEntity('charging', this._config.entity_charging_state, 'binary_sensor');
      const entDischargeState = this.getEntity('discharging', this._config.entity_discharging_state, 'binary_sensor');
      const entBalancingState = this.getEntity('balancing', this._config.entity_balancing_state, 'binary_sensor');

      const elTime = this.querySelector('#s1-time');
      const elChg = this.querySelector('#s1-chg');
      const elDis = this.querySelector('#s1-dis');
      const elBal = this.querySelector('#s1-bal');

      if (elTime) elTime.textContent = this.getVal(entTime);
      if (elChg) elChg.textContent = this.getFormattedState(entChargeState);
      if (elDis) elDis.textContent = this.getFormattedState(entDischargeState);
      if (elBal) elBal.textContent = this.getFormattedState(entBalancingState);
    }

    // SECTION 2 Updates
    if (this._showS2) {
      const entTotalV = this.getEntity('total_voltage', this._config.entity_total_voltage, 'sensor');
      const entCurrent = this.getEntity('current', this._config.entity_current, 'sensor');

      const elTotalV = this.querySelector('#s2-total-v');
      const elCurrent = this.querySelector('#s2-current');

      if (elTotalV) elTotalV.textContent = `${formatNumber(this.getVal(entTotalV), 1)} V`;
      if (elCurrent) elCurrent.textContent = `${formatNumber(this.getVal(entCurrent), 1)} A`;

      this._sec2Items.forEach((item, index) => {
        const entId = item.entity || this.getEntity(item.entity_suffix, null, 'sensor');
        const elItem = this.querySelector(`#s2-item-${index}`);
        if (elItem) {
          const itemDecimals = item.decimals !== undefined && item.decimals !== '' ? parseInt(item.decimals, 10) : 1;
          const formattedVal = formatNumber(this.getVal(entId), itemDecimals);
          const unitStr = item.unit ? ` ${item.unit}` : '';
          elItem.textContent = `${formattedVal}${unitStr}`;
        }
      });
    }

    // SECTION 3 Updates
    if (this._showS3) {
      const entMaxCellNum = this.getEntity('max_voltage_cell', this._config.entity_max_voltage_cell, 'sensor');
      const entMinCellNum = this.getEntity('min_voltage_cell', this._config.entity_min_voltage_cell, 'sensor');
      const maxCellNum = parseInt(this.getVal(entMaxCellNum, '0'), 10);
      const minCellNum = parseInt(this.getVal(entMinCellNum, '0'), 10);

      // In mΩ mode, resistance decimal precision is fixed to 0
      const resDecimals = this._useMohmRes ? 0 : this._sec3Decimals;

      for (let i = 1; i <= this._cellCount; i++) {
        const entCellV = this.getEntity(`cell_voltage_${i}`, this._config[`entity_cell_voltage_${i}`], 'sensor');
        const entCellR = this.getEntity(`cell_resistance_${i}`, this._config[`entity_cell_resistance_${i}`], 'sensor');

        const elV = this.querySelector(`#cell-v-${i}`);
        const elR = this.querySelector(`#cell-r-${i}`);

        if (elV) {
          elV.textContent = `${formatNumber(this.getVal(entCellV, '0.0'), this._sec3Decimals)} V`;
          elV.classList.remove('max-v', 'min-v');
          if (i === maxCellNum) elV.classList.add('max-v');
          else if (i === minCellNum) elV.classList.add('min-v');
        }

        if (elR) {
          const rawR = parseFloat(this.getVal(entCellR, '0.0'));
          if (isNaN(rawR)) {
            elR.textContent = `-- ${this._useMohmRes ? 'mΩ' : 'Ω'}`;
          } else if (this._useMohmRes) {
            // Convert Ohms to mOhms if value is < 1, otherwise assume it's already mOhms
            const mOhmVal = rawR < 1 ? rawR * 1000 : rawR;
            elR.textContent = `${formatNumber(mOhmVal, 0)} mΩ`;
          } else {
            elR.textContent = `${formatNumber(rawR, resDecimals)} Ω`;
          }
        }
      }
    }

    // SECTION 4 Updates
    if (this._showS4) {
      const entSwBalancer = this.getEntity('balancer', this._config.entity_switch_balancer, 'switch');
      const entSwCharge = this.getEntity('charging', this._config.entity_switch_charging, 'switch');
      const entSwDischarge = this.getEntity('discharging', this._config.entity_switch_discharging, 'switch');

      const swBal = this.querySelector('#sw-balancer');
      const swChg = this.querySelector('#sw-charging');
      const swDis = this.querySelector('#sw-discharging');

      if (swBal) swBal.checked = this.getVal(entSwBalancer) === 'on';
      if (swChg) swChg.checked = this.getVal(entSwCharge) === 'on';
      if (swDis) swDis.checked = this.getVal(entSwDischarge) === 'on';
    }
  }

  getCardSize() {
    return 6;
  }
}

// Visual Card Editor
class JkBmsCardEditor extends HTMLElement {
  setConfig(config) {
    this._config = Object.assign({}, config);
    this.render();
  }

  set hass(hass) {
    this._hass = hass;
    if (this.hasRendered) {
      this.updateEntityPickers();
    }
  }

  updateEntityPickers() {
    this.querySelectorAll('ha-entity-picker').forEach(picker => {
      picker.hass = this._hass;
    });
  }

  render() {
    if (!this._config) return;
    this.hasRendered = true;

    const sec2Items = this._config.sec2_items || [
      { label: 'Battery Power:', entity_suffix: 'power', unit: 'W', decimals: 1, column: 1 },
      { label: 'Remain Battery:', entity_suffix: 'state_of_charge', unit: '%', decimals: 1, column: 2 },
      { label: 'Battery Capacity:', entity_suffix: 'full_charge_capacity', unit: 'Ah', decimals: 1, column: 1 },
      { label: 'Remain Capacity:', entity_suffix: 'capacity_remaining', unit: 'Ah', decimals: 1, column: 2 },
      { label: 'Cycle Capacity:', entity_suffix: 'total_charging_cycle_capacity', unit: 'Ah', decimals: 1, column: 1 },
      { label: 'Cycle Count:', entity_suffix: 'charging_cycles', unit: '', decimals: 0, column: 2 },
      { label: 'Ave. Cell Vol.:', entity_suffix: 'average_cell_voltage', unit: 'V', decimals: 3, column: 1 },
      { label: 'Delta Cell Vol.:', entity_suffix: 'delta_cell_voltage', unit: 'V', decimals: 3, column: 2 },
      { label: 'Balance Cur.:', entity_suffix: 'balancing_current', unit: 'A', decimals: 2, column: 1 },
      { label: 'MOS Temp.:', entity_suffix: 'mosfet_temperature', unit: '°C', decimals: 1, column: 2 },
      { label: 'Battery T1:', entity_suffix: 'temperature_sensor_1', unit: '°C', decimals: 1, column: 1 },
      { label: 'Battery T2:', entity_suffix: 'temperature_sensor_2', unit: '°C', decimals: 1, column: 2 }
    ];

    let itemsHtml = '';
    sec2Items.forEach((item, idx) => {
      const decVal = item.decimals !== undefined ? item.decimals : 1;
      itemsHtml += `
        <div style="border: 1px solid var(--divider-color, #444); border-radius: 6px; padding: 10px; margin-bottom: 10px; background: var(--card-background-color, #222);">
          <div style="display: grid; grid-template-columns: 2fr 2fr 1fr 1fr 1fr auto; gap: 6px; margin-bottom: 8px; align-items: center;">
            <input type="text" placeholder="Label" value="${item.label || ''}" data-idx="${idx}" data-field="label" style="padding: 6px; border-radius: 4px; border: 1px solid #555; background: #111; color: #fff; width: 100%; box-sizing: border-box;">
            <input type="text" placeholder="Suffix" value="${item.entity_suffix || ''}" data-idx="${idx}" data-field="entity_suffix" style="padding: 6px; border-radius: 4px; border: 1px solid #555; background: #111; color: #fff; width: 100%; box-sizing: border-box;">
            <input type="text" placeholder="Unit" value="${item.unit || ''}" data-idx="${idx}" data-field="unit" style="padding: 6px; border-radius: 4px; border: 1px solid #555; background: #111; color: #fff; width: 100%; box-sizing: border-box;">
            <input type="number" placeholder="Dec" value="${decVal}" data-idx="${idx}" data-field="decimals" style="padding: 6px; border-radius: 4px; border: 1px solid #555; background: #111; color: #fff; width: 100%; box-sizing: border-box;" title="Decimals">
            <select data-idx="${idx}" data-field="column" style="padding: 6px; border-radius: 4px; border: 1px solid #555; background: #111; color: #fff; width: 100%; box-sizing: border-box;">
              <option value="1" ${item.column == 1 ? 'selected' : ''}>Col 1</option>
              <option value="2" ${item.column == 2 ? 'selected' : ''}>Col 2</option>
            </select>
            <button class="btn-del" data-idx="${idx}" style="background:#f44336; color:#fff; border:none; border-radius:4px; padding:6px 10px; cursor:pointer;">X</button>
          </div>
          <div>
            <ha-entity-picker 
              label="Override Entity (Optional)" 
              .hass=${this._hass} 
              .value="${item.entity || ''}" 
              data-idx="${idx}" 
              data-field="entity"
              allow-custom-entity>
            </ha-entity-picker>
          </div>
        </div>
      `;
    });

    const alignVal = this._config.sec2_align || 'center';

    this.innerHTML = `
      <style>
        .editor-row { display: flex; align-items: center; justify-content: space-between; margin-bottom: 10px; gap: 10px; }
        .editor-row label { font-weight: 500; font-size: 13px; color: var(--primary-text-color, #fff); }
        .editor-row input[type="text"], .editor-row input[type="number"], .editor-row select {
          padding: 6px; border-radius: 4px; border: 1px solid #555; background: #111; color: #fff; width: 100%; box-sizing: border-box;
        }
        .editor-row-half { display: flex; gap: 10px; margin-bottom: 10px; }
        .editor-col { flex: 1; }
        .sec-title { font-size: 14px; font-weight: bold; margin: 16px 0 8px 0; border-bottom: 1px solid var(--divider-color, #444); padding-bottom: 4px; color: var(--primary-text-color, #fff); }
        .chk-row { display: flex; align-items: center; gap: 8px; margin-bottom: 8px; cursor: pointer; }
        .chk-row label { cursor: pointer; font-size: 13px; }
      </style>
      <div>
        <div class="sec-title">General Settings</div>
        <div class="editor-row-half">
          <div class="editor-col">
            <label>Device Prefix:</label>
            <input type="text" id="prefix" value="${this._config.prefix || 'jk-bms'}">
          </div>
          <div class="editor-col">
            <label>Cell Count:</label>
            <input type="number" id="cell_count" value="${this._config.cell_count || 16}">
          </div>
        </div>

        <div class="sec-title">Formatting & Units</div>
        <div class="editor-row">
          <label>Section 3 Cell Voltage Decimals:</label>
          <input type="number" id="sec3_decimals" value="${this._config.sec3_decimals !== undefined ? this._config.sec3_decimals : 1}">
        </div>
        <div class="chk-row">
          <input type="checkbox" id="use_mohm_res" ${this._config.use_mohm_res === true ? 'checked' : ''}>
          <label for="use_mohm_res">Convert Cell Resistance to mΩ with 0 decimals (e.g. 0.051 Ω → 51 mΩ)</label>
        </div>

        <div class="sec-title">Section Scaling (Font Size)</div>
        <div class="editor-row-half">
          <div class="editor-col">
            <label>Section 1 Scale:</label>
            <input type="number" step="0.1" id="s1_scale" value="${this._config.s1_scale || 1.0}">
          </div>
          <div class="editor-col">
            <label>Section 2 Scale:</label>
            <input type="number" step="0.1" id="s2_scale" value="${this._config.s2_scale || 1.0}">
          </div>
        </div>
        <div class="editor-row-half">
          <div class="editor-col">
            <label>Section 3 Scale:</label>
            <input type="number" step="0.1" id="s3_scale" value="${this._config.s3_scale || 1.0}">
          </div>
          <div class="editor-col">
            <label>Section 4 Scale:</label>
            <input type="number" step="0.1" id="s4_scale" value="${this._config.s4_scale || 1.0}">
          </div>
        </div>

        <div class="sec-title">Section Visibility</div>
        <div class="chk-row">
          <input type="checkbox" id="show_section_1" ${this._config.show_section_1 !== false ? 'checked' : ''}>
          <label for="show_section_1">Show Section 1 (Header Status)</label>
        </div>
        <div class="chk-row">
          <input type="checkbox" id="show_section_2" ${this._config.show_section_2 !== false ? 'checked' : ''}>
          <label for="show_section_2">Show Section 2 (Grid Data)</label>
        </div>
        <div class="chk-row">
          <input type="checkbox" id="show_section_3" ${this._config.show_section_3 !== false ? 'checked' : ''}>
          <label for="show_section_3">Show Section 3 (Cell Voltages)</label>
        </div>
        <div class="chk-row">
          <input type="checkbox" id="show_section_4" ${this._config.show_section_4 !== false ? 'checked' : ''}>
          <label for="show_section_4">Show Section 4 (Switches)</label>
        </div>
        <div class="chk-row">
          <input type="checkbox" id="show_cells_title" ${this._config.show_cells_title !== false ? 'checked' : ''}>
          <label for="show_cells_title">Show 'Cells' Title in Section 3</label>
        </div>

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
        <div class="chk-row">
          <input type="checkbox" id="use_primary_color_sec2" ${this._config.use_primary_color_sec2 === true ? 'checked' : ''}>
          <label for="use_primary_color_sec2">Use Primary Status Color for Section 2 Values</label>
        </div>

        <div class="sec-title">Background Customization</div>
        <div class="chk-row">
          <input type="checkbox" id="remove_section_bg" ${this._config.remove_section_bg === true ? 'checked' : ''}>
          <label for="remove_section_bg">Remove Section Backgrounds (Transparent)</label>
        </div>
        <div class="editor-row">
          <label>Section Background Color:</label>
          <input type="color" id="section_bg_color" value="${this._config.section_bg_color || '#121212'}">
        </div>

        <div class="sec-title">Color Customization</div>
        <div class="editor-row"><label>Primary Status Color:</label><input type="color" id="primary_green_color" value="${this._config.primary_green_color || '#2e7d32'}"></div>
        <div class="editor-row"><label>Uptime Header Color:</label><input type="color" id="time_color" value="${this._config.time_color || '#2196f3'}"></div>
        <div class="editor-row"><label>Highest Cell Color:</label><input type="color" id="max_cell_color" value="${this._config.max_cell_color || '#2196f3'}"></div>
        <div class="editor-row"><label>Lowest Cell Color:</label><input type="color" id="min_cell_color" value="${this._config.min_cell_color || '#f44336'}"></div>

        <div class="sec-title">Section 2 Items & Dynamic Configuration</div>
        <div id="sec2-items-container">${itemsHtml}</div>
        <button id="btn-add-item" style="background:var(--primary-color, #2e7d32); color:#fff; border:none; border-radius:4px; padding:8px 16px; cursor:pointer; margin-top:6px; font-weight:bold;">+ Add Item</button>
      </div>
    `;

    this.querySelectorAll('input[type="text"], input[type="number"], input[type="color"], select#sec2_align').forEach(el => {
      if (!el.getAttribute('data-field')) {
        el.addEventListener('change', this._valueChanged.bind(this));
      }
    });

    this.querySelectorAll('input[type="checkbox"]').forEach(el => {
      el.addEventListener('click', this._checkboxChanged.bind(this));
    });

    this.querySelectorAll('#sec2-items-container input, #sec2-items-container select, #sec2-items-container ha-entity-picker').forEach(el => {
      el.addEventListener('change', (e) => {
        const idx = e.target.getAttribute('data-idx');
        const field = e.target.getAttribute('data-field');
        if (idx !== null && field) {
          const currentItems = [...sec2Items];
          currentItems[idx][field] = e.target.value;
          this._updateConfig('sec2_items', currentItems);
        }
      });
    });

    this.querySelectorAll('.btn-del').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const idx = parseInt(e.target.getAttribute('data-idx'), 10);
        const currentItems = [...sec2Items];
        currentItems.splice(idx, 1);
        this._updateConfig('sec2_items', currentItems);
      });
    });

    const btnAdd = this.querySelector('#btn-add-item');
    if (btnAdd) {
      btnAdd.addEventListener('click', () => {
        const currentItems = [...sec2Items];
        currentItems.push({ label: 'New Label:', entity_suffix: '', unit: '', decimals: 1, column: 1 });
        this._updateConfig('sec2_items', currentItems);
      });
    }

    this.updateEntityPickers();
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

window.customCards = window.customCards || [];
window.customCards.push({
  type: "jk-bms-card",
  name: "JK-BMS Android App UI Card",
  description: "A custom card replicating the official JK-BMS Android application interface with visual UI editing."
});

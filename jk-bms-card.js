/**
 * JK-BMS Custom Lovelace Card (v1.0.0)
 */

function formatItemValue(val, decimals = 1, unit = '') {
  if (val === null || val === undefined || val === '') return '--';

  const num = parseFloat(val);
  // If value is non-numeric (e.g., text, date string, status label), display string directly
  if (isNaN(num) || typeof val === 'boolean' || (typeof val === 'string' && val.trim() !== '' && isNaN(Number(val)))) {
    return String(val);
  }

  // If numeric, format with configured decimals and append unit
  const dec = decimals !== undefined && decimals !== '' ? parseInt(decimals, 10) : 1;
  const formattedNum = num.toFixed(dec);
  const unitStr = unit ? ` ${unit}` : '';
  return `${formattedNum}${unitStr}`;
}

class JkBmsCard extends HTMLElement {
  set hass(hass) {
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
          /* Reduced spacing between adjacent sections when both are visible */
          .section.s1-compact-bottom {
            margin-bottom: 5px !important;
          }
          .section.s2-compact-bottom {
            margin-bottom: 5px !important;
          }
          .section.s3-compact-bottom {
            margin-bottom: 5px !important;
          }
          .section:last-child { margin-bottom: 0; }

          /* Section 1 */
          .s1-container { font-size: var(--s1-font-size, 15px); }
          .s1-header { text-align: center; margin-bottom: 8px; font-weight: 500; }
          .s1-time { color: var(--time-font-color, #2196f3); font-weight: bold; }
          .s1-status-row { display: flex; justify-content: space-around; }
          .s1-status-val { color: var(--primary-font-color, #2e7d32); font-weight: bold; }

          /* Section 2 */
          .s2-container { font-size: var(--s2-font-size, 14px); }
          .s2-main-vals {
            display: flex;
            justify-content: space-around;
            font-size: var(--s2-header-font-size, 28px);
            font-weight: bold;
            color: var(--primary-font-color, #2e7d32);
            margin-bottom: 4px;
          }
          .s2-columns { display: grid; grid-template-columns: 1fr 1fr; column-gap: 14px; }
          .s2-col { display: flex; flex-direction: column; gap: 6px; }
          .s2-item { display: flex; line-height: normal; }
          .s2-item.align-center { justify-content: center; gap: 6px; }
          .s2-item.align-space-between { justify-content: space-between; }
          .s2-item.align-flex-start { justify-content: flex-start; gap: 6px; }
          .s2-item.align-flex-end { justify-content: flex-end; gap: 6px; }
          .s2-label { color: var(--primary-text-color, #ffffff); }
          .s2-val { color: var(--sec2-val-final-color, #ffffff); font-weight: 500; }

          /* Section 3 */
          .s3-container { font-size: var(--s3-font-size, 14px); }
          .s3-title { text-align: center; font-weight: bold; font-size: calc(var(--s3-font-size, 14px) * 1.15); margin-bottom: 8px; }
          .cells-grid { display: grid; grid-template-columns: 1fr 1fr; column-gap: 14px; }
          .cells-grid > div { display: flex; flex-direction: column; gap: 6px; }
          .cell-row { display: flex; line-height: normal; }
          .cell-row.align-center { justify-content: center; gap: 6px; }
          .cell-row.align-space-between { justify-content: space-between; }
          .cell-row.align-flex-start { justify-content: flex-start; gap: 6px; }
          .cell-row.align-flex-end { justify-content: flex-end; gap: 6px; }
          .cell-num { color: var(--primary-text-color, #ffffff); }
          .cell-v { color: var(--primary-text-color, #ffffff); }
          .cell-v.max-v { color: var(--max-cell-color, #2196f3) !important; font-weight: bold; }
          .cell-v.min-v { color: var(--min-cell-color, #f44336) !important; font-weight: bold; }
          .cell-r { color: var(--primary-text-color, #ffffff); }

          /* Section 4 */
          .s4-container { font-size: var(--s4-font-size, 15px); }
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
      show_section_2_header: true,
      show_section_3: true,
      show_section_4: true,
      show_cells_title: true,
      use_mohm_res: false,
      sec2_align: "center",
      sec3_align: "center",
      sec2_header_decimals: 1,
      sec3_decimals: 1,
      s1_font_size: 15,
      s2_header_font_size: 28,
      s2_font_size: 14,
      s3_font_size: 14,
      s4_font_size: 15,
      use_primary_color_sec2: false,
      remove_section_bg: false,
      section_bg_color: "#121212",
      primary_font_color: "#2e7d32",
      time_font_color: "#2196f3",
      max_cell_color: "#2196f3",
      min_cell_color: "#f44336"
    };
  }

  setConfig(config) {
    this._config = Object.assign({}, config);
    this._prefix = this._config.prefix || 'jk-bms';
    
    this._sec2HeaderDecimals = this._config.sec2_header_decimals !== undefined ? parseInt(this._config.sec2_header_decimals, 10) : 1;
    this._sec3Decimals = this._config.sec3_decimals !== undefined ? parseInt(this._config.sec3_decimals, 10) : 1;
    this._useMohmRes = this._config.use_mohm_res === true;

    this._s1FontSize = this._config.s1_font_size || 15;
    this._s2HeaderFontSize = this._config.s2_header_font_size || 28;
    this._s2FontSize = this._config.s2_font_size || 14;
    this._s3FontSize = this._config.s3_font_size || 14;
    this._s4FontSize = this._config.s4_font_size || 15;

    this._removeBg = this._config.remove_section_bg === true;
    this._secBgColor = this._config.section_bg_color || '#121212';
    this._usePrimaryColorSec2 = this._config.use_primary_color_sec2 === true;

    this._primaryFontColor = this._config.primary_font_color || '#2e7d32';
    this._timeFontColor = this._config.time_font_color || '#2196f3';
    this._maxCellColor = this._config.max_cell_color || '#2196f3';
    this._minCellColor = this._config.min_cell_color || '#f44336';

    this._sec2Align = this._config.sec2_align || 'center';
    this._sec3Align = this._config.sec3_align || 'center';

    this._showS1 = this._config.show_section_1 !== false;
    this._showS2 = this._config.show_section_2 !== false;
    this._showS2Header = this._config.show_section_2_header !== false;
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
    return rawState;
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
    this.style.setProperty('--primary-font-color', this._primaryFontColor);
    this.style.setProperty('--time-font-color', this._timeFontColor);
    this.style.setProperty('--max-cell-color', this._maxCellColor);
    this.style.setProperty('--min-cell-color', this._minCellColor);
    this.style.setProperty('--sec-bg-color', this._secBgColor);

    this.style.setProperty('--s1-font-size', `${this._s1FontSize}px`);
    this.style.setProperty('--s2-header-font-size', `${this._s2HeaderFontSize}px`);
    this.style.setProperty('--s2-font-size', `${this._s2FontSize}px`);
    this.style.setProperty('--s3-font-size', `${this._s3FontSize}px`);
    this.style.setProperty('--s4-font-size', `${this._s4FontSize}px`);

    const valColorSec2 = this._usePrimaryColorSec2 ? 'var(--primary-font-color)' : 'var(--primary-text-color, #ffffff)';
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
      const compactS1 = (this._showS1 && this._showS2) ? 's1-compact-bottom' : '';
      html += `
        <div class="section ${bgClass} ${compactS1} s1-container">
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
        const entId = item.entity ? item.entity : this.getEntity(item.entity_suffix, null, 'sensor');
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

      const headerHtml = this._showS2Header ? `
        <div class="s2-main-vals">
          <span class="clickable-val" id="s2-total-v" data-entity="${entTotalV}">-- V</span>
          <span class="clickable-val" id="s2-current" data-entity="${entCurrent}">-- A</span>
        </div>
      ` : '';

      const compactS2 = (this._showS2 && this._showS3) ? 's2-compact-bottom' : '';

      html += `
        <div class="section ${bgClass} ${compactS2} s2-container">
          ${headerHtml}
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
          <div class="cell-row align-${this._sec3Align}">
            <span class="cell-num">${cellIdStr}.</span>
            <span class="cell-v clickable-val" id="cell-v-${i}" data-entity="${entCellV}">-- V</span>
            <span style="color: var(--primary-text-color, #ffffff);">/</span>
            <span class="cell-r clickable-val" id="cell-r-${i}" data-entity="${entCellR}">--</span>
          </div>
        `;

        if (i <= half) leftCellsHtml += rowHtml;
        else rightCellsHtml += rowHtml;
      }

      const compactS3 = (this._showS3 && this._showS4) ? 's3-compact-bottom' : '';

      html += `
        <div class="section ${bgClass} ${compactS3} s3-container">
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
      if (this._showS2Header) {
        const entTotalV = this.getEntity('total_voltage', this._config.entity_total_voltage, 'sensor');
        const entCurrent = this.getEntity('current', this._config.entity_current, 'sensor');

        const elTotalV = this.querySelector('#s2-total-v');
        const elCurrent = this.querySelector('#s2-current');

        if (elTotalV) elTotalV.textContent = `${formatItemValue(this.getVal(entTotalV), this._sec2HeaderDecimals, 'V')}`;
        if (elCurrent) elCurrent.textContent = `${formatItemValue(this.getVal(entCurrent), this._sec2HeaderDecimals, 'A')}`;
      }

      this._sec2Items.forEach((item, index) => {
        const entId = item.entity ? item.entity : this.getEntity(item.entity_suffix, null, 'sensor');
        const elItem = this.querySelector(`#s2-item-${index}`);
        if (elItem) {
          const rawVal = this.getVal(entId);
          elItem.textContent = formatItemValue(rawVal, item.decimals, item.unit);
        }
      });
    }

    // SECTION 3 Updates
    if (this._showS3) {
      const entMaxCellNum = this.getEntity('max_voltage_cell', this._config.entity_max_voltage_cell, 'sensor');
      const entMinCellNum = this.getEntity('min_voltage_cell', this._config.entity_min_voltage_cell, 'sensor');
      const maxCellNum = parseInt(this.getVal(entMaxCellNum, '0'), 10);
      const minCellNum = parseInt(this.getVal(entMinCellNum, '0'), 10);

      for (let i = 1; i <= this._cellCount; i++) {
        const entCellV = this.getEntity(`cell_voltage_${i}`, this._config[`entity_cell_voltage_${i}`], 'sensor');
        const entCellR = this.getEntity(`cell_resistance_${i}`, this._config[`entity_cell_resistance_${i}`], 'sensor');

        const elV = this.querySelector(`#cell-v-${i}`);
        const elR = this.querySelector(`#cell-r-${i}`);

        if (elV) {
          elV.textContent = formatItemValue(this.getVal(entCellV, '0.0'), this._sec3Decimals, 'V');
          elV.classList.remove('max-v', 'min-v');
          if (i === maxCellNum) elV.classList.add('max-v');
          else if (i === minCellNum) elV.classList.add('min-v');
        }

        if (elR) {
          const rawRVal = this.getVal(entCellR, '0.0');
          const rawR = parseFloat(rawRVal);

          if (isNaN(rawR)) {
            elR.textContent = `${rawRVal}`;
          } else if (this._useMohmRes) {
            const mOhmVal = rawR < 1 ? rawR * 1000 : rawR;
            elR.textContent = `${mOhmVal.toFixed(0)} mΩ`;
          } else {
            elR.textContent = `${rawR.toFixed(this._sec3Decimals)} Ω`;
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
      const isFirst = idx === 0;
      const isLast = idx === sec2Items.length - 1;
      const hasOverrideEntity = Boolean(item.entity && item.entity.trim() !== '');

      itemsHtml += `
        <div style="border: 1px solid var(--divider-color, #444); border-radius: 6px; padding: 10px; margin-bottom: 10px; background: var(--card-background-color, #222);">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
            <span style="font-size: 12px; font-weight: bold; color: #888;">Item #${idx + 1}</span>
            <div style="display: flex; gap: 4px;">
              <button class="btn-move" data-idx="${idx}" data-dir="up" ${isFirst ? 'disabled style="opacity: 0.3; cursor: not-allowed;"' : 'style="background:#333; color:#fff; border:1px solid #555; border-radius:4px; padding:2px 8px; cursor:pointer;"'}>▲</button>
              <button class="btn-move" data-idx="${idx}" data-dir="down" ${isLast ? 'disabled style="opacity: 0.3; cursor: not-allowed;"' : 'style="background:#333; color:#fff; border:1px solid #555; border-radius:4px; padding:2px 8px; cursor:pointer;"'}>▼</button>
              <button class="btn-del" data-idx="${idx}" style="background:#f44336; color:#fff; border:none; border-radius:4px; padding:2px 8px; cursor:pointer; margin-left: 6px;">X</button>
            </div>
          </div>
          <div style="display: grid; grid-template-columns: 2fr 2fr 1fr 1fr 1fr; gap: 6px; margin-bottom: 8px; align-items: center;">
            <input type="text" placeholder="Label" value="${item.label || ''}" data-idx="${idx}" data-field="label" style="padding: 6px; border-radius: 4px; border: 1px solid #555; background: #111; color: #fff; width: 100%; box-sizing: border-box;">
            <input type="text" placeholder="Suffix" value="${item.entity_suffix || ''}" data-idx="${idx}" data-field="entity_suffix" style="padding: 6px; border-radius: 4px; border: 1px solid #555; background: #111; color: #fff; width: 100%; box-sizing: border-box;">
            <input type="text" placeholder="Unit" value="${item.unit || ''}" data-idx="${idx}" data-field="unit" style="padding: 6px; border-radius: 4px; border: 1px solid #555; background: #111; color: #fff; width: 100%; box-sizing: border-box;">
            <input type="number" placeholder="Dec" value="${decVal}" data-idx="${idx}" data-field="decimals" style="padding: 6px; border-radius: 4px; border: 1px solid #555; background: #111; color: #fff; width: 100%; box-sizing: border-box;" title="Decimals (ignored for text/dates)">
            <select data-idx="${idx}" data-field="column" style="padding: 6px; border-radius: 4px; border: 1px solid #555; background: #111; color: #fff; width: 100%; box-sizing: border-box;">
              <option value="1" ${item.column == 1 ? 'selected' : ''}>Col 1</option>
              <option value="2" ${item.column == 2 ? 'selected' : ''}>Col 2</option>
            </select>
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
            ${
              hasOverrideEntity 
                ? `<div style="display: flex; justify-content: space-between; align-items: center; margin-top: 6px; padding: 4px 8px; background: rgba(46, 125, 50, 0.2); border: 1px solid #2e7d32; border-radius: 4px; font-size: 11px; color: #81c784;">
                     <span>✔ <b>Active Override:</b> ${item.entity}</span>
                     <button class="btn-clear-entity" data-idx="${idx}" style="background: transparent; border: 1px solid #81c784; color: #81c784; border-radius: 3px; padding: 1px 6px; cursor: pointer; font-size: 10px;">Clear</button>
                   </div>`
                : `<div style="margin-top: 4px; font-size: 11px; color: #888; font-style: italic;">
                     No override selected (using prefix + suffix)
                   </div>`
            }
          </div>
        </div>
      `;
    });

    const alignValSec2 = this._config.sec2_align || 'center';
    const alignValSec3 = this._config.sec3_align || 'center';

    this.innerHTML = `
      <style>
        .editor-row { display: flex; align-items: center; justify-content: space-between; margin-bottom: 10px; gap: 10px; }
        .editor-row label { font-weight: 500; font-size: 13px; color: var(--primary-text-color, #fff); }
        .editor-row input[type="text"], .editor-row input[type="number"], .editor-row select {
          padding: 6px; border-radius: 4px; border: 1px solid #555; background: #111; color: #fff; width: 100%; box-sizing: border-box;
        }
        .editor-row input[type="color"] {
          border: 1px solid #555; background: none; width: 50px; height: 32px; border-radius: 4px; cursor: pointer; padding: 0;
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
          <label>Section 2 Header Decimals (V & A):</label>
          <input type="number" id="sec2_header_decimals" value="${this._config.sec2_header_decimals !== undefined ? this._config.sec2_header_decimals : 1}">
        </div>
        <div class="editor-row">
          <label>Section 3 Cell Voltage Decimals:</label>
          <input type="number" id="sec3_decimals" value="${this._config.sec3_decimals !== undefined ? this._config.sec3_decimals : 1}">
        </div>
        <div class="chk-row">
          <input type="checkbox" id="use_mohm_res" ${this._config.use_mohm_res === true ? 'checked' : ''}>
          <label for="use_mohm_res">Convert Cell Resistance to mΩ with 0 decimals (e.g. 0.051 Ω → 51 mΩ)</label>
        </div>

        <div class="sec-title">Section Font Sizes (in Pixels)</div>
        <div class="editor-row-half">
          <div class="editor-col">
            <label>Section 1 Font Size (px):</label>
            <input type="number" id="s1_font_size" value="${this._config.s1_font_size || 15}">
          </div>
          <div class="editor-col">
            <label>Section 2 Header V & A Size (px):</label>
            <input type="number" id="s2_header_font_size" value="${this._config.s2_header_font_size || 28}">
          </div>
        </div>
        <div class="editor-row-half">
          <div class="editor-col">
            <label>Section 2 Labels Font Size (px):</label>
            <input type="number" id="s2_font_size" value="${this._config.s2_font_size || 14}">
          </div>
          <div class="editor-col">
            <label>Section 3 Font Size (px):</label>
            <input type="number" id="s3_font_size" value="${this._config.s3_font_size || 14}">
          </div>
        </div>
        <div class="editor-row">
          <label>Section 4 Font Size (px):</label>
          <input type="number" id="s4_font_size" value="${this._config.s4_font_size || 15}">
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
        <div class="chk-row" style="margin-left: 18px;">
          <input type="checkbox" id="show_section_2_header" ${this._config.show_section_2_header !== false ? 'checked' : ''}>
          <label for="show_section_2_header">Show Section 2 Header (Voltage & Amperage)</label>
        </div>
        <div class="chk-row">
          <input type="checkbox" id="show_section_3" ${this._config.show_section_3 !== false ? 'checked' : ''}>
          <label for="show_section_3">Show Section 3 (Cell Voltages)</label>
        </div>
        <div class="chk-row" style="margin-left: 18px;">
          <input type="checkbox" id="show_cells_title" ${this._config.show_cells_title !== false ? 'checked' : ''}>
          <label for="show_cells_title">Show Section 3 Header ("Cells")</label>
        </div>
        <div class="chk-row">
          <input type="checkbox" id="show_section_4" ${this._config.show_section_4 !== false ? 'checked' : ''}>
          <label for="show_section_4">Show Section 4 (Switches)</label>
        </div>

        <div class="sec-title">Styling & Alignment</div>
        <div class="chk-row">
          <input type="checkbox" id="use_primary_color_sec2" ${this._config.use_primary_color_sec2 === true ? 'checked' : ''}>
          <label for="use_primary_color_sec2">Use Primary Font Color for Section 2 Values</label>
        </div>
        <div class="chk-row">
          <input type="checkbox" id="remove_section_bg" ${this._config.remove_section_bg === true ? 'checked' : ''}>
          <label for="remove_section_bg">Remove Dark Section Backgrounds (Transparent)</label>
        </div>
        <div class="editor-row">
          <label>Section Background Color:</label>
          <input type="color" id="section_bg_color" value="${this._config.section_bg_color || '#121212'}">
        </div>
        <div class="editor-row">
          <label>Primary Font Color:</label>
          <input type="color" id="primary_font_color" value="${this._config.primary_font_color || '#2e7d32'}">
        </div>
        <div class="editor-row">
          <label>Time Font Color:</label>
          <input type="color" id="time_font_color" value="${this._config.time_font_color || '#2196f3'}">
        </div>
        <div class="editor-row">
          <label>Max Cell Voltage Color:</label>
          <input type="color" id="max_cell_color" value="${this._config.max_cell_color || '#2196f3'}">
        </div>
        <div class="editor-row">
          <label>Min Cell Voltage Color:</label>
          <input type="color" id="min_cell_color" value="${this._config.min_cell_color || '#f44336'}">
        </div>
        <div class="editor-row">
          <label>Section 2 Data Alignment:</label>
          <select id="sec2_align">
            <option value="center" ${alignValSec2 === 'center' ? 'selected' : ''}>Center</option>
            <option value="space-between" ${alignValSec2 === 'space-between' ? 'selected' : ''}>Space Between</option>
            <option value="flex-start" ${alignValSec2 === 'flex-start' ? 'selected' : ''}>Left (Flex Start)</option>
            <option value="flex-end" ${alignValSec2 === 'flex-end' ? 'selected' : ''}>Right (Flex End)</option>
          </select>
        </div>
        <div class="editor-row">
          <label>Section 3 Data Alignment:</label>
          <select id="sec3_align">
            <option value="center" ${alignValSec3 === 'center' ? 'selected' : ''}>Center</option>
            <option value="space-between" ${alignValSec3 === 'space-between' ? 'selected' : ''}>Space Between</option>
            <option value="flex-start" ${alignValSec3 === 'flex-start' ? 'selected' : ''}>Left (Flex Start)</option>
            <option value="flex-end" ${alignValSec3 === 'flex-end' ? 'selected' : ''}>Right (Flex End)</option>
          </select>
        </div>

        <div class="sec-title" style="display: flex; justify-content: space-between; align-items: center;">
          <span>Section 2 Display Items</span>
          <button id="btn-add-item" style="background: var(--primary-color, #03a9f4); color: #fff; border: none; border-radius: 4px; padding: 4px 10px; cursor: pointer; font-size: 12px; font-weight: bold;">+ Add Item</button>
        </div>
        <div id="sec2-items-container">
          ${itemsHtml}
        </div>
      </div>
    `;

    this.updateEntityPickers();
    this.attachEventListeners();
  }

  attachEventListeners() {
    // Inputs & Selects Direct Binding
    const inputs = [
      'prefix', 'cell_count', 'sec2_header_decimals', 'sec3_decimals', 's1_font_size',
      's2_header_font_size', 's2_font_size', 's3_font_size', 's4_font_size',
      'section_bg_color', 'primary_font_color', 'time_font_color',
      'max_cell_color', 'min_cell_color', 'sec2_align', 'sec3_align'
    ];

    inputs.forEach(id => {
      const el = this.querySelector(`#${id}`);
      if (el) {
        el.addEventListener('change', (e) => this._valueChanged(id, e.target.value));
      }
    });

    // Checkboxes Direct Binding
    const checkboxes = [
      'show_section_1', 'show_section_2', 'show_section_2_header',
      'show_section_3', 'show_section_4', 'show_cells_title',
      'use_mohm_res', 'use_primary_color_sec2', 'remove_section_bg'
    ];

    checkboxes.forEach(id => {
      const el = this.querySelector(`#${id}`);
      if (el) {
        el.addEventListener('change', (e) => this._valueChanged(id, e.target.checked));
      }
    });

    // Item Move/Delete/Clear Events
    this.querySelectorAll('.btn-move').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const idx = parseInt(e.currentTarget.getAttribute('data-idx'), 10);
        const dir = e.currentTarget.getAttribute('data-dir');
        this._moveItem(idx, dir);
      });
    });

    this.querySelectorAll('.btn-del').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const idx = parseInt(e.currentTarget.getAttribute('data-idx'), 10);
        this._deleteItem(idx);
      });
    });

    this.querySelectorAll('.btn-clear-entity').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const idx = parseInt(e.currentTarget.getAttribute('data-idx'), 10);
        this._updateItemField(idx, 'entity', '');
      });
    });

    const btnAdd = this.querySelector('#btn-add-item');
    if (btnAdd) {
      btnAdd.addEventListener('click', () => this._addItem());
    }

    // Dynamic Item Field Changes
    this.querySelectorAll('#sec2-items-container input, #sec2-items-container select, #sec2-items-container ha-entity-picker').forEach(input => {
      input.addEventListener('change', (e) => {
        const idx = parseInt(e.target.getAttribute('data-idx'), 10);
        const field = e.target.getAttribute('data-field');
        if (!isNaN(idx) && field) {
          const val = e.target.value !== undefined ? e.target.value : e.detail?.value;
          this._updateItemField(idx, field, val);
        }
      });
    });
  }

  _valueChanged(key, value) {
    if (!this._config) return;
    const newConfig = Object.assign({}, this._config, { [key]: value });
    this._config = newConfig;
    this.dispatchEvent(new CustomEvent('config-changed', { detail: { config: newConfig }, bubbles: true, composed: true }));
  }

  _getSec2Items() {
    return this._config.sec2_items ? [...this._config.sec2_items] : [
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
  }

  _updateItemField(idx, field, val) {
    const items = this._getSec2Items();
    if (items[idx]) {
      items[idx][field] = field === 'decimals' || field === 'column' ? parseInt(val, 10) : val;
      this._valueChanged('sec2_items', items);
      this.render();
    }
  }

  _addItem() {
    const items = this._getSec2Items();
    items.push({ label: 'New Item:', entity_suffix: '', unit: '', decimals: 1, column: 1 });
    this._valueChanged('sec2_items', items);
    this.render();
  }

  _deleteItem(idx) {
    const items = this._getSec2Items();
    items.splice(idx, 1);
    this._valueChanged('sec2_items', items);
    this.render();
  }

  _moveItem(idx, dir) {
    const items = this._getSec2Items();
    const targetIdx = dir === 'up' ? idx - 1 : idx + 1;
    if (targetIdx >= 0 && targetIdx < items.length) {
      const temp = items[idx];
      items[idx] = items[targetIdx];
      items[targetIdx] = temp;
      this._valueChanged('sec2_items', items);
      this.render();
    }
  }
}

customElements.define("jk-bms-card", JkBmsCard);
customElements.define("jk-bms-card-editor", JkBmsCardEditor);

window.customCards = window.customCards || [];
window.customCards.push({
  type: "jk-bms-card",
  name: "JK-BMS Custom Card",
  description: "A custom Lovelace card designed to display detailed status for JK-BMS devices."
});

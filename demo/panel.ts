/** 下拉选项定义 */
export interface SelectOption {
  value: string;
  label: string;
}

/** 面板控件定义 */
export interface ControlDef<T extends Record<string, unknown>> {
  /** 状态对象中的键；group 类型时省略 */
  key?: keyof T & string;
  label: string;
  type: "group" | "toggle" | "range" | "select";
  min?: number;
  max?: number;
  step?: number;
  options?: SelectOption[];
}

/**
 * 根据声明式定义构建控制面板
 *
 * @param root - 挂载容器
 * @param state - 状态对象，控件直接读写 state[key]
 * @param defs - 控件定义列表
 * @param onChange - 值变化回调，参数为对应的 key
 */
export const buildPanel = <T extends Record<string, unknown>>(
  root: HTMLElement,
  state: T,
  defs: ControlDef<T>[],
  onChange: (key: keyof T & string) => void,
): void => {
  root.innerHTML = "";
  for (const def of defs) {
    if (def.type === "group") {
      const heading = document.createElement("h3");
      heading.className = "ctl-group-title";
      heading.textContent = def.label;
      root.appendChild(heading);
      continue;
    }

    if (!def.key) continue;

    const key = def.key;
    const row = document.createElement("label");
    row.className = "ctl";
    const labelText = document.createElement("span");
    labelText.className = "ctl-label";
    labelText.textContent = def.label;
    row.appendChild(labelText);

    if (def.type === "toggle") {
      const input = document.createElement("input");
      input.type = "checkbox";
      input.className = "ctl-toggle";
      input.checked = Boolean(state[key]);
      input.addEventListener("change", () => {
        (state as Record<string, unknown>)[key] = input.checked;
        onChange(key);
      });
      row.appendChild(input);
    } else if (def.type === "select") {
      const select = document.createElement("select");
      select.className = "ctl-select";
      for (const opt of def.options ?? []) {
        const optionEl = document.createElement("option");
        optionEl.value = opt.value;
        optionEl.textContent = opt.label;
        if (String(state[key]) === opt.value) {
          optionEl.selected = true;
        }
        select.appendChild(optionEl);
      }
      select.value = String(state[key]);
      select.addEventListener("change", () => {
        (state as Record<string, unknown>)[key] = select.value;
        onChange(key);
      });
      row.appendChild(select);
    } else {
      const input = document.createElement("input");
      input.type = "range";
      input.className = "ctl-range";
      input.min = String(def.min ?? 0);
      input.max = String(def.max ?? 1);
      input.step = String(def.step ?? 1);
      input.value = String(state[key]);

      const valueText = document.createElement("span");
      valueText.className = "ctl-value";
      valueText.textContent = input.value;

      input.addEventListener("input", () => {
        (state as Record<string, unknown>)[key] = Number.parseFloat(input.value);
        valueText.textContent = input.value;
        onChange(key);
      });
      row.append(input, valueText);
    }

    root.appendChild(row);
  }
};

/** 面板控件定义 */
export interface ControlDef {
  /** 状态对象中的键；group 类型时省略 */
  key?: string;
  label: string;
  type: "group" | "toggle" | "range";
  min?: number;
  max?: number;
  step?: number;
}

/**
 * 根据声明式定义构建控制面板
 *
 * @param root - 挂载容器
 * @param state - 状态对象，控件直接读写 state[key]
 * @param defs - 控件定义列表
 * @param onChange - 值变化回调，参数为对应的 key
 */
export const buildPanel = (
  root: HTMLElement,
  state: Record<string, any>,
  defs: ControlDef[],
  onChange: (key: string) => void,
): void => {
  for (const def of defs) {
    if (def.type === "group") {
      const heading = document.createElement("h3");
      heading.textContent = def.label;
      root.appendChild(heading);
      continue;
    }

    const row = document.createElement("label");
    row.className = "ctl";
    const labelText = document.createElement("span");
    labelText.textContent = def.label;
    row.appendChild(labelText);

    if (def.type === "toggle") {
      const input = document.createElement("input");
      input.type = "checkbox";
      input.checked = Boolean(state[def.key!]);
      input.addEventListener("change", () => {
        state[def.key!] = input.checked;
        onChange(def.key!);
      });
      row.appendChild(input);
    } else {
      const input = document.createElement("input");
      input.type = "range";
      input.min = String(def.min ?? 0);
      input.max = String(def.max ?? 1);
      input.step = String(def.step ?? 1);
      input.value = String(state[def.key!]);
      const valueText = document.createElement("span");
      valueText.className = "ctl-value";
      valueText.textContent = input.value;
      input.addEventListener("input", () => {
        state[def.key!] = Number.parseFloat(input.value);
        valueText.textContent = input.value;
        onChange(def.key!);
      });
      row.append(input, valueText);
    }

    root.appendChild(row);
  }
};

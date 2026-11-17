const categories = {
  weight: {
    units: [
      { id: "kg", label: "кг", factor: 1000 },
      { id: "g", label: "г", factor: 1 },
      { id: "lb", label: "фунты", factor: 453.59237 },
      { id: "oz", label: "унции", factor: 28.349523125 },
    ],
    defaults: ["kg", "lb"],
  },
  length: {
    units: [
      { id: "cm", label: "см", factor: 1 },
      { id: "m", label: "м", factor: 100 },
      { id: "in", label: "дюймы", factor: 2.54 },
      { id: "ft", label: "футы", factor: 30.48 },
    ],
    defaults: ["cm", "in"],
  },
  temperature: {
    units: [
      { id: "c", label: "°C" },
      { id: "f", label: "°F" },
    ],
    defaults: ["c", "f"],
  },
};

const form = document.querySelector("#converter-form");
const amountInput = document.querySelector("#amount");
const fromSelect = document.querySelector("#from-unit");
const toSelect = document.querySelector("#to-unit");
const resultOutput = document.querySelector("#result");
const message = document.querySelector("#validation-message");
const categoryButtons = document.querySelectorAll(".category-tab");
let activeCategory = "weight";

function populateUnits() {
  const { units, defaults } = categories[activeCategory];

  [fromSelect, toSelect].forEach((select, index) => {
    select.replaceChildren(
      ...units.map((unit) => {
        const option = document.createElement("option");
        option.value = unit.id;
        option.textContent = unit.label;
        return option;
      }),
    );
    select.value = defaults[index];
  });

  amountInput.min = activeCategory === "temperature" ? "" : "0";
  amountInput.setAttribute(
    "aria-label",
    activeCategory === "temperature" ? "Исходная температура" : "Исходное значение",
  );
  message.textContent = "";
  updateResult();
}

function convert(value, fromId, toId) {
  if (activeCategory === "temperature") {
    const celsius = fromId === "f" ? ((value - 32) * 5) / 9 : value;
    return toId === "f" ? (celsius * 9) / 5 + 32 : celsius;
  }

  const units = categories[activeCategory].units;
  const fromUnit = units.find((unit) => unit.id === fromId);
  const toUnit = units.find((unit) => unit.id === toId);
  return (value * fromUnit.factor) / toUnit.factor;
}

function formatResult(value) {
  const rounded = Number(value.toFixed(4));
  return new Intl.NumberFormat("ru-RU", {
    maximumFractionDigits: 4,
  }).format(rounded);
}

function updateResult() {
  const value = amountInput.valueAsNumber;
  if (!Number.isFinite(value)) {
    resultOutput.textContent = "—";
    message.textContent = "Введите число, чтобы увидеть результат.";
    return;
  }

  if (activeCategory !== "temperature" && value < 0) {
    resultOutput.textContent = "—";
    message.textContent = "Вес и рост не могут быть отрицательными.";
    return;
  }

  message.textContent = "";
  resultOutput.textContent = formatResult(
    convert(value, fromSelect.value, toSelect.value),
  );
}

categoryButtons.forEach((button) => {
  button.addEventListener("click", () => {
    activeCategory = button.dataset.category;
    categoryButtons.forEach((tab) => {
      const selected = tab === button;
      tab.classList.toggle("is-active", selected);
      tab.setAttribute("aria-pressed", String(selected));
    });
    populateUnits();
  });
});

form.addEventListener("input", updateResult);
form.addEventListener("change", updateResult);

document.querySelector("#swap-button").addEventListener("click", () => {
  const previousFrom = fromSelect.value;
  fromSelect.value = toSelect.value;
  toSelect.value = previousFrom;
  updateResult();
});

populateUnits();

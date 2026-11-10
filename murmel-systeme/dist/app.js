import { convert, decompose, validateDecimal } from "./number-systems.js";
import { marbleLayout } from "./layout.js";

const decimalInput = document.querySelector("#decimal-input");
const baseInput = document.querySelector("#base-input");
const baseValue = document.querySelector("#base-value");
const baseDown = document.querySelector("#base-down");
const baseUp = document.querySelector("#base-up");
const error = document.querySelector("#input-error");
const stage = document.querySelector("#stage");
const stageWrap = document.querySelector("#stage-wrap");
const equivalence = document.querySelector("#result-title");
const sumFormula = document.querySelector("#sum-formula");
const form = document.querySelector("#number-form");

const accentColors = ["#176f67", "#ef765d", "#cf8b22", "#477f9f", "#8a5f9e", "#3d8460"];

function superscript(power) {
  return `<sup>${power}</sup>`;
}

function subscript(value) {
  return `<sub>${value}</sub>`;
}

function placeMarkup(place, index, total, base) {
  const layout = marbleLayout(place.weight, base);
  const showBundleLabel = layout.marble >= 30 && place.weight > 1;
  const marbles = Array.from({ length: place.digit }, (_, marbleIndex) => `
    <span class="marble" style="--marble:${marbleIndex}" data-label-visible="${showBundleLabel}" aria-hidden="true">
      <span>×${place.weight}</span>
    </span>`).join("");
  const fill = base === 1 ? 0 : Math.round((place.digit / (base - 1)) * 100);
  const label = `${place.symbol} Bündel zu je ${place.weight} Murmeln. ${place.contribution} von ${place.capacity} Plätzen belegt.`;

  return `
    <article class="place" style="--order:${index}; --accent:${accentColors[(total - index - 1) % accentColors.length]}" aria-label="${label}">
      <div class="vessel" style="--vessel-size:${layout.vessel}px; --marble-size:${layout.marble}px; --marble-gap:${layout.gap}px; --fill:${fill}%" data-digit="${place.symbol}">
        <div class="marble-bed">${marbles}</div>
      </div>
      <div class="place-copy">
        <p class="place-power">Stellenwert ${base}${superscript(place.power)} = ${place.weight}</p>
        <p class="place-equation">${place.symbol} × ${place.weight} = ${place.contribution}</p>
        <div class="place-stats">
          <span>Kapazität ${place.capacity}</span>
          <span>Inhalt ${place.contribution}</span>
        </div>
      </div>
    </article>`;
}

function render() {
  const validation = validateDecimal(decimalInput.value);
  const base = Number(baseInput.value);
  baseValue.textContent = String(base);
  baseDown.disabled = base <= 2;
  baseUp.disabled = base >= 16;

  if (!validation.valid) {
    error.textContent = validation.message;
    decimalInput.setAttribute("aria-invalid", "true");
    return;
  }

  error.textContent = "";
  decimalInput.removeAttribute("aria-invalid");
  const decimal = validation.value;
  const places = decompose(decimal, base);
  const representation = convert(decimal, base);

  equivalence.innerHTML = `${decimal}${subscript(10)} <span aria-hidden="true">=</span> ${representation}${subscript(base)}`;
  equivalence.setAttribute("aria-label", `${decimal} zur Basis 10 ist ${representation} zur Basis ${base}`);
  stage.innerHTML = places.map((place, index) => placeMarkup(place, index, places.length, base)).join("");
  sumFormula.innerHTML = `${places.map((place) => `${place.symbol}×${base}${superscript(place.power)}`).join(" + ")} = ${decimal}`;

  stageWrap.scrollTo({ left: 0, top: stageWrap.scrollHeight, behavior: "instant" });
}

function setBase(nextBase) {
  baseInput.value = String(Math.max(2, Math.min(16, nextBase)));
  render();
}

form.addEventListener("submit", (event) => event.preventDefault());
decimalInput.addEventListener("input", render);
baseInput.addEventListener("input", render);
baseDown.addEventListener("click", () => setBase(Number(baseInput.value) - 1));
baseUp.addEventListener("click", () => setBase(Number(baseInput.value) + 1));

document.querySelectorAll("[data-number][data-base]").forEach((button) => {
  button.addEventListener("click", () => {
    decimalInput.value = button.dataset.number;
    baseInput.value = button.dataset.base;
    render();
  });
});

render();

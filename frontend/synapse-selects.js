/* Branded, accessible select menus for Synapse. */
(function() {
  "use strict";

  const SOURCE_CLASS = "synapse-select-source";
  const SELECT_ATTR = "data-synapse-select";
  let nextId = 0;
  let openShell = null;
  let refreshTimer = 0;

  function escapeHTML(value) {
    return String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function cssEscape(value) {
    if (window.CSS?.escape) return window.CSS.escape(value);
    return String(value || "").replace(/[^a-zA-Z0-9_-]/g, "\\$&");
  }

  function labelTextFor(select) {
    const explicit = select.getAttribute("aria-label");
    if (explicit) return explicit.trim();
    const label = labelElementFor(select);
    if (label) return label.textContent.replace(/\s+/g, " ").trim();
    return select.name || "Select option";
  }

  function labelElementFor(select) {
    if (!select.id) return null;
    return document.querySelector(`label[for="${cssEscape(select.id)}"]`);
  }

  function ensureSelectId(select) {
    if (!select.id) {
      nextId += 1;
      select.id = `synapseSelectSource${nextId}`;
    }
    return select.id;
  }

  function selectedLabel(select) {
    const selected = select.options[select.selectedIndex] || select.options[0];
    return selected ? selected.textContent.replace(/\s+/g, " ").trim() : "Select";
  }

  function variantClass(select) {
    const classes = select.classList;
    if (classes.contains("notes-language-select")) return "synapse-select--compact";
    if (classes.contains("language-select")) return "synapse-select--hero";
    if (classes.contains("auth-input")) return "synapse-select--auth";
    if (classes.contains("quiz-type-select")) return "synapse-select--quiz-type";
    if (classes.contains("form-select")) return "synapse-select--form";
    return "";
  }

  function optionIndex(select, fallback = 0) {
    const current = select.selectedIndex;
    if (current >= 0 && !select.options[current]?.disabled) return current;
    const options = Array.from(select.options);
    const firstEnabled = options.findIndex(option => !option.disabled);
    return firstEnabled >= 0 ? firstEnabled : fallback;
  }

  function nextEnabledIndex(select, current, direction) {
    const options = Array.from(select.options);
    if (!options.length) return -1;
    let index = current;
    for (let step = 0; step < options.length; step += 1) {
      index = (index + direction + options.length) % options.length;
      if (!options[index].disabled) return index;
    }
    return current;
  }

  function setActiveOption(shell, index) {
    shell.dataset.activeIndex = String(index);
    shell.querySelectorAll(".synapse-select__option").forEach(option => {
      const active = Number(option.dataset.index) === index;
      option.classList.toggle("is-active", active);
      if (active) {
        shell.querySelector(".synapse-select__button")
          ?.setAttribute("aria-activedescendant", option.id);
      }
    });
  }

  function closeCurrent() {
    if (!openShell) return;
    openShell.classList.remove("is-open");
    openShell.querySelector(".synapse-select__button")?.setAttribute("aria-expanded", "false");
    openShell.querySelector(".synapse-select__menu")?.setAttribute("aria-hidden", "true");
    openShell = null;
  }

  function openSelect(shell, select) {
    if (openShell && openShell !== shell) closeCurrent();
    shell.classList.add("is-open");
    openShell = shell;
    const activeIndex = optionIndex(select);
    setActiveOption(shell, activeIndex);
    const active = shell.querySelector(`.synapse-select__option[data-index="${activeIndex}"]`);
    active?.scrollIntoView({ block: "nearest" });
    shell.querySelector(".synapse-select__button")?.setAttribute("aria-expanded", "true");
    shell.querySelector(".synapse-select__menu")?.setAttribute("aria-hidden", "false");
  }

  function chooseOption(select, index) {
    const option = select.options[index];
    if (!option || option.disabled) return;
    select.selectedIndex = index;
    select.dispatchEvent(new Event("input", { bubbles: true }));
    select.dispatchEvent(new Event("change", { bubbles: true }));
    syncSelect(select);
    closeCurrent();
  }

  function handleButtonKeydown(event, select, shell) {
    const isOpen = shell.classList.contains("is-open");
    if (event.key === "Escape") {
      event.preventDefault();
      closeCurrent();
      return;
    }
    if (!isOpen && ["ArrowDown", "ArrowUp", "Enter", " "].includes(event.key)) {
      event.preventDefault();
      openSelect(shell, select);
      return;
    }
    if (!isOpen) return;

    const active = Number(shell.dataset.activeIndex || optionIndex(select));
    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      setActiveOption(shell, nextEnabledIndex(select, active, event.key === "ArrowDown" ? 1 : -1));
      return;
    }
    if (event.key === "Home" || event.key === "End") {
      event.preventDefault();
      const options = Array.from(select.options);
      const index = event.key === "Home"
        ? options.findIndex(option => !option.disabled)
        : options.length - 1 - [...options].reverse().findIndex(option => !option.disabled);
      if (index >= 0) setActiveOption(shell, index);
      return;
    }
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      chooseOption(select, Number(shell.dataset.activeIndex || active));
    }
  }

  function renderSelect(select) {
    const shell = select.__synapseSelectShell;
    if (!shell) return;
    const selectId = ensureSelectId(select);
    const label = labelTextFor(select);
    const listId = `${selectId}Listbox`;
    const value = selectedLabel(select);
    shell.className = `synapse-select ${variantClass(select)}`.trim();
    shell.dataset.sourceId = selectId;
    shell.innerHTML = `
      <button class="synapse-select__button" type="button" role="combobox"
              aria-haspopup="listbox" aria-expanded="false" aria-controls="${escapeHTML(listId)}"
              aria-label="${escapeHTML(`${label}: ${value}`)}" ${select.disabled ? "disabled" : ""}>
        <span class="synapse-select__value">${escapeHTML(value)}</span>
        <span class="synapse-select__chevron" aria-hidden="true">
          <i class="bi bi-chevron-down"></i>
        </span>
      </button>
      <div id="${escapeHTML(listId)}" class="synapse-select__menu" role="listbox" aria-label="${escapeHTML(label)}" aria-hidden="true">
        ${Array.from(select.options).map((option, index) => {
          const selected = index === select.selectedIndex;
          return `
            <button id="${escapeHTML(`${listId}Option${index}`)}" class="synapse-select__option" type="button"
                    role="option" tabindex="-1" data-index="${index}" aria-selected="${selected ? "true" : "false"}"
                    aria-disabled="${option.disabled ? "true" : "false"}">
              <span>${escapeHTML(option.textContent.replace(/\s+/g, " ").trim())}</span>
              <span class="synapse-select__check" aria-hidden="true"><i class="bi bi-check-lg"></i></span>
            </button>
          `;
        }).join("")}
      </div>
    `;

    const button = shell.querySelector(".synapse-select__button");
    button?.addEventListener("keydown", event => handleButtonKeydown(event, select, shell));
    shell.querySelectorAll(".synapse-select__option").forEach(optionButton => {
      optionButton.addEventListener("mouseenter", () => setActiveOption(shell, Number(optionButton.dataset.index)));
      optionButton.addEventListener("click", () => chooseOption(select, Number(optionButton.dataset.index)));
    });
  }

  function syncSelect(select) {
    if (!select || !select.__synapseSelectShell) return;
    renderSelect(select);
  }

  function enhanceSelect(select) {
    if (!select || select.multiple || select.dataset.synapseNative === "true") return;
    if (!select.__synapseSelectShell || !select.__synapseSelectShell.isConnected) {
      ensureSelectId(select);
      const shell = document.createElement("div");
      select.__synapseSelectShell = shell;
      select.classList.add(SOURCE_CLASS);
      select.setAttribute("aria-hidden", "true");
      select.tabIndex = -1;
      select.hidden = true;
      select.setAttribute(SELECT_ATTR, "source");
      select.insertAdjacentElement("afterend", shell);
      select.addEventListener("change", () => syncSelect(select));
      const label = labelElementFor(select);
      if (label && !select.__synapseSelectLabelBound) {
        select.__synapseSelectLabelBound = true;
        label.addEventListener("click", event => {
          event.preventDefault();
          select.__synapseSelectShell
            ?.querySelector(".synapse-select__button")
            ?.focus();
        });
      }
    }
    renderSelect(select);
  }

  function refreshAllSelects() {
    document.querySelectorAll("select").forEach(enhanceSelect);
  }

  function scheduleRefresh() {
    window.clearTimeout(refreshTimer);
    refreshTimer = window.setTimeout(refreshAllSelects, 40);
  }

  function mutationNeedsRefresh(mutation) {
    const target = mutation.target;
    if (target?.closest?.(".synapse-select")) return false;
    if (target?.matches?.("select")) return true;
    return Array.from(mutation.addedNodes || []).some(node => (
      node.nodeType === 1 && (node.matches?.("select") || node.querySelector?.("select"))
    ));
  }

  function selectForShell(shell) {
    const sourceId = shell?.dataset?.sourceId;
    return sourceId ? document.getElementById(sourceId) : null;
  }

  document.addEventListener("click", event => {
    const button = event.target?.closest?.(".synapse-select__button");
    if (button) {
      const shell = button.closest(".synapse-select");
      const select = selectForShell(shell);
      if (select && !select.disabled) {
        event.preventDefault();
        if (shell.classList.contains("is-open")) closeCurrent();
        else openSelect(shell, select);
      }
      return;
    }
    if (openShell && !openShell.contains(event.target)) closeCurrent();
  });

  document.addEventListener("DOMContentLoaded", () => {
    refreshAllSelects();
    const observer = new MutationObserver(mutations => {
      if (mutations.some(mutationNeedsRefresh)) scheduleRefresh();
    });
    observer.observe(document.body, {
      attributes: true,
      attributeFilter: ["class", "disabled", "aria-label"],
      childList: true,
      subtree: true
    });
  }, { once: true });

  window.SynapseSelects = {
    refresh: refreshAllSelects
  };
})();

"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

class MockElement {
  constructor() {
    this.listeners = {};
    this.required = false;
    this.value = "";
    this.classList = {
      add() {},
      remove() {},
    };
  }

  addEventListener(type, callback) {
    this.listeners[type] = callback;
  }

  click() {
    this.listeners.click?.({});
  }

  querySelector() {
    return this.label;
  }

  setAttribute() {}
}

const ids = [
  "demo-modal",
  "demo-request-form",
  "demo-step-1",
  "demo-step-2",
  "demo-submit-btn",
  "demo-spinner",
  "demo-success",
  "demo-error",
  "demo-firstname",
  "demo-lastname",
  "demo-phone",
  "demo-company",
  "demo-country",
  "demo-language",
];
const elements = Object.fromEntries(ids.map((id) => [id, new MockElement()]));
elements["demo-submit-btn"].label = new MockElement();
const openTrigger = new MockElement();
const closeTrigger = new MockElement();

const document = {
  body: new MockElement(),
  getElementById: (id) => elements[id] ?? null,
  querySelectorAll: (selector) => {
    if (selector === "[data-demo-modal-open]") return [openTrigger];
    if (selector === "[data-demo-modal-close]") return [closeTrigger];
    return [];
  },
};

const source = fs.readFileSync(
  path.join(__dirname, "../portal/static/js/demo-modal.js"),
  "utf8"
);
vm.runInNewContext(source, { document, console, fetch() {}, setTimeout() {} });

openTrigger.click();
elements["demo-request-form"].listeners.submit({ preventDefault() {} });
const stepTwoFields = [
  "demo-firstname",
  "demo-lastname",
  "demo-phone",
  "demo-company",
  "demo-country",
  "demo-language",
];
assert.ok(stepTwoFields.every((id) => elements[id].required));

closeTrigger.click();
openTrigger.click();
assert.ok(
  stepTwoFields.every((id) => !elements[id].required),
  "reopening the modal should clear required flags from hidden step-two fields"
);

console.log("Demo modal reopen test passed");

import loadDom from "./dom";
import "../styles/main.css";

type ElementOptions<K extends keyof HTMLElementTagNameMap> = {
  el: K;
  className?: string;
  row?: number;
  col?: Number;
};

// a simple function that generates elements and the Gameboard "cells"
export function createElement<K extends keyof HTMLElementTagNameMap>({
  el,
  className,
  row,
  col,
}: ElementOptions<K>): HTMLElementTagNameMap[K] {
  const element = document.createElement(el);

  if (className) element.classList.add(className);
  if (row !== undefined) element.setAttribute("data-y", String(row));
  if (col !== undefined) element.setAttribute("data-x", String(col));

  return element;
}

type Coordinate = [number, number];

interface IShip {
  length: number;
  numberOfHits: number;
  isShipSunk: boolean;
  coordinates: Coordinate[];
}
/* The Ship class logic which is responsible for giving
  each Ship its length, calculate the number of hits it receives,
  checks whether a Ship is considered sunk or not and saves its coordinates
  (where it's exactly located in rows and cols)
*/
export class Ship implements IShip {
  length: number;
  numberOfHits: number;
  isShipSunk: boolean;
  coordinates: Coordinate[];

  constructor(length: number) {
    this.length = length;
    this.numberOfHits = 0;
    this.isShipSunk = false;
    this.coordinates = [];
  }

  hit() {
    this.numberOfHits++;
    if (this.numberOfHits >= this.length) this.isShipSunk = true;
  }

  isSunk() {
    return this.isShipSunk;
  }
}

interface IGameboard {
  size: number;
  ships: Ship[];
  missedShots: Coordinate[];
  hitShots: Coordinate[];
}

// Gameboard class
export class Gameboard implements IGameboard {
  size: number;
  ships: Ship[];
  missedShots: Coordinate[];
  hitShots: Coordinate[];

  constructor(size = 10) {
    this.size = size;
    this.ships = [];
    this.missedShots = [];
    this.hitShots = [];
  }

  placeShip(ship: Ship, coordinates: Coordinate[]) {
    ship.coordinates = coordinates;
    this.ships.push(ship);
  }

  // logic for getting the Player side ship
  getShip(row: number, col: number) {
    for (let i = 0; i < this.ships.length; i++) {
      const ship = this.ships[i];

      for (let j = 0; j < ship.coordinates.length; j++) {
        const [r, c] = ship.coordinates[j];

        if (r === row && c === col) {
          return ship;
        }
      }
    }
    return null;
  }
  // the logic for receiving attacks on the ships
  receiveAttack([row, col]: Coordinate) {
    const alreadyShot =
      this.missedShots.some(([r, c]) => r === row && c === col) ||
      this.hitShots.some(([r, c]) => r === row && c === col);

    if (alreadyShot) return "already-attacked";

    const ship = this.ships.find((s) =>
      s.coordinates.some(([r, c]) => r === row && c === col),
    );

    if (!ship) {
      this.missedShots.push([row, col]);
      return "miss";
    }

    ship.hit();
    this.hitShots.push([row, col]);

    if (ship.isShipSunk) return "sunk";
    return "hit";
  }

  allShipsSunk() {
    return this.ships.every((ship) => ship.isShipSunk);
  }
}

// Dialog generator options

type dialogOptions = {
  method: string;
  formId: string;
  modalTitle: string;
  hasLabel: boolean;
  labelText?: string;
  labelFor?: string;
  hasInput: boolean;
  inputType?: string;
  inputName?: string;
  inputID?: string;
  submitClass: string;
  submitText: string;
  hasCancelBtn: boolean;
  cancelClass: string;
};

// Dialog generator function
export function createDialog(options: dialogOptions) {
  const {
    method,
    formId,
    modalTitle,
    hasLabel = true,
    labelText,
    labelFor,
    hasInput = true,
    inputType,
    inputName,
    inputID,
    submitClass,
    submitText,
    hasCancelBtn = true,
    cancelClass,
  } = options;

  const dialog = createElement({ el: "dialog" });
  const form = createElement({ el: "form" });
  const title = createElement({ el: "h2" });
  const label = createElement({ el: "label" });
  const input = createElement({ el: "input" });

  title.classList.add("dialog-title");

  const modalBtnsCon = createElement({ el: "div", className: "modalBtns" });
  const submitBtn = createElement({ el: "button" });
  const cancelBtn = createElement({ el: "button" });

  form.method = method;
  form.id = formId;
  form.setAttribute("novalidate", "");

  title.textContent = modalTitle;

  if (hasLabel) {
    if (!labelFor || !labelText)
      throw new Error("Missing labels Error: logic 179");
    label.setAttribute("for", labelFor);
    label.textContent = labelText;

    form.appendChild(label);
  }

  if (hasInput) {
    if (!inputType || !inputID || !inputName)
      throw new Error("Missing inputs config Error: logic 187");
    input.type = inputType;
    input.id = inputID;
    input.name = inputName;

    form.appendChild(input);
  }

  submitBtn.setAttribute("data-create-modal", "");
  submitBtn.classList.add(submitClass);
  submitBtn.textContent = submitText;

  if (hasCancelBtn) {
    cancelBtn.setAttribute("data-close-modal", "");
    cancelBtn.classList.add(cancelClass);
    cancelBtn.textContent = "Cancel";
    modalBtnsCon.append(cancelBtn);
  }

  modalBtnsCon.prepend(submitBtn);

  form.prepend(title);
  form.append(modalBtnsCon);

  dialog.appendChild(form);
  return dialog;
}

loadDom();

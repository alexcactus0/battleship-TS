import { createElement, Ship, Gameboard, createDialog } from "./logic";
import icon from "../images/icon.svg";
import created from "../images/created.svg";

export default function loadDom() {
  const profileCon = createElement({ el: "div", className: "profileCon" });
  const profileIconCon = createElement({ el: "div", className: "profileIcon" });
  const profileTextCon = createElement({ el: "div", className: "profileText" });
  const profile = createElement({ el: "div", className: "profile" });
  const iconImg = createElement({ el: "img" });
  iconImg.src = icon;

  profileTextCon.textContent = "Add Profile";
  profileIconCon.appendChild(iconImg);
  profile.append(profileIconCon, profileTextCon);
  profileCon.appendChild(profile);

  // a modal for the player's profile Name
  const profileDialog = createDialog({
    method: "dialog",
    formId: "profileForm",
    modalTitle: "Enter the Username Captain!",
    hasLabel: true,
    labelText: "Username: ",
    labelFor: "name",
    hasInput: true,
    inputType: "text",
    inputName: "name",
    inputID: "name",
    submitClass: "submitName",
    submitText: "Submit",
    hasCancelBtn: true,
    cancelClass: "cancelName",
  });

  const endDialog = createDialog({
    method: "dialog",
    formId: "endForm",
    modalTitle: "YOU WON!",
    hasLabel: false,
    hasInput: false,
    submitClass: "restartBtn",
    submitText: "Restart",
    hasCancelBtn: false,
    cancelClass: "",
  });

  const overlay = createElement({ el: "div", className: "overlay" });
  document.body.append(profileDialog, endDialog, overlay);

  profileIconCon.addEventListener("click", () => {
    overlay.classList.add("show");
    profileDialog.showModal();
  });

  profileDialog.addEventListener("close", () =>
    overlay.classList.remove("show"),
  );

  const playerSide = createElement({ el: "div", className: "playerSide" });
  const playerTitle = createElement({ el: "div", className: "playerTitle" });
  const userWaters = createElement({ el: "div", className: "userWaters" });
  userWaters.textContent = "FRIENDLY WATERS";

  let currentPlacement: HTMLDivElement[] = [];
  let isValidPlace = false;
  let isHorizontal = true;
  let draggedShip: Ship | null = null;
  let draggedShipEl: HTMLElement | null = null;

  const btnsCon = createElement({ el: "div", className: "btns" });
  const rotateShipBtn = createElement({ el: "button" });
  const randomizeBtn = createElement({ el: "button" });
  rotateShipBtn.textContent = "Rotate";
  randomizeBtn.textContent = "Randomize";
  btnsCon.append(rotateShipBtn, randomizeBtn);

  const rotateText = createElement({ el: "div", className: "rotateText" });
  rotateText.textContent = "Orientation: HORIZONTAL";

  playerTitle.append(rotateText, btnsCon, userWaters);

  rotateShipBtn.addEventListener("click", () => {
    isHorizontal = !isHorizontal;
    if (!isHorizontal) rotateText.textContent = "Orientation: VERTICAL";
    else {
      rotateText.textContent = "Orientation: HORIZONTAL";
    }
  });

  randomizeBtn.addEventListener("click", () => {
    clearBoard();
    clearShipCoordinates();

    renderShips();

    playerBoard.ships = [];

    ships.forEach((ship) => {
      let placed = false;

      while (!placed) {
        const randomHorizontal = Math.random() < 0.5;

        const row = Math.floor(Math.random() * playerBoard.size);
        const col = Math.floor(Math.random() * playerBoard.size);

        const squares = getPlacementSquares({
          row: row,
          col: col,
          length: ship.length,
          isHorizontal: randomHorizontal,
        });

        if (!squares) continue;

        if (isValidPlacement(squares)) {
          placeShipSquares(squares);

          ship.coordinates = squares.map((sq) => [
            Number(sq.dataset.y),
            Number(sq.dataset.x),
          ]);
          playerBoard.placeShip(ship, ship.coordinates);

          placed = true;
        }
      }
    });

    shipsContainer.innerHTML = "";
    draggedShip = null;
    draggedShipEl = null;
  });

  const restartBtn = document.querySelector(".restartBtn") as HTMLButtonElement;
  restartBtn.addEventListener("click", (e: MouseEvent) => {
    e.preventDefault();
    overlay.classList.remove("show");
    location.reload();
  });

  const submitName = document.querySelector(".submitName") as HTMLButtonElement;
  submitName.addEventListener("click", () => {
    const userNameInput = document.getElementById("name") as HTMLInputElement;
    if (!userNameInput) return;
    else if (userNameInput.value === "") {
      userWaters.textContent = "FRIENDLY WATERS";
      profileTextCon.textContent = "Add Profile";
    } else {
      const name = userNameInput.value.toUpperCase();

      iconImg.src = created;
      profileTextCon.textContent = name;
      userWaters.textContent = `${name} WATERS`;
    }
  });

  type PlacementSquares = {
    row: number;
    col: number;
    length: number;
    isHorizontal: boolean;
  };

  // randomize Btn helper
  function getPlacementSquares({
    row,
    col,
    length,
    isHorizontal,
  }: PlacementSquares) {
    const squares = [];

    for (let i = 0; i < length; i++) {
      const r = isHorizontal ? row : row + i;
      const c = isHorizontal ? col + i : col;

      const target = playerSquares[r]?.[c];
      if (!target) return null;
      squares.push(target);
    }
    return squares;
  }

  // randomize Btn helper
  function isValidPlacement(squares: HTMLDivElement[]) {
    if (!squares) return false;

    return squares.every(
      (sq: HTMLDivElement) => !sq.classList.contains("ship-placed"),
    );
  }

  // randomize Btn helper
  function placeShipSquares(squares: HTMLDivElement[]) {
    squares.forEach((sq: HTMLDivElement) => sq.classList.add("ship-placed"));
  }

  function clearBoard() {
    playerSquares.flat().forEach((sq: HTMLDivElement) => {
      sq.classList.remove("ship-placed", "highlight", "invalid");
    });
  }

  const availableLengths = [1, 2, 3, 4, 5];
  const ships: Ship[] = [];
  const shipsContainer = createElement({
    el: "div",
    className: "shipsContainer",
  });

  for (let i = 0; i < 5; i++) {
    const randomIndex = Math.floor(Math.random() * availableLengths.length);
    const chosenLength = availableLengths.splice(randomIndex, 1)[0];

    ships.push(new Ship(chosenLength));
  }

  function clearShipCoordinates() {
    ships.forEach((ship: Ship) => {
      ship.coordinates = [];
      ship.numberOfHits = 0;
      ship.isShipSunk = false;
    });
  }

  // randomize Btn helper (rebuilds ships UI)
  type ShipElement = HTMLDivElement & {
    addShip: (shipEl: HTMLElement) => void;
  };

  const shipsElements = {
    destroyer: createElement({
      el: "div",
      className: "destroyer",
    }) as ShipElement,
    cruiser: createElement({ el: "div", className: "cruiser" }) as ShipElement,
    submarine: createElement({
      el: "div",
      className: "submarine",
    }) as ShipElement,
    battleship: createElement({
      el: "div",
      className: "battleship",
    }) as ShipElement,
    carrier: createElement({ el: "div", className: "carrier" }) as ShipElement,
  };

  function capitalize(str: string) {
    return str[0].toUpperCase() + str.slice(1);
  }

  Object.entries(shipsElements).forEach(([key, el]) => {
    el.addShip = function (shipEl: HTMLElement) {
      this.appendChild(shipEl);
      shipEl.textContent = capitalize(key);
    };
  });

  function renderShips() {
    shipsContainer.innerHTML = "";
    ships.forEach((ship: Ship) => {
      const shipEl = createElement({ el: "div", className: "ship" });
      shipEl.setAttribute("draggable", "true");

      shipEl.style.cursor = "grab";
      shipEl.draggable = true;

      shipEl.addEventListener("dragstart", () => {
        draggedShip = ship;
        draggedShipEl = shipEl;
      });

      shipEl.addEventListener("dragend", () => {
        playerSquares.flat().forEach((sq: HTMLDivElement) => {
          sq.classList.remove("highlight");
          sq.classList.remove("invalid");
        });
      });

      switch (ship.length) {
        case 1:
          shipsElements.destroyer.addShip(shipEl);
          break;
        case 2:
          shipsElements.cruiser.addShip(shipEl);
          break;
        case 3:
          shipsElements.submarine.addShip(shipEl);
          break;
        case 4:
          shipsElements.battleship.addShip(shipEl);
          break;
        case 5:
          shipsElements.carrier.addShip(shipEl);
          break;
      }
    });

    Object.values(shipsElements).forEach((el: HTMLElement) =>
      shipsContainer.append(el),
    );
  }

  ships.forEach((ship: Ship) => {
    const shipEl = createElement({ el: "div", className: "ship" });
    shipEl.setAttribute("draggable", "true");

    shipEl.style.cursor = "grab";
    shipEl.draggable = true;

    shipEl.addEventListener("dragstart", () => {
      draggedShip = ship;
      draggedShipEl = shipEl;
    });

    shipEl.addEventListener("dragend", () => {
      playerSquares.flat().forEach((sq: HTMLDivElement) => {
        sq.classList.remove("highlight");
        sq.classList.remove("invalid");
      });
    });

    switch (ship.length) {
      case 1:
        shipsElements.destroyer.addShip(shipEl);
        break;
      case 2:
        shipsElements.cruiser.addShip(shipEl);
        break;
      case 3:
        shipsElements.submarine.addShip(shipEl);
        break;
      case 4:
        shipsElements.battleship.addShip(shipEl);
        break;
      case 5:
        shipsElements.carrier.addShip(shipEl);
        break;
    }
  });

  Object.values(shipsElements).forEach((el: HTMLElement) =>
    shipsContainer.append(el),
  );

  type BoardUI = {
    container: HTMLDivElement;
    size: number;
  };

  const container = createElement({ el: "div", className: "board" });
  const playerBoard = new Gameboard(10);
  const playerSquares = createBoardUI({ container: container, size: 10 });

  function createBoardUI({ container, size }: BoardUI) {
    const squares: HTMLDivElement[][] = [];

    for (let row = 0; row < size; row++) {
      const rowArr: HTMLDivElement[] = [];
      for (let col = 0; col < size; col++) {
        const square = createElement({
          el: "div",
          className: "board-cell",
          row: row,
          col: col,
        });
        container.appendChild(square);
        rowArr.push(square);
      }
      squares.push(rowArr);
    }

    return squares;
  }

  playerSquares.flat().forEach((square: HTMLDivElement) => {
    square.addEventListener("dragover", (e: MouseEvent) => {
      e.preventDefault();
    });

    square.addEventListener("mouseenter", () => {
      if (!draggedShip) return;

      playerSquares.flat().forEach((sq: HTMLDivElement) => {
        sq.classList.remove("highlight");
        sq.classList.remove("invalid");
      });

      currentPlacement = [];

      const length = draggedShip.length;

      const row = Number(square.dataset.y);
      const col = Number(square.dataset.x);

      for (let i = 0; i < length; i++) {
        let target;

        if (isHorizontal) {
          target = playerSquares[row]?.[col + i];
        } else {
          target = playerSquares[row + i]?.[col];
        }

        if (target) currentPlacement.push(target);
      }

      isValidPlace =
        currentPlacement.length === length &&
        currentPlacement.every(
          (sq: HTMLDivElement) => !sq.classList.contains("ship-placed"),
        );

      currentPlacement.forEach((sq: HTMLDivElement) => {
        sq.classList.add(isValidPlace ? "highlight" : "invalid");
      });
    });

    square.addEventListener("click", () => {
      if (!draggedShip) return;
      if (!isValidPlace) return;

      currentPlacement.forEach((sq: HTMLDivElement) => {
        sq.classList.remove("highlight");
        sq.classList.remove("invalid");
        sq.classList.add("ship-placed");
      });

      draggedShip.coordinates = currentPlacement.map((sq: HTMLDivElement) => [
        Number(sq.dataset.y),
        Number(sq.dataset.x),
      ]);

      playerBoard.placeShip(draggedShip, draggedShip.coordinates);

      if (draggedShipEl == null)
        throw new Error("draggedShipEL returned null 387");
      draggedShipEl.remove();

      // reset dragging
      draggedShip = null;
      draggedShipEl = null;
    });
  });

  const startBtnContainer = createElement({ el: "div", className: "startCon" });
  const startGameBtn = createElement({ el: "button" });
  startGameBtn.textContent = "Start Game";
  startBtnContainer.appendChild(startGameBtn);

  let computerBoard: Gameboard | null = null;
  let computerSquares: HTMLDivElement[][] | null = null;
  let computerContainer: HTMLDivElement | null = null;

  startGameBtn.addEventListener("click", () => {
    if (shipsContainer.querySelector(".ship")) {
      alert("Place all your ships first");
      return;
    }

    btnsCon.remove();
    rotateText.remove();
    profileCon.remove();
    shipsContainer.remove();
    startBtnContainer.remove();

    if (computerBoard) return;

    const computerSide = createElement({
      el: "div",
      className: "computerSide",
    });
    const computerTitle = createElement({
      el: "div",
      className: "computerTitle",
    });
    computerTitle.textContent = "ENEMY WATERS";

    computerContainer = createElement({
      el: "div",
      className: "computerBoard",
    });
    computerSide.append(computerTitle, computerContainer);
    document.body.appendChild(computerSide);

    computerBoard = new Gameboard(10);
    computerSquares = createBoardUI({ container: computerContainer, size: 10 });

    placeComputerShips();

    enableComputerAttacks();

    resetGameBtn();

    playerSide.style.display = "flex";
    playerSide.style.flexDirection = "column";

    computerSide.style.display = "flex";
    computerSide.style.flexDirection = "column";
  });

  function resetGameBtn() {
    const resetBtn = createElement({ el: "div", className: "resetBtn" });
    resetBtn.textContent = "Reset Game";

    resetBtn.addEventListener("click", () => {});
  }

  type SquaresOnUi = PlacementSquares & {
    squares: HTMLDivElement[][] | null;
  };

  function getPlacementSquaresOnUI({
    squares,
    row,
    col,
    length,
    isHorizontal,
  }: SquaresOnUi) {
    const placement: HTMLDivElement[] = [];

    for (let i = 0; i < length; i++) {
      const r = isHorizontal ? row : row + i;
      const c = isHorizontal ? col + i : col;
      if (squares == null) throw new Error("squares are null at line 476");
      const target = squares[r]?.[c];
      if (!target) return null;

      placement.push(target);
    }

    return placement;
  }

  function placeComputerShips() {
    const lengths = [1, 2, 3, 4, 5];

    lengths.forEach((length) => {
      const ship = new Ship(length);
      let placed = false;

      while (!placed) {
        const isHorizontal = Math.random() < 0.5;
        const row = Math.floor(Math.random() * 10);
        const col = Math.floor(Math.random() * 10);

        const placementSquares = getPlacementSquaresOnUI({
          squares: computerSquares,
          row: row,
          col: col,
          length: length,
          isHorizontal: isHorizontal,
        });

        if (!placementSquares) continue;
        const ok = placementSquares.every(
          (sq: HTMLDivElement) => !sq.classList.contains("computer-ship"),
        );

        if (!ok) continue;

        placementSquares.forEach((sq: HTMLDivElement) =>
          sq.classList.add("computer-ship"),
        );

        const coords: [number, number][] = placementSquares.map(
          (sq: HTMLDivElement) => [Number(sq.dataset.y), Number(sq.dataset.x)],
        );

        if (computerBoard == null)
          throw new Error("computerBoard is null at line 522");
        computerBoard.placeShip(ship, coords);

        placed = true;
      }
    });
  }
  function enableComputerAttacks() {
    if (computerSquares == null)
      throw new Error("computerBoard is null at line 530");

    computerSquares.flat().forEach((square) => {
      square.addEventListener("click", () => {
        if (!playerTurn) return;

        const row = Number(square.dataset.y);
        const col = Number(square.dataset.x);

        if (computerBoard == null)
          throw new Error("computerBoard is null at line 530");

        const result = computerBoard.receiveAttack([row, col]);

        if (result === "already-attacked") return;

        if (result === "miss") {
          square.classList.add("miss");
          playerTurn = false;
          setTimeout(computerMove, 500); // A Timeout before the comp attacks
        } else {
          square.classList.add("hit");
          if (result === "sunk") console.log("You sunk a computer ship!");
        }

        if (computerBoard.allShipsSunk()) {
          overlay.classList.add("show");
          endDialog.showModal();
        }
      });
    });
  }

  let playerTurn = true;

  function computerMove() {
    let row;
    let col;
    let result;

    do {
      row = Math.floor(Math.random() * 10);
      col = Math.floor(Math.random() * 10);
      result = playerBoard.receiveAttack([row, col]);
    } while (result === "already-attacked");

    const square = playerSquares[row][col];

    if (result === "miss") {
      square.classList.add("miss");
      playerTurn = true;
    } else {
      square.classList.add("hit");
      if (result === "sunk") console.log("computer sunk a ship!");
      setTimeout(computerMove, 500);
    }

    if (playerBoard.allShipsSunk()) {
      const title = endDialog.querySelector(
        ".dialog-title",
      ) as HTMLDialogElement;
      title.textContent = "YOU LOST TO COMPUTER";
      overlay.classList.add("show");
      endDialog.showModal();
    }
  }
  playerSide.append(shipsContainer, playerTitle, container, startBtnContainer);

  document.body.append(profileCon, playerSide);
}

var rows = 5;
var columns = 5;

var currTile;
var otherTile;

var turns = 0;

window.onload = function () {
  // Initialize the 5x5 board
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < columns; c++) {
      let tile = document.createElement("img");
      tile.src = "./images/blank2.jpg";

      addDragEvents(tile);
      document.getElementById("board").append(tile);
    }
  }

  // Create shuffled pieces
  let pieces = [];
  for (let i = 1; i <= rows * columns; i++) {
    pieces.push(i.toString());
  }

  // Shuffle pieces
  pieces = pieces.sort(() => Math.random() - 0.5);

  // Add pieces to pieces div
  for (let i = 0; i < pieces.length; i++) {
    let tile = document.createElement("img");
    tile.src = "./images/" + pieces[i] + ".jpg";

    addDragEvents(tile);
    document.getElementById("pieces").append(tile);
  }
};

// ✅ Helper to add drag events
function addDragEvents(tile) {
  tile.classList.add("w-[79px]", "h-[79px]", "border", "border-blue-200");

  tile.addEventListener("dragstart", dragStart);
  tile.addEventListener("dragover", dragOver);
  tile.addEventListener("dragenter", dragEnter);
  tile.addEventListener("dragleave", dragLeave);
  tile.addEventListener("drop", dragDrop);
  tile.addEventListener("dragend", dragEnd);
}

// --- DRAG FUNCTIONS ---
function dragStart() {
  currTile = this;
}

function dragOver(e) {
  e.preventDefault();
}

function dragEnter(e) {
  e.preventDefault();
}

function dragLeave() { }

function dragDrop() {
  otherTile = this;
}

function dragEnd() {
  if (!currTile || !otherTile) return;

  if (currTile.src.includes("blank")) {
    return;
  }

  let currImg = currTile.src;
  let otherImg = otherTile.src;

  currTile.src = otherImg;
  otherTile.src = currImg;

  turns += 1;
  document.getElementById("turns").innerText = turns;
}

var matrixSize = document.getElementById("matrixSize").value;
var matrix = document.getElementById("matrix");
var start = null;
var end = null;
var impassables = new Set();

function makeMatrix() {
  matrixSize = document.getElementById("matrixSize").value;
  var newMatrix = document.createElement("table");
  for (var i = 0; i < matrixSize; i++) {
    var row = document.createElement("tr");
    for (var j = 0; j < matrixSize; j++) {
      var element = document.createElement("td");
      element.dataset.x = j;
      element.dataset.y = i;
      element.addEventListener("click", function () {
      // поставить начальную или конечную точки
        if (start == null && !impassables.has(this)) {
          start = this;
          this.style.backgroundColor = "yellow";
        } else if (end == null && this != start && !impassables.has(this)) {
          end = this;
          this.style.backgroundColor = "green";
        } else if (this == start || this == end) {
          if (this == start) {
            start = null;
            this.style.backgroundColor = "";
          }
          if (this == end) {
            end = null;
            this.style.backgroundColor = "";
          }
        } else if (start != null && end != null && this != start && this != end) {
          if (!impassables.has(this)) {
            impassables.add(this);
            this.classList.add("impassable");
          } else if (impassables.has(this)) {
            impassables.delete(this);
            this.classList.remove("impassable");
          }
        }
      });
      row.appendChild(element);
    }
    newMatrix.appendChild(row);
  }

  // удаляем старую матрицу и создаем новую
  matrix.parentNode.replaceChild(newMatrix, matrix);

  // сбрасываем все 
  matrix = newMatrix;
  start = null;
  end = null;
  impassables.clear();
  pathFound = false;
  path = null;
}

function run() {
  // Удалить старый путь
for (var i = 0; i < matrixSize; i++) {
  for (var j = 0; j < matrixSize; j++) {
      var element = matrix.rows[i].cells[j];
      element.classList.remove("path");
  }
}

// находим путь 
if (start == null || end == null) {
alert("Поставьте начало и конец пути!");
} else {
var openSet = new Set([start]);
var cameFrom = new Map();
var gScore = new Map([[start, 0]]);
var fScore = new Map([[start, heuristic(start, end)]]);
// в цикле он ищет кратчайший путь до тех пор пока не найдет конец или не окажется иных вариантов 
while (openSet.size > 0) {
  var current = getLowestFScore(openSet, fScore);
// проверка  дошел ли он до конца
  if (current == end) {
    showPath(cameFrom, end);
    return;
  }

  openSet.delete(current);

  for (var neighbor of getNeighbors(current)) {
    if (impassables.has(neighbor)) {
      continue;
    }
    var tentativeGScore = gScore.get(current) + 1;

    if (!gScore.has(neighbor) || tentativeGScore < gScore.get(neighbor)) {
      cameFrom.set(neighbor, current);
      gScore.set(neighbor, tentativeGScore);
      fScore.set(neighbor, tentativeGScore + heuristic(neighbor, end));
      if (!openSet.has(neighbor)) {
        openSet.add(neighbor);
      }
    }
  }
}
alert("До вкусняшки нет пути (");
}
}

function getLowestFScore(set, scores) {
  // Находим наикратчайший путь 
  var lowest = null;
  var lowestScore = Infinity;
  for (var elem of set) {
  if (scores.get(elem) < lowestScore) {
  lowest = elem;
  lowestScore = scores.get(elem);
  }
  }
  return lowest;
  }
  
  function getNeighbors(element) {
  // смотрим  соседние ячейки 
  var neighbors = new Set();
  var x = parseInt(element.dataset.x);
  var y = parseInt(element.dataset.y);
  if (x > 0) {
  neighbors.add(matrix.rows[y].cells[x - 1]);
  }
  if (x < matrixSize - 1) {
  neighbors.add(matrix.rows[y].cells[x + 1]);
  }
  if (y > 0) {
  neighbors.add(matrix.rows[y - 1].cells[x]);
  }
  if (y < matrixSize - 1) {
  neighbors.add(matrix.rows[y + 1].cells[x]);
  }
  return neighbors;
  }
  
  function heuristic(a, b) {
  // Вычислить расстояние манхэттэна между двумя ячейкамиФормула манхэттенского расстояния:
  // abs (x1 - x2) + abs (y1 - y2), где x1, y1, x2, y2 - координаты точек, между которыми находится расстояние. 
  //abs - функция получения числа по модулю.
  var x1 = parseInt(a.dataset.x);
  var y1 = parseInt(a.dataset.y);
  var x2 = parseInt(b.dataset.x);
  var y2 = parseInt(b.dataset.y);
  return Math.abs(x1 - x2) + Math.abs(y1 - y2);
  }
  
  function showPath(cameFrom, current) {
  // показать путь 
  while (cameFrom.has(current)) {
  current = cameFrom.get(current);
  if (current != start) {
  current.classList.add("path");
  }
  }
  }
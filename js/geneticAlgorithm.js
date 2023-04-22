const canvas = document.querySelector("canvas");
const context = canvas.getContext("2d");

let size = 600;
let points = [];
let lengthOfChromosome;
let numberOfGenerations = 10000;
let chanceOfMutation = 40;

canvas.addEventListener('click', mouseClick);
document.getElementById("clear").onclick = clearFunc;
document.getElementById("start").onclick = geneticAlg;

//кнопка перезагрузки страницы
function clearFunc() {
    location.reload();
}

//ф-ция прорисовки городов после клика мышки
function mouseClick(e) {
    //определение координат учитывая положение холста
    let xPosition = e.pageX - e.target.offsetLeft;
    let yPosition = e.pageY - e.target.offsetTop;

    points.push([xPosition, yPosition]);
    drawPoints();
}

//ф-ция прорисовки круга
function drawPoints() {
    for (let i = 0; i < points.length; ++i) {
        context.beginPath();
        context.arc(points[i][0], points[i][1], 10, 0, 2 * Math.PI, false);
        context.fillStyle = '#861010';
        context.fill();
    }
}

//ф-ция прорисовки путей
function drawVectors(from, to) {
    //добавляется первая точка в конец массива from, чтобы замкнуть линию
    from.splice(from.length - 1, 0, from[0].slice())
    //прорисовка невидимых линий, расчитываются координаты начальной и конечной точек линии
    //рисует векторы для каждых пары соседних точек
    for (let i = 0; i < from.length - 1; ++i) {
        context.beginPath();
        let vector = [from[i + 1][0] - from[i][0], from[i + 1][1] - from[i][1]];
        let s = Math.sqrt(vector[0] * vector[0] + vector[1] * vector[1]);

        context.moveTo(from[i][0] + vector[0] * 10 / s, from[i][1] + vector[1] * 10 / s);
        context.lineTo(from[i + 1][0] - vector[0] * 10 / s, from[i + 1][1] - vector[1] * 10 / s);
        context.strokeStyle = "rgb(255,255,255)";
        context.lineWidth = 2;
        context.stroke();

    }
    //прорисовка видимого маршрута, уже для другого массива
    to.splice(to.length - 1, 0, to[0].slice())
    for (let q = 0; q < to.length - 1; ++q) {
        context.beginPath();
        let vector = [to[q + 1][0] - to[q][0], to[q + 1][1] - to[q][1]];
        let s = Math.sqrt(vector[0] * vector[0] + vector[1] * vector[1]);
        context.moveTo(to[q][0] + vector[0] * 10 / s, to[q][1] + vector[1] * 10 / s);
        context.lineTo(to[q + 1][0] - vector[0] * 10 / s, to[q + 1][1] - vector[1] * 10 / s);
        context.strokeStyle = "rgb(0,0,0)";
        context.lineWidth = 1;
        context.stroke();
    }
}

//перемешивает массив
function mixing(array) {
    let buf = array.slice()
    for (let i = 0; i < points.length - 1; ++i) {
        let r1 = randomNumber(1, points.length - 1);
        let r2 = randomNumber(1, points.length - 1);
        [buf[r1], buf[r2]] = [buf[r2], buf[r1]];
    }
    return buf.slice();
}

//создает первую популяцию
function firstPopulation(firstGeneration) {
    let popul = [];
    //slice создание копии массива
    let buffer = firstGeneration.slice();
    buffer.push(distance(buffer));
    popul.push(buffer.slice());

    for (let i = 0; i < points.length * points.length; ++i) {
        buffer = firstGeneration.slice();
        buffer = mixing(buffer);
        buffer.push(distance(buffer));
        popul.push(buffer.slice());
    }
    return popul;
}

//ф-ция добавляет новую хромосому в популяцию в порядке возрастания ее вычисленного расстояния
function addChromosome(population, chromosome) {
    //если популяция пуста, то хр-ма просто добавляется
    if (!population.length) {
        population.push(chromosome.slice());
    }
    //иначе ищется первая хр-ма, которая имеет большее расстояние, и новая хр-ма добавляется перед ней
    else {
        let added = false;
        for (let i = 0; i < population.length; ++i) {
            if (chromosome[chromosome.length - 1] < population[i][population[i].length - 1]) {
                population.splice(i, 0, chromosome);
                added = true;
                break;
            }
        }
        //если таких хромосом нет, то просто добавляется в конец
        if (!added) {
            population.push(chromosome.slice());
        }
    }
}

//ф-ция ожидания
function wait(time) {
    return new Promise(resolve => setTimeout(resolve, time));
}

//вычисляет расстояние между всеми точками
function distance(chromosome) {
    let dist = 0;
    for (let i = 0; i < chromosome.length - 1; ++i) {
        dist += Math.sqrt(Math.pow(chromosome[i][0] - chromosome[i + 1][0], 2) + Math.pow(chromosome[i][1] - chromosome[i + 1][1], 2));
    }
    dist += Math.sqrt(Math.pow(chromosome[chromosome.length - 1][0] - chromosome[0][0], 2) + Math.pow(chromosome[chromosome.length - 1][1] - chromosome[0][1], 2));
    return dist;
}

//ф-ция генерации 2 РАЗЛИЧНЫХ рандомных чисел
function twoRandomNumbers(min, max) {
    let one = Math.floor(Math.random() * (max - min) + min);
    let two = Math.floor(Math.random() * (max - min) + min);
    while (one === two) {
        one = Math.floor(Math.random() * (max - min) + min);
    }
    return [one, two];
}

//ф-ция генерации рандомного числа
function randomNumber(min, max) {
    return Math.floor(Math.random() * (max - min) + min);
}

// Функция скрещивания, принимает 2 родителя и возвращает дочерний элемент, 
//представляющий собой случайную комбинацию входных массивов
function crossover(firstParent, secondParent) {
    let child = [];
    let index1 = randomNumber(0, firstParent.length);
    let index2 = randomNumber(index1 + 1, firstParent.length);
    child = firstParent.slice(index1, index2 + 1);

    for (let num of secondParent) {
        if (!child.includes(num)) {
            child.push(num);
        }
    }
    //в ф-ции скрещивания учитывается мутация, т е существует вероятность случайного обмена 
    //двух элементов в дочернем элементе
    if (Math.random() * 100 < chanceOfMutation) {
        let rand = twoRandomNumbers(1, lengthOfChromosome);
        let i = rand[0], j = rand[1];
        [child[i], child[j]] = [child[j], child[i]];
    }

    return child;
}

//с помощью ф-ции скрещивания создает 2 дочерних элемента
function crossovering(firstParent, secondParent) {
    let firstChild = crossover(firstParent, secondParent);
    let secondChild = crossover(firstParent, secondParent);

    //вычисляет расстояние между генами каждого ребенка и записывает в конец массива
    firstChild.push(distance(firstChild.slice()))
    secondChild.push(distance(secondChild.slice()))
    return [firstChild, secondChild];
}

async function geneticAlg() {
    let firstGeneration = [];
    let end = 500;

    for (let i = 0; i < points.length; ++i) {
        firstGeneration.push(points[i]);
    }
    lengthOfChromosome = firstGeneration.length;

    let population = firstPopulation(firstGeneration);
    //сортируем популяцию по последнему эл-ту, то есть по длине маршрута
    population.sort((function (a, b) { return a[a.length - 1] - b[b.length - 1] }));

    let bestChromosome = population[0].slice();

    drawVectors(bestChromosome, population[0])

    //рисуем итоговый путь
    for (let i = 0; i < numberOfGenerations; ++i) {
        if (end === 0) {
            drawVectors(bestChromosome, population[0])
            break;
        }

        //оставляем только определенное кол-во лучших хромосом
        population = population.slice(0, points.length * points.length);

        for (let j = 0; j < points.length * points.length; ++j) {
            let index1 = randomNumber(0, population.length);
            let index2 = randomNumber(0, population.length);
            let firstParent = population[index1].slice(0, population[index1].length - 1);
            let secondParent = population[index2].slice(0, population[index2].length - 1);

            let child = crossovering(firstParent, secondParent);
            population.push(child[0].slice())
            population.push(child[1].slice())
        }

        //сортируем популяцию по последнему эл-ту
        population.sort((function (a, b) { return a[a.length - 1] - b[b.length - 1] }));

        //если лучшая хромосома изменилась, то рисуем новый путь и обновляем переменную
        if (JSON.stringify(bestChromosome) !== JSON.stringify(population[0])) {
            drawVectors(bestChromosome, population[0])
            bestChromosome = population[0].slice();
            end = 500;
        }

        //если текущее поколение кратно 100, то уменьшаем end на 100
        if (i % 100 === 0) {
            end -= 100;
        }

        //чтобы линии не проходили прямо по точкам, нужно перерисовать кружки
        drawPoints();
        //для того, чтобы показывался не только конечный путь берем паузу
        await wait(0);
    }
}
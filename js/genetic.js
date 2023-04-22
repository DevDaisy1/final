//массив для хранения городов
var cities = [];
var totalCities = 0;
var recordDistance;
var bestEver = [];

//настройка холста и кнопки и добавление реакции на клики
function setup() {
    var canvas = document.getElementById('canvas');
    canvas.addEventListener('click', addCity);
    var startButton = document.getElementById('startButton');
    startButton.addEventListener('click', startAlgorithm);
}

//добавление точек на холст, запись их координат в массив городов
function addCity(event) {
    var canvas = document.getElementById('canvas');
    var rect = canvas.getBoundingClientRect();
    var x = event.clientX - rect.left;
    var y = event.clientY - rect.top;
    var v = { x: x, y: y };
    cities.push(v);
    totalCities++;
    redraw();
}


//перерисовка холста с обновленными городами и лучшим маршрутом
function redraw() {
    var canvas = document.getElementById('canvas');
    var ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.beginPath();
    ctx.fillStyle = '#FFFFFF';
    for (var i = 0; i < cities.length; i++) {
        ctx.moveTo(cities[i].x + 8, cities[i].y);
        ctx.arc(cities[i].x, cities[i].y, 8, 0, 2 * Math.PI);
    }
    ctx.fill();
    ctx.beginPath();
    ctx.strokeStyle = '#FFFFFF';
    ctx.lineWidth = 1;
    for (var i = 0; i < cities.length; i++) {
        ctx.lineTo(cities[i].x, cities[i].y);
    }
    ctx.closePath();
    ctx.stroke();
    //наилучший маршрут
    ctx.beginPath();
    ctx.strokeStyle = '#FF00FF';
    ctx.lineWidth = 4;
    for (var i = 0; i < cities.length; i++) {
        ctx.lineTo(bestEver[i].x, bestEver[i].y);
    }
    ctx.closePath();
    ctx.stroke();
}

//!!!!!!!!!!!!!!!!!!!!11

function startAlgorithm() {
    const populationSize = 50;
    const maxGenerations = 100;
    const result = geneticAlgorithm(totalCities, populationSize, maxGenerations);
    bestEver = result.bestEver;
    redraw();
}

//принимает на вход массив городов и возвращает матрицу расстояний между ними
function calculateDistances(cities) {
    const distances = [];
    for (let i = 0; i < cities.length; i++) {
        distances[i] = [];
        for (let j = 0; j < cities.length; j++) {
            const dx = cities[i].x - cities[j].x;
            const dy = cities[i].y - cities[j].y;
            distances[i][j] = Math.sqrt(dx * dx + dy * dy);
        }
    }
    return distances;
}

//принимает на вход массив городов и возвращает длину маршрута между ними
function calculateDistance(chromosome, distances) {
    let distance = 0;
    for (let i = 0; i < chromosome.length - 1; i++) {
        distance += distances[chromosome[i]][chromosome[i + 1]];
    }
    distance += distances[chromosome[chromosome.length - 1]][chromosome[0]];
    return distance;
}


// Генерация начальной популяции
function generatePopulation(size, totalCities) {
    const population = [];
    for (let i = 0; i < size; i++) {
        population.push(shuffle([...Array(totalCities).keys()]));
    }
    return population;
}

// Функция скрещивания
function crossover(parent1, parent2) {
    const point = Math.floor(Math.random() * parent1.length);
    const child1 = [...parent1.slice(0, point), ...parent2.filter((el) => !parent1.slice(0, point).includes(el))];
    const child2 = [...parent2.slice(0, point), ...parent1.filter((el) => !parent2.slice(0, point).includes(el))];
    return [child1, child2];
}

// Функция мутации
function mutation(chromosome) {
    const [i, j] = [Math.floor(Math.random() * chromosome.length), Math.floor(Math.random() * chromosome.length)];
    [chromosome[i], chromosome[j]] = [chromosome[j], chromosome[i]];
    return chromosome;
}

// Функция выбора родителей
function selection(population, distances) {
    const fitness = population.map(chromosome => 1 / calculateDistance(chromosome, distances));
    const index = Math.floor(Math.random() * fitness.length);
    return population[index];
}

// Генетический алгоритм
/*function geneticAlgorithm(totalCities, populationSize, maxGenerations) {
    
    // Инициализация популяции
    let population = generatePopulation(populationSize, totalCities);
    let distances = calculateDistances(cities);
    let bestFitness = +Infinity;
    let bestEver = null;

    // Главный цикл алгоритма
    for (let i = 0; i < maxGenerations; i++) {
        // Оценка приспособленности
        const fitness = population.map(chromosome => 1 / calculateDistance(chromosome, distances));
        const avgFitness = fitness.reduce((acc, curr) => acc + curr, 0) / populationSize;
        const bestIndex = fitness.indexOf(Math.max(...fitness));
        const bestChromosome = population[bestIndex];
        if (fitness[bestIndex] > bestFitness) {
            bestFitness = fitness[bestIndex];
            bestEver = bestChromosome;
        }

        // Скрещивание и мутация
        const newPopulation = [bestChromosome];
        while (newPopulation.length < populationSize) {
            const parent1 = selection(population, distances);
            const parent2 = selection(population, distances);
            const [child1, child2] = crossover(parent1, parent2);
            newPopulation.push(mutation(child1), mutation(child2));
        }
        population = newPopulation;
    }
    return bestEver;
}*/

function geneticAlgorithm(totalCities, populationSize, maxGenerations) {
    var totalCities = cities.length;
    // Вычисление матрицы расстояний
    const distances = calculateDistances(cities);

    // Инициализация переменных recordDistance и bestEver
    recordDistance = Infinity;
    bestEver = [];

    // Основной цикл алгоритма
    for (let generation = 0; generation < maxGenerations; generation++) {
        // Оценка приспособленности (fitness) каждого хромосомы в популяции
        const fitness = population.map(chromosome => 1 / calculateDistance(chromosome, distances));

        // Выбор наиболее подходящих родителей (parent selection)
        const parents = [selection(population, fitness), selection(population, fitness)];

        // Скрещивание родителей (crossover)
        const children = crossover(parents[0], parents[1]);

        // Мутация детей (mutation)
        children[0] = mutation(children[0]);
        children[1] = mutation(children[1]);

        // Замена худших хромосом в популяции детьми
        const worstIndex = fitness.indexOf(Math.min(...fitness));
        population[worstIndex] = children[0];
        population[worstIndex + 1] = children[1];

        // Поиск лучшей хромосомы в популяции
        const currentBest = population.reduce((best, chromosome) => {
            const distance = calculateDistance(chromosome, distances);
            if (distance < best.distance) {
                best.chromosome = chromosome;
                best.distance = distance;
            }
            return best;
        }, { chromosome: [], distance: Infinity });

        // Обновление лучшей хромосомы в истории алгоритма
        if (currentBest.distance < recordDistance) {
            recordDistance = currentBest.distance;
            bestEver = currentBest.chromosome.slice();
        }
    }

    // Возвращение лучшей хромосомы и ее длины
    return { bestEver, recordDistance };
}
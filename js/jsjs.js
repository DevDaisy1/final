//параметры дива-холста
const height = 600;
const width = 600;

//переменная холста, кнопки и точек
const pointContainer = document.getElementById('point-container');
const clusteringBtn = document.getElementById('start');
const pointsCollection = document.getElementsByClassName('point');
const renewBtn = document.getElementById('clear');

const points = [];
const COLORS = ['#FF00D6', '#CCFF00', '#00FFFF'];

//проставление точек на холст кликом мышки
pointContainer.addEventListener('click', function (event) {
    //координаты точек, с учетом положения холста
    const rect = pointContainer.getBoundingClientRect();
    const x = event.clientX - rect.left - 10;
    const y = event.clientY - rect.top - 10;

    //создание дива точки
    const point = document.createElement('div');
    point.classList.add('point');
    point.style.left = `${x}px`;
    point.style.top = `${y}px`;
    pointContainer.appendChild(point);

    points.push({ x, y });
});


//что происходит после нажатия на кнопку кластеризации
clusteringBtn.addEventListener('click', function () {
    //всего 3 кластера
    const k = 3;
    const clusters = kMeans(generateClusters(k, width, height), points);

    //удаляем все точки
    for (let i = 0; i < pointsCollection.length;) {
        pointsCollection[i].remove();
    }

    //создаем новые раскрашенные точки
    for (const index in clusters) {
        for (const element of clusters[index]) {
            const point = document.createElement('div');
            point.classList.add('point');
            point.style.left = `${element.x}px`;
            point.style.top = `${element.y}px`;
            point.style.backgroundColor = COLORS[index];
            pointContainer.appendChild(point);
        }
    }

});

//ф-ция случайной генерации начальных координат центров кластеров
function generateClusters(k, width, height) {
    const clusters = [];

    for (let i = 0; i < k; i++) {
        clusters.push({
            x: Math.floor(Math.random() * width),
            y: Math.floor(Math.random() * height)
        });
    }

    return clusters;
}

//кнопка обновить страницу
renewBtn.addEventListener('click', function () {
    location.reload();
});

//!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!

//алгоритм к средних
/*const kMeans = (klasters, points) => {
    let groups = Array(klasters.length).fill([]);
    let minElement = 0;
    let oldDistance = Infinity;
    while (true) {
        let newGroups = Array(klasters.length).fill([]);
        console.log(points)
        points.forEach((element, index) => {
            minElement = 0;
            oldDistance = Infinity;
            klasters.forEach((element2, index2) => {
                if (
                    getDistance(element.x, element2.x, element.y, element2.y) < oldDistance
                ) {
                    minElement = index2;
                    oldDistance = getDistance(
                        element.x,
                        element2.x,
                        element.y,
                        element2.y
                    );
                }
            });
            newGroups[minElement] = [
                ...newGroups[minElement],
                { x: element.x, y: element.y },
            ];
        });
        if (JSON.stringify(groups) == JSON.stringify(newGroups)) break;
        groups = JSON.parse(JSON.stringify(newGroups));

        klasters = klasters.map((element, index) => {
            element.x = 0;
            element.y = 0;
            newGroups[index].forEach((element2) => {
                element.x += element2.x;
                element.y += element2.y;
            });
            return {
                x: element.x / newGroups[index].length,
                y: element.y / newGroups[index].length,
            };
        });
    }
    return groups;
};
//вычисление расстояния с помощью формулы Евклида
function getDistance(x1, x2, y1, y2) {
    return Math.sqrt((x1 - x2) * (x1 - x2) + (y1 - y2) * (y1 - y2));
}*/




//алгоритм к средних
const kMeans = (klasters, points) => {
    //пустой массив начального распределения точек по кластерам
    let groups = Array(klasters.length).fill([]);
    //    let minElement = 0;
    //    let oldDistance = Infinity;
    while (true) {
        let newGroups = Array(klasters.length).fill([]);
        //для каждой точки
        points.forEach((element, index) => {
            let minElement = 0;
            let oldDistance = Infinity;
            //для каждого кластера
            klasters.forEach((element2, index2) => {
                //определяем расстояние от точки до центра кластера
                const distance = getDistance(
                    element.x,
                    element2.x,
                    element.y,
                    element2.y
                );
                if (distance < oldDistance) {
                    minElement = index2;
                    oldDistance = distance;
                }
            });
            //точка добавляется в массив для соответствубщего кластера
            newGroups[minElement] = [
                ...newGroups[minElement],
                { x: element.x, y: element.y },
            ];
        });

        //проверяется, изменилось ли текущее разбиение точек по кластерам относительно предыдущей итерации
        //если нет, то цикл прерывается
        if (JSON.stringify(groups) == JSON.stringify(newGroups)) {
            break;
        }
        //иначе текущее разбиение точек заменяется на новое
        groups = JSON.parse(JSON.stringify(newGroups));

        //для каждого кластера пересчитывается его центр как среднее арифм координат точек, принадлежащих этому кластеру
        klasters = klasters.map((element, index) => {
            element.x = 0;
            element.y = 0;

            newGroups[index].forEach((element2) => {
                element.x += element2.x;
                element.y += element2.y;
            });

            return {
                x: element.x / newGroups[index].length,
                y: element.y / newGroups[index].length,
            };
        });
    }
    return groups;
};

//вычисление расстояния с помощью формулы Евклида
function getDistance(x1, x2, y1, y2) {
    return Math.sqrt((x1 - x2) * (x1 - x2) + (y1 - y2) * (y1 - y2));
}
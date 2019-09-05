const CANVAS_WIDTH = 375// ширина канваса
const CANVAS_HEIGHT = 750// высота канваса
const CANVAS_BACKGROUND = '#ffffff'// цвет фона канваса

const ROW_NUMBERS = 20// количество строк на канвасе
const COLUMNS_NUMBERS = 10// количество столбцов на канвасе
const PADDING = 2// отступ между клетками тетриса в пикселах

// Настройка блоков
const START_BLOCK_NUMBERS = [1, 3, 6, 7, 10, 13, 19]
const COLORS = ['black', 'blue', 'green', 'yellow', 'red', 'pink', 'gray', 'aqua', 'blueviolet', 'indigo', 'darkslategray', 'olive', 'purple', 'yellowgreen', 'chartreuse', 'goldenrod', 'maroon']

// Размеры ячейки
const fieldWidth = CANVAS_WIDTH / COLUMNS_NUMBERS// ширина клетки, которую будем отображать
const fieldHeight = CANVAS_HEIGHT / ROW_NUMBERS// высота клетки, которую будем отображать

// Игра первого игрока
// document.querySelector() позволяет выбрать элемент через CSS-классы
const game1 = getGame(document.querySelector('#canvas1'))
// Игра второго игрока
const game2 = getGame(document.querySelector('#canvas2'))

game1.start()
game2.start()

// Прослушивание события keydown над dom-элементом body
listen('KeyA', game1.moveBlockLeft)
listen('KeyD', game1.moveBlockRight)
listen('KeyW', game1.rotateBlock)
listen('KeyS', game1.moveBlockDown)

listen('ArrowLeft', game2.moveBlockLeft)
listen('ArrowRight', game2.moveBlockRight)
listen('ArrowUp', game2.rotateBlock)
listen('ArrowDown', game2.moveBlockDown)

game1.updateStatus = function updateStatus (scope, level, tetris) {
	const element = document.querySelector('#status1')

	// ищем дочерние элементы выбранного выше element'а
	element.querySelector('[data-role="scope"]').textContent = scope
	element.querySelector('[data-role="level"]').textContent = level
	element.querySelector('[data-role="tetris"]').textContent = tetris
}

game2.updateStatus = function updateStatus (scope, level, tetris) {
	const element = document.querySelector('#status2')

	// ищем дочерние элементы выбранного выше element'а
	element.querySelector('[data-role="scope"]').textContent = scope
	element.querySelector('[data-role="level"]').textContent = level
	element.querySelector('[data-role="tetris"]').textContent = tetris
}

// handler - функция, которая будет вызываться, когда нажата клавиша с кодом code
function listen (code, handler) {
	document.body.addEventListener('keydown', function(event) {
		if (event.code === code) {
			event.preventDefault()
			handler()
		}
	}) 
}

function getGame (canvas) {
console.log(canvas)
	const context = canvas.getContext('2d')

	const map = getMap()

	let block = getBlock(
		getRandomFrom(START_BLOCK_NUMBERS),
		getRandomFrom(COLORS)
	)

	let scope = 0
	let level = 1
	let tetris = 0

	// в какое время блок должен опуститься на 1 вниз
	let downTime = getDownTime()

	canvas.width = CANVAS_WIDTH
	canvas.height = CANVAS_HEIGHT

	// методы которые хранятся здесь будут возвращены наружу из функции
	// чтобы к ним был доступ извне
	const game = {
		start,
		moveBlockDown,
		moveBlockLeft,
		moveBlockRight,
		rotateBlock,
		statusUpdate
	}

	return game

	function statusUpdate () {}

	start()

	// функция регистрирует функцию tick()
	function start () {
		requestAnimationFrame(tick)
	}

	// функция, которая обеспечивает изменение изображения
	function tick (timestamp) {
		// если время системы превосходит downTime, то нужно опустить блок на 1
		if (timestamp >= downTime) {
			// создаем копию блока
			const blockCopy = block.getCopy()
			// опускаем копию
			blockCopy.y = blockCopy.y + 1

			// если блок возможно опустить, то заменяем блок на его копию
			if (canBlockExists(blockCopy)) {
				block = blockCopy
				// если блок уперся вниз, то нужно превратить его в часть игрового поля, которое будем проверять на наличие горизонтальных линий
			} else {
				saveBlock()
				const lines = clearLines()

				// если за 1 раз было убрано 4 линии
				if (lines === 4) {
					tetris++
				}

				scope = scope + lines * 100// счет
				level = 1 + parseInt(scope / 300)// каждые 3 линии уровень сложности будет расти

				// следующий блок выбирается случайным образом
				block = getBlock(
					getRandomFrom(START_BLOCK_NUMBERS),
					getRandomFrom(COLORS)
				)

				game.updateStatus(scope, level, tetris)

				// если невозможно вставить блок на игровое поле - значит конец игры
				if (!canBlockExists(block)) {
					clearCanvas()
					// block = getBlock(20, getRandomFrom(COLORS))
					// drawBlock()
					context.font = "50px Arial"
					context.fillStyle = "red"
					context.textAlign = "center"
					context.fillText("Конец игры!", CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2)

					// context.strokeStyle = "red";
					// context.lineWidth = 2
					// context.textAlign = "center"
					// context.strokeText("Конец игры!", CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2)

					// alert('Конец игры!')
					return
				}
			}

			// отодвигаем downTime на позже
			downTime = timestamp + getDownTime()
		}
		clearCanvas()
		drawBlock()
		drawState()

		// requestAnimationFrame() пытается запустить переданную функцию при следующем обновлении экрана
		requestAnimationFrame(tick)
	}

	// функция возвращает случайное целое число из диапазона между min и max
	function getRandom (min, max) {
		return min + Math.floor(Math.random() * (max - min + 1))
	}

	// функция возвращает время в миллисекундах через которое блок должен опуститься на 1 вниз
	function getDownTime () {
		return 100 + 900 / level
	}

	// context.strokeStyle = 'red'// strokeStyle - каким цветом рисовать
	// context.moveTo(0, 0)// moveTo - в какую точку поставить перо
	// context.lineTo(150, 250)// lineTo - провести линию к точке с заданными координатами x, y
	// context.stroke()// stroke() - отобразить то, что описано выше

	// context.beginPath()
	// context.fillStyle = 'black'// fillStyle - каким цветом заполнить фигуру
	// context.strokeStyle = 'red'// strokeStyle - коким цветом закрасить периметр фигуры
	// context.lineWidth = 5// lineWidth - ширина линии
	// // arc() рисует арку. Принимает координаты x, y, радиус, c какого угла рисовать, до какого угла рисовать,
	// // 5-й аргумент по умолчанию false - рисовать по часовой стрелке, true - против
	// context.arc(250, 250, 100, 0, Math.PI)
	// context.fill()// отобразить внутренность фигуры
	// context.stroke()// stroke() - отобразить периметр

	// функция выбирает случайное значение из переданного массива
	function getRandomFrom (array) {
		const index = Math.floor(Math.random() * array.length)
		return array[index]
	}

	// функция очищает канвас
	function clearCanvas () {
		context.fillStyle = CANVAS_BACKGROUND
		// задаем цвет периметра
		context.strokeStyle = 'black'

		context.rect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT)
		// закрашиваем прямоугольник цветом CANVAS_BACKGROUND
		context.fill()
		context.stroke()
	}

	// функция зарисовывает ячейку тетрис поля
	// принимает координаты самого тетриса x, y, и цвет поля
	function drawField (x, y, color) {
		context.fillStyle = color
		// рисует прямоугольник (координаты x, y, ширина, высота)
		context.fillRect(
			x * fieldWidth + PADDING,
			y * fieldHeight + PADDING,
			fieldWidth - 2 * PADDING, 
			fieldHeight - 2 * PADDING
		)
	}

	// функция отрисовывает блок
	function drawBlock () {
		// проходим по каждой части блока, который нужно отобразить
		for (const part of block.getIncludedParts()) {
			drawField(part.x, part.y, block.color)
		}
	}

	/*
		функция будет искать и очищать полностью заполненные горизонтальные линии
		ищет линии начиная снизу
		опускать содержимое всей системы на 1 ячейку вниз
		возвращает количество только что удаленных линий
	*/
	function clearLines () {
		let lines = 0

		for (let y = ROW_NUMBERS - 1; y >= 0; y--) {
			let flag = true

			for (let x = 0; x < COLUMNS_NUMBERS; x++) {
				if (!getField(x, y)) {
					flag = false
					break
				}
			}

			if (flag) {
				lines = lines + 1

				for (let t = y; t >= 1; t--) {
					for (let x = 0; x < COLUMNS_NUMBERS; x++) {
						map[t][x] = map[t - 1][x]
						map[t - 1][x] = null
					}
				}

				y = y + 1
			}
		}

		return lines
	}

	// функция возвращает карту всех клеток, которые есть на поле
	function getMap () {
		const map = []

		// цикл по строкам карты
		for (let y = 0; y < ROW_NUMBERS; y++) {
			const row = []

			for (let x = 0; x < COLUMNS_NUMBERS; x++) {
				row.push(null)
			}

			map.push(row)
		}

		return map
	}
	// Когда будем обращаться к ячейкам, сперва будем указывать координату y, затем x
	// map[y][x]

	// функция превращает блок в часть игрового поля
	function saveBlock () {
		// проходим по каждой части блока, которые в нем присутствуют
		for (const part of block.getIncludedParts()) {
			// const x = part.x
			// const y = part.y
			// const color = block.color

			// // записываем цвет части с координатой x, y в map
			// map[y][x] = color
			setField(part.x, part.y, block.color)
		}
	}

	// функция рисует состояние карты тетриса
	function drawState () {
		for (let y = 0; y < ROW_NUMBERS; y++) {
			for (let x = 0; x < COLUMNS_NUMBERS; x++) {
				const field = map[y][x]

				if (field) {
					drawField(x, y, field)
				}
			}
		}
	}

	// функция создает блок типа type (один из блоков, которые будут падать вниз)
	// x, y - координаты блока (квадрат, помеченный крестиком на блоке)
	function getBlock (type, color = 'black', x = 4, y = 0) {
			// если имя свойства объекта совпадает с именем переменной, откуда это свойство можно забрать, то можно опустить часть с присваиванием и просто указать только имя свойства
			// type: type,
		const block = {	type, x, y, color }

		// метод возвращает координаты квадратов, из которых состоят блоки
		block.getIncludedParts = function () {
			// p - лямбда-функция
			// возвращает переданный ей объект со смещением dx, dy
			const p = (dx, dy) => ({ x:block.x + dx, y: block.y + dy })

			switch (block.type) {
				case 1: return [p(0, 0), p(1, 0), p(0, 1), p(1, 1)]
				case 2: return [p(0, 0), p(-1, 0), p(0, -1), p(1, 0)]
				case 3: return [p(0, 0), p(-1, 0), p(0, 1), p(1, 0)]
				case 4: return [p(0, 0), p(0, -1), p(1, 0), p(0, 1)]
				case 5: return [p(0, 0), p(0, -1), p(-1, 0), p(0, 1)]
				case 6: return [p(0, 0), p(-1, 1), p(0, 1), p(1, 0)]
				case 7: return [p(0, 0), p(-1, 0), p(0, 1), p(1, 1)]
				case 8: return [p(0, 0), p(-1, -1), p(-1, 0), p(0, 1)]
				case 9: return [p(0, 0), p(0, -1), p(-1, 0), p(-1, 1)]
				case 10: return [p(0, 0), p(-1, 0), p(1, 0), p(2, 0)]
				case 11: return [p(0, 0), p(0, -1), p(0, 1), p(0, 2)]
				case 12: return [p(0, 0), p(1, 0), p(0, 1), p(0, 2)]
				case 13: return [p(0, 0), p(-2, 0), p(-1, 0), p(0, 1)]
				case 14: return [p(0, 0), p(0, -2), p(0, -1), p(-1, 0)]
				case 15: return [p(0, 0), p(0, -1), p(1, 0), p(2, 0)]
				case 16: return [p(0, 0), p(-1, 0), p(0, 1), p(0, 2)]
				case 17: return [p(0, 0), p(0, -1), p(-2, 0), p(-1, 0)]
				case 18: return [p(0, 0), p(0, -2), p(0, -1), p(1, 0)]
				case 19: return [p(0, 0), p(1, 0), p(2, 0), p(0, 1)]
				// Фигура при наступлении конца игры
				// case 20: return [p(0, 4), p(2, 2), p(1, 1), p(0, 2), p(0, 3), p(0, 5), p(1, 6), p(2, 5), p(2, 4), p(1, 4), p(5, 6), p(5, 5), p(5, 4), p(5, 3), p(5, 2), p(4, 1), p(3, 2), p(3, 3), p(3, 4), p(3, 5), p(3, 6), p(4, 5)]
			}

			// if (block.type === 1) {
			// 	// return [
			// 	// 	{ x: block.x, y: block.y },
			// 	// 	{ x: block.x + 1, y: block.y },
			// 	// 	{ x: block.x, y: block.y + 1 },
			// 	// 	{ x: block.x + 1, y: block.y + 1 },
			// 	// ]
			// 	return [p(0, 0), p(1, 0), p(0, 1), p(1, 1)]
			// }

			// if (block.type === 2) {
			// 	return [p(0, 0), p(-1, 0), p(0, -1), p(1, 0)]
			// }

			// if (block.type === 3) {
			// 	return [p(0, 0), p(-1, 0), p(0, 1), p(1, 0)]
			// }

			// if (block.type === 4) {
			// 	return [p(0, 0), p(0, -1), p(1, 0), p(0, 1)]
			// }

			// if (block.type === 5) {
			// 	return [p(0, 0), p(0, -1), p(-1, 0), p(0, 1)]
			// }

			// if (block.type === 6) {
			// 	return [p(0, 0), p(-1, 1), p(0, 1), p(1, 0)]
			// }

			// if (block.type === 7) {
			// 	return [p(0, 0), p(-1, 0), p(0, 1), p(1, 1)]
			// }

			// if (block.type === 8) {
			// 	return [p(0, 0), p(-1, -1), p(-1, 0), p(0, 1)]
			// }

			// if (block.type === 9) {
			// 	return [p(0, 0), p(0, -1), p(-1, 0), p(-1, 1)]
			// }

			// if (block.type === 10) {
			// 	return [p(0, 0), p(-1, 0), p(1, 0), p(2, 0)]
			// }

			// if (block.type === 11) {
			// 	return [p(0, 0), p(0, -1), p(0, 1), p(0, 2)]
			// }

			// if (block.type === 12) {
			// 	return [p(0, 0), p(1, 0), p(0, 1), p(0, 2)]
			// }

			// if (block.type === 13) {
			// 	return [p(0, 0), p(-2, 0), p(-1, 0), p(0, 1)]
			// }

			// if (block.type === 14) {
			// 	return [p(0, 0), p(0, -2), p(0, -1), p(-1, 0)]
			// }

			// if (block.type === 15) {
			// 	return [p(0, 0), p(0, -1), p(1, 0), p(2, 0)]
			// }

			// if (block.type === 16) {
			// 	return [p(0, 0), p(-1, 0), p(0, 1), p(0, 2)]
			// }

			// if (block.type === 17) {
			// 	return [p(0, 0), p(0, -1), p(-2, 0), p(-1, 0)]
			// }

			// if (block.type === 18) {
			// 	return [p(0, 0), p(0, -2), p(0, -1), p(1, 0)]
			// }

			// if (block.type === 19) {
			// 	return [p(0, 0), p(1, 0), p(2, 0), p(0, 1)]
			// }
		}

		block.getNextBlock = function () {
			// p - лямбда-функция
			const p = n => getBlock(n, block.color, block.x, block.y)
	// переписать с помощью switch
			switch (block.type) {
				case 1: return p(1)
				case 2: return p(4)
				case 3: return p(5)
				case 4: return p(3)
				case 5: return p(2)
				case 6: return p(8)
				case 7: return p(9)
				case 8: return p(6)
				case 9: return p(7)
				case 10: return p(11)
				case 11: return p(10)
				case 12: return p(13)
				case 13: return p(14)
				case 14: return p(15)
				case 15: return p(12)
				case 16: return p(17)
				case 17: return p(18)
				case 18: return p(19)
				case 19: return p(16)
			}
			// if (block.type === 1) {
			// 	// return getBlock(1, block.color, block.x, block.y)
			// 	return p(1)
			// }
		}

		block.getCopy = function () {
			return getBlock(block.type, block.color, block.x, block.y)
		}

		return block
	}

	// функция canBlockExists() принимает в качестве аргумента локальный блок
	function canBlockExists (block) {
		// запрашиваем все ячейки этого блока
		const parts = block.getIncludedParts()

		// здесь спрашиваем у ячейки блока, свободна она или занята
		for (const part of parts) {
			if (getField(part.x, part.y)) {
				return false
			}
		}

		return true
	}

	// функция getField() пытается взять ячейку уже существующего тетриса из объекта map
	function getField (x, y) {
		// если ячейка с координатами x, y не существует в массиве map, то функция возвратит 'black' - как будто там уже есть ячейка, занятая черным цветом
		if (map[y] === undefined || map[y][x] === undefined) {
			return 'black'
		}

		// если не ушли за границы карты, функция возвратит содержимое ячейки
		// если ячейка пустая - мы ожидаем null
		// если не пустая - ее цвет
		return map[y][x]
	}

	// функция setField() вставит значение value в map с координатами x, y (запишем элемент матрицы)
	function setField (x, y, value) {
		// если ячейка с координатами x, y не существует в массиве map
		if (map[y] === undefined || map[y][x] === undefined) {
			return
		}

		return map[y][x] = value
	}

	function moveBlockLeft () {
		const blockCopy = block.getCopy()
		
		blockCopy.x = blockCopy.x - 1

		if (canBlockExists(blockCopy)) {
			block = blockCopy
		}
	}

	function moveBlockRight () {
		const blockCopy = block.getCopy()

		blockCopy.x = blockCopy.x + 1

		if (canBlockExists(blockCopy)) {
			block = blockCopy
		}
	}

	function rotateBlock () {
		const blockCopy = block.getNextBlock()

		if (canBlockExists(blockCopy)) {
			block = blockCopy
		}
	}

	function moveBlockDown () {
		const blockCopy = block.getCopy()

		blockCopy.y = blockCopy.y + 1

		if (canBlockExists(blockCopy)) {
			block = blockCopy
		}
	}

	// подписаться на событие 'keydown' для body
	// document.body.addEventListener('keydown', function (event) {
	// 	console.log(event)

		// if (event.code === 'KeyA') {
		// 	const blockCopy = block.getCopy()
			
		// 	blockCopy.x = blockCopy.x - 1

		// 	if (canBlockExists(blockCopy)) {
		// 		block = blockCopy
		// 	}
		// }

		// if (event.code === 'KeyD') {
		// 	const blockCopy = block.getCopy()
			
		// 	blockCopy.x = blockCopy.x + 1

		// 	if (canBlockExists(blockCopy)) {
		// 		block = blockCopy
		// 	}
		// }

		// if (event.code === 'KeyW') {
		// 	const blockCopy = block.getNextBlock()
			
		// 	if (canBlockExists(blockCopy)) {
		// 		block = blockCopy
		// 	}
		// }

		// if (event.code === 'KeyS') {
		// 	const blockCopy = block.getCopy()
			
		// 	blockCopy.y = blockCopy.y + 1

		// 	if (canBlockExists(blockCopy)) {
		// 		block = blockCopy
		// 	}
		// }
	// })

}

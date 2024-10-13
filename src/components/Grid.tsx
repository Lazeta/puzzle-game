import React, { useState } from "react";
import { state } from "../const/state";

// типизация
interface Block {
  id: number;
  position: { x: number; y: number };
  size: { width: number; height: number }; // опциональные размеры
}

// функциональная компонента нашей сетки
export const Grid: React.FC = () => {
  // хранит состояние блоков. blocks: массив блоков, которые добавляются в сетку.
  const [blocks, setBlocks] = useState<Block[]>([]);
  // хранит id выбранного блока для перемещения. Изначально null.
  const [selectedBlock, setSelectedBlock] = useState<number | null>(null);
  // состояние, указывающее, происходит ли перетаскивание блока
  const [isDragging, setIsDragging] = useState(false);
  // состояние для хранения смещения курсора при перетаскивании блока
  const [dragOffset, setDragOffset] = useState<{ x: number; y:number } | null>(null);
  // состояние для хранения блока призрака 
  const [ghostPosition, setGhostPosition] = useState<{ x:number; y:number } | null>(null);


  // обработчик клика по ячейке: обновляет позицию выбранного блока при клике на ячейку
  const handleCellClick = (x: number, y: number) => {
    if (selectedBlock !== null) {
      const newBlocks = blocks.map((block) => 
        block.id === selectedBlock
          ? { ...block, position: { x, y } } // обновляет позицию блока
          : block
      );
      setBlocks(newBlocks); // обновляет состояние блоков
      setSelectedBlock(null); // сбрасывает выбранный блок
      setGhostPosition(null); // Сбрасываем положение призрака
    }
  }

  // функция для добавления нового блока на поле: создает новый блок и обновляет массив блоков
  const addBlock = () => {
    const newBlock: Block = { 
      id: blocks.length + 1, // уникальный идентификатор
      position: { 
        x: state.blockMain.x, // 0 - первая ячейка по оси x
        y: state.blockMain.y, // 2 - третья ячейка по оси у (индекс 2 соответствует третьей ячейке)
      }, 
      // при создании нового блока мы задаём так же размеры из базы данных
      size: {
        width: state.blockMain.width, // ширина блока (количество ячеек)
        height: state.blockMain.height, // высота блока (количество ячеек)
      }
    };
    setBlocks([...blocks, newBlock]); // обновляет состояние блоков
  };

  // обработчик начала перетаскивания: устанавливает состояние перетаскивания и фиксирует смещение курсора
  const handleMouseDown = (id: number, event: React.MouseEvent) => {
    event.stopPropagation(); 
    setSelectedBlock(id); // устанавливает выбранный блок
    setIsDragging(true); // устанавливает состояние перетаскивания
    const target = event.currentTarget.getBoundingClientRect(); // получает размеры блока
    setDragOffset({
      x: event.clientX - target.left, // вычисляет смещение по оси х
      y: event.clientY - target.top,  // вычисляет смещение по оси у
    });
  };

  // обработчик перемещения мыши: обновляет позицию блока в зависимости от положения курсора
  const handleMouseMove = (event: MouseEvent) => {
    if (isDragging && selectedBlock !== null && dragOffset) {
      const newX = Math.floor((event.clientX - dragOffset.x) / 50); // вычисляет новую позицию по оси х
      const newY = Math.floor((event.clientY - dragOffset.y) / 50); // вычисляет новую позицию по оси у
      setGhostPosition({ x: newX, y: newY }); // обновляем позицию призрака
    }
  };

  // обработчик окончания перетаскивания: сбрасывает состояние перетаскивания 
  const handleMouseUp = () => {
    if (ghostPosition && selectedBlock !== null) {
      setBlocks((prevBlocks) => 
        prevBlocks.map((block) => 
          block.id === selectedBlock
            ? { ...block, position: ghostPosition } // перемещаем блок в новую позицию
            : block
        )
      );
    }
    setIsDragging(false); // сбрасывает состояние перетаскивания
    setDragOffset(null); // сбрасывает смещение курсора
    setGhostPosition(null); // сбрасываем положение призрака
  };

  // добавляем обработчики событий на уровне окна для перемещения и отпускания мыши
  React.useEffect(() => {
    window.addEventListener("mousemove", handleMouseMove); // отслеживает перемещение мыши
    window.addEventListener("mouseup", handleMouseUp); // отслеживает отпускание кнопки мыши
    return () => {
      window.removeEventListener("mousemove", handleMouseMove); // удаляет обработчик при размонтировании
      window.removeEventListener("mouseup", handleMouseUp); // удаляет обработчик при размонтировании
    };
  }, [isDragging, selectedBlock, dragOffset]);

  // обработчик клика по блоку: устанавливает его ID как выбранный и предотвращает событие клика на ячейке
  // используем эту функцию если хотим взаимодействовать с блоком по клику
  const handleBlockClick = (id: number, event: React.MouseEvent) => {
    event.stopPropagation(); // предотвращает срабатывание события клика на ячейке
    setSelectedBlock(id); // устанавливает выбранный блок
  };


  // JSX разметка
  return (
    <div 
      style={{
        padding: 2,
        overflow: "hidden",
      }}
    >
      {/* Кнопка "Добавить блок": При нажатии вызывает функцию addBlock. */}
      <button onClick={addBlock} style={{ marginBottom: "10px" }}>Добавить блок</button>
      {/* Сетка: Создается с помощью CSS Grid, размер ячеек 50px. Отображает ячейки в зависимости от gridSize из state. */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: `repeat(${state.gridSize}, 50px)`,
          gridTemplateRows: `repeat(${state.gridSize}, 50px)`,
          position: "relative", // добавлено для корректного позиционирования блоков
        }}
      >
        {/* Отображение блоков: Внутри каждой ячейки проверяется, есть ли блок на 
        данной позиции, и если да, то он отображается. */}
        {Array.from({ length: state.gridSize * state.gridSize }, (_, index) => {
          const x = index % state.gridSize;
          const y = Math.floor(index / state.gridSize);
          return (
            <div
              key={index}
              style={{
                border: "1px solid #9c9999",
                width: "50px",
                height: "50px",
                position: "relative",
                backgroundColor: "#303738",
              }}
              onClick={() => handleCellClick(x, y)}
            >
              {blocks.map((block) => {
                const { x, y } = block.position;
                // Это условие проверяет, находится ли текущая ячейка в области, которую занимает блок.
                if (
                  x <= index % state.gridSize &&
                  x + block.size.width > index % state.gridSize &&
                  y <= Math.floor(index / state.gridSize) && 
                  y + block.size.height > Math.floor(index / state.gridSize)
                ) {
                  return (
                    // тут нашему блоку задаються стили и вешаем обработчик клика по блоку
                    <div
                      key={block.id}
                      onMouseDown={(event) => handleMouseDown(block.id, event)} // обработчик начала перетаскивания
                      // onClick={(event) => handleBlockClick(block.id, event)}
                      style={{
                        backgroundColor: "yellow",
                        cursor: "pointer",
                        opacity: "0.8",
                        padding: "5px",
                        gridColumnStart: block.position.x + 1,
                        gridRowStart: block.position.y + 1,
                        gridColumnEnd: block.position.x + block.size.width + 1,
                        gridRowEnd: block.position.y + block.size.height + 1,
                      }}
                    >
                      {block.id}
                    </div>
                  );
                }
                return null;
              })}
            </div>
          );
        })}
        {/* Отображение призрака блока, если он перетаскивается */}
        {isDragging && ghostPosition && (
          <div
            style={{
              position: "absolute",
              backgroundColor: "rgba(255, 255, 0, 0.5)", // полупрозрачный цвет для призрака
              cursor: "pointer",
              opacity: "0.8",
              padding: "5px",
              gridColumnStart: ghostPosition.x + 1,
              gridRowStart: ghostPosition.y + 1,
              gridColumnEnd: ghostPosition.x + 1 + state.blockMain.width,
              gridRowEnd: ghostPosition.y + 1 + state.blockMain.height,
            }}
          >
            Призрак {selectedBlock}
          </div>
        )}
      </div>
    </div>
  );
};

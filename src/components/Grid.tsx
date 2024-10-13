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
  // 
  const [isDragging, setIsDragging] = useState(false);
  // 
  const [dragOffset, setDragOffset] = useState<{ x: number; y:number } | null>(null)


  // обработчик клика по ячейке. При клике на ячейку, если выбран блок, обновляет его позицию на новую, заданную координатами х и у.
  // После этого сбрасывает selectedBlock в null.
  const handleCellClick = (x: number, y: number) => {
    if (selectedBlock !== null) {
      const newBlocks = blocks.map((block) => 
        block.id === selectedBlock
          ? { ...block, position: { x, y } }
          : block
      );
      setBlocks(newBlocks);
      setSelectedBlock(null);
    }
  }

  // обработчик клика по блоку. При клике на блок устанавливает его id как selectedBlock. 
  // Использует event.stopPropagation(), чтобы предотвратить срабатывание события клика на ячейке.
  const handleBlockClick = (id: number, event: React.MouseEvent) => {
    event.stopPropagation();
    setSelectedBlock(id);
  };

  // добавление блока (на поле). Создает новый блок с уникальным id и начальной позицией из state.blockMain. 
  // Обновляет массив блоков и устанавливает его начальную позицию в blockPosition.
  const addBlock = () => {
    const newBlock: Block = { 
      id: blocks.length + 1, 
      position: { 
        x: state.blockMain.x, // 0 - первая ячейка по оси x
        y: state.blockMain.y, // 2 - третья ячейка по оси у (индекс 2 соответствует третьей ячейке)
      }, 
      // при создании нового блока мы задаём так же размеры из базы данных
      size: {
        width: state.blockMain.width, // 2
        height: state.blockMain.height, // 1
      }
    };
    setBlocks([...blocks, newBlock]);
  };

  // 
  const handleMouseDown = (id: number, event: React.MouseEvent) => {
    event.stopPropagation();
    setSelectedBlock(id);
    setIsDragging(true);
    const target = event.currentTarget.getBoundingClientRect();
    setDragOffset({
      x: event.clientX - target.left,
      y: event.clientY - target.top,
    });
  };

  // 
  const handleMouseMove = (event: MouseEvent) => {
    if (isDragging && selectedBlock !== null && dragOffset) {
      const newX = Math.floor((event.clientX - dragOffset.x) / 50);
      const newY = Math.floor((event.clientY - dragOffset.y) / 50);
      setBlocks((prevBlocks) => 
        prevBlocks.map((block) => 
          block.id === selectedBlock
            ? { ...block, position: { x: newX, y: newY } }
            : block
        )
      );
    }
  };

  // 
  const handleMouseUp = () => {
    setIsDragging(false);
    setDragOffset(null);
  };

  // добавляем обработчики событий на уровне окна
  React.useEffect(() => {
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDragging, selectedBlock, dragOffset]);

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
                      onClick={(event) => handleBlockClick(block.id, event)}
                      style={{
                        backgroundColor: "yellow",
                        cursor: "pointer",
                        opacity: "0.8",
                        padding: "5px",
                        gridColumnStart: block.position.x + 1,
                        gridRowStart: block.position.y + 1,
                        gridColumnEnd: block.position.x + block.size.width + 1,
                        gridRowEnd: block.position.y + block.size.height - 2,
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
      </div>
    </div>
  );
};

import React, { useState } from "react";
import { state } from "../const/state";

// типизация
interface Block {
  id: number;
  position: { x: number, y: number };
  size?: { width: number, height: number }; 
}

// функциональная компонента нашей сетки
export const Grid: React.FC = () => {
  // хранит состояние блоков. blocks: массив блоков, которые добавляются в сетку.
  const [blocks, setBlocks] = useState<Block[]>([]);
  // хранит id выбранного блока для перемещения. Изначально null.
  const [selectedBlock, setSelectedBlock] = useState<number | null>(null);
  // объект, в котором для каждого блока хранится его позиция в виде координат х и у.
  const [blockPosition, setBlockPosition] = useState<{
    [key: number]: { x: number; y: number };
  }>({});

  // обработчик клика по ячейке. При клике на ячейку, если выбран блок, обновляет его позицию на новую, заданную координатами х и у.
  // После этого сбрасывает selectedBlock в null.
  const handleCellClick = (x: number, y: number) => {
    if (selectedBlock !== null) {
      const newPosition = { ...blockPosition, [selectedBlock]: { x, y } };
      setBlockPosition(newPosition);
      // если не обнулить состояние setSelectedBlock то можно сохранить позицию одних блоков, переключиться на другой и перемещать его.
      setSelectedBlock(null);
    }
  };

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
    };
    setBlocks([...blocks, newBlock]);
    // старый метод когда мы задаем лишь первому блоку позицию зафиксированную, не из базы данных state.
    // setBlockPosition({ ...setBlockPosition, [newBlock.id]: { x: 0, y: 2 } });
    // При добавлении нового блока, его позиция устанавливается в 
    // blockPosition на основе его координат из newBlock.position.
    setBlockPosition({ 
      ...blockPosition, 
      [newBlock.id]: { 
        x: newBlock.position.x, 
        y: newBlock.position.y 
      } 
    })
  };

  // JSX разметка
  return (
    <div>
      {/* Кнопка "Добавить блок": При нажатии вызывает функцию addBlock. */}
      <button onClick={addBlock} style={{ marginBottom: "10px" }}>Добавить блок</button>
      {/* Сетка: Создается с помощью CSS Grid, размер ячеек 50px. Отображает ячейки в зависимости от gridSize из state. */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: `repeat(${state.gridSize}, 50px)`,
          gridTemplateRows: `repeat(${state.gridSize}, 50px)`,
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
                const position = blockPosition[block.id];
                if (position && position.x === x && position.y === y) {
                  return (
                    // тут нашему блоку задаються стили и вешаем обработчик клика по блоку
                    <div
                      key={block.id}
                      onClick={(event) => handleBlockClick(block.id, event)}
                      style={{
                        width: "50px",
                        height: "50px",
                        backgroundColor: "yellow",
                        position: "absolute",
                        top: 0,
                        left: 0,
                        opacity: "0.8",
                        cursor: "pointer",
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

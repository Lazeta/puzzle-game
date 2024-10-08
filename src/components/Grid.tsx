import React, { useState } from "react";
import { state } from "../const/state";

// типизация
interface Block {
  id: number;
  position: { x: number, y: number };
}

// функциональная компонента нашей сетки
export const Grid: React.FC = () => {
  // храним состояние блоков
  const [blocks, setBlocks] = useState<Block[]>([]);
  // храним состояние выбранного блока
  const [selectedBlock, setSelectedBlock] = useState<number | null>(null);
  // храним позицию блока
  const [blockPosition, setBlockPosition] = useState<{
    [key: number]: { x: number; y: number };
  }>({});

  // обработчик клика ячейки
  const handleCellClick = (x: number, y: number) => {
    if (selectedBlock !== null) {
      const newPosition = { ...blockPosition, [selectedBlock]: { x, y } };
      setBlockPosition(newPosition);
      setSelectedBlock(null);
    }
  };

  // обработчик клика по блоку
  const handleBlockClick = (id: number, event: React.MouseEvent) => {
    event.stopPropagation();
    setSelectedBlock(id);
  };

  // добавление блока (на поле)
  const addBlock = () => {
    const newBlock: Block = { id: blocks.length + 1, position: { x: state.blockMain.x, y: state.blockMain.y } };
    setBlocks([...blocks, newBlock]);
    setBlockPosition({ ...setBlockPosition, [newBlock.id]: { x: 0, y: 0 } });
  };

  return (
    <div>
      <button onClick={addBlock} style={{ marginBottom: "10px" }}>Добавить блок</button>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: `repeat(${state.gridSize}, 50px)`,
          gridTemplateRows: `repeat(${state.gridSize}, 50px)`,
        }}
      >
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

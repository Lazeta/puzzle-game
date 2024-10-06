import React, { useState } from "react";
import { state } from "../const/state";



interface Block {
  id: number;
}

export const Grid: React.FC = () => {
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [selectedBlock, setSelectedBlock] = useState<number | null>(null);
  const [blockPosition, setBlockPosition] = useState<{
    [key: number]: { x: number; y: number };
  }>({});

  const handleCellClick = (x: number, y: number) => {
    if (selectedBlock !== null) {
        const newPosition = {...blockPosition, [selectedBlock]: {x, y} };
        setBlockPosition(newPosition);
        setSelectedBlock(null);
    }
  };

  const handleBlockClick = (id: number, event: React.MouseEvent) => {
    event.stopPropagation();
    setSelectedBlock(id);
  };

  const addBlock = () => {
    const newBlock: Block = { id: blocks.length + 1 };
    setBlocks([...blocks, newBlock]);
    setBlockPosition({ ...setBlockPosition, [newBlock.id]: { x: 0, y: 0 } });
  };


  return (
    <div>
      <button onClick={addBlock}>Добавить блок</button>
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
                border: "1px solid #ccc",
                width: "50px",
                height: "50px",
                position: "relative",
                backgroundColor: "white",
              }}
              onClick={() => handleCellClick(x, y)}
            >
              {blocks.map((block) => {
                const position = blockPosition[block.id];
                if (position && position.x === x && position.y === y) {
                  return (
                    <div
                      key={block.id}
                      onClick={(event) => handleBlockClick(block.id, event)}
                      style={{
                        width: "50px",
                        height: "50px",
                        backgroundColor: "lightblue",
                        position: "absolute",
                        top: 0,
                        left: 0,
                        cursor: "pointer",
                      }}
                    >
                      Блок {block.id}
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

return (
  <DragDropContext onDragEnd={onDragEnd}>
    <div className="App">
      <div className="container">

        <Droppable droppableId="TodosList">
          {(provided, snapshot) => (
            <div className="xxxxx" ref={provided.innerRef} {...provided.droppableProps}>
              <span>Active Tasks</span>
              {todos?.map((todo, index) => (
                
                <Draggable draggableId={todo.id.toString()} index={index}>
                  {(provided, snapshot) => (
                    <form {...provided.draggableProps} {...provided.dragHandleProps} ref={provided.innerRef}>
                      <span>{todo.todo}</span>
                    </form>
                  )}
                </Draggable>

              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>

        <Droppable droppableId="TodosRemove">
            <<<same as above>>>
        </Droppable>

      </div>
    </div>
  </DragDropContext>
);
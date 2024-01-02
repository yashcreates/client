import React, { useState, useEffect, useCallback } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
//import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSquareMinus } from '@fortawesome/free-regular-svg-icons';

import { faEraser,faCheck ,faPencil} from '@fortawesome/free-solid-svg-icons';
function useForceUpdate() {
  const [, setTick] = useState(0);
  const update = useCallback(() => {
    setTick((tick) => tick + 1);
  }, []);
  return update;
}

export default function Cards(props) {
  const [showModal, setShowModal] = useState(false);
  const [tasks, setTasks] = useState(null);
  const [tasktodos, setTaskTodos] = useState([]);
  const [addbtn, setaddbtn] = useState(true);
  const [info, setinfo] = useState({ title: "", description: "", date: "" });
  const [showForm, setShowForm] = useState(false);
  const [worktype, setWorktype] = useState('');
  const [selectedTimePeriod,setselectedTimePeriod]=useState("all");
  const [ Worktypeid, setWorktypeid]=useState();
  const [up,setup]=useState(false);
  const [img,setimg]=useState();
  const [hoveredTask, setHoveredTask] = useState(false);
  const [muid, setmuid] = useState();
  const [mutate,setmutate]=useState(false)
  const [file, setFile] = useState(null);
  const [id,setid]=useState()
  let uniquewworktypes = new Set();
  const forceUpdate = useForceUpdate();

  const fetchTodos = async () => {
    
    try {
      
      const response = await fetch(`/graphql`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          query: `
            query {
              todos {
                success
                errors
                todos {
                  id
                  description
                  completed
                  dueDate
                  image
                  user {
                    id
                    name
                    premium
                  }
                  worktype {
                    id
                    name
                  }
                }
              }
            }
          `,
        }),
      });

      const res = await response.json();
      console.log("yu",props.userId)
      const userTodos = res.data.todos.todos.filter((todo) => todo.user.id ===props.userId);
      console.log("uuuu",userTodos)
      setTaskTodos(userTodos)
     

      uniquewworktypes=new Set() 
      
      console.log(uniquewworktypes)
      console.log("settodo",tasktodos)
      console.log(res.data.todos.todos);
      uniquewworktypes=new Set() 
     
     
      console.log("tme",selectedTimePeriod)
     console.log("wniquee",props.works);
    
  
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
  
      fetchTodos();
    
  },[props.userId]);
  

 
const handleDeleteTask = async (taskId) => {
  console.log("tid",taskId);
  try {
    const response = await fetch(`/graphql`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        query: `
          mutation del{
            deleteTodo(todoId: "${taskId}") {
              success
              errors
            }
          }
        `,
      }),
    });

    const result = await response.json();
    console.log(result)
    if(result.data.deleteTodo.success){
      window.alert("Deleted successfully!")
      const tt=tasktodos.filter((todo) => todo.id !== taskId)
      console.log(tt);
      setTaskTodos(tt);}
   else{
    window.alert("Erroe at deleting!")
    }
   
  } catch (error) {
    console.error("Error deleting task:", error);
  }
};

const handleCompleteTask = async (taskId) => {

  try {
    const response = await fetch(`/graphql`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        query: `
          mutation {
            markDone(todoId: "${taskId}") {
              success
              errors
            }
          }
        `,
      }),
    });

    const result = await response.json();
    const tt = tasktodos.filter((todo) => todo.id === taskId)[0];
    if (tt) {
      // Update the completed property of the task
      if(tt.completed ==1){
        tt.completed=0;
      }
      else{
        tt.completed=1;
      }
    
      // Create a new array with the updated task
      const updatedTasktodos = tasktodos.map((todo) =>
        todo.id === taskId ? tt : todo
      );
    
      // Update the state with the new array
      setTaskTodos(updatedTasktodos);
      
      console.log(result);
      if(tt.completed==1){
        window.alert("Congrats!! for compeleting your todo")
      }
    } else {
      console.error("Task not found");
    }

  } catch (error) {
    console.error("Error marking task as done:", error);
  }
};


const handleDeletework = async (workId,event) => {
  event.stopPropagation();
  console.log("tid",workId);
  try {
    const response = await fetch(`/graphql`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        query: `
        mutation{
          deleteWorks(workId:${workId}){
            success
            errors
          
          }
        }
        `,
      }),
    });

    const result = await response.json();
    if(result.data.deleteWorks.success){
      window.alert("Deleted successfully!!!")
    console.log(result)
    const tt=props.works.filter((todo) => todo.id !== workId)
    props.setwork(tt)
    console.log(tasktodos)
    const tt1=tasktodos.filter((todo) => todo.worktype?.id !== workId)
    console.log(tt1);
    setTaskTodos(tt1);}else{
      window.alert("Error at deleting plz try again")
    }
    
  } catch (error) {
    console.error("Error deleting task:", error);
    window.alert("Error at adding task.Try again")
  }
};



const handleAddTodo = async (e) => {
  e.stopPropagation();
  console.log("added",tasks)
  try {
    const response = await fetch(`/graphql`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        query: `
          mutation {
            createTodo(
              description: "${info.description}"
              workname:"${tasks}"
              dueDate:"${info.date}"
              userId: "${props.userId}" 
            ) {
              success
              errors
              todo {
                id
                description
                dueDate
                completed
                image
                user{
                  id
                  name
                  premium
                }
                worktype{
                  id
                  name
                }
                
              }
            }
          }
        `,
      }),
    });

    const result = await response.json();
    console.log(result)
    if(result.data.createTodo.success){
 // Assuming `tasktodos` is an array
    window.alert("Added task successfully!!")
    const tt = [...tasktodos].concat(result.data.createTodo.todo);
    // Alternatively, you can use the spread operator:
    // const tt = [...tasktodos, result.data.createTodo.todo];

    setTaskTodos(tt);
   
    setaddbtn(true)}
    else{
      window.alert("Error at adding task.Try again")
    }
   
  } catch (error) {
    console.error("Error adding task:", error);
    window.alert("Error at adding task.Try again")
  }
}

const handleAddWorktype = async (e) => {
 e.stopPropagation()
  console.log("added",tasks)
  try {
    const response = await fetch(`/graphql`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        query: `
        mutation lt{
          createWorks(name:"${worktype}",userId:"${props.userId}"){
            success
            errors
            work{
              id
              name
            }
          }
        }
        `,
      }),
    });

    const result = await response.json();
    console.log(result)
    if (result.data.createWorks.success) {
      window.alert("Work added successfully!");

    const tt = [...props.works].concat(result.data.createWorks.work);
    console.log("l",tt)
   
    console.log("adeddddddddddd",result.data.createWorks.success)
    props.setwork(tt)
    setShowForm(false)
    setselectedTimePeriod("all")
    console.log(showForm)}
    else if (result.data.createWorks.work !== null) {
      // Show alert for non-existing work
      alert("Work already exists!");
    }
    else {
      // Handle case where work addition was not successful
      window.alert("Error adding work: " + result.data.createWorks.errors.join(", "));
    }
    
  } catch (error) {
    console.error("Error adding task:", error);
  

  }

};

const handleFigureClick = (todo, e) => {
  e.stopPropagation();
  console.log("clicked");
  setShowModal(true);
  setTasks(todo);
}

  const handleCloseModal = () => {
    setShowModal(false);
  };

  const handleaddbtn=(e) => {
    e.stopPropagation()
    setaddbtn(false);
    setinfo({ title: "", description: "" });
  }

const handleid=(id,imgg,e)=>{
  e.stopPropagation()
  setimg(imgg)
  setid(id)
  setup(true)
}


  const isToday=(date)=> {
    const today = new Date();

    const [day, month, year] = date.split("-").map(Number);
    date = new Date(year, month - 1, day);

   
    console.log("to",date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear())
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  }
  
  const isThisWeek = (date) => {
    const today = new Date();
    const [day, month, year] = date.split("-").map(Number);
    date = new Date(year, month - 1, day);
  
    // Calculate the start and end of the current week
    const currentWeekStart = new Date(today.setDate(today.getDate() - today.getDay()));
    const currentWeekEnd = new Date(today.setDate(today.getDate() - today.getDay() + 6));
  
    // Check if the date falls within the current week range
    return date >= currentWeekStart && date <= currentWeekEnd;
  };
  
const isThisMonth=(date)=>{
  const today = new Date();

  const [day, month, year] = date.split("-").map(Number);
  date = new Date(year, month - 1, day);
  console.log("mm",date.getMonth() === today.getMonth() && date.getFullYear() === today.getFullYear())
  return date.getMonth() === today.getMonth() && date.getFullYear() === today.getFullYear();
}

const handleTimePeriodChange = (timePeriod,e) => {
  e.stopPropagation()
  console.log("seeet",uniquewworktypes)
  uniquewworktypes=new Set();
  console.log("seeet2",uniquewworktypes)
  setselectedTimePeriod(timePeriod);
  console.log(timePeriod);
};
const handleFileChange = (e) => {
  setFile(e.target.files[0]);
};

const submit=async (e) => {
  e.stopPropagation()
  setup(false)
  console.log(file)
  console.log("added",tasks)
  const formData = new FormData();
 // Assuming you have an input element with id 'fileInput'
  formData.append('files[]', file);
  formData.append('todoId', id);
  try {
    const response = await fetch('/upload', {
      method: 'POST',
      body: formData,
    });

    if (response.ok) {
      const result = await response.json();
      console.log(result); // Log success message
      let tt = tasktodos.filter((todo) => todo.id === id);
      let t1 = tasktodos.filter((todo) => todo.id !== id);
      tt[0].image= result.imag; // Assuming tt is an array with one element
      tt = [...t1, ...tt]; // Combine the arrays
      setTaskTodos(tt)
      console.log("addedimagett",tt)
    } else {
      console.error('Upload failed');
    }
  } catch (error) {
    console.error('Error during upload:', error);
  }
};




const handleMouseEnter = (taskId) => {
  setHoveredTask(taskId);
};

const handleMouseLeave = () => {
  setHoveredTask(null);
};
const mutateTask=(tid,e)=>{
  e.stopPropagation()
  setmuid(tid)
  const tt=tasktodos.filter((todo)=>todo.id===tid)
  console.log("tobe",tt[0])
  setinfo({title:"",description:tasktodos.filter((todo)=>todo.id===tid)[0].description,date:tasktodos.filter((todo)=>todo.id===tid)[0].dueDate})
  setmutate(true)
  setaddbtn(false)

}
const handlemutateTodo=async(e)=>{
  e.stopPropagation()
  
  try {
    const response = await fetch(`/graphql`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        query: `
        mutation {
          updateTodo(
            todoId:"${muid}",
            description: "${info.description}",
            dueDate:"${info.date}"
           
          ) {
            success
            errors
            todo {
              id
              description
              dueDate
              user {
                id
                name
        
              }
              worktype {
                id
                name
        
              }
            }
          }
        }
        
        `,
      }),
    });

    const result = await response.json();
    console.log("updatedup",result)
    if(result.data.updateTodo.success){
      window.alert("Updated Successfully!!")
    let tt = tasktodos.filter((todo) => todo.id === muid);
    let t1 = tasktodos.filter((todo) => todo.id !== muid);
    tt[0]= result.data.updateTodo.todo; // Assuming tt is an array with one element
    tt = [...t1, ...tt]; // Combine the arrays
    setTaskTodos(tt)
    setmuid("")
    setmutate(false)
    setaddbtn(true)}
    else{
      window.alert("Error at making changes.Try again")
    }
 
    
  } catch (error) {
    console.error("Error adding task:", error);
    window.alert("Error at making changes.Try again")
  

  }

};

const handlemutateWorktype = async (e) => {
  e.stopPropagation()
   try {
     const response = await fetch(`/graphql`, {
       method: "POST",
       headers: {
         "Content-Type": "application/json",
       },
       body: JSON.stringify({
         query: `
         mutation {
          updateWork(
            workId:${Worktypeid},
            name:"${worktype}" ,
            userId:"${props.userId}"  
        
          ) {
            success
            errors
            
            work{
              id
              name
            }
          }
        }
        
         `,
       }),
     });
 
     const result = await response.json();
     console.log(result)
     if(result.data.updateWork.success){
      window.alert("Work Type changed successfully!");
     let tt = tasktodos.filter((todo) => todo.worktype?.id === Worktypeid);
     let t1 = tasktodos.filter((todo) => todo.worktype?.id !== Worktypeid);
     console.log("before", tt);
     
     // Check if tt is not empty before attempting to update
     if (tt.length > 0) {
       // Use map to iterate over elements in tt and update worktype
       tt = tt.map((todo) => {
         return {
           ...todo,
           worktype: result.data.updateWork.work,
         };
       });
     }
     
     // Combine t1 and updated tt
     let updatedTaskTodos = [...t1, ...tt];
     console.log("after", updatedTaskTodos);
     
     // Set the updated array back to state using setTaskTodos
     setTaskTodos(updatedTaskTodos);
     console.log("l",tt)
     let tt2 = props.works.filter((todo) => todo?.id === Worktypeid);
     let tt3 = props.works.filter((todo) => todo?.id !== Worktypeid);
     tt2[0]=result.data.updateWork.work;
     tt2=[...tt3,...tt2];
     props.setwork(tt2)
     setWorktype()
     setWorktypeid()
     setShowForm(false)
     console.log(showForm)}
     else if(result.data.updateWork.work !== null){
      window.alert("Work Type already exists!");
    
     }
     else{
      window.alert("Error in changing try again!");
     }
     
   } catch (error) {
     console.error("Error adding task:", error);
   
 
   }
 
 };

const closingbtn=(e)=>{
  e.stopPropagation()
  setmutate(false)
  setaddbtn(true)

}

const submitclosingform=(e)=>{
  e.stopPropagation()
  setShowForm(false)
  setWorktype()
  setWorktypeid()

}

const mutatework=(workid,workname,e)=>{
  e.stopPropagation()
  setWorktype(workname)
  setWorktypeid(workid)

  setShowForm(true)

}
 
  return (
    <div>
      <div className="main-content">
        <h1>Your tasks {showModal}</h1>
        <h3>{selectedTimePeriod}</h3>
        <h2 id="currentDate"></h2>
        <div className="options">
        <div className="options">
        <div className="option">
          <button onClick={(e) => handleTimePeriodChange('today',e)}>Today</button>
        </div>
        <div className="option">
          <button onClick={(e) => handleTimePeriodChange('week',e)}>Week</button>
        </div>
        <div className="option">
          <button onClick={(e) => handleTimePeriodChange('month',e)}>Month</button>
        </div>
        <div className="option">
          <button onClick={(e) => handleTimePeriodChange('all',e)}>All</button>
        </div>
      </div>
        </div>
        <div className="cards">
        {selectedTimePeriod === 'all'
          ? // Display all unique worktypes
          props.works.map((worktype, index) => (
            <figure key={index} onClick={(e) => handleFigureClick(worktype.name,e)}>
              <h2>{worktype.name}</h2>
              <div className="img"></div>
              <figcaption>
              
                
                <button className="delete-button" onClick={(event) => handleDeletework(worktype.id,event)}>
                <FontAwesomeIcon icon={faSquareMinus} size='2x' style={{color:"white"}}/>
                </button>
                <button className="delete-button muu" onClick={(e) =>mutatework(worktype.id,worktype.name,e)}>
                  <FontAwesomeIcon icon={faPencil} size='2x' style={{color:'white'}}/>
                  </button>
              </figcaption>
            </figure>
          ))
          
          : // Display todos based on the selected time period and worktype
         
          Array.from(tasktodos
              .filter((todo) => {
                if (selectedTimePeriod === 'today') {
                  return isToday(todo.dueDate);
                } else if (selectedTimePeriod === 'week') {
                  return isThisWeek(todo.dueDate);
                } else if (selectedTimePeriod === 'month') {
                  return isThisMonth(todo.dueDate);
                } else {
                  return true; // 'all'
                }
              })).filter((worktype) => {
              
                if (worktype.worktype && worktype.worktype.id &&!uniquewworktypes.has(worktype.worktype.name)) {
                 
                  uniquewworktypes.add(worktype.worktype.name);
                 
                  return true;
                }
                
                return false;
              }).map((todos, index) => (
                <figure key={index} onClick={(e) => handleFigureClick(todos.worktype.name,e)}>
                  <div className="img"></div>
                  <figcaption>{todos.worktype.name}
                  <button className="delete-button" onClick={(e) => handleDeletework(todos.worktype.id,e)}>
                  <FontAwesomeIcon icon={faSquareMinus} size='2x' style={{color:"white"}}/></button>
                  <button className="delete-button muu" onClick={(e) =>mutatework(todos.worktype.id,todos.worktype.name,e)}>
                  <FontAwesomeIcon icon={faPencil} size='2x' style={{color:'white'}}/>
                  </button>
                  </figcaption>
                </figure>
              ))}
              <figure className="f1">
                <button onClick={() => setShowForm(true)}>Add Worktype
                  <div id="img2"></div>
                 
                </button>
              </figure>
            
      </div>


</div>

      {showForm && (
        <div className="modal">
          <div className="add-worktype-form">
            <label htmlFor="worktype">Work Type:</label>
            <input
              type="text"
              id="worktype"
              value={worktype}
              onChange={(e) => setWorktype(e.target.value)}
            />
            {Worktypeid?<button onClick={(e)=>{handlemutateWorktype(e)}}>change Worktype</button>:<button onClick={(e)=>{handleAddWorktype(e)}}>Add Worktype</button>}
            <button onClick={(e) =>submitclosingform(e)}>Close</button>
          </div>
        </div>
      )}
    

{showModal && (

  <div className="modal">
    {(tasks === null || addbtn )? (
      <div className="add-todo-button" onClick={handleaddbtn}>
        Add Todo
      </div>
    ) : (
      <>
           <div className="modal">
          <div className="add-worktype-form">
            <label htmlFor="worktype">Work Type:</label>
            <input
          type="text"
          placeholder="Task Title"
          value={info.title}
          onChange={(e) => setinfo({ ...info, title: e.target.value })}
        />
         <input
          type="text"
          placeholder="Task date"
          value={info.date}
          onChange={(e) => setinfo({ ...info, date: e.target.value })}
        />
        <textarea
          placeholder="Task Description"
          value={info.description}
          onChange={(e) => setinfo({ ...info, description: e.target.value })}
        />
        {mutate?<button onClick={(e) => handlemutateTodo(e)}>Change Todo</button> : <button onClick={(e) => handleAddTodo(e)}>Add Todo</button>}
          <button onClick={(e)=>{closingbtn(e)}}>Close</button>
          </div>
        </div>
      <div className="add-todo-form">
      
       
        
      </div>
      <div>
     
      </div>
      </>
    )}
    <button className="close-button" onClick={handleCloseModal}>
      &times;
    </button>
    
    {/* Your modal content goes here */}

    <div className='mc'>
    {tasktodos &&
  Array.from(tasktodos
   .filter((t) => t.worktype?.name === tasks)
      .filter((todo) => {
        if (selectedTimePeriod === 'today') {
          return isToday(todo.dueDate);
        } else if (selectedTimePeriod === 'week') {
          return isThisWeek(todo.dueDate);
        } else if (selectedTimePeriod === 'month') {
          return isThisMonth(todo.dueDate);
        } else {
          return true; // 'all'
        }
      }))
    .map((t, i) => (
      
      <div className={`modal-content ${t.completed ? 'completed' : 'incomplete'}`} key={i} onMouseEnter={() => handleMouseEnter(t.id)} onMouseLeave={handleMouseLeave}>
           
              {props.p ? (
        <div>
          <div className="circular-button pimg">
            <button onClick={(e) => { handleid(t.id, t.image, e) }} >
           
           {!t.completed&&<img src={"http://127.0.0.1:5000/uploads/"+t.image} id="img2" alt="Image" />}

            </button>
          </div>
        </div>
      ) : <div></div>}

      <p className='mcc'> {t.description}{t.id}</p>
      {hoveredTask !== t.id ?<div className='date'>{t.dueDate}</div>:
      <div className="delete-tick-container delete-tick-button hovered">
        <button className="delete-button muu" onClick={(e) =>mutateTask(t.id,e)}>
        <FontAwesomeIcon icon={faPencil} size='2x' />
        </button>
            
        <button className="delete-button" onClick={() => handleDeleteTask(t.id)}>
        <FontAwesomeIcon icon={faEraser} size="2x"/>
        </button>
        <button
          className={`tick-button ${t.completed ? 'completed' : 'incomplete'}`}
          onClick={() => handleCompleteTask(t.id)}
        >
          <FontAwesomeIcon icon={faCheck}size="2X" />
        </button>
      </div>}
      </div>
    ))}
            {up && (
        <div className="modal">
          <div className="add-worktype-form">
            <label htmlFor="worktype">Upload Image:</label>
            <img src={"http://127.0.0.1:5000/uploads/"+img}/>
              {img}
            <input type="file" accept="image/*" onChange={(e)=>{handleFileChange(e)}}/>
            <button type="submit" id="fileInput" onClick={(e)=>{submit(e)}}>Submit</button>
       
            <button onClick={() => setup(false)}>Close</button>
          </div>
        </div>
      )}

</div>





   
  </div>
 
)}


</div>
  );
}
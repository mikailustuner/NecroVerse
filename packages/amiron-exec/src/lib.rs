use wasm_bindgen::prelude::*;
use std::collections::HashMap;

#[wasm_bindgen]
#[derive(Clone, Copy, Debug, PartialEq, Eq, Hash)]
pub struct TaskId(u32);

#[wasm_bindgen]
#[derive(Clone, Copy, Debug, PartialEq)]
pub enum TaskState {
    Ready,
    Running,
    Waiting,
    Terminated,
}

#[wasm_bindgen]
pub struct Task {
    id: TaskId,
    priority: u8,
    state: TaskState,
}

#[wasm_bindgen]
pub struct Exec {
    tasks: HashMap<TaskId, Task>,
    next_id: u32,
    current_task: Option<TaskId>,
    message_queues: HashMap<TaskId, Vec<Vec<u8>>>,
}

#[wasm_bindgen]
impl Exec {
    #[wasm_bindgen(constructor)]
    pub fn new() -> Exec {
        Exec {
            tasks: HashMap::new(),
            next_id: 1,
            current_task: None,
            message_queues: HashMap::new(),
        }
    }
    
    pub fn create_task(&mut self, priority: u8) -> TaskId {
        let id = TaskId(self.next_id);
        self.next_id += 1;
        
        let task = Task {
            id,
            priority,
            state: TaskState::Ready,
        };
        
        self.tasks.insert(id, task);
        self.message_queues.insert(id, Vec::new());
        
        id
    }
    
    pub fn send_message(&mut self, to: TaskId, msg: Vec<u8>) -> bool {
        if let Some(queue) = self.message_queues.get_mut(&to) {
            queue.push(msg);
            true
        } else {
            false
        }
    }
    
    pub fn receive_message(&mut self, task: TaskId) -> Option<Vec<u8>> {
        self.message_queues
            .get_mut(&task)
            .and_then(|queue| {
                if queue.is_empty() {
                    None
                } else {
                    Some(queue.remove(0))
                }
            })
    }
    
    pub fn schedule(&mut self) -> Option<TaskId> {
        self.tasks
            .values()
            .filter(|t| t.state == TaskState::Ready)
            .max_by_key(|t| t.priority)
            .map(|t| t.id)
    }
    
    pub fn terminate_task(&mut self, id: TaskId) {
        if let Some(task) = self.tasks.get_mut(&id) {
            task.state = TaskState::Terminated;
        }
        self.message_queues.remove(&id);
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_create_task() {
        let mut exec = Exec::new();
        let task_id = exec.create_task(5);
        assert!(exec.tasks.contains_key(&task_id));
    }
}

export interface TaskJson {
    version: string;
    tasks: Array<Task>;
}
interface Task {
    label: string;
    command: string;
    type: string;
    args: Array<string>;
    problemMatcher: string;
    group: string;
}

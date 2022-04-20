export interface LaunchJson {
    version: string;
    configurations: Array<Configuration>;
}
interface Configuration {
    name: string;
    type: string;
    request: string;
    preLaunchTask: string;
    program: string;
    cwd: string;
    console: string;
}

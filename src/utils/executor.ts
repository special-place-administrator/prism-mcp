import { getQuickJS } from "quickjs-emscripten";

export interface SandboxResult {
    stdout: string;
    error?: string;
    executionTimeMs: number;
}

/**
 * Runs the given javascript `code` in a sandboxed QuickJS environment.
 * Injects a global variable `DATA` which contains the stringified payload.
 */
export async function runInSandbox(dataStr: string, code: string, timeoutMs: number = 10000): Promise<SandboxResult> {
    const QuickJS = await getQuickJS();

    // Set memory limit to 50MB (arbitrary safe limit for extraction)
    const vm = QuickJS.newContext();
    vm.runtime.setMemoryLimit(50 * 1024 * 1024);

    const startTime = Date.now();
    let stdout = "";

    try {
        // Inject console.log to capture stdout
        const logHandle = vm.newFunction("log", (...args) => {
            const parts = args.map((arg) => vm.getString(arg));
            stdout += parts.join(" ") + "\n";
        });

        const consoleHandle = vm.newObject();
        vm.setProp(consoleHandle, "log", logHandle);
        vm.setProp(vm.global, "console", consoleHandle);
        consoleHandle.dispose();
        logHandle.dispose();

        // Inject the raw API response string as "DATA"
        const dataHandle = vm.newString(dataStr);
        vm.setProp(vm.global, "DATA", dataHandle);
        dataHandle.dispose();

        // Set execution timeout via interrupt handler periodically
        vm.runtime.setInterruptHandler(() => {
            if (Date.now() - startTime > timeoutMs) {
                return true; // interrupt execution
            }
            return false;
        });

        const result = vm.evalCode(code);

        if (result.error) {
            const errorMsg = vm.dump(result.error);
            result.error.dispose();
            return {
                stdout,
                error: `Script Error: ${errorMsg}`,
                executionTimeMs: Date.now() - startTime
            };
        } else {
            result.value.dispose();
        }

        return {
            stdout,
            executionTimeMs: Date.now() - startTime
        };
    } catch (err: any) {
        return {
            stdout,
            error: `Runtime Exception: ${err.message}`,
            executionTimeMs: Date.now() - startTime
        };
    } finally {
        vm.dispose();
    }
}

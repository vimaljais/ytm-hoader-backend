import { PythonShell, Options as PythonShellOptions } from "python-shell";

interface PythonResponse {
  result: string;
  data: any;
}

async function runPythonScript(jsonData: any, func: string): Promise<PythonResponse> {
  const scopes = { scope: "https://www.googleapis.com/auth/youtube" };
  const withScopeJson = { ...jsonData, ...scopes };

  const options: PythonShellOptions = {
    mode: "text",
    pythonOptions: ["-u"],
    args: [JSON.stringify(withScopeJson), func]
  };

  try {
    console.log(`Running ${func}`)
    const messages = await PythonShell.run("src/controllers/pyWrapper.py", options);
    console.log("🚀 ~ file: pyHandle.ts:20 ~ runPythonScript ~ messages:", messages)
    return { result: "success", data: messages.pop() };
  } catch (err) {
    console.error("Error:", err);
    return { result: "error", data: null };
  }
}

export { runPythonScript };

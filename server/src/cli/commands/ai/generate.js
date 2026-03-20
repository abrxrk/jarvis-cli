import { promises as fs } from "fs";
import path from "path";
import chalk from "chalk";
import { Command } from "commander";
import { generateObject } from "ai";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { z } from "zod";
import { getConfig } from "./model.js";
import yoctoSpinner from "yocto-spinner";

// schema

const GenerationSchema = z.object({
  projectName: z.string().describe("Kebab-case project/folder name"),
  description: z.string().describe("Brief description of what was generated"),
  files: z
    .array(
      z.object({
        path: z.string().describe("Relative file path, e.g. src/index.js"),
        content: z.string().describe("Complete file content — no placeholders"),
      }),
    )
    .describe("Every file required for the project to run"),
  setupCommands: z
    .array(z.string())
    .describe("Ordered shell commands to install deps and run the project"),
});

// helpers

function buildModel(config) {
  const { provider, model, apiKey } = config;

  if (provider === "gemini" || provider === "google") {
    const google = createGoogleGenerativeAI({ apiKey });
    return google(model);
  }

  throw new Error(
    `Unsupported provider "${provider}". Run \`jarvis model\` to reconfigure.`,
  );
}

function displayFileTree(files, projectName) {
  console.log(chalk.cyan("\n📂 Project Structure:"));
  console.log(chalk.white(`${projectName}/`));

  const byDir = {};
  files.forEach((f) => {
    const parts = f.path.split("/");
    const dir = parts.length > 1 ? parts.slice(0, -1).join("/") : "";
    (byDir[dir] = byDir[dir] || []).push(parts[parts.length - 1]);
  });

  Object.keys(byDir)
    .sort()
    .forEach((dir) => {
      if (dir) {
        console.log(chalk.white(`├── ${dir}/`));
        byDir[dir].forEach((f) => console.log(chalk.white(`│   └── ${f}`)));
      } else {
        byDir[dir].forEach((f) => console.log(chalk.white(`├── ${f}`)));
      }
    });
}

async function writeFiles(baseDir, projectName, files) {
  const projectDir = path.join(baseDir, projectName);
  await fs.mkdir(projectDir, { recursive: true });
  console.log(chalk.cyan(`\n📁 Created directory: ${projectName}/`));

  for (const file of files) {
    const filePath = path.join(projectDir, file.path);
    await fs.mkdir(path.dirname(filePath), { recursive: true });
    await fs.writeFile(filePath, file.content, "utf8");
    console.log(chalk.green(`  ✓ ${file.path}`));
  }

  return projectDir;
}

// core action

async function generateAction(prompt) {
  const config = await getConfig();

  if (!config?.provider || !config?.model || !config?.apiKey) {
    console.error(
      chalk.red(
        "\n❌ No AI model configured. Run `jarvis model` first to set a provider, model, and API key.\n",
      ),
    );
    process.exit(1);
  }

  console.log(chalk.cyan("\n🤖 Jarvis Generate — building your project...\n"));
  console.log(chalk.gray(`Prompt : ${prompt}`));
  console.log(
    chalk.gray(`Provider: ${config.provider}  |  Model: ${config.model}\n`),
  );

  const model = buildModel(config);

  const spinner = yoctoSpinner({ text: "Generating project..." }).start();

  let result;
  try {
    result = await generateObject({
      model,
      schema: GenerationSchema,
      prompt: `You are an expert software engineer. Generate a complete, production-ready project for the following request:

"${prompt}"

STRICT RULES:
1. Output EVERY file needed — do not omit any file.
2. Each file must have its full content with zero placeholders or TODO comments.
3. Use separate files for separate concerns (components, utils, routes, etc.).
4. Include package.json ONLY if the project uses Node.js or a JS/TS build tool (e.g. React, Vue, Express). Do NOT generate package.json for plain HTML/CSS/JS projects that run directly in the browser without a build step.
5. Include a README.md with clear setup instructions.
6. Add .gitignore if the project uses Node.js, Python, or similar runtimes.
7. Write clean, production-quality code with proper error handling.
8. Use modern language features and best practices.
9. All import paths must be correct relative to the file they appear in.
10. setupCommands must be the exact shell commands a developer runs after cloning, in order. Do NOT include echo commands or informational messages — only real executable commands (e.g. npm install, npm start).
11. File content MUST preserve proper line breaks and indentation — never collapse multiple lines into a single line. Each line of code must be a separate line in the content string.`,
    });
  } catch (err) {
    spinner.error("Generation failed");
    const msg = err?.message || "";
    if (
      err?.statusCode === 429 ||
      msg.includes("RESOURCE_EXHAUSTED") ||
      msg.includes("quota")
    ) {
      console.error(chalk.red("\n❌ API quota exhausted."));
      console.error(
        chalk.cyan(
          "   Fix: enable billing or use a key from a different Google account/project.",
        ),
      );
      console.log(err);
    } else if (err?.statusCode === 404 || msg.includes("not found")) {
      console.error(
        chalk.red(`\n❌ Model "${config.model}" not found or not supported.`),
      );
      console.error(
        chalk.yellow("   Run `jarvis model` to pick a valid model.\n"),
      );
    } else {
      console.error(chalk.red(`\n❌ Generation failed: ${msg}\n`));
    }
    process.exit(1);
  }

  spinner.success("Project generated!");

  const { projectName, description, files, setupCommands } = result.object;

  console.log(chalk.green(`\n✅ Generated: ${projectName}`));
  console.log(chalk.gray(`   ${description}\n`));
  console.log(chalk.green(`Files to create: ${files.length}`));

  displayFileTree(files, projectName);

  console.log(chalk.cyan("\n📝 Writing files...\n"));
  const projectDir = await writeFiles(process.cwd(), projectName, files);

  console.log(chalk.green.bold(`\n✨ Project created successfully!`));
  console.log(chalk.cyan(`📁 Location: ${chalk.bold(projectDir)}\n`));

  if (setupCommands?.length) {
    console.log(chalk.cyan("📋 Next steps:\n"));
    console.log(chalk.white("```bash"));
    setupCommands.forEach((cmd) => console.log(chalk.white(cmd)));
    console.log(chalk.white("```\n"));
  }
}

// commander setup

export const generate = new Command("generate")
  .description("Generate a project from a natural-language prompt")
  .argument("<prompt>", "Describe what you want to build")
  .action(generateAction);

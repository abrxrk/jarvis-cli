import {
  cancel,
  intro,
  isCancel,
  outro,
  password,
  select,
} from "@clack/prompts";
import chalk from "chalk";
import { Command } from "commander";
import fs from "fs/promises";
import os from "os";
import path from "path";

const CONFIG_DIR = path.join(os.homedir(), ".jarvis");
const CONFIG_FILE = path.join(CONFIG_DIR, "ai_config.json");

// Major Gemini models available via Google AI Studio
const GEMINI_MODELS = [
  {
    id: "gemini-2.0-flash",
    name: "Gemini 2.0 Flash",
    description: "Stable fast model for production",
    contextWindow: "1M tokens",
  },
  {
    id: "gemini-1.5-pro",
    name: "Gemini 1.5 Pro",
    description: "Stable pro model with long context",
    contextWindow: "2M tokens",
  },
  {
    id: "gemini-1.0-pro",
    name: "Gemini 1.0 Pro",
    description: "Original stable model",
    contextWindow: "32K tokens",
  },
];

// ============================================
// CONFIG MANAGEMENT
// ============================================

export async function getConfig() {
  try {
    const data = await fs.readFile(CONFIG_FILE, "utf-8");
    return JSON.parse(data);
  } catch {
    return null;
  }
}

export async function setConfig(config) {
  try {
    await fs.mkdir(CONFIG_DIR, { recursive: true });
    await fs.writeFile(
      CONFIG_FILE,
      JSON.stringify(
        { ...config, updatedAt: new Date().toISOString() },
        null,
        2,
      ),
      "utf-8",
    );
    return true;
  } catch (error) {
    console.error(chalk.red("Failed to save config:"), error.message);
    return false;
  }
}

export async function getSelectedModel() {
  const config = await getConfig();
  return config?.model || null;
}

export async function getApiKey(provider) {
  const config = await getConfig();
  return config?.apiKey || null;
}

// ============================================
// MODEL COMMAND ACTION
// ============================================

export async function modelAction() {
  intro(chalk.bold("🤖 Select AI Model"));

  // Get current config
  const currentConfig = await getConfig();

  if (currentConfig?.model) {
    const modelInfo = GEMINI_MODELS.find((m) => m.id === currentConfig.model);
    console.log(
      chalk.gray(
        `Current model: ${chalk.cyan(modelInfo?.name || currentConfig.model)}\n`,
      ),
    );
  }

  // Provider selection
  const PROVIDERS = [
    {
      value: "gemini",
      label: "Google Gemini",
      hint: "Google AI Studio API",
    },
  ];

  console.log(chalk.dim("   More AI providers coming soon...\n"));

  const selectedProvider = await select({
    message: "Choose an AI provider",
    options: PROVIDERS,
    initialValue: currentConfig?.provider || "gemini",
  });

  if (isCancel(selectedProvider)) {
    cancel("Selection cancelled");
    process.exit(0);
  }

  // Build model select options with cancel option
  const modelOptions = GEMINI_MODELS.map((model) => ({
    value: model.id,
    label:
      model.name + (model.recommended ? chalk.green(" (recommended)") : ""),
    hint: `${model.description} • ${model.contextWindow} context`,
  }));

  // Add cancel option at the end
  modelOptions.push({
    value: "cancel",
    label: chalk.red("✕ Cancel"),
    hint: "Exit without saving",
  });

  const selectedModel = await select({
    message: "Choose a Gemini model for Jarvis to use",
    options: modelOptions,
    initialValue: currentConfig?.model || GEMINI_MODELS[0].id,
  });

  if (isCancel(selectedModel) || selectedModel === "cancel") {
    cancel("Model selection cancelled");
    process.exit(0);
  }

  // API Key flow - always prompt for API key
  console.log(
    chalk.cyan("\n  Get your API key from: ") +
      chalk.underline.blue("https://aistudio.google.com/"),
  );
  console.log(
    chalk.dim(
      "  Your API token is saved locally. Nothing is shared with us.\n",
    ),
  );

  const apiKey = await password({
    message: "Enter your Google AI Studio API key",
    mask: "*",
  });

  if (isCancel(apiKey)) {
    cancel("API key entry cancelled");
    process.exit(0);
  }

  // Save everything in a single config file
  const saved = await setConfig({
    provider: selectedProvider,
    model: selectedModel,
    apiKey: apiKey,
  });

  if (saved) {
    const modelInfo = GEMINI_MODELS.find((m) => m.id === selectedModel);
    outro(
      chalk.green(
        `✅ Model set to ${chalk.bold(modelInfo?.name || selectedModel)}`,
      ),
    );
    console.log(chalk.gray(`\n📁 Config saved to: ${CONFIG_FILE}\n`));
  } else {
    console.log(chalk.yellow("⚠️  Could not save configuration."));
  }
}

// ============================================
// COMMANDER SETUP
// ============================================

export const model = new Command("model")
  .description("Select an AI model for Jarvis to use")
  .action(modelAction);

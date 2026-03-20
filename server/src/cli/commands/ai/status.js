import chalk from "chalk";
import { Command } from "commander";
import { getConfig } from "./model.js";

// status command action

export async function statusAction() {
  console.log();
  console.log(chalk.cyan.bold("  🤖 AI STATUS"));
  console.log();
  console.log(chalk.gray("  ─────────────────────────────────────"));

  const config = await getConfig();

  if (!config) {
    console.log();
    console.log(chalk.yellow("  ⚠️  No AI configuration found"));
    console.log();
    console.log(
      chalk.gray("  Run ") +
        chalk.white("jarvis model") +
        chalk.gray(" to set up AI."),
    );
    console.log();
    return;
  }

  // Provider
  console.log();
  console.log(
    `  ${chalk.bold("Provider:")} ${chalk.green(config.provider || "Not set")}`,
  );

  // Model
  if (config.model) {
    console.log(`  ${chalk.bold("Model:")}    ${chalk.green(config.model)}`);
  } else {
    console.log(`  ${chalk.bold("Model:")}    ${chalk.yellow("Not set")}`);
  }

  // API Key (masked)
  if (config.apiKey) {
    const maskedKey =
      config.apiKey.slice(0, 8) + "****" + config.apiKey.slice(-4);
    console.log(`  ${chalk.bold("API Key:")}   ${chalk.green(maskedKey)}`);
  } else {
    console.log(`  ${chalk.bold("API Key:")}   ${chalk.yellow("Not set")}`);
  }

  // Last updated
  if (config.updatedAt) {
    const date = new Date(config.updatedAt).toLocaleDateString();
    console.log(`  ${chalk.bold("Updated:")}   ${chalk.gray(date)}`);
  }

  console.log();
  console.log(chalk.gray("  ─────────────────────────────────────"));
  console.log();
  console.log(chalk.green("  ✅ AI is configured and ready"));
  console.log();
}

// commander setup

export const status = new Command("status")
  .description("Check AI configuration status")
  .action(statusAction);

#!/usr/bin/env node
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import { Command } from "commander";
import chalk from "chalk";
const program = new Command();
import { login, whoami, logout } from "../commands/auth/login.js";
import { model } from "../commands/ai/model.js";
import { status } from "../commands/ai/status.js";
import { generate } from "../commands/ai/generate.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
// Load .env before any other imports to ensure env vars are available
dotenv.config({ path: path.resolve(__dirname, "../../../.env") });

// High-tech ASCII Art Banner
const banner = `
${chalk.hex("#FF0000")("         ██╗ █████╗ ██████╗ ██╗   ██╗██╗███████╗")}
${chalk.hex("#FF1A00")("         ██║██╔══██╗██╔══██╗██║   ██║██║██╔════╝")}
${chalk.hex("#FF3300")("         ██║███████║██████╔╝██║   ██║██║███████╗")}
${chalk.hex("#FF4D00")("    ██   ██║██╔══██║██╔══██╗╚██╗ ██╔╝██║╚════██║")}
${chalk.hex("#FF6600")("    ╚█████╔╝██║  ██║██║  ██║ ╚████╔╝ ██║███████║")}
${chalk.hex("#FF8000")("     ╚════╝ ╚═╝  ╚═╝╚═╝  ╚═╝  ╚═══╝  ╚═╝╚══════╝")}
`;

// Welcome message
const showWelcome = () => {
  console.log();
  console.log(
    chalk.gray("  ──────────────────────────────────────────────────"),
  );
  console.log(
    chalk.bold.white("  ⚡ Your AI Assistant ") + chalk.gray("v1.0.0"),
  );
  console.log(
    chalk.gray("  ──────────────────────────────────────────────────"),
  );
  console.log();
  console.log(chalk.cyan.bold("  COMMANDS:"));
  console.log();
  console.log(
    `  ${chalk.green("login")}    ${chalk.gray("Authenticate with the Jarvis network")}`,
  );
  console.log(
    `  ${chalk.yellow("logout")}   ${chalk.gray("Securely terminate your session")}`,
  );
  console.log(
    `  ${chalk.white("/")}        ${chalk.gray("List all available commands")}`,
  );
  console.log();
  console.log(
    chalk.gray("  Type ") +
      chalk.white("jarvis <command>") +
      chalk.gray(" to execute an action."),
  );
  console.log();
};

program
  .name("jarvis")
  .description("Jarvis CLI - Your AI assistant")
  .version("1.0.0")
  .action(() => {
    showWelcome();
  })
  .hook("preAction", () => {
    console.log();
    console.log(banner);
  });

program.addCommand(login);
program.addCommand(whoami);
program.addCommand(logout);
program.addCommand(model);
program.addCommand(status);
program.addCommand(generate);

// List commands
const listCommands = new Command("/")
  .description("List all available commands")
  .action(() => {
    console.log();
    console.log(chalk.cyan.bold("  AVAILABLE COMMANDS:"));
    console.log();
    program.commands
      .filter((cmd) => cmd.name() && cmd.name() !== "/")
      .forEach((cmd) => {
        console.log(
          `  ${chalk.green(cmd.name().padEnd(10))} ${chalk.gray(cmd.description())}`,
        );
      });
    console.log();
  });

program.addCommand(listCommands);

program.parse(process.argv);

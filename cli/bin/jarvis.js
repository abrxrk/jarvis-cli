#!/usr/bin/env node

import { Command } from "commander";
import chalk from "chalk";
import login from "../commands/login.js";
import logout from "../commands/logout.js";
const program = new Command();

// High-tech ASCII Art Banner
const banner = `
${chalk.hex('#00FFCC')('         ██╗ █████╗ ██████╗ ██╗   ██╗██╗███████╗')}
${chalk.hex('#00FFCC')('         ██║██╔══██╗██╔══██╗██║   ██║██║██╔════╝')}
${chalk.hex('#00CCFF')('         ██║███████║██████╔╝██║   ██║██║███████╗')}
${chalk.hex('#0099FF')('    ██   ██║██╔══██║██╔══██╗╚██╗ ██╔╝██║╚════██║')}
${chalk.hex('#0066FF')('    ╚█████╔╝██║  ██║██║  ██║ ╚████╔╝ ██║███████║')}
${chalk.hex('#0033FF')('     ╚════╝ ╚═╝  ╚═╝╚═╝  ╚═╝  ╚═══╝  ╚═╝╚══════╝')}
`;

// Welcome message
const showWelcome = () => {
  console.log();
  console.log(banner);
  console.log(chalk.gray('  ──────────────────────────────────────────────────'));
  console.log(chalk.bold.white('  ⚡ Your AI Assistant ') + chalk.gray('v1.0.0'));
  console.log(chalk.gray('  ──────────────────────────────────────────────────'));
  console.log();
  console.log(chalk.cyan.bold('  COMMANDS:'));
  console.log();
  console.log(`  ${chalk.green('login')}    ${chalk.gray('Authenticate with the Jarvis network')}`);
  console.log(`  ${chalk.yellow('logout')}   ${chalk.gray('Securely terminate your session')}`);
  console.log(`  ${chalk.white('--help')}   ${chalk.gray('Display manual and available options')}`);
  console.log();
  console.log(chalk.gray('  Type ') + chalk.white('jarvis <command>') + chalk.gray(' to execute an action.'));
  console.log();
};

program
  .name("jarvis")
  .description("Jarvis CLI - Your AI assistant")
  .version("1.0.0")
  .action(() => {
    showWelcome();
  });

program.addCommand(login);
program.addCommand(logout);

program.parse(process.argv);


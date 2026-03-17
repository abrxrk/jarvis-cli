import { cancel, confirm, intro, isCancel, outro } from "@clack/prompts";
import { logger } from "better-auth";
import { createAuthClient } from "better-auth/client";
import { deviceAuthorizationClient } from "better-auth/client/plugins";
import chalk from "chalk";
import { Command } from "commander";
import fs from "fs/promises";
import open from "open";
import os from "os";
import path from "path";
import yoctoSpinner from "yocto-spinner";
import * as z from "zod/v4";
import prisma from "../../../lib/db.js";

const CONFIG_DIR = path.join(os.homedir(), ".better-auth");
const TOKEN_FILE = path.join(CONFIG_DIR, "token.json");

export async function login(options) {
  const opts = z.object({
    serverUrl: z.string().optional(),
    clientId: z.string().optional(),
  });
  const serverUrl =
    options?.serverUrl ||
    process.env.BETTER_AUTH_URL ||
    "http://localhost:3005";
  const clientId = options?.clientId || process.env.GITHUB_CLIENT_ID;

  intro(chalk.bold("🔐 Auth CLI Login..."));
  // change this with token management utils
  const existingToken = false;
  const expired = false;
  if (existingToken && !expired) {
    const shouldReAuth = await confirm({
      message: "You are already logged in. Do you want to login Again",
      initialValue: false,
    });
    if (isCancel(shouldReAuth)) {
      cancel("Operation cancelled");
      process.exit(0);
    }
    if (!shouldReAuth) {
      outro("Login cancelled");
      process.exit(0);
    }
  }
  const AuthClient = createAuthClient({
    baseURL: serverUrl,
    plugins: [deviceAuthorizationClient()],
  });
  const spinner = yoctoSpinner({
    text: "Waiting for authentication...",
  });
  spinner.start();
  try {
    const { data, error } = await AuthClient.device.code({
      client_id: clientId,
      scope: "openid profile email",
    });
    spinner.stop();
    if (error || !data) {
      logger.error("Failed to get device code");
      process.exit(1);
    }
    const {
      device_code,
      user_code,
      verification_uri,
      verification_uri_complete,
      interval = 5,
      expires_in,
    } = data;
    // Display authorization instructions
    console.log("");
    console.log(chalk.cyan("📱 Device Authorization Required"));
    console.log("");
    console.log(
      `Please visit: ${chalk.underline.blue(
        verification_uri_complete || verification_uri,
      )}`,
    );
    console.log(`Enter code: ${chalk.bold.green(user_code)}`);
    console.log("");
    const shouldOpen = await confirm({
      message: "Do you want to open the browser automtically",
      initialValue: true,
    });
    if (!isCancel(shouldOpen) && shouldOpen) {
      const urlToOpen = verification_uri || verification_uri_complete;
      await open(urlToOpen);
    }
    console.log(
      chalk.gray(
        `Waiting for authorization (expires in ${Math.floor(expires_in / 60)} minutes...)`,
      ),
    );
  } catch (error) {
    spinner.stop();
    logger.error(error);
    process.exit(1);
  }
}

export const loginCommand = new Command("login")
  .description("Login to the Jarvis CLI")
  .option("--server-url <url>", "Server URL")
  .option("--client-id <id>", "Client ID")
  .action(login);

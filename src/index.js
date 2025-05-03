#!/usr/bin/env node

import prompts from "prompts";
import { execSync } from "child_process";
import path from "path";

const projectNamePattern = /^[a-zA-Z0-9-]+$/;
const TEMPLATES = {
  "heroui": "https://github.com/lordimmaculate/heroui-template.git",
  "heroui-authjs": "https://github.com/lordimmaculate/heroui-template-authjs.git"
};

(async () => {
  try {
    const response = await prompts([
      {
        type: "text",
        name: "projectName",
        message: "Enter your project name",
        initial: "my-project",
        format: (val) => val.toLowerCase().split(" ").join("-"),
        validate: (val) =>
          projectNamePattern.test(val)
            ? true
            : "Project name should not contain special characters except hyphen (-)"
      },
      {
        type: "select",
        name: "template",
        message: "Which template do you want to use?",
        choices: [
          { title: "HeroUI", value: "heroui" },
          { title: "HeroUI + Auth.js", value: "heroui-authjs" }
        ]
      },
      {
        type: "select",
        name: "git",
        message: "Do you want to initialize git?",
        choices: [
          { title: "Yes", value: true },
          { title: "No", value: false }
        ]
      },
      {
        type: "select",
        name: "packageManager",
        message: "Select package manager (pnpm is recommended)",
        choices: [
          { title: "pnpm", value: "pnpm" },
          { title: "npm", value: "npm" },
          { title: "yarn", value: "yarn" },
          { title: "bun", value: "bun" },
          { title: "none", value: "none" }
        ]
      }
    ]);

    const { projectName, template, git, packageManager } = response;

    if (!projectName) {
      console.log("\nOperation cancelled.");
      process.exit(1);
    }

    console.log("\nCloning template...");

    const TEMPLATE_REPO = TEMPLATES[template];
    if (!TEMPLATE_REPO) {
      console.error("\nError: Template not found.");
      process.exit(1);
    }

    execSync(`git clone ${TEMPLATE_REPO} ${projectName}`, { stdio: "inherit" });

    execSync(`rm -rf ${path.join(projectName, ".git")}`, { stdio: "inherit" });

    if (git) {
      console.log("\nInitializing new git repository...");
      execSync(`cd ${projectName} && git init && git add . && git commit -m "Initial Commit"`, { stdio: "inherit" });
    }

    switch (packageManager) {
      case "npm":
        execSync(`cd ${projectName} && npm install`, { stdio: "inherit" });
        break;
      case "yarn":
        execSync(`cd ${projectName} && yarn install`, { stdio: "inherit" });
        break;
      case "pnpm":
        execSync(`cd ${projectName} && pnpm install`, { stdio: "inherit" });
        break;
      case "bun":
        execSync(`cd ${projectName} && bun install`, { stdio: "inherit" });
        break;
    }

    console.log(`\n✨ Project ${projectName} created successfully!`);
    console.log(`\nNext steps:`);
    console.log(`  cd ${projectName}`);

    if (packageManager !== "none") {
      console.log(`  ${packageManager} run dev`);
    } else {
      console.log(`  npm run dev`);
    }
  } catch (err) {
    console.error("\nError:", err.message);
    process.exit(1);
  }
})();

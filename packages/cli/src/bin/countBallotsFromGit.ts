#!/usr/bin/env node

import parseArgs from "../utils/parseArgs.js";
import countFromGit from "@aduh95/caritat/countBallotsFromGit";
import fs from "node:fs/promises";
import readStdIn from "../utils/readStdin.js";

import { cliArgsType, cliArgs, getEnv } from "../utils/countBallotsGitEnv.js";
import yargs from "yargs";

interface argsType extends cliArgsType {
  fromCommit?: string;
  summarize?:"json"|"md";
}


const parsedArgs = parseArgs().options({
  ...(cliArgs as any),
  fromCommit: {
    describe: "sha of the commit initiating the vote",
    type: "string",
  },
  summarize:{
      describe: "Format of the vote summary (default is no summary)",
      choices:["json","md"],
      type:"string"
  }
}).argv as any as argsType;

const { repo: repoUrl, branch, path: subPath } = parsedArgs;

const privateKey =
  parsedArgs.key === "-"
    ? await readStdIn(false)
    : parsedArgs.key && (await fs.readFile(parsedArgs.key as string));

const { result, privateKey: _privateKey } = await countFromGit({
  ...(await getEnv(parsedArgs)),
  repoUrl,
  branch,
  subPath,
  privateKey,
  keyParts: parsedArgs["key-part"],
  firstCommitSha: parsedArgs.fromCommit,
  mailmap: parsedArgs.mailmap,
  commitJsonSummary: null,
});

switch (parsedArgs.summarize) {
  case "json":
    console.log(JSON.stringify(result, null, 2));
    break;

  case "md":
    console.log(result.generateSummary(_privateKey.toString()));
    break;
}
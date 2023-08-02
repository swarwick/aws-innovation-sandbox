#!/usr/bin/env node

import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';

import { InnovationSandboxManagementAccount } from '../lib/InnovationSandboxManagementAccount';
import { InnovationSandboxSbxAccount } from '../lib/InnovationSandboxSbxAccount';
import { InnovationSandboxTransitGatewaySetup } from '../lib/InnovationSandboxTransitGatewaySetup';
import { InnovationSandbox } from '../lib/InnovationSandbox';

const SOLUTION_VERSION = process.env['DIST_VERSION'] || 'v1.3.3.mybuild';
const SOLUTION_NAME = process.env['SOLUTION_NAME'] || 'aws-innovation-sandbox';
const SOLUTION_ID = process.env['SOLUTION_ID'] || 'SO0104';
const SOLUTION_BUCKET = process.env['DIST_OUTPUT_BUCKET'] || 'aws-innovation-sandbox';
const SOLUTION_TMN = process.env['SOLUTION_TRADEMARKEDNAME'] || 'aws-innovation-sandbox';
const SOLUTION_PROVIDER = 'AWS Solution Development';

const app = new cdk.App();

new InnovationSandboxManagementAccount(app, 'InnovationSandboxManagementAccount', {});
new InnovationSandboxSbxAccount(app, 'InnovationSandboxSbxAccount');
new InnovationSandboxTransitGatewaySetup(app, 'InnovationSandboxTransitGatewaySetup');
new InnovationSandbox(app, 'InnovationSandbox', {
    description: '(' + SOLUTION_ID + ') - ' + SOLUTION_NAME + ', version ' + SOLUTION_VERSION,
    solutionId: SOLUTION_ID,
    solutionTradeMarkName: SOLUTION_TMN,
    solutionProvider: SOLUTION_PROVIDER,
    solutionBucket: SOLUTION_BUCKET,
    solutionName: SOLUTION_NAME,
    solutionVersion: SOLUTION_VERSION
});


import { Capture, Match, Template } from "aws-cdk-lib/assertions";


import * as cdk from 'aws-cdk-lib';


import * as invsbxmain from '../lib/InnovationSandbox';
import * as invsbxmgmt from '../lib/InnovationSandboxManagementAccount';
import * as invsbxsbx from '../lib/InnovationSandboxSbxAccount';
import * as invsbxtgw from '../lib/InnovationSandboxTransitGatewaySetup';


test('InnovationSandboxMain', () => {
    const app = new cdk.App();
    const stack = 
    new invsbxmain.InnovationSandbox(app, 'InnovationSandboxTestStack',
      {
        description: "Test",
        solutionId: "InvSbx",
        solutionTradeMarkName: "InvSbx",
        solutionProvider: "AWS",
        solutionBucket: "Sample",
        solutionName: "InvSbx",
        solutionVersion: "v1.0.0"
    }
    );
    // THEN
    const template = Template.fromStack(stack);
    expect(template.toJSON()).toMatchSnapshot();
});


test('InnovationSandboxMgmt', () => {
  const app = new cdk.App();
  const stack = 
  new invsbxmgmt.InnovationSandboxManagementAccount(app, 'InnovationSandboxManagementTestStack'
  );
  // THEN
  const template = Template.fromStack(stack);
  expect(template.toJSON()).toMatchSnapshot();
});

test('InnovationSandboxSbx', () => {
  const app = new cdk.App();
  const stack = 
  new invsbxsbx.InnovationSandboxSbxAccount(app, 'InnovationSandboxSbxTestStack'
  );
  // THEN
  const template = Template.fromStack(stack);
  expect(template.toJSON()).toMatchSnapshot();
});

test('InnovationSandboxTgw', () => {
  const app = new cdk.App();
  const stack = 
  new invsbxtgw.InnovationSandboxTransitGatewaySetup(app, 'InnovationSandboxTgwTestStack'
  );
  // THEN
  const template = Template.fromStack(stack);
  expect(template.toJSON()).toMatchSnapshot();
});
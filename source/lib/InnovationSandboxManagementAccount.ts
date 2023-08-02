
import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';

import { aws_ec2 as ec2 } from 'aws-cdk-lib';
import { aws_ram as ram } from 'aws-cdk-lib';
import { aws_cloudtrail as cloudtrail } from 'aws-cdk-lib';

import { aws_s3 as s3 } from 'aws-cdk-lib';
import { aws_iam as iam } from 'aws-cdk-lib';

export class InnovationSandboxManagementAccount extends cdk.Stack {

  public readonly response: string;
  constructor(
    scope: cdk.App,
    id: string,
    props?: any,
    s?: string
  ) {
    super(scope, id, props);


    const SbxAccountId = new cdk.CfnParameter(this, "SbxAccountId", {
      type: "String",
      description: "SbxAccountId"
    });

    // TODO: Add descriptions

    const _uuid = new cdk.CfnParameter(this, "UUID", {
      type: "String",
      description: "UUID",
    });

    

   

    const vpc = new ec2.Vpc(this, 'ISAppStreamMgmtVPC', {
      cidr: "10.0.0.0/16",
      maxAzs: 2,
      subnetConfiguration: [
        {
          cidrMask: 24,
          name: 'public_innovation_mgmt',
          subnetType: ec2.SubnetType.PUBLIC,
        },
        {
          cidrMask: 24,
          name: 'private_innovation_mgmt',
          subnetType: ec2.SubnetType.PRIVATE_WITH_EGRESS,
        }
      ]
    });


    //Create TG gateway
    const TransitGateway = new ec2.CfnTransitGateway(this, 'IS_Transit_Gateway', {
      description: "IS Transit Gateway",
      vpnEcmpSupport: 'disable',
      defaultRouteTableAssociation: 'disable',
      defaultRouteTablePropagation: 'disable',
      autoAcceptSharedAttachments: 'enable',
      tags: [{
        key: 'Name',
        value: "IS Transit Gateway"
      }],
    });
    //attach VPCs to gateway
    const TransitGatewayAttachmentEgress = new ec2.CfnTransitGatewayAttachment(this, 'ISTransitGatewayAttachmentEgress', {
      transitGatewayId: TransitGateway.ref,
      vpcId: vpc.vpcId,
      subnetIds: [vpc.privateSubnets[0].subnetId, vpc.privateSubnets[1].subnetId],
      tags: [{
        key: 'Name',
        value: "IS-TG-Egress-VPC-Private_SubNet-Attachment"
      }],
    });
    TransitGatewayAttachmentEgress.addDependsOn(TransitGateway);

    let routenum = 0;
    for (let subnet of vpc.publicSubnets) {
      new ec2.CfnRoute(this, 'ISAppStreamMgmtVPC_route_' + routenum++, {
        routeTableId: subnet.routeTable.routeTableId,
        destinationCidrBlock: "192.168.0.0/16",
        transitGatewayId: TransitGateway.ref,
      }).addDependsOn(TransitGatewayAttachmentEgress);
    };

   
    const res_share = new ram.CfnResourceShare(this, "ISTGWShareAppStream",{
      principals:[SbxAccountId.valueAsString],
      resourceArns:[cdk.Fn.sub("arn:aws:ec2:${AWS::Region}:${AWS::AccountId}:transit-gateway/${ISTransitGateway}")],
      name:"ISTGWShareAppStream"
    })

    const trail_bucket_access_logs = new s3.Bucket(this, "mgmt-bucket-al", {
      bucketName: "mgmt" + "-ct-" + _uuid.valueAsString+"-al",
      encryption: s3.BucketEncryption.S3_MANAGED,
      blockPublicAccess: new s3.BlockPublicAccess({
        blockPublicAcls: true,
        blockPublicPolicy: true,
        ignorePublicAcls:true
      })
    });


    const trail_bucket = new s3.Bucket(this, "mgmt-bucket", {
      bucketName: "mgmt" + "-ct-" + _uuid.valueAsString,
      encryption: s3.BucketEncryption.S3_MANAGED,
      serverAccessLogsBucket: trail_bucket_access_logs,
      blockPublicAccess: new s3.BlockPublicAccess({
        blockPublicAcls: true,
        blockPublicPolicy: true,
        ignorePublicAcls:true
      })
    });

    trail_bucket.addToResourcePolicy(new iam.PolicyStatement({
      effect: iam.Effect.DENY,
      actions: ["s3:*"],
      principals: [ new iam.AnyPrincipal],
      resources:  ["arn:aws:s3:::" + trail_bucket.bucketName, "arn:aws:s3:::" + trail_bucket.bucketName+"/*"],
      conditions:{
        "Bool": {
          "aws:SecureTransport": "false"
      }
      }                          
        }));

    const fl_bucket_access_logs = new s3.Bucket(this, "mgmt-flowlogs-bucket-al", {
      bucketName: "mgmt" + "-fl-" + _uuid.valueAsString+"-al",
      encryption: s3.BucketEncryption.S3_MANAGED,
      blockPublicAccess: new s3.BlockPublicAccess({
        blockPublicAcls: true,
        blockPublicPolicy: true,
        ignorePublicAcls:true
      })
    });

    const fl_bucket = new s3.Bucket(this, "mgmt-flowlogs-bucket", {
      bucketName: "mgmt" + "-fl-" + _uuid.valueAsString,
      encryption: s3.BucketEncryption.S3_MANAGED,
      serverAccessLogsBucket: fl_bucket_access_logs,
      blockPublicAccess: new s3.BlockPublicAccess({
        blockPublicAcls: true,
        blockPublicPolicy: true,
        ignorePublicAcls:true
      })
    });

    fl_bucket.addToResourcePolicy(new iam.PolicyStatement({
      effect: iam.Effect.DENY,
      actions: ["s3:*"],
      principals: [ new iam.AnyPrincipal],
      resources:  ["arn:aws:s3:::" + fl_bucket.bucketName, "arn:aws:s3:::" + fl_bucket.bucketName+"/*"],
      conditions:{
        "Bool": {
          "aws:SecureTransport": "false"
      }
      }                          
        }));

    const trail = new cloudtrail.Trail(this, "CloudTrail", {
      bucket: trail_bucket,
      trailName: "mgmt-cloudtrail",
    });

    const flow_logs = new ec2.FlowLog(this, "FlowLogs", {
      flowLogName: "mgmt-vpc-flowlogs",
      resourceType: ec2.FlowLogResourceType.fromVpc(vpc),
      destination: ec2.FlowLogDestination.toS3(fl_bucket),
    });



  }

}

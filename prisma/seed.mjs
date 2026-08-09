import { PrismaClient } from '@prisma/client';

process.env.DATABASE_URL ||= 'file:../data/sleepflow.db';
const prisma = new PrismaClient();
const demoSource = '匿名演示 seed';

const channels = [
  { code: 'DOUYIN', name: '抖音', description: '匿名演示渠道' },
  { code: 'TIKTOK_SHOP', name: 'TikTok Shop', description: '匿名演示渠道' },
  { code: 'TMALL', name: '天猫', description: '匿名演示渠道' },
  { code: 'JD', name: '京东', description: '匿名演示渠道' },
  { code: 'SHOPIFY', name: 'Shopify', description: '匿名演示渠道' },
  { code: 'META', name: 'Meta Ads', description: '匿名演示渠道' },
  { code: 'YOUTUBE', name: 'YouTube / Google Ads', description: '匿名演示渠道' },
  { code: 'AMAZON', name: 'Amazon', description: '匿名演示渠道' },
];

const products = [
  {
    id: 'demo-product-a',
    name: '演示产品 A',
    model: 'DEMO-A',
    series: '匿名电商系列',
    brand: '匿名品牌',
    status: 'PENDING_CONFIRMATION',
    confirmedClaims: ['暂无已确认卖点'],
    pendingClaims: ['资料待补充'],
    prohibitedClaims: ['禁止使用未经核验的功效表达'],
    colors: ['雾蓝', '暖灰'],
    sourceNote: demoSource,
    verifiedAt: null,
  },
  {
    id: 'demo-product-b',
    name: '演示产品 B',
    model: 'DEMO-B',
    series: '匿名电商系列',
    brand: '匿名品牌',
    status: 'PENDING_CONFIRMATION',
    confirmedClaims: ['暂无已确认卖点'],
    pendingClaims: ['表达待核验'],
    prohibitedClaims: ['不得使用绝对化承诺'],
    colors: ['深灰'],
    sourceNote: demoSource,
    verifiedAt: null,
  },
];

const goals = [
  { id: 'demo-goal-gmv', name: '短视频总 GMV', category: 'GMV', targetValue: 100, currentValue: null, unit: '演示单位', priority: 'CRITICAL', status: 'AT_RISK' },
  { id: 'demo-goal-output', name: '素材产量', category: 'ASSET_OUTPUT', targetValue: 18, currentValue: 10, unit: '条', priority: 'HIGH', status: 'ON_TRACK' },
  { id: 'demo-goal-shoot', name: '拍摄次数', category: 'SHOOT_COUNT', targetValue: 10, currentValue: 4, unit: '次', priority: 'MEDIUM', status: 'AT_RISK' },
  { id: 'demo-goal-new-gmv', name: '新素材 GMV', category: 'NEW_ASSET_GMV', targetValue: null, currentValue: null, unit: '演示单位', priority: 'MEDIUM', status: 'BLOCKED' },
];

const assets = Array.from({ length: 12 }, (_, index) => {
  const number = String(index + 1).padStart(3, '0');
  const statuses = ['PROMOTING', 'OBSERVING', 'OPTIMIZE', 'REPLICABLE', 'INSUFFICIENT_DATA'];
  const channel = channels[index % channels.length];
  return {
    assetCode: `SF-DEMO-${number}`,
    displayName: `匿名素材 ${number}`,
    durationSeconds: 18 + (index % 5) * 7,
    sourceType: index % 3 === 1 ? 'ITERATION' : 'ORIGINAL',
    contentType: index % 3 === 0 ? '新素材' : index % 3 === 1 ? '旧素材迭代' : '待复盘',
    status: statuses[index % statuses.length],
    tags: [index % 2 ? '场景表达' : '卖点表达', '匿名演示'],
    productId: products[index % products.length].id,
    channelCode: channel.code,
    versionNumber: (index % 3) + 1,
  };
});

try {
  for (const channel of channels) {
    await prisma.channel.upsert({
      where: { code: channel.code },
      update: channel,
      create: channel,
    });
  }

  for (const product of products) {
    await prisma.product.upsert({
      where: { id: product.id },
      update: product,
      create: product,
    });
  }

  const periodStart = new Date('2026-07-01T00:00:00.000Z');
  const periodEnd = new Date('2026-07-31T23:59:59.999Z');
  for (const goal of goals) {
    const progressRate = goal.targetValue && goal.currentValue !== null ? goal.currentValue / goal.targetValue : null;
    const gapValue = goal.targetValue !== null && goal.currentValue !== null ? goal.targetValue - goal.currentValue : null;
    await prisma.goal.upsert({
      where: { id: goal.id },
      update: { ...goal, progressRate, gapValue, source: demoSource, lastUpdatedAt: new Date() },
      create: {
        ...goal,
        periodType: 'MONTHLY',
        periodStart,
        periodEnd,
        progressRate,
        gapValue,
        source: demoSource,
        lastUpdatedAt: new Date(),
      },
    });
  }

  for (const assetData of assets) {
    const { channelCode, versionNumber, ...asset } = assetData;
    const record = await prisma.asset.upsert({
      where: { assetCode: asset.assetCode },
      update: {
        ...asset,
        channels: {
          deleteMany: {},
          create: [{ channel: { connect: { code: channelCode } } }],
        },
      },
      create: {
        ...asset,
        channels: { create: [{ channel: { connect: { code: channelCode } } }] },
      },
    });
    await prisma.assetVersion.upsert({
      where: { assetId_versionNumber: { assetId: record.id, versionNumber } },
      update: { changeSummary: versionNumber > 1 ? '匿名演示版本迭代' : '匿名演示初版', durationSeconds: asset.durationSeconds },
      create: { assetId: record.id, versionNumber, changeSummary: versionNumber > 1 ? '匿名演示版本迭代' : '匿名演示初版', durationSeconds: asset.durationSeconds },
    });
  }

  await prisma.performanceSnapshot.deleteMany({ where: { dataSource: demoSource } });
  const channelRecords = await prisma.channel.findMany();
  const channelByCode = new Map(channelRecords.map((channel) => [channel.code, channel]));
  const assetRecords = await prisma.asset.findMany({ where: { assetCode: { startsWith: 'SF-DEMO-' } } });
  for (const [index, asset] of assetRecords.slice(0, 8).entries()) {
    const channel = channelByCode.get(channels[index % channels.length].code);
    await prisma.performanceSnapshot.create({
      data: {
        assetId: asset.id,
        channelId: channel.id,
        statisticsStart: new Date('2026-07-06T00:00:00.000Z'),
        statisticsEnd: new Date('2026-07-12T23:59:59.999Z'),
        spend: 120 + index * 17,
        paidRoi: 1.2 + index * 0.13,
        gmv: 180 + index * 33,
        ctr: 0.018 + index * 0.002,
        cvr: 0.024 + index * 0.001,
        dataSource: demoSource,
        metricDefinitionVersion: '待确认',
      },
    });
  }

  const firstAsset = assetRecords.find((asset) => asset.assetCode === 'SF-DEMO-001');
  const firstChannel = channelByCode.get('DOUYIN');
  await prisma.interactionTimeline.deleteMany({ where: { dataSource: demoSource } });
  await prisma.interactionTimeline.create({
    data: {
      assetId: firstAsset.id,
      channelId: firstChannel.id,
      statisticsStart: new Date('2026-07-06T00:00:00.000Z'),
      statisticsEnd: new Date('2026-07-12T23:59:59.999Z'),
      durationSeconds: 18,
      metricType: 'OVERALL_CLICK',
      dataSource: demoSource,
      points: {
        create: [18, 25, 23, 39, 48, 42, 51, 40, 36, 44, 31, 29, 23, 26, 18, 14, 22, 17].map((value, second) => ({
          second,
          value,
          isPeak: second === 6,
          isDrop: second === 14,
        })),
      },
    },
  });

  await prisma.weeklyReport.upsert({
    where: { id: 'demo-weekly-report' },
    update: {},
    create: {
      id: 'demo-weekly-report',
      title: '匿名演示周会报告',
      periodStart: new Date('2026-07-06T00:00:00.000Z'),
      periodEnd: new Date('2026-07-12T23:59:59.999Z'),
      status: 'DRAFT',
      sections: ['目标完成情况', '素材生产', '渠道经营', '内容行为', '素材案例', '版本迭代', '下周动作'],
      dataLimitNote: '匿名演示 seed；指标口径与业务结论待确认。',
    },
  });

  const counts = {
    products: await prisma.product.count(),
    goals: await prisma.goal.count(),
    assets: await prisma.asset.count(),
    snapshots: await prisma.performanceSnapshot.count(),
    timelines: await prisma.interactionTimeline.count(),
  };
  console.log(JSON.stringify({ seeded: true, source: demoSource, counts }));
} finally {
  await prisma.$disconnect();
}

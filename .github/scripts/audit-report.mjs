/**
 * @file `pnpm audit` の結果を仕分けして Markdown のレポートを書き出す。
 *
 * Dependabot は pnpm 11 以降が書くマルチドキュメント形式の `pnpm-lock.yaml` を読めず
 * (対応は pnpm v7-v10, dependabot/dependabot-core#14919)、このリポジトリでは依存グラフ自体が
 * 空になっている。npm 依存のアラートが来なくなったぶんを、週次の `pnpm audit` で補う。
 *
 * 単純に `pnpm audit` の終了コードを見るだけだと、上流に修正版が無い勧告 (`patched_versions`
 * が null) で毎週赤くなり続けて誰も見なくなる。そこで「対応できるもの」と「上流待ちのもの」を
 * 分け、**対応できるものがあるときだけ** issue を立てる。
 *
 * `pnpm audit --ignore-unfixable` を使わないのは、あれが `pnpm-workspace.yaml` の
 * `auditConfig.ignoreGhsas` を書き換える副作用を持つため。CI で作業ツリーを汚したくない。
 *
 * 出力:
 * - `audit-report.md` … issue の本文
 * - `$GITHUB_OUTPUT` の `actionable` … 対応できる勧告の件数
 * - `$GITHUB_STEP_SUMMARY` … 同じ内容をジョブのサマリへ
 *
 * 脆弱性の有無でこのスクリプト自体は失敗しない。後続ステップが `actionable` で判断する。
 */

import { execFileSync } from 'node:child_process';
import { appendFileSync, writeFileSync } from 'node:fs';

/** これ未満の深刻度は報告しない。 */
const AUDIT_LEVEL = process.env.AUDIT_LEVEL || 'moderate';
const SEVERITIES = ['info', 'low', 'moderate', 'high', 'critical'];
const threshold = SEVERITIES.indexOf(AUDIT_LEVEL);
if (threshold < 0) {
  throw new Error(
    `AUDIT_LEVEL は ${SEVERITIES.join(' / ')} のいずれか: ${AUDIT_LEVEL}`,
  );
}

/** `pnpm audit` は勧告があると非ゼロで終了するが、JSON は stdout に出る。 */
const runAudit = () => {
  try {
    return execFileSync('pnpm', ['audit', '--json'], {
      encoding: 'utf8',
      maxBuffer: 64 * 1024 * 1024,
    });
  } catch (error) {
    if (error.stdout) return error.stdout;
    throw error;
  }
};

const report = JSON.parse(runAudit());
const advisories = Object.values(report.advisories || {});

const atOrAbove = (a) => SEVERITIES.indexOf(a.severity) >= threshold;
/** `patched_versions` が空なら上流に修正版が無い。 */
const hasFix = (a) => typeof a.patched_versions === 'string' && a.patched_versions.length > 0;

const actionable = advisories.filter((a) => atOrAbove(a) && hasFix(a));
const upstream = advisories.filter((a) => atOrAbove(a) && !hasFix(a));

const samplePaths = (a) =>
  (a.findings || []).flatMap((f) => f.paths || []).slice(0, 3);

const row = (a) =>
  `| ${a.severity} | \`${a.module_name}\` | ${a.vulnerable_versions} | ${a.patched_versions || 'なし'} | [${a.github_advisory_id || a.id}](${a.url}) |`;

const section = (title, list, note) => {
  if (list.length === 0) return '';
  const lines = [
    `### ${title}`,
    '',
    note,
    '',
    '| 深刻度 | パッケージ | 影響範囲 | 修正版 | 勧告 |',
    '| --- | --- | --- | --- | --- |',
    ...list.map(row),
    '',
  ];
  for (const a of list) {
    const paths = samplePaths(a);
    if (paths.length === 0) continue;
    lines.push(`<details><summary><code>${a.module_name}</code> の依存経路</summary>`, '');
    lines.push('```', ...paths, '```', '', '</details>', '');
  }
  return lines.join('\n').trimEnd();
};

const parts = [`\`pnpm audit\` (閾値: ${AUDIT_LEVEL} 以上) の結果です。`];

const actionableSection = section(
  '対応できるもの',
  actionable,
  '上流に修正版があります。直接依存なら `pnpm update <pkg>`、推移的依存なら `pnpm audit --fix` が `pnpm-workspace.yaml` に overrides を書きます。適用後は `pnpm install --frozen-lockfile` と lint / test / build / e2e で確認してください。',
);
if (actionableSection) parts.push(actionableSection);

const upstreamSection = section(
  '上流待ち',
  upstream,
  'まだ修正版が公開されていないため、こちら側でできることはありません。参考情報として載せています。',
);
if (upstreamSection) parts.push(upstreamSection);

if (actionable.length === 0 && upstream.length === 0) {
  parts.push(`${AUDIT_LEVEL} 以上の勧告はありません。`);
}

parts.push('---');
parts.push('このレポートは `.github/workflows/audit.yml` が週次で自動生成しています。');

const body = parts.join('\n\n');

writeFileSync('audit-report.md', `${body}\n`);

if (process.env.GITHUB_OUTPUT) {
  appendFileSync(process.env.GITHUB_OUTPUT, `actionable=${actionable.length}\n`);
}
if (process.env.GITHUB_STEP_SUMMARY) {
  appendFileSync(process.env.GITHUB_STEP_SUMMARY, `${body}\n`);
}

// eslint-disable-next-line no-console -- Actions のログに出すための出力
console.log(
  `対応できるもの: ${actionable.length} 件 / 上流待ち: ${upstream.length} 件 (閾値 ${AUDIT_LEVEL} 以上)`,
);
